import { ReactNode, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Radar, RADAR } from "../../types/library";

export const PRIMARY =
  "bg-gradient-to-r from-indigo-400 to-violet-500 px-5 py-2.5 text-sm text-white shadow-[0_8px_30px_-8px_rgba(129,140,248,.8)]";
export const GHOST =
  "border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10";

export const Glass = ({
  children,
  className = "",
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
}) => (
  <div
    className={`relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl ${className}`}
    style={{
      boxShadow: `0 20px 60px -25px ${glow ?? "rgba(99,102,241,.35)"}, inset 0 1px 0 rgba(255,255,255,.06)`,
    }}
  >
    {children}
  </div>
);

export function GlowBadge({ level, text }: { level: Radar; text?: string }) {
  const r = RADAR[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${r.cls}`}
      style={{ boxShadow: `0 0 18px -4px ${r.c}` }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${level === "red" ? "animate-ping-slow" : ""}`}
        style={{ background: r.c, boxShadow: `0 0 8px ${r.c}` }}
      />
      {text ?? r.label}
    </span>
  );
}

export function Magnetic({
  children,
  className = "",
  onClick,
  disabled,
  type,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 14 });
  const sy = useSpring(y, { stiffness: 220, damping: 14 });
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <motion.button
      ref={ref}
      type={type ?? "button"}
      disabled={disabled}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.95 }}
      onMouseMove={(e) => {
        const b = ref.current!.getBoundingClientRect();
        x.set((e.clientX - b.left - b.width / 2) * 0.25);
        y.set((e.clientY - b.top - b.height / 2) * 0.35);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D14] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </motion.button>
  );
}