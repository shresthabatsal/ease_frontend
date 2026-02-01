import axios from "./axios";
import { API } from "./endpoints";

// Get profile
export const getProfile = async () => {
  const res = await axios.get(API.AUTH.PROFILE);
  return res.data;
};

// Update profile
export const updateProfile = async (data: any) => {
  const res = await axios.put(API.AUTH.UPDATE_PROFILE, data);
  return res.data;
};

// Upload profile picture
export const uploadProfilePicture = async (formData: FormData) => {
  const res = await axios.post(API.AUTH.UPLOAD_PROFILE_PIC, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Delete account
export const deleteAccount = async () => {
  const res = await axios.delete(API.AUTH.DELETE_ACCOUNT);
  return res.data;
};
