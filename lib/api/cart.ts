import axios from "./axios";
import { API } from "./endpoints";

export interface BackendCartItem {
  _id: string; // cart item ID — used for update/remove
  productId: {
    _id: string;
    name: string;
    price: number;
    productImage: string;
    quantity: number;
    description: string;
    categoryId: any;
    subcategoryId: any;
    storeId: any;
  };
  userId: any;
  quantity: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendCart {
  items: BackendCartItem[];
  totalPrice: number;
  itemCount: number;
}

// GET /api/user/cart
export const getCart = async (): Promise<BackendCart> => {
  const res = await axios.get(API.PUBLIC.CART.GET);
  return res.data.data;
};

// POST /api/user/cart  { productId, quantity }
export const addToCart = async (productId: string, quantity: number) => {
  const res = await axios.post(API.PUBLIC.CART.ADD, { productId, quantity });
  return res.data;
};

// PUT /api/user/cart/:cartItemId  { quantity }
export const updateCartItem = async (cartItemId: string, quantity: number) => {
  const res = await axios.put(API.PUBLIC.CART.UPDATE(cartItemId), { quantity });
  return res.data;
};

// DELETE /api/user/cart/:cartItemId
export const removeCartItem = async (cartItemId: string) => {
  const res = await axios.delete(API.PUBLIC.CART.REMOVE(cartItemId));
  return res.data;
};

// DELETE /api/user/cart
export const clearCart = async () => {
  const res = await axios.delete(API.PUBLIC.CART.CLEAR);
  return res.data;
};
