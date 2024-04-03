import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs'

import { db } from '@/services/db'

import { DataTable } from './_components/data-table'
import { columns } from './_components/column'

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
      <DataTable columns={columns} data={courses} />
    </div>
  )
}

export default CoursePage
