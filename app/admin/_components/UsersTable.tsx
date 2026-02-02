"use client";

import Link from "next/link";

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
              className="border-t border-gray-300 hover:bg-gray-50"
            >
              <td className="px-3 py-2 truncate" title={u.fullName}>
                {u.fullName}
              </td>
              <td className="px-3 py-2 truncate" title={u.email}>
                {u.email}
              </td>
              <td className="px-3 py-2 truncate" title={u.phoneNumber}>
                {u.phoneNumber}
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={() => onResetPassword(u._id)}
                  className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs hover:bg-gray-300"
                >
                  Reset
                </button>
              </td>
              <td className="px-3 py-2 truncate" title={u.role}>
                {u.role}
              </td>
              <td className="px-3 py-2 flex gap-2">
                <Link
                  href={`/admin/users/${u._id}/edit`}
                  className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs hover:bg-gray-300 truncate"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDeleteUser(u._id)}
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
