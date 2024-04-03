import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs'
import { Chapter, Course, UserProgress } from '@prisma/client'

import CourseProgress from '@/components/course-progress'
import { db } from '@/services/db'

import CourseSidebarItem from './course-sidebar-item'

type CourseWithChaptersWithUserProgress = Course & {
  chapters: (Chapter & {
    userProgress: UserProgress[] | null
  })[]
}

interface Props {
  course: CourseWithChaptersWithUserProgress
  progressCount: number
}

const CourseSidebar = async ({ course, progressCount }: Props) => {
  const { userId } = auth()

  if (!userId) {
    return redirect('/')
  }

  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
  })

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">{course.title}</h1>
        {purchase && (
          <div className="mt-10">
            <CourseProgress variant="success" value={progressCount} />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full">
        {course.chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter?.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}
      </div>
    </div>
  )
}

export default CourseSidebar
