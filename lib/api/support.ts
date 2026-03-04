import axios from "./axios";
import { API } from "./endpoints";

export type TicketCategory =
  | "BUG"
  | "COMPLAINT"
  | "REFUND"
  | "DELIVERY"
  | "OTHER";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface ITicketUser {
  _id: string;
  fullName: string;
  email: string;
}

export interface ITicket {
  _id: string;
  userId: ITicketUser | string;
  adminId?: ITicketUser | string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IMessage {
  _id: string;
  ticketId: string;
  senderId:
    | {
        _id: string;
        fullName: string;
        email: string;
        profilePictureUrl?: string;
      }
    | string;
  senderRole: "USER" | "ADMIN";
  message: string;
  attachmentUrl?: string;
  createdAt: string;
}

// ── Tickets ───────────────────────────────────────────────────────────────────
export const createTicket = async (data: {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
}): Promise<ITicket> => {
  const res = await axios.post(API.PUBLIC.SUPPORT.TICKETS.CREATE, data);
  return res.data.data;
};

export const getMyTickets = async (): Promise<ITicket[]> => {
  const res = await axios.get(API.PUBLIC.SUPPORT.TICKETS.GET_MY);
  return res.data.data ?? [];
};

export const getTicketById = async (id: string): Promise<ITicket> => {
  const res = await axios.get(API.PUBLIC.SUPPORT.TICKETS.GET_ONE(id));
  return res.data.data;
};

export const closeTicket = async (id: string): Promise<ITicket> => {
  const res = await axios.put(API.PUBLIC.SUPPORT.TICKETS.CLOSE(id));
  return res.data.data;
};

// ── Admin ticket actions ──────────────────────────────────────────────────────
export const getOpenTickets = async (): Promise<ITicket[]> => {
  const res = await axios.get(API.PUBLIC.SUPPORT.ADMIN_TICKETS.GET_OPEN);
  return res.data.data ?? [];
};

export const getAdminMyTickets = async (): Promise<ITicket[]> => {
  const res = await axios.get(API.PUBLIC.SUPPORT.ADMIN_TICKETS.GET_MINE);
  return res.data.data ?? [];
};

export const assignTicket = async (id: string): Promise<ITicket> => {
  const res = await axios.post(API.PUBLIC.SUPPORT.ADMIN_TICKETS.ASSIGN(id));
  return res.data.data;
};

export const updateTicketStatus = async (
  id: string,
  status: TicketStatus
): Promise<ITicket> => {
  const res = await axios.put(
    API.PUBLIC.SUPPORT.ADMIN_TICKETS.UPDATE_STATUS(id),
    { status }
  );
  return res.data.data;
};

// ── Messages ──────────────────────────────────────────────────────────────────
export const sendMessage = async (
  ticketId: string,
  message: string
): Promise<IMessage> => {
  const res = await axios.post(API.PUBLIC.SUPPORT.MESSAGES.SEND, {
    ticketId,
    message,
  });
  return res.data.data;
};

export const getMessages = async (ticketId: string): Promise<IMessage[]> => {
  const res = await axios.get(API.PUBLIC.SUPPORT.MESSAGES.GET(ticketId));
  return res.data.data ?? [];
};
