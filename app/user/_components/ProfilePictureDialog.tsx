"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { handleUploadProfilePicture } from "@/lib/actions/user-action";
import { Button } from "@/components/ui/button";

interface ProfilePictureDialogProps {
  user: { profilePictureUrl?: string };
  onClose: () => void;
  onUploaded: () => void;
}

export default function ProfilePictureDialog({
  user,
  onClose,
  onUploaded,
}: ProfilePictureDialogProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!selectedImage) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("profilePicture", selectedImage);

    const res = await handleUploadProfilePicture(formData);
    if (res.success) {
      toast.success(res.message);
      onUploaded();
      onClose();
      setSelectedImage(null);
    } else {
      toast.error(res.message);
    }

    setUploading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose} // clicking outside closes dialog
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-auto"
        onClick={(e) => e.stopPropagation()} // stop clicks inside
      >
        <h2 className="text-xl font-semibold text-center mb-4">
          Update Profile Picture
        </h2>

        {/* Image preview */}
        <div className="flex justify-center mb-6">
          {selectedImage ? (
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 shadow-sm"
            />
          ) : user.profilePictureUrl ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${
                user.profilePictureUrl
              }?t=${Date.now()}`}
              alt="Current"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 shadow-sm"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm border-2 border-gray-300">
              No Image
            </div>
          )}
        </div>

        {/* Choose file button */}
        <input
          type="file"
          accept="image/*"
          className="block mx-auto mb-6 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
          onChange={(e) =>
            e.target.files && setSelectedImage(e.target.files[0])
          }
        />

        <div className="flex justify-center gap-4">
          <Button
            onClick={handleUpload}
            disabled={uploading || !selectedImage}
            className={uploading ? "opacity-70 cursor-not-allowed" : ""}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
