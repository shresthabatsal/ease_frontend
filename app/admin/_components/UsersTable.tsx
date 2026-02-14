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

export default function UsersTable({ users, onDeleteUser }: UsersTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300 border-collapse table-fixed text-sm">
        <thead className="bg-gray-100 uppercase text-gray-700 text-xs">
          <tr>
            <th className="px-3 py-2 text-left">Full Name</th>
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Phone</th>
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
              <td className="px-3 py-2 truncate">{u.fullName}</td>
              <td className="px-3 py-2 truncate">{u.email}</td>
              <td className="px-3 py-2 truncate">{u.phoneNumber}</td>
              <td className="px-3 py-2 truncate">{u.role}</td>

              <td className="px-3 py-2 flex gap-2">
                <Link
                  href={`/admin/users/${u._id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
                >
                  Edit
                </Link>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteUser(u._id);
                  }}
                  className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
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
