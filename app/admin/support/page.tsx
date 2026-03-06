"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  type ITicket,
  type IMessage,
  type TicketStatus,
  updateTicketStatus,
  getMessages,
  sendMessage,
  getOpenTickets,
  getAdminMyTickets,
} from "@/lib/api/support";
import {
  handleGetOpenTickets,
  handleGetAdminMyTickets,
  handleAssignTicket,
  handleUpdateTicketStatus,
  handleGetMessages,
  handleSendMessage,
} from "@/lib/actions/support-action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Send,
  Loader2,
  Inbox,
  ChevronLeft,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Shield,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CFG = {
  OPEN: { label: "Open", color: "bg-blue-50 text-blue-700 border-blue-200" },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  RESOLVED: {
    label: "Resolved",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  CLOSED: {
    label: "Closed",
    color: "bg-slate-100 text-slate-500 border-slate-200",
  },
};
const PRIORITY_CFG = {
  LOW: { label: "Low", dot: "bg-slate-400" },
  MEDIUM: { label: "Medium", dot: "bg-amber-400" },
  HIGH: { label: "High", dot: "bg-red-500" },
};
const CATEGORY_LABELS: Record<string, string> = {
  BUG: "Bug",
  COMPLAINT: "Complaint",
  REFUND: "Refund",
  DELIVERY: "Delivery",
  OTHER: "Other",
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Admin Chat View
function AdminChatView({
  ticket,
  currentUserId,
  onBack,
  onTicketUpdate,
}: {
  ticket: ITicket;
  currentUserId: string;
  onBack: () => void;
  onTicketUpdate: (t: ITicket) => void;
}) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<any>(null);

  const loadMessages = useCallback(async () => {
    try {
      setMessages(await getMessages(ticket._id));
    } catch {
      /* silent */
    }
  }, [ticket._id]);

  useEffect(() => {
    setLoading(true);
    loadMessages().finally(() => setLoading(false));
    pollRef.current = setInterval(loadMessages, 5000);

    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:5000";
    import("socket.io-client")
      .then(({ io }) => {
        const socket = io(wsUrl, {
          query: { userId: currentUserId },
          transports: ["websocket", "polling"],
        });
        socketRef.current = socket;
        socket.emit("join_ticket", ticket._id);
        socket.on("new_message", () => loadMessages());
      })
      .catch(() => {});

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      socketRef.current?.disconnect();
    };
  }, [ticket._id, currentUserId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const msg = text.trim();
    if (!msg || sending) return;
    setSending(true);
    setText("");
    try {
      const m = await sendMessage(ticket._id, msg);
      setMessages((prev) => [...prev, m]);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to send");
      setText(msg);
    } finally {
      setSending(false);
    }
  };

  const handleAssign = async () => {
    setAssigning(true);
    try {
      const assignRes = await handleAssignTicket(ticket._id);
      if (!assignRes.success) throw new Error(assignRes.message);
      const updated = assignRes.data;
      toast.success("Ticket assigned to you");
      onTicketUpdate(updated);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to assign");
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (status === "CLOSED") {
      setCloseConfirm(true);
      return;
    }
    setStatusChanging(true);
    try {
      const updated = await updateTicketStatus(ticket._id, status);
      toast.success("Status updated");
      onTicketUpdate(updated);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to update status");
    } finally {
      setStatusChanging(false);
    }
  };

  const handleClose = async () => {
    setStatusChanging(true);
    try {
      const updated = await updateTicketStatus(ticket._id, "CLOSED");
      toast.success("Ticket closed");
      onTicketUpdate(updated);
      setCloseConfirm(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to close");
    } finally {
      setStatusChanging(false);
    }
  };

  const isAssignedToMe =
    typeof ticket.adminId === "object"
      ? ticket.adminId._id === currentUserId
      : ticket.adminId === currentUserId;
  const isAssigned = !!ticket.adminId;
  const isClosed = ticket.status === "CLOSED";
  const ticketUser = typeof ticket.userId === "object" ? ticket.userId : null;
  const s = STATUS_CFG[ticket.status] ?? {
    label: ticket.status,
    color: "bg-slate-100 text-slate-500 border-slate-200",
  };
  const p = PRIORITY_CFG[ticket.priority] ?? {
    label: ticket.priority,
    dot: "bg-slate-400",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 border-b border-slate-100 flex-shrink-0 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 w-8 p-0 rounded-xl flex-shrink-0"
        >
          <ChevronLeft size={16} />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-slate-900 truncate">
              {ticket.title}
            </h2>
            <Badge className={cn("text-xs border", s.color)}>{s.label}</Badge>
            <span
              className={cn("h-2 w-2 rounded-full flex-shrink-0", p.dot)}
              title={p.label}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {CATEGORY_LABELS[ticket.category]} ·{" "}
            {ticketUser?.fullName ?? "Unknown user"}
            <span className="mx-1">·</span>
            {timeAgo(ticket.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {/* Assign button */}
          {!isAssigned && (
            <Button
              size="sm"
              onClick={handleAssign}
              disabled={assigning}
              className="rounded-xl h-8 px-3 gap-1.5 bg-amber-400 hover:bg-amber-500 text-black font-semibold shadow-none text-xs"
            >
              {assigning ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <UserCheck size={12} />
              )}
              Take ticket
            </Button>
          )}
          {isAssignedToMe && !isClosed && (
            <Select
              value={ticket.status}
              onValueChange={(v) => handleStatusChange(v as TicketStatus)}
            >
              <SelectTrigger className="rounded-xl h-8 text-xs border-slate-200 w-36">
                {statusChanging ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <SelectValue />
                )}
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Close ticket</SelectItem>
              </SelectContent>
            </Select>
          )}
          {isAssigned && !isAssignedToMe && (
            <span className="text-xs text-slate-500">
              Assigned to{" "}
              {typeof ticket.adminId === "object"
                ? ticket.adminId.fullName
                : "admin"}
            </span>
          )}
        </div>
      </div>

      {/* Not assigned yet — prompt */}
      {!isAssigned && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2 flex-shrink-0">
          <AlertCircle size={14} className="text-blue-500 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            This ticket is unassigned. Click <strong>Take ticket</strong> to
            start helping this user.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Issue description
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            {ticket.description}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-slate-300" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
            <MessageSquare size={24} className="text-slate-200" />
            <p className="text-xs">
              {isAssignedToMe
                ? "Send a message to start helping."
                : "No messages yet."}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const sender =
              typeof msg.senderId === "object" ? msg.senderId : null;
            const isMe =
              sender?._id === currentUserId ||
              (typeof msg.senderId === "string" &&
                msg.senderId === currentUserId);
            const isAdmin = msg.senderRole === "ADMIN";
            return (
              <div
                key={msg._id}
                className={cn(
                  "flex gap-2.5",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                    isAdmin
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {isAdmin ? <Shield size={12} /> : <User size={12} />}
                </div>
                <div
                  className={cn(
                    "flex flex-col gap-0.5 max-w-[75%]",
                    isMe ? "items-end" : "items-start"
                  )}
                >
                  <span className="text-[10px] text-muted-foreground px-1">
                    {isMe
                      ? "You (Admin)"
                      : sender?.fullName ?? (isAdmin ? "Admin" : "User")}
                  </span>
                  <div
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                      isMe
                        ? "bg-amber-400 text-black rounded-tr-sm"
                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                    )}
                  >
                    {msg.message}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">
                    {timeAgo(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isAssignedToMe && !isClosed ? (
        <div className="p-4 border-t border-slate-100 flex gap-2 flex-shrink-0">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Reply to user…"
            className="flex-1 rounded-xl border-slate-200 h-10"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="h-10 w-10 p-0 rounded-xl bg-amber-400 hover:bg-amber-500 text-black shadow-none flex-shrink-0"
          >
            {sending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </Button>
        </div>
      ) : !isClosed && !isAssigned ? (
        <div className="p-4 border-t border-slate-100 text-center text-xs text-slate-400 flex-shrink-0">
          Assign this ticket to yourself to reply.
        </div>
      ) : isClosed ? (
        <div className="p-4 border-t border-slate-100 text-center text-xs text-muted-foreground flex-shrink-0">
          This ticket is closed.
        </div>
      ) : (
        <div className="p-4 border-t border-slate-100 text-center text-xs text-slate-400 flex-shrink-0">
          Another admin is handling this ticket.
        </div>
      )}

      <AlertDialog open={closeConfirm} onOpenChange={setCloseConfirm}>
        <AlertDialogContent className="rounded-2xl sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Close this ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the issue as resolved and ends the conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClose}
              className="rounded-xl bg-slate-900 hover:bg-slate-800"
            >
              Close ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Ticket row ────────────────────────────────────────────────────────────────
function AdminTicketRow({
  ticket,
  active,
  onClick,
}: {
  ticket: ITicket;
  active: boolean;
  onClick: () => void;
}) {
  const s = STATUS_CFG[ticket.status] ?? {
    label: ticket.status,
    color: "bg-slate-100 text-slate-500 border-slate-200",
  };
  const p = PRIORITY_CFG[ticket.priority] ?? {
    label: ticket.priority,
    dot: "bg-slate-400",
  };
  const user = typeof ticket.userId === "object" ? ticket.userId : null;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-start gap-3 p-3.5 rounded-2xl border transition-all",
        active
          ? "border-amber-300 bg-amber-50"
          : "border-slate-100 bg-white hover:border-slate-200"
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-full flex-shrink-0 mt-2", p.dot)}
        title={p.label}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {ticket.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {user?.fullName ?? "Unknown"} · {CATEGORY_LABELS[ticket.category]}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full border font-medium",
              s.color
            )}
          >
            {s.label}
          </span>
          <span className="text-[10px] text-slate-400">
            {timeAgo(ticket.createdAt)}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function AdminSupportPage() {
  const { user } = useAuth();
  const [openTickets, setOpenTickets] = useState<ITicket[]>([]);
  const [myTickets, setMyTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ITicket | null>(null);
  const [activeTab, setActiveTab] = useState("open");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [open, mine] = await Promise.all([
        getOpenTickets(),
        getAdminMyTickets(),
      ]);
      setOpenTickets(open);
      setMyTickets(mine);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleTicketUpdate = (updated: ITicket) => {
    setOpenTickets((prev) =>
      prev.filter((t) => t._id !== updated._id || updated.status === "OPEN")
    );
    setMyTickets((prev) => {
      const exists = prev.find((t) => t._id === updated._id);
      if (exists) return prev.map((t) => (t._id === updated._id ? updated : t));
      if (updated.adminId) return [updated, ...prev];
      return prev;
    });
    setSelected(updated);
  };

  const currentUserId = user?._id as string;
  const currentList = activeTab === "open" ? openTickets : myTickets;

  return (
    <div className="flex flex-col gap-4 p-6 h-[calc(100vh-40px)]">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">
            {openTickets.length} open ·{" "}
            {myTickets.filter((t) => t.status === "IN_PROGRESS").length} in
            progress
          </p>
        </div>
        <Button
          onClick={load}
          disabled={loading}
          variant="outline"
          className="rounded-xl gap-2"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Main panel */}
      <div className="flex-1 flex gap-4 overflow-hidden rounded-2xl border border-slate-100">
        {/* Sidebar */}
        <div
          className={cn(
            "flex flex-col overflow-hidden border-r border-slate-100",
            selected
              ? "hidden md:flex md:w-72 lg:w-80 flex-shrink-0"
              : "flex flex-1"
          )}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <TabsList className="grid grid-cols-2 m-3 h-9 rounded-xl bg-slate-100 flex-shrink-0">
              <TabsTrigger value="open" className="rounded-lg text-xs">
                Open {openTickets.length > 0 && `(${openTickets.length})`}
              </TabsTrigger>
              <TabsTrigger value="mine" className="rounded-lg text-xs">
                Assigned {myTickets.length > 0 && `(${myTickets.length})`}
              </TabsTrigger>
            </TabsList>

            {["open", "mine"].map((tab) => (
              <TabsContent
                key={tab}
                value={tab}
                className="flex-1 overflow-y-auto px-3 pb-3 m-0 flex flex-col gap-2"
              >
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-2xl" />
                  ))
                ) : currentList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 py-16">
                    <Inbox size={32} className="text-slate-200" />
                    <p className="text-xs text-center">
                      {tab === "open"
                        ? "No open tickets."
                        : "No tickets assigned to you."}
                    </p>
                  </div>
                ) : (
                  currentList.map((t) => (
                    <AdminTicketRow
                      key={t._id}
                      ticket={t}
                      active={selected?._id === t._id}
                      onClick={() => setSelected(t)}
                    />
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Chat pane */}
        {selected ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <AdminChatView
              ticket={selected}
              currentUserId={currentUserId}
              onBack={() => setSelected(null)}
              onTicketUpdate={handleTicketUpdate}
            />
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-slate-400 flex-col gap-3">
            <MessageSquare size={36} className="text-slate-200" />
            <p className="text-sm">Select a ticket to view or respond</p>
          </div>
        )}
      </div>
    </div>
  );
}
