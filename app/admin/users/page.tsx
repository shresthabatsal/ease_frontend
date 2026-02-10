"use client";

import {
  handleGetUsers,
  handleDeleteUser,
} from "@/lib/actions/admin/user-action";
import { useEffect, useState } from "react";
import UsersTable from "../_components/UsersTable";
import Loading from "../loading";
import NotFound from "../not-found";
import ErrorComponent from "../error";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "../_components/ConfirmDialog";
import { toast, ToastContainer } from "react-toastify";

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

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    userId?: string;
  }>({
    open: false,
    userId: undefined,
  });

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

  // Reset password handler
  const handleResetPassword = (userId: string) => {
    alert(`Reset password for user ${userId}`);
  };

  // Open delete dialog
  const handleDeleteUserDialog = (userId: string) => {
    setDeleteDialog({ open: true, userId });
  };

  // Confirm delete
  const confirmDeleteUser = async () => {
    if (!deleteDialog.userId) return;

    setLoading(true);
    try {
      const res = await handleDeleteUser(deleteDialog.userId);
      if (res.success) {
        toast.success("User deleted successfully!");
        // Refetch users after delete
        const refreshed = await handleGetUsers({ page, size, search });
        if (refreshed.success) {
          setUsers(refreshed.data || []);
          setTotalPages(refreshed.pagination?.totalPages || 1);
        }
      } else {
        setError(res.message || "Failed to delete user");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, userId: undefined });
    }
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
      <h1 className="text-2xl font-bold mb-4">Users</h1>

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
          onDeleteUser={handleDeleteUserDialog}
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

      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <ConfirmDialog
          message="Are you sure you want to delete this user? This action cannot be undone."
          onCancel={() => setDeleteDialog({ open: false, userId: undefined })}
          onConfirm={confirmDeleteUser}
        />
      )}
    </div>
  );
}
