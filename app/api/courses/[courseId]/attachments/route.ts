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
    const { url } = await req.json()

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

    const attachment = await db.attachment.create({
      data: {
        url,
        name: url.split('/').pop(),
        courseId,
      },
    })

    return NextResponse.json(attachment)
  } catch (e) {
    console.log('[COURSES_ID_ATTACHMENTS_POST]', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
