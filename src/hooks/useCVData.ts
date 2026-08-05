import { useMemo, useReducer } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type {
  CVData,
  CVSection,
  LanguagesArrangement,
  LanguagesDisplayStyle,
  PersonalDetail,
  SectionItem,
  SectionType,
  SkillsDisplayStyle,
} from '@/types'
import { createItem, createSection, generateId } from '@/constants'

// ---------- Sort helpers ----------

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

function dateSortValue(date: string): number {
  if (date === 'Present') return Infinity
  if (!date) return -Infinity
  const parsed = Date.parse(date.length === 7 ? `${date}-01` : date)
  return Number.isNaN(parsed) ? -Infinity : parsed
}

function itemLength(section: CVSection, item: SectionItem): number {
  if (section.type === 'certifications') {
    return (item as { name: string }).name.length
  }
  const description = (item as { description?: string }).description ?? ''
  return stripHtml(description).length
}

function compareBy(section: CVSection, sortKey: string, direction: 'asc' | 'desc') {
  return (a: SectionItem, b: SectionItem): number => {
    let result = 0
    switch (sortKey) {
      case 'Date': {
        const aItem = a as { startDate?: string; endDate?: string; date?: string }
        const bItem = b as { startDate?: string; endDate?: string; date?: string }
        const aVal = dateSortValue(aItem.endDate ?? aItem.date ?? '')
        const bVal = dateSortValue(bItem.endDate ?? bItem.date ?? '')
        result = aVal - bVal
        break
      }
      case 'Title':
        result = (a as { jobTitle?: string; title?: string }).jobTitle !== undefined
          ? (a as { jobTitle: string }).jobTitle.localeCompare((b as { jobTitle: string }).jobTitle)
          : (a as { title: string }).title.localeCompare((b as { title: string }).title)
        break
      case 'Degree':
        result = (a as { degree: string }).degree.localeCompare((b as { degree: string }).degree)
        break
      case 'Name':
        result = section.type === 'skills'
          ? (a as { skillName: string }).skillName.localeCompare((b as { skillName: string }).skillName)
          : section.type === 'projects'
            ? (a as { projectName: string }).projectName.localeCompare((b as { projectName: string }).projectName)
            : (a as { name: string }).name.localeCompare((b as { name: string }).name)
        break
      case 'Language':
        result = (a as { language: string }).language.localeCompare((b as { language: string }).language)
        break
      case 'Length':
        result = itemLength(section, a) - itemLength(section, b)
        break
      default:
        result = 0
    }
    return direction === 'asc' ? result : -result
  }
}

// ---------- Actions ----------

type Action =
  | { type: 'LOAD_DATA'; data: CVData }
  | { type: 'UPDATE_PERSONAL_INFO'; patch: Partial<{ name: string; jobTitle: string }> }
  | { type: 'ADD_DETAIL' }
  | { type: 'UPDATE_DETAIL'; id: string; patch: Partial<PersonalDetail> }
  | { type: 'DELETE_DETAIL'; id: string }
  | { type: 'REORDER_DETAILS'; activeId: string; overId: string }
  | { type: 'ADD_SECTION'; sectionType: SectionType; title?: string }
  | { type: 'UPDATE_SECTION_TITLE'; sectionId: string; title: string }
  | { type: 'TOGGLE_SECTION_VISIBILITY'; sectionId: string }
  | { type: 'TOGGLE_PAGE_BREAK'; sectionId: string }
  | { type: 'DUPLICATE_SECTION'; sectionId: string }
  | { type: 'DELETE_SECTION'; sectionId: string }
  | { type: 'REORDER_SECTIONS'; activeId: string; overId: string }
  | { type: 'SET_SKILLS_DISPLAY_STYLE'; sectionId: string; style: SkillsDisplayStyle }
  | { type: 'SET_LANGUAGES_DISPLAY_STYLE'; sectionId: string; style: LanguagesDisplayStyle }
  | { type: 'SET_LANGUAGES_ARRANGEMENT'; sectionId: string; arrangement: LanguagesArrangement }
  | { type: 'ADD_ITEM'; sectionId: string }
  | { type: 'UPDATE_ITEM'; sectionId: string; itemId: string; patch: Record<string, unknown> }
  | { type: 'DELETE_ITEM'; sectionId: string; itemId: string }
  | { type: 'DUPLICATE_ITEM'; sectionId: string; itemId: string }
  | { type: 'REORDER_ITEMS'; sectionId: string; activeId: string; overId: string }
  | { type: 'SORT_ITEMS'; sectionId: string; sortKey: string; direction: 'asc' | 'desc' }

