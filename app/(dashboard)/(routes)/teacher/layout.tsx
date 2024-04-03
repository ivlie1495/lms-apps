import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { auth } from '@clerk/nextjs'

import { isTeacher } from '@/utils/role'

const TeacherLayout = ({ children }: PropsWithChildren) => {
  const { userId } = auth()

  if (isTeacher(userId)) {
    return redirect('/')
  }

  return <>{children}</>
}

export default TeacherLayout
