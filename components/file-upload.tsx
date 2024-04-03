'use client'

import { UploadDropzone } from '@/utils/uploadthing'
import { ourFileRouter } from '@/app/api/uploadthing/core'

import { toast } from './ui/use-toast'

interface Props {
  onChange: (url?: string) => void
  endpoint: keyof typeof ourFileRouter
}

const FileUpload = ({ onChange, endpoint }: Props) => {
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => onChange(res?.[0].url)}
      onUploadError={(error: Error) =>
        toast({
          title: 'Something went wrong',
          description: error.message,
        })
      }
    />
  )
}

export default FileUpload
