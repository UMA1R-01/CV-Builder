import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Plus,
  SeparatorHorizontal,
  Trash2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DragHandle, SortableContainer, SortableRow } from '@/components/cv/Sortable'
import { SectionContentEditor } from '@/components/cv/SectionContentEditor'
import type { CVDataActions } from '@/hooks/useCVData'
import type { CVSection } from '@/types'

interface SectionListProps {
  sections: CVSection[]
  actions: CVDataActions
  expandedId: string | null
  onExpandedChange: (id: string | null) => void
}

function IconToggle({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded ${
        active ? 'text-signal' : 'text-slate hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export function SectionList({ sections, actions, expandedId, onExpandedChange }: SectionListProps) {
  const [newSectionTitle, setNewSectionTitle] = useState('')

  return (
    <div>
      <SortableContainer
        ids={sections.map((s) => s.id)}
        onReorder={actions.reorderSections}
      >
        <div className="space-y-2.5">
          {sections.map((section) => {
            const isOpen = expandedId === section.id
            return (
              <SortableRow key={section.id} id={section.id}>
                {(handle) => (
                  <div
                    className={`overflow-hidden rounded-xl border ${isOpen ? 'border-ink' : 'border-hairline'}`}
                  >
                    <div
                      className={`flex cursor-pointer items-center gap-2 px-3.5 py-3 ${isOpen ? 'bg-paper' : 'bg-white'}`}
                      onClick={() => onExpandedChange(isOpen ? null : section.id)}
                    >
                      <DragHandle {...handle} />
                      <Input
                        value={section.title}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => actions.updateSectionTitle(section.id, e.target.value)}
                        className={`h-auto flex-1 border-none bg-transparent px-0 font-display text-[14.5px] font-bold shadow-none focus-visible:ring-0 ${
                          section.visible ? 'text-ink' : 'text-slate'
                        }`}
                      />
                      {!section.visible && (
                        <span className="rounded-full border border-hairline bg-paper px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate">
                          Hidden
                        </span>
                      )}
                      <IconToggle
                        label="Page break before"
                        active={section.pageBreakBefore}
                        onClick={() => actions.togglePageBreak(section.id)}
                      >
                        <SeparatorHorizontal className="h-3.5 w-3.5" />
                      </IconToggle>
                      <IconToggle
                        label={section.visible ? 'Hide section' : 'Show section'}
                        onClick={() => actions.toggleSectionVisibility(section.id)}
                      >
                        {section.visible ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                      </IconToggle>
                      <IconToggle
                        label="Duplicate section"
                        onClick={() => actions.duplicateSection(section.id)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </IconToggle>
                      <IconToggle
                        label="Delete section"
                        onClick={() => actions.deleteSection(section.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </IconToggle>
                      {isOpen ? (
                        <ChevronUp className="h-3.5 w-3.5 shrink-0 text-slate" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate" />
                      )}
                    </div>
                    {isOpen && (
                      <div className="border-t border-hairline px-3.5 pb-4 pt-3.5">
                        <SectionContentEditor section={section} actions={actions} />
                      </div>
                    )}
                  </div>
                )}
              </SortableRow>
            )
          })}
        </div>
      </SortableContainer>

      <div className="mt-4">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate">
          Add Custom Section
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="Section title…"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
          />
          <Button
            type="button"
            className="shrink-0 gap-1.5 rounded-full bg-ink text-paper hover:bg-ink/90"
            onClick={() => {
              const title = newSectionTitle.trim()
              if (!title) return
              actions.addSection('custom', title)
              setNewSectionTitle('')
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>
    </div>
  )
}
