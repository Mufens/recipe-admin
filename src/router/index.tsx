import { Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import BasicLayout from '@/layouts/BasicLayout'
import { useAdminProfile } from '@/hooks/usePermission'
import LoginPage from '@/pages/Login'
import LoginCallback from '@/pages/Login/callback'
import ForbiddenPage from '@/pages/Forbidden'
import NotFoundPage from '@/pages/NotFound'
import { appRoutes } from '@/router/routes'
import { Navigate, useRoutes } from 'react-router-dom'

function GuardedPage({
  code,
  Page,
}: {
  code?: string
  Page: LazyExoticComponent<ComponentType>
}) {
  const { data, isPending } = useAdminProfile()
  if (code) {
    if (!data) return isPending ? null : <ForbiddenPage />
    if (!data.permissions.includes(code)) return <ForbiddenPage />
  }
  return (
    <Suspense fallback={null}>
      <Page />
    </Suspense>
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
