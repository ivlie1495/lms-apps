'use client'

import axios from 'axios'
import { File, ImageIcon, Loader2, PlusCircle, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Attachment, Course } from '@prisma/client'

import FileUpload from '@/components/file-upload'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

interface Props {
  data: Course & { attachments: Attachment[] }
}

const AttachmentForm = ({ data }: Props) => {
  const router = useRouter()

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const toggleEditing = () => setIsEditing((current) => !current)

  const onSubmit = async (values: { url: string }) => {
    try {
      await axios.post(`/api/courses/${data.id}/attachments`, values)

      toast({
        title: 'Success',
        description: 'Course updated!',
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

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await axios.delete(`/api/courses/${data.id}/attachments/${id}`)

      toast({
        title: 'Success',
        description: 'Attachment deleted!',
      })
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Something went wrong!',
        description: 'There was a problem with your request.',
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course Attachments
        <Button variant="ghost" onClick={toggleEditing}>
          {isEditing && <>Cancel</>}
          {!isEditing && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a file
            </>
          )}
        </Button>
      </div>
      {!isEditing && data?.attachments.length === 0 && (
        <p className="text-sm mt-2 text-slate-500 italic">No attachments yet</p>
      )}
      {!isEditing && data?.attachments.length > 0 && (
        <div className="space-y-2">
          {data?.attachments.map(({ id, name }) => (
            <div
              key={id}
              className="flex items-center p-3 w-full bg-sky-100 border-sky-200 border text-sky-700 rounded-md"
            >
              <File className="h-4 w-4 m-2 flex-shrink-0" />
              <p className="text-xs line-clamp-1">{name}</p>
              {deletingId === id && (
                <div className="ml-auto">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              {deletingId !== id && (
                <button
                  className="ml-auto hover:opacity-75 transition"
                  onClick={() => onDelete(id)}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="courseAttachment"
            onChange={(url) => {
              if (url) {
                onSubmit({ url })
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Add anything your students might need to complete the course
          </div>
        </div>
      )}
    </div>
  )
}

export default AttachmentForm
