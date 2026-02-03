"use client";

import { handleGetUsers } from "@/lib/actions/admin/user-action";
import { useEffect, useState } from "react";
import UsersTable from "../_components/UsersTable";
import Loading from "../loading";
import NotFound from "../not-found";
import ErrorComponent from "../error";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const router = useRouter();

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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Users</h1>

        {/* Create User Button */}
        <button
          onClick={() => router.push("/admin/users/create")}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-black px-4 py-2 rounded font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          Create User
        </button>
      </div>

      <UsersTable
        users={users}
        onResetPassword={handleResetPassword}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
}
