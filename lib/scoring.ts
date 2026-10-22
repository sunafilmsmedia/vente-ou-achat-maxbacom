// ============================================================================
// Scoring — « Vendre avant d'acheter ou l'inverse ? »
// ----------------------------------------------------------------------------
// Contrairement aux apps acheteur/vendeur (un score 0-100 de « préparation »),
// ce scoring est BIPOLAIRE : chaque facteur pousse vers une stratégie ou
// l'autre. netScore va de -100 (acheter avant) à +100 (vendre avant) ; un
// score proche de 0 signifie que les deux options sont coordonnées de front
// ("simultane").
//
// Les 3 facteurs financiers (besoin de l'argent de la vente, capacité à
// porter deux hypothèques, économies indépendantes) pèsent le plus lourd —
// c'est ce qui détermine réellement si on PEUT acheter avant de vendre.
// Le reste (statut de mise en vente, préapprobation, équité, priorité)
// affine la recommandation.
// ============================================================================

import type { Answers, ScoringFactor, ScoringResult, Verdict } from "./types";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Au-delà de ce seuil (en valeur absolue), on tranche clairement pour une
// stratégie. En-dessous, les deux options sont assez équilibrées : on
// recommande de les coordonner en parallèle.
const SEUIL_TRANCHE = 18;

export function computeScoring(answers: Answers): ScoringResult {
  const factors: ScoringFactor[] = [];
  let score = 0;

  // delta > 0 favorise "vendre avant" ; delta < 0 favorise "acheter avant".
  const add = (delta: number, label: string, tone: ScoringFactor["tone"]) => {
    score += delta;
    factors.push({ label, delta, tone });
  };

  // ── As-tu besoin de l'argent de la vente ? (le facteur le plus lourd) ────
  switch (answers.needsSaleMoney) {
    case "oui_absolument":
      add(32, "Tu as besoin du produit de ta vente pour financer ton prochain achat", "vendre");
      break;
    case "oui_partiel":
      add(16, "Une partie de ta mise de fonds viendra de la vente de ta propriété actuelle", "vendre");
      break;
    case "non_assez_economies":
      add(-22, "Tes économies suffisent déjà, sans attendre le produit de ta vente", "acheter");
      break;
    case "ne_sais_pas":
      add(0, "Tu n'es pas encore certain(e) de tes besoins financiers pour l'achat", "neutre");
      break;
  }

  // ── Peux-tu porter deux propriétés en même temps ? ────────────────────────
  switch (answers.canCarryTwoMortgages) {
    case "oui_sans_probleme":
      add(-28, "Tu peux assumer deux propriétés sans problème — rien ne t'oblige à vendre avant d'acheter", "acheter");
      break;
    case "oui_courte_periode":
      add(-10, "Tu pourrais tenir le coup pour une courte période seulement", "acheter");
      break;
    case "non":
      add(28, "Tu ne pourrais pas assumer deux hypothèques en même temps", "vendre");
      break;
    case "ne_sais_pas":
      add(0, "Tu n'es pas certain(e) de pouvoir porter deux propriétés", "neutre");
      break;
  }

  // ── Économies indépendantes de la vente ───────────────────────────────────
  switch (answers.hasSavings) {
    case "oui":
      add(-14, "Tu as des économies disponibles, indépendantes de la vente de ta propriété", "acheter");
      break;
    case "non":
      add(14, "Tu n'as pas d'économies en dehors de la vente de ta propriété actuelle", "vendre");
      break;
    case "prefere_ne_pas_repondre":
      add(0, "Ta situation d'épargne reste à valider avec un courtier", "neutre");
      break;
  }

  // ── Statut de mise en vente ────────────────────────────────────────────────
  switch (answers.listingStatus) {
    case "avec_courtier":
    case "par_moi_meme":
      add(8, "Ta propriété est déjà sur le marché — la vente est déjà en mouvement", "vendre");
      break;
    case "prete_pas_listee":
      add(4, "Ta propriété est prête à être mise en vente", "vendre");
      break;
    case "aucune_demarche":
      add(-4, "Tu n'as encore fait aucune démarche de mise en vente", "acheter");
      break;
  }

  // ── Préapprobation hypothécaire ───────────────────────────────────────────
  switch (answers.preapprovalStatus) {
    case "oui":
      add(-12, "Tu es déjà préapprouvé — rien ne t'empêche de commencer à chercher dès maintenant", "acheter");
      break;
    case "en_demarche":
      add(-4, "Ta préapprobation est en démarche", "acheter");
      break;
    case "non":
      add(8, "Ton financement n'est pas encore amorcé — mieux vaut connaître le produit de ta vente avant de magasiner", "vendre");
      break;
    case "ne_sais_pas_besoin":
      add(0, "La préapprobation reste à clarifier avec un courtier hypothécaire", "neutre");
      break;
  }

  // ── Priorité principale ────────────────────────────────────────────────────
  switch (answers.priority) {
    case "meilleur_prix":
      add(14, "Obtenir le meilleur prix pour ta propriété actuelle est ta priorité — ça demande du temps, sans la pression d'un achat en attente", "vendre");
      break;
    case "maison_parfaite":
      add(-16, "Trouver la maison parfaite est ta priorité, même si ça prend du temps — tu ne veux pas te presser à vendre", "acheter");
      break;
    case "eviter_deux_hypotheques":
      add(20, "Éviter de payer deux hypothèques est ta priorité numéro un", "vendre");
      break;
    case "eviter_deplacement_double":
      add(-18, "Éviter de déménager deux fois est ta priorité", "acheter");
      break;
  }

  // ── Équité accumulée (ancienneté de propriétaire) ─────────────────────────
  switch (answers.ownershipDuration) {
    case "moins_3_ans":
      add(-3, "Propriétaire depuis moins de 3 ans — l'équité accumulée est encore limitée", "acheter");
      break;
    case "3_5_ans":
      add(3, "Propriétaire depuis 3 à 5 ans — une équité commence à s'accumuler", "vendre");
      break;
    case "5_10_ans":
      add(6, "Propriétaire depuis 5 à 10 ans — une équité probablement confortable s'est accumulée", "vendre");
      break;
    case "plus_10_ans":
      add(8, "Propriétaire depuis plus de 10 ans — ta plus-value est probablement significative", "vendre");
      break;
  }

  score = clamp(Math.round(score), -100, 100);

  return { netScore: score, verdict: verdictFor(score), factors };
}

function verdictFor(score: number): Verdict {
  if (score >= SEUIL_TRANCHE) return "vendre_avant";
  if (score <= -SEUIL_TRANCHE) return "acheter_avant";
  return "simultane";
}
