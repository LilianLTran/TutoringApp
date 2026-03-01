import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Link
        href="/login"
        className="px-10 py-5 bg-[#99000D] text-white rounded-xl text-3xl"
      >
        Go to Login
      </Link>
    </main>
  )
}