"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { BRAND } from "@/lib/brand";

interface HeroProps {
  onStart: () => void;
}

// Police douce commune aux segments mis en valeur (serif italique, casse normale).
const SOFT = "font-serif italic font-normal normal-case tracking-normal";

// Trouve l'index de la N-ième occurrence (1-indexée) de `needle` dans `haystack`.
function findOccurrence(haystack: string, needle: string, occurrence: number): number {
  let idx = -1;
  for (let i = 0; i < occurrence; i++) {
    idx = haystack.indexOf(needle, idx + 1);
    if (idx === -1) return -1;
  }
  return idx;
}

interface TitleSeg {
  text: string;
  className: string;
  // Quelle occurrence du mot styler, quand il revient plusieurs fois dans
  // le titre (1 = la première, 2 = la deuxième, etc.). Défaut : 1.
  occurrence?: number;
}

// Rend le titre en enveloppant certains segments dans une police douce :
//  - `highlight` → rouge shimmer
//  - `soft` → rouge doux
// Chaque segment cible une position FIXE dans le titre d'origine (pas un
// "reste" qui rétrécit au fil du scan) — ça permet de cibler la 2e
// occurrence d'un mot qui revient plus loin dans la phrase sans styler la 1re.
function renderTitle(
  title: string,
  highlight?: string,
  soft?: string,
  highlightOccurrence = 1,
  softOccurrence = 1
) {
  const segs: TitleSeg[] = [
    highlight ? { text: highlight, className: `${SOFT} ai-shimmer`, occurrence: highlightOccurrence } : null,
    soft ? { text: soft, className: `${SOFT} text-[var(--color-gold-soft)]`, occurrence: softOccurrence } : null,
  ].filter(Boolean) as TitleSeg[];

  if (segs.length === 0) return title;

  const ranges: { start: number; end: number; className: string }[] = [];
  for (const seg of segs) {
    const start = findOccurrence(title, seg.text, seg.occurrence ?? 1);
    if (start !== -1) ranges.push({ start, end: start + seg.text.length, className: seg.className });
  }
  if (ranges.length === 0) return title;
  ranges.sort((a, b) => a.start - b.start);

  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  for (const r of ranges) {
    if (r.start > cursor) nodes.push(title.slice(cursor, r.start));
    nodes.push(
      <span key={key++} className={r.className}>
        {title.slice(r.start, r.end)}
      </span>
    );
    cursor = r.end;
  }
  if (cursor < title.length) nodes.push(title.slice(cursor));
  return <>{nodes}</>;
}

export default function Hero({ onStart }: HeroProps) {
  const h = BRAND.hero;
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start px-5 sm:px-8 pt-20 sm:pt-28 pb-32">
      <motion.div
        // initial={false} : le H1 est l'élément LCP de la page — on ne veut pas
        // qu'il reste à opacity:0 en attendant l'hydratation JS + l'animation.
        // Il s'affiche directement ; seuls les éléments en dessous (accroche,
        // CTA) gardent leur fondu décalé.
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl text-center"
      >
        {/* Chip */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs sm:text-sm text-[var(--color-brand-200)] mb-7 sm:mb-9">
          <span className="relative inline-flex w-2 h-2 rounded-full bg-[var(--color-gold)] text-[var(--color-gold)] pulse-dot" />
          <span className="font-medium tracking-wide">{h.chip}</span>
        </div>

        {/* Titre H1 */}
        <h1 className="display-title text-[2.1rem] sm:text-5xl lg:text-6xl text-[var(--color-brand-100)] text-balance">
          {renderTitle(h.title, h.titleHighlight, h.titleSoft, h.titleHighlightOccurrence, h.titleSoftOccurrence)}
        </h1>

        {/* Sous-titre */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 font-medium max-w-xl mx-auto leading-relaxed text-balance">
          {h.subtitle}
        </p>

        {/* Hook signature */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-8 font-serif italic text-xl sm:text-2xl ai-shimmer inline-block"
        >
          {h.signature}
        </motion.p>

        {/* Divider doré */}
        <div className="mt-8 sm:mt-10 mx-auto w-12 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-10 sm:mt-12 flex flex-col items-center gap-3"
        >
          <button
            onClick={onStart}
            className="
              group relative inline-flex items-center justify-center gap-2
              px-8 sm:px-10 py-4
              rounded-full
              bg-gradient-to-b from-[var(--color-gold-soft)] to-[var(--color-gold)]
              text-white font-semibold text-base
              shadow-[0_20px_50px_-15px_rgba(220,25,40,0.55),0_0_0_1px_rgba(0,0,0,0.15)_inset]
              hover:shadow-[0_25px_60px_-10px_rgba(220,25,40,0.7),0_0_0_1px_rgba(0,0,0,0.2)_inset]
              transition-all duration-300
              hover:-translate-y-0.5
              active:translate-y-0
            "
          >
            <span className="uppercase tracking-wide text-sm sm:text-base">{h.cta}</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="text-xs text-slate-500">{h.ctaHint}</p>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-24 sm:bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 uppercase tracking-[0.2em]"
      >
        {h.scrollHint}
      </motion.div>
    </section>
  );
}
