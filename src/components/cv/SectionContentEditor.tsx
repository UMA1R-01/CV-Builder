import { useState } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Copy, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DragHandle, SortableContainer, SortableRow } from '@/components/cv/Sortable'
import {
  CertificationFields,
  CustomFields,
  EducationFields,
  LanguageFields,
  ProjectFields,
  SkillFields,
  WorkExperienceFields,
} from '@/components/cv/ItemFields'
import { SORT_KEYS_BY_TYPE } from '@/constants'
import type { CVDataActions } from '@/hooks/useCVData'
import type { CVSection, SectionItem } from '@/types'

function getItemTitle(item: SectionItem): string {
  const candidate = item as unknown as Record<string, unknown>
  const value =
    candidate.jobTitle ??
    candidate.degree ??
    candidate.skillName ??
    candidate.projectName ??
    candidate.name ??
    candidate.language ??
    candidate.title
  return typeof value === 'string' && value.trim() ? value : 'Untitled'
}

function ItemFields({
  section,
  item,
  onChange,
}: {
  section: CVSection
  item: SectionItem
  onChange: (patch: Record<string, unknown>) => void
}) {
  switch (section.type) {
    case 'experience':
      return <WorkExperienceFields item={item as never} onChange={onChange} />
    case 'education':
      return <EducationFields item={item as never} onChange={onChange} />
    case 'skills':
      return <SkillFields item={item as never} onChange={onChange} />
    case 'projects':
      return <ProjectFields item={item as never} onChange={onChange} />
    case 'certifications':
      return <CertificationFields item={item as never} onChange={onChange} />
    case 'languages':
      return <LanguageFields item={item as never} onChange={onChange} />
    case 'custom':
      return <CustomFields item={item as never} onChange={onChange} />
  }
}

interface SectionContentEditorProps {
  section: CVSection
  actions: CVDataActions
}

export function SectionContentEditor({ section, actions }: SectionContentEditorProps) {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState(SORT_KEYS_BY_TYPE[section.type][0])
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  return (
    <div>
      {(section.type === 'skills' || section.type === 'languages') && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate">
            Display as
          </span>
          <Select
            value={section.displayStyle}
            onValueChange={(v) =>
              section.type === 'skills'
                ? actions.setSkillsDisplayStyle(section.id, v as never)
                : actions.setLanguagesDisplayStyle(section.id, v as never)
            }
          >
            <SelectTrigger className="h-8 flex-1 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(section.type === 'skills'
                ? ['chips', 'list']
                : ['compact', 'pills', 'list', 'bar', 'dots']
              ).map((opt) => (
                <SelectItem key={opt} value={opt} className="text-xs capitalize">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {section.type === 'languages' && (
            <Select
              value={section.arrangement}
              onValueChange={(v) => actions.setLanguagesArrangement(section.id, v as never)}
            >
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inline" className="text-xs">
                  Inline
                </SelectItem>
                <SelectItem value="multiline" className="text-xs">
                  Multiline
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      <div className="mb-3 flex items-center gap-2">
        <Select value={sortKey} onValueChange={setSortKey}>
          <SelectTrigger className="h-8 flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_KEYS_BY_TYPE[section.type].map((key) => (
              <SelectItem key={key} value={key} className="text-xs">
                Sort by: {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-hairline text-ink hover:bg-paper"
          aria-label={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
        >
          {sortDirection === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )}
        </button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 shrink-0 rounded-md text-xs"
          onClick={() => actions.sortItems(section.id, sortKey, sortDirection)}
        >
          Apply
        </Button>
      </div>

      <SortableContainer
        ids={section.items.map((i) => i.id)}
        onReorder={(activeId, overId) => actions.reorderItems(section.id, activeId, overId)}
      >
        <div className="space-y-2">
          {section.items.map((item) => {
            const isExpanded = expandedItemId === item.id
            return (
              <SortableRow key={item.id} id={item.id}>
                {(handle) => (
                  <div
                    className={`rounded-lg border ${isExpanded ? 'border-ink bg-paper' : 'border-hairline bg-white'}`}
                  >
                    <div className="flex items-center gap-2 px-2.5 py-2">
                      <DragHandle {...handle} />
                      <button
                        type="button"
                        className="flex flex-1 items-center gap-1.5 truncate text-left text-[13.5px] font-semibold text-ink"
                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      >
                        <span className="truncate">{getItemTitle(item)}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 shrink-0 text-slate" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate" />
                        )}
                      </button>
                      <button
                        type="button"
                        className="flex h-6.5 w-6.5 items-center justify-center rounded text-slate hover:bg-white hover:text-ink"
                        aria-label="Duplicate item"
                        onClick={() => actions.duplicateItem(section.id, item.id)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="flex h-6.5 w-6.5 items-center justify-center rounded text-slate hover:bg-white hover:text-ink"
                        aria-label="Delete item"
                        onClick={() => actions.deleteItem(section.id, item.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-hairline px-3 pb-3 pt-3">
                        <ItemFields
                          section={section}
                          item={item}
                          onChange={(patch) => actions.updateItem(section.id, item.id, patch)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </SortableRow>
            )
          })}
        </div>
      </SortableContainer>

      <Button
        type="button"
        className="mt-3 gap-1.5 rounded-full bg-signal text-ink hover:bg-signal/90"
        size="sm"
        onClick={() => {
          actions.addItem(section.id)
        }}
      >
        <Plus className="h-3.5 w-3.5" /> Add Item
      </Button>
    </div>
  )
}
