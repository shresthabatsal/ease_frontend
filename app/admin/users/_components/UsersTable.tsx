"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { PaginationData, UserData } from "./UserForm";

const IMAGE_BASE_URL = "http://localhost:5050";
const PLACEHOLDER_IMAGE = "/placeholder-product.png";

interface UsersTableProps {
  users: UserData[];
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  onRowClick: (user: UserData) => void;
  onEdit: (user: UserData) => void;
  onDelete: (user: UserData) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (
    field: "fullName" | "email" | "createdAt",
    order: "asc" | "desc"
  ) => void;
  onRoleFilter: (role: "all" | "USER" | "ADMIN") => void;
  currentSearch: string;
  currentSort: {
    field: "fullName" | "email" | "createdAt";
    order: "asc" | "desc";
  };
  currentRoleFilter: "all" | "USER" | "ADMIN";
  isLoading?: boolean;
}

export function UsersTable({
  users,
  pagination,
  onPageChange,
  onRowClick,
  onEdit,
  onDelete,
  onSearchChange,
  onSortChange,
  onRoleFilter,
  currentSearch,
  currentSort,
  currentRoleFilter,
  isLoading = false,
}: UsersTableProps) {
  const { page, totalPages, total, size } = pagination;
  const startItem = (page - 1) * size + 1;
  const endItem = Math.min(page * size, total);

  const hasActiveFilters = currentRoleFilter !== "all";

  function handleSort(field: "fullName" | "email" | "createdAt") {
    if (currentSort.field === field) {
      onSortChange(field, currentSort.order === "asc" ? "desc" : "asc");
    } else {
      onSortChange(field, "asc");
    }
  }

  const getSortIcon = (field: "fullName" | "email" | "createdAt") => {
    if (currentSort.field !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1" />;
    }
    return currentSort.order === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  return (
    <div className="space-y-3">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={currentSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={currentRoleFilter} onValueChange={onRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="USER">Users</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRoleFilter("all")}
              className="gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => handleSort("fullName")}
                  className="flex items-center hover:text-foreground transition-colors font-medium"
                >
                  Name
                  {getSortIcon("fullName")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("email")}
                  className="flex items-center hover:text-foreground transition-colors font-medium"
                >
                  Email
                  {getSortIcon("email")}
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Role</TableHead>
              <TableHead className="hidden lg:table-cell">
                <button
                  onClick={() => handleSort("createdAt")}
                  className="flex items-center hover:text-foreground transition-colors font-medium"
                >
                  Joined
                  {getSortIcon("createdAt")}
                </button>
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              users.map((user) => {
                const imageSrc = user.profilePictureUrl
                  ? `${IMAGE_BASE_URL}${user.profilePictureUrl}`
                  : PLACEHOLDER_IMAGE;

                return (
                  <TableRow
                    key={user._id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onRowClick(user)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full overflow-hidden border flex-shrink-0 bg-muted">
                          <img
                            src={imageSrc}
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                        </div>
                        <span className="font-medium">{user.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {user.phoneNumber}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => onRowClick(user)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => onEdit(user)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => onDelete(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 text-sm text-muted-foreground">
          <span>
            Showing {startItem}–{endItem} of {total} users
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 font-medium text-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
