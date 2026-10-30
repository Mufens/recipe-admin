import { Avatar, Button, Checkbox, Modal, Popconfirm, Space, Spin, Tree, message } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { useState, type Key } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import SmartTable from '@/components/SmartTable'
import type { SmartColumn } from '@/components/TableToolbar'
import {
  addRoleMembers,
  fetchFeishuDepartments,
  fetchFeishuEmployees,
  fetchRoleMembers,
  removeRoleMember,
} from '../api'
import type { AdminAccount, FeishuDepartment } from '../model'

const DEFAULT_AVATAR = 'https://images.ishidao.xin/cat/avatar.jpg'

function deptNodes(parentId: string, childrenOf: Record<string, FeishuDepartment[]>): DataNode[] {
  return (childrenOf[parentId] || []).map((dept) => ({
    key: dept.id,
    title: dept.name || '未命名',
    isLeaf: !dept.hasChild,
    children: dept.hasChild && childrenOf[dept.id] ? deptNodes(dept.id, childrenOf) : undefined,
  }))
}

export default function MemberList({ roleId, active }: { roleId: number; active: boolean }) {
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [activeDept, setActiveDept] = useState('0')
  const [deptChildren, setDeptChildren] = useState<Record<string, FeishuDepartment[]>>({})
  const [pickedOpenIds, setPickedOpenIds] = useState<string[]>([])
  const [memberPick, setMemberPick] = useState<{ roleId: number; ids: number[] } | null>(null)

  const { data: members = [], isFetching: membersLoading } = useQuery({
    queryKey: ['admin-role-members', roleId],
    queryFn: ({ signal }) => fetchRoleMembers(roleId, signal),
    enabled: permission('admin_role_assign_btn') && active,
  })
  const { data: rootDepartments } = useQuery({
    queryKey: ['feishu-departments', '0'],
    queryFn: ({ signal }) => fetchFeishuDepartments('0', signal),
    enabled: addOpen,
  })
  const { data: feishuEmployees = [], isFetching: employeesLoading } = useQuery({
    queryKey: ['feishu-employees', activeDept],
    queryFn: ({ signal }) => fetchFeishuEmployees(activeDept, signal),
    enabled: addOpen,
  })

  const childrenOf = rootDepartments
    ? { '0': rootDepartments, ...deptChildren }
    : deptChildren

  const refreshMembers = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-role-members', roleId] })
  }

  const addMutation = useMutation({
    mutationFn: (openIds: string[]) => addRoleMembers(roleId, openIds),
    onSuccess: () => {
      message.success('已添加')
      setAddOpen(false)
      setPickedOpenIds([])
      refreshMembers()
    },
  })

  const deleteMembers = useMutation({
    mutationFn: async (ids: number[]) => {
      for (const id of ids) {
        await removeRoleMember(roleId, id)
      }
    },
    onSuccess: () => {
      message.success('已删除')
      setMemberPick(null)
      refreshMembers()
    },
    onError: () => {
      setMemberPick(null)
      refreshMembers()
    },
  })

  const pickedMemberIds = memberPick?.roleId === roleId ? memberPick.ids : []
  const deptTree: DataNode[] = [
    {
      key: '0',
      title: '组织',
      children: childrenOf['0'] ? deptNodes('0', childrenOf) : undefined,
    },
  ]
  const loadDepts = async (node: { key: Key }) => {
    const id = String(node.key)
    if (childrenOf[id]) return
    const list = await fetchFeishuDepartments(id)
    setDeptChildren((prev) => (prev[id] ? prev : { ...prev, [id]: list }))
  }

  const columns: SmartColumn<AdminAccount>[] = [
    {
      title: '姓名',
      key: 'name',
      dataIndex: 'name',
      width: 220,
      render: (name: string, row) => (
        <span className="role-members__name">
          <Avatar size={28} src={row.avatar || DEFAULT_AVATAR} />
          <span>{name || '-'}</span>
        </span>
      ),
    },
    {
      title: '创建时间',
      key: 'createTime',
      dataIndex: 'createTime',
      width: 180,
      render: (value: string) => value || '-',
    },
    {
      title: '操作记录',
      key: 'record',
      width: 240,
      render: (_: unknown, row) => (
        <div className="role-members__record">
          <div>更新人：{row.updatedBy || '-'}</div>
          <div>更新时间：{row.updateTime || '-'}</div>
        </div>
      ),
    },
  ]

  return (
    <div className="role-members">
      <SmartTable<AdminAccount>
        toolbar={
          <Space>
            <Button
              type="primary"
              onClick={() => {
                setActiveDept('0')
                setPickedOpenIds([])
                setAddOpen(true)
              }}
            >
              添加成员
            </Button>
            <Popconfirm
              title="删除选中的成员？"
              okText="删除"
              cancelText="取消"
              disabled={pickedMemberIds.length === 0}
              onConfirm={() => deleteMembers.mutate(pickedMemberIds)}
            >
              <Button
                type="primary"
                disabled={pickedMemberIds.length === 0}
                loading={deleteMembers.isPending}
              >
                删除成员
              </Button>
            </Popconfirm>
          </Space>
        }
        tableToolbar={{
          loading: membersLoading,
          onReload: refreshMembers,
          setting: false,
          fullScreen: false,
        }}
        rowKey="id"
        rowSelection={{
          selectedRowKeys: pickedMemberIds,
          onChange: (keys) => setMemberPick({ roleId, ids: keys.map(Number) }),
        }}
        columns={columns}
        dataSource={members}
        loading={membersLoading}
        pagination={false}
        locale={{ emptyText: '还没有成员' }}
        scroll={{ x: 'max-content' }}
      />
      <Modal
        title="选择成员"
        open={addOpen}
        onCancel={() => {
          setAddOpen(false)
          setPickedOpenIds([])
        }}
        onOk={() => addMutation.mutate(pickedOpenIds)}
        confirmLoading={addMutation.isPending}
        okButtonProps={{ disabled: pickedOpenIds.length === 0 }}
        okText="确定"
        cancelText="取消"
        destroyOnHidden
        width={720}
      >
        <div className="role-members__picker">
          <div className="role-members__depts">
            <Tree
              blockNode
              selectedKeys={[activeDept]}
              defaultExpandedKeys={['0']}
              loadData={loadDepts}
              treeData={deptTree}
              onSelect={(keys) => {
                if (keys[0] != null) setActiveDept(String(keys[0]))
              }}
            />
          </div>
          <div className="role-members__people">
            {employeesLoading && feishuEmployees.length === 0 ? (
              <Spin />
            ) : feishuEmployees.length === 0 ? (
              <span className="role-members__empty">暂无成员</span>
            ) : (
              feishuEmployees.map((person) => (
                <Checkbox
                  key={person.openId}
                  className="role-members__person"
                  checked={pickedOpenIds.includes(person.openId)}
                  onChange={(e) => {
                    setPickedOpenIds((ids) =>
                      e.target.checked
                        ? [...ids, person.openId]
                        : ids.filter((id) => id !== person.openId),
                    )
                  }}
                >
                  <span className="role-members__name">
                    <Avatar size={24} src={person.avatar || DEFAULT_AVATAR} />
                    <span>{person.name || '未命名'}</span>
                  </span>
                </Checkbox>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
