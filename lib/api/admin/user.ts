import axios from "../axios";
import { API } from "../endpoints";

// Get all users
export const getUsers = async (params?: {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const query = new URLSearchParams({
    page: (params?.page ?? 1).toString(),
    size: (params?.size ?? 20).toString(),
    search: params?.search ?? "",
    sortBy: params?.sortBy ?? "fullName",
    sortOrder: params?.sortOrder ?? "asc",
  }).toString();

  const res = await axios.get(`${API.ADMIN.USERS.GET_ALL}?${query}`);
  return res.data;
};

// Get single user
export const getUserById = async (id: string) => {
  const res = await axios.get(API.ADMIN.USERS.GET_ONE(id));
  return res.data;
};

// Create user
export const createUser = async (formData: FormData) => {
  const res = await axios.post(API.ADMIN.USERS.CREATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Update user
export const updateUser = async (id: string, data: any) => {
  const res = await axios.put(API.ADMIN.USERS.UPDATE(id), data);
  return res.data;
};

// Delete user
export const deleteUser = async (id: string) => {
  const res = await axios.delete(API.ADMIN.USERS.DELETE(id));
  return res.data;
};
