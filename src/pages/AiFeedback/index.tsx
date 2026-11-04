import { Form, Input, Pagination, Select, Space, Button } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import SmartTable from '@/components/SmartTable'
import { type SmartColumn } from '@/components/TableToolbar'
import { fetchLowSatisfaction } from './api'
import {
  FEEDBACK_REASONS,
  type FeedbackReasonCode,
  type LowSatisfactionItem,
} from './model'
import './index.scss'

function formatTime(val: string | null) {
  if (!val) return '-'
  const d = dayjs(val)
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm') : '-'
}

type FilterForm = {
  keyword?: string
  reason?: FeedbackReasonCode
}

export default function AiFeedbackPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const [form] = Form.useForm<FilterForm>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [keyword, setKeyword] = useState('')
  const [reason, setReason] = useState<'' | FeedbackReasonCode>('')

  const { data: listData, isFetching: loading, refetch } = useQuery({
    queryKey: ['ai-feedback', keyword, reason, page, pageSize],
    queryFn: ({ signal }) =>
      fetchLowSatisfaction({ keyword, reason, page, pageSize }, signal),
  })
  const data = listData?.items ?? []
  const total = listData?.total ?? 0

  const columns: SmartColumn<LowSatisfactionItem>[] = useMemo(
    () => [
      {
        title: '问题',
        key: 'question',
        dataIndex: 'question',
        width: 220,
        fixed: 'left',
        ellipsis: true,
      },
      {
        title: '类型',
        key: 'questionType',
        dataIndex: 'questionType',
        width: 100,
        render: (val: string) => val || '-',
      },
      {
        title: '评价',
        key: 'vote',
        dataIndex: 'vote',
        width: 88,
        render: (vote: LowSatisfactionItem['vote']) => (
          <span className="ai-feedback-page__votes">
            {vote === 'up' ? (
              <LikeFilled className="ai-feedback-page__vote--on" />
            ) : (
              <LikeOutlined />
            )}
            {vote === 'down' ? (
              <DislikeFilled className="ai-feedback-page__vote--on" />
            ) : (
              <DislikeOutlined />
            )}
          </span>
        ),
      },
      {
        title: '原因',
        key: 'reason',
        dataIndex: 'reason',
        width: 220,
        ellipsis: true,
        render: (val: string) => val || '-',
      },
      {
        title: '最近回答',
        key: 'answer',
        dataIndex: 'answer',
        width: 280,
        ellipsis: true,
        render: (val: string) => val || '-',
      },
      {
        title: '补充说明',
        key: 'note',
        dataIndex: 'note',
        width: 180,
        ellipsis: true,
        render: (val: string) => val || '-',
      },
      {
        title: '最近反馈',
        key: 'feedbackAt',
        dataIndex: 'feedbackAt',
        width: 160,
        render: (val: string | null) => formatTime(val),
      },
    ],
    [],
  )

  return (
    <div ref={pageRef} className="ai-feedback-page">
      <Form
        form={form}
        className="ai-feedback-page__search"
        layout="inline"
        onFinish={(values) => {
          setKeyword((values.keyword ?? '').trim())
          setReason(values.reason ?? '')
          setPage(1)
        }}
        onReset={() => {
          form.resetFields()
          setKeyword('')
          setReason('')
          setPage(1)
          setPageSize(25)
        }}
      >
        <Form.Item label="问题" name="keyword">
          <Input
            allowClear
            placeholder="问题关键词"
            style={{ width: 220 }}
          />
        </Form.Item>
        <Form.Item label="原因" name="reason">
          <Select
            allowClear
            placeholder="全部原因"
            options={FEEDBACK_REASONS.map((item) => ({
              value: item.code,
              label: item.label,
            }))}
            style={{ width: 160 }}
          />
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

      <div className="ai-feedback-page__panel">
        <SmartTable<LowSatisfactionItem>
          tableToolbar={{
            loading,
            onReload: () => void refetch(),
            storageKey: 'ai-feedback-rank',
            fullscreenTargetRef: pageRef,
          }}
          paginationNode={
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              pageSizeOptions={['25', '50', '100']}
              showSizeChanger
              showTotal={(t) => `共 ${t} 条`}
              onChange={(p, ps) => {
                setPage(p)
                setPageSize(ps)
              }}
            />
          }
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  )
}
