"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import ProductCard, { Product } from "@/components/ProductCard";
import FilterSidebar, {
  applyFilters,
  FilterState,
} from "@/components/FilterSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PackageOpen, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { handleGetProductsByStore } from "@/lib/actions/public-action";

function matchesQuery(product: Product, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return (
    product.name.toLowerCase().includes(q) ||
    product.description.toLowerCase().includes(q) ||
    (typeof product.categoryId === "object" &&
      product.categoryId.name.toLowerCase().includes(q)) ||
    (typeof product.subcategoryId === "object" &&
      product.subcategoryId.name.toLowerCase().includes(q))
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { selectedStore } = useStore();
  const { isAuthenticated } = useAuth();

  const query = searchParams.get("q") ?? "";
  const storeId = searchParams.get("storeId") ?? selectedStore?._id ?? "";

  // All products fetched for the store
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    subcategoryIds: [],
    priceRange: [0, 100000],
    inStockOnly: false,
  });

  // Fetch all products for the store
  useEffect(() => {
    if (!storeId) return;
    (async () => {
      setLoading(true);
      const res = await handleGetProductsByStore(storeId);
      const products = res.success ? res.data ?? [] : [];
      setAllProducts(products);

      if (products.length) {
        const prices = products.map((p: Product) => p.price);
        setFilters((f) => ({
          ...f,
          priceRange: [
            Math.floor(Math.min(...prices)),
            Math.ceil(Math.max(...prices)),
          ],
        }));
      }
      setLoading(false);
    })();
  }, [storeId]);

  // Apply search query, then apply sidebar filters
  const filtered = useMemo(() => {
    const afterSearch = allProducts.filter((p) => matchesQuery(p, query));
    return applyFilters(afterSearch, filters);
  }, [allProducts, query, filters]);

  const storeName = selectedStore?.storeName ?? "Store";

  const productGrid = (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {filtered.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Search</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Search size={20} className="text-amber-500 flex-shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {query ? `"${query}"` : "Search"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {storeName}
              {!loading && (
                <>
                  {" "}
                  · {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Mobile filter trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden rounded-xl gap-2"
            >
              <SlidersHorizontal size={14} />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0 overflow-y-auto">
            <div className="p-4">
              <FilterSidebar
                products={allProducts}
                filters={filters}
                onChange={setFilters}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Body */}
      <div className="flex gap-6 items-start">
        {/* Desktop sidebar */}
        <FilterSidebar
          products={allProducts}
          filters={filters}
          onChange={setFilters}
          className="hidden lg:flex w-56 flex-shrink-0 sticky top-24"
        />

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
              <PackageOpen size={40} className="text-slate-300" />
              <p className="text-sm text-center">
                No products found for{" "}
                <span className="font-semibold text-slate-600">"{query}"</span>{" "}
                in {storeName}.
              </p>
              <Link
                href="/"
                className="mt-2 text-sm font-medium text-amber-600 hover:underline"
              >
                Browse all products
              </Link>
            </div>
          ) : (
            productGrid
          )}
        </div>
      </div>
    </div>
  );
}
