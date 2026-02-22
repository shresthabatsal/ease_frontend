"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Pencil,
  LogOut,
  LayoutDashboard,
  Home,
  Mail,
  Phone,
  User,
  Shield,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  handleGetProfile,
  handleUpdateProfile,
  handleUploadProfilePicture,
} from "@/lib/actions/user-action";
import Header from "./layout/Header";

const IMAGE_BASE_URL = "http://localhost:5050";

interface ProfileData {
  fullName: string;
  email: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  role?: string;
}

type EditableField = "fullName" | "email" | "phoneNumber";

interface EditDialogState {
  open: boolean;
  field: EditableField | null;
  label: string;
  value: string;
  type: string;
}

interface ProfilePageProps {
  context?: "user" | "admin";
}

function ProfileField({
  icon,
  label,
  value,
  fieldKey,
  onEdit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  fieldKey: EditableField;
  onEdit: (
    field: EditableField,
    label: string,
    value: string,
    type: string
  ) => void;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
      onClick={() =>
        onEdit(fieldKey, label, value, fieldKey === "email" ? "email" : "text")
      }
    >
      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate mt-0.5">
          {value || (
            <span className="text-muted-foreground italic">Not set</span>
          )}
        </p>
      </div>
      <Pencil
        size={14}
        className="flex-shrink-0 text-muted-foreground/40 group-hover:text-amber-500 transition-colors"
      />
    </div>
  );
}

function PasswordField({ onOpen }: { onOpen: () => void }) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
      onClick={onOpen}
    >
      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
        <KeyRound size={15} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground">Password</p>
        <p className="text-sm font-medium tracking-widest text-muted-foreground mt-0.5">
          ••••••••
        </p>
      </div>
      <Pencil
        size={14}
        className="flex-shrink-0 text-muted-foreground/40 group-hover:text-amber-500 transition-colors"
      />
    </div>
  );
}

