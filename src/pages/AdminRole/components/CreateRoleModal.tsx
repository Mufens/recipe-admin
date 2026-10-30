import { Form, Input, Modal, Radio, message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRole } from '../api'
import type { AdminRole } from '../model'

type CreateForm = {
  name: string
  remark: string
  status: number
}

export default function CreateRoleModal({
  open,
  onCancel,
  onCreated,
}: {
  open: boolean
  onCancel: () => void
  onCreated: (role: AdminRole) => void
}) {
  const queryClient = useQueryClient()
  const [form] = Form.useForm<CreateForm>()
  const createMutation = useMutation({
    mutationFn: async () => {
      const values = await form.validateFields().catch(() => null)
      if (!values) return null
      return createRole({
        name: values.name.trim(),
        remark: values.remark.trim(),
        status: values.status,
      })
    },
    onSuccess: (saved) => {
      if (!saved) return
      message.success('保存成功')
      form.resetFields()
      onCancel()
      onCreated(saved)
      void queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-role', saved.id] })
    },
  })

  return (
    <Modal
      title="新增角色"
      open={open}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      onOk={() => createMutation.mutate()}
      confirmLoading={createMutation.isPending}
      okText="确定"
      cancelText="取消"
      destroyOnHidden
      width={520}
    >
      <Form
        form={form}
        colon
        labelCol={{ flex: '88px' }}
        wrapperCol={{ flex: 1 }}
        initialValues={{ name: '', status: 1, remark: '' }}
        style={{ marginTop: 8 }}
      >
        <Form.Item
          label="角色名称"
          name="name"
          rules={[{ required: true, message: '请输入角色名称' }]}
        >
          <Input maxLength={50} placeholder="请输入" />
        </Form.Item>
        <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
          <Radio.Group>
            <Radio value={1}>启用</Radio>
            <Radio value={0}>禁用</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="描述" name="remark">
          <Input.TextArea maxLength={200} rows={4} placeholder="请输入" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
