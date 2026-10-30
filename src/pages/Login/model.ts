export interface AdminProfile {
  id: number
  name: string
  avatar: string | null
  permissions: string[]
}

export interface LoginResult {
  token: string
  admin: Pick<AdminProfile, 'id' | 'name' | 'avatar'>
}
