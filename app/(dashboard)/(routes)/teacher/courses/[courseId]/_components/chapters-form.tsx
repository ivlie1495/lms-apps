'use client'

import axios from 'axios'
import { Loader2, PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Chapter, Course } from '@prisma/client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/utils/ui'

import Chapterlist from './chapters-list'

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Description is required',
  }),
})

type Form = z.infer<typeof formSchema>

interface Props {
  data: Course & {
    chapters: Chapter[]
  }
}

const ChaptersForm = ({ data }: Props) => {
  const router = useRouter()

  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const toggleCreating = () => setIsCreating((current) => !current)

  const form = useForm<Form>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  })
  const { formState, control, handleSubmit } = form
  const { isSubmitting, isValid } = formState

  const onSubmit = async (values: Form) => {
    try {
      await axios.post(`/api/courses/${data.id}/chapters`, values)

      toast({
        title: 'Success',
        description: 'Chapter created!',
      })
      toggleCreating()
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Something went wrong!',
        description: 'There was a problem with your request.',
      })
    }
  }

  const onReorder = async (
    updatedData: {
      id: string
      position: number
    }[]
  ) => {
    try {
      setIsUpdating(true)

      await axios.put(`/api/courses/${data.id}/chapters/reorder`, {
        list: updatedData,
      })

      toast({
        title: 'Success',
        description: 'Chapter reordered!',
      })
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Something went wrong!',
        description: 'There was a problem with your request.',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const onEdit = (id: string) =>
    router.push(`/teacher/courses/${data.id}/chapters/${id}`)

  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
      {isUpdating && (
        <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}
      <div className="font-medium flex items-center justify-between">
        Course Chapters
        <Button variant="ghost" onClick={toggleCreating}>
          {isCreating && <>Cancel</>}
          {!isCreating && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a chapter
            </>
          )}
        </Button>
      </div>
      {isCreating && (
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              name="title"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Introduction to the course"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={!isValid || isSubmitting}>
              Create
            </Button>
          </form>
        </Form>
      )}
      {!isCreating && (
        <>
          <div
            className={cn(
              'text-sm mt-2',
              !data.chapters.length && 'text-slate-500 italic'
            )}
          >
            {!data.chapters.length && 'No chapters'}
            <Chapterlist
              onEdit={onEdit}
              onReorder={onReorder}
              items={data.chapters}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Drag and drop to reorder the chapters
          </p>
        </>
      )}
    </div>
  )
}

export default ChaptersForm
