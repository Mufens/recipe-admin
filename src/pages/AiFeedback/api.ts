import request from '@/utils/request'
import type { FeedbackReasonCode, LowSatisfactionResult } from './model'

export interface LowSatisfactionParams {
  keyword: string
  reason: '' | FeedbackReasonCode
  page: number
  pageSize: number
}

/** 低满意问题榜 */
export function fetchLowSatisfaction(
  params: LowSatisfactionParams,
  signal?: AbortSignal,
) {
  return request.post<LowSatisfactionResult>('/api/ai/feedback/rank', params, {
    signal,
  })
}
