"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PaginationData, UserData } from "./_components/UserForm";
import { handleGetUsers } from "@/lib/actions/admin/user-action";
import { CreateUserDialog } from "./_components/CreateUserDialog";
import { UsersTable } from "./_components/UsersTable";
import { ViewUserDialog } from "./_components/ViewUserDialog";
import { EditUserDialog } from "./_components/EditUserDialog";
import { DeleteUserDialog } from "./_components/DeleteUserDialog";

type DialogMode = "view" | "edit" | "delete" | null;

const DEFAULT_PAGINATION: PaginationData = {
  total: 0,
  page: 1,
  size: 20,
  totalPages: 1,
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] =
    useState<PaginationData>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);

  // Filters and sorting
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<
    "fullName" | "email" | "createdAt"
  >("fullName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [roleFilter, setRoleFilter] = useState<"all" | "USER" | "ADMIN">("all");

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);

  const loadUsers = useCallback(
    async (
      opts: {
        page?: number;
        search?: string;
        sortField?: typeof sortField;
        sortOrder?: typeof sortOrder;
        roleFilter?: typeof roleFilter;
      } = {}
    ) => {
      setIsLoading(true);
      try {
        const result = await handleGetUsers({
          page: opts.page ?? page,
          size: 20,
          search: opts.search ?? search,
          sortBy: opts.sortField ?? sortField,
          sortOrder: opts.sortOrder ?? sortOrder,
        });

        if (result.success) {
          let filteredUsers = result.data ?? [];

          // Client-side role filter with explicit type
          if ((opts.roleFilter ?? roleFilter) !== "all") {
            filteredUsers = filteredUsers.filter(
              (u: UserData) => u.role === (opts.roleFilter ?? roleFilter)
            );
          }

          setUsers(filteredUsers);
          if (result.pagination) {
            // Adjust pagination if filters are applied
            const totalFiltered = filteredUsers.length;
            setPagination({
              ...result.pagination,
              total: totalFiltered,
              totalPages: Math.ceil(totalFiltered / 20),
            });
          }
        } else {
          toast.error(result.message || "Failed to load users");
        }
      } catch {
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    },
    [page, search, sortField, sortOrder, roleFilter]
  );

  // Initial load
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadUsers({ page: 1, search });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Handlers
  function handlePageChange(newPage: number) {
    setPage(newPage);
    loadUsers({ page: newPage });
  }

  function handleSortChange(
    field: "fullName" | "email" | "createdAt",
    order: "asc" | "desc"
  ) {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
    loadUsers({ page: 1, sortField: field, sortOrder: order });
  }

  function handleRoleFilter(role: "all" | "USER" | "ADMIN") {
    setRoleFilter(role);
    setPage(1);
    loadUsers({ page: 1, roleFilter: role });
  }

  function openDialog(mode: DialogMode, user: UserData) {
    setSelectedUser(user);
    setDialogMode(mode);
  }

  function closeDialog() {
    setDialogMode(null);
    setSelectedUser(null);
  }

  function handleSuccess() {
    closeDialog();
    loadUsers();
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage user accounts and permissions.
        </p>
      </div>

      {/* Toolbar: Search + Create Button in same row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <CreateUserDialog onSuccess={handleSuccess} />
      </div>

      {/* Table */}
      <UsersTable
        users={users}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowClick={(u) => openDialog("view", u)}
        onEdit={(u) => openDialog("edit", u)}
        onDelete={(u) => openDialog("delete", u)}
        onSearchChange={setSearch}
        onSortChange={handleSortChange}
        onRoleFilter={handleRoleFilter}
        currentSearch={search}
        currentSort={{ field: sortField, order: sortOrder }}
        currentRoleFilter={roleFilter}
        isLoading={isLoading}
      />

      {/* Dialogs */}
      <ViewUserDialog
        user={selectedUser}
        open={dialogMode === "view"}
        onClose={closeDialog}
      />

      <EditUserDialog
        user={selectedUser}
        open={dialogMode === "edit"}
        onClose={closeDialog}
        onSuccess={handleSuccess}
      />

      <DeleteUserDialog
        user={selectedUser}
        open={dialogMode === "delete"}
        onClose={closeDialog}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
