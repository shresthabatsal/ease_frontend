"use client";

import { handleGetUsers } from "@/lib/actions/admin/user-action";
import { useEffect, useState } from "react";
import UsersTable from "../_components/UsersTable";
import Loading from "../loading";
import NotFound from "../not-found";
import ErrorComponent from "../error";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await handleGetUsers();
        if (res.success) {
          setUsers(res.data);
        } else {
          setError(res.message || "Failed to load users");
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleResetPassword = (userId: string) => {
    alert(`Reset password for user ${userId}`);
  };

  const handleDeleteUser = (userId: string) => {
    alert(`Delete user ${userId}`);
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <ErrorComponent
        error={new Error(error)}
        reset={() => window.location.reload()}
      />
    );
  if (!users.length) return <NotFound />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <UsersTable
        users={users}
        onResetPassword={handleResetPassword}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
}
