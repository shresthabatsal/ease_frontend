"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import {
  CategoryData,
  PaginationData,
  ProductData,
  StoreData,
} from "./_components/ProductForm";
import {
  handleGetAllCategories,
  handleGetAllProducts,
  handleGetAllStores,
  handleGetProductsByStore,
} from "@/lib/actions/admin/product-action";
import { CreateProductDialog } from "./_components/CreateProductDialog";
import { ProductsTable } from "./_components/ProductTable";
import { ViewProductDialog } from "./_components/ViewProductDialog";
import { EditProductDialog } from "./_components/EditProductDialog";
import { DeleteProductDialog } from "./_components/DeleteProductDialog";

type DialogMode = "view" | "edit" | "delete" | null;

const DEFAULT_PAGINATION: PaginationData = {
  total: 0,
  page: 1,
  size: 10,
  totalPages: 1,
};

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [pagination, setPagination] =
    useState<PaginationData>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    storeId?: string;
    categoryId?: string;
  }>({});
  const [sortBy, setSortBy] = useState<"name" | "price" | "quantity">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Dropdown data for filters
  const [stores, setStores] = useState<StoreData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null
  );
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);

  // Load filter dropdowns
  useEffect(() => {
    async function loadFilters() {
      const [storesRes, categoriesRes] = await Promise.all([
        handleGetAllStores(),
        handleGetAllCategories(),
      ]);

      if (storesRes.success) setStores(storesRes.data || []);
      if (categoriesRes.success) setCategories(categoriesRes.data || []);
    }
    loadFilters();
  }, []);

  // Load products from backend
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      let result;

      // Use store endpoint if filtering by store
      if (filters.storeId) {
        result = await handleGetProductsByStore(filters.storeId);
        if (result.success) {
          setAllProducts(result.data ?? []);
        }
      } else {
        result = await handleGetAllProducts({
          page: 1,
          size: 1000, // Get all products for client-side filtering
          search: "",
        });
        if (result.success) {
          setAllProducts(result.data ?? []);
        }
      }

      if (!result.success) {
        toast.error(result.message || "Failed to load products");
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [filters.storeId]);

  // Apply filters, search, sort, and pagination client-side
  useEffect(() => {
    let filtered = [...allProducts];

    // Filter by category (client-side)
    if (filters.categoryId) {
      filtered = filtered.filter((p) => {
        const catId =
          typeof p.categoryId === "object" && p.categoryId
            ? p.categoryId._id
            : p.categoryId;
        return String(catId) === String(filters.categoryId);
      });
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy];
      let bVal: any = b[sortBy];

      if (sortBy === "name") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / 10);
    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 10;
    const paginatedProducts = filtered.slice(startIndex, endIndex);

    setProducts(paginatedProducts);
    setPagination({
      total,
      page,
      size: 10,
      totalPages: totalPages || 1,
    });
  }, [allProducts, filters.categoryId, search, sortBy, sortOrder, page]);

  // Load products when store filter changes
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setPage(1);
  }, [filters, search, sortBy, sortOrder]);

  // Handlers
  function handlePageChange(newPage: number) {
    setPage(newPage);
  }

  function handleFilterChange(newFilters: {
    storeId?: string;
    categoryId?: string;
  }) {
    setFilters(newFilters);
  }

  function handleSortChange(
    newSortBy: "name" | "price" | "quantity",
    newSortOrder: "asc" | "desc"
  ) {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }

  function openDialog(mode: DialogMode, product: ProductData) {
    setSelectedProduct(product);
    setDialogMode(mode);
  }

  function closeDialog() {
    setDialogMode(null);
    setSelectedProduct(null);
  }

  function handleSuccess() {
    closeDialog();
    loadProducts();
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Products
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your product catalogue — create, edit, and remove products.
        </p>
      </div>

      {/* Toolbar: search + create button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="pl-8"
          />
        </div>

        <CreateProductDialog onSuccess={handleSuccess} />
      </div>

      {/* Table with filters */}
      <ProductsTable
        products={products}
        pagination={pagination}
        stores={stores}
        categories={categories}
        onPageChange={handlePageChange}
        onRowClick={(p) => openDialog("view", p)}
        onEdit={(p) => openDialog("edit", p)}
        onDelete={(p) => openDialog("delete", p)}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        currentFilters={filters}
        currentSort={{ sortBy, sortOrder }}
        isLoading={isLoading}
      />

      {/* Dialogs */}
      <ViewProductDialog
        product={selectedProduct}
        open={dialogMode === "view"}
        onClose={closeDialog}
      />

      <EditProductDialog
        product={selectedProduct}
        open={dialogMode === "edit"}
        onClose={closeDialog}
        onSuccess={handleSuccess}
      />

      <DeleteProductDialog
        product={selectedProduct}
        open={dialogMode === "delete"}
        onClose={closeDialog}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
