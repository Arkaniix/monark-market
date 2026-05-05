interface TickerLineProps {
  symbol: string;
  direction: "up" | "down";
  changePercent: number;
  price: number;
  trend?: number[];
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  if (!points || points.length < 2) return null;
  const w = 36;
  const h = 12;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const d = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TickerLine({ symbol, direction, changePercent, price, trend }: TickerLineProps) {
  const isUp = direction === "up";
  const colorClass = isUp ? "text-monark-bull" : "text-monark-bear";
  const stroke = isUp ? "#10B981" : "#EF4444";
  const arrow = isUp ? "▲" : "▼";
  const sign = changePercent > 0 ? "+" : "";

  return (
    <span className="inline-flex items-center gap-3 whitespace-nowrap font-monarkMono text-sm text-zinc-300">
      <span>{symbol}</span>
      <span className={colorClass}>
        {arrow} {sign}
        {changePercent.toFixed(2)}%
      </span>
      <span className="text-zinc-200">{price.toFixed(2)} €</span>
      {trend && trend.length >= 2 && (
        <span className={colorClass}>
          <Sparkline points={trend} color={stroke} />
        </span>
      )}
    </span>
  );
}