function mapSection(data: CVData, sectionId: string, fn: (section: CVSection) => CVSection): CVData {
  return {
    ...data,
    sections: data.sections.map((s) => (s.id === sectionId ? fn(s) : s)),
  }
}

function cvReducer(data: CVData, action: Action): CVData {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.data

    case 'UPDATE_PERSONAL_INFO':
      return { ...data, personalInfo: { ...data.personalInfo, ...action.patch } }

    case 'ADD_DETAIL':
      return {
        ...data,
        personalInfo: {
          ...data.personalInfo,
          details: [
            ...data.personalInfo.details,
            { id: generateId(), label: 'Label:', value: 'Value' },
          ],
        },
      }

    case 'UPDATE_DETAIL':
      return {
        ...data,
        personalInfo: {
          ...data.personalInfo,
          details: data.personalInfo.details.map((d) =>
            d.id === action.id ? { ...d, ...action.patch } : d,
          ),
        },
      }

    case 'DELETE_DETAIL':
      return {
        ...data,
        personalInfo: {
          ...data.personalInfo,
          details: data.personalInfo.details.filter((d) => d.id !== action.id),
        },
      }

    case 'REORDER_DETAILS': {
      const details = data.personalInfo.details
      const oldIndex = details.findIndex((d) => d.id === action.activeId)
      const newIndex = details.findIndex((d) => d.id === action.overId)
      if (oldIndex === -1 || newIndex === -1) return data
      return {
        ...data,
        personalInfo: { ...data.personalInfo, details: arrayMove(details, oldIndex, newIndex) },
      }
    }

    case 'ADD_SECTION':
      return { ...data, sections: [...data.sections, createSection(action.sectionType, action.title)] }

    case 'UPDATE_SECTION_TITLE':
      return mapSection(data, action.sectionId, (s) => ({ ...s, title: action.title }))

    case 'TOGGLE_SECTION_VISIBILITY':
      return mapSection(data, action.sectionId, (s) => ({ ...s, visible: !s.visible }))

    case 'TOGGLE_PAGE_BREAK':
      return mapSection(data, action.sectionId, (s) => ({ ...s, pageBreakBefore: !s.pageBreakBefore }))

    case 'DUPLICATE_SECTION': {
      const index = data.sections.findIndex((s) => s.id === action.sectionId)
      if (index === -1) return data
      const original = data.sections[index]
      const clone: CVSection = {
        ...original,
        id: generateId(),
        title: `${original.title} (Copy)`,
        items: original.items.map((item) => ({ ...item, id: generateId() })) as never,
      }
      const sections = [...data.sections]
      sections.splice(index + 1, 0, clone)
      return { ...data, sections }
    }

    case 'DELETE_SECTION':
      return { ...data, sections: data.sections.filter((s) => s.id !== action.sectionId) }

    case 'REORDER_SECTIONS': {
      const oldIndex = data.sections.findIndex((s) => s.id === action.activeId)
      const newIndex = data.sections.findIndex((s) => s.id === action.overId)
      if (oldIndex === -1 || newIndex === -1) return data
      return { ...data, sections: arrayMove(data.sections, oldIndex, newIndex) }
    }

    case 'SET_SKILLS_DISPLAY_STYLE':
      return mapSection(data, action.sectionId, (s) =>
        s.type === 'skills' ? { ...s, displayStyle: action.style } : s,
      )

    case 'SET_LANGUAGES_DISPLAY_STYLE':
      return mapSection(data, action.sectionId, (s) =>
        s.type === 'languages' ? { ...s, displayStyle: action.style } : s,
      )

    case 'SET_LANGUAGES_ARRANGEMENT':
      return mapSection(data, action.sectionId, (s) =>
        s.type === 'languages' ? { ...s, arrangement: action.arrangement } : s,
      )

    case 'ADD_ITEM':
      return mapSection(
        data,
        action.sectionId,
        (s) => ({ ...s, items: [...s.items, createItem(s.type)] }) as CVSection,
      )

    case 'UPDATE_ITEM':
      return mapSection(
        data,
        action.sectionId,
        (s) =>
          ({
            ...s,
            items: s.items.map((item) =>
              item.id === action.itemId ? { ...item, ...action.patch } : item,
            ),
          }) as CVSection,
      )

    case 'DELETE_ITEM':
      return mapSection(
        data,
        action.sectionId,
        (s) => ({ ...s, items: s.items.filter((item) => item.id !== action.itemId) }) as CVSection,
      )

    case 'DUPLICATE_ITEM':
      return mapSection(data, action.sectionId, (s) => {
        const index = s.items.findIndex((item) => item.id === action.itemId)
        if (index === -1) return s
        const clone = { ...s.items[index], id: generateId() }
        const items = [...s.items]
        items.splice(index + 1, 0, clone)
        return { ...s, items } as CVSection
      })

    case 'REORDER_ITEMS':
      return mapSection(data, action.sectionId, (s) => {
        const oldIndex = s.items.findIndex((item) => item.id === action.activeId)
        const newIndex = s.items.findIndex((item) => item.id === action.overId)
        if (oldIndex === -1 || newIndex === -1) return s
        return { ...s, items: arrayMove(s.items as SectionItem[], oldIndex, newIndex) } as CVSection
      })

    case 'SORT_ITEMS':
      return mapSection(
        data,
        action.sectionId,
        (s) => ({ ...s, items: [...s.items].sort(compareBy(s, action.sortKey, action.direction)) }) as CVSection,
      )

    default:
      return data
  }
}

