// Rapport déterministe — utilisé tel quel quand aucune clé Anthropic n'est
// configurée, et comme filet de sécurité si l'appel à Claude échoue.
// Le verdict et le score ne sont JAMAIS décidés ici : ils viennent de
// lib/scoring.ts. Ce fichier ne fait que les mettre en mots.

import { REGIONS } from "./regions";
import type { Answers, Report, ScoringResult, Verdict } from "./types";

const HEADLINES: Record<Verdict, string> = {
  vendre_avant: "Vendre avant d'acheter pourrait être plus avantageux pour toi.",
  acheter_avant: "Acheter avant de vendre pourrait être plus avantageux pour toi.",
  simultane: "Coordonner ta vente et ton achat en parallèle pourrait être la meilleure stratégie pour toi.",
};

const VERBE: Record<Verdict, string> = {
  vendre_avant: "vendre d'abord",
  acheter_avant: "acheter d'abord",
  simultane: "coordonner les deux de front",
};

const PROPERTY_LABEL: Record<string, string> = {
  maison: "maison unifamiliale",
  condo: "condo",
  duplex_triplex: "duplex ou triplex",
  autre: "propriété",
};

const VALUE_RANGE_LABEL: Record<string, string> = {
  moins_400k: "moins de 400 000 $",
  "400_650k": "entre 400 000 $ et 650 000 $",
  plus_650k: "650 000 $ et plus",
  ne_sais_pas: "à confirmer",
};

export function regionNames(ids?: string[]): string[] {
  return (ids ?? []).map((id) => REGIONS.find((r) => r.id === id)?.name ?? id);
}

function currentCityLabel(answers: Answers): string {
  return regionNames(answers.currentCity)[0] ?? "ta ville";
}

function propertyLabel(answers: Answers): string {
  return PROPERTY_LABEL[answers.currentPropertyType ?? "autre"] ?? "propriété";
}

function summaryFor(verdict: Verdict): string {
  return `Selon tes réponses, ${VERBE[verdict]} pourrait te permettre de :`;
}

function benefitsFor(verdict: Verdict, answers: Answers): string[] {
  const nextType = "ta prochaine propriété";
  switch (verdict) {
    case "vendre_avant":
      return [
        `Connaître ton budget réel pour ${nextType}, basé sur le produit net de ta vente.`,
        "Réduire le risque d'assumer deux hypothèques en même temps.",
        "Négocier ton prochain achat avec une meilleure visibilité financière.",
        "Éviter la pression de deux paiements pendant une période prolongée.",
      ];
    case "acheter_avant":
      return [
        "Prendre le temps de trouver la propriété qui correspond vraiment à tes critères.",
        "Éviter de devoir déménager deux fois ou te retrouver sans logis entre les deux transactions.",
        `Négocier la vente de ta ${propertyLabel(answers)} sans la pression d'un acheteur pressé.`,
        "Profiter d'une opportunité dès qu'elle se présente, sans attendre le résultat de ta vente.",
      ];
    case "simultane":
      return [
        "Coordonner les dates de clôture pour déménager une seule fois.",
        "Garder de la flexibilité si une transaction prend plus de temps que prévu.",
        "Utiliser des outils comme l'offre conditionnelle ou le prêt relais pour réduire le risque financier.",
        "Avancer sur les deux fronts à la fois, sans perdre de temps.",
      ];
  }
}

function stepsFor(verdict: Verdict, answers: Answers): Report["steps"] {
  const secteurTexte = currentCityLabel(answers);
  const valeur = VALUE_RANGE_LABEL[answers.currentPropertyValue ?? "ne_sais_pas"];

  switch (verdict) {
    case "vendre_avant":
      return [
        {
          title: "Faire évaluer ta propriété actuelle",
          description: `Ton estimation (${valeur}) est un point de départ. Une évaluation gratuite donne le montant net qui deviendra ta mise de fonds.`,
        },
        {
          title: "Mettre ta propriété en vente",
          description: "Dès que le montant net est confirmé, tu connais ton vrai budget pour la suite — et tu négocies ton achat en toute confiance.",
        },
        {
          title: "Te préqualifier pendant la mise en marché",
          description: "Rien n'empêche de rencontrer un prêteur pendant que ta propriété est sur le marché, pour être prêt à offrir dès la vente conclue.",
        },
        {
          title: "Commencer à surveiller le marché",
          description: `On peut déjà repérer ce qui se vend dans ${secteurTexte}, pour que tu sois prêt à bouger vite une fois ta vente conclue.`,
        },
      ];
    case "acheter_avant":
      return [
        {
          title: "Confirmer ta capacité avec un prêteur",
          description: "Un prêteur validera ce que tu peux porter en tenant compte de ton hypothèque actuelle et de tes dettes.",
        },
        {
          title: "Commencer activement tes recherches",
          description: `On cible ${secteurTexte} selon tes critères — tu n'es pas pressé(e) de vendre, tu peux attendre la bonne occasion.`,
        },
        {
          title: "Préparer une offre conditionnelle à la vente",
          description: "Une clause de vente de ta propriété actuelle protège ton achat si ta vente prend plus de temps que prévu.",
        },
        {
          title: "Mettre ta propriété actuelle en marché une fois l'achat sécurisé",
          description: "Tu vends avec une date de prise de possession qui te convient, sans la pression de ne pas avoir de nouvel endroit où aller.",
        },
      ];
    case "simultane":
      return [
        {
          title: "Faire évaluer ta propriété actuelle",
          description: `Ton estimation (${valeur}) sert de base pour chiffrer ce que tu peux viser en parallèle.`,
        },
        {
          title: "Mettre les deux dossiers en mouvement en même temps",
          description: `On prépare la mise en marché de ta propriété tout en surveillant ${secteurTexte} pour ta prochaine.`,
        },
        {
          title: "Explorer le prêt relais et l'offre conditionnelle",
          description: "Ces deux outils permettent d'acheter avant que ta vente soit conclue, sans porter le plein poids des deux hypothèques trop longtemps.",
        },
        {
          title: "Aligner les dates de clôture",
          description: "L'objectif : une seule transition, pas deux déménagements — on synchronise les dates avec les deux notaires.",
        },
      ];
  }
}

function marketInsightFor(answers: Answers): string {
  const secteur = currentCityLabel(answers);
  return `Dans ${secteur}, le délai de vente et le délai d'achat ne sont jamais parfaitement synchronisés. Un courtier qui gère les deux transactions en même temps peut négocier des dates de clôture flexibles, une clause de 72 heures ou un prêt relais — des outils qui réduisent le risque, peu importe la stratégie choisie.`;
}

export function buildFallbackReport(answers: Answers, scoring: ScoringResult): Report {
  const verdict = scoring.verdict;

  return {
    headline: HEADLINES[verdict],
    summary: summaryFor(verdict),
    benefits: benefitsFor(verdict, answers),
    steps: stepsFor(verdict, answers),
    marketInsight: marketInsightFor(answers),
  };
}

export const VERDICT_HEADLINES = HEADLINES;
