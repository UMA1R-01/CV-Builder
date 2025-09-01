

import { useReducer, useCallback } from 'react';
import { CVData, CVSection, CVEntry, SectionType, SortKey, PersonalInfoItem } from '../types';
import { DEFAULT_CV_DATA, generateId } from '../constants';

type Action =
    | { type: 'LOAD_DATA'; payload: CVData }
    | { type: 'UPDATE_PERSONAL_INFO'; payload: { field: string; value: string } }
    | { type: 'ADD_PERSONAL_INFO_ITEM' }
    | { type: 'DELETE_PERSONAL_INFO_ITEM'; payload: { itemId: string } }
    | { type: 'UPDATE_PERSONAL_INFO_ITEM'; payload: { itemId: string; newValues: Partial<PersonalInfoItem> } }
    | { type: 'MOVE_PERSONAL_INFO_ITEM'; payload: { fromIndex: number; toIndex: number } }
    | { type: 'ADD_SECTION'; payload: { title: string; type: SectionType } }
    | { type: 'DELETE_SECTION'; payload: { sectionId: string } }
    | { type: 'DUPLICATE_SECTION'; payload: { sectionId: string } }
    | { type: 'UPDATE_SECTION'; payload: { sectionId: string; newValues: Partial<CVSection> } }
    | { type: 'MOVE_SECTION'; payload: { fromIndex: number; toIndex: number } }
    | { type: 'ADD_ITEM'; payload: { sectionId: string } }
    | { type: 'DELETE_ITEM'; payload: { sectionId: string; itemId: string } }
    | { type: 'DUPLICATE_ITEM'; payload: { sectionId: string; itemId: string } }
    | { type: 'UPDATE_ITEM'; payload: { sectionId: string; itemId: string; newValues: Partial<CVEntry> } }
    | { type: 'MOVE_ITEM'; payload: { sectionId: string; fromIndex: number; toIndex: number } }
    | { type: 'SORT_ITEMS'; payload: { sectionId: string; key: SortKey; direction: 'asc' | 'desc' } };

const createNewItem = (type: SectionType): CVEntry => {
    const id = generateId();
    switch (type) {
        case 'Work Experience': return { id, jobTitle: 'New Job', jobTitleLink: '', jobTitleExtra: '', company: 'Company', companyLink: '', companyExtra: '', location: 'City, State', startDate: '2024-01-01', endDate: 'Present', description: '<ul><li>Describe your role and achievements.</li></ul>' };
        case 'Education': return { id, degree: 'New Degree', degreeLink: '', degreeExtra: '', institution: 'Institution', institutionLink: '', institutionExtra: '', location: 'City, State', startDate: '2020-01-01', endDate: '2024-01-01', description: '<p>Additional details about your education.</p>' };
        case 'Skills': return { id, skillName: 'New Skill', level: '', category: '', description: '' };
        case 'Projects': return { id, projectName: 'New Project', projectNameLink: '', projectNameExtra: '', link: '', description: '<p>A brief description of the project.</p>' };
        case 'Certifications': return { id, name: 'New Certification', nameLink: '', nameExtra: '', issuer: 'Issuer', date: '2024-01-01' };
        case 'Languages': return { id, language: 'New Language', level: 'Intermediate' };
        default: return { id, title: 'New Entry', titleLink: '', titleExtra: '', description: '<p>Description of this custom entry.</p>' };
    }
};

const createNewPersonalInfoItem = (): PersonalInfoItem => ({
    id: generateId(),
    label: 'New Detail:',
    value: 'Your detail here'
});


