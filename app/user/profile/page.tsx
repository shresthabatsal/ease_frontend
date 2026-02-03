"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { handleGetProfile } from "@/lib/actions/user-action";
import UpdateProfileForm from "../_components/UpdateProfileForm";
import ProfilePictureDialog from "../_components/ProfilePictureDialog";

export default function EditProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await handleGetProfile();
      if (!res.success) {
        setError(res.message || "Failed to load profile");
        toast.error(res.message || "Failed to load profile");
        return;
      }
      setUser(res.data);
    } catch {
      setError("Something went wrong");
      toast.error("Something went wrong while loading profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading)
    return <p className="p-6 text-center text-gray-600">Loading profile...</p>;
  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;
  if (!user)
    return <p className="p-6 text-center text-gray-500">No user found</p>;

  return (
    <div className="relative flex justify-center px-4 py-10 bg-gray-50 w-full min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-8 space-y-8">
        {/* Profile Picture + Edit Button */}
        <div className="flex flex-col items-center">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-sm">
              {user.profilePictureUrl ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${
                    user.profilePictureUrl
                  }?t=${Date.now()}`}
                  alt="Profile picture"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
                  No Image
                </div>
              )}
            </div>

            {/* Edit button on bottom-right */}
            <button
              onClick={() => setShowImageDialog(true)}
              className="
                absolute -bottom-1 -right-1
                bg-yellow-500 text-white
                w-10 h-10 rounded-full
                flex items-center justify-center
                border-4 border-white shadow-lg
                hover:bg-yellow-600 hover:scale-110
                active:scale-95
                transition-all duration-200 z-20
              "
              title="Change profile picture"
              type="button"
              aria-label="Edit profile picture"
            >
              <span className="text-xl leading-none font-bold">✎</span>
            </button>
          </div>

          <div className="mt-4 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {user.fullName || "User"}
            </h2>
          </div>
        </div>

        {/* Update Profile Form */}
        <UpdateProfileForm user={user} onProfileUpdated={fetchProfile} />
      </div>

      {/* Profile Picture Dialog */}
      {showImageDialog && (
        <ProfilePictureDialog
          user={user}
          onClose={() => setShowImageDialog(false)}
          onUploaded={fetchProfile}
        />
      )}
    </div>
  );
}
