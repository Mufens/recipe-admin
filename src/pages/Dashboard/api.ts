import request from '@/utils/request'
import type { DashboardOverview } from './model'

export function fetchOverview(signal?: AbortSignal) {
  return request.get<DashboardOverview>('/api/dashboard/overview', {
    params: { days: 7 },
    signal,
  })
}
