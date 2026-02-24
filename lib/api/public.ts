import axios from "./axios";
import { API } from "./endpoints";

// Get all stores
export const getAllStores = async () => {
  const res = await axios.get(API.PUBLIC.STORES.GET_ALL);
  return res.data;
};

// Get store by ID
export const getStoreById = async (storeId: string) => {
  const res = await axios.get(API.PUBLIC.STORES.GET_ONE(storeId));
  return res.data;
};

// Get all categories
export const getAllCategories = async () => {
  const res = await axios.get(API.PUBLIC.CATEGORIES.GET_ALL);
  return res.data;
};

// Get category by ID
export const getCategoryById = async (categoryId: string) => {
  const res = await axios.get(API.PUBLIC.CATEGORIES.GET_ONE(categoryId));
  return res.data;
};

// Get product by ID
export const getProductById = async (productId: string) => {
  const res = await axios.get(API.PUBLIC.PRODUCTS.GET_ONE(productId));
  return res.data;
};

// Get products by store
export const getProductsByStore = async (storeId: string) => {
  const res = await axios.get(API.PUBLIC.PRODUCTS.GET_BY_STORE(storeId));
  return res.data;
};

// Get products by store and category
export const getProductsByStoreAndCategory = async (
  storeId: string,
  categoryId: string
) => {
  const res = await axios.get(
    API.PUBLIC.PRODUCTS.GET_BY_STORE_AND_CATEGORY(storeId, categoryId)
  );
  return res.data;
};

// Get products by store and subcategory
export const getProductsByStoreAndSubcategory = async (
  storeId: string,
  subcategoryId: string
) => {
  const res = await axios.get(
    API.PUBLIC.PRODUCTS.GET_BY_STORE_AND_SUBCATEGORY(storeId, subcategoryId)
  );
  return res.data;
};

// Search products within a store
export const searchProductsInStore = async (storeId: string, query: string) => {
  const res = await axios.get(API.PUBLIC.PRODUCTS.GET_BY_STORE(storeId), {
    params: { search: query.trim() },
  });
  return res.data;
};
