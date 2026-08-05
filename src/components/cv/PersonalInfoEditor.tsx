import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DragHandle, SortableContainer, SortableRow } from '@/components/cv/Sortable'
import type { CVDataActions } from '@/hooks/useCVData'
import type { PersonalInfo } from '@/types'

interface PersonalInfoEditorProps {
  personalInfo: PersonalInfo
  actions: CVDataActions
}

export function PersonalInfoEditor({ personalInfo, actions }: PersonalInfoEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate">
          Name
        </label>
        <Input
          value={personalInfo.name}
          onChange={(e) => actions.updatePersonalInfo({ name: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate">
          Job Title
        </label>
        <Input
          value={personalInfo.jobTitle}
          onChange={(e) => actions.updatePersonalInfo({ jobTitle: e.target.value })}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate">
          Details
        </label>
        <SortableContainer
          ids={personalInfo.details.map((d) => d.id)}
          onReorder={actions.reorderDetails}
        >
          <div className="space-y-2">
            {personalInfo.details.map((detail) => (
              <SortableRow key={detail.id} id={detail.id} className="flex items-center gap-2">
                {(handle) => (
                  <>
                    <DragHandle {...handle} />
                    <Input
                      value={detail.label}
                      placeholder="Label"
                      className="w-24 shrink-0"
                      onChange={(e) => actions.updateDetail(detail.id, { label: e.target.value })}
                    />
                    <Input
                      value={detail.value}
                      placeholder="Value"
                      onChange={(e) => actions.updateDetail(detail.id, { value: e.target.value })}
                    />
                    <button
                      type="button"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate hover:bg-paper hover:text-ink"
                      aria-label="Delete detail"
                      onClick={() => actions.deleteDetail(detail.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </SortableRow>
            ))}
          </div>
        </SortableContainer>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 gap-1.5 rounded-full border-ink text-xs font-semibold"
          onClick={() => actions.addDetail()}
        >
          <Plus className="h-3.5 w-3.5" /> Add new detail
        </Button>
      </div>
    </div>
  )
}
