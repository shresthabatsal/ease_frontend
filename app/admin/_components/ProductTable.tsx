"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  ProductData,
  PaginationData,
  StoreData,
  CategoryData,
} from "./ProductForm";

const IMAGE_BASE_URL = "http://localhost:5050";
const PLACEHOLDER_IMAGE = "/placeholder-product.png";

interface ProductsTableProps {
  products: ProductData[];
  pagination: PaginationData;
  stores: StoreData[];
  categories: CategoryData[];
  onPageChange: (page: number) => void;
  onRowClick: (product: ProductData) => void;
  onEdit: (product: ProductData) => void;
  onDelete: (product: ProductData) => void;
  onFilterChange: (filters: { storeId?: string; categoryId?: string }) => void;
  onSortChange: (
    sortBy: "name" | "price" | "quantity",
    sortOrder: "asc" | "desc"
  ) => void;
  currentFilters: { storeId?: string; categoryId?: string };
  currentSort: {
    sortBy: "name" | "price" | "quantity";
    sortOrder: "asc" | "desc";
  };
  isLoading?: boolean;
}

// Helper to extract names
function getStoreName(storeId: any): string {
  if (!storeId) return "—";
  if (typeof storeId === "object" && storeId.storeName)
    return storeId.storeName;
  return "—";
}

function getCategoryName(categoryId: any): string {
  if (!categoryId) return "—";
  if (typeof categoryId === "object" && categoryId.name) return categoryId.name;
  return "—";
}

function getSubcategoryName(subcategoryId: any): string {
  if (!subcategoryId) return "—";
  if (typeof subcategoryId === "object" && subcategoryId.name)
    return subcategoryId.name;
  return "—";
}

export function ProductsTable({
  products,
  pagination,
  stores,
  categories,
  onPageChange,
  onRowClick,
  onEdit,
  onDelete,
  onFilterChange,
  onSortChange,
  currentFilters,
  currentSort,
  isLoading = false,
}: ProductsTableProps) {
  const { page, totalPages, total, size } = pagination;
  const startItem = (page - 1) * size + 1;
  const endItem = Math.min(page * size, total);

  const hasStoreFilter = !!currentFilters.storeId;
  const hasCategoryFilter = !!currentFilters.categoryId;

  const handleSort = (field: "name" | "price" | "quantity") => {
    if (currentSort.sortBy === field) {
      // Toggle order
      onSortChange(field, currentSort.sortOrder === "asc" ? "desc" : "asc");
    } else {
      // New field, default to asc
      onSortChange(field, "asc");
    }
  };

  const getSortIcon = (field: "name" | "price" | "quantity") => {
    if (currentSort.sortBy !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1" />;
    }
    return currentSort.sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/50 rounded-md">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <Select
          value={currentFilters.storeId || "all"}
          onValueChange={(value) =>
            onFilterChange({
              ...currentFilters,
              storeId: value === "all" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Stores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store._id} value={store._id}>
                {store.storeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentFilters.categoryId || "all"}
          onValueChange={(value) =>
            onFilterChange({
              ...currentFilters,
              categoryId: value === "all" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(hasStoreFilter || hasCategoryFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange({})}
            className="gap-1"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center hover:text-foreground transition-colors font-medium"
                >
                  Product
                  {getSortIcon("name")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("price")}
                  className="flex items-center hover:text-foreground transition-colors font-medium"
                >
                  Price
                  {getSortIcon("price")}
                </button>
              </TableHead>
              {!hasCategoryFilter && (
                <TableHead className="hidden lg:table-cell">Category</TableHead>
              )}
              <TableHead className="hidden md:table-cell">
                Subcategory
              </TableHead>
              {!hasStoreFilter && (
                <TableHead className="hidden sm:table-cell">Store</TableHead>
              )}
              <TableHead className="hidden xl:table-cell">
                <button
                  onClick={() => handleSort("quantity")}
                  className="flex items-center hover:text-foreground transition-colors font-medium"
                >
                  Stock
                  {getSortIcon("quantity")}
                </button>
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && products.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              products.map((product) => {
                const imageSrc = product.productImage
                  ? `${IMAGE_BASE_URL}${product.productImage}`
                  : PLACEHOLDER_IMAGE;

                return (
                  <TableRow
                    key={product._id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onRowClick(product)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 rounded-md overflow-hidden border flex-shrink-0 bg-muted">
                          <img
                            src={imageSrc}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                        </div>
                        <span className="font-medium line-clamp-1">
                          {product.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="font-medium whitespace-nowrap">
                      NPR {product.price.toFixed(2)}
                    </TableCell>

                    {!hasCategoryFilter && (
                      <TableCell className="hidden lg:table-cell text-sm">
                        {getCategoryName(product.categoryId)}
                      </TableCell>
                    )}

                    <TableCell className="hidden md:table-cell text-sm">
                      {getSubcategoryName(product.subcategoryId)}
                    </TableCell>

                    {!hasStoreFilter && (
                      <TableCell className="hidden sm:table-cell text-sm">
                        {getStoreName(product.storeId)}
                      </TableCell>
                    )}

                    <TableCell className="hidden xl:table-cell">
                      <Badge
                        variant={
                          product.quantity > 0 ? "secondary" : "destructive"
                        }
                      >
                        {product.quantity > 0 ? `${product.quantity}` : "Out"}
                      </Badge>
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => onEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => onDelete(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {!isLoading && total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 text-sm text-muted-foreground">
          <span>
            Showing {startItem}–{endItem} of {total} products
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 font-medium text-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
