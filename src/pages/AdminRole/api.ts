import request from '@/utils/request'
import type {
  AdminAccount,
  AdminRole,
  AdminRoleDetail,
  FeishuDepartment,
  FeishuEmployee,
  PermissionNode,
  RoleSaveBody,
} from './model'

/** 角色列表 */
export const fetchRoles = (signal?: AbortSignal) =>
  request.get<AdminRole[]>('/api/admin/roles', { signal })

/** 角色详情，含权限编码 */
export const fetchRole = (id: number, signal?: AbortSignal) =>
  request.get<AdminRoleDetail>(`/api/admin/roles/${id}`, { signal })

/** 新增角色 */
export const createRole = (body: RoleSaveBody) =>
  request.post<AdminRoleDetail>('/api/admin/roles', body)

/** 保存角色基础信息；带 permissions 时同时替换权限 */
export const updateRole = (id: number, body: RoleSaveBody) =>
  request.patch<AdminRoleDetail>(`/api/admin/roles/${id}`, body)

/** 删除角色，并清掉权限和成员绑定 */
export const removeRole = (id: number) => request.delete(`/api/admin/roles/${id}`)

/** 权限树 */
export const fetchPermissionTree = (signal?: AbortSignal) =>
  request.get<PermissionNode[]>('/api/admin/permissions', { signal })

/** 角色成员 */
export const fetchRoleMembers = (id: number, signal?: AbortSignal) =>
  request.get<AdminAccount[]>(`/api/admin/roles/${id}/members`, { signal })

/** 按飞书 open_id 追加角色成员 */
export const addRoleMembers = (id: number, openIds: string[]) =>
  request.post<AdminAccount[]>(`/api/admin/roles/${id}/members`, { openIds })

/** 移除一名角色成员 */
export const removeRoleMember = (id: number, adminId: number) =>
  request.delete(`/api/admin/roles/${id}/members/${adminId}`)

/** 飞书部门；parentId 为 0 时是根部门 */
export const fetchFeishuDepartments = (parentId: string, signal?: AbortSignal) =>
  request.get<FeishuDepartment[]>('/api/admin/directory/departments', {
    params: { parentId },
    signal,
  })

/** 该部门及其下级的在职成员，含负责人 */
export const fetchFeishuEmployees = (departmentId: string, signal?: AbortSignal) =>
  request.get<FeishuEmployee[]>('/api/admin/directory/employees', {
    params: { departmentId },
    signal,
  })
