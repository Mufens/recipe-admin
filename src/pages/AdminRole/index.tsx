import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, Popconfirm, Space, Spin, message } from 'antd'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchRoles, removeRole } from './api'
import type { AdminRole } from './model'
import CreateRoleModal from './components/CreateRoleModal'
import RoleTabs, { type TabKey } from './components/RoleTabs'
import './index.scss'

export default function RoleList() {
  const queryClient = useQueryClient()
  const [nameInput, setNameInput] = useState('')
  const [nameKeyword, setNameKeyword] = useState('')
  const [pickedId, setPickedId] = useState<number | null>(null)
  const [tab, setTab] = useState<TabKey>('profile')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpenId, setDeleteOpenId] = useState<number | null>(null)

  const { data: roles = [], isFetching } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: ({ signal }) => fetchRoles(signal),
  })

  const visibleRoles = useMemo(() => {
    const keyword = nameKeyword.trim()
    if (!keyword) return roles
    return roles.filter((role) => role.name.includes(keyword))
  }, [roles, nameKeyword])

  const selectedId = visibleRoles.some((role) => role.id === pickedId)
    ? pickedId
    : (visibleRoles[0]?.id ?? null)
  const selected = roles.find((role) => role.id === selectedId) ?? null

  const deleteMutation = useMutation({
    mutationFn: (id: number) => removeRole(id),
    onSuccess: (_data, id) => {
      message.success('已删除')
      setDeleteOpenId(null)
      if (pickedId === id) setPickedId(null)
      void queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-role', id] })
    },
  })

  const openRole = (role: AdminRole) => {
    setPickedId(role.id)
  }

  return (
    <div className="role-page">
      <Form
        className="role-page__search"
        layout="inline"
        onFinish={() => setNameKeyword(nameInput.trim())}
      >
        <Form.Item label="角色名称">
          <Input
            allowClear
            placeholder="角色名称"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            style={{ width: 220 }}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button
              onClick={() => {
                setNameInput('')
                setNameKeyword('')
              }}
            >
              重置
            </Button>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <div className="role-page__body">
        <aside className="role-page__aside">
          <div className="role-page__aside-head">
            <span>角色列表</span>
            {permission('admin_role_edit_btn') && (
              <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                新增角色
              </Button>
            )}
          </div>
          <div className="role-page__list">
            {isFetching && roles.length === 0 ? (
              <div className="role-page__loading">
                <Spin />
              </div>
            ) : visibleRoles.length === 0 ? (
              <div className="role-page__placeholder">
                {roles.length === 0 ? '还没有角色' : '没有匹配的角色'}
              </div>
            ) : (
              visibleRoles.map((role) => (
                <div
                  key={role.id}
                  className={
                    role.id === selectedId ? 'role-page__item is-active' : 'role-page__item'
                  }
                >
                  <button
                    type="button"
                    title={role.name}
                    className="role-page__name"
                    onClick={() => openRole(role)}
                  >
                    {role.name}
                  </button>
                  {role.builtin !== 1 && (
                    <Popconfirm
                      title="删除这个角色？"
                      okText="删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                      open={deleteOpenId === role.id}
                      onOpenChange={(open) => setDeleteOpenId(open ? role.id : null)}
                      onConfirm={() => deleteMutation.mutate(role.id)}
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        aria-label="删除"
                        icon={<DeleteOutlined />}
                        className={
                          deleteOpenId === role.id
                            ? 'role-page__delete is-open'
                            : 'role-page__delete'
                        }
                        loading={deleteMutation.isPending && deleteMutation.variables === role.id}
                      />
                    </Popconfirm>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="role-page__main">
          {!selected ? (
            <div className="role-page__placeholder">
              {roles.length === 0 ? '还没有角色' : '没有匹配的角色'}
            </div>
          ) : (
            <RoleTabs role={selected} tab={tab} onTabChange={setTab} />
          )}
        </section>
      </div>

      <CreateRoleModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onCreated={(role) => {
          setNameInput('')
          setNameKeyword('')
          setPickedId(role.id)
          setTab('profile')
        }}
      />
    </div>
  )
}
