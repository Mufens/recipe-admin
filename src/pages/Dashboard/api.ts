import request from '@/utils/request'
import type { DashboardOverview } from './model'

/** 看板近 7 日概览 */
export function fetchOverview(signal?: AbortSignal) {
  return request.get<DashboardOverview>('/api/dashboard/overview', {
    params: { days: 7 },
    signal,
  })
}
