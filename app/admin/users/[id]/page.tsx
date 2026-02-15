"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { handleGetUserById } from "@/lib/actions/admin/user-action";
import Loading from "../../loading";
import ErrorComponent from "../../error";
import { Button } from "@/components/ui/button";

export default function UserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await handleGetUserById(id as string);

      if (res.success) {
        setUser(res.data);
      } else {
        setError(res.message);
      }

      setLoading(false);
    };

    fetchUser();
  }, [id]);

  if (loading) return <Loading />;
  if (error)
    return (
      <ErrorComponent error={new Error(error)} reset={() => router.refresh()} />
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Details</h1>

      <div className="bg-white shadow rounded p-6 space-y-4">
        <p>
          <strong>Name:</strong> {user.fullName}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>

      <div className="mt-6">
        <Button onClick={() => router.push(`/admin/users/${id}/edit`)}>
          Edit User
        </Button>
      </div>
    </div>
  );
}
