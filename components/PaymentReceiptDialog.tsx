"use client";

import { useState, useRef } from "react";
import { submitPaymentReceipt } from "@/lib/api/order";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ImageOff, CheckCircle2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PaymentReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  totalAmount: number;
  onSuccess: () => void;
}

export default function PaymentReceiptDialog({
  open,
  onOpenChange,
  orderId,
  totalAmount,
  onSuccess,
}: PaymentReceiptDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setReceiptFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!receiptFile) {
      toast.error("Please upload your payment receipt");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("receiptImage", receiptFile);
      if (paymentMethod) formData.append("paymentMethod", paymentMethod);
      if (notes) formData.append("notes", notes);

      const res = await submitPaymentReceipt(formData);

      if (res.success) {
        setSubmitted(true);
        toast.success("Receipt submitted! Awaiting admin verification.");
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
        }, 2000);
      } else {
        toast.error(res.message || "Failed to submit receipt");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to submit receipt");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Submit Payment Receipt</DialogTitle>
          <DialogDescription>
            Upload proof of your payment of{" "}
            <span className="font-semibold text-slate-800">
              Rs. {totalAmount.toLocaleString()}
            </span>
            . Your order will be confirmed after admin verification.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 size={48} className="text-green-500" />
            <p className="text-sm font-semibold text-slate-700">
              Receipt submitted successfully!
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Your order is pending payment verification by our team.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pt-2">
            {/* Receipt image upload */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">
                Receipt Image <span className="text-red-500">*</span>
              </Label>

              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="w-full max-h-48 object-contain bg-slate-50"
                  />
                  <button
                    onClick={clearFile}
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <X size={12} className="text-slate-500" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => inputRef.current?.click()}
                  className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors cursor-pointer"
                >
                  <Upload size={22} className="text-slate-400" />
                  <p className="text-sm text-slate-500">
                    Click to upload receipt
                  </p>
                  <p className="text-xs text-slate-400">
                    JPG, PNG, WEBP (max 5MB)
                  </p>
                </button>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Payment method */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="paymentMethod" className="text-sm font-medium">
                Payment Method
              </Label>
              <Input
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="e.g. eSewa, Khalti, Bank Transfer"
                className="rounded-xl h-9"
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="receiptNotes" className="text-sm font-medium">
                Notes{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="receiptNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional payment details…"
                className="rounded-xl resize-none text-sm"
                rows={2}
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={submitting || !receiptFile}
              className="h-11 rounded-xl bg-[#F6B60D] hover:bg-amber-500 text-black font-semibold shadow-none gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Upload size={15} />
                  Submit Receipt
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
