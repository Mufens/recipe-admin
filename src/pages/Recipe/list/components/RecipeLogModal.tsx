import { useQuery } from '@tanstack/react-query'
import { Modal, Table } from 'antd'
import type { TableColumnsType } from 'antd'
import { fetchRecipeLogs, type RecipeLogItem } from '../api'

type RecipeRef = {
  id: number
}

const columns: TableColumnsType<RecipeLogItem> = [
  {
    title: '操作时间',
    dataIndex: 'create_time',
    width: 180,
  },
  {
    title: '操作人',
    dataIndex: 'create_by',
    width: 180,
  },
  {
    title: '操作类型',
    dataIndex: 'event_type',
    width: 140,
  },
  {
    title: '操作说明',
    dataIndex: 'content',
    ellipsis: true,
  },
]

export default function RecipeLogModal({
  recipe,
  onCancel,
}: {
  recipe: RecipeRef | null
  onCancel: () => void
}) {
  return (
    <Modal
      title="日志"
      open={recipe != null}
      width={860}
      centered
      footer={null}
      destroyOnHidden
      onCancel={onCancel}
    >
      {recipe ? <RecipeLogTable key={recipe.id} recipeId={recipe.id} /> : null}
    </Modal>
  )
}

function RecipeLogTable({ recipeId }: { recipeId: number }) {
  const { data, isFetching } = useQuery({
    queryKey: ['recipe-logs', recipeId],
    queryFn: ({ signal }) => fetchRecipeLogs(recipeId, signal),
    // 编辑后再次打开要看到新记录，不沿用全局 1 分钟缓存
    staleTime: 0,
    refetchOnMount: 'always',
  })

  return (
    <Table<RecipeLogItem>
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={data ?? []}
      loading={isFetching}
      scroll={{ y: 336 }}
      locale={{ emptyText: '暂无操作日志' }}
      pagination={false}
    />
  )
}
