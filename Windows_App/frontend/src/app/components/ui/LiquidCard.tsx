import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { cn } from "../../utils";

interface LiquidCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export function LiquidCard({ children, className, dark = false, ...props }: LiquidCardProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/40 shadow-xl backdrop-blur-xl",
        dark
          ? "bg-black/40 border-white/10 text-white"
          : "bg-white/20 border-white/40 text-slate-800",
        className
      )}
      style={{
        boxShadow: dark
          ? "0 8px 32px 0 rgba(0, 0, 0, 0.5)"
          : "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {/* Glossy reflection effect */}
      <div className="pointer-events-none absolute -inset-full top-0 block -skew-y-12 bg-gradient-to-r from-transparent to-white opacity-20" />

      {children}
    </motion.div>
  );
}
