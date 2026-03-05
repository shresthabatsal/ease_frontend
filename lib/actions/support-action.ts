import {
  createTicket,
  getMyTickets,
  getTicketById,
  closeTicket,
  getOpenTickets,
  getAdminMyTickets,
  assignTicket,
  updateTicketStatus,
  sendMessage,
  getMessages,
} from "@/lib/api/support";
import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/lib/api/support";

type ActionResult<T = any> = Promise<{
  success: boolean;
  data?: T;
  message?: string;
}>;

// User Tickets

export const handleCreateTicket = async (data: {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
}): ActionResult => {
  try {
    const ticket = await createTicket(data);
    return { success: true, data: ticket, message: "Support ticket created" };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to create ticket",
    };
  }
};

export const handleGetMyTickets = async (): ActionResult => {
  try {
    const tickets = await getMyTickets();
    return { success: true, data: tickets };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to load tickets",
    };
  }
};

export const handleGetTicketById = async (id: string): ActionResult => {
  try {
    const ticket = await getTicketById(id);
    return { success: true, data: ticket };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to load ticket",
    };
  }
};

export const handleCloseTicket = async (id: string): ActionResult => {
  try {
    const ticket = await closeTicket(id);
    return { success: true, data: ticket, message: "Ticket closed" };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to close ticket",
    };
  }
};

// Admin Tickets

export const handleGetOpenTickets = async (): ActionResult => {
  try {
    const tickets = await getOpenTickets();
    return { success: true, data: tickets };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to load open tickets",
    };
  }
};

export const handleGetAdminMyTickets = async (): ActionResult => {
  try {
    const tickets = await getAdminMyTickets();
    return { success: true, data: tickets };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to load assigned tickets",
    };
  }
};

export const handleAssignTicket = async (id: string): ActionResult => {
  try {
    const ticket = await assignTicket(id);
    return { success: true, data: ticket, message: "Ticket assigned to you" };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to assign ticket",
    };
  }
};

export const handleUpdateTicketStatus = async (
  id: string,
  status: TicketStatus
): ActionResult => {
  try {
    const ticket = await updateTicketStatus(id, status);
    return {
      success: true,
      data: ticket,
      message: `Ticket marked as ${status.toLowerCase().replace("_", " ")}`,
    };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to update ticket status",
    };
  }
};

// Messages

export const handleSendMessage = async (
  ticketId: string,
  message: string
): ActionResult => {
  try {
    const msg = await sendMessage(ticketId, message);
    return { success: true, data: msg };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to send message",
    };
  }
};

export const handleGetMessages = async (ticketId: string): ActionResult => {
  try {
    const msgs = await getMessages(ticketId);
    return { success: true, data: msgs };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to load messages",
    };
  }
};
