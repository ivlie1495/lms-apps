'use client'

import axios from 'axios'
import { Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import ConfirmModal from '@/components/modals/confirm-modal'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { useConfettiStore } from '@/hooks/use-confetti-store'

interface Props {
  disabled: boolean
  courseId: string
  isPublished: boolean
}

const CourseActions = ({ disabled, courseId, isPublished }: Props) => {
  const router = useRouter()
  const confetti = useConfettiStore()
  const [isLoading, setIsLoading] = useState(false)

  const onClick = async () => {
    try {
      setIsLoading(true)

      if (isPublished) {
        await axios.patch(`/api/courses/${courseId}/unpublish`)

        toast({
          title: 'Success',
          description: 'Course unpublished!',
        })
      } else {
        await axios.patch(`/api/courses/${courseId}/publish`)

        toast({
          title: 'Success',
          description: 'Course published!',
        })
        confetti.onOpen()
      }

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

  const onDelete = async () => {
    try {
      setIsLoading(true)

      await axios.delete(`/api/courses/${courseId}`)
      toast({
        title: 'Success',
        description: 'Course deleted!',
      })

      router.push(`/teacher/courses`)
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
    <div className="flex items-center gap-x-2">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || isLoading}
        onClick={onClick}
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm" disabled={isLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  )
}

export default CourseActions
