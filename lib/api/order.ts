import axios from "./axios";
import { API } from "./endpoints";

// Orders
// Create order from cart
export const createOrder = async (data: {
  storeId: string;
  pickupDate: string;
  pickupTime: string;
  notes?: string;
}) => {
  const res = await axios.post(API.PUBLIC.ORDERS.CREATE, data);
  return res.data;
};

// Buy now
export const buyNow = async (data: {
  productId: string;
  quantity: number;
  storeId: string;
  pickupDate: string;
  pickupTime: string;
  notes?: string;
}) => {
  const res = await axios.post(API.PUBLIC.ORDERS.BUY_NOW, data);
  return res.data;
};

// Get all orders for logged-in user
export const getUserOrders = async () => {
  const res = await axios.get(API.PUBLIC.ORDERS.GET_ALL);
  return res.data;
};

// Get single order by ID
export const getOrderById = async (orderId: string) => {
  const res = await axios.get(API.PUBLIC.ORDERS.GET_ONE(orderId));
  return res.data;
};

// Cancel order
export const cancelOrder = async (orderId: string, reason?: string) => {
  const res = await axios.post(API.PUBLIC.ORDERS.CANCEL(orderId), { reason });
  return res.data;
};

// Payments
// Submit payment receipt
export const submitPaymentReceipt = async (formData: FormData) => {
  const res = await axios.post(API.PUBLIC.PAYMENTS.SUBMIT_RECEIPT, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Get payment for a specific order
export const getOrderPayment = async (orderId: string) => {
  const res = await axios.get(API.PUBLIC.PAYMENTS.GET_ORDER_PAYMENT(orderId));
  return res.data;
};

// Get all payments for logged-in user
export const getMyPayments = async () => {
  const res = await axios.get(API.PUBLIC.PAYMENTS.GET_MY_PAYMENTS);
  return res.data;
};
