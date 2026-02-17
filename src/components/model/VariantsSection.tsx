import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ModelVariant } from "@/providers/types";

interface VariantsSectionProps {
  variants: ModelVariant[];
  variantsCount: number;
}

type SortKey = "brand" | "variant_name" | "boost_clock_mhz" | "length_mm" | "price_usd";
type SortDir = "asc" | "desc";

export function VariantsSection({ variants, variantsCount }: VariantsSectionProps) {
  const [sortKey, setSortKey] = useState<SortKey>("brand");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [brandFilter, setBrandFilter] = useState("all");

  const uniqueBrands = useMemo(
    () => [...new Set(variants.map((v) => v.brand))].sort(),
    [variants]
  );

  const filtered = useMemo(() => {
    let items = [...variants];
    if (brandFilter !== "all") {
      items = items.filter((v) => v.brand === brandFilter);
    }
    items.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return items;
  }, [variants, brandFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortHeader = ({ label, colKey }: { label: string; colKey: SortKey }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground -ml-2 px-2"
      onClick={() => toggleSort(colKey)}
    >
      {label}
      <ArrowUpDown className={`ml-1 h-3 w-3 ${sortKey === colKey ? "text-primary" : "opacity-40"}`} />
    </Button>
  );

  const fmt = (val: number | null | undefined, suffix: string) =>
    val != null ? `${val.toLocaleString("fr-FR")} ${suffix}` : "—";

  const fmtPrice = (val: number | null | undefined) =>
    val != null ? `~${Math.round(val)}$` : "—";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            {variantsCount} variantes constructeur
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Toutes les marques" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes ({variants.length})</SelectItem>
                {uniqueBrands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b} ({variants.filter((v) => v.brand === b).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-md border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[100px]">
                  <SortHeader label="Marque" colKey="brand" />
                </TableHead>
                <TableHead>
                  <SortHeader label="Modèle" colKey="variant_name" />
                </TableHead>
                <TableHead className="text-right">
                  <SortHeader label="Boost Clock" colKey="boost_clock_mhz" />
                </TableHead>
                <TableHead className="text-right">
                  <SortHeader label="Longueur" colKey="length_mm" />
                </TableHead>
                <TableHead>Couleur</TableHead>
                <TableHead className="text-right">
                  <SortHeader label="Prix neuf réf." colKey="price_usd" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v, i) => (
                <TableRow key={`${v.brand}-${v.variant_name}-${i}`} className="hover:bg-muted/40">
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-medium">
                      {v.brand}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{v.variant_name}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {fmt(v.boost_clock_mhz, "MHz")}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {fmt(v.length_mm, "mm")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {v.color || "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {fmtPrice(v.price_usd)}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucune variante pour cette marque.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-3 italic">
          💡 Les prix sont indicatifs (prix neuf PCPartPicker en USD) et ne reflètent pas les prix d'occasion Monark.
        </p>
      </CardContent>
    </Card>
  );
}
