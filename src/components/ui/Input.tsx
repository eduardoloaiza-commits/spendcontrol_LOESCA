import clsx from "clsx";
import React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={clsx(
          "w-full rounded-lg border border-silver bg-white px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-ink/10 focus:border-ink/40",
          className,
        )}
      />
    );
  },
);
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        {...props}
        className={clsx(
          "w-full rounded-lg border border-silver bg-white px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-ink/10 focus:border-ink/40",
          className,
        )}
      >
        {children}
      </select>
    );
  },
);
export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate mb-1">{children}</label>;
}
