import { Result } from 'antd'

export default function ForbiddenPage() {
  return (
    <Result status="403" title="没有权限" subTitle="当前账号不能访问这个页面。" />
  )
}
