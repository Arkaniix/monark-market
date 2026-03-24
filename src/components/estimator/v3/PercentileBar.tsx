import type { V3Distribution } from "@/types/estimatorV3";

interface PercentileBarProps {
  distribution: V3Distribution;
  userPrice: number;
  verdictColor: string;
}

export default function PercentileBar({ distribution, userPrice, verdictColor }: PercentileBarProps) {
  const min = distribution.p10 * 0.9;
  const max = distribution.p90 * 1.1;
  const range = max - min;

  const toPercent = (val: number) => Math.max(0, Math.min(100, ((val - min) / range) * 100));

  const points = [
    { label: `${distribution.p10}€`, pos: toPercent(distribution.p10), key: "P10" },
    { label: `${distribution.p25}€`, pos: toPercent(distribution.p25), key: "P25" },
    { label: `${distribution.p50}€`, pos: toPercent(distribution.p50), key: "Médiane" },
    { label: `${distribution.p75}€`, pos: toPercent(distribution.p75), key: "P75" },
    { label: `${distribution.p90}€`, pos: toPercent(distribution.p90), key: "P90" },
  ];

  const userPos = toPercent(userPrice);

  const colorMap: Record<string, string> = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };

  const markerColor = colorMap[verdictColor] || "bg-primary";

  return (
    <div className="space-y-3">
      <div className="relative h-12 mt-6 mb-8">
        {/* Bar track */}
        <div className="absolute top-5 left-0 right-0 h-2 bg-muted rounded-full" />
        {/* IQR highlight */}
        <div
          className="absolute top-5 h-2 bg-primary/20 rounded-full"
          style={{
            left: `${toPercent(distribution.p25)}%`,
            width: `${toPercent(distribution.p75) - toPercent(distribution.p25)}%`,
          }}
        />

        {/* Percentile dots */}
        {points.map((pt) => (
          <div
            key={pt.key}
            className="absolute flex flex-col items-center"
            style={{ left: `${pt.pos}%`, transform: "translateX(-50%)" }}
          >
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{pt.label}</span>
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 mt-1" />
            <span className="text-[9px] text-muted-foreground mt-0.5 hidden sm:block">{pt.key}</span>
          </div>
        ))}

        {/* User price marker */}
        <div
          className="absolute flex flex-col items-center z-10"
          style={{ left: `${userPos}%`, transform: "translateX(-50%)", top: "-4px" }}
        >
          <div className={`w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent ${markerColor.replace("bg-", "border-t-")}`} />
          <div className={`w-3.5 h-3.5 rounded-full ${markerColor} ring-2 ring-background shadow-md`} />
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">{userPrice}€</span>
        </div>
      </div>
    </div>
  );
}
