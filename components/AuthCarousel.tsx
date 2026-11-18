"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cx } from "@/lib/format";

const slides = [
  { src: "/HamzaOne%203D%20Miniature%20Showcase.png", alt: "HamzaOne 3D printed miniature figurines" },
  { src: "/HamzaOne%203D%20Printed%20Showcase.png", alt: "HamzaOne 3D printed creations showcase" },
  { src: "/HamzaOne%203D%20Printing%20Showcase.png", alt: "HamzaOne 3D printing showcase" },
];

const INTERVAL_MS = 4000;

export function AuthCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="aspect-square w-full overflow-hidden rounded-panel">
      <div className="relative h-full w-full">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={cx(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              i === active ? "opacity-100" : "opacity-0"
            )}
            aria-hidden={i !== active}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setActive(i)}
              className={cx(
                "h-1.5 rounded-full transition-all",
                i === active ? "w-5 bg-white/90" : "w-1.5 bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
