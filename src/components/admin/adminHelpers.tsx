import { Badge } from "@/components/ui/badge";

export function qualityBadge(q: string) {
  switch (q) {
    case "excellent":
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">Excellent</Badge>;
    case "good":
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30">Bon</Badge>;
    case "limited":
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30">Limité</Badge>;
    case "insufficient":
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30">Insuffisant</Badge>;
    default:
      return <Badge variant="outline">{q}</Badge>;
  }
}
