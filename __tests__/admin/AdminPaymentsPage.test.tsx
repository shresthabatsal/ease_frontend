import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/actions/admin/order-action", () => ({
  fetchStoreOrders: jest.fn(),
  fetchOrderPayment: jest.fn(),
  verifyPaymentAction: jest.fn(),
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock("@/context/StoreContext", () => ({ useStore: jest.fn() }));

import AdminPaymentsPage from "@/app/admin/payments/page";
import {
  fetchStoreOrders,
  fetchOrderPayment,
  verifyPaymentAction,
} from "@/lib/actions/admin/order-action";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";

const stores = [{ _id: "s1", storeName: "Thamel Store" }];
const order = {
  _id: "ord1",
  userId: { _id: "u1", fullName: "Ram Bahadur", email: "ram@test.com" },
  totalAmount: 1500,
  paymentStatus: "PENDING",
  status: "PENDING",
  pickupDate: "2026-04-01T00:00:00.000Z",
  pickupTime: "14:00",
  createdAt: new Date().toISOString(),
};
const payment = {
  _id: "pay1",
  orderId: "ord1",
  amount: 1500,
  paymentMethod: "eSewa",
  receiptImage: "/uploads/receipt.jpg",
  status: "PENDING",
  submittedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

function setup(paymentOverrides = {}) {
  (useStore as jest.Mock).mockReturnValue({ stores, selectedStore: stores[0] });
  (fetchStoreOrders as jest.Mock).mockResolvedValue({
    success: true,
    data: [order],
  });
  (fetchOrderPayment as jest.Mock).mockResolvedValue({
    success: true,
    data: { ...payment, ...paymentOverrides },
  });
}

describe("AdminPaymentsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  it("renders the Payments heading", async () => {
    render(<AdminPaymentsPage />);
    await waitFor(() =>
      expect(screen.getByText("Payments")).toBeInTheDocument()
    );
  });

  it("shows 'Select a store above to view payments.' when no store selected", async () => {
    (useStore as jest.Mock).mockReturnValue({ stores, selectedStore: null });
    render(<AdminPaymentsPage />);
    await waitFor(() =>
      expect(
        screen.getByText("Select a store above to view payments.")
      ).toBeInTheDocument()
    );
  });

  it("opens Review Payment dialog with customer name when row is clicked", async () => {
    render(<AdminPaymentsPage />);
    await waitFor(() => screen.getByText("Ram Bahadur"));
    fireEvent.click(screen.getByText("Ram Bahadur").closest("button")!);
    await waitFor(() =>
      expect(screen.getByText("Review Payment")).toBeInTheDocument()
    );
    expect(screen.getAllByText("Ram Bahadur").length).toBeGreaterThan(1);
  });

  it("calls verifyPaymentAction with VERIFIED when Verify is clicked", async () => {
    (verifyPaymentAction as jest.Mock).mockResolvedValue({ success: true });
    render(<AdminPaymentsPage />);
    await waitFor(() => screen.getByText("Ram Bahadur"));
    fireEvent.click(screen.getByText("Ram Bahadur").closest("button")!);
    await waitFor(() => screen.getByRole("button", { name: /^verify$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^verify$/i }));
    await waitFor(() =>
      expect(verifyPaymentAction).toHaveBeenCalledWith(
        "pay1",
        expect.objectContaining({ status: "VERIFIED" })
      )
    );
  });

  it("shows error toast when Reject is clicked without notes", async () => {
    render(<AdminPaymentsPage />);
    await waitFor(() => screen.getByText("Ram Bahadur"));
    fireEvent.click(screen.getByText("Ram Bahadur").closest("button")!);
    await waitFor(() => screen.getByRole("button", { name: /^reject$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^reject$/i }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Please add a reason for rejection"
      )
    );
    expect(verifyPaymentAction).not.toHaveBeenCalled();
  });

  it("calls verifyPaymentAction with REJECTED and notes when notes are provided", async () => {
    (verifyPaymentAction as jest.Mock).mockResolvedValue({ success: true });
    render(<AdminPaymentsPage />);
    await waitFor(() => screen.getByText("Ram Bahadur"));
    fireEvent.click(screen.getByText("Ram Bahadur").closest("button")!);
    await waitFor(() => screen.getByPlaceholderText("Add verification notes…"));
    await userEvent.type(
      screen.getByPlaceholderText("Add verification notes…"),
      "Blurry receipt"
    );
    fireEvent.click(screen.getByRole("button", { name: /^reject$/i }));
    await waitFor(() =>
      expect(verifyPaymentAction).toHaveBeenCalledWith(
        "pay1",
        expect.objectContaining({
          status: "REJECTED",
          verificationNotes: "Blurry receipt",
        })
      )
    );
  });

  it("filters list when search term does not match any customer", async () => {
    render(<AdminPaymentsPage />);
    await waitFor(() => screen.getByText("Ram Bahadur"));
    await userEvent.type(
      screen.getByPlaceholderText("Search by name or email…"),
      "nobody"
    );
    await waitFor(() =>
      expect(screen.queryByText("Ram Bahadur")).not.toBeInTheDocument()
    );
  });

  it("renders Awaiting Verification, Verified, All filter tab buttons", async () => {
    render(<AdminPaymentsPage />);
    await waitFor(() => screen.getByText("Payments"));
    expect(
      screen.getByRole("button", { name: /awaiting verification/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^verified/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^all/i })).toBeInTheDocument();
  });

  it("shows 'No payments awaiting verification.' when PENDING filter has no results", async () => {
    (fetchStoreOrders as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });
    render(<AdminPaymentsPage />);
    await waitFor(() =>
      expect(
        screen.getByText("No payments awaiting verification.")
      ).toBeInTheDocument()
    );
  });
});
