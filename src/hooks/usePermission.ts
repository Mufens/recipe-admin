import { useQuery } from '@tanstack/react-query'
import { fetchAdminProfile } from '@/pages/Login/api'
import type { AdminProfile } from '@/pages/Login/model'
import { queryClient } from '@/utils/queryClient'

const ADMIN_PROFILE_KEY = ['admin-profile'] as const

export function useAdminProfile() {
  return useQuery({
    queryKey: ADMIN_PROFILE_KEY,
    queryFn: ({ signal }) => fetchAdminProfile(signal),
  })
}

export function permission(code: string) {
  const permissions = queryClient.getQueryData<AdminProfile>(ADMIN_PROFILE_KEY)?.permissions
  return Boolean(permissions?.includes(code))
}
