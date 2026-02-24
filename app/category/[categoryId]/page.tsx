"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import ProductCard, { Product } from "@/components/ProductCard";
import FilterSidebar, {
  applyFilters,
  FilterState,
} from "@/components/FilterSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PackageOpen, SlidersHorizontal } from "lucide-react";
import { handleGetProductsByStoreAndCategory } from "@/lib/actions/public-action";

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { selectedStore } = useStore();
  const { isAuthenticated } = useAuth();

  const categoryId = params.categoryId as string;
  const storeId = searchParams.get("storeId") ?? selectedStore?._id ?? "";
  const catName = searchParams.get("catName") ?? "Category";

  // All products for this store
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    subcategoryIds: [],
    priceRange: [0, 100000],
    inStockOnly: false,
  });

  useEffect(() => {
    if (!storeId || !categoryId) return;
    (async () => {
      setLoading(true);
      const res = await handleGetProductsByStoreAndCategory(
        storeId,
        categoryId
      );
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
  }, [storeId, categoryId]);

  // Apply sidebar filters
  const filtered = useMemo(
    () => applyFilters(allProducts, filters),
    [allProducts, filters]
  );

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
          {selectedStore && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">{selectedStore.storeName}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{catName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {catName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedStore?.storeName}
            {!loading && (
              <>
                {" "}
                · {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              </>
            )}
          </p>
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

        {/* Products */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-2xl" />
              ))}
            </div>
          ) : allProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
              <PackageOpen size={40} className="text-slate-300" />
              <p className="text-sm">
                No products in this category for this store.
              </p>
              <Button variant="outline" className="rounded-xl mt-2" asChild>
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
              <PackageOpen size={40} className="text-slate-300" />
              <p className="text-sm">No products match the selected filters.</p>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl mt-2"
                onClick={() =>
                  setFilters({
                    subcategoryIds: [],
                    priceRange: [0, 100000],
                    inStockOnly: false,
                  })
                }
              >
                Clear filters
              </Button>
            </div>
          ) : (
            productGrid
          )}
        </div>
      </div>
    </div>
  );
}
