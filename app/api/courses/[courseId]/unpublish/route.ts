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

export const PATCH = async (_: Request, { params }: ParamsProps) => {
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
    })

    if (!course) {
      return new NextResponse('Not Found', { status: 404 })
    }

    const unpublishedCourse = await db.course.update({
      where: {
        id: courseId,
        userId,
      },
      data: {
        isPublished: false,
      },
    })

    return NextResponse.json(unpublishedCourse)
  } catch (e) {
    console.log('[COURSES_ID_UNPUBLISH_PATCH]', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
