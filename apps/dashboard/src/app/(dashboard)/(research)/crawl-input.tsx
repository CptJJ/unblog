'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ArrowsClockwise } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useMutation } from '@tanstack/react-query'
import { crawlSite } from './actions/crawl'
import { toast } from 'sonner'

export function CrawlInputCard() {
  const [url, setUrl] = useState('fabworks.com')
  const [content, setContent] = useState<string>('shhesh')

  const { mutate, isPending, mutateAsync } = useMutation({
    mutationFn: async () => {
      const response = await crawlSite({ url: `https://${url}` })
      if (response?.validationErrors)
        throw new Error('Invalid URL, please try again')
      setContent(response?.data ?? '')
      return
    },
    onSuccess: (data) => {
      console.log(data)
    },
    onError: (error) => {
      toast.error(error.message)

      console.log(error)
    },
  })

  return (
    <Card className='p-4'>
      <div className='flex '>
        <p className=' flex h-9 w-fit items-center justify-center rounded-none border border-input bg-transparent px-3 py-1 text-sm shadow-sm text-muted-foreground -mr-[1px] '>
          https://
        </p>
        <Input
          type='url'
          placeholder='google.com'
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
        <Button disabled={isPending} onClick={() => mutate()}>
          {isPending && (
            <ArrowsClockwise
              weight='duotone'
              className='mr-2 h-4 w-4 animate-spin'
            />
          )}
          Crawl
        </Button>
      </div>
      <div className='flex flex-col gap-4'>{content}</div>
    </Card>
  )
}
