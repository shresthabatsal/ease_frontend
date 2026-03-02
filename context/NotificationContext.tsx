"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification as apiDeleteNotification,
  INotification,
} from "@/lib/api/notification";
import { useAuth } from "@/context/AuthContext";

interface NotificationContextValue {
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

const POLL_MS = 30_000;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<any>(null);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [notes, count] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(notes);
      setUnreadCount(count);
    } catch {
      // silent — never break the UI
    }
  }, [isAuthenticated]);

  // Initial load + polling
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setLoading(true);
    refetch().finally(() => setLoading(false));
    pollRef.current = setInterval(refetch, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isAuthenticated, refetch]);

  // WebSocket — real-time push
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:5000";

    let socket: any;

    import("socket.io-client")
      .then(({ io }) => {
        socket = io(wsUrl, {
          query: { userId: user._id },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 3000,
        });
        socketRef.current = socket;

        socket.on("notification_received", (raw: any) => {
          const note: INotification = {
            _id: raw._id ?? String(Date.now()),
            userId: user._id,
            orderId: raw.orderId,
            type: raw.type,
            title: raw.title,
            message: raw.message,
            data: raw.data,
            isRead: false,
            createdAt: raw.createdAt ?? new Date().toISOString(),
          };
          setNotifications((prev) => [note, ...prev]);
          setUnreadCount((c) => c + 1);
        });
      })
      .catch(() => {
        /* socket.io-client not installed — polling only */
      });

    return () => {
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?._id]);

  const markAsRead = useCallback(async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const remove = useCallback(
    async (id: string) => {
      const note = notifications.find((n) => n._id === id);
      await apiDeleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (note && !note.isRead) setUnreadCount((c) => Math.max(0, c - 1));
    },
    [notifications]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        remove,
        refetch,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  return ctx;
}
