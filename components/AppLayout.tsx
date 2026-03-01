"use client"

import { ReactNode } from "react"
import Navbar from "./Navbar"
import { useSession, signIn } from "next-auth/react"

export default function AppLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()

  if (status === "loading") return null

  if (!session) {
    signIn()
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">{children}</div>
    </div>
  )
}