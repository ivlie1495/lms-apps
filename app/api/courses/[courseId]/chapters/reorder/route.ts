import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import { db } from '@/services/db'

interface ParamsProps {
  params: {
    courseId: string
  }
}

export const PUT = async (req: Request, { params }: ParamsProps) => {
  try {
    const { courseId } = params
    const { userId } = auth()
    const { list } = await req.json()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    })

    if (!courseOwner) {
      return new NextResponse('Not Found', { status: 404 })
    }

    for (const item of list) {
      await db.chapter.update({
        where: {
          id: item.id,
        },
        data: {
          position: item.position,
        },
      })
    }

    return new NextResponse('Success', { status: 200 })
  } catch (e) {
    console.log('[COURSES_ID_CHAPTERS_REORDER]', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
