import request from '@/utils/request'
import type { ResourceNode, ResourceSaveBody } from './model'

/** 资源树 */
export const fetchResources = (signal?: AbortSignal) =>
  request.get<ResourceNode[]>('/api/admin/resources', { signal })

/** 新增资源 */
export const createResource = (body: ResourceSaveBody) =>
  request.post('/api/admin/resources', body)

/** 修改资源名称和编码 */
export const updateResource = (id: number, body: Pick<ResourceSaveBody, 'name' | 'code'>) =>
  request.patch(`/api/admin/resources/${id}`, body)

/** 删除资源，下级一并删除 */
export const deleteResource = (id: number) =>
  request.delete(`/api/admin/resources/${id}`)
