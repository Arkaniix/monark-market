import * as React from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost";

interface MonarkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: React.ReactNode;
}

const BASE =
  "relative inline-flex items-center justify-center px-6 py-3 rounded-lg font-monarkSans font-medium transition-all duration-200 hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 overflow-hidden group";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-monark-accent hover:bg-blue-600 text-white",
  secondary: "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-100",
  ghost: "bg-transparent border border-white/[0.08] hover:bg-white/[0.02] text-zinc-200",
};

export function MonarkButton({
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  children,
  ...rest
}: MonarkButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <span className="relative z-10">{children}</span>
      )}
      {variant === "primary" && !loading && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:animate-shimmer"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
          }}
        />
      )}
    </button>
  );
}