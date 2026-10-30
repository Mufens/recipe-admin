import { Tabs } from 'antd'
import type { TabsProps } from 'antd'
import type { AdminRole } from '../model'
import AuthList from './AuthList'
import BaseInfo from './BaseInfo'
import MemberList from './MemberList'

export type TabKey = 'profile' | 'members' | 'permissions'

export default function RoleTabs({
  role,
  tab,
  onTabChange,
}: {
  role: AdminRole
  tab: TabKey
  onTabChange: (tab: TabKey) => void
}) {
  const items: TabsProps['items'] = [
    {
      key: 'profile',
      label: '基础信息',
      children: <BaseInfo role={role} />,
    },
    {
      key: 'members',
      label: '包含成员',
      children: <MemberList roleId={role.id} active={tab === 'members'} />,
    },
    {
      key: 'permissions',
      label: '设置权限',
      children: <AuthList role={role} />,
    },
  ]

  return <Tabs activeKey={tab} onChange={(key) => onTabChange(key as TabKey)} items={items} />
}
