"use server";

import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "@/lib/api/admin/user";
import { revalidatePath } from "next/cache";

// Get all users
export const handleGetUsers = async ({
  page = 1,
  size = 20,
  search = "",
  sortBy = "fullName",
  sortOrder = "asc",
}: {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} = {}) => {
  try {
    const response = await getUsers({
      page,
      size,
      search,
      sortBy,
      sortOrder,
    });

    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch users",
    };
  }
};

// Get user by id
export const handleGetUserById = async (id: string) => {
  try {
    const response = await getUserById(id);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch user",
    };
  }
};

// Create user
export const handleCreateUser = async (formData: FormData) => {
  try {
    const response = await createUser(formData);

    if (response.success) {
      revalidatePath("/admin/users");

      return {
        success: true,
        message: "User created successfully",
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || "User creation failed",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Create user action failed",
    };
  }
};

// Update user
export const handleUpdateUser = async (id: string, data: any) => {
  try {
    const response = await updateUser(id, data);

    if (response.success) {
      revalidatePath("/admin/users");
      revalidatePath(`/admin/users/${id}`);

      return {
        success: true,
        message: "User updated successfully",
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || "User update failed",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Update user action failed",
    };
  }
};

// Delete user
export const handleDeleteUser = async (id: string) => {
  try {
    const response = await deleteUser(id);

    if (response.success) {
      revalidatePath("/admin/users");

      return {
        success: true,
        message: "User deleted successfully",
      };
    }

    return {
      success: false,
      message: response.message || "User delete failed",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Delete user action failed",
    };
  }
};
