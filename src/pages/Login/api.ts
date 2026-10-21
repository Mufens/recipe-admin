import request from '@/utils/request'
import type { AdminProfile, LoginResult } from './model'

export const fetchAdminProfile = () =>
  request.get<AdminProfile>('/api/auth/admin/profile')

export const loginAdmin = (body: { username: string; password: string }) =>
  request.post<LoginResult>('/api/auth/admin/login', body)

export const fetchFeishuUrl = () =>
  request.get<{ url: string }>('/api/auth/feishu/url')

export const exchangeFeishuTicket = (ticket: string) =>
  request.post<LoginResult>('/api/auth/feishu/ticket', { ticket })
