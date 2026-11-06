export function HeroArt({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative flex items-end justify-center gap-8 overflow-hidden rounded-panel bg-art-tile ${className ?? ""}`}
      style={{ paddingBottom: "22%", ...style }}
    >
      <div className="relative z-10 h-[200px] w-24 rounded-t-[48px] rounded-b-[28px]" style={{ backgroundColor: "#C96F4A" }} />
      <div
        className="relative z-10 h-[110px] w-[140px]"
        style={{ backgroundColor: "#5E7A6A", clipPath: "polygon(0 0,100% 0,84% 100%,16% 100%)" }}
      />
      <div className="relative z-10 h-[140px] w-[70px] rounded-t-[35px] rounded-b-[18px]" style={{ backgroundColor: "#2B2E33" }} />
      <div className="absolute inset-x-0 bottom-0" style={{ height: "22%", backgroundColor: "#E2DFD7" }} />
      <span className="absolute bottom-2 right-2.5 text-[11px] text-[#575A60]">
        Concept render · Spiral Decor Vase, Geometric Planter
      </span>
    </div>
  );
}
