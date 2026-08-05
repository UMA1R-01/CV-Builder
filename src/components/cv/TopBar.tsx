import { FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WindowControls } from '@/components/cv/WindowControls'
import { isDesktop } from '@/services/platform'

interface TopBarProps {
  cvName: string
  onNameChange: (name: string) => void
  onManageCVs: () => void
  onSave: () => void
}

export function TopBar({ cvName, onNameChange, onManageCVs, onSave }: TopBarProps) {
  // On desktop this bar *is* the title bar: the window is undecorated, so the empty
  // areas here have to be the drag handle. Interactive children deliberately don't
  // carry the attribute — Tauri only drags when the click target itself has it.
  const desktop = isDesktop()
  const dragRegion = desktop ? '' : undefined

  return (
    <div
      data-tauri-drag-region={dragRegion}
      className={`print-hide flex h-16 shrink-0 items-center justify-between border-b-2 border-ink bg-ink px-5 ${
        desktop ? 'select-none' : ''
      }`}
    >
      <div data-tauri-drag-region={dragRegion} className="flex items-center gap-5">
        <div
          data-tauri-drag-region={dragRegion}
          className="whitespace-nowrap font-display text-xl font-black text-paper"
        >
          CV<span className="text-signal">/</span>Builder
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-paper/20 bg-paper/10 px-3.5 py-1.5 sm:flex">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
          <input
            value={cvName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Untitled CV"
            className="w-44 bg-transparent text-[13px] font-medium text-paper outline-none placeholder:text-paper/50 md:w-64"
          />
        </div>
      </div>
      <div data-tauri-drag-region={dragRegion} className="flex items-center gap-2 self-stretch">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 self-center rounded-full border-paper/30 bg-transparent text-paper hover:bg-paper/10 hover:text-paper"
          onClick={onManageCVs}
        >
          <FolderOpen className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Manage CVs</span>
        </Button>
        <Button
          type="button"
          size="sm"
          className="self-center rounded-full bg-signal font-semibold text-ink hover:bg-signal/90"
          onClick={onSave}
        >
          Save
        </Button>
        {desktop && <WindowControls />}
      </div>
    </div>
  )
}