export default function ProfilePage({ context = "user" }: ProfilePageProps) {
  const { isAdmin, logout, checkAuth } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);

  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    field: null,
    label: "",
    value: "",
    type: "text",
  });
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Change password dialog
  const [pwDialog, setPwDialog] = useState(false);
  const [pwForm, setPwForm] = useState({ next: "", confirm: "" });
  const [pwShow, setPwShow] = useState({ next: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");

  // Load Profile
  useEffect(() => {
    (async () => {
      const res = await handleGetProfile();
      if (res.success) setProfile(res.data);
      else toast.error(res.message || "Failed to load profile");
      setLoading(false);
    })();
  }, []);

  // Avatar upload
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPic(true);
    const fd = new FormData();
    fd.append("profilePicture", file);
    const res = await handleUploadProfilePicture(fd);
    if (res.success) {
      const picUrl: string = res.data;
      setProfile((p) => (p ? { ...p, profilePictureUrl: picUrl } : p));
      await checkAuth();
      toast.success("Profile picture updated!");
    } else {
      toast.error(res.message || "Upload failed");
    }
    setUploadingPic(false);
    e.target.value = "";
  };

  const openEdit = (
    field: EditableField,
    label: string,
    value: string,
    type: string
  ) => {
    setEditDialog({ open: true, field, label, value, type });
    setEditValue(value);
  };

  const saveField = async () => {
    if (!editDialog.field) return;
    setSaving(true);
    const res = await handleUpdateProfile({ [editDialog.field]: editValue });
    if (res.success) {
      setProfile((p) => (p ? { ...p, [editDialog.field!]: editValue } : p));
      await checkAuth();
      toast.success(`${editDialog.label} updated!`);
      setEditDialog((d) => ({ ...d, open: false }));
    } else {
      toast.error(res.message || "Update failed");
    }
    setSaving(false);
  };

  // Change password
  const openPwDialog = () => {
    setPwForm({ next: "", confirm: "" });
    setPwShow({ next: false, confirm: false });
    setPwError("");
    setPwDialog(true);
  };

  const submitPasswordChange = async () => {
    setPwError("");
    if (pwForm.next.length < 6)
      return setPwError("New password must be at least 6 characters.");
    if (pwForm.next !== pwForm.confirm)
      return setPwError("Passwords do not match.");

    setPwSaving(true);

    const res = await handleUpdateProfile({ password: pwForm.next });
    if (res.success) {
      setPwDialog(false);
      toast.success("Password changed successfully!");
    } else {
      setPwError(res.message || "Password change failed.");
    }
    setPwSaving(false);
  };

  const initials = profile?.fullName
    ? profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const avatarSrc = profile?.profilePictureUrl
    ? `${IMAGE_BASE_URL}${
        profile.profilePictureUrl.startsWith("/") ? "" : "/"
      }${profile.profilePictureUrl}`
    : undefined;

  if (loading) {
    return (
      <>
        {context === "user" && <Header />}
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-amber-500" size={32} />
        </div>
      </>
    );
  }

  const pageContent = (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          My Profile
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Avatar card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <Avatar className="h-20 w-20 ring-2 ring-border">
                <AvatarImage src={avatarSrc} alt={profile?.fullName} />
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPic}
                className="absolute bottom-0 right-0 w-7 h-7 bg-[#F6B60D] hover:bg-amber-500 text-black rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-60"
              >
                {uploadingPic ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Camera size={12} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarChange}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold truncate">
                {profile?.fullName}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {profile?.email}
              </p>
              <Badge
                variant="secondary"
                className={cn(
                  "mt-2 text-xs",
                  profile?.role === "ADMIN" &&
                    "bg-amber-100 text-amber-700 border border-amber-200"
                )}
              >
                {profile?.role === "ADMIN" ? (
                  <span className="flex items-center gap-1">
                    <Shield size={10} /> Admin
                  </span>
                ) : (
                  "User"
                )}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile details card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Click any field to edit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <ProfileField
            icon={<User size={15} />}
            label="Full Name"
            value={profile?.fullName ?? ""}
            fieldKey="fullName"
            onEdit={openEdit}
          />
          <ProfileField
            icon={<Mail size={15} />}
            label="Email Address"
            value={profile?.email ?? ""}
            fieldKey="email"
            onEdit={openEdit}
          />
          <ProfileField
            icon={<Phone size={15} />}
            label="Phone Number"
            value={profile?.phoneNumber ?? ""}
            fieldKey="phoneNumber"
            onEdit={openEdit}
          />
          <PasswordField onOpen={openPwDialog} />
        </CardContent>
      </Card>

      {/* Actions card */}
      <Card>
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
          {isAdmin && context === "user" && (
            <Button
              onClick={() => router.push("/admin")}
              className="flex-1 gap-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold"
            >
              <LayoutDashboard size={15} />
              Switch to Admin Panel
            </Button>
          )}
          {isAdmin && context === "admin" && (
            <Button
              onClick={() => router.push("/")}
              className="flex-1 gap-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold"
            >
              <Home size={15} />
              Switch to User Panel
            </Button>
          )}
          <Button
            onClick={() => setLogoutDialog(true)}
            variant="outline"
            className="flex-1 gap-2 border-destructive/30 text-destructive hover:bg-destructive/5 rounded-lg font-semibold"
          >
            <LogOut size={15} />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      {context === "user" && <Header />}
      {pageContent}

      <Dialog
        open={editDialog.open}
        onOpenChange={(o) => setEditDialog((d) => ({ ...d, open: o }))}
      >
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit {editDialog.label}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">
              {editDialog.label}
            </Label>
            <Input
              type={editDialog.type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !saving && saveField()}
              className="rounded-lg"
              placeholder={`Enter your ${editDialog.label.toLowerCase()}`}
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialog((d) => ({ ...d, open: false }))}
              disabled={saving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={saveField}
              disabled={saving || editValue === editDialog.value}
              className="flex-1 bg-[#F6B60D] hover:bg-amber-500 text-black font-semibold shadow-none"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change password dialog */}
      <Dialog open={pwDialog} onOpenChange={setPwDialog}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound size={16} className="text-amber-500" />
              Change Password
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {(["next", "confirm"] as const).map((key) => {
              const labels = {
                next: "New Password",
                confirm: "Confirm New Password",
              };
              return (
                <div key={key}>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">
                    {labels[key]}
                  </Label>
                  <div className="relative">
                    <Input
                      type={pwShow[key] ? "text" : "password"}
                      value={pwForm[key]}
                      onChange={(e) =>
                        setPwForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      className="rounded-lg pr-10"
                      placeholder={
                        key === "next"
                          ? "Min. 6 characters"
                          : "Re-enter new password"
                      }
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPwShow((s) => ({ ...s, [key]: !s[key] }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {pwShow[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}

            {pwError && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle size={14} />
                {pwError}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setPwDialog(false)}
              disabled={pwSaving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={submitPasswordChange}
              disabled={pwSaving}
              className="flex-1 bg-[#F6B60D] hover:bg-amber-500 text-black font-semibold shadow-none"
            >
              {pwSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Logout confirmation */}
      <AlertDialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        <AlertDialogContent className="rounded-xl sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your account. You can log back in
              anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="flex-1 rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={logout}
              className="flex-1 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
