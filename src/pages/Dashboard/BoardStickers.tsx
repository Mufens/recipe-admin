/** 黑板报点缀：角花 + 散落小贴纸（描边吃主题色） */
export default function BoardStickers() {
  return (
    <div className="dashboard-page__stickers" aria-hidden>
      <svg className="sticker sticker--tl" viewBox="0 0 64 64">
        <path
          d="M8 40c8-18 20-28 32-32 2 12-2 26-12 36C18 52 10 48 8 40z"
          fill="currentColor"
          opacity="0.18"
        />
        <path
          d="M12 38c7-14 16-22 26-26"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="44" cy="14" r="3" fill="currentColor" opacity="0.55" />
      </svg>

      <svg className="sticker sticker--tr" viewBox="0 0 64 64">
        <path
          d="M12 20l8-4 4 8 8-4 2 10-10 2 4 8-10-2-4 8-4-10-10 2 6-8z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M18 28l6-3 3 6 6-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <svg className="sticker sticker--star" viewBox="0 0 48 48">
        <path
          d="M24 6l4.8 12.2L42 20l-10 8.2L35 42 24 34.2 13 42l3-13.8L6 20l13.2-1.8z"
          fill="currentColor"
          opacity="0.22"
        />
      </svg>

      <svg className="sticker sticker--heart" viewBox="0 0 48 48">
        <path
          d="M24 40s-14-9.2-14-18A8 8 0 0 1 24 16a8 8 0 0 1 14 6c0 8.8-14 18-14 18z"
          fill="currentColor"
          opacity="0.2"
        />
      </svg>

      <svg className="sticker sticker--fork" viewBox="0 0 40 56">
        <path
          d="M10 6v14c0 4 3 7 7 7v23"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M6 6v10M14 6v10M22 6v10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M30 8c4 2 6 6 6 12v30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>

      <svg className="sticker sticker--dot-a" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.25" />
      </svg>
      <svg className="sticker sticker--dot-b" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.35"
        />
      </svg>

      <svg className="sticker sticker--bl" viewBox="0 0 72 48">
        <path
          d="M6 36c10-2 18-12 22-22 8 6 12 16 12 26"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M40 30c8 0 16 4 22 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>
    </div>
  )
}
