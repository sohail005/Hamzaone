"use client";

import { useEffect, useState } from "react";
import { assetUrl } from "@/lib/assets";

const AUTOPLAY_MS = 5000;

export function HeroCarousel({ imageKeys, className, style }: { imageKeys: string[]; className?: string; style?: React.CSSProperties }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (imageKeys.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % imageKeys.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [imageKeys.length]);

  return (
    <div className={`relative overflow-hidden rounded-panel bg-art-tile ${className ?? ""}`} style={style}>
      {imageKeys.map((key, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={key}
          src={assetUrl(key)}
          alt=""
          className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
      {imageKeys.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
          {imageKeys.map((key, i) => (
            <button
              key={key}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === index ? 20 : 8, backgroundColor: i === index ? "#fff" : "rgba(255,255,255,0.5)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
