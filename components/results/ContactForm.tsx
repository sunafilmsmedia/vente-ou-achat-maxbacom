"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { trackLeadWithMatching } from "../MetaPixel";
import { getFbclid } from "@/lib/attribution";
import { trackStep } from "@/lib/track";
import { BRAND } from "@/lib/brand";
import type { Answers, Verdict } from "@/lib/types";

interface Props {
  answers: Answers;
  verdict: Verdict;
  onSubmitted: (result: { stored: boolean; firstName: string }) => void;
}

export default function ContactForm({ answers, verdict, onSubmitted }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Étape « coordonnées » : le formulaire de contact est affiché.
  useEffect(() => {
    trackStep("coordonnees");
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (!firstName.trim()) return setError("Ton prénom est requis.");
    if (!lastName.trim()) return setError("Ton nom est requis.");
    if (!email.trim()) return setError("Ton courriel est requis.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError("Format de courriel invalide.");
    }
    if (!phone.trim()) return setError("Ton téléphone est requis.");
    // Validation téléphone : au moins 10 chiffres (Amérique du Nord)
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      return setError("Numéro de téléphone invalide.");
    }
    if (!consent) return setError("Merci de cocher la case de consentement.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          consent,
          answers,
          leadType: "vente_achat",
          fbclid: getFbclid(),
        }),
      });
      const data = await res.json();

      // Meta Pixel — Lead standard avec Advanced Matching
      trackLeadWithMatching(
        {
          email: email.trim(),
          phone: phone.trim() || undefined,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
        {
          content_category: "real_estate_sell_or_buy_first",
          verdict,
        }
      );

      trackStep("soumis");

      onSubmitted({
        stored: !!data.stored,
        firstName: firstName.trim(),
      });
    } catch {
      setError("Une erreur est survenue. Réessaie dans quelques secondes.");
      setSubmitting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="
        mt-12
        rounded-3xl p-6 sm:p-8
        bg-white/[0.05]
        border border-[var(--color-slate-accent)]/20
        shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]
      "
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1 h-1 rounded-full bg-[var(--color-gold)]" />
        <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold-soft)]">
          Débloquer ma stratégie
        </span>
      </div>

      <h3 className="font-serif text-2xl sm:text-3xl text-[var(--color-brand-100)] leading-tight text-balance">
        Où veux-tu recevoir ta stratégie gratuite ?
      </h3>
      <p className="mt-2 text-sm sm:text-base text-slate-400 leading-relaxed">
        Tu recevras ici ta stratégie complète, complètement gratuite.
      </p>

      <div className="mt-6 space-y-3">
        <Field
          label="Courriel"
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="marie@exemple.ca"
        />
        <Field
          label="Ton prénom"
          required
          autoComplete="given-name"
          value={firstName}
          onChange={setFirstName}
          placeholder="Marie"
        />
        <Field
          label="Ton nom"
          required
          autoComplete="family-name"
          value={lastName}
          onChange={setLastName}
          placeholder="Tremblay"
        />
        <Field
          label="Téléphone"
          required
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={setPhone}
          placeholder="(514) 555-0123"
          helper="Pour qu'un courtier puisse te joindre rapidement."
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer group select-none mt-5">
        <span className="relative shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="peer sr-only"
          />
          <span className="block w-5 h-5 rounded-md border border-[var(--color-slate-accent)]/40 bg-white/[0.08] peer-checked:bg-[var(--color-gold)] peer-checked:border-[var(--color-gold-soft)] transition-colors" />
          <svg
            className="absolute inset-0 m-auto w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 6.5L4.5 9L10 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          J&apos;accepte que {BRAND.teamName} m&apos;envoie mon analyse gratuite
          et puisse me contacter au sujet de mon évaluation.
        </span>
      </label>

      {error && <p className="mt-3 text-sm text-rose-400 text-center">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="
          mt-6 w-full
          inline-flex items-center justify-center gap-2
          px-6 py-4 rounded-full text-base font-semibold
          bg-gradient-to-b from-[var(--color-gold-soft)] to-[var(--color-gold)]
          text-white
          shadow-[0_15px_40px_-10px_rgba(220,25,40,0.5)]
          hover:shadow-[0_20px_50px_-10px_rgba(220,25,40,0.65)]
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all
        "
      >
        {submitting ? (
          <>
            <Spinner /> Envoi en cours…
          </>
        ) : (
          <>
            Voir mes résultats
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>
    </motion.section>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  helper?: string;
}

function Field({ label, value, onChange, placeholder, type = "text", required, autoComplete, helper }: FieldProps) {
  return (
    <div>
      <label className="block">
        <span className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5 block">
          {label} {required && <span className="text-[var(--color-gold)]">*</span>}
        </span>
        <input
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full glass-card rounded-xl px-4 py-3
            text-[var(--color-brand-100)] placeholder:text-slate-400/60
            focus-within:border-[var(--color-brand-400)]/60
            transition-colors
            text-base
          "
        />
      </label>
      {helper && <p className="text-[11px] text-slate-500 mt-1.5">{helper}</p>}
    </div>
  );
}
