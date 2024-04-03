import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import { db } from '@/services/db'

interface ParamsProps {
  params: {
    courseId: string
  }
}

export const POST = async (req: Request, { params }: ParamsProps) => {
  try {
    const { courseId } = params
    const { userId } = auth()
    const { title } = await req.json()

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

    const lastChapter = await db.chapter.findFirst({
      where: {
        courseId,
      },
      orderBy: {
        position: 'desc',
      },
    })

    const newPosition = lastChapter ? lastChapter.position + 1 : 1

    const chapter = await db.chapter.create({
      data: {
        title,
        courseId,
        position: newPosition,
      },
    })

    return NextResponse.json(chapter)
  } catch (e) {
    console.log('[COURSES_ID_CHAPTERS_POST]', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
