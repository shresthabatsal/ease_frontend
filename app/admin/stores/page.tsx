"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import LocationPicker, { LatLng } from "@/components/LocationPicker";
import {
  Store,
  Plus,
  MapPin,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  ImageOff,
  QrCode,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
  /\/$/,
  ""
);
function resolveImg(path?: string) {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path.replace(/^\//, "")}`;
}

interface IStore {
  _id: string;
  storeName: string;
  location: string;
  coordinates?: { latitude: number; longitude: number };
  pickupInstructions: string;
  storeImage?: string;
  paymentQRCode?: string;
  createdAt: string;
}

interface StoreFormState {
  storeName: string;
  location: string;
  coordinates: { latitude: number; longitude: number } | null;
  pickupInstructions: string;
  storeImage: File | null;
  paymentQRCode: File | null;
}

const EMPTY_FORM: StoreFormState = {
  storeName: "",
  location: "",
  coordinates: null,
  pickupInstructions: "",
  storeImage: null,
  paymentQRCode: null,
};

// Store Form Dialog
function StoreFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: IStore | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<StoreFormState>(EMPTY_FORM);
  const [mapOpen, setMapOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          storeName: editing.storeName,
          location: editing.location,
          coordinates: editing.coordinates ?? null,
          pickupInstructions: editing.pickupInstructions,
          storeImage: null,
          paymentQRCode: null,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, editing]);

  const set =
    (field: keyof StoreFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleLocationConfirm = (latlng: LatLng, label: string) => {
    setForm((f) => ({
      ...f,
      coordinates: { latitude: latlng.lat, longitude: latlng.lng },
      location: f.location || label,
    }));
  };

  const validate = () => {
    if (!form.storeName.trim()) {
      toast.error("Store name is required");
      return false;
    }
    if (!form.location.trim()) {
      toast.error("Location is required");
      return false;
    }
    if (!form.coordinates) {
      toast.error("Please pick a location on the map");
      return false;
    }
    if (!form.pickupInstructions.trim()) {
      toast.error("Pickup instructions are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("storeName", form.storeName.trim());
      fd.append("location", form.location.trim());
      fd.append("coordinates[latitude]", String(form.coordinates!.latitude));
      fd.append("coordinates[longitude]", String(form.coordinates!.longitude));
      fd.append("pickupInstructions", form.pickupInstructions.trim());
      if (form.storeImage) fd.append("storeImage", form.storeImage);
      if (form.paymentQRCode) fd.append("paymentQRCode", form.paymentQRCode);

      if (editing) {
        await axios.put(API.ADMIN.STORES.UPDATE(editing._id), fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Store updated");
      } else {
        await axios.post(API.ADMIN.STORES.CREATE, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Store created");
      }
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save store");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Store" : "New Store"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update store details and location."
                : "Create a new pickup store location."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-1">
            {/* Store name */}
            <div className="flex flex-col gap-1.5">
              <Label>Store Name *</Label>
              <Input
                value={form.storeName}
                onChange={set("storeName")}
                placeholder="e.g. Downtown Branch"
                className="rounded-xl border-slate-200"
              />
            </div>

            {/* Location + map picker */}
            <div className="flex flex-col gap-1.5">
              <Label>Location *</Label>
              <div className="flex gap-2">
                <Input
                  value={form.location}
                  onChange={set("location")}
                  placeholder="e.g. Thamel, Kathmandu"
                  className="rounded-xl border-slate-200 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMapOpen(true)}
                  className={cn(
                    "rounded-xl gap-1.5 flex-shrink-0 text-xs",
                    form.coordinates
                      ? "border-amber-300 text-amber-700 bg-amber-50"
                      : "border-slate-200"
                  )}
                >
                  <MapPin size={13} />
                  {form.coordinates ? "Move pin" : "Pick on map"}
                </Button>
              </div>
              {form.coordinates ? (
                <p className="text-xs font-mono text-muted-foreground pl-1">
                  📍 {form.coordinates.latitude.toFixed(5)},{" "}
                  {form.coordinates.longitude.toFixed(5)}
                </p>
              ) : (
                <p className="text-xs text-amber-600 pl-1">
                  ⚠ No coordinates — click "Pick on map"
                </p>
              )}
            </div>

            {/* Pickup instructions */}
            <div className="flex flex-col gap-1.5">
              <Label>Pickup Instructions *</Label>
              <Textarea
                value={form.pickupInstructions}
                onChange={set("pickupInstructions")}
                placeholder="e.g. Come to the ground floor counter and show your OTP"
                rows={3}
                className="rounded-xl border-slate-200 resize-none"
              />
            </div>

            {/* Store image */}
            <div className="flex flex-col gap-1.5">
              <Label>Store Image</Label>
              {editing?.storeImage && !form.storeImage && (
                <img
                  src={resolveImg(editing.storeImage)}
                  alt="Current"
                  className="h-16 w-16 rounded-xl object-cover border border-slate-200"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    storeImage: e.target.files?.[0] ?? null,
                  }))
                }
                className="text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-amber-50 file:text-amber-700 file:font-medium file:px-3 file:py-1.5 file:text-xs hover:file:bg-amber-100 cursor-pointer"
              />
            </div>

            {/* Payment QR */}
            <div className="flex flex-col gap-1.5">
              <Label>Payment QR Code</Label>
              {editing?.paymentQRCode && !form.paymentQRCode && (
                <img
                  src={resolveImg(editing.paymentQRCode)}
                  alt="Current QR"
                  className="h-16 w-16 rounded-xl object-cover border border-slate-200"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    paymentQRCode: e.target.files?.[0] ?? null,
                  }))
                }
                className="text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-amber-50 file:text-amber-700 file:font-medium file:px-3 file:py-1.5 file:text-xs hover:file:bg-amber-100 cursor-pointer"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-semibold gap-2 shadow-none mt-1"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Store size={14} />
                  {editing ? "Update Store" : "Create Store"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LocationPicker
        open={mapOpen}
        onOpenChange={setMapOpen}
        initialValue={
          form.coordinates
            ? {
                lat: form.coordinates.latitude,
                lng: form.coordinates.longitude,
              }
            : undefined
        }
        onConfirm={handleLocationConfirm}
      />
    </>
  );
}

// Store card
function StoreCard({
  store,
  onEdit,
  onDelete,
}: {
  store: IStore;
  onEdit: (s: IStore) => void;
  onDelete: (id: string) => void;
}) {
  const img = resolveImg(store.storeImage);
  const qr = resolveImg(store.paymentQRCode);

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 transition-all">
      {/* Store image */}
      <div className="h-20 w-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
        {img ? (
          <img
            src={img}
            alt={store.storeName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageOff size={20} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900">{store.storeName}</h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(store)}
              className="h-8 w-8 p-0 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-amber-600"
            >
              <Pencil size={14} />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl sm:max-w-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete "{store.storeName}"?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the store and all its data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(store._id)}
                    className="rounded-xl bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin size={11} className="text-amber-500 flex-shrink-0" />
          <span className="truncate">{store.location}</span>
        </div>

        {store.coordinates && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Navigation size={10} className="flex-shrink-0" />
            {store.coordinates.latitude.toFixed(5)},{" "}
            {store.coordinates.longitude.toFixed(5)}
          </div>
        )}

        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
          {store.pickupInstructions}
        </p>

        <div className="flex items-center gap-3 mt-1">
          {qr && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <QrCode size={11} />
              <span>QR code set</span>
            </div>
          )}
          {!store.coordinates && (
            <span className="text-xs text-amber-600">⚠ No coordinates</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<IStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IStore | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API.ADMIN.STORES.GET_ALL);
      setStores(res.data?.data ?? res.data ?? []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to load stores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (store: IStore) => {
    setEditing(store);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(API.ADMIN.STORES.DELETE(id));
      toast.success("Store deleted");
      setStores((prev) => prev.filter((s) => s._id !== id));
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to delete store");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Stores</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage pickup store locations
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={load}
              disabled={loading}
              variant="outline"
              className="rounded-xl gap-2"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button
              onClick={openCreate}
              className="rounded-xl gap-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold shadow-none"
            >
              <Plus size={14} />
              New Store
            </Button>
          </div>
        </div>

        {/* Store count */}
        {!loading && stores.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {stores.length} store{stores.length !== 1 ? "s" : ""} total
            {stores.filter((s) => !s.coordinates).length > 0 && (
              <span className="text-amber-600 ml-2">
                · {stores.filter((s) => !s.coordinates).length} missing
                coordinates
              </span>
            )}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && stores.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Store size={40} className="text-slate-300" />
            <p className="text-sm">No stores yet.</p>
            <Button
              onClick={openCreate}
              className="rounded-xl gap-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold shadow-none"
            >
              <Plus size={14} />
              Create first store
            </Button>
          </div>
        )}

        {/* List */}
        {!loading && stores.length > 0 && (
          <div className="flex flex-col gap-3">
            {stores.map((store) => (
              <StoreCard
                key={store._id}
                store={store}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <StoreFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={load}
      />
    </>
  );
}
