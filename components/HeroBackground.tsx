import Image from "next/image";

// Fond décoratif du hero — Max Bacon (RE/MAX Sainte-Julie). La photo de
// l'église (repère local) reste très discrète — en noir et blanc, assombrie
// et floutée sous le dégradé bleu, pour ne jamais concurrencer le titre.
export default function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-[85vh] min-h-[560px]"
        style={{ opacity: 0.38, filter: "grayscale(1) blur(1px) contrast(1.1) brightness(0.9)" }}
      >
        <Image
          src="/eglise-sainte-julie.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_12%]"
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% -5%, #1b47ad 0%, #0c2b74 45%, #050f33 100%)",
          opacity: 0.88,
        }}
      />
      <div className="absolute -top-32 -right-24 w-[32rem] h-[32rem] rounded-full bg-[var(--color-gold)]/[0.14] blur-3xl" />
      <div className="absolute top-1/3 -left-32 w-[28rem] h-[28rem] rounded-full bg-[var(--color-gold)]/[0.1] blur-3xl" />
    </div>
  );
}
