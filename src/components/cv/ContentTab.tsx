import { useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Download, FileDown, Printer, RotateCcw, Upload } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PersonalInfoEditor } from '@/components/cv/PersonalInfoEditor'
import { SectionList } from '@/components/cv/SectionList'
import { isDesktop } from '@/services/platform'
import type { CVDataActions } from '@/hooks/useCVData'
import type { CVData } from '@/types'

interface ContentTabProps {
  cvName: string
  onNameChange: (name: string) => void
  onSave: () => void
  onManageCVs: () => void
  onReset: () => void
  onPrint: () => void
  onSavePdf: () => void
  onExportHtml: () => void
  onExportJson: () => void
  onImportJson: (file: File) => void
  onImportNative: () => void
  data: CVData
  actions: CVDataActions
}

export function ContentTab({
  cvName,
  onNameChange,
  onSave,
  onManageCVs,
  onReset,
  onPrint,
  onSavePdf,
  onExportHtml,
  onExportJson,
  onImportJson,
  onImportNative,
  data,
  actions,
}: ContentTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>('personal-info')
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Desktop gets native file dialogs; the browser build keeps blob downloads and
  // the hidden file input.
  const desktop = isDesktop()

  return (
    <div>
      <div className="mb-4">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate">
          CV Name
        </label>
        <Input value={cvName} onChange={(e) => onNameChange(e.target.value)} />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="rounded-full bg-ink text-paper hover:bg-ink/90"
          onClick={onSave}
        >
          Save
        </Button>
        <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={onManageCVs}>
          Manage CVs
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className="gap-1.5 rounded-full"
          onClick={onReset}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {desktop && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5 rounded-full text-xs"
            onClick={onSavePdf}
          >
            <FileDown className="h-3.5 w-3.5" /> Save as PDF
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5 rounded-full text-xs"
          onClick={onPrint}
        >
          <Printer className="h-3.5 w-3.5" /> Print
        </Button>
        <Button type="button" size="sm" variant="outline" className="gap-1.5 rounded-full text-xs" onClick={onExportHtml}>
          <Download className="h-3.5 w-3.5" /> Export HTML
        </Button>
        <Button type="button" size="sm" variant="outline" className="gap-1.5 rounded-full text-xs" onClick={onExportJson}>
          <Download className="h-3.5 w-3.5" /> Export JSON
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5 rounded-full text-xs"
          onClick={() => (desktop ? onImportNative() : fileInputRef.current?.click())}
        >
          <Upload className="h-3.5 w-3.5" /> Import JSON
        </Button>
        {!desktop && (
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onImportJson(file)
              e.target.value = ''
            }}
          />
        )}
      </div>

      <p className="mb-5 text-[11.5px] leading-relaxed text-slate">
        {desktop ? (
          <>
            <span className="font-semibold text-ink">Save as PDF</span> writes the file straight to
            your computer — nothing to change in a dialog.{' '}
            <span className="font-semibold text-ink">Print</span> opens the system print dialog for a
            real printer.
          </>
        ) : (
          <>
            <span className="font-semibold text-ink">Print</span> opens your browser's print dialog.
            To save this CV as a PDF, set{' '}
            <span className="font-semibold text-ink">Destination</span> to{' '}
            <span className="font-semibold text-ink">Save as PDF</span> there.
          </>
        )}
      </p>

      <div className="mb-5 h-px bg-hairline" />

      <div className="mb-2.5 overflow-hidden rounded-xl border border-hairline">
        <div
          className="flex cursor-pointer items-center gap-2 px-3.5 py-3"
          onClick={() => setExpandedId(expandedId === 'personal-info' ? null : 'personal-info')}
        >
          <span className="flex-1 font-display text-[14.5px] font-bold text-ink">
            Personal Information
          </span>
          {expandedId === 'personal-info' ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate" />
          )}
        </div>
        {expandedId === 'personal-info' && (
          <div className="border-t border-hairline px-3.5 pb-4 pt-3.5">
            <PersonalInfoEditor personalInfo={data.personalInfo} actions={actions} />
          </div>
        )}
      </div>

      <SectionList
        sections={data.sections}
        actions={actions}
        expandedId={expandedId === 'personal-info' ? null : expandedId}
        onExpandedChange={setExpandedId}
      />
    </div>
  )
}
