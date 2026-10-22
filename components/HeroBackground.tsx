// Fond décoratif du hero — version générique (pas encore de ville/marché
// assigné à un courtier précis, donc pas de carte géographique). Deux halos
// dorés flous sur fond blanc, dans l'esprit des autres apps de la famille.
export default function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% -5%, #fffdf5 0%, #ffffff 45%, #ffffff 100%)",
        }}
      />
      <div className="absolute -top-32 -right-24 w-[32rem] h-[32rem] rounded-full bg-[var(--color-gold)]/[0.08] blur-3xl" />
      <div className="absolute top-1/3 -left-32 w-[28rem] h-[28rem] rounded-full bg-[var(--color-gold)]/[0.06] blur-3xl" />
    </div>
  );
}
