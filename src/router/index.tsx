import { Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import { KeepAlive } from 'react-activation'
import { Navigate, useLocation, useRoutes } from 'react-router-dom'
import { Spin } from 'antd'
import BasicLayout from '@/layouts/BasicLayout'
import { useAdminProfile } from '@/hooks/usePermission'
import LoginPage from '@/pages/Login'
import LoginCallback from '@/pages/Login/callback'
import ForbiddenPage from '@/pages/Forbidden'
import NotFoundPage from '@/pages/NotFound'
import { appRoutes, getTagScopedKey } from '@/router/routes'

function PageLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 160,
      }}
    >
      <Spin size="large" />
    </div>
  )
}

function GuardedPage({
  code,
  Page,
}: {
  code?: string
  Page: LazyExoticComponent<ComponentType>
}) {
  const { pathname, search } = useLocation()
  const cacheKey = getTagScopedKey(pathname, search)
  const { data, isPending } = useAdminProfile()

  if (code) {
    if (!data) return isPending ? <PageLoading /> : <ForbiddenPage />
    if (!data.permissions.includes(code)) return <ForbiddenPage />
  }

  return (
    <KeepAlive
      name={cacheKey}
      cacheKey={cacheKey}
      saveScrollPosition="screen"
    >
      <Suspense fallback={<PageLoading />}>
        <Page />
      </Suspense>
    </KeepAlive>
  )
}

export default function AppRouter() {
  return useRoutes([
    { path: '/login', element: <LoginPage /> },
    { path: '/login/callback', element: <LoginCallback /> },
    {
      path: '/',
      element: <BasicLayout />,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace state={{ entry: true }} />,
        },
        ...appRoutes.map(({ path, Component, meta }) => ({
          path,
          element: <GuardedPage code={meta.permission} Page={Component} />,
        })),
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ])
}
