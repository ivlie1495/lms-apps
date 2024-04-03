'use client'

import axios from 'axios'
import { Pencil, PlusCircle, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'
import { Chapter, MuxData } from '@prisma/client'

import FileUpload from '@/components/file-upload'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

interface Props {
  data: Chapter & { muxData?: MuxData | null }
}

const ChapterVideoForm = ({ data }: Props) => {
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const toggleEditing = () => setIsEditing((current) => !current)

  const onSubmit = async (values: { videoUrl: string }) => {
    try {
      await axios.patch(
        `/api/courses/${data.courseId}/chapters/${data.id}`,
        values
      )

      toast({
        title: 'Success',
        description: 'Chapter updated!',
      })
      toggleEditing()
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Something went wrong!',
        description: 'There was a problem with your request.',
      })
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Chapter Video
        <Button variant="ghost" onClick={toggleEditing}>
          {isEditing && <>Cancel</>}
          {!isEditing && !data?.videoUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add an video
            </>
          )}
          {!isEditing && data?.videoUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Video
            </>
          )}
        </Button>
      </div>
      {!isEditing && !data?.videoUrl && (
        <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
          <Video className="h-10 w-10 text-slate-500" />
        </div>
      )}
      {!isEditing && data?.videoUrl && (
        <div className="relative aspect-video mt-2">
          <MuxPlayer playbackId={data.muxData?.playbackId!} />
        </div>
      )}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="chapterVideo"
            onChange={(videoUrl) => {
              if (videoUrl) {
                onSubmit({ videoUrl })
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Upload this chapter&apos;s video
          </div>
        </div>
      )}
      {data?.videoUrl && !isEditing && (
        <div className="text-xs text-muted-foreground mt-2">
          Videos can take a few minutes to process. Refresh the page if video
          does not appear.
        </div>
      )}
    </div>
  )
}

export default ChapterVideoForm
