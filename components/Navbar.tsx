import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import LogoutButton from "./LogoutButton"

export default async function Navbar() {
  const session = await getServerSession(authOptions)

  const role = session?.user?.role

  return (
    <nav className="w-full bg-[#99000D] text-white shadow-md">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide">
          <span className="sm:hidden">CTP</span>
          <span className="hidden sm:inline">
            Campus Tutoring Portal
          </span>
        </h1>

        {session && (
          <div className="flex items-center gap-3 sm:gap-6">

            <span className="px-4 py-2 text-s font-bold rounded-full bg-white/20 backdrop-blur-sm">
              {role}
            </span>

            <LogoutButton />
          </div>
        )}
      </div>
    </nav>
  )
}

