"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

type Image = { id: string; originalFilename: string };

export function CustomCreationImageGallery({ requestId, images }: { requestId: string; images: Image[] }) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  async function loadUrl(imageId: string): Promise<string | null> {
    if (urls[imageId]) return urls[imageId];
    setLoading(imageId);
    try {
      const { url } = (await api.customCreations.adminImageUrl(requestId, imageId)) as { url: string };
      setUrls((u) => ({ ...u, [imageId]: url }));
      return url;
    } catch {
      return null;
    } finally {
      setLoading(null);
    }
  }

  async function open(index: number) {
    setOpenIndex(index);
    await loadUrl(images[index].id);
  }

  if (images.length === 0) {
    return <p className="text-sm text-text-muted">No reference images were uploaded.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => open(i)}
            className="flex aspect-square items-center justify-center overflow-hidden rounded-chip border border-border bg-bg"
          >
            {urls[img.id] ? (
              <img src={urls[img.id]} alt={img.originalFilename} className="h-full w-full object-cover" />
            ) : loading === img.id ? (
              <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
            ) : (
              <span className="text-[11px] text-text-muted">View</span>
            )}
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <button onClick={() => setOpenIndex(null)} aria-label="Close" className="absolute right-4 top-4 text-white">
            <X className="h-6 w-6" />
          </button>
          {openIndex > 0 && (
            <button onClick={() => open(openIndex - 1)} aria-label="Previous image" className="absolute left-4 text-white">
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}
          {openIndex < images.length - 1 && (
            <button onClick={() => open(openIndex + 1)} aria-label="Next image" className="absolute right-16 text-white">
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
          {urls[images[openIndex].id] ? (
            <img src={urls[images[openIndex].id]} alt={images[openIndex].originalFilename} className="max-h-[85vh] max-w-[90vw] object-contain" />
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          )}
        </div>
      )}
    </>
  );
}
