import type { Region } from "./types";

// ─────────────────────────────────────────────────────────────────────────
//  SECTEURS COUVERTS — Sainte-Julie et la Rive-Sud de Montréal (Montérégie).
//
//  Utilisé par les champs de recherche de ville/secteur :
//  - recherche insensible aux accents et à la casse
//  - si la ville tapée n'y figure pas, l'utilisateur peut toujours saisir
//    du texte libre (« Ajouter "…" ») — donc la liste n'a pas besoin d'être
//    exhaustive, mais couvrir toutes les municipalités du territoire améliore
//    l'expérience.
//  Aucune coordonnée (lat/lng) n'est requise : seul `name` est affiché.
// ─────────────────────────────────────────────────────────────────────────
export const REGIONS: Region[] = [
  // ── Sainte-Julie et ses secteurs ──────────────────────────────────────
  { id: "sainte-julie", name: "Sainte-Julie" },
  { id: "sainte-julie-vieux-village", name: "Vieux-Village (Sainte-Julie)" },

  // ── MRC Marguerite-D'Youville ──────────────────────────────────────────
  { id: "varennes", name: "Varennes" },
  { id: "vercheres", name: "Verchères" },
  { id: "saint-amable", name: "Saint-Amable" },
  { id: "calixa-lavallee", name: "Calixa-Lavallée" },
  { id: "contrecoeur", name: "Contrecœur" },

  // ── Agglomération de Longueuil ──────────────────────────────────────────
  { id: "boucherville", name: "Boucherville" },
  { id: "saint-bruno-de-montarville", name: "Saint-Bruno-de-Montarville" },
  { id: "longueuil", name: "Longueuil" },
  { id: "saint-hubert", name: "Saint-Hubert" },
  { id: "brossard", name: "Brossard" },
  { id: "saint-lambert", name: "Saint-Lambert" },

  // ── MRC de la Vallée-du-Richelieu ───────────────────────────────────────
  { id: "beloeil", name: "Beloeil" },
  { id: "mcmasterville", name: "McMasterville" },
  { id: "otterburn-park", name: "Otterburn Park" },
  { id: "saint-basile-le-grand", name: "Saint-Basile-le-Grand" },
  { id: "chambly", name: "Chambly" },
  { id: "carignan", name: "Carignan" },
  { id: "mont-saint-hilaire", name: "Mont-Saint-Hilaire" },
  { id: "saint-mathieu-de-beloeil", name: "Saint-Mathieu-de-Beloeil" },

  // ── Plus loin sur la Rive-Sud ────────────────────────────────────────────
  { id: "sorel-tracy", name: "Sorel-Tracy" },
  { id: "la-prairie", name: "La Prairie" },
  { id: "candiac", name: "Candiac" },
];
