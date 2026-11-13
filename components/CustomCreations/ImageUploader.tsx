"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { cx } from "@/lib/format";
import { api } from "@/lib/api";

export type UploadedImage = {
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  previewUrl: string;
};

const MAX_IMAGES = 8;
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type PendingItem = { localId: string; name: string; progress: number; error: string | null };

export function ImageUploader({ images, onChange }: { images: UploadedImage[]; onChange: (images: UploadedImage[]) => void }) {
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    const remainingSlots = MAX_IMAGES - images.length - pending.length;
    const accepted = list.slice(0, Math.max(0, remainingSlots));

    for (const file of accepted) {
      const localId = crypto.randomUUID();
      if (!ALLOWED_TYPES.has(file.type)) {
        setPending((p) => [...p, { localId, name: file.name, progress: 0, error: "Only JPG, PNG and WEBP images are allowed." }]);
        continue;
      }
      if (file.size > MAX_SIZE) {
        setPending((p) => [...p, { localId, name: file.name, progress: 0, error: "Images must be 5 MB or smaller." }]);
        continue;
      }

      setPending((p) => [...p, { localId, name: file.name, progress: 0, error: null }]);
      try {
        const result = await api.customCreations.upload(file, (pct) => {
          setPending((p) => p.map((item) => (item.localId === localId ? { ...item, progress: pct } : item)));
        });
        onChange([...images, { ...result, previewUrl: URL.createObjectURL(file) }]);
      } catch (e) {
        setPending((p) => p.map((item) => (item.localId === localId ? { ...item, error: e instanceof Error ? e.message : "Upload failed." } : item)));
        continue;
      }
      setPending((p) => p.filter((item) => item.localId !== localId));
    }
  }

  function removeImage(storageKey: string) {
    onChange(images.filter((img) => img.storageKey !== storageKey));
  }

  const atLimit = images.length + pending.length >= MAX_IMAGES;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        Upload photographs, sketches, drawings, or inspiration images. Our team will handle the 3D modelling.
      </p>

      {!atLimit && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={cx(
            "flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed p-8 text-center transition-colors",
            dragOver ? "border-accent bg-mto-chip-bg" : "border-border-input hover:border-accent",
          )}
        >
          <Upload className="h-6 w-6 text-text-muted" />
          <p className="text-sm font-semibold">Drag & drop images here, or click to browse</p>
          <p className="text-xs text-text-muted">JPG, JPEG, PNG, WEBP · up to 8 images · 5 MB each</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {(images.length > 0 || pending.length > 0) && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.storageKey} className="relative aspect-square overflow-hidden rounded-chip border border-border bg-surface">
              <img src={img.previewUrl} alt={img.originalFilename} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(img.storageKey)}
                aria-label={`Remove ${img.originalFilename}`}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {pending.map((item) => (
            <div key={item.localId} className="relative flex aspect-square flex-col items-center justify-center gap-1 rounded-chip border border-border bg-surface p-2 text-center">
              {item.error ? (
                <>
                  <ImageIcon className="h-5 w-5 text-error-text" />
                  <span className="text-[11px] text-error-text">{item.error}</span>
                </>
              ) : (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
                  <span className="text-[11px] text-text-muted">{item.progress}%</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
