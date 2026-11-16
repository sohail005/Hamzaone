import type { Product } from "@/data/products";
import { ConceptRender } from "./ConceptRender";
import { assetUrl } from "@/lib/assets";

type Props = {
  imageKey?: string;
  shape: Product["shape"];
  color?: string;
  className?: string;
};

export function ProductImage({ imageKey, shape, color, className }: Props) {
  if (imageKey) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={assetUrl(imageKey)} alt="" className={`object-cover ${className ?? ""}`} />;
  }
  return <ConceptRender shape={shape} color={color} className={className} />;
}
