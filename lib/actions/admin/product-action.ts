"use server";

import {
  getAllProducts,
  getProductById,
  getProductsByStore,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllStores,
  getAllCategories,
  getAllSubcategories,
  getSubcategoriesByCategory,
} from "@/lib/api/product";
import { revalidatePath } from "next/cache";

// Get all products
export const handleGetAllProducts = async (params?: {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  try {
    const response = await getAllProducts(params);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch products",
    };
  }
};

// Get product by ID
export const handleGetProductById = async (productId: string) => {
  try {
    const response = await getProductById(productId);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch product",
    };
  }
};

// Get products by store
export const handleGetProductsByStore = async (storeId: string) => {
  try {
    const response = await getProductsByStore(storeId);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch store products",
    };
  }
};

// Create product
export const handleCreateProduct = async (formData: FormData) => {
  try {
    const response = await createProduct(formData);

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product created successfully",
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create product",
    };
  }
};

// Update product
export const handleUpdateProduct = async (
  productId: string,
  formData: FormData
) => {
  try {
    const response = await updateProduct(productId, formData);

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product updated successfully",
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update product",
    };
  }
};

// Delete product
export const handleDeleteProduct = async (productId: string) => {
  try {
    const response = await deleteProduct(productId);

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product deleted successfully",
      data: response,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete product",
    };
  }
};

// Get all stores
export const handleGetAllStores = async () => {
  try {
    const response = await getAllStores();
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch stores",
    };
  }
};

// Get all categories
export const handleGetAllCategories = async () => {
  try {
    const response = await getAllCategories();
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch categories",
    };
  }
};

// Get all subcategories
export const handleGetAllSubcategories = async () => {
  try {
    const response = await getAllSubcategories();
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch subcategories",
    };
  }
};

// Get subcategories by category
export const handleGetSubcategoriesByCategory = async (categoryId: string) => {
  try {
    const response = await getSubcategoriesByCategory(categoryId);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch subcategories",
    };
  }
};
