import { Button, Form, Input, Radio, message } from 'antd'
import { useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateRole } from '../api'
import type { AdminRole } from '../model'

type ProfileForm = {
  name: string
  code?: string
  remark: string
  status: number
}

export default function BaseInfo({ role }: { role: AdminRole }) {
  const queryClient = useQueryClient()
  const [form] = Form.useForm<ProfileForm>()
  const filledKey = useRef('')

  useEffect(() => {
    const key = String(role.id)
    if (filledKey.current === key) return
    form.setFieldsValue({
      name: role.name,
      code: role.code,
      remark: role.remark,
      status: role.status,
    })
    filledKey.current = key
  }, [role, form])

  const saveProfile = useMutation({
    mutationFn: async () => {
      const values = await form.validateFields().catch(() => null)
      if (!values) return null
      return updateRole(role.id, {
        name: values.name.trim(),
        remark: values.remark.trim(),
        status: values.status,
      })
    },
    onSuccess: (saved) => {
      if (!saved) return
      message.success('保存成功')
      form.setFieldsValue({
        name: saved.name,
        code: saved.code,
        remark: saved.remark,
        status: saved.status,
      })
      void queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-role', saved.id] })
    },
  })

  return (
    <Form
      form={form}
      className="role-profile"
      layout="horizontal"
      labelAlign="right"
      colon
      labelCol={{ flex: '88px' }}
      wrapperCol={{ flex: 1 }}
      initialValues={{ name: '', code: '', remark: '', status: 1 }}
    >
      <Form.Item
        label="角色名称"
        name="name"
        rules={[{ required: true, message: '请输入角色名称' }]}
      >
        <Input maxLength={50} placeholder="请输入角色名称" />
      </Form.Item>
      <Form.Item label="角色编码" name="code">
        <Input disabled />
      </Form.Item>
      <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
        <Radio.Group>
          <Radio value={1}>启用</Radio>
          <Radio value={0}>禁用</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="备注" name="remark">
        <Input.TextArea maxLength={200} rows={3} placeholder="选填" />
      </Form.Item>
      <Form.Item label=" " colon={false}>
        <Button type="primary" loading={saveProfile.isPending} onClick={() => saveProfile.mutate()}>
          保存
        </Button>
      </Form.Item>
    </Form>
  )
}
