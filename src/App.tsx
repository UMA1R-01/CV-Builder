import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { TopBar } from '@/components/cv/TopBar'
import { MobileTabBar } from '@/components/cv/MobileTabBar'
import { ContentTab } from '@/components/cv/ContentTab'
import { StyleControls } from '@/components/cv/StyleControls'
import { CVPreview } from '@/components/cv/CVPreview'
import { CVManager } from '@/components/cv/CVManager'
import { useAppDialog } from '@/components/cv/AppDialog'
import { useCVData } from '@/hooks/useCVData'
import { DEFAULT_CV_DATA, DEFAULT_STYLE } from '@/constants'
import {
  deleteCV,
  getMostRecentCV,
  loadSavedCVs,
  loadWip,
  mergeStyleWithDefaults,
  saveCV,
  scheduleSaveWip,
} from '@/services/cvStore'
import {
  exportHtml,
  exportJson,
  exportPdf,
  importJsonFile,
  importJsonNative,
  printCv,
} from '@/services/exporters'
import type { CVData, SavedCV, StyleConfig } from '@/types'

const MIN_SIDEBAR_WIDTH = 320
const MAX_SIDEBAR_WIDTH = 640
const DEFAULT_SIDEBAR_WIDTH = 450

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

interface InitialState {
  name: string
  data: CVData
  style: StyleConfig
  activeCVId: string | null
}

function computeInitialState(): InitialState {
  const wip = loadWip()
  if (wip) {
    return { name: wip.name, data: wip.data, style: wip.style, activeCVId: wip.activeCVId }
  }
  const saved = loadSavedCVs()
  const mostRecent = getMostRecentCV(saved)
  if (mostRecent) {
    return {
      name: mostRecent.name,
      data: mostRecent.data,
      style: mostRecent.style,
      activeCVId: mostRecent.id,
    }
  }
  return { name: 'Untitled CV', data: DEFAULT_CV_DATA, style: DEFAULT_STYLE, activeCVId: null }
}

