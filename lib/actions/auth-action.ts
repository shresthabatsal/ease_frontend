"use server";

import { login, register } from "@/lib/api/auth";
import { LoginInput, RegisterInput } from "@/app/(auth)/schema";
import { setAuthToken, setUserData, clearAuthCookies } from "@/lib/cookie";
import { redirect } from "next/navigation";

export const handleRegister = async (data: RegisterInput) => {
  try {
    const response = await register(data);

    if (response.success) {
      return {
        success: true,
        message: "Registration successful",
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || "Registration failed",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Registration action failed",
    };
  }
};

export const handleLogin = async (data: LoginInput) => {
  try {
    const response = await login(data);

    if (response.success) {
      // save auth data in cookies
      await setAuthToken(response.token);
      await setUserData(response.data);

      return {
        success: true,
        message: "Login successful",
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || "Login failed",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Login action failed",
    };
  }
};

export const handleLogout = async () => {
  await clearAuthCookies();
  redirect("/login");
};