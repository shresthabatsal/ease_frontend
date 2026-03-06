import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));
jest.mock("@/context/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/lib/api/order", () => ({ getUserOrders: jest.fn() }));

import OrdersPage from "@/app/orders/page";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders } from "@/lib/api/order";

const orders = [
  {
    _id: "o1",
    storeId: { _id: "s1", storeName: "Thamel Store" },
    items: [{ productId: { name: "Milk" }, quantity: 1, price: 120 }],
    totalAmount: 120,
    pickupDate: "2026-04-01T00:00:00.000Z",
    pickupTime: "14:00",
    paymentStatus: "PENDING",
    status: "PENDING",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "o2",
    storeId: { _id: "s1", storeName: "Boudha Store" },
    items: [{ productId: { name: "Rice" }, quantity: 2, price: 500 }],
    totalAmount: 1000,
    pickupDate: "2026-04-02T00:00:00.000Z",
    pickupTime: "11:00",
    paymentStatus: "VERIFIED",
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
  },
];

describe("OrdersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
  });

  it("redirects to /login after auth check when not authenticated", async () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    (getUserOrders as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<OrdersPage />);
    // AuthContext wait is setTimeout(50ms)
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/login"), {
      timeout: 300,
    });
  });

  it("shows empty state message when user has no orders", async () => {
    (getUserOrders as jest.Mock).mockResolvedValue({ data: [] });
    render(<OrdersPage />);
    await waitFor(() =>
      expect(screen.getByText(/you have no orders yet/i)).toBeInTheDocument()
    );
    expect(
      screen.getByRole("link", { name: /browse products/i })
    ).toBeInTheDocument();
  });

  it("renders store name for each order", async () => {
    (getUserOrders as jest.Mock).mockResolvedValue({ data: orders });
    render(<OrdersPage />);
    await waitFor(() =>
      expect(screen.getByText("Thamel Store")).toBeInTheDocument()
    );
    expect(screen.getByText("Boudha Store")).toBeInTheDocument();
  });

  it("renders order status badges — Pending and Confirmed", async () => {
    (getUserOrders as jest.Mock).mockResolvedValue({ data: orders });
    render(<OrdersPage />);
    await waitFor(() => screen.getByText("Thamel Store"));
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("renders payment status badges — Payment Pending and Payment Verified", async () => {
    (getUserOrders as jest.Mock).mockResolvedValue({ data: orders });
    render(<OrdersPage />);
    await waitFor(() => screen.getByText("Thamel Store"));
    expect(screen.getByText("Payment Pending")).toBeInTheDocument();
    expect(screen.getByText("Payment Verified")).toBeInTheDocument();
  });

  it("each order is a link to /orders/:id", async () => {
    (getUserOrders as jest.Mock).mockResolvedValue({ data: orders });
    render(<OrdersPage />);
    await waitFor(() => screen.getByText("Thamel Store"));
    expect(screen.getByRole("link", { name: /thamel store/i })).toHaveAttribute(
      "href",
      "/orders/o1"
    );
    expect(screen.getByRole("link", { name: /boudha store/i })).toHaveAttribute(
      "href",
      "/orders/o2"
    );
  });

  it("renders total amount for each order", async () => {
    (getUserOrders as jest.Mock).mockResolvedValue({ data: orders });
    render(<OrdersPage />);
    await waitFor(() => screen.getByText("Thamel Store"));
    expect(screen.getByText(/Rs\. 120/)).toBeInTheDocument();
    expect(screen.getByText(/Rs\. 1,000/)).toBeInTheDocument();
  });

  it("renders pickup time for each order", async () => {
    (getUserOrders as jest.Mock).mockResolvedValue({ data: orders });
    render(<OrdersPage />);
    await waitFor(() => screen.getByText("Thamel Store"));
    expect(screen.getByText(/14:00/)).toBeInTheDocument();
    expect(screen.getByText(/11:00/)).toBeInTheDocument();
  });
});
