"use server";

import {
  createOrder,
  buyNow,
  getUserOrders,
  getOrderById,
  cancelOrder,
  submitPaymentReceipt,
  getOrderPayment,
  getMyPayments,
} from "@/lib/api/order";

type ActionResult<T = any> = Promise<{
  success: boolean;
  data?: T;
  message?: string;
}>;

// Orders
// Create order from cart
export const handleCreateOrder = async (data: {
  storeId: string;
  pickupDate: string;
  pickupTime: string;
  notes?: string;
}): ActionResult => {
  try {
    const response = await createOrder(data);
    return { success: true, data: response.data, message: response.message };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to create order",
    };
  }
};

// Buy now
export const handleBuyNow = async (data: {
  productId: string;
  quantity: number;
  storeId: string;
  pickupDate: string;
  pickupTime: string;
  notes?: string;
}): ActionResult => {
  try {
    const response = await buyNow(data);
    return { success: true, data: response.data, message: response.message };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to place order",
    };
  }
};

// Get all orders for logged-in user
export const handleGetUserOrders = async (): ActionResult => {
  try {
    const response = await getUserOrders();
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch orders",
    };
  }
};

// Get single order
export const handleGetOrderById = async (orderId: string): ActionResult => {
  try {
    const response = await getOrderById(orderId);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch order",
    };
  }
};

// Cancel order
export const handleCancelOrder = async (
  orderId: string,
  reason?: string
): ActionResult => {
  try {
    const response = await cancelOrder(orderId, reason);
    return { success: true, data: response.data, message: response.message };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to cancel order",
    };
  }
};

// Payments
export const handleSubmitPaymentReceipt = async (
  formData: FormData
): ActionResult => {
  try {
    const response = await submitPaymentReceipt(formData);
    return { success: true, data: response.data, message: response.message };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to submit receipt",
    };
  }
};

// Get payment for an order
export const handleGetOrderPayment = async (orderId: string): ActionResult => {
  try {
    const response = await getOrderPayment(orderId);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch payment",
    };
  }
};

// Get all payments for logged-in user
export const handleGetMyPayments = async (): ActionResult => {
  try {
    const response = await getMyPayments();
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch payments",
    };
  }
};
