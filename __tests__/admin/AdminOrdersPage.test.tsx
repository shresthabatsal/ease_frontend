import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/actions/admin/order-action", () => ({
  fetchStoreOrders: jest.fn(),
  updateOrderStatus: jest.fn(),
  verifyOtpAction: jest.fn(),
  deleteOrderAction: jest.fn(),
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock("@/context/StoreContext", () => ({ useStore: jest.fn() }));
jest.mock("@/components/ProductCard", () => ({
  resolveImg: jest.fn(() => null),
}));

import AdminOrdersPage from "@/app/admin/orders/page";
import {
  fetchStoreOrders,
  updateOrderStatus,
  verifyOtpAction,
  deleteOrderAction,
} from "@/lib/actions/admin/order-action";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";

const stores = [{ _id: "s1", storeName: "Thamel Store" }];
const order = {
  _id: "ord1",
  userId: { _id: "u1", fullName: "Ram Bahadur", email: "ram@test.com" },
  storeId: { _id: "s1", storeName: "Thamel Store" },
  items: [
    {
      productId: { _id: "p1", name: "Milk", price: 120, productImage: "" },
      quantity: 1,
      price: 120,
    },
  ],
  totalAmount: 120,
  pickupDate: "2026-04-01T00:00:00.000Z",
  pickupTime: "14:00",
  paymentStatus: "PENDING",
  status: "PENDING",
  createdAt: new Date().toISOString(),
};

function setup(orderOverrides = {}) {
  (useStore as jest.Mock).mockReturnValue({ stores, selectedStore: stores[0] });
  (fetchStoreOrders as jest.Mock).mockResolvedValue({
    success: true,
    data: [{ ...order, ...orderOverrides }],
  });
}

describe("AdminOrdersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  it("renders the Orders heading", async () => {
    render(<AdminOrdersPage />);
    await waitFor(() => expect(screen.getByText("Orders")).toBeInTheDocument());
  });

  it("renders customer full name and email in the order row", async () => {
    render(<AdminOrdersPage />);
    await waitFor(() =>
      expect(screen.getByText("Ram Bahadur")).toBeInTheDocument()
    );
    expect(screen.getByText("ram@test.com")).toBeInTheDocument();
  });

  it("shows 'No orders yet.' when store has no orders", async () => {
    (fetchStoreOrders as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });
    render(<AdminOrdersPage />);
    await waitFor(() =>
      expect(screen.getByText("No orders yet.")).toBeInTheDocument()
    );
  });

  it("shows 'Select a store above to view orders.' when no store is selected", async () => {
    (useStore as jest.Mock).mockReturnValue({ stores, selectedStore: null });
    render(<AdminOrdersPage />);
    await waitFor(() =>
      expect(
        screen.getByText("Select a store above to view orders.")
      ).toBeInTheDocument()
    );
  });

  it("opens order detail dialog showing customer name when row is clicked", async () => {
    render(<AdminOrdersPage />);
    await waitFor(() => screen.getByText("Ram Bahadur"));
    fireEvent.click(screen.getByText("Ram Bahadur").closest("button")!);
    await waitFor(() =>
      expect(screen.getAllByText("Ram Bahadur").length).toBeGreaterThan(1)
    );
  });

  it("calls updateOrderStatus with CANCELLED when cancel button is clicked in dialog", async () => {
    setup({ status: "CONFIRMED" });
    (updateOrderStatus as jest.Mock).mockResolvedValue({ success: true });
    render(<AdminOrdersPage />);
    await waitFor(() => screen.getByText("Ram Bahadur"));
    fireEvent.click(screen.getByText("Ram Bahadur").closest("button")!);
    await waitFor(() =>
      screen.getByRole("button", { name: /mark as cancelled/i })
    );
    fireEvent.click(screen.getByRole("button", { name: /mark as cancelled/i }));
    await waitFor(() =>
      expect(updateOrderStatus).toHaveBeenCalledWith("ord1", "CANCELLED")
    );
  });

  it("filters out orders when search term doesn't match", async () => {
    render(<AdminOrdersPage />);
    await waitFor(() => screen.getByText("Ram Bahadur"));
    await userEvent.type(
      screen.getByPlaceholderText("Search by name, email…"),
      "nonexistent"
    );
    await waitFor(() =>
      expect(screen.queryByText("Ram Bahadur")).not.toBeInTheDocument()
    );
  });

  it("renders Refresh button", async () => {
    render(<AdminOrdersPage />);
    await waitFor(() => screen.getByText("Orders"));
    expect(
      screen.getByRole("button", { name: /refresh/i })
    ).toBeInTheDocument();
  });

  it("calls fetchStoreOrders with the selected store id on mount", async () => {
    render(<AdminOrdersPage />);
    await waitFor(() => expect(fetchStoreOrders).toHaveBeenCalledWith("s1"));
  });
});
