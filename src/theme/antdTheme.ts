import { theme as antdTheme, type ThemeConfig } from 'antd'

/** Ant Design ConfigProvider 主题：算法 + 主色 + 布局覆盖 */
export function buildAntdTheme(
  isDark: boolean,
  colorPrimary: string,
): ThemeConfig {
  const surface = isDark ? '#141414' : '#ffffff'

  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    cssVar: {},
    token: {
      colorPrimary,
      colorInfo: colorPrimary,
      colorLink: colorPrimary,
    },
    components: {
      Layout: {
        siderBg: surface,
        headerBg: surface,
        bodyBg: isDark ? '#000000' : '#f7f8fa',
      },
      Tag: {
        defaultBg: surface,
      },
    },
  }
}
