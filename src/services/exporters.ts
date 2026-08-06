import type { CVData, StyleConfig } from '@/types'
import { PAGE_PX } from '@/constants'
import { sanitizeFileName } from '@/services/cvStore'
import { isDesktop, openTextFile, savePdf, saveTextFile } from '@/services/platform'

/** `PAGE_PX` is expressed in CSS pixels; print APIs want inches. */
const CSS_PX_PER_INCH = 96

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Strips the preview-only offscreen measurement pass from a cloned preview root. */
function stripCommonChrome(clone: HTMLElement): void {
  clone.querySelectorAll('.cv-measure').forEach((el) => el.remove())
}

function collectInlineStyles(): string {
  const chunks: string[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = Array.from(sheet.cssRules ?? [])
        .map((r) => r.cssText)
        .join('\n')
      chunks.push(rules)
    } catch {
      // Cross-origin stylesheet (e.g. Google Fonts) — its rules aren't needed inline.
    }
  }
  return chunks.join('\n')
}

function collectFontLinks(): string {
  return Array.from(document.querySelectorAll('link[href*="fonts.googleapis.com"]'))
    .map((link) => link.outerHTML)
    .join('\n')
}

function buildStandaloneDocument(clone: HTMLElement, title: string, extraCss: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
${collectFontLinks()}
<style>${collectInlineStyles()}</style>
<style>${extraCss}</style>
</head>
<body>
${clone.outerHTML}
</body>
</html>`
}

/**
 * Prints the live document directly via the browser's own print engine — real vector text,
 * exact same DOM/CSS as the preview, so output stays crisp at any zoom and matches the preview
 * pixel-for-pixel. `.cv-content` is isolated from the rest of the app and the fit-to-container
 * scale transform is neutralized by the `@media print` rules in `index.css`; the exact page
 * size comes from the `@page` rule `CVPreview` keeps in sync with the selected paper size.
 *
 * This intentionally does NOT render into a detached clone or hidden iframe (an earlier version
 * did): browser extensions — ad blockers in particular — commonly strip off-screen "hidden
 * iframe" elements on sight, which silently broke that approach for some users. Calling
 * `window.print()` synchronously, directly from the click handler, on the real document is the
 * one thing guaranteed not to be blocked.
 *
 * Trade-off: this opens the system print dialog rather than silently downloading a file, and
 * the user should turn off "Headers and footers" there (a print-dialog setting, not something
 * CSS can control) for a clean page.
 */
export function printCv(name: string): void {
  const previousTitle = document.title
  const restoreTitle = () => {
    document.title = previousTitle
    window.removeEventListener('afterprint', restoreTitle)
  }
  document.title = sanitizeFileName(name)
  window.addEventListener('afterprint', restoreTitle)
  window.print()
}

/**
 * Writes a PDF straight to a path the user picks, with no print dialog in the way.
 *
 * Desktop only — this goes through WebView2's own print engine, so output still
 * honours the `@media print` rules and the `@page` size `CVPreview` keeps in sync,
 * but "Headers and footers" and background printing are fixed in code rather than
 * left as settings the user has to find. Resolves `false` if the user cancels.
 */
export async function exportPdf(name: string, style: StyleConfig): Promise<boolean> {
  const [widthPx, heightPx] = PAGE_PX[style.paperSize]
  const saved = await savePdf({
    defaultName: `${sanitizeFileName(name)}.pdf`,
    widthIn: widthPx / CSS_PX_PER_INCH,
    heightIn: heightPx / CSS_PX_PER_INCH,
  })
  return saved !== null
}

export async function exportHtml(previewRoot: HTMLElement, name: string): Promise<void> {
  const clone = previewRoot.cloneNode(true) as HTMLElement
  stripCommonChrome(clone)

  const printCss = `
    @media print {
      body { margin: 0; }
      .cv-page { page-break-after: always; }
      .cv-page:last-child { page-break-after: auto; }
    }
  `
  const html = buildStandaloneDocument(clone, name, printCss)
  const filename = `${sanitizeFileName(name)}.html`

  if (isDesktop()) {
    await saveTextFile({
      defaultName: filename,
      filterName: 'HTML Document',
      extensions: ['html'],
      contents: html,
    })
    return
  }
  download(new Blob([html], { type: 'text/html' }), filename)
}

export async function exportJson(
  name: string,
  data: CVData,
  style: StyleConfig,
): Promise<void> {
  const payload = JSON.stringify({ name, data, style }, null, 2)
  const filename = `${sanitizeFileName(name)}.json`

  if (isDesktop()) {
    await saveTextFile({
      defaultName: filename,
      filterName: 'CV JSON',
      extensions: ['json'],
      contents: payload,
    })
    return
  }
  download(new Blob([payload], { type: 'application/json' }), filename)
}

interface ImportedCV {
  name: string
  data: CVData
  style: StyleConfig
}

/** Deliberately shallow — same check (and same blind spots) the browser path always had. */
function parseImportedCV(text: string): ImportedCV {
  let parsed: { name?: unknown; data?: unknown; style?: unknown } | null
  try {
    // Windows editors (Notepad, PowerShell's Set-Content) prepend a UTF-8 BOM on save.
    // JSON.parse chokes on it, which surfaced as a misleading "file may be corrupted"
    // error on files that were otherwise perfectly valid.
    parsed = JSON.parse(text.replace(/^\uFEFF/, ''))
  } catch {
    throw new Error('Invalid CV file.')
  }
  if (!parsed?.name || !parsed?.data || !parsed?.style) {
    throw new Error('Invalid CV file.')
  }
  return parsed as ImportedCV
}

export function importJsonFile(file: File): Promise<ImportedCV> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(parseImportedCV(reader.result as string))
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Could not read file.'))
    reader.readAsText(file)
  })
}

/** Desktop only: native Open dialog. Resolves `null` if the user cancels. */
export async function importJsonNative(): Promise<ImportedCV | null> {
  const text = await openTextFile({ filterName: 'CV JSON', extensions: ['json'] })
  if (text === null) return null
  return parseImportedCV(text)
}
