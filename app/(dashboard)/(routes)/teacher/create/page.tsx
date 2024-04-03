'use client'

import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Title is required',
  }),
})

type Form = z.infer<typeof formSchema>

const CreateCoursePage = () => {
  const router = useRouter()
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
      const response = await axios.post('/api/courses', values)

      router.push(`/teacher/courses/${response.data.id}`)
      toast({
        title: 'Success',
        description: 'Course created!',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Something went wrong!',
        description: 'There was a problem with your request.',
      })
    }
  }

  return (
    <div className="max-w-5xl mx-auto flex md:items-center md:justify-center h-full p-6">
      <div>
        <h1 className="text-2xl">Name your course</h1>
        <p className="text-sm text-slate-600">
          What would you like to name your course. Don&apos;t worry, you can
          change this later.
        </p>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-8">
            <FormField
              name="title"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Advanced Web Development"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What will you teach in this course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Link href="/">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default CreateCoursePage
