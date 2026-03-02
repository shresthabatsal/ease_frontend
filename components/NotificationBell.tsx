"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { INotification, NotificationType } from "@/lib/api/notification";
import { cn } from "@/lib/utils";
import {
  Bell,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Package,
  Clock,
  Trash2,
  CheckCheck,
  Loader2,
} from "lucide-react";

const TYPE_CFG: Record<
  NotificationType,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  ORDER_CREATED: {
    icon: <ShoppingBag size={14} />,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  ORDER_CONFIRMED: {
    icon: <CheckCircle2 size={14} />,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  PAYMENT_VERIFIED: {
    icon: <CheckCircle2 size={14} />,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  PAYMENT_REJECTED: {
    icon: <XCircle size={14} />,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  READY_FOR_COLLECTION: {
    icon: <Package size={14} />,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  COLLECTION_REMINDER: {
    icon: <Clock size={14} />,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  ORDER_COLLECTED: {
    icon: <CheckCircle2 size={14} />,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  ORDER_CANCELLED: {
    icon: <XCircle size={14} />,
    color: "text-red-500",
    bg: "bg-red-50",
  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Single notification row
function NotificationRow({
  note,
  onRead,
  onDelete,
}: {
  note: INotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cfg = TYPE_CFG[note.type] ?? TYPE_CFG.ORDER_CREATED;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 px-4 py-3 transition-colors",
        note.isRead ? "bg-white" : "bg-amber-50/60"
      )}
      onClick={() => {
        if (!note.isRead) onRead(note._id);
      }}
      role="button"
      tabIndex={0}
    >
      {/* icon */}
      <div
        className={cn(
          "h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
          cfg.bg,
          cfg.color
        )}
      >
        {cfg.icon}
      </div>

      {/* content */}
      <div className="flex-1 min-w-0 pr-6">
        <p
          className={cn(
            "text-xs font-semibold leading-snug",
            note.isRead ? "text-slate-700" : "text-slate-900"
          )}
        >
          {note.title}
        </p>
        <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">
          {note.message}
        </p>
        {note.data?.otp && (
          <p className="text-xs font-mono font-bold text-amber-600 mt-1 tracking-widest">
            OTP: {note.data.otp}
          </p>
        )}
        <p className="text-[10px] text-slate-400 mt-1">
          {timeAgo(note.createdAt)}
        </p>
      </div>

      {/* unread dot */}
      {!note.isRead && (
        <span className="absolute right-9 top-3.5 h-2 w-2 rounded-full bg-amber-400" />
      )}

      {/* delete button — appears on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note._id);
        }}
        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
        aria-label="Delete notification"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ── Bell button + panel ───────────────────────────────────────────────────────
export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    remove,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleMarkAll = async () => {
    if (!unreadCount) return;
    setMarkingAll(true);
    await markAllAsRead();
    setMarkingAll(false);
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative h-9 w-9 flex items-center justify-center rounded-xl border transition-colors",
          open
            ? "border-amber-300 bg-amber-50"
            : "border-slate-200 hover:border-amber-300 hover:bg-amber-50"
        )}
        aria-label="Notifications"
      >
        <Bell
          size={16}
          className={open ? "text-amber-600" : "text-slate-600"}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-0.5 rounded-full bg-amber-400 text-[10px] font-bold text-black flex items-center justify-center shadow">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-11 w-80 sm:w-96 rounded-2xl border border-slate-100 bg-white shadow-xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-amber-500" />
              <span className="text-sm font-semibold text-slate-800">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-600 transition-colors disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <CheckCheck size={11} />
                )}
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-slate-300" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <Bell size={28} className="text-slate-200" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((note) => (
                <NotificationRow
                  key={note._id}
                  note={note}
                  onRead={markAsRead}
                  onDelete={remove}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
