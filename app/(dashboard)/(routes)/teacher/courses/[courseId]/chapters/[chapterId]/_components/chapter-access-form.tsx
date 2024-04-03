'use client'

import axios from 'axios'
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Chapter } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { toast } from '@/components/ui/use-toast'
import Preview from '@/components/preview'
import { cn } from '@/utils/ui'

const formSchema = z.object({
  isFree: z.boolean().default(false),
})

type Form = z.infer<typeof formSchema>

interface Props {
  data: Chapter
}

const ChapterAccessForm = ({ data }: Props) => {
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const toggleEditing = () => setIsEditing((current) => !current)

  const form = useForm<Form>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFree: !!data?.isFree,
    },
  })
  const { formState, control, handleSubmit } = form
  const { isSubmitting, isValid } = formState

  const onSubmit = async (values: Form) => {
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
        Chapter Access
        <Button variant="ghost" onClick={toggleEditing}>
          {isEditing && <>Cancel</>}
          {!isEditing && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Access
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            'text-sm mt-2',
            !data.isFree && 'text-slate-500 italic'
          )}
        >
          {!data.isFree && 'This chapter is not free'}
          {data.isFree && 'This chapter is free for preview'}
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              name="isFree"
              control={control}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormDescription>
                      Check this box if you want to make this chapter free for
                      preview
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}

export default ChapterAccessForm
