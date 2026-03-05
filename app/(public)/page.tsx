"use client";

import { useEffect, useState, useMemo } from "react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import ProductCard, { Category, Product } from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  Tag,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  handleGetAllCategories,
  handleGetProductsByStore,
} from "@/lib/actions/public-action";

const PAGE_SIZE = 15;

const AD_IMAGES = ["/ads/ad1.jpg", "/ads/ad2.jpg", "/ads/ad3.jpg"];

function AdSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((c) => (c + 1) % AD_IMAGES.length),
      4000
    );
    return () => clearInterval(timer);
  }, []);

  const prev = () =>
    setCurrent((c) => (c - 1 + AD_IMAGES.length) % AD_IMAGES.length);
  const next = () => setCurrent((c) => (c + 1) % AD_IMAGES.length);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-100 aspect-[3/1] sm:aspect-[4/1] select-none">
      {AD_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Advertisement ${i + 1}`}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
            i === current ? "opacity-100" : "opacity-0"
          )}
        />
      ))}

      {AD_IMAGES.every((s) => !s) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-amber-100 to-amber-50">
          <p className="text-sm text-amber-600 font-medium">
            Ad banner — add images to /public/ads/
          </p>
        </div>
      )}

      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors"
      >
        <ChevronLeftIcon size={14} />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors"
      >
        <ChevronRightIcon size={14} />
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {AD_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === current ? "w-4 bg-white" : "w-1.5 bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { selectedStore, loadingStores } = useStore();
  const { isAuthenticated } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProds, setLoadingProds] = useState(true);

  const storeCategories = useMemo(() => {
    if (!selectedStore) return [];
    const catIdsInStore = new Set(
      allProducts.map((p) =>
        typeof p.categoryId === "object" ? p.categoryId._id : p.categoryId
      )
    );
    return categories.filter((c) => catIdsInStore.has(c._id));
  }, [categories, allProducts, selectedStore]);

  const pagedProducts = allProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  const totalPages = Math.ceil(allProducts.length / PAGE_SIZE);

  useEffect(() => {
    (async () => {
      setLoadingCats(true);
      const res = await handleGetAllCategories();
      setCategories(res.success ? res.data ?? [] : []);
      setLoadingCats(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedStore) {
      setLoadingProds(false);
      return;
    }
    (async () => {
      setLoadingProds(true);
      setPage(1);
      const res = await handleGetProductsByStore(selectedStore._id);
      setAllProducts(res.success ? res.data ?? [] : []);
      setLoadingProds(false);
    })();
  }, [selectedStore?._id]);

  const paginationItems: { key: string; value: number | "…" }[] = [];
  if (totalPages > 1) {
    const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
    );
    pageNums.forEach((p, i) => {
      if (i > 0 && p - pageNums[i - 1] > 1) {
        paginationItems.push({ key: `ellipsis-${p}`, value: "…" });
      }
      paginationItems.push({ key: `page-${p}`, value: p });
    });
  }

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <AdSlider />

      {/* Categories */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Tag size={15} className="text-amber-500" />
          <h2 className="text-base font-bold tracking-tight text-slate-800">
            Categories
          </h2>
        </div>

        {loadingCats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : storeCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No categories available.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {storeCategories.map((cat) => (
              <CategoryCard
                key={cat._id}
                category={cat}
                storeId={selectedStore?._id ?? ""}
              />
            ))}
          </div>
        )}
      </section>

      {/* Products */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <PackageOpen size={15} className="text-amber-500" />
          <h2 className="text-base font-bold tracking-tight text-slate-800">
            For you
          </h2>
        </div>

        {loadingStores || loadingProds ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        ) : !selectedStore ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Select a store to see products.
          </div>
        ) : allProducts.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No products available in this store yet.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {pagedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={15} />
                </Button>

                {paginationItems.map(({ key, value }) =>
                  value === "…" ? (
                    <span
                      key={key}
                      className="px-1 text-muted-foreground text-sm"
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={key}
                      variant={page === value ? "default" : "outline"}
                      size="icon"
                      className={cn(
                        "h-9 w-9 rounded-xl text-sm",
                        page === value &&
                          "bg-[#F6B60D] hover:bg-amber-500 text-black border-transparent shadow-none"
                      )}
                      onClick={() => setPage(value)}
                    >
                      {value}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={15} />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
