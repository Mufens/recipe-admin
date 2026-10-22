export type StatIconKey =
  | 'recipes'
  | 'users'
  | 'stars'
  | 'cooked'
  | 'aiAsk'
  | 'aiDislike'

export interface DashboardStat {
  key: StatIconKey
  title: string
  value: number
  suffix?: string
  delta: string
  trend: 'up' | 'down' | 'flat'
  /** 小数位；整数不传 */
  decimals?: number
}

export interface HotRecipeRow {
  key: string
  rank: number
  title: string
  star: number
  cooked: number
  category: string
}

export interface AiTrendPoint {
  day: string
  ask: number
  dislike: number
}

export interface RecentFeedbackRow {
  key: string
  question: string
  reason: string
  time: string
}

export interface DashboardOverview {
  stats: DashboardStat[]
  aiTrend: AiTrendPoint[]
  hotRecipes: HotRecipeRow[]
  recentFeedback: RecentFeedbackRow[]
}
