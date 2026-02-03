"use server";

import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  deleteAccount,
} from "@/lib/api/user";
import { revalidatePath } from "next/cache";

// Get profile
export const handleGetProfile = async () => {
  try {
    const response = await getProfile();

    return {
      success: true,
      data: response.data,
    };  
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch profile",
    };
  }
};

// Update profile
export const handleUpdateProfile = async (data: any) => {
  try {
    const response = await updateProfile(data);

    revalidatePath("/profile");

    return {
      success: true,
      message: "Profile updated successfully",
      data: response,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Profile update failed",
    };
  }
};

// Upload profile picture
export const handleUploadProfilePicture = async (formData: FormData) => {
  try {
    const response = await uploadProfilePicture(formData);

    revalidatePath("/profile");

    return {
      success: true,
      message: "Profile picture updated",
      data: response,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Upload failed",
    };
  }
};

// Delete account
export const handleDeleteAccount = async () => {
  try {
    const response = await deleteAccount();

    return {
      success: true,
      message: "Account deleted successfully",
      data: response,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Account deletion failed",
    };
  }
};
