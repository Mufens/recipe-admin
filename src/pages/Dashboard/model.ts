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

/** 看板 Demo 数据，接入真实接口后替换 */
export const DEMO_STATS: DashboardStat[] = [
  { key: 'recipes', title: '菜谱总数', value: 1286, delta: '+24 本周', trend: 'up' },
  { key: 'users', title: '注册用户', value: 3520, delta: '+86 本周', trend: 'up' },
  { key: 'stars', title: '累计收藏', value: 18420, delta: '+312 本周', trend: 'up' },
  { key: 'cooked', title: '下厨打卡', value: 6720, delta: '+128 本周', trend: 'up' },
  { key: 'aiAsk', title: 'AI 提问', value: 9180, suffix: '次', delta: '+5.2%', trend: 'up' },
  {
    key: 'aiDislike',
    title: '低满意占比',
    value: 4.8,
    suffix: '%',
    delta: '-0.6pt',
    trend: 'down',
    decimals: 1,
  },
]

export const DEMO_HOT_RECIPES: HotRecipeRow[] = [
  { key: '1', rank: 1, title: '番茄炒蛋', star: 1260, cooked: 842, category: '家常菜' },
  { key: '2', rank: 2, title: '红烧肉', star: 1188, cooked: 756, category: '硬菜' },
  { key: '3', rank: 3, title: '蒜蓉西兰花', star: 980, cooked: 690, category: '素菜' },
  { key: '4', rank: 4, title: '酸辣土豆丝', star: 920, cooked: 640, category: '家常菜' },
  { key: '5', rank: 5, title: '糖醋排骨', star: 880, cooked: 510, category: '硬菜' },
  { key: '6', rank: 6, title: '麻婆豆腐', star: 840, cooked: 498, category: '川菜' },
  { key: '7', rank: 7, title: '清蒸鲈鱼', star: 790, cooked: 420, category: '海鲜' },
  { key: '8', rank: 8, title: '南瓜小米粥', star: 720, cooked: 380, category: '主食' },
]

export const DEMO_AI_TREND: AiTrendPoint[] = [
  { day: '周一', ask: 980, dislike: 52 },
  { day: '周二', ask: 1120, dislike: 48 },
  { day: '周三', ask: 1050, dislike: 61 },
  { day: '周四', ask: 1280, dislike: 55 },
  { day: '周五', ask: 1410, dislike: 63 },
  { day: '周六', ask: 1680, dislike: 71 },
  { day: '周日', ask: 1560, dislike: 58 },
]

export const DEMO_RECENT_FEEDBACK: RecentFeedbackRow[] = [
  {
    key: '1',
    question: '冰箱只剩鸡蛋和番茄还能做什么？',
    reason: '答非所问',
    time: '今天 14:22',
  },
  {
    key: '2',
    question: '红烧肉怎样才能不柴？',
    reason: '步骤不清晰',
    time: '今天 11:08',
  },
  {
    key: '3',
    question: '低脂晚餐推荐',
    reason: '菜谱未收录',
    time: '昨天 21:40',
  },
  {
    key: '4',
    question: '宝宝辅食可以加盐吗？',
    reason: '信息不准确',
    time: '昨天 18:15',
  },
  {
    key: '5',
    question: '根据我的收藏推荐一周菜单',
    reason: '推荐重复',
    time: '昨天 09:33',
  },
]
