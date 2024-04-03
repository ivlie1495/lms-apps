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
    chapterId: string
  }
}

export const PATCH = async (_: Request, { params }: ParamsProps) => {
  try {
    const { courseId, chapterId } = params
    const { userId } = auth()

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

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId,
      },
    })

    const muxData = await db.muxData.findUnique({
      where: {
        chapterId,
      },
    })

    if (
      !chapter ||
      !muxData ||
      !chapter.title ||
      !chapter.description ||
      !chapter.videoUrl
    ) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const publishedChapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        isPublished: true,
      },
    })

    return NextResponse.json(publishedChapter)
  } catch (e) {
    console.log('[COURSES_ID_CHAPTERS_ID_PUBLISH_PATCH]', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
