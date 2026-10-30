import request from '@/utils/request'
import type {
  AccountListResult,
  AccountQuery,
  DepartmentNode,
  InternalAccount,
  RoleOption,
} from './model'

/** 内部账号列表 */
export const fetchAccounts = (
  query: AccountQuery,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
) =>
  request.get<AccountListResult>('/api/admin/internal-accounts', {
    params: {
      name: query.name,
      jobNumber: query.jobNumber,
      jobTitle: query.jobTitle,
      department: query.department,
      page,
      pageSize,
      ...(query.roleId ? { roleId: query.roleId } : {}),
    },
    signal,
  })

export const fetchDepartments = (signal?: AbortSignal) =>
  request.get<DepartmentNode[]>('/api/admin/internal-accounts/departments', { signal })

/** 获取角色弹框里的角色选项 */
export const fetchRoleOptions = (signal?: AbortSignal) =>
  request.get<RoleOption[]>('/api/admin/internal-accounts/role-options', {
    signal,
  })

/** 保存某个内部账号的角色 */
export const setAccountRoles = (id: number, roleIds: number[]) =>
  request.put<InternalAccount>(`/api/admin/internal-accounts/${id}/roles`, {
    roleIds,
  })
