"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
  BackendCartItem,
  BackendCart,
} from "@/lib/api/cart";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export type { BackendCartItem };

interface CartContextProps {
  items: BackendCartItem[];
  totalPrice: number;
  itemCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => Promise<void>;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<BackendCart>({
    items: [],
    totalPrice: 0,
    itemCount: 0,
  });
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalPrice: 0, itemCount: 0 });
      return;
    }
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data ?? { items: [], totalPrice: 0, itemCount: 0 });
    } catch {
      setCart({ items: [], totalPrice: 0, itemCount: 0 });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch cart when auth state changes
  useEffect(() => {
    refetch();
  }, [refetch]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      try {
        await apiAddToCart(productId, quantity);
        await refetch();
      } catch (e: any) {
        const msg = e?.response?.data?.message || "Failed to add to cart";
        toast.error(msg);
        throw e;
      }
    },
    [refetch]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      try {
        await apiUpdateCartItem(cartItemId, quantity);
        await refetch();
      } catch (e: any) {
        const msg = e?.response?.data?.message || "Failed to update cart";
        toast.error(msg);
        throw e;
      }
    },
    [refetch]
  );

  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      try {
        await apiRemoveCartItem(cartItemId);
        await refetch();
      } catch (e: any) {
        const msg = e?.response?.data?.message || "Failed to remove item";
        toast.error(msg);
        throw e;
      }
    },
    [refetch]
  );

  const clearCart = useCallback(async () => {
    try {
      await apiClearCart();
      setCart({ items: [], totalPrice: 0, itemCount: 0 });
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to clear cart";
      toast.error(msg);
      throw e;
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        totalPrice: cart.totalPrice,
        itemCount: cart.itemCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refetch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextProps {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      items: [],
      totalPrice: 0,
      itemCount: 0,
      loading: false,
      addToCart: async () => {},
      updateQuantity: async () => {},
      removeFromCart: async () => {},
      clearCart: async () => {},
      refetch: async () => {},
    };
  }
  return ctx;
}
