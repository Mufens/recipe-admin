import request from '@/utils/request'
import type { AdminProfile, LoginResult } from './model'

/** 当前管理员档案和权限编码 */
export const fetchAdminProfile = (signal?: AbortSignal) =>
  request.get<AdminProfile>('/api/auth/admin/profile', { signal })

/** 账号密码登录 */
export const loginAdmin = (body: { name: string; password: string }) =>
  request.post<LoginResult>('/api/auth/admin/login', body)

/** 飞书扫码授权地址 */
export const fetchFeishuUrl = () =>
  request.get<{ url: string }>('/api/auth/feishu/url')

/** 用一次性票据换登录令牌 */
export const exchangeFeishuTicket = (ticket: string) =>
  request.post<LoginResult>('/api/auth/feishu/ticket', { ticket })
