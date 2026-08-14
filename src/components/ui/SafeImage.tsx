import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  src: string
  alt: string
  className?: string
}

export function SafeImage({ src, alt, className }: Props) {
  const [current, setCurrent] = useState(src || '/images/fruits.jpg')

  useEffect(() => {
    setCurrent(src || '/images/fruits.jpg')
  }, [src])

  return (
    <img
      src={current}
      alt={alt}
      className={cn('bg-leaf-light object-cover', className)}
      onError={() => {
        if (current !== '/images/fruits.jpg') setCurrent('/images/fruits.jpg')
      }}
    />
  )
}
