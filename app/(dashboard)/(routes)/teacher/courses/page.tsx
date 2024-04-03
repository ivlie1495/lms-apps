import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { DataTable } from './_components/data-table'
import { columns } from './_components/column'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { db } from '@/services/db'

const CoursePage = async () => {
  const { userId } = auth()

  if (!userId) {
    return redirect('/')
  }

  const courses = await db.course.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="p-6">
      {/* <Link href="/teacher/create">
        <Button>New Course</Button>
      </Link> */}
      <DataTable columns={columns} data={courses} />
    </div>
  )
}

export default CoursePage
