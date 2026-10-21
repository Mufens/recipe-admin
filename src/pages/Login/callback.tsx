import { Spin } from 'antd'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setAdmin, setToken } from '@/utils/auth'
import { exchangeFeishuTicket } from './api'

export default function LoginCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const ticket = params.get('ticket')

  useEffect(() => {
    if (!ticket) {
      navigate('/login', { replace: true })
      return
    }
    let cancelled = false
    exchangeFeishuTicket(ticket)
      .then((data) => {
        if (cancelled) return
        setToken(data.token)
        setAdmin(data.admin)
        navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        if (!cancelled) navigate('/login', { replace: true })
      })
    return () => {
      cancelled = true
    }
  }, [navigate, ticket])

  return (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}>
      <Spin size="large" description="登录中..." />
    </div>
  )
}
