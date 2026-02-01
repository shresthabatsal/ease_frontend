"use client";

import { getProfile } from "@/lib/api/user";
import { useEffect, useState } from "react";

export default function UserProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>No user found</p>;

  return (
    <div>
      <h1>User Details</h1>
      <p>Full Name: {user.fullName}</p>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phoneNumber}</p>
      <p>Role: {user.role}</p>
      {user.profilePictureUrl && (
        <div>
          <img src={user.profilePictureUrl} alt="Profile" width={100} />
        </div>
      )}
    </div>
  );
}
