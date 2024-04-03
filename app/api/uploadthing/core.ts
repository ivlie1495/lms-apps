import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { auth } from '@clerk/nextjs'

import { isTeacher } from '@/utils/role'

const f = createUploadthing()
const handleAuth = () => {
  const { userId } = auth()
  const isAuthorized = isTeacher(userId)

  if (!userId || !isAuthorized) throw new UploadThingError('Unauthorized')

  return { userId }
}

export const ourFileRouter = {
  courseImage: f({ image: { maxFileSize: '4MB' } })
    .middleware(handleAuth)
    .onUploadComplete(() => {}),
  courseAttachment: f(['image', 'text', 'video', 'audio', 'pdf'])
    .middleware(handleAuth)
    .onUploadComplete(() => {}),
  chapterVideo: f({ video: { maxFileSize: '512GB' } })
    .middleware(handleAuth)
    .onUploadComplete(() => {}),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
