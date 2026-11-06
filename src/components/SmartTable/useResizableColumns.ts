import type { ColumnsType, ColumnType } from 'antd/es/table'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from 'react'
import { getColumnKey } from '@/components/TableToolbar'

const MIN_WIDTH = 48
const EDGE = 6
const RESIZING_CLS = 'smart-table--resizing'
const TH_CLS = 'smart-table__th-resizable'
const STYLE_ATTR = 'data-smart-table-resize'
const COL_KEY_ATTR = 'data-col-key'

type DragState = {
  key: string
  startX: number
  startWidth: number
  lastWidth: number
  root: HTMLElement
}

function resolveWidth(width: ColumnType['width']): number | undefined {
  if (typeof width === 'number' && Number.isFinite(width)) return width
  if (typeof width === 'string' && /^\d+(\.\d+)?px$/.test(width)) {
    return Number.parseFloat(width)
  }
  return undefined
}

const SELECTION_MIN = 32

function lockRule(selector: string, px: string) {
  return `${selector}{width:${px}!important;min-width:${px}!important;max-width:${px}!important;flex:0 0 ${px}!important;box-sizing:border-box!important}`
}

function paintTable(table: HTMLTableElement, widths: number[], extra = 0) {
  const cols = [...table.querySelectorAll<HTMLElement>('col')]
  widths.forEach((width, i) => {
    if (cols[i]) cols[i].style.width = `${width}px`
  })
  const total = widths.reduce((sum, width) => sum + width, 0) + extra
  if (!total) return
  table.style.tableLayout = 'fixed'
  table.style.width = `${total}px`
  table.style.minWidth = `${total}px`
}

/**
 * 固定表头时表头、表体是两张 table，列宽各看各的 col。
 * 虚拟表体没有 table，列宽看 flex-basis。拖动时两边要写同一组宽度。
 * 勾选列没写 width，重算时会被报成 0。
 */
function syncWidthStyles(
  root: HTMLElement,
  map: Record<string, number>,
  selectionWidthRef: { current: number },
) {
  const entries = Object.entries(map)
  let styleEl = root.querySelector<HTMLStyleElement>(`style[${STYLE_ATTR}]`)
  if (!entries.length) {
    styleEl?.remove()
    return 0
  }
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.setAttribute(STYLE_ATTR, '')
    root.appendChild(styleEl)
  }

  const header = root.querySelector('.ant-table-header') ?? root
  const ths = [...header.querySelectorAll<HTMLElement>('.ant-table-thead th')]
  const cols = [...header.querySelectorAll<HTMLElement>('col')]
  const widths: number[] = []
  let scrollW = 0
  ths.forEach((th, i) => {
    if (th.classList.contains('ant-table-cell-scrollbar')) {
      const styled = Number.parseFloat(cols[i]?.style.width ?? '')
      scrollW = Number.isFinite(styled) && styled > 0
        ? styled
        : Math.round(th.getBoundingClientRect().width)
      return
    }
    const key = th.getAttribute(COL_KEY_ATTR)
    let width = key != null && map[key] != null
      ? map[key]
      : Number.parseFloat(cols[i]?.style.width ?? '')
    if (key == null) {
      if (width >= SELECTION_MIN) selectionWidthRef.current = width
      else if (selectionWidthRef.current) width = selectionWidthRef.current
    }
    if (!Number.isFinite(width) || width <= 0) {
      width = Math.round(th.getBoundingClientRect().width)
    }
    if (width <= 0) return
    widths.push(width)
  })

  const headerTable = header.querySelector('table')
  if (headerTable) paintTable(headerTable, widths, scrollW)
  root.querySelectorAll<HTMLTableElement>('.ant-table-body table').forEach((table) => {
    paintTable(table, widths)
  })
  const sum = widths.reduce((total, width) => total + width, 0)
  root.querySelectorAll<HTMLElement>('.ant-table-tbody-virtual .ant-table-row').forEach((row) => {
    row.style.width = `${sum}px`
  })

  const rules = entries.map(([key, w]) =>
    lockRule(`[${COL_KEY_ATTR}="${CSS.escape(key)}"]`, `${w}px`),
  )
  const selectionPx = selectionWidthRef.current
  if (selectionPx) {
    const px = `${selectionPx}px`
    rules.push(
      `col.ant-table-selection-col{width:${px}!important}`,
      lockRule('.ant-table-selection-column', px),
    )
  }
  styleEl.textContent = rules.join('')
  return sum
}

