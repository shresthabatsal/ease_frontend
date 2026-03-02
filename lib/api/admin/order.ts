import axios from "../axios";
import { API } from "../endpoints";

// Admin Orders

export const adminGetStoreOrders = async (storeId: string) => {
  const res = await axios.get(API.ADMIN.ORDERS.GET_BY_STORE(storeId));
  return res.data;
};

export const adminUpdateOrderStatus = async (
  orderId: string,
  status: "READY_FOR_COLLECTION" | "COLLECTED" | "CANCELLED"
) => {
  const res = await axios.put(API.ADMIN.ORDERS.UPDATE_STATUS(orderId), {
    status,
  });
  return res.data;
};

export const adminVerifyOtp = async (orderId: string, otp: string) => {
  const res = await axios.post(API.ADMIN.ORDERS.VERIFY_OTP(orderId), { otp });
  return res.data;
};

export const adminDeleteOrder = async (orderId: string) => {
  const res = await axios.delete(API.ADMIN.ORDERS.DELETE(orderId));
  return res.data;
};

// Payments

export const getOrderPayment = async (orderId: string) => {
  const res = await axios.get(API.PUBLIC.PAYMENTS.GET_ORDER_PAYMENT(orderId));
  return res.data;
};

export const adminVerifyPayment = async (
  paymentId: string,
  data: { status: "VERIFIED" | "REJECTED"; verificationNotes?: string }
) => {
  const url = API.ADMIN.PAYMENTS.VERIFY(paymentId);
  const res = await axios.put(url, data);
  return res.data;
};
