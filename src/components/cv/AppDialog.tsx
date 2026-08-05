import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type DialogState =
  | { kind: 'confirm'; message: string; destructive: boolean; resolve: (v: boolean) => void }
  | { kind: 'alert'; message: string; resolve: () => void }
  | null

/**
 * Promise-based replacement for window.confirm()/window.alert() that renders a dialog matching
 * the app's own design (rounded-full buttons, signal accent) instead of the browser's native
 * chrome. Usage mirrors the native functions closely: `if (await confirm('...')) { ... }` and
 * `await alertUser('...')`, just async since a React dialog can't block synchronously.
 */
export function useAppDialog() {
  const [state, setState] = useState<DialogState>(null)

  const confirm = useCallback((message: string, opts?: { destructive?: boolean }) => {
    return new Promise<boolean>((resolve) => {
      setState({ kind: 'confirm', message, destructive: opts?.destructive ?? false, resolve })
    })
  }, [])

  const alertUser = useCallback((message: string) => {
    return new Promise<void>((resolve) => {
      setState({ kind: 'alert', message, resolve })
    })
  }, [])

  function settle(result: boolean) {
    if (!state) return
    if (state.kind === 'confirm') state.resolve(result)
    else state.resolve()
    setState(null)
  }

  const dialog = (
    <Dialog open={state !== null} onOpenChange={(open) => !open && settle(false)}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-ink">
            {state?.kind === 'confirm' ? 'Are you sure?' : 'Heads up'}
          </DialogTitle>
          <DialogDescription className="text-[13.5px] text-slate">{state?.message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {state?.kind === 'confirm' && (
            <Button type="button" variant="outline" className="rounded-full" onClick={() => settle(false)}>
              Cancel
            </Button>
          )}
          <Button
            type="button"
            className={
              state?.kind === 'confirm' && state.destructive
                ? 'rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'rounded-full bg-signal text-ink hover:bg-signal/90'
            }
            onClick={() => settle(true)}
          >
            {state?.kind === 'confirm' ? 'Confirm' : 'OK'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return { confirm, alertUser, dialog }
}
