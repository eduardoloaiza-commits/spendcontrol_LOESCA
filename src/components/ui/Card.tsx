import clsx from "clsx";

type Tone = "default" | "muted" | "hero";

export function Card({
  tone = "default",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "rounded-bento p-8 relative",
        tone === "default" && "bg-surface-container-lowest shadow-sm",
        tone === "muted" && "bg-surface-container-low",
        tone === "hero" &&
          "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-hero overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={clsx(
        "text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ChipTone = "neutral" | "primary" | "positive" | "negative";
export function Chip({
  tone = "neutral",
  className,
  children,
}: {
  tone?: ChipTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
        tone === "neutral" && "bg-surface-container-high text-on-surface-variant",
        tone === "primary" && "bg-primary-fixed text-on-primary-fixed-variant",
        tone === "positive" && "bg-tertiary-container/20 text-tertiary",
        tone === "negative" && "bg-error-container text-on-error-container",
        className,
      )}
    >
      {children}
    </span>
  );
}
