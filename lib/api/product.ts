import axios from "./axios";
import { API } from "./endpoints";

// Get all products (with pagination/search/sort)
export const getAllProducts = async (params?: {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const res = await axios.get(API.ADMIN.PRODUCTS.GET_ALL, { params });
  return res.data;
};

// Get product by ID
export const getProductById = async (productId: string) => {
  const res = await axios.get(API.ADMIN.PRODUCTS.GET_ONE(productId));
  return res.data;
};

// Get products by store ID
export const getProductsByStore = async (storeId: string) => {
  const res = await axios.get(API.ADMIN.PRODUCTS.GET_BY_STORE(storeId));
  return res.data;
};

// Create product (multipart — supports image upload)
export const createProduct = async (formData: FormData) => {
  const res = await axios.post(API.ADMIN.PRODUCTS.CREATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Update product (multipart — supports image upload)
export const updateProduct = async (productId: string, formData: FormData) => {
  const res = await axios.put(API.ADMIN.PRODUCTS.UPDATE(productId), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Delete product
export const deleteProduct = async (productId: string) => {
  const res = await axios.delete(API.ADMIN.PRODUCTS.DELETE(productId));
  return res.data;
};

// Get all stores
export const getAllStores = async () => {
  const res = await axios.get(API.ADMIN.STORES.GET_ALL);
  return res.data;
};

// Get all categories
export const getAllCategories = async () => {
  const res = await axios.get(API.ADMIN.CATEGORIES.GET_ALL);
  return res.data;
};

// Get all subcategories
export const getAllSubcategories = async () => {
  const res = await axios.get(API.ADMIN.SUBCATEGORIES.GET_ALL);
  return res.data;
};

// Get subcategories by category
export const getSubcategoriesByCategory = async (categoryId: string) => {
  const res = await axios.get(
    API.ADMIN.SUBCATEGORIES.GET_BY_CATEGORY(categoryId)
  );
  return res.data;
};
