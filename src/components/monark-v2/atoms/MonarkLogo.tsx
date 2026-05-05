import { Link } from "react-router-dom";

interface MonarkLogoProps {
  size?: "sm" | "md" | "lg";
  withVersion?: boolean;
  href?: string;
}

const SIZE_MAP = {
  sm: { diamond: 12, text: "text-base" },
  md: { diamond: 16, text: "text-lg" },
  lg: { diamond: 20, text: "text-2xl" },
};

export function MonarkLogo({ size = "md", withVersion = true, href = "/v2" }: MonarkLogoProps) {
  const s = SIZE_MAP[size];
  const content = (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="inline-block rotate-45 shadow-inner"
        style={{
          width: s.diamond,
          height: s.diamond,
          background: "linear-gradient(135deg, #3B82F6, #2563EB)",
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.15)",
          borderRadius: 2,
        }}
      />
      <span className={`font-monarkSans font-semibold tracking-tight text-zinc-100 ${s.text}`}>
        Monark
      </span>
      {withVersion && (
        <span className="font-monarkMono text-xs text-zinc-500">v3.2</span>
      )}
    </span>
  );

  if (href) {
    return <Link to={href} className="inline-flex items-center">{content}</Link>;
  }
  return content;
}