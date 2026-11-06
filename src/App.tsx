import { AliveScope } from 'react-activation'
import AppRouter from '@/router'
import { selectColorPrimary, useThemeStore } from '@/store/theme'
import { buildAntdTheme } from '@/theme/antdTheme'
import { queryClient } from '@/utils/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useMemo } from 'react'
import { BrowserRouter } from 'react-router-dom'

dayjs.locale('zh-cn')

export default function App() {
  const colorPrimary = useThemeStore(selectColorPrimary)
  const isDark = useThemeStore((s) => s.isDark)
  const theme = useMemo(
    () => buildAntdTheme(isDark, colorPrimary),
    [colorPrimary, isDark],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={theme}
        input={{ autoComplete: 'off' }}
        textArea={{ autoComplete: 'off' }}
      >
        <BrowserRouter>
          <AliveScope>
            <AppRouter />
          </AliveScope>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  )
}
