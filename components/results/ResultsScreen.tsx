"use client";

import { motion } from "framer-motion";
import { brokersInlineNames } from "@/lib/brand";
import type { AnalyzeResponse, Answers, ScoringFactor, Verdict } from "@/lib/types";
import type { LeadResult } from "@/app/page";
import CoordinationBlock from "./CoordinationBlock";

interface Props {
  analyze: AnalyzeResponse;
  answers: Answers;
  // Coordonnées déjà collectées dans le questionnaire et lead déjà soumis au
  // CRM avant même d'arriver sur cet écran — null si la soumission a échoué.
  leadResult: LeadResult | null;
  onRestart: () => void;
}

const VERDICT_BADGE: Record<Verdict, { label: string; color: string; bg: string; ring: string }> = {
  vendre_avant: {
    label: "Vendre avant d'acheter",
    color: "text-[var(--color-gold-soft)]",
    bg: "bg-[var(--color-gold)]/10",
    ring: "ring-[var(--color-gold)]/30",
  },
  acheter_avant: {
    label: "Acheter avant de vendre",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    ring: "ring-sky-500/30",
  },
  simultane: {
    label: "Stratégie combinée",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/30",
  },
};

export default function ResultsScreen({ analyze, answers, leadResult, onRestart }: Props) {
  const { scoring, report } = analyze;
  const badge = VERDICT_BADGE[scoring.verdict];

  return (
    <div className="min-h-screen px-5 sm:px-8 py-10 sm:py-14 max-w-3xl mx-auto w-full">
      {/* Verdict badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center mb-8"
      >
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${badge.bg} ring-1 ${badge.ring}`}>
          <span className={`w-2 h-2 rounded-full ${badge.color.replace("text-", "bg-")}`} />
          <span className={`text-xs font-medium tracking-wide ${badge.color}`}>{badge.label}</span>
        </div>
      </motion.div>

      {/* Verdict + résumé */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10"
      >
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-3">Ta stratégie immobilière</p>
        <h1 className="display-title text-[1.8rem] sm:text-5xl lg:text-6xl text-[var(--color-brand-100)] text-balance">
          {report.headline}
        </h1>
      </motion.div>

      {/* Jauge bipolaire */}
      <StrategyGauge netScore={scoring.netScore} verdict={scoring.verdict} />

      {/* Avantages de la stratégie recommandée */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="
          relative overflow-hidden
          rounded-3xl p-7 sm:p-9 mt-6
          bg-black/[0.02]
          border border-[var(--color-slate-accent)]/25
          shadow-[0_30px_80px_-30px_rgba(0,0,0,0.18)]
        "
      >
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[var(--color-gold)]/10 blur-3xl" />
        <div className="relative">
          <p className="text-sm sm:text-base text-[var(--color-brand-100)] font-medium leading-relaxed mb-5">
            {report.summary}
          </p>
          <ul className="space-y-3">
            {report.benefits.map((b, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <span className="shrink-0 mt-1 w-4 h-4 rounded-full bg-[var(--color-gold)]/20 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-[var(--color-gold-soft)]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M4 10L8 14L16 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm sm:text-base text-[var(--color-brand-200)] leading-relaxed">{b}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Confirmation — lead déjà soumis au CRM avant ce calcul IA */}
      <ConfirmationBlock stored={leadResult?.stored ?? false} firstName={leadResult?.firstName ?? ""} />

      {/* Outils pour coordonner la vente et l'achat */}
      <CoordinationBlock />

      {/* Donnée de marché */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="
          mt-12
          rounded-2xl
          bg-gradient-to-br from-[var(--color-gold)]/10 to-[var(--color-gold)]/5
          border border-[var(--color-gold)]/25
          p-5 sm:p-6
        "
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--color-brand-300)]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 17V9L10 3L17 9V17H12V12H8V17Z" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[var(--color-brand-300)] mb-1.5">
              Donnée du marché
            </p>
            <p className="text-sm sm:text-base text-[var(--color-brand-100)] leading-relaxed">
              {report.marketInsight}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Facteurs détectés */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="mt-10"
      >
        <h3 className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-4">
          Facteurs détectés
        </h3>
        <ul className="space-y-2">
          {scoring.factors.map((f, i) => (
            <FactorRow key={i} factor={f} />
          ))}
        </ul>
      </motion.section>

      {/* Prochaines étapes */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.75 }}
        className="mt-12"
      >
        <h3 className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-5">
          Prochaines étapes
        </h3>
        <ol className="space-y-3">
          {report.steps.map((s, i) => (
            <li key={i} className="glass-card rounded-2xl p-4 sm:p-5 flex gap-4">
              <span className="
                shrink-0 w-8 h-8 rounded-full
                bg-gradient-to-br from-[var(--color-gold-soft)] to-[var(--color-gold)]
                flex items-center justify-center
                font-serif text-[#0a0a0a] text-sm
                shadow-[0_6px_18px_-4px_rgba(201,162,39,0.5)]
              ">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-[var(--color-brand-100)]">{s.title}</p>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </motion.section>

      {/* Avis */}
      <p className="mt-10 text-[11px] text-slate-500 leading-relaxed">
        Cette recommandation est basée uniquement sur tes réponses — elle ne remplace pas
        l&apos;avis d&apos;un courtier immobilier ou d&apos;un prêteur hypothécaire, qui
        validera ta situation réelle avant toute décision.
      </p>

      {/* Footer */}
      <div className="mt-10 mb-24 sm:mb-12 text-center">
        <button
          onClick={onRestart}
          className="text-sm text-slate-400 hover:text-[var(--color-brand-200)] transition-colors underline underline-offset-4 decoration-white/25 hover:decoration-[var(--color-brand-400)]"
        >
          Refaire le test
        </button>
        <p className="mt-6 text-[10px] text-slate-600 uppercase tracking-[0.2em]">
          Stratégie {analyze.generatedBy === "claude" ? "IA" : "déterministe"}
        </p>
      </div>
    </div>
  );
}

// Jauge bipolaire : "Acheter avant" (gauche, -100) ↔ "Vendre avant" (droite, +100).
function StrategyGauge({ netScore, verdict }: { netScore: number; verdict: Verdict }) {
  const pct = Math.min(100, Math.max(0, (netScore + 100) / 2));
  const note =
    verdict === "vendre_avant"
      ? "Tes réponses penchent clairement vers vendre d'abord."
      : verdict === "acheter_avant"
      ? "Tes réponses penchent clairement vers acheter d'abord."
      : "Tes réponses sont assez équilibrées — les deux options se coordonnent bien.";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="
        relative overflow-hidden
        rounded-3xl p-7 sm:p-9
        bg-gradient-to-br from-[#fdfaf1] to-[#f6efda]
        border border-[var(--color-gold)]/30
        shadow-[0_30px_80px_-30px_rgba(0,0,0,0.20)]
      "
    >
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[var(--color-gold)]/15 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-brand-300)] text-center">
          Où tu te situes
        </p>

        <div className="mt-6 relative h-2.5 w-full rounded-full overflow-hidden bg-gradient-to-r from-sky-300 via-[#e9ddb8] to-[var(--color-gold)]">
          <motion.div
            initial={{ left: "50%" }}
            animate={{ left: `${pct}%` }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#0a0a0a] ring-4 ring-white shadow-[0_6px_16px_-2px_rgba(0,0,0,0.4)]"
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] sm:text-xs font-medium">
          <span className="text-sky-600">Acheter avant</span>
          <span className="text-slate-500">Simultané</span>
          <span className="text-[var(--color-brand-300)]">Vendre avant</span>
        </div>

        <p className="mt-6 text-sm text-[var(--color-brand-200)] text-center">{note}</p>
      </div>
    </motion.div>
  );
}

function FactorRow({ factor }: { factor: ScoringFactor }) {
  const dot =
    factor.tone === "vendre"
      ? "bg-[var(--color-gold)]"
      : factor.tone === "acheter"
      ? "bg-sky-500"
      : "bg-slate-400";
  return (
    <li className="flex items-center gap-3 text-sm">
      <span className={`shrink-0 w-2 h-2 rounded-full ${dot}`} />
      <span className="text-[var(--color-slate-300)]">{factor.label}</span>
    </li>
  );
}

function ConfirmationBlock({ stored, firstName }: { stored: boolean; firstName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`
        mt-8 rounded-3xl p-6 sm:p-8
        ${stored
          ? "bg-gradient-to-br from-emerald-400/20 to-emerald-200/10 border border-emerald-500/30"
          : "bg-gradient-to-br from-[var(--color-gold)]/10 to-transparent border border-[var(--color-gold)]/30"}
      `}
    >
      {stored ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7L10 3L17 7M3 7V15A2 2 0 0 0 5 17H15A2 2 0 0 0 17 15V7M3 7L10 11L17 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="font-serif text-xl sm:text-2xl text-[var(--color-brand-100)]">
              Merci {firstName}, ta stratégie est confirmée.
            </p>
          </div>
          <p className="text-sm sm:text-base text-[var(--color-slate-300)] leading-relaxed">
            Tu vas recevoir cette recommandation par courriel dans les prochaines minutes, et{" "}
            {brokersInlineNames()} va te contacter pour valider ta situation avec toi.
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-[var(--color-gold)]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 2 L17 6 L17 11 C17 14.5 14 17.5 10 18 C6 17.5 3 14.5 3 11 L3 6 Z" strokeLinejoin="round" />
              <path d="M7 10 L9.5 12.5 L14 8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="font-serif text-xl sm:text-2xl text-[var(--color-gold-soft)]">
              Tes coordonnées n&apos;ont pas été conservées.
            </p>
          </div>
          <p className="text-sm sm:text-base text-[var(--color-gold-soft)]/85 leading-relaxed">
            Ta stratégie reste affichée ici. Reviens nous voir quand tu voudras en parler à
            quelqu&apos;un.
          </p>
        </>
      )}
    </motion.div>
  );
}
