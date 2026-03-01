"use client"

import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md bg-[#99000D] rounded-3xl shadow-2xl p-12">

        <h1 className="text-5xl font-semibold text-center text-white mb-8">
          Login
        </h1>

        <button
            onClick={() =>
                signIn("google", {
                callbackUrl: "/dashboard",
                prompt: "select_account",
                })
            }
          className="w-full py-4 rounded-xl font-semibold text-white
                     bg-[#F0B312] hover:opacity-90
                     transition-all duration-300 shadow-md"
        >
          Continue with Google
        </button>

      </div>
    </main>
  )
}