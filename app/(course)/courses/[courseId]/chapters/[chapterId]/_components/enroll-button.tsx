'use client'

import axios from 'axios'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { formatPrice } from '@/utils/format'

interface Props {
  courseId: string
  price: number
}

const EnrollButton = ({ courseId, price }: Props) => {
  const [isLoading, setIsLoading] = useState(false)

  const onClick = async () => {
    try {
      setIsLoading(true)

      const response = await axios.post(`/api/courses/${courseId}/checkout`)
      window.location.assign(response.data.url)
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
      size="sm"
      className="w-full md:w-auto"
      disabled={isLoading}
      onClick={onClick}
    >
      Enroll for {formatPrice(price)}
    </Button>
  )
}

export default EnrollButton
