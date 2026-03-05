import axios from "../axios";
import { API } from "../endpoints";

// Update product (multipart — supports image upload)
export const updateProduct = async (productId: string, formData: FormData) => {
    const res = await axios.put(API.ADMIN.PRODUCTS.UPDATE(productId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  };
  
  // Delete product
  export const deleteProduct = async (productId: string) => {
    const res = await axios.delete(API.ADMIN.PRODUCTS.DELETE(productId));
    return res.data;
  };
  
  // Get all stores
  export const getAllStores = async () => {
    const res = await axios.get(API.ADMIN.STORES.GET_ALL);
    return res.data;
  };