function sumScrollX<T extends object>(
  columns: ColumnsType<T>,
  map: Record<string, number>,
  selectionWidth: number,
) {
  let sum = selectionWidth
  for (const col of columns) {
    if ('children' in col && col.children?.length) return undefined
    const key = getColumnKey(col)
    const width = (key && map[key]) || resolveWidth(col.width)
    if (width == null) return undefined
    sum += width
  }
  return sum
}

/**
 * 表头右边缘拖拽改列宽（会话内临时）。
 * 拖动中不 setState；宽度用 data-col-key + 样式表锁定，避免松手被重测弹回。
 */
export function useResizableColumns<T extends object>(
  columns: ColumnsType<T>,
  enabled: boolean,
  wrapRef: RefObject<HTMLElement | null>,
) {
  const [widthMap, setWidthMap] = useState<Record<string, number>>({})
  const [selectionWidth, setSelectionWidth] = useState(0)
  const widthMapRef = useRef(widthMap)
  const selectionWidthRef = useRef(0)
  const dragRef = useRef<DragState | null>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    widthMapRef.current = widthMap
    const root = wrapRef.current
    if (root) syncWidthStyles(root, widthMap, selectionWidthRef)
  }, [widthMap, wrapRef])

  useEffect(() => {
    if (!enabled) return

    const onMove = (e: MouseEvent) => {
      const drag = dragRef.current
      if (!drag) return
      const next = Math.max(
        MIN_WIDTH,
        Math.round(drag.startWidth + (e.clientX - drag.startX)),
      )
      if (next === drag.lastWidth) return
      drag.lastWidth = next
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        const d = dragRef.current
        if (!d) return
        syncWidthStyles(
          d.root,
          { ...widthMapRef.current, [d.key]: d.lastWidth },
          selectionWidthRef,
        )
      })
    }

    const onUp = () => {
      const drag = dragRef.current
      if (!drag) return
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
      const nextMap = { ...widthMapRef.current, [drag.key]: drag.lastWidth }
      syncWidthStyles(drag.root, nextMap, selectionWidthRef)
      setSelectionWidth(selectionWidthRef.current)
      setWidthMap(nextMap)
      dragRef.current = null
      document.body.classList.remove(RESIZING_CLS)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [enabled])

  const scrollX = useMemo(
    () =>
      Object.keys(widthMap).length
        ? sumScrollX(columns, widthMap, selectionWidth)
        : undefined,
    [columns, widthMap, selectionWidth],
  )

  const resizedColumns = useMemo(() => {
    if (!enabled) return columns
    return columns.map((col) => {
      const key = getColumnKey(col)
      if (!key) return col
      const width = widthMap[key] ?? resolveWidth(col.width)
      if (width == null) return col

      const prevOnHeaderCell = col.onHeaderCell
      const prevOnCell = col.onCell
      const sizeStyle: CSSProperties = {
        width,
        minWidth: width,
        maxWidth: width,
      }

      return {
        ...col,
        width,
        onCell: (record, rowIndex) => {
          const prev = prevOnCell?.(record, rowIndex) ?? {}
          return {
            ...prev,
            [COL_KEY_ATTR]: key,
            style: { ...(prev.style as CSSProperties | undefined), ...sizeStyle },
          }
        },
        onHeaderCell: (column) => {
          const prev = prevOnHeaderCell?.(column) ?? {}
          return {
            ...prev,
            [COL_KEY_ATTR]: key,
            className: `${prev.className ?? ''} ${TH_CLS}`.trim(),
            style: { ...(prev.style as CSSProperties | undefined), ...sizeStyle },
            onMouseDown: (e: ReactMouseEvent<HTMLTableCellElement>) => {
              prev.onMouseDown?.(e)
              if (e.defaultPrevented || e.button !== 0) return
              const th = e.currentTarget
              if (th.getBoundingClientRect().right - e.clientX > EDGE) return
              const root = wrapRef.current
              if (!root) return
              e.preventDefault()
              e.stopPropagation()

              dragRef.current = {
                key,
                startX: e.clientX,
                startWidth: width,
                lastWidth: width,
                root,
              }
              document.body.classList.add(RESIZING_CLS)
            },
          }
        },
      }
    }) as ColumnsType<T>
  }, [columns, enabled, widthMap, wrapRef])

  return { columns: resizedColumns, scrollX }
}
