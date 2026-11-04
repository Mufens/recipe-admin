import { Button, Col, Form, Input, Row, Switch, Tooltip } from 'antd'
import type { ChangeEvent } from 'react'

export interface RecipeIngredient {
  name: string
  value: string
}

type RowProps = {
  name: number
  restField: object
  remove: (index: number | number[]) => void
}

function IngredientRow({ name, restField, remove }: RowProps) {
  const form = Form.useFormInstance()
  const rawName =
    (Form.useWatch(['ingredients', name, 'name'], form) as string | undefined) ??
    ''
  const isHeader = rawName.startsWith('#')

  return (
    <Col xs={24} sm={12} lg={8}>
      <div className="add-page__dynamic-row">
        <Form.Item
          {...restField}
          name={[name, 'name']}
          getValueFromEvent={(e: ChangeEvent<HTMLInputElement>) => {
            const v = e.target.value
            return isHeader ? `#${v}` : v
          }}
          getValueProps={(v: string | undefined) => ({
            value: String(v ?? '').startsWith('#')
              ? String(v).slice(1)
              : (v ?? ''),
          })}
        >
          <Input
            placeholder={isHeader ? '小标题，如：酱料：' : '食材名称'}
            maxLength={100}
          />
        </Form.Item>
        {!isHeader ? (
          <Form.Item {...restField} name={[name, 'value']}>
            <Input placeholder="用量，如：20克" maxLength={100} />
          </Form.Item>
        ) : null}
        <Tooltip title={isHeader ? '切换为普通食材' : '切换为小标题'}>
          <Switch
            size="small"
            checked={isHeader}
            onChange={() => {
              const current = form.getFieldValue([
                'ingredients',
                name,
              ]) as RecipeIngredient
              const nextHeader = !String(current?.name ?? '').startsWith('#')
              form.setFieldValue(['ingredients', name], {
                name: nextHeader
                  ? `#${String(current?.name ?? '').replace(/^#/, '')}`
                  : String(current?.name ?? '').replace(/^#/, ''),
                value: nextHeader ? '' : (current?.value ?? ''),
              })
            }}
            style={{ marginTop: 8, flexShrink: 0 }}
          />
        </Tooltip>
        <MinusCircleOutlined
          className="add-page__remove-icon"
          onClick={() => remove(name)}
        />
      </div>
    </Col>
  )
}

/** 食材行式输入：Form.List；支持普通食材和 # 开头的小标题 */
export default function IngredientRows() {
  return (
    <div className="ingredient-rows">
      <Form.List name="ingredients">
        {(fields, { add, remove }) => (
          <>
            <div className="ingredient-rows__toolbar">
              <Button
                type="dashed"
                onClick={() => add({ name: '', value: '' })}
                icon={<PlusOutlined />}
              >
                添加食材
              </Button>
            </div>
            <Row gutter={[24, 8]}>
              {fields.map(({ key, name, ...restField }) => (
                <IngredientRow
                  key={key}
                  name={name}
                  restField={restField}
                  remove={remove}
                />
              ))}
            </Row>
          </>
        )}
      </Form.List>
    </div>
  )
}
