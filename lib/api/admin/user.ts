import axios from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

// Get all users with pagination and filters
export const getUsers = async (params?: {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const res = await axios.get(API.ADMIN.USERS.GET_ALL, { params });
  return res.data;
};

// Get user by ID
export const getUserById = async (id: string) => {
  const res = await axios.get(API.ADMIN.USERS.GET_ONE(id));
  return res.data;
};

// Create user (with form data for profile picture)
export const createUser = async (formData: FormData) => {
  const res = await axios.post(API.ADMIN.USERS.CREATE, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Update user (with form data for profile picture)
export const updateUser = async (id: string, formData: FormData) => {
  const res = await axios.put(API.ADMIN.USERS.UPDATE(id), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Delete user
export const deleteUser = async (id: string) => {
  const res = await axios.delete(API.ADMIN.USERS.DELETE(id));
  return res.data;
};
