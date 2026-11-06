import { Form, Input, Modal } from 'antd'
import { useLayoutEffect, useState } from 'react'
import type { CategoryFormValues, ModalMode } from '../model'
import TagIconUpload from './TagIconUpload'

const FORM_ID = 'category-manage-form'

type Props = {
  modal: ModalMode
  confirmLoading: boolean
  onCancel: () => void
  onSubmit: (values: CategoryFormValues) => void
}

function formInitialValues(modal: NonNullable<ModalMode>): CategoryFormValues | undefined {
  if (modal.type !== 'rename') return undefined
  if (modal.kind !== 'tag') return { name: modal.row.name }
  return {
    name: modal.row.name,
    type: modal.row.type || '',
    icon: modal.row.icon || '',
  }
}

function CategoryFormFields({
  modal,
  onSubmit,
  onUploadingChange,
}: {
  modal: NonNullable<ModalMode>
  onSubmit: (values: CategoryFormValues) => void
  onUploadingChange: (uploading: boolean) => void
}) {
  const [form] = Form.useForm<CategoryFormValues>()
  const isRename = modal.type === 'rename'
  const isTag = modal.type === 'createTag' || (isRename && modal.kind === 'tag')
  const initialValues = formInitialValues(modal)

  // Modal 关闭时会冻住子节点，Form 实例还在，initialValues 只在第一次挂载写入
  useLayoutEffect(() => {
    form.resetFields()
  }, [form, modal])

  return (
    <Form
      id={FORM_ID}
      form={form}
      layout="vertical"
      style={{ marginTop: 12 }}
      initialValues={initialValues}
      clearOnDestroy
      onFinish={onSubmit}
    >
      {isRename && (
        <Form.Item label="编码">
          <Input value={String(modal.row.id)} disabled />
        </Form.Item>
      )}
      {modal.type === 'createSub' && (
        <Form.Item
          label="编码（可选）"
          name="id"
          extra="不填会自动生成，如 b → bd"
        >
          <Input placeholder="例如 bd" maxLength={10} />
        </Form.Item>
      )}
      <Form.Item
        label="名称"
        name="name"
        rules={[{ required: true, message: '写个名字吧' }]}
      >
        <Input placeholder="好认一点的名字" maxLength={50} />
      </Form.Item>
      {isTag && (
        <>
          <Form.Item label="类型标记" name="type">
            <Input placeholder="可选，如 popular / dessert" maxLength={50} />
          </Form.Item>
          <Form.Item label="分类封面" name="icon">
            <TagIconUpload onUploadingChange={onUploadingChange} />
          </Form.Item>
        </>
      )}
    </Form>
  )
}

export default function CategoryFormModal({
  modal,
  confirmLoading,
  onCancel,
  onSubmit,
}: Props) {
  const [iconUploading, setIconUploading] = useState(false)
  const title =
    modal?.type === 'createSub'
      ? `在「${modal.parentName}」下加分组`
      : modal?.type === 'createTag'
        ? `往「${modal.parentName}」挂标签`
        : '修改'

  return (
    <Modal
      title={modal ? title : ''}
      open={!!modal}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okButtonProps={{
        disabled: iconUploading,
        htmlType: 'submit',
        form: FORM_ID,
      }}
      destroyOnHidden
      okText="保存"
    >
      {modal ? (
        <CategoryFormFields
          modal={modal}
          onSubmit={onSubmit}
          onUploadingChange={setIconUploading}
        />
      ) : null}
    </Modal>
  )
}
