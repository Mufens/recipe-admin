import { Avatar, Button, Dropdown, Layout, Menu } from 'antd'
import { useMemo, useState, type ReactNode } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import DarkModeToggle from '@/theme/DarkModeToggle'
import ThemeSwitcher from '@/theme/ThemeSwitcher'
import TagsView from '@/layouts/TagsView'
import { useAdminProfile } from '@/hooks/usePermission'
import { routeMetaMap } from '@/router/routes'
import { clearToken } from '@/utils/auth'
import logo from '@/assets/logo.svg'
import './index.scss'

const DEFAULT_AVATAR = 'https://images.ishidao.xin/cat/avatar.jpg'

const { Header, Sider, Content } = Layout

type SideItem = {
  key: string
  icon: ReactNode
  label: string
  children?: { key: string; label: string }[]
}

const menuItems: SideItem[] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '数据看板' },
  { key: '/recipe/list', icon: <UnorderedListOutlined />, label: '菜谱列表' },
  { key: '/categories', icon: <AppstoreOutlined />, label: '分类管理' },
  { key: '/banners', icon: <PictureOutlined />, label: '首页轮播' },
  { key: '/users', icon: <TeamOutlined />, label: '用户管理' },
  { key: '/ai/feedback', icon: <DislikeOutlined />, label: '低满意问题榜' },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      { key: '/admin/accounts', label: '内部账号' },
      { key: '/admin/roles', label: '角色管理' },
      { key: '/admin/resources', label: '资源管理' },
    ],
  },
]

export default function BasicLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { data } = useAdminProfile()

  const selectedKey = routeMetaMap[pathname]?.active ?? pathname

  const items = useMemo(() => {
    if (!data) return []
    const allow = (path: string) => {
      const code = routeMetaMap[path]?.permission
      return !code || data.permissions.includes(code)
    }
    return menuItems.flatMap((item) => {
      if (!item.children) return allow(item.key) ? [item] : []
      const children = item.children.filter((c) => allow(c.key))
      return children.length ? [{ ...item, children }] : []
    })
  }, [data])

  return (
    <Layout className="basic-layout">
      <Sider
        theme="light"
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="basic-layout__sider"
      >
        <div className="basic-layout__logo">
          <img src={logo} alt="logo" className="basic-layout__logo-img" />
          {!collapsed && (
            <span className="basic-layout__logo-text">菜谱管理</span>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['system']}
          items={items}
          onClick={({ key }) => {
            if (routeMetaMap[key]) navigate(key)
          }}
        />
      </Sider>
      <Layout>
        <Header className="basic-layout__header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((v) => !v)}
            className="basic-layout__trigger"
          />
          <div className="basic-layout__header-actions">
            <DarkModeToggle />
            <ThemeSwitcher />
            <Dropdown
              rootClassName="basic-layout-user-dropdown"
              menu={{
                items: [
                  {
                    key: 'github',
                    icon: <GithubOutlined className="basic-layout__menu-icon" />,
                    label: 'github仓库',
                  },
                  {
                    key: 'logout',
                    icon: (
                      <PoweroffOutlined className="basic-layout__menu-icon basic-layout__menu-icon--logout" />
                    ),
                    label: '退出登录',
                  },
                ],
                onClick: ({ key }) => {
                  if (key !== 'logout') return
                  clearToken()
                  window.location.assign('/login')
                },
              }}
            >
              <span className="basic-layout__user" role="button" tabIndex={0}>
                <Avatar size={36} src={data?.avatar || DEFAULT_AVATAR} />
                <span className="basic-layout__user-name">
                  {data?.name || ''}
                </span>
                <DownOutlined className="basic-layout__user-caret" />
              </span>
            </Dropdown>
          </div>
        </Header>
        <TagsView />
        <Content className="basic-layout__content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
