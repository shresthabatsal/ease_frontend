import { adminDeleteOrder, adminGetStoreOrders, adminUpdateOrderStatus, adminVerifyOtp, adminVerifyPayment, getOrderPayment } from "@/lib/api/admin/order";


export type ActionResult<T = any> = ActionSuccess<T> | ActionFailure;

export type ActionSuccess<T = any> = {
  success: true;
  data?: T;
  message?: string;
};

export type ActionFailure = {
  success: false;
  message: string;
};

// Orders

export async function fetchStoreOrders(storeId: string): Promise<ActionResult> {
  try {
    const res = await adminGetStoreOrders(storeId);
    return { success: true, data: res.data };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to fetch orders",
    };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: "READY_FOR_COLLECTION" | "COLLECTED" | "CANCELLED"
): Promise<ActionResult> {
  try {
    const res = await adminUpdateOrderStatus(orderId, status);
    return { success: true, data: res.data, message: res.message };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to update status",
    };
  }
}

export async function verifyOtpAction(
  orderId: string,
  otp: string
): Promise<ActionResult> {
  try {
    const res = await adminVerifyOtp(orderId, otp);
    return { success: true, data: res.data, message: res.message };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Invalid OTP",
    };
  }
}

export async function deleteOrderAction(
  orderId: string
): Promise<ActionResult> {
  try {
    const res = await adminDeleteOrder(orderId);
    return { success: true, message: res.message };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to delete order",
    };
  }
}

// Payments

export async function fetchOrderPayment(
  orderId: string
): Promise<ActionResult> {
  try {
    const res = await getOrderPayment(orderId);
    return { success: true, data: res.data };
  } catch (e: any) {
    if (e?.response?.status === 404) return { success: true, data: null };
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to fetch payment",
    };
  }
}

export async function verifyPaymentAction(
  paymentId: string,
  data: { status: "VERIFIED" | "REJECTED"; verificationNotes?: string }
): Promise<ActionResult> {
  try {
    const res = await adminVerifyPayment(paymentId, data);
    return { success: true, data: res.data, message: res.message };
  } catch (e: any) {
    const status = e?.response?.status;
    const msg =
      e?.response?.data?.message ?? e?.message ?? "Failed to verify payment";
    console.error(
      "[verifyPaymentAction] status:",
      status,
      "message:",
      msg,
      "paymentId:",
      paymentId
    );
    return {
      success: false,
      message: `${msg} (HTTP ${status ?? "network error"})`,
    };
  }
}
