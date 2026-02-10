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

  // Users state and pagination
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const size = 20; // fixed page size
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // reset to first page on new search
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch users whenever page or search changes
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await handleGetUsers({ page, size, search });
        if (res.success) {
          setUsers(res.data || []);
          setTotalPages(res.pagination?.totalPages || 1);
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
  }, [page, search]);

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

  return (
    <div className="p-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      {/* Search + Create Button */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border px-3 py-2 rounded flex-grow min-w-[200px]"
        />

        <button
          onClick={() => router.push("/admin/users/create")}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-black px-4 py-2 rounded font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Users Table or Not Found */}
      {users.length ? (
        <UsersTable
          users={users}
          onResetPassword={handleResetPassword}
          onDeleteUser={handleDeleteUser}
        />
      ) : (
        <NotFound />
      )}

      {/* Pagination Controls */}
      {users.length > 0 && (
        <div className="mt-4 flex justify-center items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
