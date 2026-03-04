"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  createTicket,
  getMyTickets,
  getTicketById,
  getMessages,
  sendMessage,
  closeTicket,
  ITicket,
  IMessage,
  TicketCategory,
  TicketPriority,
} from "@/lib/api/support";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  MessageSquare,
  Plus,
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
} from "lucide-react";
import { cn } from "@/lib/utils";

// Helpers
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
  LOW: { label: "Low", color: "bg-slate-50 text-slate-500" },
  MEDIUM: { label: "Medium", color: "bg-amber-50 text-amber-700" },
  HIGH: { label: "High", color: "bg-red-50 text-red-600" },
};
const CATEGORY_LABELS: Record<TicketCategory, string> = {
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

// New Ticket Dialog
function NewTicketDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (t: ITicket) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("OTHER");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setCategory("OTHER");
      setPriority("MEDIUM");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSubmitting(true);
    try {
      const ticket = await createTicket({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      });
      toast.success("Support ticket created");
      onCreated(ticket);
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>New Support Ticket</DialogTitle>
          <DialogDescription>
            Describe your issue and we'll connect you with an admin.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your issue"
              className="rounded-xl border-slate-200"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail…"
              rows={4}
              className="rounded-xl border-slate-200 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as TicketCategory)}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {(Object.keys(CATEGORY_LABELS) as TicketCategory[]).map(
                    (k) => (
                      <SelectItem key={k} value={k}>
                        {CATEGORY_LABELS[k]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TicketPriority)}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-semibold gap-2 shadow-none"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Plus size={14} />
                Create Ticket
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Chat view
function ChatView({
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
  const [closeDialog, setCloseDialog] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<any>(null);

  const loadMessages = useCallback(async () => {
    try {
      const msgs = await getMessages(ticket._id);
      setMessages(msgs);
    } catch {
      /* silent */
    }
  }, [ticket._id]);

  useEffect(() => {
    setLoading(true);
    loadMessages().finally(() => setLoading(false));

    // Polling fallback
    pollRef.current = setInterval(loadMessages, 5000);

    // WebSocket for real-time
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
      const newMsg = await sendMessage(ticket._id, msg);
      setMessages((prev) => [...prev, newMsg]);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to send message");
      setText(msg);
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    try {
      const updated = await closeTicket(ticket._id);
      toast.success("Ticket closed");
      onTicketUpdate(updated);
      setCloseDialog(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to close ticket");
    }
  };

  const isClosed = ticket.status === "CLOSED";
  const adminUser = typeof ticket.adminId === "object" ? ticket.adminId : null;
  const statusCfg = STATUS_CFG[ticket.status];
  const priorityCfg = PRIORITY_CFG[ticket.priority];

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-start gap-3 p-4 border-b border-slate-100 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 w-8 p-0 rounded-xl flex-shrink-0 mt-0.5"
        >
          <ChevronLeft size={16} />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-slate-900 truncate">
              {ticket.title}
            </h2>
            <Badge className={cn("text-xs border", statusCfg.color)}>
              {statusCfg.label}
            </Badge>
            <Badge className={cn("text-xs", priorityCfg.color)}>
              {priorityCfg.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {CATEGORY_LABELS[ticket.category]} · {timeAgo(ticket.createdAt)}
            {adminUser && (
              <span className="ml-2">
                · Assigned to{" "}
                <span className="font-medium text-slate-700">
                  {adminUser.fullName}
                </span>
              </span>
            )}
            {!adminUser && ticket.status === "OPEN" && (
              <span className="ml-2 text-amber-600">· Awaiting admin</span>
            )}
          </p>
        </div>
        {!isClosed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCloseDialog(true)}
            className="rounded-xl h-8 px-3 text-xs flex-shrink-0 border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200"
          >
            Close ticket
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {/* Original description */}
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
            <p className="text-xs">No messages yet. Start the conversation.</p>
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
                {/* Avatar */}
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
                {/* Bubble */}
                <div
                  className={cn(
                    "flex flex-col gap-0.5 max-w-[75%]",
                    isMe ? "items-end" : "items-start"
                  )}
                >
                  <span className="text-[10px] text-muted-foreground px-1">
                    {isMe
                      ? "You"
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
      {!isClosed ? (
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
            placeholder="Type a message…"
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
      ) : (
        <div className="p-4 border-t border-slate-100 text-center text-xs text-muted-foreground flex-shrink-0">
          This ticket is closed.{" "}
          <Button
            variant="link"
            className="text-xs p-0 h-auto text-amber-600"
            onClick={() => {}}
          >
            Open a new ticket
          </Button>{" "}
          for further help.
        </div>
      )}

      <AlertDialog open={closeDialog} onOpenChange={setCloseDialog}>
        <AlertDialogContent className="rounded-2xl sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Close this ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this issue as resolved and close the conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Keep open
            </AlertDialogCancel>
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

// Ticket list item
function TicketRow({
  ticket,
  active,
  onClick,
}: {
  ticket: ITicket;
  active: boolean;
  onClick: () => void;
}) {
  const s = STATUS_CFG[ticket.status];
  const p = PRIORITY_CFG[ticket.priority];
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
      <div
        className={cn(
          "mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0",
          ticket.status === "OPEN"
            ? "bg-blue-50"
            : ticket.status === "IN_PROGRESS"
            ? "bg-amber-50"
            : "bg-slate-50"
        )}
      >
        {ticket.status === "OPEN" ? (
          <AlertCircle size={15} className="text-blue-500" />
        ) : ticket.status === "IN_PROGRESS" ? (
          <Clock size={15} className="text-amber-500" />
        ) : ticket.status === "RESOLVED" ? (
          <CheckCircle2 size={15} className="text-green-500" />
        ) : (
          <XCircle size={15} className="text-slate-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {ticket.title}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {CATEGORY_LABELS[ticket.category]}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full border font-medium",
              s.color
            )}
          >
            {s.label}
          </span>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
              p.color
            )}
          >
            {p.label}
          </span>
          <span className="text-[10px] text-slate-400">
            {timeAgo(ticket.createdAt)}
          </span>
        </div>
      </div>
    </button>
  );
}

// Main Page
export default function UserSupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ITicket | null>(null);
  const [newDialog, setNewDialog] = useState(false);

  const load = useCallback(async () => {
    try {
      const t = await getMyTickets();
      setTickets(t);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreated = (t: ITicket) => {
    setTickets((prev) => [t, ...prev]);
    setSelected(t);
  };

  const handleTicketUpdate = (updated: ITicket) => {
    setTickets((prev) =>
      prev.map((t) => (t._id === updated._id ? updated : t))
    );
    setSelected(updated);
  };

  const currentUserId = user?._id as string;

  return (
    <>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 flex flex-col gap-4 h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Support</h1>
            <p className="text-sm text-muted-foreground">
              Report an issue or track your requests
            </p>
          </div>
          <Button
            onClick={() => setNewDialog(true)}
            className="rounded-xl gap-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold shadow-none"
          >
            <Plus size={14} />
            New Ticket
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 flex gap-4 overflow-hidden rounded-2xl border border-slate-100">
          {/* Ticket list */}
          <div
            className={cn(
              "flex flex-col border-r border-slate-100 overflow-hidden",
              selected
                ? "hidden md:flex md:w-72 lg:w-80 flex-shrink-0"
                : "flex flex-1"
            )}
          >
            <div className="p-3 border-b border-slate-50 flex-shrink-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Your Tickets {tickets.length > 0 && `· ${tickets.length}`}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-2xl" />
                ))
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 py-16">
                  <Inbox size={32} className="text-slate-200" />
                  <p className="text-xs text-center">
                    No tickets yet.
                    <br />
                    Create one to get help.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setNewDialog(true)}
                    className="rounded-xl gap-1.5 bg-amber-400 hover:bg-amber-500 text-black font-semibold shadow-none h-8 text-xs"
                  >
                    <Plus size={12} />
                    New Ticket
                  </Button>
                </div>
              ) : (
                tickets.map((t) => (
                  <TicketRow
                    key={t._id}
                    ticket={t}
                    active={selected?._id === t._id}
                    onClick={() => setSelected(t)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Chat pane */}
          {selected ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <ChatView
                ticket={selected}
                currentUserId={currentUserId}
                onBack={() => setSelected(null)}
                onTicketUpdate={handleTicketUpdate}
              />
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-slate-400 flex-col gap-3">
              <MessageSquare size={36} className="text-slate-200" />
              <p className="text-sm">
                Select a ticket to view the conversation
              </p>
            </div>
          )}
        </div>
      </div>

      <NewTicketDialog
        open={newDialog}
        onOpenChange={setNewDialog}
        onCreated={handleCreated}
      />
    </>
  );
}
