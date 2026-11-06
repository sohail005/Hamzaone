"use client";

import { forwardRef, useState } from "react";
import { cx } from "@/lib/format";
import { Eye, EyeOff, Search as SearchIcon } from "lucide-react";

type BaseProps = {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  id: string;
};

type TextProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;

export const Field = forwardRef<HTMLInputElement, TextProps>(function Field(
  { label, error, success, hint, id, className, ...rest },
  ref
) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-text">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={cx(
          "h-12 rounded-[12px] border bg-surface px-4 text-[16px] text-text placeholder:text-text-muted transition-colors duration-150",
          error
            ? "border-2 border-error"
            : success
            ? "border-success"
            : "border-border-input focus:border-accent",
          "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
          className
        )}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-error-text">
          {error}
        </p>
      )}
      {!error && success && <p className="text-sm text-success-text">{success}</p>}
      {!error && !success && hint && (
        <p id={`${id}-hint`} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
});

export function PhoneField({ label = "Phone number", id, error, ...rest }: TextProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-text">
          {label}
        </label>
      )}
      <div
        className={cx(
          "flex h-12 items-center rounded-[12px] border bg-surface transition-colors duration-150",
          error ? "border-2 border-error" : "border-border-input focus-within:border-accent"
        )}
      >
        <span className="flex h-full items-center border-r border-border px-3 text-text-muted">+91</span>
        <input
          id={id}
          type="tel"
          aria-invalid={!!error}
          className="h-full flex-1 bg-transparent px-3 text-[16px] text-text outline-none"
          {...rest}
        />
      </div>
      {error && <p className="text-sm text-error-text">{error}</p>}
    </div>
  );
}

export function PasswordField({ label = "Password", id, error, ...rest }: TextProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-text">
          {label}
        </label>
      )}
      <div
        className={cx(
          "flex h-12 items-center rounded-[12px] border bg-surface transition-colors duration-150",
          error ? "border-2 border-error" : "border-border-input focus-within:border-accent"
        )}
      >
        <input
          id={id}
          type={show ? "text" : "password"}
          aria-invalid={!!error}
          className="h-full flex-1 bg-transparent px-4 text-[16px] text-text outline-none"
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="flex h-full items-center px-3 text-text-muted"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </div>
      {error && <p className="text-sm text-error-text">{error}</p>}
    </div>
  );
}

export function SearchField({ id, className, ...rest }: TextProps) {
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" />
      <input
        id={id}
        type="search"
        className={cx(
          "h-11 w-full rounded-full border border-border-input bg-surface pl-11 pr-4 text-[15px] text-text placeholder:text-text-muted focus:border-accent",
          className
        )}
        {...rest}
      />
    </div>
  );
}

export function Textarea({
  label,
  error,
  id,
  className,
  ...rest
}: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-text">
          {label}
        </label>
      )}
      <textarea
        id={id}
        aria-invalid={!!error}
        className={cx(
          "min-h-[120px] rounded-[12px] border bg-surface px-4 py-3 text-[16px] text-text placeholder:text-text-muted",
          error ? "border-2 border-error" : "border-border-input focus:border-accent",
          className
        )}
        {...rest}
      />
      {error && <p className="text-sm text-error-text">{error}</p>}
    </div>
  );
}
