"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";
import { getVisibleQuestions, isAnswered } from "@/lib/questions";
import { trackStep } from "@/lib/track";
import { BRAND } from "@/lib/brand";
import type { Answers } from "@/lib/types";
import ProgressBar from "./ProgressBar";
import ChoiceQuestion from "./questions/ChoiceQuestion";
import RegionMultiSearch from "./questions/RegionMultiSearch";
import ExistingListingBlocker from "./questions/ExistingListingBlocker";
import TextQuestion from "./questions/TextQuestion";

interface Props {
  onComplete: (answers: Answers) => void;
  onExit: () => void;
}

const AUTO_ADVANCE_MS = 220;

// Libellés d'étape (Clarity Scanner).
const STEP_NAMES: Record<string, string> = {
  reasonForChange: "raison_changement",
  moveTimeline: "echeancier_demenagement",
  searchStage: "etape_recherche",
  currentPropertyType: "type_propriete_actuelle",
  currentCity: "ville_actuelle",
  currentPropertyValue: "valeur_propriete_actuelle",
  ownershipDuration: "anciennete_proprietaire",
  listingStatus: "statut_mise_en_vente",
  preapprovalStatus: "preapprobation",
  needsSaleMoney: "besoin_argent_vente",
  canCarryTwoMortgages: "capacite_deux_hypotheques",
  hasSavings: "economies",
  priority: "priorite",
  fullName: "nom",
  email: "courriel",
  phone: "telephone",
};

// Champs dont la valeur est un choix prédéfini → sûr à transmettre. Jamais
// fullName/email/phone (PII) : seul le nom de l'étape est suivi pour eux.
const CHOICE_FIELDS = new Set([
  "reasonForChange",
  "moveTimeline",
  "searchStage",
  "currentPropertyType",
  "currentPropertyValue",
  "ownershipDuration",
  "listingStatus",
  "preapprovalStatus",
  "needsSaleMoney",
  "canCarryTwoMortgages",
  "hasSavings",
  "priority",
]);

function trackAnswer(partial: Partial<Answers>) {
  const field = Object.keys(partial).find((k) => k in STEP_NAMES);
  if (!field) return;
  const raw = (partial as Record<string, unknown>)[field];
  const value = CHOICE_FIELDS.has(field) && raw != null ? String(raw) : undefined;
  trackStep(STEP_NAMES[field], value);
}

export default function QualificationForm({ onComplete, onExit }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visible = useMemo(() => getVisibleQuestions(answers), [answers]);
  const current = visible[Math.min(index, visible.length - 1)];
  const isLast = index >= visible.length - 1;
  const canProceed = current ? isAnswered(current, answers) : false;

  // Le blocker "propriété déjà en vente avec un courtier" remplace la
  // question pour ce step.
  const isBlocked =
    current?.id === "listingStatus" &&
    answers.listingStatus === "avec_courtier" &&
    answers.wantsToSwitchListing !== true;

  const submit = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    onComplete(answers);
  }, [answers, onComplete]);

  const goNext = useCallback(() => {
    // Étapes à avance manuelle (secteurs multiples) : on suit le passage ici.
    if (current && !current.autoAdvance) {
      trackStep(STEP_NAMES[current.id] ?? current.id);
    }
    setDirection(1);
    if (isLast) submit();
    else setIndex((i) => Math.min(visible.length - 1, i + 1));
  }, [current, isLast, submit, visible.length]);

  const goPrev = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    setDirection(-1);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const updateAndMaybeAdvance = useCallback(
    (partial: Partial<Answers>, autoAdvance: boolean, delayMs: number = AUTO_ADVANCE_MS) => {
      // Calculé de façon synchrone (pas via le updater de setAnswers, dont
      // l'exécution est différée par React) : la logique ci-dessous doit
      // pouvoir lire la réponse qu'on vient de donner immédiatement.
      const nextAnswers: Answers = { ...answers, ...partial };
      // Réinitialiser wantsToSwitchListing si on change la réponse à listingStatus.
      if ("listingStatus" in partial && partial.listingStatus !== "avec_courtier") {
        delete nextAnswers.wantsToSwitchListing;
      }
      setAnswers(nextAnswers);

      // Bloque l'auto-advance quand listingStatus="avec_courtier" sans
      // wantsToSwitchListing : ExistingListingBlocker prend le relais.
      const wouldBeBlocked =
        nextAnswers.listingStatus === "avec_courtier" && nextAnswers.wantsToSwitchListing !== true;

      if (autoAdvance && !wouldBeBlocked) {
        trackAnswer(partial);
        if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = setTimeout(() => {
          setDirection(1);
          setIndex((i) => {
            const visibleAfter = getVisibleQuestions(nextAnswers);
            if (i >= visibleAfter.length - 1) {
              onComplete(nextAnswers);
              return i;
            }
            return i + 1;
          });
        }, delayMs);
      }
    },
    [answers, onComplete]
  );

  if (!current) return null;

  return (
    <div className="min-h-screen flex flex-col px-5 sm:px-8 py-6 sm:py-10 max-w-2xl mx-auto w-full">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
        <button
          onClick={onExit}
          className="text-xs text-slate-500 hover:text-[var(--color-brand-200)] transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 2L2 6L5 10M2 6H10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour
        </button>
        <div className="font-serif italic text-sm text-[var(--color-brand-300)]">
          {BRAND.teamName}
        </div>
      </header>

      <ProgressBar current={index} total={visible.length} />

      {/* Slide container */}
      <div className="flex-1 mt-10 sm:mt-14 relative">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={current.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {!isBlocked && (
              <div className="mb-7 sm:mb-9">
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[var(--color-brand-100)] leading-tight tracking-tight text-balance">
                  {current.title}
                </h2>
                {current.subtitle && (
                  <p className="mt-2.5 text-sm sm:text-base text-slate-400">{current.subtitle}</p>
                )}
              </div>
            )}

            <QuestionRenderer question={current} answers={answers} onUpdate={updateAndMaybeAdvance} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer controls */}
      <footer className="mt-8 sm:mt-10 pt-6 border-t border-[var(--color-slate-accent)]/10">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0}
            className="
              px-5 py-2.5 rounded-full text-sm font-medium
              text-slate-400 hover:text-[var(--color-brand-200)]
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-colors
            "
          >
            Précédent
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={submit}
              disabled={!canProceed}
              className="
                inline-flex items-center gap-2
                px-6 sm:px-8 py-3 rounded-full text-sm font-medium
                bg-gradient-to-b from-[var(--color-gold-soft)] to-[var(--color-gold)]
                text-white font-semibold
                shadow-[0_15px_40px_-10px_rgba(220,25,40,0.55)]
                hover:shadow-[0_20px_50px_-10px_rgba(220,25,40,0.7)]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all
              "
            >
              Découvrir ma stratégie
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="
                inline-flex items-center gap-2
                px-6 py-2.5 rounded-full text-sm font-medium
                bg-white/[0.06] border border-[var(--color-slate-accent)]/25
                text-[var(--color-brand-100)]
                hover:bg-white/[0.1] hover:border-[var(--color-slate-accent)]/40
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all
              "
            >
              Suivant
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

