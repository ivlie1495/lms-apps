import { Menu } from 'lucide-react'
import { Chapter, Course, UserProgress } from '@prisma/client'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import CourseSidebar from './course-sidebar'

type CourseWithChaptersWithUserProgress = Course & {
  chapters: (Chapter & {
    userProgress: UserProgress[] | null
  })[]
}

interface Props {
  course: CourseWithChaptersWithUserProgress
  progressCount: number
}

const CourseMobileSidebar = ({ course, progressCount }: Props) => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-white">
        <CourseSidebar course={course} progressCount={progressCount} />
      </SheetContent>
    </Sheet>
  )
}

export default CourseMobileSidebar
