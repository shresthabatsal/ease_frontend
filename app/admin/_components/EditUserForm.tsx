"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { handleUpdateUser } from "@/lib/actions/admin/user-action";
import { toast } from "react-toastify";

interface EditUserFormProps {
  userId: string;
  initialData: {
    fullName: string;
    email: string;
    role: string;
  };
}

export default function EditUserForm({
  userId,
  initialData,
}: EditUserFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState(initialData);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await handleUpdateUser(userId, formData);

    if (res.success) {
      toast.success("User updated successfully!");
      router.push(`/admin/users/${userId}`);
    } else {
      toast.error(res.message);
    }

    setSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded shadow"
    >
      <input
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Full Name"
        className="border p-2 w-full rounded"
      />

      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        className="border p-2 w-full rounded"
      />

      <input
        name="role"
        value={formData.role}
        onChange={handleChange}
        placeholder="Role"
        className="border p-2 w-full rounded"
      />

      <button
        type="submit"
        disabled={submitting}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {submitting ? "Updating..." : "Update User"}
      </button>
    </form>
  );
}
