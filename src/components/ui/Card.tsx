import clsx from "clsx";
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx("rounded-card bg-white border border-silver/70 shadow-card p-5", className)}>
      {children}
    </div>
  );
}
export function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-xs uppercase tracking-wider text-slate mb-2">{children}</div>;
}