export function useCVData(initial: CVData) {
  const [data, dispatch] = useReducer(cvReducer, initial)

  const actions = useMemo(
    () => ({
      loadData: (d: CVData) => dispatch({ type: 'LOAD_DATA', data: d }),
      updatePersonalInfo: (patch: Partial<{ name: string; jobTitle: string }>) =>
        dispatch({ type: 'UPDATE_PERSONAL_INFO', patch }),
      addDetail: () => dispatch({ type: 'ADD_DETAIL' }),
      updateDetail: (id: string, patch: Partial<PersonalDetail>) =>
        dispatch({ type: 'UPDATE_DETAIL', id, patch }),
      deleteDetail: (id: string) => dispatch({ type: 'DELETE_DETAIL', id }),
      reorderDetails: (activeId: string, overId: string) =>
        dispatch({ type: 'REORDER_DETAILS', activeId, overId }),
      addSection: (sectionType: SectionType, title?: string) =>
        dispatch({ type: 'ADD_SECTION', sectionType, title }),
      updateSectionTitle: (sectionId: string, title: string) =>
        dispatch({ type: 'UPDATE_SECTION_TITLE', sectionId, title }),
      toggleSectionVisibility: (sectionId: string) =>
        dispatch({ type: 'TOGGLE_SECTION_VISIBILITY', sectionId }),
      togglePageBreak: (sectionId: string) => dispatch({ type: 'TOGGLE_PAGE_BREAK', sectionId }),
      duplicateSection: (sectionId: string) => dispatch({ type: 'DUPLICATE_SECTION', sectionId }),
      deleteSection: (sectionId: string) => dispatch({ type: 'DELETE_SECTION', sectionId }),
      reorderSections: (activeId: string, overId: string) =>
        dispatch({ type: 'REORDER_SECTIONS', activeId, overId }),
      setSkillsDisplayStyle: (sectionId: string, style: SkillsDisplayStyle) =>
        dispatch({ type: 'SET_SKILLS_DISPLAY_STYLE', sectionId, style }),
      setLanguagesDisplayStyle: (sectionId: string, style: LanguagesDisplayStyle) =>
        dispatch({ type: 'SET_LANGUAGES_DISPLAY_STYLE', sectionId, style }),
      setLanguagesArrangement: (sectionId: string, arrangement: LanguagesArrangement) =>
        dispatch({ type: 'SET_LANGUAGES_ARRANGEMENT', sectionId, arrangement }),
      addItem: (sectionId: string) => dispatch({ type: 'ADD_ITEM', sectionId }),
      updateItem: (sectionId: string, itemId: string, patch: Record<string, unknown>) =>
        dispatch({ type: 'UPDATE_ITEM', sectionId, itemId, patch }),
      deleteItem: (sectionId: string, itemId: string) =>
        dispatch({ type: 'DELETE_ITEM', sectionId, itemId }),
      duplicateItem: (sectionId: string, itemId: string) =>
        dispatch({ type: 'DUPLICATE_ITEM', sectionId, itemId }),
      reorderItems: (sectionId: string, activeId: string, overId: string) =>
        dispatch({ type: 'REORDER_ITEMS', sectionId, activeId, overId }),
      sortItems: (sectionId: string, sortKey: string, direction: 'asc' | 'desc') =>
        dispatch({ type: 'SORT_ITEMS', sectionId, sortKey, direction }),
    }),
    [],
  )

  return [data, actions] as const
}

export type CVDataActions = ReturnType<typeof useCVData>[1]
