export interface AccountRole {
  id: number
  code: string
  name: string
}

export interface InternalAccount {
  id: number
  name: string
  avatar: string | null
  createTime: string
  updatedBy: string
  updateTime: string | null
  /** 人事状态：在职、离职、待入职、取消入职、待离职 */
  staffStatus: string
  /** 主部门路径/
  department: string
  /** 职务 */
  jobTitle: string
  /** 性别：未知、男、女、其他 */
  gender: string
  /** 工号 */
  jobNumber: string
  roles: AccountRole[]
}

export interface AccountListResult {
  items: InternalAccount[]
  total: number
  page: number
  pageSize: number
  pages: number
}

export interface AccountQuery {
  name: string
  roleId?: number
  jobNumber: string
  jobTitle: string
  department: string
}

export interface DepartmentNode {
  id: string
  name: string
  children?: DepartmentNode[]
}

export interface RoleOption {
  id: number
  code: string
  name: string
  /** 1 为内置角色 */
  builtin: number
  /** 1 启用，0 禁用 */
  status: number
}
