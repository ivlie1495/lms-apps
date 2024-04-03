import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { auth } from '@clerk/nextjs'

import { db } from '@/services/db'
import { getProgress } from '@/actions/progress'

import CourseSidebar from './_components/course-sidebar'
import CourseNavbar from './_components/course-navbar'

interface Props extends PropsWithChildren {
  params: {
    courseId: string
  }
}

const CourseLayout = async ({ params, children }: Props) => {
  const { userId } = auth()
  const { courseId } = params

  if (!userId) {
    return redirect('/')
  }

  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        include: {
          userProgress: {
            where: {
              userId,
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      },
    },
  })

  if (!course) {
    return redirect('/')
  }

  const progressCount = await getProgress(userId, courseId)

  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar course={course} progressCount={progressCount} />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar course={course} progressCount={progressCount} />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">{children}</main>
    </div>
  )
}

export default CourseLayout
