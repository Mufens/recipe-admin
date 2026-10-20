import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BookOutlined,
  DislikeOutlined,
  FireOutlined,
  RobotOutlined,
  StarOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Space, Table, Tag, Typography } from 'antd'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AiTrendChart from './AiTrendChart'
import BoardStickers from './BoardStickers'
import HeroDecor from './HeroDecor'
import {
  DEMO_AI_TREND,
  DEMO_HOT_RECIPES,
  DEMO_RECENT_FEEDBACK,
  DEMO_STATS,
  type HotRecipeRow,
  type RecentFeedbackRow,
  type StatIconKey,
} from './model'
import './index.scss'

const { Title, Text, Paragraph } = Typography

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

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
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

function SectionLabel({
  index,
  children,
}: {
  index: string
  children: ReactNode
}) {
  return (
    <div className="dashboard-page__section-label">
      <span className="dashboard-page__section-index">{index}</span>
      <span className="dashboard-page__section-title">{children}</span>
      <span className="dashboard-page__section-line" />
    </div>
  )
}

export default function DashboardPage() {
  const hotColumns = useMemo(
    () => [
      {
        title: '排名',
        dataIndex: 'rank',
        width: 64,
        render: (rank: number) =>
          rank <= 3 ? <Tag color="orange">{rank}</Tag> : rank,
      },
      {
        title: '菜谱',
        dataIndex: 'title',
        ellipsis: true,
      },
      {
        title: '分类',
        dataIndex: 'category',
        width: 96,
      },
      {
        title: '收藏',
        dataIndex: 'star',
        width: 88,
        render: (v: number) => formatNumber(v),
      },
      {
        title: '做过',
        dataIndex: 'cooked',
        width: 88,
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
      <div className="dashboard-page__board">
        <BoardStickers />

        <div className="dashboard-page__head">
          <div className="dashboard-page__tape dashboard-page__tape--l" />
          <div className="dashboard-page__tape dashboard-page__tape--r" />
          <div className="dashboard-page__head-text">
            <div className="dashboard-page__badge-row">
              <Tag color="processing">Demo</Tag>
              <span className="dashboard-page__hand-tag">厨房手抄报</span>
            </div>
            <Title level={3} className="dashboard-page__title">
              今日厨房情报
            </Title>
            <Paragraph type="secondary" className="dashboard-page__desc">
              看一眼谁在火、谁在问、谁被收藏——数据是示意，版面先像一张好看的黑板报。
            </Paragraph>
          </div>
          <div className="dashboard-page__hero">
            <HeroDecor />
          </div>
        </div>

        <section className="dashboard-page__section">
          <SectionLabel index="01">本周速览</SectionLabel>
          <Row gutter={[14, 14]}>
            {DEMO_STATS.map((item, index) => (
              <Col key={item.key} xs={24} sm={12} lg={8} xl={4}>
                <Card
                  size="small"
                  className={`dashboard-page__stat is-tone-${(index % 3) + 1}`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="dashboard-page__stat-top">
                    <Text type="secondary">{item.title}</Text>
                    <span className="dashboard-page__stat-icon">
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
          <SectionLabel index="02">厨知道播报</SectionLabel>
          <Row gutter={[14, 14]}>
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
                extra={<Text type="secondary">ECharts Demo</Text>}
              >
                <AiTrendChart data={DEMO_AI_TREND} />
              </Card>
            </Col>
            <Col xs={24} xl={10}>
              <Card
                size="small"
                className="dashboard-page__panel is-note"
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
                  dataSource={DEMO_RECENT_FEEDBACK}
                />
              </Card>
            </Col>
          </Row>
        </section>

        <section className="dashboard-page__section">
          <SectionLabel index="03">人气菜谱墙</SectionLabel>
          <Card
            size="small"
            className="dashboard-page__panel is-wall"
            title={
              <Space>
                <FireOutlined />
                <span>热门菜谱 Top</span>
              </Space>
            }
            extra={<Link to="/recipe/list">菜谱列表</Link>}
          >
            <Table<HotRecipeRow>
              size="small"
              rowKey="key"
              pagination={false}
              columns={hotColumns}
              dataSource={DEMO_HOT_RECIPES}
            />
          </Card>
        </section>
      </div>
    </div>
  )
}
