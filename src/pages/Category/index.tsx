import { Button, Form, Input, Pagination, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import SmartTable from '@/components/SmartTable'
import { buildCategoryColumns } from './columns'
import CategoryFormModal from './components/CategoryFormModal'
import CategoryNavTree from './components/CategoryNavTree'
import { useCategoryManage } from './hooks/useCategoryManage'
import './index.scss'

export default function CategoryPage() {
  const navigate = useNavigate()
  const m = useCategoryManage()
  const [filterForm] = Form.useForm<{ keyword?: string }>()

  const columns = buildCategoryColumns({
    listKind: m.listKind,
    navigate,
    selectNode: m.selectNode,
    openRename: m.openRename,
    onDeleteTag: m.deleteTag,
  })

  return (
    <div className="category-page">
      <CategoryNavTree
        nav={m.nav}
        loading={m.navLoading}
        error={m.navError}
        selected={m.selected}
        expandedKeys={m.expandedKeys}
        onRetry={() => void m.refetchNav()}
        onSelect={m.selectNode}
        onExpand={m.setExpandedKeys}
      />

      <section className="category-page__main">
        <div className="category-page__main-head">
          <div className="category-page__crumb">
            <Space size={4} separator={<span>/</span>}>
              {m.breadcrumb.map((b, idx) => {
                const active = idx === m.breadcrumb.length - 1
                return (
                  <Button
                    key={`${b.kind}-${b.id || 'root'}-${idx}`}
                    type="link"
                    className={active ? 'is-active' : undefined}
                    onClick={() => {
                      if (active) return
                      m.selectNode({
                        kind: b.kind,
                        id: b.kind ? b.id : '',
                      })
                    }}
                  >
                    {b.name}
                  </Button>
                )
              })}
            </Space>
          </div>

          <Form
            key={`${m.selected.kind}-${m.selected.id}`}
            form={filterForm}
            className="category-page__search"
            layout="inline"
            onFinish={(values) => m.handleSearch(values.keyword ?? '')}
            onReset={() => {
              filterForm.resetFields()
              m.handleReset()
            }}
          >
            <Form.Item label="名称 / 编码" name="keyword">
              <Input allowClear placeholder="模糊搜索" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button htmlType="reset">重置</Button>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>

        <div className="category-page__table-panel">
          <SmartTable
            toolbar={
              <>
                {permission('category_add_btn') && m.canAddSub && (
                  <Button type="primary" onClick={m.openCreateSub}>
                    新建分组
                  </Button>
                )}
                {permission('category_add_btn') && m.canAddTag && (
                  <Button type="primary" onClick={m.openCreateTag}>
                    新增标签
                  </Button>
                )}
              </>
            }
            tableToolbar={false}
            paginationNode={
              <Pagination
                current={m.page}
                pageSize={m.pageSize}
                total={m.total}
                showSizeChanger
                pageSizeOptions={['25', '50', '100']}
                showTotal={(t) => `共 ${t} 条`}
                onChange={(p, ps) => {
                  m.setPage(p)
                  m.setPageSize(ps)
                }}
              />
            }
            rowKey={(r) => `${r.kind}-${r.id}`}
            columns={columns}
            dataSource={m.items}
            loading={m.listLoading}
            pagination={false}
            bordered={false}
            size="middle"
            scroll={{ x: 900 }}
          />
        </div>
      </section>

      <CategoryFormModal
        modal={m.modal}
        form={m.form}
        confirmLoading={m.savePending}
        onCancel={() => m.setModal(null)}
        onOk={() => void m.handleModalOk()}
      />
    </div>
  )
}
