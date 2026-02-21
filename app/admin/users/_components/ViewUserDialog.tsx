"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserData } from "./UserForm";

const IMAGE_BASE_URL = "http://localhost:5050";
const PLACEHOLDER_IMAGE = "/placeholder-product.png";

interface ViewUserDialogProps {
  user: UserData | null;
  open: boolean;
  onClose: () => void;
}

export function ViewUserDialog({ user, open, onClose }: ViewUserDialogProps) {
  if (!user) return null;

  const imageSrc = user.profilePictureUrl
    ? `${IMAGE_BASE_URL}${user.profilePictureUrl}`
    : PLACEHOLDER_IMAGE;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{user.fullName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full overflow-hidden border-2">
              <img
                src={imageSrc}
                alt={user.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
              {user.role}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground font-medium mb-0.5">Email</p>
              <p>{user.email}</p>
            </div>

            <div>
              <p className="text-muted-foreground font-medium mb-0.5">
                Phone Number
              </p>
              <p>{user.phoneNumber}</p>
            </div>

            <div>
              <p className="text-muted-foreground font-medium mb-0.5">
                User ID
              </p>
              <p className="font-mono text-xs break-all">{user._id}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium mb-0.5">Created</p>
              <p>{new Date(user.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-medium mb-0.5">Updated</p>
              <p>{new Date(user.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
