import { DEFAULT_STYLE, generateId } from '@/constants'
import type { CVData, SavedCV, StyleConfig, WipSnapshot } from '@/types'

const SAVED_CVS_KEY = 'cv-builder-app-data'
const WIP_KEY = 'cv-builder-app-wip'
const WIP_DEBOUNCE_MS = 500

export function mergeStyleWithDefaults(style: Partial<StyleConfig> | undefined): StyleConfig {
  return { ...DEFAULT_STYLE, ...style }
}

export function loadSavedCVs(): SavedCV[] {
  try {
    const raw = localStorage.getItem(SAVED_CVS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((cv: SavedCV) => ({ ...cv, style: mergeStyleWithDefaults(cv.style) }))
  } catch {
    return []
  }
}

function persistSavedCVs(list: SavedCV[]): void {
  localStorage.setItem(SAVED_CVS_KEY, JSON.stringify(list))
}

export function getMostRecentCV(list: SavedCV[]): SavedCV | undefined {
  return [...list].sort((a, b) => b.lastModified - a.lastModified)[0]
}

/**
 * Saves the given CV. Overwrites the entry in place if `activeCVId` matches an
 * existing saved CV; otherwise appends a new entry and returns its fresh id.
 */
export function saveCV(
  name: string,
  data: CVData,
  style: StyleConfig,
  activeCVId: string | null,
): { list: SavedCV[]; id: string } {
  const list = loadSavedCVs()
  const now = Date.now()

  if (activeCVId) {
    const index = list.findIndex((cv) => cv.id === activeCVId)
    if (index !== -1) {
      const updated = [...list]
      updated[index] = { id: activeCVId, name, data, style, lastModified: now }
      persistSavedCVs(updated)
      return { list: updated, id: activeCVId }
    }
  }

  const id = generateId()
  const updated = [...list, { id, name, data, style, lastModified: now }]
  persistSavedCVs(updated)
  return { list: updated, id }
}

export function deleteCV(id: string): SavedCV[] {
  const updated = loadSavedCVs().filter((cv) => cv.id !== id)
  persistSavedCVs(updated)
  return updated
}

export function loadWip(): WipSnapshot | null {
  try {
    const raw = localStorage.getItem(WIP_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.data || !parsed.style) return null
    return { ...parsed, style: mergeStyleWithDefaults(parsed.style) }
  } catch {
    return null
  }
}

function persistWip(snapshot: WipSnapshot): void {
  localStorage.setItem(WIP_KEY, JSON.stringify(snapshot))
}

let wipTimer: ReturnType<typeof setTimeout> | undefined

/** Debounced (500ms) auto-save of the work-in-progress snapshot. */
export function scheduleSaveWip(snapshot: WipSnapshot): void {
  if (wipTimer) clearTimeout(wipTimer)
  wipTimer = setTimeout(() => persistWip(snapshot), WIP_DEBOUNCE_MS)
}

export function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  return cleaned || 'cv'
}
