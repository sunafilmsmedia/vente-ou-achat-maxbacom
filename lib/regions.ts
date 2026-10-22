import type { Region } from "./types";

// ─────────────────────────────────────────────────────────────────────────
//  VILLES/SECTEURS — à remplir par déploiement.
//
//  Utilisé par le champ de recherche (ville actuelle, secteurs d'achat) :
//  - recherche insensible aux accents et à la casse
//  - si la ville tapée n'y figure pas, l'utilisateur peut toujours saisir
//    du texte libre (« Ajouter "…" ») — donc la liste n'a pas besoin d'être
//    exhaustive.
//  Aucune coordonnée (lat/lng) n'est requise : seul `name` est affiché.
//
//  Générique pour l'instant : grandes villes du Québec. Remplace par le
//  territoire réel du courtier au déploiement.
// ─────────────────────────────────────────────────────────────────────────
export const REGIONS: Region[] = [
  { id: "montreal", name: "Montréal" },
  { id: "laval", name: "Laval" },
  { id: "longueuil", name: "Longueuil" },
  { id: "quebec", name: "Québec" },
  { id: "gatineau", name: "Gatineau" },
  { id: "sherbrooke", name: "Sherbrooke" },
  { id: "trois-rivieres", name: "Trois-Rivières" },
  { id: "levis", name: "Lévis" },
  { id: "terrebonne", name: "Terrebonne" },
  { id: "saint-jerome", name: "Saint-Jérôme" },
  { id: "repentigny", name: "Repentigny" },
  { id: "brossard", name: "Brossard" },
  { id: "saint-jean-sur-richelieu", name: "Saint-Jean-sur-Richelieu" },
  { id: "drummondville", name: "Drummondville" },
  { id: "granby", name: "Granby" },
  { id: "saint-hyacinthe", name: "Saint-Hyacinthe" },
  { id: "blainville", name: "Blainville" },
  { id: "mirabel", name: "Mirabel" },
  { id: "boucherville", name: "Boucherville" },
  { id: "chateauguay", name: "Châteauguay" },
  { id: "sainte-julie", name: "Sainte-Julie" },
  { id: "varennes", name: "Varennes" },
  { id: "vaudreuil-dorion", name: "Vaudreuil-Dorion" },
  { id: "rimouski", name: "Rimouski" },
  { id: "saguenay", name: "Saguenay" },
  { id: "alma", name: "Alma" },
  { id: "rouyn-noranda", name: "Rouyn-Noranda" },
  { id: "val-dor", name: "Val-d'Or" },
  { id: "joliette", name: "Joliette" },
  { id: "victoriaville", name: "Victoriaville" },
];
