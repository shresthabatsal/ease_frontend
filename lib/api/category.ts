import axios from "./axios";
import { API } from "./endpoints";

// CATEGORIES

export const getAllCategories = async () => {
  const res = await axios.get(API.ADMIN.CATEGORIES.GET_ALL);
  return res.data;
};

export const getCategoryById = async (id: string) => {
  const res = await axios.get(API.ADMIN.CATEGORIES.GET_ONE(id));
  return res.data;
};

// SUBCATEGORIES

export const getAllSubcategories = async () => {
  const res = await axios.get(API.ADMIN.SUBCATEGORIES.GET_ALL);
  return res.data;
};

export const getSubcategoryById = async (id: string) => {
  const res = await axios.get(API.ADMIN.SUBCATEGORIES.GET_ONE(id));
  return res.data;
};

export const getSubcategoriesByCategory = async (categoryId: string) => {
  const res = await axios.get(
    API.ADMIN.SUBCATEGORIES.GET_BY_CATEGORY(categoryId)
  );
  return res.data;
};
