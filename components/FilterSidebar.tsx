"use client";

import { useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "./ProductCard";

export interface FilterState {
  subcategoryIds: string[];
  priceRange: [number, number];
  inStockOnly: boolean;
}

interface FilterSidebarProps {
  products: Product[];
  filters: FilterState;
  onChange: (f: FilterState) => void;
  className?: string;
}

/** Derive subcategory options from the product list */
function getSubcategories(products: Product[]) {
  const map = new Map<string, string>(); // id → name
  for (const p of products) {
    if (typeof p.subcategoryId === "object" && p.subcategoryId?._id) {
      map.set(p.subcategoryId._id, p.subcategoryId.name);
    }
  }
  return Array.from(map.entries()).map(([_id, name]) => ({ _id, name }));
}

/** Derive min/max price from the product list */
function getPriceRange(products: Product[]): [number, number] {
  if (!products.length) return [0, 10000];
  const prices = products.map((p) => p.price);
  return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
}

function activeFilterCount(filters: FilterState, bounds: [number, number]) {
  let n = 0;
  if (filters.subcategoryIds.length) n += filters.subcategoryIds.length;
  if (
    filters.priceRange[0] !== bounds[0] ||
    filters.priceRange[1] !== bounds[1]
  )
    n++;
  if (filters.inStockOnly) n++;
  return n;
}

export default function FilterSidebar({
  products,
  filters,
  onChange,
  className,
}: FilterSidebarProps) {
  const subcategories = useMemo(() => getSubcategories(products), [products]);
  const priceBounds = useMemo(() => getPriceRange(products), [products]);

  const activeCount = activeFilterCount(filters, priceBounds);

  const toggleSubcategory = (id: string) => {
    const next = filters.subcategoryIds.includes(id)
      ? filters.subcategoryIds.filter((s) => s !== id)
      : [...filters.subcategoryIds, id];
    onChange({ ...filters, subcategoryIds: next });
  };

  const resetAll = () =>
    onChange({
      subcategoryIds: [],
      priceRange: priceBounds,
      inStockOnly: false,
    });

  return (
    <aside
      className={cn(
        "flex flex-col gap-5 p-4 rounded-2xl border border-slate-100 bg-white",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-amber-500" />
          <span className="text-sm font-bold text-slate-800">Filters</span>
          {activeCount > 0 && (
            <Badge className="h-4 px-1.5 text-[10px] bg-amber-100 text-amber-700 border-amber-200">
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            <X size={11} />
            Clear
          </button>
        )}
      </div>

      {/* In stock only */}
      <div className="flex items-center gap-2.5">
        <Checkbox
          id="instock"
          checked={filters.inStockOnly}
          onCheckedChange={(v) => onChange({ ...filters, inStockOnly: !!v })}
          className="border-slate-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
        />
        <Label
          htmlFor="instock"
          className="text-sm text-slate-700 cursor-pointer select-none"
        >
          In stock only
        </Label>
      </div>

      {/* Price range */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Price range
        </p>
        <Slider
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={1}
          value={filters.priceRange}
          onValueChange={(v) =>
            onChange({ ...filters, priceRange: v as [number, number] })
          }
          className="[&_[role=slider]]:bg-amber-500 [&_[role=slider]]:border-amber-500"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Rs. {filters.priceRange[0].toLocaleString()}</span>
          <span>Rs. {filters.priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Subcategory
          </p>
          <div className="flex flex-col gap-2">
            {subcategories.map((sub) => (
              <div key={sub._id} className="flex items-center gap-2.5">
                <Checkbox
                  id={sub._id}
                  checked={filters.subcategoryIds.includes(sub._id)}
                  onCheckedChange={() => toggleSubcategory(sub._id)}
                  className="border-slate-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <Label
                  htmlFor={sub._id}
                  className="text-sm text-slate-700 cursor-pointer select-none leading-tight"
                >
                  {sub.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

export function applyFilters(
  products: Product[],
  filters: FilterState
): Product[] {
  return products.filter((p) => {
    // Price
    if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1])
      return false;
    // In stock
    if (filters.inStockOnly && p.quantity <= 0) return false;
    // Subcategory
    if (filters.subcategoryIds.length > 0) {
      const subId =
        typeof p.subcategoryId === "object"
          ? p.subcategoryId._id
          : p.subcategoryId;
      if (!filters.subcategoryIds.includes(subId)) return false;
    }
    return true;
  });
}
