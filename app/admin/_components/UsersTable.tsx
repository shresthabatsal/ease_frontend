"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface UsersTableProps {
  users: User[];
  onResetPassword: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export default function UsersTable({
  users,
  onResetPassword,
  onDeleteUser,
}: UsersTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300 border-collapse table-fixed text-sm">
        <thead className="bg-gray-100 uppercase text-gray-700 text-xs">
          <tr>
            <th className="px-3 py-2 text-left">Full Name</th>
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Phone</th>
            <th className="px-3 py-2 text-left">Password</th>
            <th className="px-3 py-2 text-left">Role</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u._id}
              onClick={() => router.push(`/admin/users/${u._id}`)}
              className="border-t border-gray-300 hover:bg-gray-50 cursor-pointer"
            >
              {/* Full Name */}
              <td className="px-3 py-2 truncate" title={u.fullName}>
                {u.fullName}
              </td>

              {/* Email */}
              <td className="px-3 py-2 truncate" title={u.email}>
                {u.email}
              </td>

              {/* Phone */}
              <td className="px-3 py-2 truncate" title={u.phoneNumber}>
                {u.phoneNumber}
              </td>

              {/* Reset Password */}
              <td className="px-3 py-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetPassword(u._id);
                  }}
                  className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs hover:bg-gray-300"
                >
                  Reset
                </button>
              </td>

              {/* Role */}
              <td className="px-3 py-2 truncate" title={u.role}>
                {u.role}
              </td>

              {/* Actions */}
              <td className="px-3 py-2 flex gap-2">
                <Link
                  href={`/admin/users/${u._id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs hover:bg-gray-300 truncate"
                >
                  Edit
                </Link>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteUser(u._id);
                  }}
                  className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs hover:bg-gray-300 truncate"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
