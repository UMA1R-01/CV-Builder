import { invoke, isTauri } from '@tauri-apps/api/core'

/**
 * Thin bridge to the Tauri desktop shell.
 *
 * This app still ships as a plain web build, so every caller has to keep working
 * without a shell behind it — treat `isDesktop()` as the gate and always leave a
 * browser fallback in place rather than assuming these commands exist.
 *
 * Each command opens a native dialog and, for saves, writes the file itself; the
 * frontend never gets an arbitrary write-any-path capability.
 * All of them resolve to `null` when the user cancels the dialog.
 */
export function isDesktop(): boolean {
  return isTauri()
}

export function saveTextFile(options: {
  defaultName: string
  filterName: string
  extensions: string[]
  contents: string
}): Promise<string | null> {
  return invoke<string | null>('save_text_file', options)
}

export function openTextFile(options: {
  filterName: string
  extensions: string[]
}): Promise<string | null> {
  return invoke<string | null>('open_text_file', options)
}

/** Renders the live document to PDF through WebView2's print engine. */
export function savePdf(options: {
  defaultName: string
  widthIn: number
  heightIn: number
}): Promise<string | null> {
  return invoke<string | null>('save_pdf', options)
}
