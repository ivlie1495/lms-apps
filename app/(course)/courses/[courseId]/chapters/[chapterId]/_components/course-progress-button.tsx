'use client'

import axios from 'axios'
import { CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { useConfettiStore } from '@/hooks/use-confetti-store'

interface Props {
  chapterId: string
  courseId: string
  nextChapterId?: string
  isCompleted: boolean
}

const CourseProgressButton = ({
  chapterId,
  courseId,
  nextChapterId,
  isCompleted,
}: Props) => {
  const Icon = isCompleted ? XCircle : CheckCircle

  const router = useRouter()
  const confetti = useConfettiStore()

  const [isLoading, setIsLoading] = useState(false)

  const onClick = async () => {
    try {
      setIsLoading(true)

      await axios.put(
        `/api/courses/${courseId}/chapters/${chapterId}/progress`,
        {
          isCompleted: !isCompleted,
        }
      )

      if (!isCompleted && !nextChapterId) {
        confetti.onOpen()
      }

      if (!isCompleted && nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`)
      }

      toast({
        title: 'Success',
        description: 'Progress updated!',
      })
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Something went wrong!',
        description: 'There was a problem with your request.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={isCompleted ? 'outline' : 'success'}
      className="w-full md:w-auto"
      disabled={isLoading}
      onClick={onClick}
    >
      {isCompleted ? 'Not completed' : 'Mark as complete'}
      <Icon className="h-4 w-4 ml-2" />
    </Button>
  )
}

export default CourseProgressButton
