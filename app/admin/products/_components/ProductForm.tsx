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
import { ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import {
  handleGetAllCategories,
  handleGetAllStores,
  handleGetSubcategoriesByCategory,
} from "@/lib/actions/admin/product-action";

const IMAGE_BASE_URL = "http://localhost:5050";
const PLACEHOLDER_IMAGE = "/placeholder-product.png";

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
  const isEditing = !!initialData?._id;

  // Existing image from server (edit mode only)
  const existingImageUrl = initialData?.productImage
    ? `${IMAGE_BASE_URL}${initialData.productImage}`
    : null;

  const [preview, setPreview] = useState<string | null>(existingImageUrl);
  const [newFile, setNewFile] = useState<File | null>(null); // tracks whether user picked a new file
  const fileRef = useRef<HTMLInputElement>(null);

  const [stores, setStores] = useState<StoreData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<
    SubcategoryData[]
  >([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoadingDropdowns(true);
      const [storesRes, categoriesRes] = await Promise.all([
        handleGetAllStores(),
        handleGetAllCategories(),
      ]);
      if (storesRes.success) setStores(storesRes.data || []);
      if (categoriesRes.success) setCategories(categoriesRes.data || []);
      setIsLoadingDropdowns(false);
    })();
  }, []);

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
    }
  }, [initialData, isLoadingDropdowns]);

  useEffect(() => {
    if (!selectedCategoryId) {
      setFilteredSubcategories([]);
      if (!isInitializing) setSelectedSubcategoryId("");
      return;
    }
    (async () => {
      setIsLoadingSubcategories(true);
      const result = await handleGetSubcategoriesByCategory(selectedCategoryId);
      if (result.success) setFilteredSubcategories(result.data || []);
      setIsLoadingSubcategories(false);
      setIsInitializing(false);
    })();
  }, [selectedCategoryId]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setNewFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isEditing && !newFile) {
      toast.error("Please select a product image");
      fileRef.current?.focus();
      return;
    }

    // Validate required dropdowns
    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!selectedSubcategoryId) {
      toast.error("Please select a subcategory");
      return;
    }
    if (!selectedStoreId) {
      toast.error("Please select a store");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("categoryId", selectedCategoryId);
    formData.set("subcategoryId", selectedSubcategoryId);
    formData.set("storeId", selectedStoreId);

    if (newFile) {
      formData.set("productImage", newFile);
    } else {
      formData.delete("productImage");
    }

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

      {/* Dropdowns */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedCategoryId}
            onValueChange={setSelectedCategoryId}
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
          <Label>
            Subcategory <span className="text-destructive">*</span>
          </Label>
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
          <Label>
            Store <span className="text-destructive">*</span>
          </Label>
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

      {/* Image upload */}
      <div className="space-y-1.5">
        <Label htmlFor="productImage">
          Product Image{" "}
          {!isEditing && <span className="text-destructive">*</span>}
          {isEditing && (
            <span className="text-xs font-normal text-muted-foreground ml-1">
              (leave empty to keep current)
            </span>
          )}
        </Label>

        {preview ? (
          <div className="relative w-full h-36 rounded-md overflow-hidden border group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setPreview(PLACEHOLDER_IMAGE)}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-24 rounded-md border-2 border-dashed border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-amber-500 transition-colors"
          >
            <ImageIcon size={20} />
            <span className="text-xs font-medium">Click to upload image</span>
          </button>
        )}

        <Input
          ref={fileRef}
          id="productImage"
          name="productImage"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs text-muted-foreground hover:text-amber-600 underline underline-offset-2"
          >
            Change image
          </button>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading} className="min-w-28">
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
