"use client";

import { handleGetProfile } from "@/lib/actions/user-action";
import { useEffect, useState } from "react";

export default function UserProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await handleGetProfile();

        if (!res.success) {
          setError(res.message || "Failed to load profile");
          return;
        }

        setUser(res.data);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!user) return <p className="p-6">No user found</p>;

  return (
    <div className="flex justify-center px-4 py-10 bg-gray-50 w-full min-h-[calc(100vh-80px)]">
      {/* Profile Card */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-8">
        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          {user.profilePictureUrl ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${user.profilePictureUrl}`}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm border border-gray-200">
              No Image
            </div>
          )}

          <h2 className="mt-4 text-2xl font-semibold text-gray-800">
            {user.fullName}
          </h2>
          <p className="text-sm text-gray-500 capitalize">{user.role}</p>
        </div>

        {/* Divider */}
        <hr className="my-6 border-gray-200" />

        {/* User Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Email</span>
            <span className="text-gray-800 break-all">{user.email}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Phone</span>
            <span className="text-gray-800">{user.phoneNumber}</span>
          </div>

          <div className="flex justify-between col-span-2">
            <span className="text-gray-500 font-medium">Joined</span>
            <span className="text-gray-800">
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
