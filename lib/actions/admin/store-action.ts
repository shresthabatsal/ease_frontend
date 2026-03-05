import {
  adminGetAllStores,
  adminCreateStore,
  adminUpdateStore,
  adminDeleteStore,
} from "@/lib/api/admin/store";

type ActionResult<T = any> = Promise<{
  success: boolean;
  data?: T;
  message?: string;
}>;

export const handleGetAllStores = async (): ActionResult => {
  try {
    const data = await adminGetAllStores();
    return { success: true, data };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to load stores",
    };
  }
};

export const handleCreateStore = async (formData: FormData): ActionResult => {
  try {
    const data = await adminCreateStore(formData);
    return { success: true, data, message: "Store created" };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to create store",
    };
  }
};

export const handleUpdateStore = async (
  id: string,
  formData: FormData
): ActionResult => {
  try {
    const data = await adminUpdateStore(id, formData);
    return { success: true, data, message: "Store updated" };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to update store",
    };
  }
};

export const handleDeleteStore = async (id: string): ActionResult => {
  try {
    await adminDeleteStore(id);
    return { success: true, message: "Store deleted" };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to delete store",
    };
  }
};
