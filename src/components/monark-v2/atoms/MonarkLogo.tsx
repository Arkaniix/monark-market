import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import monarkLogoLight from "@/assets/logo.png";
import monarkLogoDark from "@/assets/logo-dark-text.png";

interface MonarkLogoProps {
  size?: "sm" | "md" | "lg";
  withVersion?: boolean;
  href?: string;
}

const IMG_SIZE_MAP = {
  sm: "h-8 w-auto",
  md: "h-10 w-auto",
  lg: "h-14 w-auto",
};

export function MonarkLogo({ size = "md", withVersion = true, href = "/v2" }: MonarkLogoProps) {
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "dark" ? monarkLogoLight : monarkLogoDark;
  const content = (
    <span className={`inline-flex items-center ${withVersion ? "gap-2" : "gap-0"}`}>
      <img src={logoSrc} alt="Monark" className={IMG_SIZE_MAP[size]} />
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