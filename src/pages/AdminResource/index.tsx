import { DownOutlined, RightOutlined } from '@ant-design/icons'
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Space,
  message,
} from 'antd'
import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import SmartTable from '@/components/SmartTable'
import { type SmartColumn } from '@/components/TableToolbar'
import { createResource, deleteResource, fetchResources, updateResource } from './api'
import type { ResourceNode, ResourceType } from './model'
import './index.scss'

const EMPTY_ROWS: ResourceNode[] = []

const TYPE_LABEL: Record<ResourceType, string> = {
  app: '应用',
  menu: '菜单',
  button: '按钮',
}

type Dialog =
  | { mode: 'child'; parent: ResourceNode }
  | { mode: 'edit'; node: ResourceNode }

function parentIds(nodes: ResourceNode[]) {
  const ids: number[] = []
  const walk = (list: ResourceNode[]) => {
    for (const node of list) {
      if (!node.children?.length) continue
      ids.push(node.id)
      walk(node.children)
    }
  }
  walk(nodes)
  return ids
}

function dialogInitial(dialog: Dialog) {
  if (dialog.mode === 'child') {
    return { type: 'menu' as const, name: '', code: dialog.parent.code }
  }
  return {
    name: dialog.node.name,
    code: dialog.node.code,
  }
}

export default function ResourcePage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['admin-resources'],
    queryFn: ({ signal }) => fetchResources(signal),
  })
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[] | null>(null)
  const [expandedSource, setExpandedSource] = useState(data)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [form] = Form.useForm<{ type?: 'menu' | 'button'; name: string; code: string }>()

  if (data !== expandedSource) {
    setExpandedSource(data)
    setExpandedRowKeys(null)
  }
  const rows = data ?? EMPTY_ROWS
  const openRowKeys = expandedRowKeys ?? parentIds(rows)

  const openDialog = (next: Dialog) => {
    form.setFieldsValue(dialogInitial(next))
    setDialog(next)
  }

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
    void queryClient.invalidateQueries({ queryKey: ['admin-permissions'] })
    void queryClient.invalidateQueries({ queryKey: ['admin-profile'] })
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!dialog) return
      const values = await form.validateFields()
      const name = values.name.trim()
      const code = values.code.trim()
      if (dialog.mode === 'edit') {
        await updateResource(dialog.node.id, { name, code })
        return
      }
      await createResource({
        name,
        code,
        type: values.type || 'menu',
        parentId: dialog.parent.id,
      })
    },
    onSuccess: () => {
      message.success('保存成功')
      setDialog(null)
      refresh()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteResource(id),
    onSuccess: () => {
      message.success('已删除')
      refresh()
    },
  })

  const columns: SmartColumn<ResourceNode>[] = [
    {
      title: '资源名称',
      key: 'name',
      dataIndex: 'name',
      width: 240,
    },
    {
      title: '资源编码',
      key: 'code',
      dataIndex: 'code',
      width: 260,
    },
    {
      title: '类型',
      key: 'type',
      dataIndex: 'type',
      width: 100,
      render: (type: ResourceType) => TYPE_LABEL[type],
    },
    {
      title: '所属应用',
      key: 'appName',
      dataIndex: 'appName',
      width: 160,
    },
  ]

  columns.push({
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: unknown, row) => (
        <Space size={0}>
          {permission('admin_resource_add_btn') && row.type !== 'button' && (
            <Button
              type="link"
              size="small"
              onClick={() => openDialog({ mode: 'child', parent: row })}
            >
              新增
            </Button>
          )}
          {permission('admin_resource_edit_btn') && (
            <Button type="link" size="small" onClick={() => openDialog({ mode: 'edit', node: row })}>
              编辑
            </Button>
          )}
          {permission('admin_resource_delete_btn') && (
            <Popconfirm
              title={row.children?.length ? '删除后下级资源一并删除' : '删除这个资源？'}
              okText="删除"
              cancelText="取消"
              onConfirm={() => deleteMutation.mutate(row.id)}
            >
              <Button type="link" size="small">
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    })

  const dialogKey =
    dialog?.mode === 'edit'
      ? `edit-${dialog.node.id}`
      : dialog?.mode === 'child'
        ? `child-${dialog.parent.id}`
        : 'closed'

  return (
    <div ref={pageRef} className="resource-page">
      <div className="resource-page__panel">
        <SmartTable<ResourceNode>
          tableToolbar={{
            loading: isFetching,
            onReload: () => void refetch(),
            setting: false,
            fullscreenTargetRef: pageRef,
          }}
          rowKey="id"
          columns={columns}
          dataSource={rows}
          loading={isFetching}
          pagination={false}
          expandable={{
            expandedRowKeys: openRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys.map(Number)),
            expandIcon: ({ expanded, onExpand, record, expandable }) =>
              expandable ? (
                <button
                  type="button"
                  className="resource-page__expand"
                  aria-label={expanded ? '收起' : '展开'}
                  aria-expanded={expanded}
                  onClick={(event) => {
                    onExpand(record, event)
                    event.stopPropagation()
                  }}
                >
                  {expanded ? <DownOutlined /> : <RightOutlined />}
                </button>
              ) : (
                <span className="resource-page__expand resource-page__expand--spaced" />
              ),
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>

      <Modal
        title={dialog?.mode === 'edit' ? '编辑资源' : '新增资源'}
        open={dialog != null}
        onCancel={() => setDialog(null)}
        onOk={() => saveMutation.mutate()}
        confirmLoading={saveMutation.isPending}
        okText="确定"
        cancelText="取消"
        destroyOnHidden
        width={480}
      >
        {dialog && (
          <Form
            key={dialogKey}
            form={form}
            className="resource-form"
            colon
            labelCol={{ flex: '6em' }}
            wrapperCol={{ flex: 1 }}
            initialValues={dialogInitial(dialog)}
          >
            <Form.Item label="所属应用">
              <Input
                disabled
                value={dialog.mode === 'child' ? dialog.parent.appName : dialog.node.appName}
              />
            </Form.Item>
            {dialog.mode === 'child' && (
              <Form.Item
                label="类型"
                name="type"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Radio.Group>
                  <Radio value="menu">菜单</Radio>
                  <Radio value="button">按钮</Radio>
                </Radio.Group>
              </Form.Item>
            )}
            {dialog.mode === 'edit' && (
              <Form.Item label="类型">
                <span>{TYPE_LABEL[dialog.node.type]}</span>
              </Form.Item>
            )}
            <Form.Item
              label="资源名称"
              name="name"
              rules={[{ required: true, message: '请输入资源名称' }]}
            >
              <Input maxLength={50} placeholder="请输入" />
            </Form.Item>
            <Form.Item
              label="资源编码"
              name="code"
              rules={[{ required: true, message: '请输入资源编码' }]}
            >
              <Input maxLength={64} placeholder="请输入" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}
