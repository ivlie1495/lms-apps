import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import { db } from '@/services/db'

interface ParamsProps {
  params: {
    courseId: string
    attachmentId: string
  }
}

export const DELETE = async (_: Request, { params }: ParamsProps) => {
  try {
    const { courseId, attachmentId } = params
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

    const attachment = await db.attachment.delete({
      where: {
        id: attachmentId,
        courseId,
      },
    })

    return NextResponse.json(attachment)
  } catch (e) {
    console.log('[ATTACHMENT_ID_DELETE]', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
