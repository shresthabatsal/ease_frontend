"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LocationPicker, { LatLng } from "@/components/LocationPicker";
import { MapPin, Loader2, Store, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreFormData {
  storeName: string;
  location: string;
  coordinates: { latitude: number; longitude: number } | null;
  pickupInstructions: string;
}

interface AdminStoreFormProps {
  initialStore?: {
    _id: string;
    storeName: string;
    location: string;
    coordinates?: { latitude: number; longitude: number };
    pickupInstructions: string;
    storeImage?: string;
    paymentQRCode?: string;
  };
}

export default function AdminStoreForm({ initialStore }: AdminStoreFormProps) {
  const router = useRouter();
  const isEdit = !!initialStore;

  const [form, setForm] = useState<StoreFormData>({
    storeName: initialStore?.storeName ?? "",
    location: initialStore?.location ?? "",
    coordinates: initialStore?.coordinates ?? null,
    pickupInstructions: initialStore?.pickupInstructions ?? "",
  });
  const [storeImageFile, setStoreImageFile] = useState<File | null>(null);
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set =
    (field: keyof StoreFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleLocationConfirm = (latlng: LatLng, label: string) => {
    setForm((f) => ({
      ...f,
      coordinates: { latitude: latlng.lat, longitude: latlng.lng },
      // Auto-fill location text if empty
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
      if (storeImageFile) fd.append("storeImage", storeImageFile);
      if (qrCodeFile) fd.append("paymentQRCode", qrCodeFile);

      if (isEdit) {
        await axios.put(API.ADMIN.STORES.UPDATE(initialStore!._id), fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Store updated");
      } else {
        await axios.post(API.ADMIN.STORES.CREATE, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Store created");
      }

      router.push("/admin/stores");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save store");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="rounded-xl h-9 w-9 p-0"
          >
            <ArrowLeft size={15} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {isEdit ? "Edit Store" : "New Store"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "Update store details and location"
                : "Create a new pickup store location"}
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="flex flex-col gap-5 p-6 rounded-2xl border border-slate-200 bg-white">
          {/* Store name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="storeName">Store Name *</Label>
            <Input
              id="storeName"
              value={form.storeName}
              onChange={set("storeName")}
              placeholder="e.g. Downtown Branch"
              className="rounded-xl border-slate-200"
            />
          </div>

          {/* Location (text) + map picker */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location *</Label>
            <div className="flex gap-2">
              <Input
                id="location"
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
                  "rounded-xl gap-2 flex-shrink-0",
                  form.coordinates
                    ? "border-amber-300 text-amber-700 bg-amber-50"
                    : "border-slate-200"
                )}
              >
                <MapPin size={14} />
                {form.coordinates ? "Change pin" : "Pick on map"}
              </Button>
            </div>

            {/* Coordinates preview */}
            {form.coordinates && (
              <p className="text-xs text-muted-foreground font-mono pl-1">
                📍 {form.coordinates.latitude.toFixed(6)},{" "}
                {form.coordinates.longitude.toFixed(6)}
              </p>
            )}
            {!form.coordinates && (
              <p className="text-xs text-amber-600 pl-1">
                ⚠ No map pin set — click "Pick on map" to set coordinates
              </p>
            )}
          </div>

          {/* Pickup instructions */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pickup">Pickup Instructions *</Label>
            <Textarea
              id="pickup"
              value={form.pickupInstructions}
              onChange={set("pickupInstructions")}
              placeholder="e.g. Come to the counter on the ground floor and show your OTP"
              rows={3}
              className="rounded-xl border-slate-200 resize-none"
            />
          </div>

          {/* Store image */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="storeImage">Store Image</Label>
            <input
              id="storeImage"
              type="file"
              accept="image/*"
              onChange={(e) => setStoreImageFile(e.target.files?.[0] ?? null)}
              className="text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-amber-50 file:text-amber-700 file:font-medium file:px-3 file:py-1.5 file:text-xs hover:file:bg-amber-100 cursor-pointer"
            />
            {storeImageFile && (
              <p className="text-xs text-muted-foreground">
                {storeImageFile.name}
              </p>
            )}
          </div>

          {/* Payment QR */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="qrCode">Payment QR Code</Label>
            <input
              id="qrCode"
              type="file"
              accept="image/*"
              onChange={(e) => setQrCodeFile(e.target.files?.[0] ?? null)}
              className="text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-amber-50 file:text-amber-700 file:font-medium file:px-3 file:py-1.5 file:text-xs hover:file:bg-amber-100 cursor-pointer"
            />
            {qrCodeFile && (
              <p className="text-xs text-muted-foreground">{qrCodeFile.name}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-semibold gap-2 shadow-none mt-1"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Store size={15} />
                {isEdit ? "Update Store" : "Create Store"}
              </>
            )}
          </Button>
        </div>
      </div>

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
