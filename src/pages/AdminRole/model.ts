export interface AdminRole {
  id: number
  code: string
  name: string
  remark: string
  /** 1 启用，0 禁用 */
  status: number
  /** 1 为内置角色，不能改权限、不能删 */
  builtin: number
}

export interface AdminRoleDetail extends AdminRole {
  /** 权限编码 */
  permissions: string[]
  updatedBy: string
  updateTime: string
}

export interface PermissionNode {
  code: string
  name: string
  type: 'app' | 'menu' | 'button'
  children?: PermissionNode[]
}

export interface AdminAccount {
  id: number
  name: string
  avatar: string | null
  createTime?: string
  updatedBy?: string
  updateTime?: string | null
}

export interface FeishuDepartment {
  /** open_department_id；根部门为 0 */
  id: string
  name: string
  hasChild: boolean
}

export interface FeishuEmployee {
  /** 飞书 open_id */
  openId: string
  name: string
  avatar: string
}

export interface RoleSaveBody {
  code?: string
  name: string
  remark: string
  /** 1 启用，0 禁用 */
  status: number
  /** 不传只改基础信息；传入则整表替换权限编码 */
  permissions?: string[]
}
