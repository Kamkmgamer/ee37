"use client";

import { useActionState } from "react";
import { signup } from "../actions/auth";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signup, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A1628] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="relative overflow-hidden rounded-2xl bg-[#FAF7F0] p-8 shadow-2xl">
          {/* Decorative blueprint lines */}
          <div className="absolute top-0 left-0 h-1 w-full bg-[#D4A853]" />

          <h1 className="mb-2 text-3xl font-bold text-[#0A1628]">Join EE37</h1>
          <p className="mb-8 text-[#0A1628]/60">
            Create your account to join the batch.
          </p>

          <form action={action} className="space-y-4">
            <div>
              <label className="mb-1 block font-medium text-[#0A1628]">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full rounded-lg border border-[#0A1628]/10 bg-[#0A1628]/5 px-4 py-3 text-[#0A1628] focus:ring-2 focus:ring-[#D4A853] focus:outline-none"
                placeholder="حاتم سليمان "
              />
              {state?.error?.name && (
                <p className="mt-1 text-sm text-red-500">{state.error.name}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block font-medium text-[#0A1628]">
                College ID
              </label>
              <input
                name="collegeId"
                type="text"
                required
                maxLength={12}
                className="w-full rounded-lg border border-[#0A1628]/10 bg-[#0A1628]/5 px-4 py-3 text-[#0A1628] focus:ring-2 focus:ring-[#D4A853] focus:outline-none"
                placeholder="2020..."
              />
              <p className="mt-1 text-xs text-[#0A1628]/40">
                Must be 12 digits starting with 2018, 2019, or 2020
              </p>
              {state?.error?.collegeId && (
                <p className="mt-1 text-sm text-red-500">
                  {state.error.collegeId}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block font-medium text-[#0A1628]">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-[#0A1628]/10 bg-[#0A1628]/5 px-4 py-3 text-[#0A1628] focus:ring-2 focus:ring-[#D4A853] focus:outline-none"
                placeholder="Hatim@example.com"
              />
              {state?.error?.email && (
                <p className="mt-1 text-sm text-red-500">{state.error.email}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block font-medium text-[#0A1628]">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-lg border border-[#0A1628]/10 bg-[#0A1628]/5 px-4 py-3 text-[#0A1628] focus:ring-2 focus:ring-[#D4A853] focus:outline-none"
                placeholder="••••••••"
              />
              {state?.error?.password && (
                <p className="mt-1 text-sm text-red-500">
                  {state.error.password}
                </p>
              )}
            </div>

            {state?.error?.form && (
              <p className="text-center text-sm text-red-500">
                {state.error.form}
              </p>
            )}

            <button
              disabled={isPending}
              className="w-full cursor-pointer rounded-lg bg-[#0A1628] py-3 font-bold text-[#D4A853] transition-colors hover:bg-[#0A1628]/90 disabled:opacity-50"
            >
              {isPending ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#0A1628]/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#D4A853] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
