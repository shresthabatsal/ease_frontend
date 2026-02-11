"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { handleGetUserById } from "@/lib/actions/admin/user-action";
import Loading from "../../../loading";
import ErrorComponent from "../../../error";
import EditUserForm from "@/app/admin/_components/EditUserForm";

export default function EditUserPage() {
  const { id } = useParams();

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
      <ErrorComponent
        error={new Error(error)}
        reset={() => window.location.reload()}
      />
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>

      <EditUserForm
        userId={id as string}
        initialData={{
          fullName: user.fullName || "",
          email: user.email || "",
          role: user.role || "",
        }}
      />
    </div>
  );
}
