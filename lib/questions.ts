import type { Answers } from "./types";

export type QuestionId =
  | "reasonForChange"
  | "searchStage"
  | "currentPropertyType"
  | "currentCity"
  | "currentPropertyValue"
  | "ownershipDuration"
  | "needsSaleMoney"
  | "canCarryTwoMortgages"
  | "hasSavings"
  | "priority"
  | "fullName"
  | "email"
  | "phone";

export type QuestionKind = "choice" | "regions" | "text";

export interface Choice<V extends string = string> {
  value: V;
  label: string;
  hint?: string;
}

export interface QuestionDef {
  id: QuestionId;
  kind: QuestionKind;
  title: string;
  subtitle?: string;
  choices?: Choice[];
  autoAdvance?: boolean;
  showIf?: (a: Answers) => boolean;
  // kind "regions" seulement — combien de secteurs maximum (défaut : 1).
  maxRegions?: number;
  regionsPlaceholder?: string;
  // kind "text" seulement.
  inputType?: "text" | "email" | "tel";
  placeholder?: string;
  autoComplete?: string;
  helper?: string;
}

export const QUESTIONS: QuestionDef[] = [
  // ── Étape 1 — Ton projet ────────────────────────────────────────────────
  {
    id: "reasonForChange",
    kind: "choice",
    title: "Pourquoi souhaites-tu changer de propriété ?",
    subtitle: "Pour qu'on comprenne ton projet.",
    autoAdvance: true,
    choices: [
      { value: "plus_espace", label: "J'ai besoin de plus d'espace" },
      { value: "plus_petite", label: "Je souhaite une propriété plus petite" },
      { value: "quartier_ville", label: "Je veux changer de quartier ou de ville" },
      { value: "autre", label: "Autre raison", hint: "Qualité de vie, dépenses, changement personnel…" },
    ],
  },
  {
    id: "searchStage",
    kind: "choice",
    title: "As-tu déjà commencé à chercher ta prochaine propriété ?",
    autoAdvance: true,
    choices: [
      { value: "trouve", label: "Oui, j'ai trouvé une propriété qui m'intéresse" },
      { value: "visite", label: "Oui, je visite actuellement des propriétés" },
      { value: "annonces", label: "Oui, je regarde les annonces en ligne" },
      { value: "pas_commence", label: "Non, je veux d'abord savoir quoi faire avec ma propriété actuelle" },
    ],
  },

  // ── Étape 2 — Ta propriété actuelle ──────────────────────────────────────
  {
    id: "currentPropertyType",
    kind: "choice",
    title: "Quel type de propriété possèdes-tu actuellement ?",
    autoAdvance: true,
    choices: [
      { value: "maison", label: "Maison unifamiliale", hint: "Détachée, jumelée ou en rangée" },
      { value: "condo", label: "Condo" },
      { value: "duplex_triplex", label: "Duplex ou triplex" },
      { value: "autre", label: "Autre" },
    ],
  },
  {
    id: "currentCity",
    kind: "regions",
    title: "Dans quelle ville se trouve ta propriété actuelle ?",
    subtitle: "Choisis-la dans la liste — ou écris-la.",
    autoAdvance: true,
    maxRegions: 1,
    regionsPlaceholder: "Écris une ville (ex. Montréal, Québec…)",
  },
  {
    id: "currentPropertyValue",
    kind: "choice",
    title: "Quelle est la valeur approximative de ta propriété actuelle ?",
    autoAdvance: true,
    choices: [
      { value: "moins_400k", label: "Moins de 400 000 $" },
      { value: "400_650k", label: "400 000 $ à 649 999 $" },
      { value: "plus_650k", label: "650 000 $ et plus" },
      { value: "ne_sais_pas", label: "Je ne sais pas" },
    ],
  },
  {
    id: "ownershipDuration",
    kind: "choice",
    title: "Ça fait combien de temps que tu es propriétaire de cette propriété ?",
    subtitle: "Ça change l'équité que tu as probablement accumulée.",
    autoAdvance: true,
    choices: [
      { value: "moins_3_ans", label: "Moins de 3 ans" },
      { value: "3_5_ans", label: "3 à 5 ans" },
      { value: "5_10_ans", label: "5 à 10 ans" },
      { value: "plus_10_ans", label: "Plus de 10 ans" },
    ],
  },

  // ── Étape 3 — Ta situation financière ────────────────────────────────────
  {
    id: "needsSaleMoney",
    kind: "choice",
    title: "As-tu besoin de l'argent provenant de la vente de ta propriété actuelle pour acheter la prochaine ?",
    autoAdvance: true,
    choices: [
      { value: "oui_absolument", label: "Oui, absolument" },
      { value: "oui_partiel", label: "Oui, pour une partie de ma mise de fonds" },
      { value: "non_assez_economies", label: "Non, j'ai suffisamment d'économies" },
      { value: "ne_sais_pas", label: "Je ne sais pas encore" },
    ],
  },
  {
    id: "canCarryTwoMortgages",
    kind: "choice",
    title: "Serais-tu capable d'assumer les dépenses de deux propriétés pendant quelques mois ?",
    autoAdvance: true,
    choices: [
      { value: "oui_sans_probleme", label: "Oui, sans problème" },
      { value: "oui_courte_periode", label: "Oui, mais seulement pendant une courte période" },
      { value: "non", label: "Non" },
      { value: "ne_sais_pas", label: "Je ne sais pas" },
    ],
    // Si la personne a déjà dit avoir ABSOLUMENT besoin de l'argent de la
    // vente pour acheter, elle ne peut par définition pas porter deux
    // propriétés — la question devient inutile.
    showIf: (a) => a.needsSaleMoney !== "oui_absolument",
  },
  {
    id: "hasSavings",
    kind: "choice",
    title: "As-tu des économies disponibles pour ton prochain achat, indépendamment de la vente de ta propriété actuelle ?",
    autoAdvance: true,
    choices: [
      { value: "oui", label: "Oui" },
      { value: "non", label: "Non" },
      { value: "prefere_ne_pas_repondre", label: "Je préfère ne pas répondre" },
    ],
  },

  // ── Étape 4 — Tes priorités ──────────────────────────────────────────────
  {
    id: "priority",
    kind: "choice",
    title: "Qu'est-ce qui est le plus important pour toi dans ce changement ?",
    autoAdvance: true,
    choices: [
      { value: "meilleur_prix", label: "Obtenir le meilleur prix possible pour ma propriété actuelle" },
      { value: "maison_parfaite", label: "Trouver la maison parfaite, même si ça prend du temps" },
      { value: "eviter_deux_hypotheques", label: "Éviter de payer deux hypothèques" },
      { value: "eviter_deplacement_double", label: "Éviter de devoir déménager deux fois" },
    ],
  },

  // ── Coordonnées ───────────────────────────────────────────────────────────
  {
    id: "fullName",
    kind: "text",
    title: "Quel est ton nom complet ?",
    subtitle: "Pour savoir à qui s'adresser.",
    inputType: "text",
    autoComplete: "name",
    placeholder: "Marie Tremblay",
  },
  {
    id: "email",
    kind: "text",
    title: "Quel est ton courriel ?",
    subtitle: "C'est là que tu recevras ta stratégie.",
    inputType: "email",
    autoComplete: "email",
    placeholder: "marie@exemple.ca",
  },
  {
    id: "phone",
    kind: "text",
    title: "Quel est ton numéro de téléphone ?",
    subtitle: "Pour qu'un courtier puisse te joindre rapidement.",
    inputType: "tel",
    autoComplete: "tel",
    placeholder: "(514) 555-0123",
  },
];

export function getVisibleQuestions(answers: Answers): QuestionDef[] {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
}

export function isAnswered(q: QuestionDef, a: Answers): boolean {
  switch (q.id) {
    case "reasonForChange": return !!a.reasonForChange;
    case "searchStage": return !!a.searchStage;
    case "currentPropertyType": return !!a.currentPropertyType;
    case "currentCity": return Array.isArray(a.currentCity) && a.currentCity.length >= 1;
    case "currentPropertyValue": return !!a.currentPropertyValue;
    case "ownershipDuration": return !!a.ownershipDuration;
    case "needsSaleMoney": return !!a.needsSaleMoney;
    case "canCarryTwoMortgages": return !!a.canCarryTwoMortgages;
    case "hasSavings": return !!a.hasSavings;
    case "priority": return !!a.priority;
    case "fullName": return !!(a.fullName ?? "").trim();
    case "email": return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((a.email ?? "").trim());
    case "phone": return (a.phone ?? "").replace(/\D/g, "").length >= 10;
  }
}