const cvReducer = (state: CVData, action: Action): CVData => {
    switch (action.type) {
        case 'LOAD_DATA':
            return action.payload;
        case 'UPDATE_PERSONAL_INFO':
            return {
                ...state,
                personalInfo: {
                    ...state.personalInfo,
                    [action.payload.field]: action.payload.value,
                },
            };
        case 'ADD_PERSONAL_INFO_ITEM':
            return {
                ...state,
                personalInfo: {
                    ...state.personalInfo,
                    details: [...state.personalInfo.details, createNewPersonalInfoItem()],
                },
            };
        case 'DELETE_PERSONAL_INFO_ITEM':
            return {
                ...state,
                personalInfo: {
                    ...state.personalInfo,
                    details: state.personalInfo.details.filter(d => d.id !== action.payload.itemId),
                },
            };
        case 'UPDATE_PERSONAL_INFO_ITEM':
             return {
                ...state,
                personalInfo: {
                    ...state.personalInfo,
                    details: state.personalInfo.details.map(d => 
                        d.id === action.payload.itemId ? { ...d, ...action.payload.newValues } : d
                    ),
                },
            };
        case 'MOVE_PERSONAL_INFO_ITEM': {
            const { fromIndex, toIndex } = action.payload;
            const newDetails = Array.from(state.personalInfo.details);
            const [moved] = newDetails.splice(fromIndex, 1);
            newDetails.splice(toIndex, 0, moved);
            return { ...state, personalInfo: { ...state.personalInfo, details: newDetails } };
        }
        case 'ADD_SECTION': {
            const { title, type } = action.payload;
            const newSection: CVSection = {
                id: generateId(),
                title: title,
                type: type,
                items: [createNewItem(type)],
                visible: true,
                layout: 'bullets', // default
            };

            if (type === 'Skills') {
                newSection.layout = 'chips';
            } else if (type === 'Languages') {
                newSection.layout = 'compact';
                newSection.displayStyle = 'inline';
            }

            return { ...state, sections: [...state.sections, newSection] };
        }
        case 'DELETE_SECTION': {
            return { ...state, sections: state.sections.filter(s => s.id !== action.payload.sectionId) };
        }
        case 'DUPLICATE_SECTION': {
            const sectionToDuplicate = state.sections.find(s => s.id === action.payload.sectionId);
            if (!sectionToDuplicate) return state;
            const duplicatedSection = { 
                ...sectionToDuplicate, 
                id: generateId(), 
                title: `${sectionToDuplicate.title} (Copy)`,
                items: sectionToDuplicate.items.map(item => ({...item, id: generateId()}))
            };
            const index = state.sections.findIndex(s => s.id === action.payload.sectionId);
            const newSections = [...state.sections];
            newSections.splice(index + 1, 0, duplicatedSection);
            return { ...state, sections: newSections };
        }
        case 'UPDATE_SECTION': {
            return {
                ...state,
                sections: state.sections.map(s => s.id === action.payload.sectionId ? { ...s, ...action.payload.newValues } : s)
            };
        }
        case 'MOVE_SECTION': {
            const { fromIndex, toIndex } = action.payload;
            const newSections = Array.from(state.sections);
            const [moved] = newSections.splice(fromIndex, 1);
            newSections.splice(toIndex, 0, moved);
            return { ...state, sections: newSections };
        }
        case 'ADD_ITEM': {
            return {
                ...state,
                sections: state.sections.map(s => {
                    if (s.id === action.payload.sectionId) {
                        return { ...s, items: [...s.items, createNewItem(s.type)] };
                    }
                    return s;
                }),
            };
        }
        case 'DELETE_ITEM': {
            return {
                ...state,
                sections: state.sections.map(s => {
                    if (s.id === action.payload.sectionId) {
                        return { ...s, items: s.items.filter(i => i.id !== action.payload.itemId) };
                    }
                    return s;
                }),
            };
        }
        case 'DUPLICATE_ITEM': {
            const { sectionId, itemId } = action.payload;
            return {
                ...state,
                sections: state.sections.map(s => {
                    if (s.id === sectionId) {
                        const itemIndex = s.items.findIndex(i => i.id === itemId);
                        if (itemIndex > -1) {
                            const itemToDuplicate = s.items[itemIndex];
                            const duplicatedItem = { ...itemToDuplicate, id: generateId() };
                            const newItems = [...s.items];
                            newItems.splice(itemIndex + 1, 0, duplicatedItem);
                            return { ...s, items: newItems };
                        }
                    }
                    return s;
                }),
            };
        }
        case 'UPDATE_ITEM': {
            return {
                ...state,
                sections: state.sections.map(s => {
                    if (s.id === action.payload.sectionId) {
                        return {
                            ...s,
                            items: s.items.map(i => i.id === action.payload.itemId ? { ...i, ...action.payload.newValues } : i)
                        };
                    }
                    return s;
                }),
            };
        }
        case 'MOVE_ITEM': {
            const { sectionId, fromIndex, toIndex } = action.payload;
            return {
                ...state,
                sections: state.sections.map(s => {
                    if (s.id === sectionId) {
                        const newItems = Array.from(s.items);
                        const [moved] = newItems.splice(fromIndex, 1);
                        newItems.splice(toIndex, 0, moved);
                        return { ...s, items: newItems };
                    }
                    return s;
                }),
            };
        }
        case 'SORT_ITEMS': {
             const { sectionId, key, direction } = action.payload;
             return {
                 ...state,
                 sections: state.sections.map(s => {
                     if (s.id === sectionId) {
                         const sortedItems = [...s.items].sort((a, b) => {
                             
                            if (key === 'descriptionLength') {
                                const cleanText = (html: string) => html ? String(html).replace(/<[^>]*>?/gm, '') : '';
                                
                                const getLength = (item: CVEntry): number => {
                                    // For Certifications, use the 'name' field
                                    if (s.type === 'Certifications' && 'name' in item && typeof item.name === 'string') {
                                        return cleanText(item.name).length;
                                    }
                                    // For other types with a 'description' field
                                    if ('description' in item && typeof item.description === 'string') {
                                        return cleanText(item.description).length;
                                    }
                                    return 0;
                                };

                                const lenA = getLength(a);
                                const lenB = getLength(b);
                                return direction === 'asc' ? lenA - lenB : lenB - lenA;
                            }

                             const valA = a[key];
                             const valB = b[key];

                             if (valA === undefined || valB === undefined) return 0;

                             // Handle dates (e.g., 'startDate', 'endDate', 'date')
                             if (key.toLowerCase().includes('date')) {
                                const isAPresent = valA === 'Present';
                                const isBPresent = valB === 'Present';

                                if (isAPresent && isBPresent) return 0;
                                if (isAPresent) return direction === 'desc' ? -1 : 1;
                                if (isBPresent) return direction === 'desc' ? 1 : -1;
                                
                                const dateA = new Date(valA).getTime();
                                const dateB = new Date(valB).getTime();
                                if (isNaN(dateA) || isNaN(dateB)) return 0;
                                return direction === 'desc' ? dateB - dateA : dateA - dateB;
                             }
                             
                             // Handle strings for alphabetical sorting
                             if(typeof valA === 'string' && typeof valB === 'string') {
                                 const comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
                                 return direction === 'asc' ? comparison : -comparison;
                             }

                             return 0;
                         });
                         return { ...s, items: sortedItems };
                     }
                     return s;
                 }),
             };
        }
        default:
            return state;
    }
};

