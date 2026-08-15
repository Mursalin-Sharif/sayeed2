import { cn } from '@/lib/utils'
import logoSrc from '@/assets/js-agro-shop-logo.png'

export function LogoMark({ className = 'size-20' }: { className?: string }) {
  return (
    <img
      src={logoSrc}
      alt="JS Agro Shop"
      width={788}
      height={800}
      decoding="async"
      className={cn('block shrink-0 object-contain object-center', className)}
    />
  )
}
