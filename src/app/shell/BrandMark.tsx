export function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect width="24" height="24" rx="7" fill="var(--accent)" />
      <circle cx="12" cy="12" r="6.5" stroke="white" strokeWidth="1.5" opacity=".55" />
      <circle cx="12" cy="12" r="2.5" fill="white" />
      <path d="M12 2.5v3M21.5 12h-3M12 21.5v-3M2.5 12h3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
