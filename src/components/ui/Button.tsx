import clsx from "clsx";
import React from "react";

type Variant = "primary" | "ghost" | "danger" | "chip";
export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50 disabled:pointer-events-none",
        variant === "primary" &&
          "rounded-xl px-5 py-3 text-sm bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95",
        variant === "ghost" &&
          "rounded-xl px-5 py-3 text-sm bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest",
        variant === "danger" &&
          "rounded-xl px-5 py-3 text-sm bg-error text-on-error hover:opacity-90",
        variant === "chip" &&
          "rounded-full px-5 py-2 text-sm bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest",
        className,
      )}
    />
  );
}
