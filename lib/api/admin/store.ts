import axios from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

export interface IStore {
  _id: string;
  storeName: string;
  location: string;
  coordinates?: { latitude: number; longitude: number };
  pickupInstructions: string;
  storeImage?: string;
  paymentQRCode?: string;
  createdAt: string;
}

export const adminGetAllStores = async (): Promise<IStore[]> => {
  const res = await axios.get(API.ADMIN.STORES.GET_ALL);
  return res.data?.data ?? res.data ?? [];
};

export const adminCreateStore = async (formData: FormData): Promise<IStore> => {
  const res = await axios.post(API.ADMIN.STORES.CREATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const adminUpdateStore = async (
  id: string,
  formData: FormData
): Promise<IStore> => {
  const res = await axios.put(API.ADMIN.STORES.UPDATE(id), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const adminDeleteStore = async (id: string): Promise<void> => {
  await axios.delete(API.ADMIN.STORES.DELETE(id));
};
