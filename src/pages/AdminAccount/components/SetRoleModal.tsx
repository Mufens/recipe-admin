import { Checkbox, Modal, message } from 'antd'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAdminProfile } from '@/hooks/usePermission'
import { fetchRoleOptions, setAccountRoles } from '../api'
import type { InternalAccount } from '../model'

export default function SetRoleModal({
  account,
  onClose,
}: {
  account: InternalAccount | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { data: profile } = useAdminProfile()
  const [roleState, setRoleState] = useState<{ accountId: number | null; roleIds: number[] }>({
    accountId: account?.id ?? null,
    roleIds: account?.roles.map((role) => role.id) ?? [],
  })
  const accountId = account?.id ?? null
  const roleIds =
    roleState.accountId === accountId
      ? roleState.roleIds
      : (account?.roles.map((role) => role.id) ?? [])
  if (roleState.accountId !== accountId) {
    setRoleState({ accountId, roleIds })
  }

  const { data: roleOptions = [], isFetching: rolesLoading } = useQuery({
    queryKey: ['internal-account-roles'],
    queryFn: ({ signal }) => fetchRoleOptions(signal),
    enabled: account != null && permission('admin_account_role_btn'),
  })

  const saveMutation = useMutation({
    mutationFn: () => setAccountRoles(account!.id, roleIds),
    onSuccess: (saved) => {
      message.success('已保存')
      onClose()
      void queryClient.invalidateQueries({ queryKey: ['internal-accounts'] })
      if (saved.id === profile?.id) {
        void queryClient.invalidateQueries({ queryKey: ['admin-profile'] })
      }
    },
  })

  return (
    <Modal
      title={account ? `设置角色 · ${account.name}` : '设置角色'}
      open={account != null}
      onCancel={onClose}
      onOk={() => saveMutation.mutate()}
      confirmLoading={saveMutation.isPending}
      okText="确定"
      cancelText="取消"
      destroyOnHidden
      width={420}
    >
      {rolesLoading && roleOptions.length === 0 ? (
        <span>加载中</span>
      ) : roleOptions.length === 0 ? (
        <span>还没有角色</span>
      ) : (
        <Checkbox.Group
          className="account-roles"
          value={roleIds}
          options={roleOptions.map((role) => ({
            label: role.status === 1 ? role.name : `${role.name}（禁用）`,
            value: role.id,
          }))}
          onChange={(vals) =>
            setRoleState({ accountId, roleIds: vals as number[] })
          }
        />
      )}
    </Modal>
  )
}
