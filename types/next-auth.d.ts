// types/next-auth.d.ts

import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "STUDENT" | "TUTOR" | "MANAGER"
      email?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "STUDENT" | "TUTOR" | "MANAGER"
  }
}