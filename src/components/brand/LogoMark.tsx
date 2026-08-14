export function LogoMark({ className = 'size-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 128 128" className={className} aria-hidden="true">
      <circle cx="64" cy="64" r="64" fill="#0b3d2e" />
      <circle cx="64" cy="64" r="55" fill="none" stroke="#f0c419" strokeWidth="4" />
      <path
        d="M64 26c-1 16-11 26-18 32 12-2 16-12 18-32Z"
        fill="#f0c419"
      />
      <path
        d="M64 26c1 16 11 26 18 32-12-2-16-12-18-32Z"
        fill="#c9a014"
      />
      <path d="M64 26v28" stroke="#f0c419" strokeWidth="3.2" strokeLinecap="round" />
      <text
        x="64"
        y="102"
        textAnchor="middle"
        fill="#f0c419"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="38"
        fontWeight="800"
        letterSpacing="-1.5"
      >
        JS
      </text>
    </svg>
  )
}
