import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DislikeOutlined,
  FireOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Space, Table, Tag, Typography } from 'antd'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import AiTrendChart from './AiTrendChart'
import {
  DEMO_AI_TREND,
  DEMO_HOT_RECIPES,
  DEMO_RECENT_FEEDBACK,
  DEMO_STATS,
  type HotRecipeRow,
  type RecentFeedbackRow,
} from './model'
import './index.scss'

const { Title, Text, Paragraph } = Typography

function formatNumber(n: number) {
  if (Number.isInteger(n)) return n.toLocaleString('zh-CN')
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 1 })
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
      <div className="dashboard-page__head">
        <div>
          <Title level={4} className="dashboard-page__title">
            数据看板
          </Title>
          <Paragraph type="secondary" className="dashboard-page__desc">
            Demo 展示页，数据为示意，未接真实接口。用于预览运营首页形态。
          </Paragraph>
        </div>
        <Tag color="processing">Demo</Tag>
      </div>

      <Row gutter={[16, 16]}>
        {DEMO_STATS.map((item) => (
          <Col key={item.key} xs={24} sm={12} lg={8} xl={4}>
            <Card size="small" className="dashboard-page__stat">
              <Text type="secondary">{item.title}</Text>
              <div className="dashboard-page__stat-value">
                {formatNumber(item.value)}
                {item.suffix ? (
                  <span className="dashboard-page__stat-suffix">{item.suffix}</span>
                ) : null}
              </div>
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

      <Row gutter={[16, 16]} className="dashboard-page__main">
        <Col xs={24} xl={14}>
          <Card
            size="small"
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

        <Col span={24}>
          <Card
            size="small"
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
        </Col>
      </Row>
    </div>
  )
}
