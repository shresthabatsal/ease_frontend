"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "../schema";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    console.log("Login data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-80">
      <div>
        <label className="block mb-1 font-medium text-black">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full border border-black text-black placeholder-black px-3 py-2 rounded"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block mb-1 font-medium text-black">Password</label>
        <input
          type="password"
          {...register("password")}
          className="w-full border border-black text-black placeholder-black px-3 py-2 rounded"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition"
      >
        Login
      </button>
    </form>
  );
}
