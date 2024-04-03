import { Chapter, Course, UserProgress } from '@prisma/client'

import NavbarRoutes from '@/components/navbar-routes'

import CourseMobileSidebar from './course-mobile-sidebar'

type CourseWithChaptersWithUserProgress = Course & {
  chapters: (Chapter & {
    userProgress: UserProgress[] | null
  })[]
}

interface Props {
  course: CourseWithChaptersWithUserProgress
  progressCount: number
}

const CourseNavbar = ({ course, progressCount }: Props) => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
      <CourseMobileSidebar course={course} progressCount={progressCount} />
      <NavbarRoutes />
    </div>
  )
}

export default CourseNavbar
