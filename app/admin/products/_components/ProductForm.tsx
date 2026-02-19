"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { handleGetAllCategories, handleGetAllStores, handleGetSubcategoriesByCategory } from "@/lib/actions/admin/product-action";

// Backend image URL prefix
const IMAGE_BASE_URL = "http://localhost:5050";

// Placeholder when no image or image fails
const PLACEHOLDER_IMAGE = "/placeholder-product.png";

// Types matching backend response structure
export interface StoreData {
  _id: string;
  storeName: string;
  location: string;
  pickupInstructions: string;
}

export interface CategoryData {
  _id: string;
  name: string;
}

export interface SubcategoryData {
  _id: string;
  name: string;
  categoryId: string;
}

export interface ProductData {
  _id: string;
  name: string;
  price: number;
  description: string;
  productImage: string;
  categoryId: CategoryData | string | null;
  subcategoryId: SubcategoryData | string | null;
  storeId: StoreData | string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationData {
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

interface ProductFormProps {
  initialData?: Partial<ProductData>;
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
}

export function ProductForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = "Save",
}: ProductFormProps) {
  const [preview, setPreview] = useState<string | null>(
    initialData?.productImage
      ? `${IMAGE_BASE_URL}${initialData.productImage}`
      : null
  );
  const fileRef = useRef<HTMLInputElement>(null);

  // Dropdown data
  const [stores, setStores] = useState<StoreData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<
    SubcategoryData[]
  >([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);

  // Selected values
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] =
    useState<string>("");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(false);

  // Load dropdown data on mount (stores and categories only)
  useEffect(() => {
    async function loadDropdowns() {
      setIsLoadingDropdowns(true);
      const [storesRes, categoriesRes] = await Promise.all([
        handleGetAllStores(),
        handleGetAllCategories(),
      ]);

      if (storesRes.success) setStores(storesRes.data || []);
      if (categoriesRes.success) setCategories(categoriesRes.data || []);

      setIsLoadingDropdowns(false);
    }
    loadDropdowns();
  }, []);

  // Initialize selections from initialData AFTER dropdowns load
  useEffect(() => {
    if (initialData && !isLoadingDropdowns) {
      setIsInitializing(true);

      const catId =
        typeof initialData.categoryId === "object" && initialData.categoryId
          ? initialData.categoryId._id
          : typeof initialData.categoryId === "string"
          ? initialData.categoryId
          : "";

      const subId =
        typeof initialData.subcategoryId === "object" &&
        initialData.subcategoryId
          ? initialData.subcategoryId._id
          : typeof initialData.subcategoryId === "string"
          ? initialData.subcategoryId
          : "";

      const stId =
        typeof initialData.storeId === "object" && initialData.storeId
          ? initialData.storeId._id
          : typeof initialData.storeId === "string"
          ? initialData.storeId
          : "";

      setSelectedCategoryId(catId);
      setSelectedSubcategoryId(subId);
      setSelectedStoreId(stId);

      // Will trigger subcategory load via the next useEffect
    }
  }, [initialData, isLoadingDropdowns]);

  // Fetch subcategories when category changes
  useEffect(() => {
    async function loadSubcategories() {
      if (selectedCategoryId) {
        setIsLoadingSubcategories(true);

        const result = await handleGetSubcategoriesByCategory(
          selectedCategoryId
        );

        if (result.success) {
          setFilteredSubcategories(result.data || []);
        }

        setIsLoadingSubcategories(false);
        setIsInitializing(false);
      } else {
        setFilteredSubcategories([]);
        if (!isInitializing) {
          setSelectedSubcategoryId("");
        }
      }
    }

    loadSubcategories();
  }, [selectedCategoryId, isInitializing]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("categoryId", selectedCategoryId);
    formData.set("subcategoryId", selectedSubcategoryId);
    formData.set("storeId", selectedStoreId);
    await onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name}
          placeholder="e.g. Wireless Headphones"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (NPR)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initialData?.price}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            defaultValue={initialData?.quantity}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialData?.description}
          placeholder="Product description..."
          className="resize-none"
          rows={3}
          required
        />
      </div>

      {/* Dropdowns - Fixed layout to prevent overlap */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select
            value={selectedCategoryId}
            onValueChange={(value) => {
              setSelectedCategoryId(value);
            }}
            disabled={isLoadingDropdowns}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Subcategory *</Label>
          <Select
            value={selectedSubcategoryId}
            onValueChange={setSelectedSubcategoryId}
            disabled={
              !selectedCategoryId ||
              isLoadingDropdowns ||
              isLoadingSubcategories
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !selectedCategoryId
                    ? "Select category first"
                    : isLoadingSubcategories
                    ? "Loading..."
                    : "Select subcategory"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {isLoadingSubcategories ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Loading subcategories...
                </div>
              ) : filteredSubcategories.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No subcategories available
                </div>
              ) : (
                filteredSubcategories.map((sub) => (
                  <SelectItem key={sub._id} value={sub._id}>
                    {sub.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Store *</Label>
          <Select
            value={selectedStoreId}
            onValueChange={setSelectedStoreId}
            disabled={isLoadingDropdowns}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store._id} value={store._id}>
                  {store.storeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Image */}
      <div className="space-y-1.5">
        <Label htmlFor="productImage">Product Image</Label>
        {preview && (
          <div className="relative w-full h-36 rounded-md overflow-hidden border mb-2">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setPreview(PLACEHOLDER_IMAGE)}
            />
          </div>
        )}
        <Input
          ref={fileRef}
          id="productImage"
          name="productImage"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading} className="min-w-28">
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
