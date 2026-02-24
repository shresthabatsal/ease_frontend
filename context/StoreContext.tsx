"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "@/lib/api/axios";

export interface Store {
  _id: string;
  storeName: string;
  location: string;
  pickupInstructions: string;
  storeImage?: string;
}

interface StoreContextProps {
  stores: Store[];
  selectedStore: Store | null;
  setSelectedStore: (store: Store) => void;
  loadingStores: boolean;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStoreState] = useState<Store | null>(null);
  const [loadingStores, setLoadingStores] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/user/stores");
        const data: Store[] = res.data?.data ?? [];
        setStores(data);

        if (data.length) {
          // Restore last selected store from localStorage
          const savedId =
            typeof window !== "undefined"
              ? localStorage.getItem("selectedStoreId")
              : null;
          const match = data.find((s) => s._id === savedId);
          setSelectedStoreState(match ?? data[0]);
        }
      } catch (e) {
        console.error("Failed to load stores:", e);
      } finally {
        setLoadingStores(false);
      }
    })();
  }, []);

  const setSelectedStore = (store: Store) => {
    setSelectedStoreState(store);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedStoreId", store._id);
    }
  };

  return (
    <StoreContext.Provider
      value={{ stores, selectedStore, setSelectedStore, loadingStores }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextProps {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[useStore] Called outside of <StoreProvider>. " +
          "Make sure <StoreProvider> wraps your layout in app/layout.tsx."
      );
    }
    // Return a safe default so components don't crash
    return {
      stores: [],
      selectedStore: null,
      setSelectedStore: () => {},
      loadingStores: false,
    };
  }
  return ctx;
}
