// ============================================================================
// Types — Logiciel « Vendre avant d'acheter ou l'inverse ? »
// ----------------------------------------------------------------------------
// Contrairement à l'app acheteur (capacité d'achat) ou vendeur (bon moment
// pour vendre), ce logiciel répond à une question de SÉQUENCE : la personne
// possède déjà une propriété et veut en changer — doit-elle vendre avant
// d'acheter, acheter avant de vendre, ou coordonner les deux en parallèle ?
// Le résultat n'est jamais un chiffre : c'est une recommandation de stratégie,
// avec les avantages qui la justifient selon les réponses données.
// ============================================================================

export type ReasonForChange =
  | "plus_espace"
  | "plus_petite"
  | "quartier_ville"
  | "autre";

export type MoveTimeline =
  | "asap"
  | "0_6_mois"
  | "6_12_mois"
  | "plus_tard";

export type SearchStage =
  | "trouve"
  | "visite"
  | "annonces"
  | "pas_commence";

export type CurrentPropertyType =
  | "maison"
  | "condo"
  | "duplex_triplex"
  | "autre";

export type OwnershipDuration =
  | "moins_3_ans"
  | "3_5_ans"
  | "5_10_ans"
  | "plus_10_ans";

export type ValueRange =
  | "moins_400k"
  | "400_650k"
  | "plus_650k"
  | "ne_sais_pas";

// "avec_courtier" déclenche le blocage légal (ExistingListingBlocker), sauf
// si la personne indique vouloir changer (wantsToSwitchListing = true).
export type ListingStatus =
  | "avec_courtier"
  | "par_moi_meme"
  | "prete_pas_listee"
  | "aucune_demarche";

export type PreapprovalStatus =
  | "oui"
  | "non"
  | "en_demarche"
  | "ne_sais_pas_besoin";

export type NeedsSaleMoney =
  | "oui_absolument"
  | "oui_partiel"
  | "non_assez_economies"
  | "ne_sais_pas";

export type CanCarryTwoMortgages =
  | "oui_sans_probleme"
  | "oui_courte_periode"
  | "non"
  | "ne_sais_pas";

export type HasSavings = "oui" | "non" | "prefere_ne_pas_repondre";

export type Priority =
  | "meilleur_prix"
  | "maison_parfaite"
  | "eviter_deux_hypotheques"
  | "eviter_deplacement_double";

export type Region = {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
};

export interface Answers {
  // ── Étape 1 — Ton projet ───────────────────────────────────────────────
  reasonForChange?: ReasonForChange;
  moveTimeline?: MoveTimeline;
  searchStage?: SearchStage;

  // ── Étape 2 — Ta propriété actuelle ─────────────────────────────────────
  currentPropertyType?: CurrentPropertyType;
  // Un seul secteur (ville actuelle) — réutilise le champ de recherche multi.
  currentCity?: string[];
  currentPropertyValue?: ValueRange;
  ownershipDuration?: OwnershipDuration;
  listingStatus?: ListingStatus;
  // Débloque le formulaire quand listingStatus="avec_courtier" : la personne
  // n'est pas satisfaite de son courtier actuel et veut explorer un changement.
  wantsToSwitchListing?: boolean;

  // ── Étape 3 — Ton prochain achat ────────────────────────────────────────
  preapprovalStatus?: PreapprovalStatus;

  // ── Étape 4 — Ta situation financière ───────────────────────────────────
  needsSaleMoney?: NeedsSaleMoney;
  canCarryTwoMortgages?: CanCarryTwoMortgages;
  hasSavings?: HasSavings;

  // ── Étape 5 — Tes priorités ─────────────────────────────────────────────
  priority?: Priority;

  // ── Coordonnées — collectées à la fin, avant le calcul ──────────────────
  fullName?: string;
  email?: string;
  phone?: string;
}

// ── Scoring ─────────────────────────────────────────────────────────────────

export type Verdict =
  | "vendre_avant" // vendre d'abord, acheter ensuite
  | "acheter_avant" // acheter d'abord, vendre ensuite
  | "simultane"; // coordonner les deux transactions en parallèle

// delta positif = favorise "vendre avant" ; négatif = favorise "acheter avant".
export interface ScoringFactor {
  label: string;
  delta: number;
  tone: "vendre" | "acheter" | "neutre";
}

export interface ScoringResult {
  // Score net, -100 (acheter avant) à +100 (vendre avant). 0 = parfaitement équilibré.
  netScore: number;
  verdict: Verdict;
  factors: ScoringFactor[];
}

// ── Rapport (IA ou fallback déterministe) ───────────────────────────────────

export interface ReportStep {
  title: string;
  description: string;
}

export interface Report {
  headline: string;
  summary: string;
  // 3 à 4 avantages de la stratégie recommandée.
  benefits: string[];
  steps: ReportStep[];
  marketInsight: string;
}

export interface AnalyzeResponse {
  scoring: ScoringResult;
  report: Report;
  generatedBy: "claude" | "fallback";
}

// ── Lead ────────────────────────────────────────────────────────────────────

export type LeadType = "vente_achat";

export interface LeadPayload {
  name: string;
  phone?: string;
  email: string;
  consent: boolean;
  answers: Answers;
  leadType?: LeadType;
}
