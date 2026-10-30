export const BANNER_QUERY_KEY = ['banners-manage'] as const

export type BannerLinkType = 'search' | 'rank' | 'recipe' | 'surprise'
export type BannerLayout = 'surprise' | 'collage' | 'mood' | 'story'

export function needsFixedCovers(layout?: string | null) {
  return layout === 'collage' || layout === 'story'
}

export interface BannerCover {
  id: number
  title: string
  img: string
}

export interface BannerItem {
  id: number
  img: string | null
  title: string
  subtitle: string | null
  badge: string | null
  layout: BannerLayout
  cta: string | null
  link_type: BannerLinkType
  /** 跳转参数，含义随 link_type */
  link_value: string | null
  covers: BannerCover[]
  sort_order: number
  /** 1 启用，0 停用 */
  is_active: number
}
