/** 页头小插画：平底锅 + 热气，描边吃主题色 */
export default function HeroDecor() {
  return (
    <svg
      className="dashboard-page__hero-svg"
      viewBox="0 0 120 96"
      width="120"
      height="96"
      aria-hidden
    >
      <ellipse cx="52" cy="78" rx="36" ry="6" className="is-shadow" />
      <path
        className="is-stroke"
        d="M18 58h68a8 8 0 0 1 8 8v2H10v-2a8 8 0 0 1 8-8z"
        fill="none"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="is-fill"
        d="M22 58c2-14 12-24 30-24s28 10 30 24H22z"
        opacity="0.35"
      />
      <path
        className="is-stroke"
        d="M86 62h22c4 0 7 3 7 7s-3 7-7 7h-8"
        fill="none"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        className="is-steam s1"
        d="M40 28c0-6 4-8 4-14"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        className="is-steam s2"
        d="M52 24c0-7 4-9 4-16"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        className="is-steam s3"
        d="M64 28c0-6 4-8 4-14"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle className="is-fill" cx="44" cy="48" r="3.5" />
      <circle className="is-fill" cx="58" cy="44" r="2.5" />
      <circle className="is-fill" cx="68" cy="50" r="3" />
    </svg>
  )
}
