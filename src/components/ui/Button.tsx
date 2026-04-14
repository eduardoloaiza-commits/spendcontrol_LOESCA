import clsx from "clsx";
import React from "react";

type Variant = "primary" | "ghost" | "danger";
export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={clsx(
        "rounded-chip px-4 py-2 text-sm font-medium transition",
        variant === "primary" && "bg-ink text-white hover:bg-graphite",
        variant === "ghost" && "bg-mist text-ink hover:bg-silver/60",
        variant === "danger" && "bg-coral text-white hover:opacity-90",
        className,
      )}
    />
  );
}
