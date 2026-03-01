import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) return false

      const managerEmails =
        process.env.MANAGER_EMAILS?.split(",").map(e => e.trim()) ?? []


      const existingUser = await prisma.user.findUnique({
        where: { email: profile.email },
      })

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            role: managerEmails.includes(profile.email)
              ? "MANAGER"
              : "STUDENT",          },
        })
      }

      return true
    },

    async jwt({ token }) {
      if (token.email) {
        const user = await prisma.user.findUnique({
          where: { email: token.email },
        })

        if (user) {
          token.id = user.id
          token.role = user.role
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as
          | "STUDENT"
          | "TUTOR"
          | "MANAGER"
      }

      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}