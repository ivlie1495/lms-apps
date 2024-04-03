import { auth } from '@clerk/nextjs'
import Mux from '@mux/mux-node'
import { NextResponse } from 'next/server'

import { db } from '@/services/db'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
})

interface ParamsProps {
  params: {
    courseId: string
  }
}

export const DELETE = async (_: Request, { params }: ParamsProps) => {
  try {
    const { courseId } = params
    const { userId } = auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
      include: {
        chapters: {
          include: {
            muxData: true,
          },
        },
      },
    })

    if (!course) {
      return new NextResponse('Course Not Found', { status: 404 })
    }

    for (const chapter of course.chapters) {
      if (chapter.muxData?.assetId) {
        await mux.video.assets.delete(chapter.muxData.assetId)
      }
    }

    const deletedCourse = await db.course.delete({
      where: {
        id: courseId,
        userId,
      },
    })

    return NextResponse.json(deletedCourse)
  } catch (e) {
    console.log('[COURSES_ID_DELETE]', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export const PATCH = async (req: Request, { params }: ParamsProps) => {
  try {
    const { courseId } = params
    const { userId } = auth()
    const values = await req.json()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const course = await db.course.update({
      where: {
        id: courseId,
        userId,
      },
      data: values,
    })

    return NextResponse.json(course)
  } catch (e) {
    console.log('[COURSES_ID_PATCH]', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
