import { cx } from "@/lib/format";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, src, size = 40, className }: { name: string; src?: string; size?: number; className?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cx("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      className={cx("flex items-center justify-center rounded-full bg-accent text-sm font-semibold text-text", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
