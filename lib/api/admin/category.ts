import axios from "../axios";
import { API } from "../endpoints";

export const createCategory = async (formData: FormData) => {
  const res = await axios.post(API.ADMIN.CATEGORIES.CREATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateCategory = async (id: string, formData: FormData) => {
  const res = await axios.put(API.ADMIN.CATEGORIES.UPDATE(id), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteCategory = async (id: string) => {
  const res = await axios.delete(API.ADMIN.CATEGORIES.DELETE(id));
  return res.data;
};

export const createSubcategory = async (data: {
  name: string;
  categoryId: string;
}) => {
  const res = await axios.post(API.ADMIN.SUBCATEGORIES.CREATE, data);
  return res.data;
};

export const updateSubcategory = async (
  id: string,
  data: { name?: string; categoryId?: string }
) => {
  const res = await axios.put(API.ADMIN.SUBCATEGORIES.UPDATE(id), data);
  return res.data;
};

export const deleteSubcategory = async (id: string) => {
  const res = await axios.delete(API.ADMIN.SUBCATEGORIES.DELETE(id));
  return res.data;
};
