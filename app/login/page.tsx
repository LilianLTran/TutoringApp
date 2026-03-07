"use client"

import { signIn, getProviders } from "next-auth/react"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const [providers, setProviders] = useState<any>(null)

  useEffect(() => {
    getProviders().then(setProviders)
  }, [])

  if (!providers) return null

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md bg-[#99000D] rounded-3xl shadow-2xl p-12">

        <h1 className="text-5xl font-semibold text-center text-white mb-8">
          Login
        </h1>

        <div className="space-y-4">

          {providers.google && (
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full py-4 rounded-xl font-semibold text-white bg-[#F0B312]"
            >
              Continue with Google
            </button>
          )}

          {providers["azure-ad"] && (
            <button
              onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })}
              className="w-full py-4 rounded-xl font-semibold text-white bg-[#2563EB]"
            >
              Continue with Microsoft
            </button>
          )}

        </div>
      </div>
    </main>
  )
}