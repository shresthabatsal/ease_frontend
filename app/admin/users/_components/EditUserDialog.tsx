"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserData, UserForm } from "./UserForm";
import { toast } from "sonner";
import { handleUpdateUser } from "@/lib/actions/admin/user-action";

interface EditUserDialogProps {
  user: UserData | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditUserDialog({
  user,
  open,
  onClose,
  onSuccess,
}: EditUserDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      // Remove password if empty
      const password = formData.get("password");
      if (!password) {
        formData.delete("password");
      }

      // Remove profile picture if not changed
      const profilePicture = formData.get("profilePicture") as File;
      if (!profilePicture || profilePicture.size === 0) {
        formData.delete("profilePicture");
      }

      const result = await handleUpdateUser(user!._id, formData);

      if (result.success) {
        toast.success(result.message);
        onClose();
        onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <UserForm
          initialData={user}
          onSubmit={handleSubmit}
          isLoading={loading}
          submitLabel="Update User"
          isEdit
        />
      </DialogContent>
    </Dialog>
  );
}
