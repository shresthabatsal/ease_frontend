import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock("@/components/ProductCard", () => ({
  resolveImg: jest.fn(() => null),
}));
jest.mock("@/context/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/context/StoreContext", () => ({ useStore: jest.fn() }));
jest.mock("@/context/CartContext", () => ({ useCart: jest.fn() }));

import CartPage from "@/app/cart/page";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const mockUpdateQuantity = jest.fn();
const mockRemoveFromCart = jest.fn();
const mockClearCart = jest.fn();

const item = {
  _id: "ci1",
  productId: {
    _id: "p1",
    name: "Milk",
    price: 120,
    quantity: 10,
    productImage: "",
  },
  quantity: 2,
  subtotal: 240,
};

function setup(overrides = {}) {
  (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
  (useStore as jest.Mock).mockReturnValue({
    selectedStore: { _id: "s1", storeName: "Thamel Store" },
  });
  (useCart as jest.Mock).mockReturnValue({
    items: [item],
    totalPrice: 240,
    itemCount: 1,
    loading: false,
    updateQuantity: mockUpdateQuantity,
    removeFromCart: mockRemoveFromCart,
    clearCart: mockClearCart,
    ...overrides,
  });
}

describe("CartPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  it("shows login prompt with Login link when not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    render(<CartPage />);
    expect(
      screen.getByText(/please log in to view your cart/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });

  it("renders item name, price, and subtotal", () => {
    render(<CartPage />);
    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText(/Rs\. 120/)).toBeInTheDocument();
    // subtotal appears in the item row and summary — at least once
    expect(screen.getAllByText(/Rs\. 240/).length).toBeGreaterThan(0);
  });

  it("shows empty state when cart has no items", () => {
    setup({ items: [], totalPrice: 0, itemCount: 0 });
    render(<CartPage />);
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /browse products/i })
    ).toBeInTheDocument();
  });

  it("calls clearCart and shows success toast when Clear all is clicked", async () => {
    mockClearCart.mockResolvedValue(undefined);
    render(<CartPage />);
    fireEvent.click(screen.getByRole("button", { name: /clear all/i }));
    await waitFor(() => expect(mockClearCart).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Cart cleared");
  });

  it("navigates to /checkout when Proceed to Checkout is clicked", () => {
    render(<CartPage />);
    fireEvent.click(
      screen.getByRole("button", { name: /proceed to checkout/i })
    );
    expect(mockPush).toHaveBeenCalledWith("/checkout");
  });

  it("renders Your Cart heading", () => {
    render(<CartPage />);
    expect(screen.getByText("Your Cart")).toBeInTheDocument();
  });

  it("renders item count badge when itemCount > 0", () => {
    render(<CartPage />);
    // itemCount = 1, rendered in the badge span next to heading
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders Clear all button when items exist", () => {
    render(<CartPage />);
    expect(
      screen.getByRole("button", { name: /clear all/i })
    ).toBeInTheDocument();
  });

  it("does not render Clear all button when cart is empty", () => {
    setup({ items: [], totalPrice: 0, itemCount: 0 });
    render(<CartPage />);
    expect(
      screen.queryByRole("button", { name: /clear all/i })
    ).not.toBeInTheDocument();
  });

  it("renders Continue Shopping link pointing to /", () => {
    render(<CartPage />);
    expect(
      screen.getByRole("link", { name: /continue shopping/i })
    ).toHaveAttribute("href", "/");
  });
});
