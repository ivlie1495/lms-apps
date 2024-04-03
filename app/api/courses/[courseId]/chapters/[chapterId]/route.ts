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

export const DELETE = async (_: Request, { params }: ParamsProps) => {
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
      return new NextResponse('Course Not Found', { status: 404 })
    }

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId,
      },
    })

    if (!chapter) {
      return new NextResponse('Chapter Not Found', { status: 404 })
    }

    if (chapter.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId,
        },
      })

      if (existingMuxData) {
        await mux.video.assets.delete(existingMuxData.assetId)
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          },
        })
      }
    }

    const deletedChapter = await db.chapter.delete({
      where: {
        id: chapterId,
      },
    })

    const publishedChaptersInCourse = await db.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
    })

    if (!publishedChaptersInCourse.length) {
      await db.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false,
        },
      })
    }

    return NextResponse.json(deletedChapter)
  } catch (e) {
    console.log('[COURSES_ID_CHAPTERS_ID_DELETE]', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export const PATCH = async (req: Request, { params }: ParamsProps) => {
  try {
    const { courseId, chapterId } = params
    const { userId } = auth()
    const { isPublished, ...values } = await req.json()

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

    const chapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        ...values,
      },
    })

    if (values.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId,
        },
      })

      if (existingMuxData) {
        await mux.video.assets.delete(existingMuxData.id)
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          },
        })
      }

      const asset = await mux.video.assets.create({
        input: values.videoUrl,
        playback_policy: ['public'],
        test: false,
      })

      await db.muxData.create({
        data: {
          chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id,
        },
      })
    }

    return NextResponse.json(chapter)
  } catch (e) {
    console.log('[COURSES_ID_CHAPTERS_ID_PATCH]', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
