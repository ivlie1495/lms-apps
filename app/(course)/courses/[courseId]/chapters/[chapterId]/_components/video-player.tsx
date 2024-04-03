'use client'

import axios from 'axios'
import { Loader2, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'

import { toast } from '@/components/ui/use-toast'
import { useConfettiStore } from '@/hooks/use-confetti-store'
import { cn } from '@/utils/ui'

interface Props {
  chapterId: string
  courseId: string
  nextChapterId: string
  playbackId: string
  title: string
  isLocked: boolean
  completeOnEnd: boolean
}

const VideoPlayer = ({
  chapterId,
  courseId,
  nextChapterId,
  playbackId,
  title,
  isLocked,
  completeOnEnd,
}: Props) => {
  const router = useRouter()
  const confetti = useConfettiStore()
  const [isReady, setIsReady] = useState(false)

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(
          `/api/courses/${courseId}/chapters/${chapterId}/progress`,
          {
            isCompleted: true,
          }
        )

        if (!nextChapterId) {
          confetti.onOpen()
        }

        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`)
        }

        toast({
          title: 'Success',
          description: 'Progress updated!',
        })
        router.refresh()
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Something went wrong!',
        description: 'There was a problem with your request.',
      })
    }
  }

  return (
    <div className="relative aspect-video">
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
          <Lock className="h-8 w-8" />
          <p className="text-sm">This chapter is locked</p>
        </div>
      )}
      {!isLocked && (
        <MuxPlayer
          title={title}
          onCanPlay={() => setIsReady(true)}
          onEnded={onEnd}
          autoPlay
          playbackId={playbackId}
          className={cn(!isReady && 'hidden')}
        />
      )}
    </div>
  )
}

export default VideoPlayer
