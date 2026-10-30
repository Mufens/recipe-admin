import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export interface TagItem {
  path: string
  title: string
}

export interface RouteMeta {
  title: string
  /** 侧边菜单高亮 key，子路由指回列表路径 */
  active?: string
  /** 权限编码 */
  permission?: string
}

export interface AppRoute {
  path: string
  Component: LazyExoticComponent<ComponentType>
  meta: RouteMeta
}

export const appRoutes: AppRoute[] = [
  {
    path: '/dashboard',
    Component: lazy(() => import('@/pages/Dashboard')),
    meta: { title: '数据看板', permission: 'dashboard' },
  },
  {
    path: '/recipe/list',
    Component: lazy(() => import('@/pages/Recipe/list')),
    meta: { title: '菜谱列表', permission: 'recipe_list' },
  },
  {
    path: '/categories',
    Component: lazy(() => import('@/pages/Category')),
    meta: { title: '分类管理', permission: 'category' },
  },
  {
    path: '/banners',
    Component: lazy(() => import('@/pages/Banner')),
    meta: { title: '首页轮播', permission: 'banner' },
  },
  {
    path: '/users',
    Component: lazy(() => import('@/pages/User/list')),
    meta: { title: '用户管理', permission: 'user_list' },
  },
  {
    path: '/ai/feedback',
    Component: lazy(() => import('@/pages/AiFeedback')),
    meta: { title: '低满意问题榜', permission: 'ai_feedback' },
  },
  {
    path: '/admin/accounts',
    Component: lazy(() => import('@/pages/AdminAccount')),
    meta: { title: '内部账号', permission: 'admin_account' },
  },
  {
    path: '/admin/roles',
    Component: lazy(() => import('@/pages/AdminRole')),
    meta: { title: '角色管理', permission: 'admin_role' },
  },
  {
    path: '/admin/resources',
    Component: lazy(() => import('@/pages/AdminResource')),
    meta: { title: '资源管理', permission: 'admin_resource' },
  },
  {
    path: '/recipe/detail',
    Component: lazy(() => import('@/pages/Recipe/detail')),
    meta: { title: '菜谱详情', active: '/recipe/list', permission: 'recipe_list' },
  },
  {
    path: '/recipe/edit',
    Component: lazy(() => import('@/pages/Recipe/edit')),
    meta: {
      title: '编辑菜谱',
      active: '/recipe/list',
      permission: 'recipe_list_edit_btn',
    },
  },
  {
    path: '/recipe/add',
    Component: lazy(() => import('@/pages/Recipe/add')),
    meta: {
      title: '新增菜谱',
      active: '/recipe/list',
      permission: 'recipe_list_add_btn',
    },
  },
]

/** 路由 path → 页面元信息 */
export const routeMetaMap: Record<string, RouteMeta> = Object.fromEntries(
  appRoutes.map((route) => [route.path, route.meta]),
)

/** 页签和缓存键，search 为空时就是 pathname */
export function getTagScopedKey(pathname: string, search: string) {
  return `${pathname}${search}`
}
