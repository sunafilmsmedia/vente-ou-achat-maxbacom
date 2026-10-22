"use client";

import { motion } from "framer-motion";

// Outils réellement disponibles au Québec pour coordonner une vente et un
// achat. Utiles peu importe la stratégie recommandée — on les présente
// toujours, pas seulement pour le verdict "simultane".
const OUTILS = [
  {
    nom: "Offre conditionnelle à la vente",
    detail:
      "Ton offre d'achat est conditionnelle à la vente de ta propriété actuelle dans un délai précis. Ça protège ton achat si ta vente prend plus de temps.",
  },
  {
    nom: "Clause de 72 heures",
    detail:
      "Si le vendeur reçoit une autre offre pendant que la tienne est conditionnelle, tu as généralement 72 heures pour lever ta condition ou te retirer.",
  },
  {
    nom: "Prêt relais (bridge financing)",
    detail:
      "Un prêt à court terme qui avance une partie de l'équité de ta propriété actuelle avant que la vente soit conclue, pour financer ton prochain achat.",
  },
  {
    nom: "Dates de clôture alignées",
    detail:
      "En coordonnant les dates de prise de possession des deux transactions avec les notaires, tu évites de déménager deux fois ou de te retrouver sans logis.",
  },
];

export default function CoordinationBlock() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mt-12"
    >
      <h3 className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
        Outils pour coordonner ta vente et ton achat
      </h3>
      <p className="text-sm text-slate-400 mb-5 leading-relaxed">
        Peu importe la stratégie recommandée, ces outils réduisent le risque de te retrouver
        sans logis — ou de payer deux hypothèques trop longtemps.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        {OUTILS.map((o, i) => (
          <motion.div
            key={o.nom}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 + i * 0.05 }}
            className="glass-card rounded-2xl p-5"
          >
            <p className="font-medium text-[var(--color-brand-100)]">{o.nom}</p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{o.detail}</p>
          </motion.div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-slate-500 italic leading-relaxed">
        Disponibilité et conditions variables selon le prêteur et le contexte de la
        transaction — à valider avec un courtier immobilier et un courtier hypothécaire.
      </p>
    </motion.section>
  );
}
