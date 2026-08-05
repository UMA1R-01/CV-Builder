import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  FONT_SIZE_PX,
  FONT_STACKS,
  LINE_HEIGHT_VALUE,
  MARGIN_PX,
  PAGE_PX,
} from '@/constants'
import { buildBlocks, type Block } from '@/components/cv/previewBlocks'
import { hexToRgba, isValidHex } from '@/lib/color'
import type { CVData, StyleConfig } from '@/types'

const MIN_ZOOM = 0.3

const FIT_MODES = ['width', 'page'] as const
type FitMode = (typeof FIT_MODES)[number]

const FIT_MODE_LABELS: Record<FitMode, string> = {
  width: 'Fit Width',
  page: 'Fit Page',
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

interface CVPreviewProps {
  data: CVData
  style: StyleConfig
  previewRootRef: React.RefObject<HTMLDivElement | null>
}

function paginate(
  blocks: (Block & { height: number })[],
  availableHeight: number,
): (Block & { height: number })[][] {
  const pages: (Block & { height: number })[][] = [[]]

  for (const block of blocks) {
    let current = pages[pages.length - 1]
    const isFirstOnPage = current.length === 0
    const gap = isFirstOnPage ? 0 : block.marginTop
    const needed = gap + block.height

    if (block.pageBreakBefore && !isFirstOnPage) {
      pages.push([])
      current = pages[pages.length - 1]
      current.push(block)
      continue
    }

    const used = current.reduce(
      (sum, b, i) => sum + b.height + (i === 0 ? 0 : b.marginTop),
      0,
    )

    if (!isFirstOnPage && used + needed > availableHeight) {
      pages.push([block])
      continue
    }

    current.push(block)
  }

  return pages
}

export function CVPreview({ data, style, previewRootRef }: CVPreviewProps) {
  const blocks = useMemo(() => buildBlocks(data, style), [data, style])

  const measureRefs = useRef(new Map<string, HTMLDivElement>())
  const [pages, setPages] = useState<Block[][] | null>(null)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  // Infinity until the first real ResizeObserver measurement lands, so fit-scale clamps to 1
  // (full size) instead of flashing at MIN_ZOOM before the container has been measured.
  const [containerSize, setContainerSize] = useState({ width: Infinity, height: Infinity })
  const [fitMode, setFitMode] = useState<FitMode>('width')

  const [pageWidth, pageHeight] = PAGE_PX[style.paperSize]
  const paddingPx = MARGIN_PX[style.margin]
  const contentWidth = pageWidth - paddingPx * 2
  const availableHeight = pageHeight - paddingPx * 2

  const widthScale = clamp(containerSize.width / pageWidth, MIN_ZOOM, 1)
  const pageScale = clamp(
    Math.min(containerSize.width / pageWidth, containerSize.height / pageHeight),
    MIN_ZOOM,
    1,
  )
  const scale = fitMode === 'page' ? pageScale : widthScale

  const fontStack = FONT_STACKS[style.fontFamily]
  const fontSize = FONT_SIZE_PX[style.fontSize]
  const lineHeight = LINE_HEIGHT_VALUE[style.lineHeight]
  // Secondary/muted text (job-title subtitles, dates, skill levels, etc.) is styled via the
  // `--slate` CSS variable + Tailwind's `text-slate` utility; there's no dedicated Style control
  // for it, so it's derived from Body Text at reduced opacity — ties it to something the user can
  // actually adjust while keeping it visually de-emphasized relative to full-strength body text.
  const mutedColor = hexToRgba(isValidHex(style.bodyColor) ? style.bodyColor : '#374151', 0.68)

  const pageTextStyle: React.CSSProperties = {
    fontFamily: fontStack,
    fontSize,
    lineHeight,
    color: style.bodyColor,
    // Guarantees no content — including long unbroken strings like URLs — can ever overflow the
    // page's margins; applied here (not just on .cv-page) so the offscreen measurement copy
    // wraps identically and pagination heights stay accurate.
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
  }

  // ---- Measure + paginate whenever content or layout-affecting style changes ----
  useLayoutEffect(() => {
    const measured = blocks.map((block) => {
      const el = measureRefs.current.get(block.id)
      const height = el?.getBoundingClientRect().height ?? 0
      return { ...block, height }
    })
    setPages(paginate(measured, availableHeight))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, availableHeight, contentWidth, fontStack, fontSize, lineHeight])

  // ---- Track available space for fit-to-width / fit-to-page scaling ----
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      setContainerSize({
        width: rect?.width ?? container.clientWidth,
        height: rect?.height ?? container.clientHeight,
      })
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const layoutReady = pages !== null
  const displayPages = layoutReady ? pages! : [blocks]
  const scaledHeight = displayPages.length * pageHeight * scale + (displayPages.length - 1) * 40 * scale

  return (
    <div className="cv-print-flow flex h-full min-w-0 flex-1 flex-col">
      <style>{`
        .cv-content, .cv-content * { font-family: ${fontStack} !important; }
        .cv-content, .cv-measure { --slate: ${mutedColor}; }
        @page { size: ${pageWidth}px ${pageHeight}px; margin: 0; }
      `}</style>

      <div className="print-hide flex shrink-0 items-center justify-end gap-1 border-b border-hairline bg-white px-4 py-2">
        {FIT_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setFitMode(mode)}
            aria-pressed={fitMode === mode}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              fitMode === mode ? 'bg-ink text-paper' : 'text-slate hover:bg-hairline/60'
            }`}
          >
            {FIT_MODE_LABELS[mode]}
          </button>
        ))}
      </div>

      <div
        ref={scrollContainerRef}
        className="cv-print-flow relative flex min-h-0 min-w-0 flex-1 justify-center overflow-auto bg-paper px-6 py-10"
      >
        <div className="cv-print-flow" style={{ height: scaledHeight, width: pageWidth * scale, overflow: 'hidden' }}>
          <div
            ref={previewRootRef}
            className="cv-content"
            style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: pageWidth }}
          >
            {displayPages.map((pageBlocks, pageIndex) => (
              <Fragment key={pageIndex}>
                <div
                  className="cv-page relative bg-white"
                  style={{
                    width: pageWidth,
                    height: pageHeight,
                    padding: paddingPx,
                    border: '2px solid var(--ink)',
                    overflow: 'hidden',
                    ...pageTextStyle,
                  }}
                >
                  {pageBlocks.map((block, i) => (
                    <div key={block.id} style={{ marginTop: i === 0 ? 0 : block.marginTop }}>
                      {block.node}
                    </div>
                  ))}
                </div>
                {pageIndex < displayPages.length - 1 && (
                  <div className="cv-page-gap" style={{ height: 40 * scale }} />
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Offscreen measurement pass — real width/padding/font context, hidden from view. */}
        <div
          className="cv-measure pointer-events-none absolute left-0 top-0 -z-10 opacity-0"
          style={{ width: contentWidth, ...pageTextStyle }}
          aria-hidden
        >
          {blocks.map((block) => (
            <div
              key={block.id}
              ref={(el) => {
                if (el) measureRefs.current.set(block.id, el)
                else measureRefs.current.delete(block.id)
              }}
            >
              {block.node}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
