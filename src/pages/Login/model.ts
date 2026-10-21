import type { StoredAdmin } from '@/utils/auth'

export interface AdminProfile extends StoredAdmin {
  id: number
}

export interface LoginResult {
  token: string
  admin: AdminProfile
}
