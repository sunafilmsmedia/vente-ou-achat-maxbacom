// Fond décoratif du hero — Max Bacon (RE/MAX Sainte-Julie). Dégradé bleu
// profond, deux halos rouges flous, dans l'esprit des autres apps de la famille.
export default function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% -5%, #1b47ad 0%, #0c2b74 45%, #050f33 100%)",
        }}
      />
      <div className="absolute -top-32 -right-24 w-[32rem] h-[32rem] rounded-full bg-[var(--color-gold)]/[0.14] blur-3xl" />
      <div className="absolute top-1/3 -left-32 w-[28rem] h-[28rem] rounded-full bg-[var(--color-gold)]/[0.1] blur-3xl" />
    </div>
  );
}
