"use server";

import {
  getAllStores,
  getProductById,
  getStoreById,
  getAllCategories,
  getCategoryById,
  getProductsByStore,
  getProductsByStoreAndCategory,
  getProductsByStoreAndSubcategory,
  searchProductsInStore,
} from "@/lib/api/public";

type ActionResult<T = any> = Promise<{
  success: boolean;
  data?: T;
  message?: string;
}>;

// Get all stores
export const handleGetAllStores = async (): ActionResult => {
  try {
    const response = await getAllStores();
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch stores",
    };
  }
};

// Get store by ID
export const handleGetStoreById = async (storeId: string): ActionResult => {
  try {
    const response = await getStoreById(storeId);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch store",
    };
  }
};

// Get all categories
export const handleGetAllCategories = async (): ActionResult => {
  try {
    const response = await getAllCategories();
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch categories",
    };
  }
};

// Get category by ID
export const handleGetCategoryById = async (
  categoryId: string
): ActionResult => {
  try {
    const response = await getCategoryById(categoryId);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch category",
    };
  }
};

// Get product by ID
export const handleGetProductById = async (productId: string): ActionResult => {
  try {
    const response = await getProductById(productId);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch product",
    };
  }
};

// Get products by store
export const handleGetProductsByStore = async (
  storeId: string
): ActionResult => {
  try {
    const response = await getProductsByStore(storeId);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch products",
    };
  }
};

// Get products by store and category
export const handleGetProductsByStoreAndCategory = async (
  storeId: string,
  categoryId: string
): ActionResult => {
  try {
    const response = await getProductsByStoreAndCategory(storeId, categoryId);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch products",
    };
  }
};

// Get products by store and subcategory
export const handleGetProductsByStoreAndSubcategory = async (
  storeId: string,
  subcategoryId: string
): ActionResult => {
  try {
    const response = await getProductsByStoreAndSubcategory(
      storeId,
      subcategoryId
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch products",
    };
  }
};

// Search products within a store
export const handleSearchProducts = async (
  storeId: string,
  query: string
): ActionResult => {
  try {
    const response = await searchProductsInStore(storeId, query);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Search failed" };
  }
};
