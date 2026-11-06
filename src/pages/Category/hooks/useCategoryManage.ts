import { Form, message } from 'antd'
import { useState } from 'react'
import {
  keepPreviousData,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import {
  createSubCategory,
  createTag,
  deleteTag,
  fetchManageList,
  fetchManageNav,
  renameCategory,
  renameSubCategory,
  updateTag,
} from '../api'
import type {
  CategoryFormValues,
  ManageListItem,
  ManageListParams,
  ManageNavNode,
  ModalMode,
  NodeKind,
  NodeSel,
} from '../model'
import { DEFAULT_PAGE_SIZE } from '../model'

type Crumb = {
  id: string
  name: string
  kind: NodeSel['kind']
}

const ROOT_CRUMB: Crumb = { id: '', name: '全部分类', kind: '' }

function buildBreadcrumb(nav: ManageNavNode[], selected: NodeSel): Crumb[] {
  if (!selected.kind || !selected.id) return [ROOT_CRUMB]
  if (selected.kind === 'category') {
    const cat = nav.find((n) => n.id === selected.id)
    return [
      ROOT_CRUMB,
      { id: selected.id, name: cat?.name || selected.id, kind: 'category' },
    ]
  }
  for (const cat of nav) {
    const sub = cat.children.find((s) => s.id === selected.id)
    if (!sub) continue
    return [
      ROOT_CRUMB,
      { id: cat.id, name: cat.name, kind: 'category' },
      { id: sub.id, name: sub.name, kind: 'sub_category' },
    ]
  }
  return [ROOT_CRUMB]
}

function expandKeyFor(nav: ManageNavNode[], next: NodeSel): string {
  if (!next.id) return ''
  if (next.kind === 'category') return next.id
  const parent = nav.find((n) => n.children.some((s) => s.id === next.id))
  return parent?.id ?? ''
}

const SAVE_MSG: Record<NonNullable<ModalMode>['type'], string> = {
  rename: '保存成功',
  createSub: '分组已建好',
  createTag: '标签已挂上',
}

export function useCategoryManage() {
  const [selected, setSelected] = useState<NodeSel>({ kind: '', id: '' })
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [modal, setModal] = useState<ModalMode>(null)
  const [filterForm] = Form.useForm<{
    categoryName?: string
    categoryCode?: string
  }>()

  const {
    data: nav = [],
    isLoading: navLoading,
    isError: navError,
    refetch: refetchNav,
  } = useQuery({
    queryKey: ['categoryManageNav'],
    queryFn: ({ signal }) => fetchManageNav(signal),
  })

  const selectNode = (next: NodeSel) => {
    filterForm.resetFields()
    setSelected(next)
    setName('')
    setCode('')
    setPage(1)
    const expandId = expandKeyFor(nav, next)
    if (!expandId) return
    setExpandedKeys((prev) =>
      prev.includes(expandId) ? prev : [...prev, expandId],
    )
  }

  const listParams: ManageListParams = {
    nodeKind: selected.kind,
    nodeId: selected.id,
    name,
    code,
    page,
    pageSize,
  }

  const { data: listData, isFetching: listLoading, refetch: refetchList } = useQuery({
    queryKey: ['categoryManageList', listParams],
    queryFn: ({ signal }) => fetchManageList(listParams, signal),
    placeholderData: keepPreviousData,
  })

  const items = listData?.items ?? []
  const total = listData?.total ?? 0
  const listKind = listData?.listKind ?? 'category'
  const canAddSub = listData?.canAddSub ?? false
  const canAddTag = listData?.canAddTag ?? false
  const breadcrumb = buildBreadcrumb(nav, selected)

  const refresh = (refreshNav?: boolean) => {
    if (refreshNav) refetchNav()
    refetchList()
  }

  const saveMut = useMutation({
    mutationFn: async ({
      mode,
      values,
    }: {
      mode: NonNullable<ModalMode>
      values: CategoryFormValues
    }) => {
      if (mode.type === 'rename') {
        const { kind, row } = mode
        if (kind === 'category') {
          await renameCategory({ id: String(row.id), name: values.name })
        } else if (kind === 'sub_category') {
          await renameSubCategory({ id: String(row.id), name: values.name })
        } else {
          await updateTag({
            id: Number(row.id),
            name: values.name,
            type: values.type,
            icon: values.icon,
          })
        }
        return
      }
      if (mode.type === 'createSub') {
        await createSubCategory({
          parentId: mode.parentId,
          name: values.name,
          id: values.id,
        })
        return
      }
      await createTag({
        parentKind: mode.parentKind,
        parentId: mode.parentId,
        name: values.name,
        type: values.type,
        icon: values.icon,
      })
    },
    onSuccess: async (_data, { mode }) => {
      message.success(SAVE_MSG[mode.type])
      setModal(null)
      await refresh(
        mode.type === 'createSub' ||
          (mode.type === 'rename' && mode.kind !== 'tag'),
      )
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteTag(id),
    onSuccess: async () => {
      message.success('删除成功')
      await refresh()
    },
  })

  const openRename = (row: ManageListItem) => {
    setModal({ type: 'rename', kind: row.kind, row })
  }

  const openCreateSub = () => {
    const cat = nav.find((n) => n.id === selected.id)
    setModal({
      type: 'createSub',
      parentId: selected.id,
      parentName: cat?.name || selected.id,
    })
  }

  const openCreateTag = () => {
    setModal({
      type: 'createTag',
      parentKind: selected.kind as NodeKind,
      parentId: selected.id,
      parentName: breadcrumb[breadcrumb.length - 1].name,
    })
  }

  const handleModalOk = async (values: CategoryFormValues) => {
    if (!modal) return
    await saveMut.mutateAsync({
      mode: modal,
      values,
    })
  }

  return {
    nav,
    navLoading,
    navError,
    refetchNav,
    selected,
    selectNode,
    filterForm,
    expandedKeys,
    setExpandedKeys,
    handleSearch: (values: { categoryName?: string; categoryCode?: string }) => {
      setName((values.categoryName ?? '').trim())
      setCode((values.categoryCode ?? '').trim())
      setPage(1)
    },
    handleReset: () => {
      filterForm.resetFields()
      setName('')
      setCode('')
      setPage(1)
    },
    page,
    pageSize,
    setPage,
    setPageSize,
    items,
    total,
    listKind,
    listLoading,
    breadcrumb,
    canAddSub,
    canAddTag,
    modal,
    setModal,
    savePending: saveMut.isPending,
    deleteTag: (id: number) => deleteMut.mutate(id),
    openRename,
    openCreateSub,
    openCreateTag,
    handleModalOk,
  }
}
