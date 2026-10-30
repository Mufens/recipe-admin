import request from '@/utils/request'
import type { BannerCover, BannerItem } from './model'

const BASE = '/api/home/banner/manage'

/** 轮播管理列表 */
export const fetchBannerManageList = (signal?: AbortSignal) =>
  request.get<BannerItem[]>(BASE, { signal })

/** 切换轮播启用状态 */
export const patchBannerActive = (id: number, isActive: boolean) =>
  request.patch<{ id: number; is_active: number }>(`${BASE}/${id}/active`, {
    is_active: Number(isActive),
  })

/** 保存轮播封面 */
export const patchBannerCovers = (id: number, covers: BannerCover[]) =>
  request.patch<{ id: number; covers: BannerCover[] }>(`${BASE}/${id}/covers`, {
    covers,
  })
