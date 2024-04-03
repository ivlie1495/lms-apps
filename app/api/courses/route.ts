import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import { db } from '@/services/db'
import { isTeacher } from '@/utils/role'

export const POST = async (req: Request) => {
  try {
    const { userId } = auth()
    const { title } = await req.json()

    if (!userId || !isTeacher(userId)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const course = await db.course.create({
      data: {
        userId,
        title,
      },
    })

    return NextResponse.json(course)
  } catch (e) {
    console.log('[COURSES_POST]', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
