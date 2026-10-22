import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { computeScoring } from "@/lib/scoring";
import { buildFallbackReport, regionNames } from "@/lib/fallbackReport";
import type { AnalyzeResponse, Answers, Report } from "@/lib/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Tu es un expert en immobilier résidentiel québécois qui rédige une recommandation de stratégie personnalisée pour une personne qui possède déjà une propriété et qui veut en changer.

Ta tâche N'EST PAS de décider la stratégie — elle est déjà déterminée par un calcul déterministe fourni dans "scoring.verdict" (vendre_avant | acheter_avant | simultane). Ton rôle est uniquement de mettre cette recommandation en mots, de façon chaleureuse, honnête et personnalisée selon les réponses fournies.

Ton ton : chaleureux, professionnel, en français (tutoiement — l'app s'adresse à "toi"), jamais alarmiste, jamais commercial.

Règles absolues :
- Ne change JAMAIS le verdict fourni. Ne présente jamais une autre stratégie que celle de "scoring.verdict".
- N'invente aucun chiffre précis (montant, taux, pourcentage) qui ne vient pas des réponses fournies.
- "benefits" : exactement 3 ou 4 avantages concrets de la stratégie recommandée, en phrases courtes commençant par un verbe à l'infinitif (ex. "Connaître ton budget réel...", "Éviter de...").
- "steps" : exactement 4 étapes courtes et actionnables, dans l'ordre logique de la stratégie recommandée.
- "summary" : une seule phrase qui annonce les avantages à venir (style : "Selon tes réponses, [vendre d'abord / acheter d'abord / coordonner les deux] pourrait te permettre de :").
- "marketInsight" : une observation utile sur la coordination vente/achat (prêt relais, offre conditionnelle, clause 72h, dates de clôture), sans chiffre inventé.
- Pas de markdown, pas d'emojis, pas de formules creuses.`;

function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // fallthrough
  }
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
  return null;
}

function isValidReport(r: unknown): r is Report {
  if (!r || typeof r !== "object") return false;
  const x = r as Record<string, unknown>;
  return (
    typeof x.headline === "string" &&
    typeof x.summary === "string" &&
    Array.isArray(x.benefits) &&
    x.benefits.length >= 3 &&
    Array.isArray(x.steps) &&
    x.steps.length >= 3 &&
    typeof x.marketInsight === "string"
  );
}

export async function POST(req: Request) {
  let body: { answers?: Answers };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const answers = body.answers ?? {};
  const scoring = computeScoring(answers);
  const fallback = buildFallbackReport(answers, scoring);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const payload: AnalyzeResponse = { scoring, report: fallback, generatedBy: "fallback" };
    return NextResponse.json(payload);
  }

  try {
    const client = new Anthropic({ apiKey });
    const userMessage = {
      answers: {
        ...answers,
        currentCity: regionNames(answers.currentCity),
      },
      scoring,
      fallbackHints: {
        headline: fallback.headline,
        summary: fallback.summary,
        marketInsight: fallback.marketInsight,
      },
      requiredSchema: {
        headline: "phrase d'accroche reprenant le verdict, 1 ligne",
        summary: "1 phrase qui annonce les avantages à venir",
        benefits: ["3 à 4 avantages concrets, phrases courtes"],
        steps: [{ title: "...", description: "..." }],
        marketInsight: "observation sur la coordination vente/achat",
      },
    };

    const completion = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Voici les données. Réponds uniquement avec un objet JSON valide qui respecte le schéma.\n\n${JSON.stringify(
            userMessage,
            null,
            2
          )}`,
        },
      ],
    });

    const textBlock = completion.content.find((c) => c.type === "text");
    const text = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const parsed = extractJson(text);

    if (isValidReport(parsed)) {
      const payload: AnalyzeResponse = { scoring, report: parsed, generatedBy: "claude" };
      return NextResponse.json(payload);
    }
  } catch (err) {
    console.error("[analyze] Claude error", err);
  }

  const payload: AnalyzeResponse = { scoring, report: fallback, generatedBy: "fallback" };
  return NextResponse.json(payload);
}
