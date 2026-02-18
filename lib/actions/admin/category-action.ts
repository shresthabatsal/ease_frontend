"use server";

import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllSubcategories,
  getSubcategoryById,
  getSubcategoriesByCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "@/lib/api/category";
import { revalidatePath } from "next/cache";

// ── CATEGORIES ────────────────────────────────────────────────────────────

export const handleGetAllCategories = async () => {
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

export const handleGetCategoryById = async (id: string) => {
  try {
    const response = await getCategoryById(id);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch category",
    };
  }
};

export const handleCreateCategory = async (formData: FormData) => {
  try {
    const response = await createCategory(formData);
    revalidatePath("/admin/categories");
    return {
      success: true,
      message: "Category created successfully",
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create category",
    };
  }
};

export const handleUpdateCategory = async (id: string, formData: FormData) => {
  try {
    const response = await updateCategory(id, formData);
    revalidatePath("/admin/categories");
    return {
      success: true,
      message: "Category updated successfully",
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update category",
    };
  }
};

export const handleDeleteCategory = async (id: string) => {
  try {
    await deleteCategory(id);
    revalidatePath("/admin/categories");
    return { success: true, message: "Category deleted successfully" };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete category",
    };
  }
};

// ── SUBCATEGORIES ─────────────────────────────────────────────────────────

export const handleGetAllSubcategories = async () => {
  try {
    const response = await getAllSubcategories();
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch subcategories",
    };
  }
};

export const handleGetSubcategoryById = async (id: string) => {
  try {
    const response = await getSubcategoryById(id);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch subcategory",
    };
  }
};

export const handleGetSubcategoriesByCategory = async (categoryId: string) => {
  try {
    const response = await getSubcategoriesByCategory(categoryId);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch subcategories",
    };
  }
};

export const handleCreateSubcategory = async (data: {
  name: string;
  categoryId: string;
}) => {
  try {
    const response = await createSubcategory(data);
    revalidatePath("/admin/categories");
    return {
      success: true,
      message: "Subcategory created successfully",
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create subcategory",
    };
  }
};

export const handleUpdateSubcategory = async (
  id: string,
  data: { name?: string; categoryId?: string }
) => {
  try {
    const response = await updateSubcategory(id, data);
    revalidatePath("/admin/categories");
    return {
      success: true,
      message: "Subcategory updated successfully",
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update subcategory",
    };
  }
};

export const handleDeleteSubcategory = async (id: string) => {
  try {
    await deleteSubcategory(id);
    revalidatePath("/admin/categories");
    return { success: true, message: "Subcategory deleted successfully" };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete subcategory",
    };
  }
};
