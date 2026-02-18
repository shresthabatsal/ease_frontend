"use client";

import { useEffect, useState } from "react";
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
import { Pencil, Trash2 } from "lucide-react";
import { CategoryData } from "../_components/CategoryForm";
import { SubcategoryData } from "../_components/SubCategoryForm";
import {
  handleGetAllCategories,
  handleGetAllSubcategories,
} from "@/lib/actions/admin/category-action";
import { CreateSubcategoryDialog } from "../_components/CreateSubCategoryDialog";
import { EditCategoryDialog } from "../_components/EditCategoryDialog";
import { DeleteCategoryDialog } from "../_components/DeleteCategoryDialog";
import { EditSubcategoryDialog } from "../_components/EditSubCategoryDialog";
import { DeleteSubcategoryDialog } from "../_components/DeleteSubCategoryDialog";
import { CreateCategoryDialog } from "../_components/CreateCategoryDialog";

const IMAGE_BASE_URL = "http://localhost:5050";

type CategoryDialog = "edit" | "delete" | null;
type SubcategoryDialog = "edit" | "delete" | null;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryData[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(
    null
  );
  const [categoryDialog, setCategoryDialog] = useState<CategoryDialog>(null);

  const [selectedSubcategory, setSelectedSubcategory] =
    useState<SubcategoryData | null>(null);
  const [subcategoryDialog, setSubcategoryDialog] =
    useState<SubcategoryDialog>(null);

  // Load categories
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

  // Load subcategories
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
        {/* Categories Section */}
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
            {isLoadingCategories ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-muted rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No categories yet. Create one to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
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
                          subcategories.filter(
                            (s) =>
                              (typeof s.categoryId === "object"
                                ? s.categoryId?._id
                                : s.categoryId) === category._id
                          ).length
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
          </CardContent>
        </Card>

        {/* Subcategories Section */}
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
            {isLoadingSubcategories ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : subcategories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No subcategories yet. Create one to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {subcategories.map((subcategory) => (
                  <div
                    key={subcategory._id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {subcategory.name}
                      </h3>
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
          </CardContent>
        </Card>
      </div>

      {/* Mobile/Tablet: Tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">
              Categories ({categories.length})
            </TabsTrigger>
            <TabsTrigger value="subcategories">
              Subcategories ({subcategories.length})
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
                {isLoadingCategories ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-24 bg-muted rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No categories yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category._id}
                        className="flex items-center gap-3 p-3 rounded-lg border"
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
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {
                              subcategories.filter(
                                (s) =>
                                  (typeof s.categoryId === "object"
                                    ? s.categoryId?._id
                                    : s.categoryId) === category._id
                              ).length
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
                {isLoadingSubcategories ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-16 bg-muted rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : subcategories.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No subcategories yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subcategories.map((subcategory) => (
                      <div
                        key={subcategory._id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">{subcategory.name}</h3>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {getCategoryName(subcategory.categoryId)}
                          </Badge>
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
