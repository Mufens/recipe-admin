import { useEffect, useRef } from 'react'
import { theme } from 'antd'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useThemeStore } from '@/store/theme'
import type { AiTrendPoint } from './model'

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer,
])

const CHART_HEIGHT = 280

interface AiTrendChartProps {
  data: AiTrendPoint[]
}

function parseHex(hex: string): [number, number, number] | null {
  const raw = hex.replace('#', '')
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw
  if (full.length !== 6) return null
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ]
}

function mixHex(a: string, b: string, ratio: number): string {
  const pa = parseHex(a)
  const pb = parseHex(b)
  if (!pa || !pb) return a
  const mix = (i: number) =>
    Math.round(pa[i] + (pb[i] - pa[i]) * ratio)
      .toString(16)
      .padStart(2, '0')
  return `#${mix(0)}${mix(1)}${mix(2)}`
}

function mixWithWhite(hex: string, ratio: number): string {
  return mixHex(hex, '#ffffff', ratio)
}

function hexToRgba(hex: string, alpha: number): string {
  const rgb = parseHex(hex)
  if (!rgb) return hex
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`
}

function buildOption(
  data: AiTrendPoint[],
  isDark: boolean,
  colorPrimary: string,
  colorSecondary: string,
) {
  const axisColor = isDark ? 'rgba(243,237,228,0.45)' : '#A2987F'
  const splitColor = isDark ? 'rgba(243,237,228,0.08)' : '#E9DFCC'
  const textColor = isDark ? 'rgba(243,237,228,0.85)' : '#6E6355'
  const barLight = mixWithWhite(colorPrimary, 0.35)

  return {
    color: [colorPrimary, colorSecondary],
    animationDuration: 800,
    animationEasing: 'cubicOut' as const,
    tooltip: { trigger: 'axis' as const },
    legend: {
      data: ['提问', '低满意'],
      top: 0,
      textStyle: { color: textColor },
    },
    grid: {
      left: 16,
      right: 16,
      top: 40,
      bottom: 8,
      containLabel: true,
    },
    xAxis: {
      type: 'category' as const,
      data: data.map((d) => d.day),
      axisLabel: { color: axisColor },
      axisLine: { lineStyle: { color: splitColor } },
    },
    yAxis: [
      {
        type: 'value' as const,
        name: '提问',
        nameTextStyle: { color: axisColor },
        axisLabel: { color: axisColor },
        splitLine: { lineStyle: { color: splitColor } },
      },
      {
        type: 'value' as const,
        name: '低满意',
        position: 'right' as const,
        nameTextStyle: { color: axisColor },
        axisLabel: { color: axisColor },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '提问',
        type: 'bar' as const,
        data: data.map((d) => d.ask),
        barMaxWidth: 28,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear' as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: barLight },
              { offset: 1, color: colorPrimary },
            ],
          },
        },
        animationDelay: (idx: number) => idx * 80,
      },
      {
        name: '低满意',
        type: 'line' as const,
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: data.map((d) => d.dislike),
        itemStyle: { color: colorSecondary },
        lineStyle: { width: 2, color: colorSecondary },
        areaStyle: { color: hexToRgba(colorSecondary, 0.15) },
      },
    ],
  }
}

export default function AiTrendChart({ data }: AiTrendChartProps) {
  const { token } = theme.useToken()
  const isDark = useThemeStore((s) => s.isDark)
  const colorPrimary = token.colorPrimary
  const colorSecondary = colorPrimary

  const hostRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.EChartsType | null>(null)
  const propsRef = useRef({ data, isDark, colorPrimary, colorSecondary })

  useEffect(() => {
    propsRef.current = { data, isDark, colorPrimary, colorSecondary }
    chartRef.current?.setOption(
      buildOption(data, isDark, colorPrimary, colorSecondary),
      { notMerge: true },
    )
  }, [data, isDark, colorPrimary, colorSecondary])

  useEffect(() => {
    const el = hostRef.current
    if (!el) return

    const ensureChart = () => {
      if (el.clientWidth <= 0 || el.clientHeight <= 0) return

      if (!chartRef.current) {
        const chart = echarts.init(el)
        chartRef.current = chart
        const latest = propsRef.current
        chart.setOption(
          buildOption(
            latest.data,
            latest.isDark,
            latest.colorPrimary,
            latest.colorSecondary,
          ),
        )
      } else {
        chartRef.current.resize()
      }
    }

    ensureChart()
    const ro = new ResizeObserver(() => ensureChart())
    ro.observe(el)

    return () => {
      ro.disconnect()
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [])

  return (
    <div
      ref={hostRef}
      className="dashboard-page__chart"
      style={{ width: '100%', height: CHART_HEIGHT }}
    />
  )
}
