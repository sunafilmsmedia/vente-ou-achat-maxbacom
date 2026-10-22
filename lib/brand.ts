// ─────────────────────────────────────────────────────────────────────────
//  CONFIG DE MARQUE — WHITE LABEL
//  Le SEUL fichier à éditer pour rebrander l'app à un nouveau client.
//  (+ lib/regions.ts pour la liste des secteurs, + les images dans /public,
//   + les variables d'environnement : voir .env.local.example)
//
//  Palette : noir / doré / blanc. Les couleurs se règlent dans app/globals.css
//  (bloc @theme) — cherche les variables --color-brand-* et --color-gold.
//
//  Générique pour l'instant — pas encore assigné à un courtier précis.
// ─────────────────────────────────────────────────────────────────────────

export interface BrokerConfig {
  name: string;
  title: string;
  /** Chemin de la photo dans /public (ex. "/broker-1.jpg") */
  photo: string;
  /** Cadrage de la photo dans le rond du badge (ex. "50% 18%") */
  objectPosition: string;
  /** Téléphone affiché (ex. "514 000-0000") */
  phoneDisplay: string;
  /** Téléphone au format tel: (ex. "+15140000000") */
  phoneTel: string;
}

export interface BrandConfig {
  /** Identifiant court du déploiement — sert de "source" au CRM et de projet Clarity Scanner par défaut. */
  slug: string;

  /** Nom de l'équipe (affiché en filigrane dans le formulaire, le footer, le consentement). */
  teamName: string;

  /** Région / territoire couvert (textes marketing, rapport de repli, footer). */
  region: string;
  /** Ville centrale (utilisée dans les textes du rapport de repli). */
  city: string;

  /** Textes du hero. */
  hero: {
    chip: string;
    title: string;
    /** Segment exact du titre en or shimmer + police douce (serif italique). Optionnel. */
    titleHighlight?: string;
    /** Segment exact du titre en police douce dorée (serif italique). Optionnel. */
    titleSoft?: string;
    subtitle: string;
    signature: string; // "Boosté par l'IA"
    cta: string;
    ctaHint: string;
    scrollHint: string;
  };

  /** Logos fixes en haut (équipe à gauche, bannière à droite). */
  logos: {
    team: { src: string; alt: string; width: number; height: number };
    banner: { src: string; alt: string; width: number; height: number };
  };

  /** Courtier(s). Les noms servent aux textes du rapport (le badge flottant a été retiré). */
  brokers: BrokerConfig[];
}

export const BRAND: BrandConfig = {
  slug: "vente-ou-achat-maxbacon",

  teamName: "Nom de l'équipe",

  region: "ta région",
  city: "ta ville",

  hero: {
    chip: "60 secondes · Gratuit",
    title: "Devrais-tu vendre avant d'acheter… ou acheter avant de vendre ?",
    subtitle:
      "Découvre en 60 secondes quelle stratégie immobilière pourrait être la plus avantageuse selon ta situation financière, ta propriété actuelle et ton prochain achat.",
    signature: "Boosté par l'IA",
    cta: "Découvrir ma meilleure stratégie",
    ctaHint: "60 secondes — gratuit et confidentiel",
    scrollHint: "Confidentiel · Sans engagement",
  },

  logos: {
    team: {
      src: "/logo-equipe.svg",
      alt: "Nom de l'équipe",
      width: 750,
      height: 194,
    },
    banner: {
      src: "/logo-banniere.svg",
      alt: "Agence immobilière",
      width: 900,
      height: 300,
    },
  },

  brokers: [
    {
      name: "Prénom Nom",
      title: "Courtier ou courtière immobilier",
      photo: "/broker-1.svg",
      objectPosition: "50% 18%",
      phoneDisplay: "",
      phoneTel: "",
    },
  ],
};

/** "Prénom ou Prénom" — utilisé dans les textes qui nomment l'équipe. */
export function brokersInlineNames(): string {
  const firsts = BRAND.brokers.map((b) => b.name.split(/\s+/)[0]).filter(Boolean);
  if (firsts.length === 0) return "un courtier";
  if (firsts.length === 1) return firsts[0];
  return `${firsts.slice(0, -1).join(", ")} ou ${firsts[firsts.length - 1]}`;
}