export const useCVData = () => {
    const [cvData, dispatch] = useReducer(cvReducer, DEFAULT_CV_DATA);

    const actions = {
        loadData: useCallback((data: CVData) => dispatch({ type: 'LOAD_DATA', payload: data }), []),
        updatePersonalInfo: useCallback((field: string, value: string) => dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: { field, value } }), []),
        addPersonalInfoItem: useCallback(() => dispatch({ type: 'ADD_PERSONAL_INFO_ITEM' }), []),
        deletePersonalInfoItem: useCallback((itemId: string) => dispatch({ type: 'DELETE_PERSONAL_INFO_ITEM', payload: { itemId } }), []),
        updatePersonalInfoItem: useCallback((itemId: string, newValues: Partial<PersonalInfoItem>) => dispatch({ type: 'UPDATE_PERSONAL_INFO_ITEM', payload: { itemId, newValues } }), []),
        movePersonalInfoItem: useCallback((fromIndex: number, toIndex: number) => dispatch({ type: 'MOVE_PERSONAL_INFO_ITEM', payload: { fromIndex, toIndex } }), []),
        addSection: useCallback((title: string, type: SectionType) => dispatch({ type: 'ADD_SECTION', payload: { title, type } }), []),
        deleteSection: useCallback((sectionId: string) => dispatch({ type: 'DELETE_SECTION', payload: { sectionId } }), []),
        duplicateSection: useCallback((sectionId: string) => dispatch({ type: 'DUPLICATE_SECTION', payload: { sectionId } }), []),
        updateSection: useCallback((sectionId: string, newValues: Partial<CVSection>) => dispatch({ type: 'UPDATE_SECTION', payload: { sectionId, newValues } }), []),
        moveSection: useCallback((fromIndex: number, toIndex: number) => dispatch({ type: 'MOVE_SECTION', payload: { fromIndex, toIndex } }), []),
        addItem: useCallback((sectionId: string) => dispatch({ type: 'ADD_ITEM', payload: { sectionId } }), []),
        deleteItem: useCallback((sectionId: string, itemId: string) => dispatch({ type: 'DELETE_ITEM', payload: { sectionId, itemId } }), []),
        duplicateItem: useCallback((sectionId: string, itemId: string) => dispatch({ type: 'DUPLICATE_ITEM', payload: { sectionId, itemId } }), []),
        updateItem: useCallback((sectionId: string, itemId: string, newValues: Partial<CVEntry>) => dispatch({ type: 'UPDATE_ITEM', payload: { sectionId, itemId, newValues } }), []),
        moveItem: useCallback((sectionId: string, fromIndex: number, toIndex: number) => dispatch({ type: 'MOVE_ITEM', payload: { sectionId, fromIndex, toIndex } }), []),
        sortItems: useCallback((sectionId: string, key: SortKey, direction: 'asc' | 'desc') => dispatch({type: 'SORT_ITEMS', payload: { sectionId, key, direction }}), []),
    };

    return { cvData, actions };
};