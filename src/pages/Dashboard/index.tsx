import { useQuery } from '@tanstack/react-query'
import { Card, Col, Row, Space, Spin, Table, Tag, Typography } from 'antd'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import DashboardPan from '@/assets/dashboard-pan.svg?react'
import { getAdmin } from '@/utils/auth'
import AiTrendChart from './AiTrendChart'
import { fetchOverview } from './api'
import {
  type HotRecipeRow,
  type RecentFeedbackRow,
  type StatIconKey,
} from './model'
import './index.scss'

const { Text } = Typography

const STAT_ICONS: Record<StatIconKey, ReactNode> = {
  recipes: <BookOutlined />,
  users: <TeamOutlined />,
  stars: <StarOutlined />,
  cooked: <FireOutlined />,
  aiAsk: <RobotOutlined />,
  aiDislike: <DislikeOutlined />,
}

function formatNumber(n: number, decimals = 0) {
  return n.toLocaleString('zh-CN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  })
}

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = reduced ? 1 : Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      setValue(target * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}

function StatValue({
  value,
  suffix,
  decimals = 0,
}: {
  value: number
  suffix?: string
  decimals?: number
}) {
  const current = useCountUp(value)
  return (
    <div className="dashboard-page__stat-value">
      {formatNumber(current, decimals)}
      {suffix ? (
        <span className="dashboard-page__stat-suffix">{suffix}</span>
      ) : null}
    </div>
  )
}

function greetLabel() {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

export default function DashboardPage() {
  const admin = getAdmin()
  const adminName = admin?.name || admin?.username || '管理员'
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: ({ signal }) => fetchOverview(signal),
  })
  const stats = data?.stats ?? []
  const aiTrend = data?.aiTrend ?? []
  const hotRecipes = data?.hotRecipes ?? []
  const recentFeedback = data?.recentFeedback ?? []

  const hotColumns = useMemo(
    () => [
      {
        title: '排名',
        dataIndex: 'rank',
        width: 72,
        render: (rank: number) => (
          <span
            className={
              rank <= 3
                ? 'dashboard-page__rank is-top'
                : 'dashboard-page__rank'
            }
          >
            {String(rank).padStart(2, '0')}
          </span>
        ),
      },
      {
        title: '菜谱',
        dataIndex: 'title',
        ellipsis: true,
      },
      {
        title: '分类',
        dataIndex: 'category',
        width: 120,
        ellipsis: true,
      },
      {
        title: '收藏',
        dataIndex: 'star',
        width: 96,
        align: 'right' as const,
        render: (v: number) => formatNumber(v),
      },
      {
        title: '做过',
        dataIndex: 'cooked',
        width: 88,
        align: 'right' as const,
        render: (v: number) => formatNumber(v),
      },
    ],
    [],
  )

  const feedbackColumns = useMemo(
    () => [
      {
        title: '问题',
        dataIndex: 'question',
        ellipsis: true,
      },
      {
        title: '原因',
        dataIndex: 'reason',
        width: 112,
        render: (v: string) => <Tag>{v}</Tag>,
      },
      {
        title: '时间',
        dataIndex: 'time',
        width: 120,
      },
    ],
    [],
  )

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__hello">
        <div>
          <div className="dashboard-page__hello-title">
            {greetLabel()}，{adminName}
            <span className="dashboard-page__wave" aria-hidden>
              👋
            </span>
          </div>
          <Text type="secondary" className="dashboard-page__hello-desc">
          烟火藏美味，为您呈现菜谱系统实时数据。
          </Text>
        </div>
        <span className="dashboard-page__hero" aria-hidden>
          <DashboardPan />
        </span>
      </header>
      <Spin spinning={isLoading}>
        <section className="dashboard-page__section">
          <Row gutter={[16, 16]}>
            {stats.map((item) => (
              <Col key={item.key} xs={24} sm={12} lg={8} xl={4}>
                <Card size="small" className="dashboard-page__stat" variant="borderless">
                  <div className="dashboard-page__stat-top">
                    <Text type="secondary">{item.title}</Text>
                    <span className={`dashboard-page__stat-icon is-${item.key}`}>
                      {STAT_ICONS[item.key]}
                    </span>
                  </div>
                  <StatValue
                    value={item.value}
                    suffix={item.suffix}
                    decimals={item.decimals}
                  />
                  <Space size={4} className="dashboard-page__stat-delta">
                    {item.trend === 'up' ? (
                      <ArrowUpOutlined className="is-up" />
                    ) : item.trend === 'down' ? (
                      <ArrowDownOutlined className="is-down" />
                    ) : null}
                    <Text type="secondary">{item.delta}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section className="dashboard-page__section">
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={14}>
              <Card
                size="small"
                className="dashboard-page__panel is-chart"
                title={
                  <Space>
                    <RobotOutlined />
                    <span>近 7 日 AI 提问趋势</span>
                  </Space>
                }
              >
                <AiTrendChart data={aiTrend} />
              </Card>
            </Col>
            <Col xs={24} xl={10}>
              <Card
                size="small"
                className="dashboard-page__panel dashboard-page__panel--note"
                variant="borderless"
                title={
                  <Space>
                    <DislikeOutlined />
                    <span>近期低满意问题</span>
                  </Space>
                }
                extra={<Link to="/ai/feedback">查看全部</Link>}
              >
                <Table<RecentFeedbackRow>
                  size="small"
                  rowKey="key"
                  pagination={false}
                  columns={feedbackColumns}
                  dataSource={recentFeedback}
                />
              </Card>
            </Col>
          </Row>
        </section>

        <section className="dashboard-page__section">
          <Card
            className="dashboard-page__panel"
            variant="borderless"
            title="热门菜谱排行榜"
            extra={<Link to="/recipe/list">菜谱列表</Link>}
          >
            <Table<HotRecipeRow>
              size="middle"
              rowKey="key"
              pagination={false}
              columns={hotColumns}
              dataSource={hotRecipes}
            />
          </Card>
        </section>
      </Spin>
    </div>
  )
}
