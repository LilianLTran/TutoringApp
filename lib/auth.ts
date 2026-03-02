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
      if (!profile?.email) return false;

      const email = profile.email.toLowerCase().trim();

      const managerEmails =
        process.env.MANAGER_EMAILS?.split(",").map(e => e.trim().toLowerCase()) ?? [];

      // Check if email exists in TutorProfile
      const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { email },
      });

      // Determine role priority
      let role: "MANAGER" | "TUTOR" | "STUDENT";

      if (managerEmails.includes(email)) {
        role = "MANAGER";
      } else if (tutorProfile) {
        role = "TUTOR";
      } else {
        role = "STUDENT";
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!existingUser) {
        const newUser = await prisma.user.create({
          data: {
            email,
            name: profile.name,
            role,
          },
        });

        // If tutor profile exists, link it
        if (tutorProfile && !tutorProfile.userId) {
          await prisma.tutorProfile.update({
            where: { id: tutorProfile.id },
            data: { userId: newUser.id },
          });
        }

      } else {
        // Update role if needed (for existing users)
        if (existingUser.role !== role) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { role },
          });
        }

        // Ensure tutorProfile is linked
        if (tutorProfile && !tutorProfile.userId) {
          await prisma.tutorProfile.update({
            where: { id: tutorProfile.id },
            data: { userId: existingUser.id },
          });
        }
      }

      return true;
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