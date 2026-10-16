import type { CategoryOption } from '@/api/category'

/**
 * Cascader 路径段：一级/二级为 string，叶子 tag 为正整数 number
 * 例：["b","bb",312]
 * SHOW_CHILD 下勾选父级会写入全部叶子路径。
 */
export type PathValue = string | number
export type CategoryPath = PathValue[]
export type CategoryPaths = CategoryPath[]

export interface RecipeTagView {
  id: number
  name: string
  path_label?: string
}

function isTagId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function isLeafCategoryPath(
  path: CategoryPath | null | undefined,
): path is CategoryPath {
  if (!Array.isArray(path) || !path.length) return false
  return isTagId(path[path.length - 1])
}

/**
 * 根据叶子 tagId 在分类树中还原 Cascader 单条路径
 * 例：tagId=312 → ["b","bb",312]
 */
export function resolvePathByTagId(
  tree: CategoryOption[],
  tagId: number,
): CategoryPath | null {
  if (!isTagId(tagId)) return null

  for (const cat of tree) {
    for (const mid of cat.children || []) {
      const midChildren = mid.children || []
      if (!midChildren.length && mid.value === tagId) {
        return [cat.value, tagId]
      }
      for (const item of midChildren) {
        if (item.value === tagId) {
          return [cat.value, mid.value, tagId]
        }
      }
    }
  }
  return null
}

export function resolveCategoryPaths(
  tree: CategoryOption[],
  tags: RecipeTagView[] | null | undefined,
): CategoryPaths {
  return (tags ?? [])
    .filter((t) => isTagId(t.id))
    .map((t) => resolvePathByTagId(tree, t.id))
    .filter((p) => isLeafCategoryPath(p))
}

function findCategoryNode(
  tree: CategoryOption[],
  path: CategoryPath,
): CategoryOption | null {
  let nodes = tree
  let node: CategoryOption | undefined

  for (const value of path) {
    node = nodes.find((item) => item.value === value)
    if (!node) return null
    nodes = node.children ?? []
  }

  return node ?? null
}

function collectLeafTagIds(node: CategoryOption, tagIds: Set<number>) {
  const children = node.children ?? []
  if (!children.length) {
    if (isTagId(node.value)) tagIds.add(node.value)
    return
  }

  children.forEach((child) => collectLeafTagIds(child, tagIds))
}

/** 将 Cascader 选中的父级或叶子路径展开为去重后的叶子标签 id。 */
export function extractLeafTagIds(
  tree: CategoryOption[],
  paths: CategoryPaths,
): number[] {
  const tagIds = new Set<number>()

  for (const path of paths) {
    const node = findCategoryNode(tree, path)
    if (node) {
      collectLeafTagIds(node, tagIds)
      continue
    }

    const tagId = path[path.length - 1]
    if (isTagId(tagId)) tagIds.add(tagId)
  }

  return [...tagIds]
}
