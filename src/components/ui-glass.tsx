import { motion } from "framer-motion";
import { AlertCircle, Inbox, RotateCw } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, right }: {
  eyebrow?: string; title: string; description?: string; right?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"
    >
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>}
        <h1 className="text-gradient text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">{description}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </motion.div>
  );
}

export function GlassCard({ children, className = "", delay = 0 }: {
  children: ReactNode; className?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`glass p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon?: ReactNode; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="glass flex flex-col items-center justify-center gap-4 p-12 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/10 text-primary">
        {icon ?? <Inbox className="h-7 w-7" />}
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="mt-1 max-w-sm text-sm text-white/60">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ title, message, onRetry }: {
  title?: string; message: string; onRetry?: () => void;
}) {
  return (
    <div className="glass flex items-center gap-4 p-5 text-sm">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-danger/20 text-danger">
        <AlertCircle className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <p className="text-white/70">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="glass-strong flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition hover:scale-105"
        >
          <RotateCw className="h-3.5 w-3.5" /> Retry
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}
