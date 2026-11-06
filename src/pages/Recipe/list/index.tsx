import QueryFilter from '@/components/QueryFilter'
import SmartTable from '@/components/SmartTable'
import { type SmartColumn } from '@/components/TableToolbar'
import { useCategoryTree } from '@/hooks/useCategoryTree'
import { useTagsStore } from '@/store/tags'
import { imageProps, resolveMediaUrl } from '@/utils/media'
import { useQuery } from '@tanstack/react-query'
import {
  Button,
  Cascader,
  DatePicker,
  Form,
  Image,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Select,
  Space,
  Tag,
  Tooltip,
  message,
} from 'antd'
import type { Dayjs } from 'dayjs'
import { useEffect, useMemo, useRef, useState, type Key } from 'react'
import { useActivate } from 'react-activation'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  extractLeafTagIds,
  resolvePathByTagId,
  type CategoryPaths,
} from '../common/categoryPath'
import { difficultyColor, difficultyOptions } from '../common/difficulty'
import {
  deleteRecipes,
  exportRecipes,
  fetchIngredientNames,
  fetchRecipeList,
  type SearchMode,
} from './api'
import BatchImportModal from './components/BatchImportModal'
import RecipeLogModal from './components/RecipeLogModal'
import './index.scss'
import { type RecipeItem } from './model'

type FilterForm = {
  keyword?: string
  ids?: string
  category?: CategoryPaths
  ingredients?: number[]
  ingredientMode?: SearchMode
  difficulty?: string
  createTimeRange?: [Dayjs, Dayjs] | null
}

type ListQuery = {
  keyword: string
  ids: string
  category: CategoryPaths
  ingredients: number[]
  ingredientMode: SearchMode
  difficulty: string
  createTimeFrom: string
  createTimeTo: string
}

const EMPTY_QUERY: ListQuery = {
  keyword: '',
  ids: '',
  category: [],
  ingredients: [],
  ingredientMode: 'exact',
  difficulty: '',
  createTimeFrom: '',
  createTimeTo: '',
}

function toListQuery(values: FilterForm): ListQuery {
  const range = values.createTimeRange
  return {
    keyword: (values.keyword ?? '').trim(),
    ids: (values.ids ?? '').trim(),
    category: values.category ?? [],
    ingredients: values.ingredients ?? [],
    ingredientMode: values.ingredientMode ?? 'exact',
    difficulty: values.difficulty ?? '',
    createTimeFrom: range?.[0]?.format('YYYY-MM-DD') || '',
    createTimeTo: range?.[1]?.format('YYYY-MM-DD') || '',
  }
}

