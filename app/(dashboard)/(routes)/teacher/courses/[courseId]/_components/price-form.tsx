'use client'

import axios from 'axios'
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Course } from '@prisma/client'

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
import { formatPrice } from '@/utils/format'

const formSchema = z.object({
  price: z.coerce.number(),
})

type Form = z.infer<typeof formSchema>

interface Props {
  data: Course
}

const PriceForm = ({ data }: Props) => {
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const toggleEditing = () => setIsEditing((current) => !current)

  const form = useForm<Form>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: data?.price || undefined,
    },
  })
  const { formState, control, handleSubmit } = form
  const { isSubmitting, isValid } = formState

  const onSubmit = async (values: Form) => {
    try {
      await axios.patch(`/api/courses/${data.id}`, values)

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

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course Price
        <Button variant="ghost" onClick={toggleEditing}>
          {isEditing && <>Cancel</>}
          {!isEditing && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Price
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn('text-sm mt-2', !data.price && 'text-slate-500 italic')}
        >
          {data.price ? formatPrice(data.price) : 'No price'}
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              name="price"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={isSubmitting}
                      placeholder="123"
                      {...field}
                      value={field?.value || ''}
                    />
                  </FormControl>
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

export default PriceForm
