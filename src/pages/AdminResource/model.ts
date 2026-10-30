export type ResourceType = 'app' | 'menu' | 'button'

export interface ResourceNode {
  id: number
  parentId: number | null
  name: string
  code: string
  type: ResourceType
  /** 所属应用名称；菜单和按钮沿用上级应用 */
  appName: string
  children?: ResourceNode[]
}

export interface ResourceSaveBody {
  name: string
  code: string
  type?: ResourceType
  parentId?: number | null
}
