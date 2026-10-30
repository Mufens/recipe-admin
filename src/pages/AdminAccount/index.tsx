import { Avatar, Button, Cascader, Form, Input, Pagination, Select, Space, Tag } from 'antd'
import type { DefaultOptionType } from 'antd/es/cascader'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import QueryFilter from '@/components/QueryFilter'
import SmartTable from '@/components/SmartTable'
import { type SmartColumn } from '@/components/TableToolbar'
import { fetchAccounts, fetchDepartments, fetchRoleOptions } from './api'
import SetRoleModal from './components/SetRoleModal'
import type { AccountQuery, DepartmentNode, InternalAccount } from './model'
import './index.scss'

const EMPTY_QUERY: AccountQuery = {
  name: '',
  jobNumber: '',
  jobTitle: '',
  department: '',
}

const DEFAULT_AVATAR = 'https://images.ishidao.xin/cat/avatar.jpg'

type AccountForm = Omit<AccountQuery, 'department'> & {
  department?: string[]
}

function departmentOptions(nodes: DepartmentNode[]): DefaultOptionType[] {
  return nodes.map((node) => ({
    value: node.name,
    label: node.name,
    children: node.children?.length ? departmentOptions(node.children) : undefined,
  }))
}

export default function AccountPage() {
  const [form] = Form.useForm<AccountForm>()
  const [query, setQuery] = useState<AccountQuery>(EMPTY_QUERY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [account, setAccount] = useState<InternalAccount | null>(null)

  const { data: listData, isFetching, refetch } = useQuery({
    queryKey: ['internal-accounts', query, page, pageSize],
    queryFn: ({ signal }) => fetchAccounts(query, page, pageSize, signal),
  })
  const data = listData?.items ?? []
  const total = listData?.total ?? 0
  const { data: roleOptions = [] } = useQuery({
    queryKey: ['internal-account-roles'],
    queryFn: ({ signal }) => fetchRoleOptions(signal),
  })
  const { data: departments = [] } = useQuery({
    queryKey: ['internal-account-departments'],
    queryFn: ({ signal }) => fetchDepartments(signal),
  })

  const columns: SmartColumn<InternalAccount>[] = [
    {
      title: '工号',
      key: 'jobNumber',
      dataIndex: 'jobNumber',
      width: 120,
      render: (value: string) => value || '-',
    },
    {
      title: '姓名',
      key: 'name',
      dataIndex: 'name',
      width: 220,
      render: (name: string, row) => (
        <span className="account-page__name">
          <Avatar size={28} src={row.avatar || DEFAULT_AVATAR} />
          <span>{name || '-'}</span>
        </span>
      ),
    },
    
    {
      title: '部门',
      key: 'department',
      dataIndex: 'department',
      width: 280,
      render: (value: string) => value || '-',
    },
    {
      title: '职位',
      key: 'jobTitle',
      dataIndex: 'jobTitle',
      width: 140,
      render: (value: string) => value || '-',
    },
    {
      title: '账号状态',
      key: 'staffStatus',
      dataIndex: 'staffStatus',
      width: 100,
      render: (value: string) => value || '-',
    },
    {
      title: '性别',
      key: 'gender',
      dataIndex: 'gender',
      width: 80,
      render: (value: string) => value || '-',
    },
    {
      title: '角色',
      key: 'roles',
      dataIndex: 'roles',
      render: (roles: InternalAccount['roles']) =>
        roles.length ? (
          <Space size={4} wrap>
            {roles.map((role) => (
              <Tag key={role.id}>{role.name}</Tag>
            ))}
          </Space>
        ) : (
          '-'
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
        <div className="account-page__record">
          <div>更新人：{row.updatedBy || '-'}</div>
          <div>更新时间：{row.updateTime || '-'}</div>
        </div>
      ),
    },
  ]

  columns.push({
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
    render: (_: unknown, row) =>
      permission('admin_account_role_btn') ? (
        <Button type="link" size="small" onClick={() => setAccount(row)}>
          设置角色
        </Button>
      ) : null,
  })

  return (
    <div className="account-page">
      <QueryFilter
        form={form}
        row={2}
        initialValues={{ name: '', jobNumber: '', jobTitle: '' }}
        onFinish={(values) => {
          setQuery({
            name: (values.name ?? '').trim(),
            roleId: values.roleId,
            jobNumber: (values.jobNumber ?? '').trim(),
            jobTitle: (values.jobTitle ?? '').trim(),
            department: (values.department ?? []).join(' > '),
          })
          setPage(1)
        }}
        onReset={() => {
          form.resetFields()
          setQuery(EMPTY_QUERY)
          setPage(1)
          setPageSize(25)
        }}
      >
        <Form.Item label="姓名" name="name">
          <Input allowClear placeholder="姓名" />
        </Form.Item>
        <Form.Item label="角色" name="roleId">
          <Select
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            placeholder="角色"
            options={roleOptions.map((role) => ({
              value: role.id,
              label: role.status === 1 ? role.name : `${role.name}（禁用）`,
            }))}
          />
        </Form.Item>
        <Form.Item label="工号" name="jobNumber">
          <Input allowClear placeholder="工号" />
        </Form.Item>
        <Form.Item label="职位" name="jobTitle">
          <Input allowClear placeholder="职位" />
        </Form.Item>
        <Form.Item label="部门" name="department">
          <Cascader
            allowClear
            changeOnSelect
            showSearch
            placeholder="请选择"
            options={departmentOptions(departments)}
          />
        </Form.Item>
      </QueryFilter>

      <div className="account-page__panel">
        <SmartTable<InternalAccount>
          tableToolbar={{
            loading: isFetching,
            onReload: () => void refetch(),
            setting: false,
            fullScreen: false,
          }}
          paginationNode={
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              pageSizeOptions={['25', '50', '100', '250']}
              showSizeChanger
              showTotal={(count) => `共 ${count} 条`}
              onChange={(nextPage, nextSize) => {
                setPage(nextPage)
                setPageSize(nextSize)
              }}
            />
          }
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={isFetching}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </div>

      <SetRoleModal account={account} onClose={() => setAccount(null)} />
    </div>
  )
}
