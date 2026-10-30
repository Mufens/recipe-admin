import { SearchOutlined } from '@ant-design/icons'
import { Button, Checkbox, Input, Spin, Tree, message } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPermissionTree, fetchRole, updateRole } from '../api'
import type { AdminRole, PermissionNode } from '../model'

const EMPTY_CODES: string[] = []
const EMPTY_TREE: PermissionNode[] = []

/** 勾了按钮就带上上级菜单。 */
function expandChecked(codes: string[], tree: PermissionNode[]) {
  const selected = new Set(codes.filter((code) => !code.startsWith('group:')))
  const walk = (nodes: PermissionNode[], menus: string[]) => {
    for (const node of nodes) {
      if (node.type === 'app') {
        selected.delete(node.code)
        walk(node.children ?? [], [])
        continue
      }
      const nextMenus = node.type === 'menu' ? [...menus, node.code] : menus
      if (node.type === 'button' && selected.has(node.code)) {
        for (const code of nextMenus) selected.add(code)
      }
      walk(node.children ?? [], nextMenus)
    }
  }
  walk(tree, [])
  return [...selected]
}

function codesOfType(nodes: PermissionNode[], type: PermissionNode['type'], into = new Set<string>()) {
  for (const node of nodes) {
    if (node.type === type) into.add(node.code)
    if (node.children) codesOfType(node.children, type, into)
  }
  return into
}

function filterTree(nodes: PermissionNode[], keyword: string): PermissionNode[] {
  const key = keyword.trim()
  if (!key) return nodes
  const next: PermissionNode[] = []
  for (const node of nodes) {
    const children = filterTree(node.children ?? [], key)
    if (node.name.includes(key)) {
      next.push(node)
      continue
    }
    if (children.length) next.push({ ...node, children })
  }
  return next
}

function toTreeData(
  nodes: PermissionNode[],
  checked: Set<string>,
  disabled: boolean,
  onToggle: (code: string, on: boolean) => void,
): DataNode[] {
  return nodes.map((node) => {
    const buttons = (node.children ?? []).filter((child) => child.type === 'button')
    const branches = (node.children ?? []).filter((child) => child.type !== 'button')
    return {
      key: node.code,
      disableCheckbox: node.type === 'app',
      title:
        buttons.length === 0 ? (
          node.name
        ) : (
          <span className="role-perm__node">
            <span className="role-perm__name">{node.name}</span>
            <span className="role-perm__buttons" onClick={(e) => e.stopPropagation()}>
              {buttons.map((button) => (
                <Checkbox
                  key={button.code}
                  disabled={disabled}
                  checked={checked.has(button.code)}
                  onChange={(e) => onToggle(button.code, e.target.checked)}
                >
                  {button.name}
                </Checkbox>
              ))}
            </span>
          </span>
        ),
      children: branches.length ? toTreeData(branches, checked, disabled, onToggle) : undefined,
    }
  })
}

export default function AuthList({ role }: { role: AdminRole }) {
  const queryClient = useQueryClient()
  const [permissionDraft, setPermissionDraft] = useState<{
    roleId: number
    codes: string[]
  } | null>(null)
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const composing = useRef(false)
  const roleQuery = useQuery({
    queryKey: ['admin-role', role.id],
    queryFn: ({ signal }) => fetchRole(role.id, signal),
  })
  const treeQuery = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: ({ signal }) => fetchPermissionTree(signal),
  })

  const permissionCodes =
    permissionDraft?.roleId === role.id ? permissionDraft.codes : (roleQuery.data?.permissions ?? EMPTY_CODES)
  const builtin = role.builtin === 1
  const tree = treeQuery.data ?? EMPTY_TREE
  const visibleTree = useMemo(() => filterTree(tree, keyword), [tree, keyword])
  const permissionLocked = builtin
  const checked = useMemo(() => new Set(permissionCodes), [permissionCodes])
  const buttonCodes = useMemo(() => codesOfType(tree, 'button'), [tree])
  const toggleButton = (code: string, on: boolean) => {
    if (permissionLocked) return
    const next = new Set(permissionCodes)
    if (on) next.add(code)
    else next.delete(code)
    setPermissionDraft({
      roleId: role.id,
      codes: expandChecked([...next], tree),
    })
  }
  const treeData = toTreeData(visibleTree, checked, permissionLocked, toggleButton)

  const savePermissions = useMutation({
    mutationFn: async () => {
      const detail = roleQuery.data
      if (!detail || detail.builtin === 1) return null
      const codes = expandChecked(permissionCodes, tree)
      if (codes.length === 0) {
        message.warning('请选择权限')
        return null
      }
      return updateRole(role.id, {
        name: detail.name,
        remark: detail.remark,
        status: detail.status,
        permissions: codes,
      })
    },
    onSuccess: (saved) => {
      if (!saved) return
      message.success('保存成功')
      setPermissionDraft(null)
      void queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-role', saved.id] })
    },
  })

  if (roleQuery.isPending || treeQuery.isPending) {
    return (
      <div className="role-page__loading">
        <Spin />
      </div>
    )
  }
  if (roleQuery.isError) return <div className="role-page__placeholder">角色不存在</div>

  const detail = roleQuery.data
  const updatedText = detail?.updatedBy
    ? `${detail.updatedBy} ${detail.updateTime || ''}`.trim()
    : '-'

  return (
    <div className="role-perm">
      <div className="role-perm__bar">
        <Input
          allowClear
          className="role-perm__search"
          prefix={<SearchOutlined />}
          placeholder="输入关键字进行过滤"
          value={keywordInput}
          onCompositionStart={() => {
            composing.current = true
          }}
          onCompositionEnd={(e) => {
            composing.current = false
            const value = e.currentTarget.value
            setKeywordInput(value)
            setKeyword(value.trim())
          }}
          onChange={(e) => {
            const value = e.target.value
            setKeywordInput(value)
            if (!composing.current) setKeyword(value.trim())
          }}
        />
        <div className="role-perm__meta">
          {!builtin && (
            <Button
              type="primary"
              loading={savePermissions.isPending}
              onClick={() => savePermissions.mutate()}
            >
              保存
            </Button>
          )}
          <div className="role-perm__updated">最近更新：{updatedText}</div>
        </div>
      </div>
      <div className="role-perm__tree">
        {visibleTree.length === 0 ? (
          <span className="role-perm__empty">没有匹配的权限</span>
        ) : (
        <Tree
          key={`${keyword}|${tree.map((node) => node.code).join('|')}`}
          blockNode
          checkable
          checkStrictly
          defaultExpandAll
          disabled={permissionLocked}
          checkedKeys={{
            checked: permissionCodes.filter((code) => !buttonCodes.has(code)),
            halfChecked: [],
          }}
          treeData={treeData}
          onCheck={(checkedKeys) => {
            const keys = (Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked).map(String)
            const keptButtons = permissionCodes.filter((code) => buttonCodes.has(code))
            setPermissionDraft({
              roleId: role.id,
              codes: expandChecked([...keys, ...keptButtons], tree),
            })
          }}
        />
        )}
      </div>
    </div>
  )
}
