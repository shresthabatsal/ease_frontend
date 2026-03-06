import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useParams: () => ({ orderId: "order123" }),
}));
jest.mock("@/context/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/lib/api/order", () => ({
  getOrderById: jest.fn(),
  cancelOrder: jest.fn(),
  getOrderPayment: jest.fn(),
}));
jest.mock("@/lib/actions/public-action", () => ({
  handleGetStoreById: jest
    .fn()
    .mockResolvedValue({ success: true, data: { paymentQRCode: null } }),
}));
jest.mock("@/components/ProductCard", () => ({
  resolveImg: jest.fn(() => null),
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock("@/components/PaymentReceiptDialog", () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="receipt-dialog" /> : null,
}));

import OrderDetailPage from "@/app/orders/[orderId]/page";
import { useAuth } from "@/context/AuthContext";
import { getOrderById, cancelOrder, getOrderPayment } from "@/lib/api/order";
import { toast } from "sonner";

const baseOrder = {
  _id: "order123",
  storeId: {
    _id: "s1",
    storeName: "Thamel Store",
    pickupInstructions: "Show OTP",
    paymentQRCode: null,
  },
  items: [
    {
      productId: { _id: "p1", name: "Milk", price: 120, productImage: "" },
      quantity: 2,
      price: 120,
    },
  ],
  totalAmount: 240,
  pickupCode: "XYZ999",
  pickupDate: new Date(Date.now() + 86400000).toISOString(),
  pickupTime: "14:00",
  paymentStatus: "PENDING",
  status: "PENDING",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function setup(orderOverrides = {}) {
  (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
  (getOrderById as jest.Mock).mockResolvedValue({
    data: { ...baseOrder, ...orderOverrides },
  });
  (getOrderPayment as jest.Mock).mockRejectedValue(new Error("no payment"));
}

describe("OrderDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  it("renders store name and Order Details heading", async () => {
    render(<OrderDetailPage />);
    await waitFor(() =>
      expect(screen.getByText("Order Details")).toBeInTheDocument()
    );
    expect(screen.getByText("Thamel Store")).toBeInTheDocument();
  });

  it("shows upload receipt banner when payment is PENDING", async () => {
    render(<OrderDetailPage />);
    await waitFor(() => screen.getByText("Order Details"));
    expect(
      screen.getByText(/please submit your payment receipt/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upload/i })).toBeInTheDocument();
  });

  it("OTP is hidden when payment is PENDING (status is PENDING)", async () => {
    render(<OrderDetailPage />);
    await waitFor(() => screen.getByText("Order Details"));
    // pickupCode should NOT appear; instead a placeholder message is shown
    expect(screen.queryByText("XYZ999")).not.toBeInTheDocument();
    expect(
      screen.getByText(/available after payment verification/i)
    ).toBeInTheDocument();
  });

  it("calls cancelOrder and shows success toast on confirm", async () => {
    (cancelOrder as jest.Mock).mockResolvedValue({ success: true });
    (getOrderById as jest.Mock)
      .mockResolvedValueOnce({ data: baseOrder })
      .mockResolvedValueOnce({ data: { ...baseOrder, status: "CANCELLED" } });
    render(<OrderDetailPage />);
    await waitFor(() => screen.getByText("Order Details"));
    fireEvent.click(screen.getByRole("button", { name: /cancel order/i }));
    await waitFor(() => screen.getByRole("button", { name: /yes, cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, cancel/i }));
    await waitFor(() => expect(cancelOrder).toHaveBeenCalledWith("order123"));
    expect(toast.success).toHaveBeenCalledWith("Order cancelled successfully");
  });

  it("shows Cancel Order button when order status is PENDING", async () => {
    render(<OrderDetailPage />);
    await waitFor(() => screen.getByText("Order Details"));
    expect(
      screen.getByRole("button", { name: /cancel order/i })
    ).toBeInTheDocument();
  });

  it("does not show Cancel Order button when order is COLLECTED", async () => {
    setup({ status: "COLLECTED", paymentStatus: "VERIFIED" });
    render(<OrderDetailPage />);
    await waitFor(() => screen.getByText("Order Details"));
    expect(
      screen.queryByRole("button", { name: /cancel order/i })
    ).not.toBeInTheDocument();
  });

  it("shows Payment Failed badge when paymentStatus is FAILED", async () => {
    setup({ paymentStatus: "FAILED" });
    render(<OrderDetailPage />);
    await waitFor(() => screen.getByText("Order Details"));
    expect(screen.getByText("Payment Failed")).toBeInTheDocument();
  });

  it("shows Resubmit button when payment was rejected and order is not cancelled", async () => {
    setup({ paymentStatus: "FAILED" });
    render(<OrderDetailPage />);
    await waitFor(() => screen.getByText("Order Details"));
    expect(screen.getByText(/your payment was rejected/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /resubmit/i })
    ).toBeInTheDocument();
  });
});
