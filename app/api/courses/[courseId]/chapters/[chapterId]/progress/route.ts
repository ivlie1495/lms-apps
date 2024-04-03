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

export const PUT = async (req: Request, { params }: ParamsProps) => {
  try {
    const { courseId, chapterId } = params
    const { userId } = auth()
    const { isCompleted } = await req.json()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userProgress = await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      update: {
        isCompleted,
      },
      create: {
        userId,
        chapterId,
        isCompleted,
      },
    })

    return NextResponse.json(userProgress)
  } catch (e) {
    console.log('[COURSES_ID_CHAPTERS_ID_PROGRESS_PUT]', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
