import { cx } from "@/lib/format";
import type { Product } from "@/data/products";

type Props = {
  shape: Product["shape"];
  color?: string;
  className?: string;
};

const shapeStyle: Record<Product["shape"], string> = {
  vase: "rounded-t-[40%] rounded-b-[20%] w-[46%] h-[70%]",
  planter: "rounded-[16%] w-[58%] h-[50%]",
  lamp: "rounded-[50%] w-[62%] h-[62%]",
  coaster: "rounded-full w-[55%] h-[55%]",
  stand: "rounded-[18%] w-[50%] h-[40%] skew-x-[-8deg]",
  organizer: "rounded-[14%] w-[62%] h-[42%]",
  cup: "rounded-t-[8%] rounded-b-[18%] w-[44%] h-[56%]",
  riser: "rounded-[16%] w-[64%] h-[30%]",
  plate: "rounded-[10%] w-[62%] h-[36%]",
  keychain: "rounded-[30%] w-[30%] h-[46%]",
  bookmark: "rounded-[8%] w-[22%] h-[64%]",
  tag: "rounded-[40%] w-[36%] h-[36%]",
  dragon: "rounded-[30%] w-[56%] h-[50%] rotate-3",
  elephant: "rounded-[22%] w-[58%] h-[50%]",
  ganesha: "rounded-[30%] w-[48%] h-[60%]",
  octopus: "rounded-[40%] w-[52%] h-[52%]",
  hook: "rounded-[30%] w-[30%] h-[46%]",
  lid: "rounded-full w-[48%] h-[48%]",
  gear: "rounded-[16%] w-[50%] h-[50%] rotate-12",
  pull: "rounded-[30%] w-[40%] h-[22%]",
  part: "w-[52%] h-[52%]",
};

const shapeClipPath: Partial<Record<Product["shape"], string>> = {
  part: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)",
};

export function ConceptRender({ shape, color = "#C2693C", className }: Props) {
  return (
    <div
      className={cx(
        "relative flex items-center justify-center overflow-hidden bg-art-tile",
        className
      )}
    >
      <div
        className={cx("shadow-[inset_0_6px_14px_rgba(0,0,0,0.12),0_10px_24px_rgba(0,0,0,0.12)]", shapeStyle[shape])}
        style={{ backgroundColor: color, clipPath: shapeClipPath[shape] }}
      />
    </div>
  );
}
