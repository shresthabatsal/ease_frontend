import axios from "./axios";
import { API } from "./endpoints";
import type { CartItem } from "@/context/CartContext";

// Clear backend cart then re-add all frontend cart items
export const syncCartToBackend = async (items: CartItem[]) => {
  // Clear existing backend cart
  try {
    await axios.delete(API.PUBLIC.CART.CLEAR);
  } catch {
    // ignore if already empty
  }

  // Add each item
  for (const item of items) {
    await axios.post(API.PUBLIC.CART.ADD, {
      productId: item.product._id,
      quantity: item.quantity,
    });
  }
};
