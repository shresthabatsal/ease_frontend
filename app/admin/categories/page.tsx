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
} from "lucide-react";
import { CategoryData } from "../_components/CategoryForm";
import { SubcategoryData } from "../_components/SubCategoryForm";
import {
  handleGetAllCategories,
  handleGetAllSubcategories,
} from "@/lib/actions/admin/category-action";
import { CreateCategoryDialog } from "../_components/CreateCategoryDialog";
import { CreateSubcategoryDialog } from "../_components/CreateSubCategoryDialog";
import { EditCategoryDialog } from "../_components/EditCategoryDialog";
import { DeleteCategoryDialog } from "../_components/DeleteCategoryDialog";
import { EditSubcategoryDialog } from "../_components/EditSubCategoryDialog";
import { DeleteSubcategoryDialog } from "../_components/DeleteSubCategoryDialog";
const IMAGE_BASE_URL = "http://localhost:5050";

type CategoryDialog = "edit" | "delete" | null;
type SubcategoryDialog = "edit" | "delete" | null;
type SortField = "name" | "date";
type SortOrder = "asc" | "desc";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryData[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(true);

  // Search & Sort for Categories
  const [categorySearch, setCategorySearch] = useState("");
  const [categorySortField, setCategorySortField] = useState<SortField>("name");
  const [categorySortOrder, setCategorySortOrder] = useState<SortOrder>("asc");

  // Search, Sort & Filter for Subcategories
  const [subcategorySearch, setSubcategorySearch] = useState("");
  const [subcategoryFilterCategory, setSubcategoryFilterCategory] =
    useState<string>("all");
  const [subcategorySortField, setSubcategorySortField] =
    useState<SortField>("name");
  const [subcategorySortOrder, setSubcategorySortOrder] =
    useState<SortOrder>("asc");

  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(
    null
  );
  const [categoryDialog, setCategoryDialog] = useState<CategoryDialog>(null);

  const [selectedSubcategory, setSelectedSubcategory] =
    useState<SubcategoryData | null>(null);
  const [subcategoryDialog, setSubcategoryDialog] =
    useState<SubcategoryDialog>(null);

  // Load data
  async function loadCategories() {
    setIsLoadingCategories(true);
    try {
      const result = await handleGetAllCategories();
      if (result.success) {
        setCategories(result.data || []);
      } else {
        toast.error(result.message);
      }
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
      if (result.success) {
        setSubcategories(result.data || []);
      } else {
        toast.error(result.message);
      }
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

  // Filtered & Sorted Categories
  const filteredCategories = useMemo(() => {
    let filtered = [...categories];

    if (categorySearch) {
      filtered = filtered.filter((cat) =>
        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (categorySortField === "name") {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      }

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

  // Filtered & Sorted Subcategories
  const filteredSubcategories = useMemo(() => {
    let filtered = [...subcategories];

    if (subcategoryFilterCategory !== "all") {
      filtered = filtered.filter((sub) => {
        const catId =
          typeof sub.categoryId === "object"
            ? sub.categoryId._id
            : sub.categoryId;
        return catId === subcategoryFilterCategory;
      });
    }

    if (subcategorySearch) {
      filtered = filtered.filter((sub) =>
        sub.name.toLowerCase().includes(subcategorySearch.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (subcategorySortField === "name") {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      }

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

  function handleCategorySort(field: SortField) {
    if (categorySortField === field) {
      setCategorySortOrder(categorySortOrder === "asc" ? "desc" : "asc");
    } else {
      setCategorySortField(field);
      setCategorySortOrder("asc");
    }
  }

  function handleSubcategorySort(field: SortField) {
    if (subcategorySortField === field) {
      setSubcategorySortOrder(subcategorySortOrder === "asc" ? "desc" : "asc");
    } else {
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

  // Category List Component
  const CategoryList = () => (
    <>
      {/* Search & Sort */}
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
            Name
            {getSortIcon("name", categorySortField, categorySortOrder)}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCategorySort("date")}
            className="gap-1"
          >
            Date
            {getSortIcon("date", categorySortField, categorySortOrder)}
          </Button>
        </div>
      </div>

      {/* List */}
      {isLoadingCategories ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {categorySearch
            ? "No categories found."
            : "No categories yet. Create one to get started."}
        </div>
      ) : (
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
      )}
    </>
  );

  // Subcategory List Component
  const SubcategoryList = () => (
    <>
      {/* Search, Filter & Sort */}
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

      {/* List */}
      {isLoadingSubcategories ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredSubcategories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {subcategorySearch || subcategoryFilterCategory !== "all"
            ? "No subcategories found."
            : "No subcategories yet. Create one to get started."}
        </div>
      ) : (
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
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Categories & Subcategories
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Organize your products into categories and subcategories.
        </p>
      </div>

      {/* Desktop: Side by side */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Manage product categories</CardDescription>
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
                <CardDescription>Manage product subcategories</CardDescription>
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

      {/* Mobile/Tablet: Tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">
              Categories ({filteredCategories.length})
            </TabsTrigger>
            <TabsTrigger value="subcategories">
              Subcategories ({filteredSubcategories.length})
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
