"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Hero from "@/components/Hero";
import HeroBackground from "@/components/HeroBackground";
import TopLogos from "@/components/TopLogos";
import QualificationForm from "@/components/QualificationForm";
import LoadingScreen from "@/components/LoadingScreen";
import ResultsScreen from "@/components/results/ResultsScreen";
import { trackStep } from "@/lib/track";
import { getFbclid } from "@/lib/attribution";
import { trackLeadWithMatching } from "@/components/MetaPixel";
import type { AnalyzeResponse, Answers } from "@/lib/types";

type Stage = "hero" | "form" | "loading" | "results";

const MIN_LOADING_MS = 2000;

export type LeadResult = { stored: boolean; firstName: string };

// Soumet le lead au webhook CRM dès la fin du questionnaire (les coordonnées
// en font désormais partie) — en parallèle du calcul IA, pas après coup.
async function submitLead(answers: Answers): Promise<LeadResult | null> {
  const name = (answers.fullName ?? "").trim();
  const email = (answers.email ?? "").trim();
  const phone = (answers.phone ?? "").trim();
  if (!name || !email) return null;

  const [firstNameRaw, ...lastParts] = name.split(/\s+/);
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: phone || undefined,
        consent: true,
        answers,
        leadType: "vente_achat",
        fbclid: getFbclid(),
      }),
    });
    const data = await res.json();

    trackLeadWithMatching(
      {
        email,
        phone: phone || undefined,
        firstName: firstNameRaw,
        lastName: lastParts.join(" ") || undefined,
      },
      {
        content_category: "real_estate_sell_or_buy_first",
        verdict: data.verdict,
      }
    );
    trackStep("soumis");
    return { stored: !!data.stored, firstName: firstNameRaw };
  } catch {
    return null;
  }
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("hero");
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [analyze, setAnalyze] = useState<AnalyzeResponse | null>(null);
  const [leadResult, setLeadResult] = useState<LeadResult | null>(null);

  const handleFormComplete = async (finalAnswers: Answers) => {
    trackStep("decouvrir_strategie");
    setAnswers(finalAnswers);
    setStage("loading");
    if (typeof window !== "undefined") window.scrollTo(0, 0);

    const startedAt = performance.now();
    let result: AnalyzeResponse | null = null;
    let lead: LeadResult | null = null;
    try {
      const [analyzeSettled, leadSettled] = await Promise.allSettled([
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: finalAnswers }),
        }).then((res) => (res.ok ? (res.json() as Promise<AnalyzeResponse>) : null)),
        submitLead(finalAnswers),
      ]);
      if (analyzeSettled.status === "fulfilled") result = analyzeSettled.value;
      if (leadSettled.status === "fulfilled") lead = leadSettled.value;
    } catch {
      // result/lead restent null
    }

    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
    setTimeout(() => {
      if (result) {
        setAnalyze(result);
        setLeadResult(lead);
        trackStep("resultats", result.scoring.verdict);
        setStage("results");
        if (typeof window !== "undefined") window.scrollTo(0, 0);
      } else {
        setStage("form");
      }
    }, remaining);
  };

  const restart = () => {
    setAnswers(null);
    setAnalyze(null);
    setLeadResult(null);
    setStage("hero");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  const showChrome = stage === "hero" || stage === "results";

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AnimatePresence>
        {stage === "hero" && (
          <motion.div
            key="bg"
            // initial={false} : pas de fondu au tout premier rendu (la page se
            // charge déjà sur "hero") — sinon le fond reste à opacity:0 tant que
            // le JS n'a pas hydraté, ce qui retarde artificiellement le LCP.
            // L'exit (en quittant le hero) reste animé normalement.
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-0"
          >
            <HeroBackground />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {stage === "hero" && (
          <motion.div key="hero" className="relative z-10" initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
            <Hero onStart={() => { trackStep("debut"); setStage("form"); }} />
          </motion.div>
        )}
        {stage === "form" && (
          <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
            <QualificationForm onComplete={handleFormComplete} onExit={() => setStage("hero")} />
          </motion.div>
        )}
        {stage === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <LoadingScreen />
          </motion.div>
        )}
        {stage === "results" && analyze && answers && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <ResultsScreen analyze={analyze} answers={answers} leadResult={leadResult} onRestart={restart} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logos — visibles sur le hero et les résultats */}
      <AnimatePresence>
        {showChrome && (
          <motion.div
            key="brand-chrome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <TopLogos />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
