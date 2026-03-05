"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  Trash2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CategoryData } from "./_components/category/CategoryForm";
import {
  handleGetAllCategories,
  handleGetAllSubcategories,
} from "@/lib/actions/admin/category-action";
import { CreateCategoryDialog } from "./_components/category/CreateCategoryDialog";
import { DeleteCategoryDialog } from "./_components/category/DeleteCategoryDialog";
import { EditSubcategoryDialog } from "./_components/subcategory/EditSubCategoryDialog";
import { CreateSubcategoryDialog } from "./_components/subcategory/CreateSubCategoryDialog";
import { SubcategoryData } from "./_components/subcategory/SubCategoryForm";
import { EditCategoryDialog } from "./_components/category/EditCategoryDialog";
import { DeleteSubcategoryDialog } from "./_components/subcategory/DeleteSubCategoryDialog";

const IMAGE_BASE_URL = "http://localhost:5050";
const PAGE_SIZE_OPTIONS = [5, 10, 20];

type CategoryDialog = "edit" | "delete" | null;
type SubcategoryDialog = "edit" | "delete" | null;
type SortField = "name" | "date";
type SortOrder = "asc" | "desc";

function Pagination({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalItems,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  totalItems: number;
}) {
  if (totalItems === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  // Generate page numbers to show
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4 flex-wrap gap-3">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>
          {from}–{to} of {totalItems}
        </span>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => {
            onPageSizeChange(Number(v));
            onPageChange(1);
          }}
        >
          <SelectTrigger className="h-7 w-20 rounded-lg text-xs border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {PAGE_SIZE_OPTIONS.map((s) => (
              <SelectItem key={s} value={String(s)} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-lg"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft size={13} />
        </Button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-400">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={page === p ? "default" : "outline"}
              size="icon"
              className={`h-7 w-7 rounded-lg text-xs ${
                page === p
                  ? "bg-amber-400 hover:bg-amber-500 border-amber-400 text-black"
                  : ""
              }`}
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-lg"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight size={13} />
        </Button>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryData[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(true);

  // Search, Sort and Filter for Categories
  const [categorySearch, setCategorySearch] = useState("");
  const [categorySortField, setCategorySortField] = useState<SortField>("name");
  const [categorySortOrder, setCategorySortOrder] = useState<SortOrder>("asc");
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryPageSize, setCategoryPageSize] = useState(5);

  // Search, Sort and Filter for Subcategories
  const [subcategorySearch, setSubcategorySearch] = useState("");
  const [subcategoryFilterCategory, setSubcategoryFilterCategory] =
    useState<string>("all");
  const [subcategorySortField, setSubcategorySortField] =
    useState<SortField>("name");
  const [subcategorySortOrder, setSubcategorySortOrder] =
    useState<SortOrder>("asc");
  const [subcategoryPage, setSubcategoryPage] = useState(1);
  const [subcategoryPageSize, setSubcategoryPageSize] = useState(5);

  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(
    null
  );
  const [categoryDialog, setCategoryDialog] = useState<CategoryDialog>(null);
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<SubcategoryData | null>(null);
  const [subcategoryDialog, setSubcategoryDialog] =
    useState<SubcategoryDialog>(null);

  async function loadCategories() {
    setIsLoadingCategories(true);
    try {
      const result = await handleGetAllCategories();
      if (result.success) setCategories(result.data || []);
      else toast.error(result.message);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  }

  async function loadSubcategories() {
    setIsLoadingSubcategories(true);
    try {
      const result = await handleGetAllSubcategories();
      if (result.success) setSubcategories(result.data || []);
      else toast.error(result.message);
    } catch {
      toast.error("Failed to load subcategories");
    } finally {
      setIsLoadingSubcategories(false);
    }
  }

  useEffect(() => {
    loadCategories();
    loadSubcategories();
  }, []);

  function handleSuccess() {
    loadCategories();
    loadSubcategories();
    setCategoryDialog(null);
    setSubcategoryDialog(null);
  }

  function getCategoryName(categoryId: any): string {
    if (typeof categoryId === "object" && categoryId?.name)
      return categoryId.name;
    const cat = categories.find((c) => c._id === categoryId);
    return cat?.name || "—";
  }

  // Reset page when search/filter changes
  useEffect(() => {
    setCategoryPage(1);
  }, [categorySearch, categorySortField, categorySortOrder]);
  useEffect(() => {
    setSubcategoryPage(1);
  }, [
    subcategorySearch,
    subcategoryFilterCategory,
    subcategorySortField,
    subcategorySortOrder,
  ]);

  // Filtered and sorted
  const allFilteredCategories = useMemo(() => {
    let filtered = [...categories];
    if (categorySearch)
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(categorySearch.toLowerCase())
      );
    filtered.sort((a, b) => {
      const aVal =
        categorySortField === "name"
          ? a.name.toLowerCase()
          : new Date(a.createdAt).getTime();
      const bVal =
        categorySortField === "name"
          ? b.name.toLowerCase()
          : new Date(b.createdAt).getTime();
      return categorySortOrder === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
        ? 1
        : -1;
    });
    return filtered;
  }, [categories, categorySearch, categorySortField, categorySortOrder]);

  const allFilteredSubcategories = useMemo(() => {
    let filtered = [...subcategories];
    if (subcategoryFilterCategory !== "all")
      filtered = filtered.filter((s) => {
        const catId =
          typeof s.categoryId === "object" ? s.categoryId._id : s.categoryId;
        return catId === subcategoryFilterCategory;
      });
    if (subcategorySearch)
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(subcategorySearch.toLowerCase())
      );
    filtered.sort((a, b) => {
      const aVal =
        subcategorySortField === "name"
          ? a.name.toLowerCase()
          : new Date(a.createdAt).getTime();
      const bVal =
        subcategorySortField === "name"
          ? b.name.toLowerCase()
          : new Date(b.createdAt).getTime();
      return subcategorySortOrder === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
        ? 1
        : -1;
    });
    return filtered;
  }, [
    subcategories,
    subcategorySearch,
    subcategoryFilterCategory,
    subcategorySortField,
    subcategorySortOrder,
  ]);

  // Paginated slices
  const categoryTotalPages = Math.max(
    1,
    Math.ceil(allFilteredCategories.length / categoryPageSize)
  );
  const filteredCategories = allFilteredCategories.slice(
    (categoryPage - 1) * categoryPageSize,
    categoryPage * categoryPageSize
  );

  const subcategoryTotalPages = Math.max(
    1,
    Math.ceil(allFilteredSubcategories.length / subcategoryPageSize)
  );
  const filteredSubcategories = allFilteredSubcategories.slice(
    (subcategoryPage - 1) * subcategoryPageSize,
    subcategoryPage * subcategoryPageSize
  );

  function handleCategorySort(field: SortField) {
    if (categorySortField === field)
      setCategorySortOrder(categorySortOrder === "asc" ? "desc" : "asc");
    else {
      setCategorySortField(field);
      setCategorySortOrder("asc");
    }
  }
  function handleSubcategorySort(field: SortField) {
    if (subcategorySortField === field)
      setSubcategorySortOrder(subcategorySortOrder === "asc" ? "desc" : "asc");
    else {
      setSubcategorySortField(field);
      setSubcategorySortOrder("asc");
    }
  }
  const getSortIcon = (
    field: SortField,
    currentField: SortField,
    currentOrder: SortOrder
  ) => {
    if (currentField !== field) return <ArrowUpDown className="h-3 w-3 ml-1" />;
    return currentOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  // ── Category list ──────────────────────────────────────────────────────────
  const CategoryList = () => (
    <>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="Search categories..."
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCategorySort("name")}
            className="gap-1"
          >
            Name{getSortIcon("name", categorySortField, categorySortOrder)}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCategorySort("date")}
            className="gap-1"
          >
            Date{getSortIcon("date", categorySortField, categorySortOrder)}
          </Button>
        </div>
      </div>

      {isLoadingCategories ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : allFilteredCategories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {categorySearch
            ? "No categories found."
            : "No categories yet. Create one to get started."}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                {category.categoryImage && (
                  <div className="h-16 w-16 rounded-md overflow-hidden border flex-shrink-0 bg-muted">
                    <img
                      src={`${IMAGE_BASE_URL}${category.categoryImage}`}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{category.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {
                      subcategories.filter((s) => {
                        const catId =
                          typeof s.categoryId === "object"
                            ? s.categoryId._id
                            : s.categoryId;
                        return catId === category._id;
                      }).length
                    }{" "}
                    subcategories
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setSelectedCategory(category);
                      setCategoryDialog("edit");
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      setSelectedCategory(category);
                      setCategoryDialog("delete");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={categoryPage}
            totalPages={categoryTotalPages}
            pageSize={categoryPageSize}
            totalItems={allFilteredCategories.length}
            onPageChange={setCategoryPage}
            onPageSizeChange={setCategoryPageSize}
          />
        </>
      )}
    </>
  );

  // Subcategory list
  const SubcategoryList = () => (
    <>
      <div className="flex flex-col gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={subcategorySearch}
            onChange={(e) => setSubcategorySearch(e.target.value)}
            placeholder="Search subcategories..."
            className="pl-8"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={subcategoryFilterCategory}
            onValueChange={setSubcategoryFilterCategory}
          >
            <SelectTrigger className="sm:w-[200px]">
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSubcategorySort("name")}
              className="gap-1 flex-1 sm:flex-none"
            >
              Name
              {getSortIcon("name", subcategorySortField, subcategorySortOrder)}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSubcategorySort("date")}
              className="gap-1 flex-1 sm:flex-none"
            >
              Date
              {getSortIcon("date", subcategorySortField, subcategorySortOrder)}
            </Button>
          </div>
          {subcategoryFilterCategory !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSubcategoryFilterCategory("all")}
              className="gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {isLoadingSubcategories ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : allFilteredSubcategories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {subcategorySearch || subcategoryFilterCategory !== "all"
            ? "No subcategories found."
            : "No subcategories yet. Create one to get started."}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filteredSubcategories.map((subcategory) => (
              <div
                key={subcategory._id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{subcategory.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryName(subcategory.categoryId)}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setSelectedSubcategory(subcategory);
                      setSubcategoryDialog("edit");
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      setSelectedSubcategory(subcategory);
                      setSubcategoryDialog("delete");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={subcategoryPage}
            totalPages={subcategoryTotalPages}
            pageSize={subcategoryPageSize}
            totalItems={allFilteredSubcategories.length}
            onPageChange={setSubcategoryPage}
            onPageSizeChange={setSubcategoryPageSize}
          />
        </>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Categories & Subcategories
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Organize your products into categories and subcategories.
        </p>
      </div>

      {/* Desktop: side by side */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Manage product categories
                  {allFilteredCategories.length > 0 && (
                    <span className="ml-1 text-slate-400">
                      · {allFilteredCategories.length} total
                    </span>
                  )}
                </CardDescription>
              </div>
              <CreateCategoryDialog onSuccess={handleSuccess} />
            </div>
          </CardHeader>
          <CardContent>
            <CategoryList />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subcategories</CardTitle>
                <CardDescription>
                  Manage product subcategories
                  {allFilteredSubcategories.length > 0 && (
                    <span className="ml-1 text-slate-400">
                      · {allFilteredSubcategories.length} total
                    </span>
                  )}
                </CardDescription>
              </div>
              <CreateSubcategoryDialog
                categories={categories}
                onSuccess={handleSuccess}
              />
            </div>
          </CardHeader>
          <CardContent>
            <SubcategoryList />
          </CardContent>
        </Card>
      </div>

      {/* Mobile/Tablet: tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">
              Categories ({allFilteredCategories.length})
            </TabsTrigger>
            <TabsTrigger value="subcategories">
              Subcategories ({allFilteredSubcategories.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="categories" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Categories</CardTitle>
                  <CreateCategoryDialog onSuccess={handleSuccess} />
                </div>
              </CardHeader>
              <CardContent>
                <CategoryList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="subcategories" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Subcategories</CardTitle>
                  <CreateSubcategoryDialog
                    categories={categories}
                    onSuccess={handleSuccess}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <SubcategoryList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <EditCategoryDialog
        category={selectedCategory}
        open={categoryDialog === "edit"}
        onClose={() => setCategoryDialog(null)}
        onSuccess={handleSuccess}
      />
      <DeleteCategoryDialog
        category={selectedCategory}
        open={categoryDialog === "delete"}
        onClose={() => setCategoryDialog(null)}
        onSuccess={handleSuccess}
      />
      <EditSubcategoryDialog
        subcategory={selectedSubcategory}
        categories={categories}
        open={subcategoryDialog === "edit"}
        onClose={() => setSubcategoryDialog(null)}
        onSuccess={handleSuccess}
      />
      <DeleteSubcategoryDialog
        subcategory={selectedSubcategory}
        open={subcategoryDialog === "delete"}
        onClose={() => setSubcategoryDialog(null)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
