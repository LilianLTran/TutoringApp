import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({
    adapter,
  })


async function main() {
  console.log("Seeding database...")

  // Clean old data
  await prisma.tutoringSession.deleteMany()
  await prisma.availabilityException.deleteMany()
  await prisma.tutorProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.course.deleteMany()

  //
  // Create Courses
  //
  const math = await prisma.course.create({
    data: { name: "Math 101" },
  })

  const physics = await prisma.course.create({
    data: { name: "Physics 201" },
  })

  //
  // Create Tutor Profiles (Manager-created)
  //
  const tutorAlice = await prisma.tutorProfile.create({
    data: {
      name: "Alice Johnson",
      email: "alice@school.edu",
      courses: {
        connect: [{ id: math.id }],
      },
    },
  })

  const tutorBob = await prisma.tutorProfile.create({
    data: {
      name: "Bob Smith",
      email: "bob@school.edu",
      courses: {
        connect: [{ id: physics.id }],
      },
    },
  })

  //
  // Create Availability
  //
  // await prisma.availabilityException.createMany({
  //   data: [
  //     {
  //       tutorId: tutorAlice.id,
  //       date: 1, // Monday
  //       startMin: 9 * 60,
  //       endMin: 12 * 60,
  //     },
  //     {
  //       tutorId: tutorBob.id,
  //       dayOfWeek: 2, // Tuesday
  //       startMin: 13 * 60,
  //       endMin: 16 * 60,
  //     },
  //   ],
  // })

  //
  // Create Tutor User (simulate signup)
  //
  const tutorUser = await prisma.user.create({
    data: {
      email: "alice@school.edu",
      name: "Alice Johnson",
      role: "TUTOR",
    },
  })

  // Auto-link logic
  await prisma.tutorProfile.update({
    where: { email: tutorUser.email },
    data: {
      userId: tutorUser.id,
      isActive: true,
    },
  })

  //
  // Create Student User
  //
  await prisma.user.create({
    data: {
      email: "student1@school.edu",
      name: "Student One",
      role: "STUDENT",
    },
  })

  console.log("Seeding completed.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })