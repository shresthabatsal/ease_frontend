import { handleGetUsers } from "@/lib/actions/admin/user-action";

export default async function AdminUsersPage() {
  const res = await handleGetUsers();

  if (!res.success) {
    return <p>Failed to load users</p>;
  }

  const users = res.data;

  return (
    <div>
      <h1>All Users</h1>
      <ul>
        {users.map((u: any) => (
          <li key={u._id}>
            {u.fullName} ({u.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
