"use client";

import Link from "next/link";

type Course = {
  id: string;
  name: string;
};

type Props = {
  tutorId: string;
  courses: Course[];
};

export default function TutorCoursesCard({ tutorId, courses }: Props) {
  return (
    <Link href={`/dashboard/manager/tutors/${tutorId}/edit`} className="block">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition cursor-pointer">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Courses
        </h2>

        <ul className="space-y-2">
          {courses.map((course) => (
            <li
              key={course.id}
              className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700"
            >
              {course.name}
            </li>
          ))}
        </ul>
      </section>
    </Link>
  )
}