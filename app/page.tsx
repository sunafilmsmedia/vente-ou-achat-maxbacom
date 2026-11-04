"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Hero from "@/components/Hero";
import HeroBackground from "@/components/HeroBackground";
import TopLogos from "@/components/TopLogos";
import QualificationForm from "@/components/QualificationForm";
import LoadingScreen from "@/components/LoadingScreen";
import PreRevealScreen from "@/components/PreRevealScreen";
import ResultsScreen from "@/components/results/ResultsScreen";
import { trackStep } from "@/lib/track";
import type { AnalyzeResponse, Answers } from "@/lib/types";

type Stage = "hero" | "form" | "loading" | "preReveal" | "results";

const MIN_LOADING_MS = 2000;

export default function Home() {
  const [stage, setStage] = useState<Stage>("hero");
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [analyze, setAnalyze] = useState<AnalyzeResponse | null>(null);

  const handleFormComplete = async (finalAnswers: Answers) => {
    trackStep("decouvrir_strategie");
    setAnswers(finalAnswers);
    setStage("loading");
    if (typeof window !== "undefined") window.scrollTo(0, 0);

    const startedAt = performance.now();
    let result: AnalyzeResponse | null = null;
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      if (res.ok) result = (await res.json()) as AnalyzeResponse;
    } catch {
      // result reste null
    }

    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
    setTimeout(() => {
      if (result) {
        setAnalyze(result);
        // Écran « Ta réponse est prête », puis coordonnées avant la stratégie
        trackStep("pre_reveal");
        setStage("preReveal");
        if (typeof window !== "undefined") window.scrollTo(0, 0);
      } else {
        setStage("form");
      }
    }, remaining);
  };

  const revealResults = () => {
    trackStep("resultats");
    setStage("results");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  const restart = () => {
    setAnswers(null);
    setAnalyze(null);
    setStage("hero");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  const showChrome = stage === "hero" || stage === "preReveal" || stage === "results";

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AnimatePresence>
        {stage === "hero" && (
          <motion.div
            key="bg"
            // initial={false} : pas de fondu au tout premier rendu (la page se
            // charge déjà sur "hero") — sinon le fond reste à opacity:0 tant que
            // le JS n'a pas hydraté, ce qui retarde artificiellement le LCP.
            // L'exit (en quittant le hero) reste animé normalement.
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-0"
          >
            <HeroBackground />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {stage === "hero" && (
          <motion.div key="hero" className="relative z-10" initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
            <Hero onStart={() => { trackStep("debut"); setStage("form"); }} />
          </motion.div>
        )}
        {stage === "form" && (
          <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
            <QualificationForm onComplete={handleFormComplete} onExit={() => setStage("hero")} />
          </motion.div>
        )}
        {stage === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <LoadingScreen />
          </motion.div>
        )}
        {stage === "preReveal" && analyze && (
          <motion.div key="preReveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <PreRevealScreen onContinue={revealResults} />
          </motion.div>
        )}
        {stage === "results" && analyze && answers && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <ResultsScreen analyze={analyze} answers={answers} onRestart={restart} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logos — visibles sur le hero et les résultats */}
      <AnimatePresence>
        {showChrome && (
          <motion.div
            key="brand-chrome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <TopLogos />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
