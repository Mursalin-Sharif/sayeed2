import { cn } from '@/lib/utils'
import logoSrc from '@/assets/js-agro-shop-logo.png'

export function LogoMark({ className = 'size-20' }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-block shrink-0 overflow-hidden rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.18)]',
        className,
      )}
    >
      <img
        src={logoSrc}
        alt="JS Agro Shop"
        width={788}
        height={800}
        decoding="async"
        className="absolute inset-0 size-full scale-[1.42] object-cover object-center"
      />
    </span>
  )
}
