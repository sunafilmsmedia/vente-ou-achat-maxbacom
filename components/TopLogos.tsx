"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BRAND } from "@/lib/brand";

export default function TopLogos() {
  const { team, banner } = BRAND.logos;
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30 pointer-events-none"
        aria-hidden
      >
        {/* Logo Max Bacon — fond noir intégré à l'image, s'intègre tel quel sur le fond bleu */}
        <Image
          src={team.src}
          alt={team.alt}
          width={team.width}
          height={team.height}
          priority
          className="h-10 sm:h-12 w-auto rounded-lg shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
        />
      </motion.div>

      {/* Logo RE/MAX — blanc/transparent, directement sur le fond bleu */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30 pointer-events-none"
        aria-hidden
      >
        <Image
          src={banner.src}
          alt={banner.alt}
          width={banner.width}
          height={banner.height}
          priority
          className="h-8 sm:h-10 w-auto"
        />
      </motion.div>
    </>
  );
}
