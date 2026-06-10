import type { SocialPlatform } from '@/lib/site'

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.75-2.38a1.12 1.12 0 1 1 0 2.25 1.12 1.12 0 0 1 0-2.25Z" />
      </svg>
    )
  }

  if (platform === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
        <path d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.61h.29V10.2a4.87 4.87 0 1 0 4.87 4.86V8.75a6.27 6.27 0 0 0 3.58 1.11V6.78a4.1 4.1 0 0 1-2.06-.96Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
      <path d="M21.8 8.001a2.75 2.75 0 0 0-1.94-1.94C18.28 6 12 6 12 6s-6.28 0-7.86.061A2.75 2.75 0 0 0 2.2 8.001 28.6 28.6 0 0 0 2.14 12a28.6 28.6 0 0 0 .06 3.999 2.75 2.75 0 0 0 1.94 1.94C5.72 18 12 18 12 18s6.28 0 7.86-.061a2.75 2.75 0 0 0 1.94-1.94A28.6 28.6 0 0 0 21.86 12a28.6 28.6 0 0 0-.06-3.999ZM10 15.001V9l5.2 3-5.2 3Z" />
    </svg>
  )
}

const ICON_STYLES: Record<SocialPlatform, string> = {
  instagram: 'bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white',
  tiktok: 'bg-black text-white',
  youtube: 'bg-[#ff0000] text-white',
}

type OperatorSocialIconsProps = {
  links: ReadonlyArray<{
    platform: SocialPlatform
    label: string
    url: string
  }>
}

export default function OperatorSocialIcons({ links }: OperatorSocialIconsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {links.map((link) => (
        <a
          key={link.platform}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${link.label}（${link.platform}）`}
          className={`flex h-11 w-11 items-center justify-center rounded-full shadow-md transition-transform hover:scale-105 active:scale-95 ${ICON_STYLES[link.platform]}`}
        >
          <SocialIcon platform={link.platform} />
        </a>
      ))}
    </div>
  )
}

export { SocialIcon }