function App() {
  const [initial] = useState(computeInitialState)
  const [data, actions] = useCVData(initial.data)
  const [style, setStyle] = useState<StyleConfig>(initial.style)
  const [cvName, setCvName] = useState(initial.name)
  const [activeCVId, setActiveCVId] = useState<string | null>(initial.activeCVId)

  const [sidebarTab, setSidebarTab] = useState<'content' | 'style'>('content')
  const [mobileMode, setMobileMode] = useState<'editor' | 'preview'>('preview')
  const [managerOpen, setManagerOpen] = useState(false)
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>(() => loadSavedCVs())
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH)
  const [showSaveToast, setShowSaveToast] = useState(false)

  const previewRootRef = useRef<HTMLDivElement>(null)
  const { confirm, alertUser, dialog: appDialog } = useAppDialog()

  function handleResizeStart(e: React.PointerEvent) {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = sidebarWidth
    document.documentElement.classList.add('resizing-cols')

    function onMove(ev: PointerEvent) {
      const delta = startX - ev.clientX
      setSidebarWidth(clamp(startWidth + delta, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH))
    }
    function onUp() {
      document.documentElement.classList.remove('resizing-cols')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  useEffect(() => {
    scheduleSaveWip({ name: cvName, data, style, activeCVId })
  }, [data, style, cvName, activeCVId])

  useEffect(() => {
    if (!showSaveToast) return
    const timer = setTimeout(() => setShowSaveToast(false), 2200)
    return () => clearTimeout(timer)
  }, [showSaveToast])

  function updateStyle(patch: Partial<StyleConfig>) {
    setStyle((s) => ({ ...s, ...patch }))
  }

  async function handleSave() {
    const trimmed = cvName.trim()
    if (!trimmed) {
      await alertUser('Please enter a name for this CV before saving.')
      return
    }
    const { list, id } = saveCV(trimmed, data, style, activeCVId)
    setSavedCVs(list)
    setActiveCVId(id)
    setShowSaveToast(true)
  }

  function handleOpenManager() {
    setSavedCVs(loadSavedCVs())
    setManagerOpen(true)
  }

  function resetToBlankCv() {
    actions.loadData(DEFAULT_CV_DATA)
    setStyle(DEFAULT_STYLE)
    setCvName('Untitled CV')
    setActiveCVId(null)
  }

  function handleCreateNew() {
    resetToBlankCv()
    setManagerOpen(false)
  }

  async function handleReset() {
    if (await confirm('Reset this CV to a blank starting point? Any unsaved changes will be lost.', { destructive: true })) {
      resetToBlankCv()
    }
  }

  function handleLoadCV(cv: SavedCV) {
    actions.loadData(cv.data)
    setStyle(mergeStyleWithDefaults(cv.style))
    setCvName(cv.name)
    setActiveCVId(cv.id)
    setManagerOpen(false)
  }

  function handleDeleteCV(id: string) {
    const list = deleteCV(id)
    setSavedCVs(list)
    if (id === activeCVId) {
      handleCreateNew()
    }
  }

  function handlePrint() {
    printCv(cvName)
  }

  async function handleSavePdf() {
    try {
      await exportPdf(cvName, style)
    } catch {
      await alertUser('Could not save the PDF.')
    }
  }

  async function handleExportHtml() {
    if (!previewRootRef.current) return
    try {
      await exportHtml(previewRootRef.current, cvName)
    } catch {
      await alertUser('Could not export the HTML file.')
    }
  }

  async function handleExportJson() {
    try {
      await exportJson(cvName, data, style)
    } catch {
      await alertUser('Could not export the JSON file.')
    }
  }

  function applyImportedCV(parsed: { name: string; data: CVData; style: StyleConfig }) {
    actions.loadData(parsed.data)
    setStyle(mergeStyleWithDefaults(parsed.style))
    setCvName(parsed.name)
    setActiveCVId(null)
  }

  async function handleImportJson(file: File) {
    try {
      applyImportedCV(await importJsonFile(file))
      await alertUser('CV imported successfully.')
    } catch {
      await alertUser('Could not import CV. The file may be invalid or corrupted.')
    }
  }

  async function handleImportNative() {
    try {
      const parsed = await importJsonNative()
      if (!parsed) return
      applyImportedCV(parsed)
      await alertUser('CV imported successfully.')
    } catch {
      await alertUser('Could not import CV. The file may be invalid or corrupted.')
    }
  }

  return (
    <div className="cv-print-flow flex h-dvh flex-col overflow-hidden bg-paper">
      <TopBar cvName={cvName} onNameChange={setCvName} onManageCVs={handleOpenManager} onSave={handleSave} />

      <div className="cv-print-flow flex min-h-0 flex-1">
        <div className={`cv-print-flow min-h-0 min-w-0 flex-1 ${mobileMode === 'preview' ? 'flex' : 'hidden'} lg:flex`}>
          <CVPreview data={data} style={style} previewRootRef={previewRootRef} />
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize editor panel"
          onPointerDown={handleResizeStart}
          className="print-hide hidden w-1.5 shrink-0 cursor-col-resize bg-hairline transition-colors hover:bg-signal active:bg-signal lg:block"
        />

        <div
          style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
          className={`print-hide min-h-0 w-full flex-col border-l-2 border-hairline bg-white lg:w-[var(--sidebar-width)] lg:shrink-0 ${
            mobileMode === 'editor' ? 'flex' : 'hidden'
          } lg:flex`}
        >
          <div className="flex shrink-0 gap-6 border-b border-hairline px-5 pt-4">
            {(['content', 'style'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSidebarTab(tab)}
                className={`relative pb-3 font-display text-sm font-bold capitalize ${
                  sidebarTab === tab ? 'text-ink' : 'text-slate'
                }`}
              >
                {tab}
                {sidebarTab === tab && (
                  <span className="absolute inset-x-0 -bottom-px h-1 rounded-full bg-signal" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 pb-24">
            {sidebarTab === 'content' ? (
              <ContentTab
                cvName={cvName}
                onNameChange={setCvName}
                onSave={handleSave}
                onManageCVs={handleOpenManager}
                onReset={handleReset}
                onPrint={handlePrint}
                onSavePdf={handleSavePdf}
                onExportHtml={handleExportHtml}
                onExportJson={handleExportJson}
                onImportJson={handleImportJson}
                onImportNative={handleImportNative}
                data={data}
                actions={actions}
              />
            ) : (
              <StyleControls style={style} onChange={updateStyle} />
            )}
          </div>
        </div>
      </div>

      <MobileTabBar mode={mobileMode} onChange={setMobileMode} />

      <CVManager
        open={managerOpen}
        onOpenChange={setManagerOpen}
        savedCVs={savedCVs}
        activeCVId={activeCVId}
        onLoad={handleLoadCV}
        onDelete={handleDeleteCV}
        onCreateNew={handleCreateNew}
      />

      {showSaveToast && (
        <div
          role="status"
          className="print-hide fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 py-2.5 font-display text-[13px] font-bold text-paper animate-in fade-in slide-in-from-bottom-2"
        >
          <Check className="h-4 w-4 text-lime" />
          CV saved
        </div>
      )}

      {appDialog}
    </div>
  )
}

export default App
