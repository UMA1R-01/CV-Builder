import { Fragment } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppDialog } from '@/components/cv/AppDialog'
import type { SavedCV } from '@/types'

interface CVManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  savedCVs: SavedCV[]
  activeCVId: string | null
  onLoad: (cv: SavedCV) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
}

export function CVManager({
  open,
  onOpenChange,
  savedCVs,
  activeCVId,
  onLoad,
  onDelete,
  onCreateNew,
}: CVManagerProps) {
  const sorted = [...savedCVs].sort((a, b) => b.lastModified - a.lastModified)
  const { confirm, dialog: confirmDialog } = useAppDialog()

  return (
    <Fragment>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-ink">Manage CVs</DialogTitle>
          </DialogHeader>

          <Button
            type="button"
            className="w-fit gap-1.5 self-start rounded-full bg-ink text-paper hover:bg-ink/90"
            size="sm"
            onClick={onCreateNew}
          >
            <Plus className="h-3.5 w-3.5" /> Create New CV
          </Button>

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {sorted.length === 0 && (
              <p className="py-8 text-center text-sm text-slate">
                No saved CVs yet. Use Save to add one.
              </p>
            )}
            {sorted.map((cv) => {
              const isActive = cv.id === activeCVId
              return (
                <div
                  key={cv.id}
                  className="flex items-center gap-3 rounded-lg border border-hairline px-3.5 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">{cv.name}</div>
                    <div className="text-xs text-slate">
                      {new Date(cv.lastModified).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={isActive ? 'outline' : 'default'}
                    disabled={isActive}
                    className={isActive ? 'rounded-full text-xs' : 'rounded-full bg-signal text-ink text-xs hover:bg-signal/90'}
                    onClick={() => onLoad(cv)}
                  >
                    {isActive ? 'Loaded' : 'Load'}
                  </Button>
                  <button
                    type="button"
                    aria-label="Delete CV"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate hover:bg-paper hover:text-destructive"
                    onClick={async () => {
                      if (await confirm(`Delete "${cv.name}"? This cannot be undone.`, { destructive: true })) {
                        onDelete(cv.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {confirmDialog}
    </Fragment>
  )
}
