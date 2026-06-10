import { OPERATOR, OPERATOR_SOCIAL_LINKS } from '@/lib/site'
import OperatorProfileAvatar from './OperatorProfileAvatar'
import OperatorSocialIcons from './OperatorSocialIcons'

export default function OperatorSection() {
  return (
    <section aria-label="運営者紹介" className="py-4">
      <p className="text-[11px] tracking-[0.2em] text-hokkaido-sky font-semibold mb-2">OPERATOR</p>
      <h2 className="text-2xl font-bold text-hokkaido-deep leading-snug">運営者紹介</h2>

      <div className="mt-8 flex flex-col items-center text-center">
        <OperatorProfileAvatar />

        <div className="mt-6 flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-hokkaido-ice" aria-hidden="true" />
          <h3 className="text-xl font-bold text-hokkaido-deep whitespace-nowrap">{OPERATOR.name}</h3>
          <div className="h-px flex-1 bg-hokkaido-ice" aria-hidden="true" />
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {OPERATOR.titles.map((title) => (
            <span
              key={title}
              className="text-xs text-gray-600 border border-hokkaido-ice px-3 py-1 rounded-full"
            >
              {title}
            </span>
          ))}
        </div>

        <p className="mt-6 text-sm text-gray-700 leading-relaxed whitespace-pre-line max-w-md">
          {OPERATOR.bio}
        </p>

        <ul className="mt-8 w-full max-w-sm space-y-2 text-sm text-gray-600">
          {OPERATOR_SOCIAL_LINKS.map((social) => (
            <li key={social.platform} className="flex items-center justify-between gap-3">
              <span>{social.label}</span>
              <span>{social.stat}</span>
            </li>
          ))}
          <li className="border-t border-hokkaido-ice pt-3 mt-3 text-hokkaido-deep font-medium">
            {OPERATOR.totalFollowersLabel}
          </li>
        </ul>

        <div className="mt-8">
          <OperatorSocialIcons links={OPERATOR_SOCIAL_LINKS} />
        </div>
      </div>
    </section>
  )
}
