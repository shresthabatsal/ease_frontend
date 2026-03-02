import axios from "./axios";
import { API } from "./endpoints";

export type NotificationType =
  | "ORDER_CREATED"
  | "PAYMENT_VERIFIED"
  | "ORDER_CONFIRMED"
  | "READY_FOR_COLLECTION"
  | "COLLECTION_REMINDER"
  | "ORDER_COLLECTED"
  | "ORDER_CANCELLED"
  | "PAYMENT_REJECTED";

export interface INotification {
  _id: string;
  userId: string;
  orderId: string | { _id: string; status: string };
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    otp?: string;
    pickupDate?: string;
    pickupTime?: string;
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export const getNotifications = async (
  limit = 50
): Promise<INotification[]> => {
  const res = await axios.get(API.PUBLIC.NOTIFICATIONS.GET_ALL, {
    params: { limit },
  });
  return res.data.data ?? [];
};

export const getUnreadCount = async (): Promise<number> => {
  const res = await axios.get(API.PUBLIC.NOTIFICATIONS.GET_UNREAD_COUNT);
  return res.data.data?.unreadCount ?? 0;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await axios.put(API.PUBLIC.NOTIFICATIONS.MARK_READ(id));
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await axios.put(API.PUBLIC.NOTIFICATIONS.MARK_ALL_READ);
};

export const deleteNotification = async (id: string): Promise<void> => {
  await axios.delete(API.PUBLIC.NOTIFICATIONS.DELETE(id));
};
