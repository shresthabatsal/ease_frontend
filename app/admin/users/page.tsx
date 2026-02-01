"use client";
import { getUsers } from "@/lib/api/admin/user";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    getUsers()
      .then((res) => setUsers(res.data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>All Users</h1>
      <ul>
        {users.map((u) => (
          <li key={u._id}>
            {u.name} ({u.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
