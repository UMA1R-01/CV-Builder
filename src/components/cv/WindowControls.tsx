import { useEffect, useState } from 'react'
import { Copy, Minus, Square, X } from 'lucide-react'
import { getCurrentWindow } from '@tauri-apps/api/window'

/**
 * Minimise / maximise / close for the frameless desktop window.
 *
 * The window is created with `decorations(false)` (src-tauri/src/lib.rs) so the app's
 * TopBar can serve as the title bar instead of sitting under a second, native one —
 * which means these buttons have to be drawn by us. Rendered only on desktop.
 */
export function WindowControls() {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    const win = getCurrentWindow()
    let unlisten: (() => void) | undefined
    let cancelled = false

    void win.isMaximized().then(setMaximized)
    void win
      .onResized(() => {
        void win.isMaximized().then(setMaximized)
      })
      .then((stop) => {
        // The listener can resolve after unmount; drop it immediately if so.
        if (cancelled) stop()
        else unlisten = stop
      })

    return () => {
      cancelled = true
      unlisten?.()
    }
  }, [])

  const button =
    'flex w-12 items-center justify-center text-paper/70 transition-colors hover:bg-paper/10 hover:text-paper'

  return (
    // -mr-5 cancels the TopBar's right padding so the buttons sit flush to the edge,
    // the way native window controls do.
    <div className="-mr-5 ml-2 flex items-stretch self-stretch">
      <button
        type="button"
        aria-label="Minimize"
        className={button}
        onClick={() => void getCurrentWindow().minimize()}
      >
        <Minus className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label={maximized ? 'Restore' : 'Maximize'}
        className={button}
        onClick={() => void getCurrentWindow().toggleMaximize()}
      >
        {maximized ? <Copy className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        aria-label="Close"
        className={`${button} hover:bg-signal hover:text-ink`}
        onClick={() => void getCurrentWindow().close()}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