interface RendererProps {
  question: ReturnType<typeof getVisibleQuestions>[number];
  answers: Answers;
  onUpdate: (partial: Partial<Answers>, autoAdvance: boolean, delayMs?: number) => void;
}

function QuestionRenderer({ question, answers, onUpdate }: RendererProps) {
  const { id, choices, autoAdvance, inputType, placeholder, autoComplete, helper, maxRegions, regionsPlaceholder } = question;

  switch (id) {
    case "reasonForChange":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.reasonForChange}
          onChange={(v) => onUpdate({ reasonForChange: v as Answers["reasonForChange"] }, !!autoAdvance)}
        />
      );
    case "moveTimeline":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.moveTimeline}
          onChange={(v) => onUpdate({ moveTimeline: v as Answers["moveTimeline"] }, !!autoAdvance)}
        />
      );
    case "searchStage":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.searchStage}
          onChange={(v) => onUpdate({ searchStage: v as Answers["searchStage"] }, !!autoAdvance)}
        />
      );
    case "currentPropertyType":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.currentPropertyType}
          onChange={(v) => onUpdate({ currentPropertyType: v as Answers["currentPropertyType"] }, !!autoAdvance)}
        />
      );
    case "currentCity":
      return (
        <RegionMultiSearch
          value={answers.currentCity}
          max={maxRegions ?? 1}
          placeholder={regionsPlaceholder}
          // Un seul choix : dès qu'on en sélectionne un, on avance.
          onChange={(ids) => onUpdate({ currentCity: ids }, ids.length > 0)}
        />
      );
    case "currentPropertyValue":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.currentPropertyValue}
          onChange={(v) => onUpdate({ currentPropertyValue: v as Answers["currentPropertyValue"] }, !!autoAdvance)}
        />
      );
    case "ownershipDuration":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.ownershipDuration}
          onChange={(v) => onUpdate({ ownershipDuration: v as Answers["ownershipDuration"] }, !!autoAdvance)}
        />
      );
    case "listingStatus":
      // Quand listingStatus="avec_courtier" sans wantsToSwitchListing, on
      // remplace la question par le blocker légal.
      if (answers.listingStatus === "avec_courtier" && answers.wantsToSwitchListing !== true) {
        return (
          <ExistingListingBlocker
            onWantsToSwitch={() => onUpdate({ wantsToSwitchListing: true }, true)}
            onCancel={() => onUpdate({ listingStatus: undefined, wantsToSwitchListing: undefined }, false)}
          />
        );
      }
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.listingStatus}
          onChange={(v) => onUpdate({ listingStatus: v as Answers["listingStatus"] }, !!autoAdvance)}
        />
      );
    case "preapprovalStatus":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.preapprovalStatus}
          onChange={(v) => onUpdate({ preapprovalStatus: v as Answers["preapprovalStatus"] }, !!autoAdvance)}
        />
      );
    case "needsSaleMoney":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.needsSaleMoney}
          onChange={(v) => onUpdate({ needsSaleMoney: v as Answers["needsSaleMoney"] }, !!autoAdvance)}
        />
      );
    case "canCarryTwoMortgages":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.canCarryTwoMortgages}
          onChange={(v) => onUpdate({ canCarryTwoMortgages: v as Answers["canCarryTwoMortgages"] }, !!autoAdvance)}
        />
      );
    case "hasSavings":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.hasSavings}
          onChange={(v) => onUpdate({ hasSavings: v as Answers["hasSavings"] }, !!autoAdvance)}
        />
      );
    case "priority":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.priority}
          onChange={(v) => onUpdate({ priority: v as Answers["priority"] }, !!autoAdvance)}
        />
      );
    case "fullName":
      return (
        <TextQuestion
          value={answers.fullName}
          onChange={(v) => onUpdate({ fullName: v }, false)}
          type={inputType}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
      );
    case "email":
      return (
        <TextQuestion
          value={answers.email}
          onChange={(v) => onUpdate({ email: v }, false)}
          type={inputType}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
      );
    case "phone":
      return (
        <TextQuestion
          value={answers.phone}
          onChange={(v) => onUpdate({ phone: v }, false)}
          type={inputType}
          autoComplete={autoComplete}
          placeholder={placeholder}
          helper={helper}
        />
      );
    default:
      return null;
  }
}