export default function RecipeList() {
  const navigate = useNavigate()
  const location = useLocation()
  const pageRef = useRef<HTMLDivElement>(null)
  const [form] = Form.useForm<FilterForm>()

  const [exporting, setExporting] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [logRecipe, setLogRecipe] = useState<RecipeItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [query, setQuery] = useState<ListQuery>(EMPTY_QUERY)
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [fetchNonce, setFetchNonce] = useState(0)

  const { data: categoryTree = [] } = useCategoryTree()
  const selectedTagIds = useMemo(
    () => extractLeafTagIds(categoryTree, query.category),
    [categoryTree, query.category],
  )
  const { data: ingredientOptions = [] } = useQuery({
    queryKey: ['ingredientNames'],
    queryFn: () => fetchIngredientNames(),
    staleTime: 5 * 60 * 1000,
  })

  // 分类管理「关联菜谱」跳转：分类树就绪后回填筛选
  const filterTagId = (location.state as { filterTagId?: number } | null)
    ?.filterTagId
  const tagFilterPath = useMemo(
    () =>
      filterTagId == null ? null : resolvePathByTagId(categoryTree, filterTagId),
    [categoryTree, filterTagId],
  )
  const appliedLocationKeyRef = useRef('')
  useEffect(() => {
    if (!tagFilterPath || appliedLocationKeyRef.current === location.key) return

    appliedLocationKeyRef.current = location.key
    form.setFieldsValue({ category: [tagFilterPath] })
    setQuery({ ...EMPTY_QUERY, category: [tagFilterPath] })
    setSelectedRowKeys([])
    setPage(1)
  }, [location.key, tagFilterPath, form])

  const filterResolved = filterTagId == null || tagFilterPath !== null

  const {
    data: listData,
    isFetching: loading,
    refetch,
  } = useQuery({
    queryKey: ['recipes', query, page, pageSize, selectedTagIds, fetchNonce],
    queryFn: ({ signal }) =>
      fetchRecipeList(
        {
          keyword: query.keyword,
          page,
          pageSize,
          tagIds: selectedTagIds,
          ids: query.ids,
          ingredients: query.ingredients,
          ingredientMode: query.ingredientMode,
          difficulty: query.difficulty,
          createTimeFrom: query.createTimeFrom,
          createTimeTo: query.createTimeTo,
        },
        signal,
      ),
    enabled: filterResolved,
  })

  const data = listData?.items ?? []
  const total = listData?.total ?? 0

  const handleReset = () => {
    form.resetFields()
    setQuery(EMPTY_QUERY)
    setPage(1)
    setPageSize(25)
    setSelectedRowKeys([])
  }

  useActivate(() => {
    const action = useTagsStore.getState().consumeListReturn('/recipe/list')
    if (!action) return
    if (action === 'reset') handleReset()
    setFetchNonce((n) => n + 1)
  })

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportRecipes({
        keyword: query.keyword,
        ids: selectedRowKeys.map(String).join(','),
        tagIds: selectedTagIds,
        ingredients: query.ingredients,
        ingredientMode: query.ingredientMode,
        difficulty: query.difficulty,
        createTimeFrom: query.createTimeFrom,
        createTimeTo: query.createTimeTo,
      })
      const url = URL.createObjectURL(blob)
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: '菜谱列表.xlsx',
      })
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async (ids: Key[]) => {
    if (!ids.length) {
      message.warning('请选择要删除的菜谱')
      return
    }
    setDeleting(true)
    try {
      await deleteRecipes(ids)
      message.success('删除成功')
      const idSet = new Set(ids.map(String))
      setSelectedRowKeys((prev) => prev.filter((k) => !idSet.has(String(k))))
      await refetch()
    } catch {
      // 错误 toast 由拦截器统一处理
    } finally {
      setDeleting(false)
    }
  }

  const handleBatchDelete = () => {
    if (!selectedRowKeys.length) {
      message.warning('请先勾选要删除的菜谱')
      return
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定删除选中的 ${selectedRowKeys.length} 条菜谱吗？删除后不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => handleDelete(selectedRowKeys),
    })
  }

  const baseColumns: SmartColumn<RecipeItem>[] = useMemo(
    () => [
      {
        title: '编号',
        key: 'id',
        dataIndex: 'id',
        width: 80,
        align: 'center',
        fixed: 'left',
        render: (id: number) => (
          <Link
            to={`/recipe/detail?id=${id}`}
            style={{ textDecoration: 'none' }}
          >
            {id}
          </Link>
        ),
      },
      {
        title: '封面',
        key: 'img',
        dataIndex: 'img',
        width: 96,
        align: 'center',
        onCell: () => ({ className: 'home-page__cover-cell' }),
        render: (img: string) => (
          <Image
            width={80}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            src={resolveMediaUrl(img)}
            loading="lazy"
            {...imageProps}
          />
        ),
      },
      {
        title: '菜谱名称',
        key: 'title',
        dataIndex: 'title',
        width: 200,
        align: 'left',
        ellipsis: { showTitle: false },
        render: (title: string) => (
          <Tooltip title={title}>
            <span style={{ fontWeight: 500 }}>{title}</span>
          </Tooltip>
        ),
      },
      {
        title: '分类标签',
        key: 'tags',
        dataIndex: 'tags',
        width: 280,
        align: 'left',
        ellipsis: { showTitle: false },
        render: (_: unknown, record) => {
          const tags = record.tags ?? []
          if (!tags.length) return '-'
          const label = tags.map((t) => t.path_label || t.name).join('；')
          return (
            <Tooltip title={label}>
              <span>{label}</span>
            </Tooltip>
          )
        },
      },
      {
        title: '作者',
        key: 'author_name',
        dataIndex: 'author_name',
        width: 170,
        align: 'left',
        ellipsis: { showTitle: false },
        render: (name: string, record) => (
          <Tooltip title={name}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {resolveMediaUrl(record.author_avatar) && (
                <Image
                  width={24}
                  height={24}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                  src={resolveMediaUrl(record.author_avatar)}
                  preview={false}
                  loading="lazy"
                  {...imageProps}
                />
              )}
              <span>{name}</span>
            </div>
          </Tooltip>
        ),
      },
      {
        title: '难度',
        key: 'difficulty',
        dataIndex: 'difficulty',
        width: 100,
        align: 'center',
        render: (val: string | null) => {
          if (!val) return '-'
          return <Tag color={difficultyColor(val)}>{val}</Tag>
        },
      },
      {
        title: '制作时间',
        key: 'use_time',
        dataIndex: 'use_time',
        width: 100,
        align: 'center',
        render: (val: string | null) => val || '-',
      },
      {
        title: '收藏数',
        key: 'star',
        dataIndex: 'star',
        width: 100,
        align: 'center',
        sorter: (a, b) => a.star - b.star,
      },
      {
        title: '创建时间',
        key: 'create_time',
        dataIndex: 'create_time',
        width: 180,
        align: 'center',
        render: (val: string | null) => val || '-',
      },
    ],
    [],
  )

  const columns: SmartColumn<RecipeItem>[] = [...baseColumns]
  columns.push({
    title: '操作',
    key: 'action',
    width: 200,
    align: 'center',
    fixed: 'right',
    render: (_: unknown, record) => (
      <Space size={0}>
        {permission('recipe_list_edit_btn') && (
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/recipe/edit?id=${record.id}`)}
          >
            编辑
          </Button>
        )}
        {permission('recipe_list_log_btn') && (
          <Button type="link" size="small" onClick={() => setLogRecipe(record)}>
            日志
          </Button>
        )}
        {permission('recipe_list_delete_btn') && (
          <Popconfirm
            title="确认删除该菜谱？"
            description="删除后不可恢复"
            okText="删除"
            okType="danger"
            cancelText="取消"
            onConfirm={() => void handleDelete([record.id])}
          >
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        )}
      </Space>
    ),
  })

  return (
    <div ref={pageRef} className="home-page">
      <QueryFilter
        form={form}
        initialValues={{
          keyword: '',
          ids: '',
          ingredientMode: 'exact',
        }}
        onFinish={(values) => {
          setQuery(toListQuery(values as FilterForm))
          setSelectedRowKeys([])
          setPage(1)
        }}
        onReset={handleReset}
      >
        <Form.Item label="菜谱名称" name="keyword">
          <Input allowClear placeholder="模糊搜索" />
        </Form.Item>
        <Form.Item label="编号" name="ids">
          <Input allowClear placeholder="多个用,英文逗号分隔" />
        </Form.Item>
        <Form.Item label="分类筛选" name="category">
          <Cascader
            multiple
            maxTagCount="responsive"
            maxTagPlaceholder={(omitted) => `+${omitted.length}`}
            options={categoryTree}
            allowClear
            changeOnSelect
            placeholder="请选择分类"
          />
        </Form.Item>
        <Form.Item label="食材筛选">
          <Space.Compact>
            <Form.Item name="ingredientMode" noStyle>
              <Select
                options={[
                  { label: '精确', value: 'exact' },
                  { label: '模糊', value: 'fuzzy' },
                ]}
                style={{ width: 72 }}
              />
            </Form.Item>
            <Form.Item name="ingredients" noStyle>
              <Select
                mode="multiple"
                maxTagCount="responsive"
                maxTagPlaceholder={(omitted) => `+${omitted.length}`}
                options={ingredientOptions.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                allowClear
                showSearch={{ optionFilterProp: 'label' }}
                placeholder="请选择"
              />
            </Form.Item>
          </Space.Compact>
        </Form.Item>
        <Form.Item label="难度" name="difficulty">
          <Select
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            placeholder="请选择"
            options={difficultyOptions}
          />
        </Form.Item>
        <Form.Item label="创建时间" name="createTimeRange">
          <DatePicker.RangePicker
            allowClear
            placeholder={['开始日期', '结束日期']}
          />
        </Form.Item>
      </QueryFilter>

      <div className="home-page__panel">
        <SmartTable<RecipeItem>
          toolbar={
            <>
              {permission('recipe_list_add_btn') && (
                <Button
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  onClick={() => navigate('/recipe/add')}
                >
                  新增
                </Button>
              )}
              {permission('recipe_list_import_btn') && (
                <Button
                  icon={<ImportOutlined />}
                  onClick={() => setImportOpen(true)}
                >
                  批量导入
                </Button>
              )}
              {permission('recipe_list_delete_btn') && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleting}
                  disabled={!selectedRowKeys.length}
                  onClick={handleBatchDelete}
                >
                  批量删除
                </Button>
              )}
              {permission('recipe_list_export_btn') && (
                <Button
                  icon={<UploadOutlined />}
                  loading={exporting}
                  onClick={() => void handleExport()}
                >
                  导出
                </Button>
              )}
            </>
          }
          tableToolbar={{
            loading,
            onReload: () => void refetch(),
            storageKey: 'home-list',
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
              onChange={(nextPage, nextSize) => {
                setPage(nextPage)
                setPageSize(nextSize)
              }}
            />
          }
          rowKey="id"
          virtual
          rowSelection={
            permission('recipe_list_delete_btn')
              ? {
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                  preserveSelectedRowKeys: true,
                }
              : undefined
          }
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          scroll={{ x: 1560 }}
        />
      </div>

      <RecipeLogModal recipe={logRecipe} onCancel={() => setLogRecipe(null)} />

      <BatchImportModal
        open={importOpen}
        onCancel={() => setImportOpen(false)}
        onSuccess={() => {
          setImportOpen(false)
          void refetch()
        }}
      />
    </div>
  )
}
