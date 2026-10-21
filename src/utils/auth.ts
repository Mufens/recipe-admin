const TOKEN_KEY = 'recipe-admin-token'
const ADMIN_KEY = 'recipe-admin-profile'

export type StoredAdmin = {
  username: string | null
  name: string
  avatar: string | null
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // private mode / quota
  }
}

export function getAdmin(): StoredAdmin | null {
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as StoredAdmin
    return {
      username: data.username ?? null,
      name: typeof data.name === 'string' ? data.name : '',
      avatar: data.avatar ?? null,
    }
  } catch {
    return null
  }
}

export function setAdmin(admin: StoredAdmin) {
  try {
    localStorage.setItem(
      ADMIN_KEY,
      JSON.stringify({
        username: admin.username,
        name: admin.name,
        avatar: admin.avatar,
      }),
    )
  } catch {
    // private mode / quota
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
  } catch {
    // private mode / quota
  }
}
