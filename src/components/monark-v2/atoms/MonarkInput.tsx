import * as React from "react";
import { Check, AlertCircle } from "lucide-react";

interface MonarkInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  valid?: boolean;
  helperText?: string;
}

export const MonarkInput = React.forwardRef<HTMLInputElement, MonarkInputProps>(
  ({ label, error, valid, helperText, className = "", id, ...rest }, ref) => {
    const inputId = id || React.useId();
    const hasError = !!error;

    return (
      <div className="w-full">
        <div className="relative group" style={{ height: 56 }}>
          <label
            htmlFor={inputId}
            className={`absolute top-2 left-4 text-xs tracking-wide transition-colors pointer-events-none ${
              hasError
                ? "text-monark-bear"
                : "text-zinc-500 group-focus-within:text-monark-accent"
            }`}
          >
            {label}
          </label>
          <input
            ref={ref}
            id={inputId}
            {...rest}
            className={`w-full h-full bg-white/[0.02] border ${
              hasError ? "border-monark-bear" : "border-white/[0.08]"
            } focus:border-monark-accent/40 focus:ring-1 focus:ring-monark-accent/20 px-4 pt-7 pb-3 rounded-lg font-monarkSans text-zinc-100 placeholder:text-zinc-600 outline-none transition-all duration-150 ${className}`}
          />
          {hasError && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-monark-bear" />
          )}
          {!hasError && valid && (
            <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-monark-bull/60" />
          )}
        </div>
        {(hasError || helperText) && (
          <p
            className={`text-xs mt-1 ${
              hasError ? "text-monark-bear" : "text-zinc-500"
            }`}
          >
            {hasError ? error : helperText}
          </p>
        )}
      </div>
    );
  }
);

MonarkInput.displayName = "MonarkInput";