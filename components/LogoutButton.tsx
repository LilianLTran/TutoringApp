"use client"

import { signOut } from "next-auth/react"

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="bg-[#F0B312] text-black px-5 py-2 rounded-lg font-semibold 
        hover:opacity-90 transition"
    >
      Logout
    </button>
  )
}