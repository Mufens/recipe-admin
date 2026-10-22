import { Button, Form, Input, Segmented, Spin, message, theme } from 'antd'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import logo from '@/assets/logo.svg'
import DarkModeToggle from '@/theme/DarkModeToggle'
import ThemeSwitcher from '@/theme/ThemeSwitcher'
import { getToken, setAdmin, setToken } from '@/utils/auth'
import { fetchFeishuUrl, loginAdmin } from './api'
import './index.scss'


type FeishuQr = {
  matchOrigin: (origin: string) => boolean
  matchData: (data: unknown) => boolean
}

type FeishuWindow = Window & {
  QRLogin?: (options: {
    id: string
    goto: string
    width?: string
    height?: string
    style?: string
  }) => FeishuQr
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { token } = theme.useToken()
  const [mode, setMode] = useState<'account' | 'feishu'>('account')
  const [submitting, setSubmitting] = useState(false)
  const [qrReady, setQrReady] = useState(false)
  const [qrFailed, setQrFailed] = useState(false)

  useEffect(() => {
    if (getToken()) return
    const error = params.get('error')
    if (!error) return
    message.error(error)
    navigate('/login', { replace: true })
  }, [navigate, params])

  useEffect(() => {
    if (mode !== 'feishu') return
    let cancelled = false
    let removeListener = () => {}

    const mountQr = async () => {
      const { url } = await fetchFeishuUrl()
      if (cancelled) return
      const win = window as FeishuWindow
      if (!win.QRLogin) throw new Error('飞书扫码组件加载失败')
      const box = document.getElementById('feishu-qr')
      if (box) box.replaceChildren()
      const qr = win.QRLogin({
        id: 'feishu-qr',
        goto: url,
        width: '260',
        height: '260',
        style: 'border:none;background:transparent',
      })
      const onMessage = (event: MessageEvent) => {
        if (!qr.matchOrigin(event.origin) || !qr.matchData(event.data)) return
        const tmp = (event.data as { tmp_code?: string } | null)?.tmp_code
        if (!tmp) return
        window.location.href = `${url}&tmp_code=${encodeURIComponent(tmp)}`
      }
      window.addEventListener('message', onMessage)
      removeListener = () => window.removeEventListener('message', onMessage)
      const frame = box?.querySelector('iframe')
      if (!frame) throw new Error('飞书扫码组件加载失败')
      frame.addEventListener(
        'load',
        () => {
          if (!cancelled) setQrReady(true)
        },
        { once: true },
      )
    }

    mountQr().catch((err: unknown) => {
      if (!cancelled) setQrFailed(true)
      if (cancelled || axios.isAxiosError(err)) return
      if (err instanceof Error) message.error(err.message)
    })

    return () => {
      cancelled = true
      removeListener()
    }
  }, [mode])

  if (getToken()) return <Navigate to="/dashboard" replace />

  return (
    <div className="login-page">
      <svg className="login-page__bg" aria-hidden>
        <rect width="100%" height="100%" fill={token.colorBgLayout} />
        <g fill={token.colorPrimary}>
          <circle r="14.7%" cx="82%" cy="83%" />
          <circle r="6.5%" cx="39%" cy="32%" />
          <circle r="8.5%" cx="79%" cy="16%" />
          <circle r="9.7%" cx="22%" cy="79.5%" />
          <circle r="9.9%" cx="2.9%" cy="7.8%" />
        </g>
      </svg>

      <div className="login-page__tools">
        <DarkModeToggle />
        <ThemeSwitcher />
      </div>

      <div
        className="login-page__card"
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div className="login-page__header">
          <img className="login-page__logo" src={logo} alt="" />
          <h1 className="login-page__title" style={{ color: token.colorPrimary }}>
            菜谱管理
          </h1>
        </div>

        <Segmented
          block
          className="login-page__switch"
          value={mode}
          options={[
            { label: '账号登录', value: 'account' },
            { label: '飞书登录', value: 'feishu' },
          ]}
          onChange={(value) => {
            const next = value as 'account' | 'feishu'
            if (next === 'feishu') {
              setQrReady(false)
              setQrFailed(false)
            }
            setMode(next)
          }}
        />

        {mode === 'feishu' ? (
          <div className="login-page__qr">
            <div className="login-page__qr-box">
              <div id="feishu-qr" className="login-page__qr-frame" />
              {!qrReady && !qrFailed && (
                <div className="login-page__qr-loading">
                  <Spin size="large" />
                </div>
              )}
            </div>
            <p className="login-page__qr-tip">请使用飞书扫码登录</p>
          </div>
        ) : (
          <Form
            size="large"
            initialValues={{ username: 'admin', password: '123456' }}
            onFinish={async (values: { username: string; password: string }) => {
              setSubmitting(true)
              try {
                const data = await loginAdmin(values)
                setToken(data.token)
                setAdmin(data.admin)
                message.success('登录成功')
                navigate('/dashboard', { replace: true })
              } catch(e) {
                console.error('登录失败', e)
              } finally {
                setSubmitting(false)
              }
            }}
          >
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
                maxLength={32}
                autoComplete="username"
              />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                maxLength={32}
                autoComplete="current-password"
              />
            </Form.Item>
            <Form.Item>
              <Button
                className="login-page__submit"
                type="primary"
                htmlType="submit"
                loading={submitting}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  )
}
