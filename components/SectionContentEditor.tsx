import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CVSection, CVEntry, WorkExperienceEntry, EducationEntry, SkillEntry, ProjectEntry, CertificationEntry, LanguageEntry, CustomEntry, SortKey } from '../types';
import { useCVData } from '../hooks/useCVData';
import { GripVerticalIcon, TrashIcon, ChevronDownIcon, PlusIcon, CopyIcon, EyeIcon, EyeSlashIcon, BoldIcon, ItalicIcon, UnderlineIcon, ListBulletIcon, PageBreakIcon } from './Icons';

// --- Rich Text Editor Component ---

interface RichTextEditorProps {
    value: string;
    onChange: (newValue: string) => void;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    // This effect synchronizes the editor's content with the `value` prop.
    // It's designed to prevent the cursor from jumping during user input by only
    // updating the DOM when the `value` prop is truly different from the editor's
    // current content. This handles cases like loading new data.
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = useCallback((event: React.FormEvent<HTMLDivElement>) => {
        // We call onChange to update the parent state with the new HTML content.
        // The useEffect above will prevent a re-render from resetting the cursor.
        onChange(event.currentTarget.innerHTML);
    }, [onChange]);
    
    const execCmd = (command: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false);
            // After executing a command, the innerHTML is changed, so we must
            // notify the parent component to keep the state in sync.
            onChange(editorRef.current.innerHTML);
        }
    };

    const ToolbarButton = ({ cmd, children, title }: { cmd: string; children: React.ReactNode; title: string; }) => (
        <button
            type="button"
            // Use onMouseDown to prevent the editor from losing focus and text selection.
            onMouseDown={(e) => {
                e.preventDefault();
                execCmd(cmd);
            }}
            className="p-2 rounded text-gray-400 hover:bg-gray-600 hover:text-white transition-colors"
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div className="border border-gray-500 rounded-md shadow-sm bg-gray-800 font-mono-code">
            <div className="toolbar flex items-center p-1 border-b border-gray-700">
                <ToolbarButton cmd="bold" title="Bold"><BoldIcon className="w-4 h-4" /></ToolbarButton>
                <ToolbarButton cmd="italic" title="Italic"><ItalicIcon className="w-4 h-4" /></ToolbarButton>
                <ToolbarButton cmd="underline" title="Underline"><UnderlineIcon className="w-4 h-4" /></ToolbarButton>
                <ToolbarButton cmd="insertUnorderedList" title="Bulleted List"><ListBulletIcon className="w-4 h-4" /></ToolbarButton>
            </div>
            <div
                ref={editorRef}
                contentEditable={true}
                onInput={handleInput}
                className="prose min-h-[120px] max-w-none w-full p-3 text-sm focus:outline-none resize-y overflow-auto"
                // The `dangerouslySetInnerHTML` prop is intentionally omitted here.
                // It was the root cause of the cursor jumping issue because it re-rendered
                // the content on every keystroke. The `useEffect` hook above is now
                // solely responsible for synchronizing the editor's content.
                aria-label="Description editor"
                data-placeholder={placeholder}
                style={{
                    '--tw-prose-body': '#d1d5db', // gray-300
                    '--tw-prose-bold': '#ffffff',
                    '--tw-prose-bullets': '#9ca3af', // gray-400
                    '--tw-prose-links': '#93c5fd', // blue-300
                    '--tw-prose-headings': '#f9fafb', // gray-50
                    color: '#d1d5db', // fallback text color
                } as React.CSSProperties}
            />
        </div>
    );
};


// --- Main Section Editor Components ---

interface ItemEditorProps {
    section: CVSection;
    item: CVEntry;
    actions: ReturnType<typeof useCVData>['actions'];
}

const ItemEditor: React.FC<ItemEditorProps> = ({ section, item, actions }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    const [isExpanded, setIsExpanded] = useState(true);

    const updateItem = (newValues: Partial<CVEntry>) => {
        actions.updateItem(section.id, item.id, newValues);
    };

    const renderFields = () => {
        const commonInputClass = "block w-full p-2 text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500";
        const updateItemField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => updateItem({ [e.target.name]: e.target.value });

        const renderDescriptionField = (value: string) => (
             <>
                <label className="block text-xs font-medium text-gray-500 mt-2">Description</label>
                <div className="mt-1">
                     <RichTextEditor
                        value={value}
                        onChange={(newValue) => updateItem({ description: newValue })}
                        placeholder="Describe your role and achievements..."
                    />
                </div>
            </>
        );

        switch (section.type) {
            case 'Work Experience': {
                const workItem = item as WorkExperienceEntry;
                const isPresent = workItem.endDate?.toLowerCase() === 'present';
                return (
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Job Title</label>
                            <input name="jobTitle" value={workItem.jobTitle} onChange={updateItemField} className={commonInputClass} placeholder="Job Title" />
                            <div className="grid grid-cols-2 gap-2">
                                <input name="jobTitleLink" value={workItem.jobTitleLink || ''} onChange={updateItemField} className={commonInputClass} placeholder="Link (e.g., example.com)"/>
                                <input name="jobTitleExtra" value={workItem.jobTitleExtra || ''} onChange={updateItemField} className={commonInputClass} placeholder="Extra text (e.g., Contractor)"/>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Company</label>
                            <input name="company" value={workItem.company} onChange={updateItemField} className={commonInputClass} placeholder="Company" />
                            <div className="grid grid-cols-2 gap-2">
                                <input name="companyLink" value={workItem.companyLink || ''} onChange={updateItemField} className={commonInputClass} placeholder="Link (e.g., example.com)"/>
                                <input name="companyExtra" value={workItem.companyExtra || ''} onChange={updateItemField} className={commonInputClass} placeholder="Extra text (e.g., Acquired)"/>
                            </div>
                        </div>
                         <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Location</label>
                            <input name="location" value={workItem.location} onChange={updateItemField} className={commonInputClass} placeholder="Location (e.g., City, Country)" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                                <input name="startDate" type="date" value={workItem.startDate} onChange={updateItemField} className={commonInputClass} />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1 h-[18px]">
                                     <label className="block text-xs font-medium text-gray-500">End Date</label>
                                     <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={isPresent}
                                            onChange={(e) => updateItem({ endDate: e.target.checked ? 'Present' : '' })}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Present
                                    </label>
                                </div>
                                <input
                                    name="endDate"
                                    type="date"
                                    value={isPresent ? '' : workItem.endDate}
                                    disabled={isPresent}
                                    onChange={updateItemField}
                                    className={`${commonInputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                />
                            </div>
                        </div>
                        {renderDescriptionField(workItem.description)}
                    </div>
                );
            }
            case 'Education': {
                const eduItem = item as EducationEntry;
                const isOngoing = eduItem.endDate?.toLowerCase() === 'present';
                return (
                     <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Degree/Certificate</label>
                            <input name="degree" value={eduItem.degree} onChange={updateItemField} className={commonInputClass} placeholder="Degree/Certificate" />
                            <div className="grid grid-cols-2 gap-2">
                                <input name="degreeLink" value={eduItem.degreeLink || ''} onChange={updateItemField} className={commonInputClass} placeholder="Link (optional)"/>
                                <input name="degreeExtra" value={eduItem.degreeExtra || ''} onChange={updateItemField} className={commonInputClass} placeholder="Extra text (e.g., With Honors)"/>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Institution</label>
                            <input name="institution" value={eduItem.institution} onChange={updateItemField} className={commonInputClass} placeholder="Institution" />
                            <div className="grid grid-cols-2 gap-2">
                                <input name="institutionLink" value={eduItem.institutionLink || ''} onChange={updateItemField} className={commonInputClass} placeholder="Link (optional)"/>
                                <input name="institutionExtra" value={eduItem.institutionExtra || ''} onChange={updateItemField} className={commonInputClass} placeholder="Extra text (optional)"/>
                            </div>
                        </div>
                         <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Location</label>
                            <input name="location" value={eduItem.location} onChange={updateItemField} className={commonInputClass} placeholder="Location (e.g., City, Country)" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                                <input name="startDate" type="date" value={eduItem.startDate} onChange={updateItemField} className={commonInputClass} />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1 h-[18px]">
                                    <label className="block text-xs font-medium text-gray-500">End Date</label>
                                    <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={isOngoing}
                                            onChange={(e) => updateItem({ endDate: e.target.checked ? 'Present' : '' })}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Ongoing
                                    </label>
                                </div>
                                <input
                                    name="endDate"
                                    type="date"
                                    value={isOngoing ? '' : eduItem.endDate}
                                    disabled={isOngoing}
                                    onChange={updateItemField}
                                    className={`${commonInputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                />
                            </div>
                        </div>
                        {renderDescriptionField(eduItem.description)}
                    </div>
                );
            }
            case 'Skills': {
                const skillItem = item as SkillEntry;
                return (
                    <div className="grid grid-cols-3 gap-2">
                        <input name="skillName" value={skillItem.skillName} onChange={updateItemField} className={commonInputClass} placeholder="Skill Name" />
                        <select name="level" value={skillItem.level || ''} className={commonInputClass} onChange={updateItemField}>
                            <option value="">-- No Level --</option>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                            <option>Expert</option>
                        </select>
                        <input name="category" value={skillItem.category || ''} onChange={(e) => updateItem({ category: e.target.value })} className={commonInputClass} placeholder="Category (optional)" />
                        <div className="col-span-3 mt-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Description (optional)</label>
                            <input
                                name="description"
                                value={skillItem.description || ''}
                                onChange={updateItemField}
                                className={commonInputClass}
                                placeholder="e.g., Proficient in hooks, context, and performance optimization."
                            />
                        </div>
                    </div>
                );
            }
            case 'Projects': {
                const projItem = item as ProjectEntry;
                return (
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Project Name</label>
                            <input name="projectName" value={projItem.projectName} onChange={updateItemField} className={commonInputClass} placeholder="Project Name" />
                            <div className="grid grid-cols-2 gap-2">
                                <input name="projectNameLink" value={projItem.projectNameLink || ''} onChange={updateItemField} className={commonInputClass} placeholder="Link (optional)"/>
                                <input name="projectNameExtra" value={projItem.projectNameExtra || ''} onChange={updateItemField} className={commonInputClass} placeholder="Extra text (optional)"/>
                            </div>
                        </div>
                        <div className="space-y-1">
                             <label className="text-xs font-medium text-gray-500">Project URL</label>
                            <input name="link" value={projItem.link} onChange={updateItemField} className={commonInputClass} placeholder="Project URL (e.g., github.com/...)" />
                        </div>
                        {renderDescriptionField(projItem.description)}
                    </div>
                )
            }
            case 'Certifications': {
                 const certItem = item as CertificationEntry;
                 return (
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Certification Name</label>
                            <input name="name" value={certItem.name} onChange={updateItemField} className={commonInputClass} placeholder="Certification Name" />
                            <div className="grid grid-cols-2 gap-2">
                                <input name="nameLink" value={certItem.nameLink || ''} onChange={updateItemField} className={commonInputClass} placeholder="Link (optional)"/>
                                <input name="nameExtra" value={certItem.nameExtra || ''} onChange={updateItemField} className={commonInputClass} placeholder="Extra text (optional)"/>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Issuer</label>
                            <input name="issuer" value={certItem.issuer} onChange={updateItemField} className={commonInputClass} placeholder="Issuer" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Date</label>
                            <input name="date" type="date" value={certItem.date} onChange={updateItemField} className={commonInputClass} />
                        </div>
                    </div>
                 );
            }
             case 'Languages': {
                const langItem = item as LanguageEntry;
                const predefinedLevels = ['Elementary', 'Intermediate', 'Advanced', 'Fluent', 'Native'];
                const isCustom = langItem.level !== undefined && langItem.level !== '' && !predefinedLevels.includes(langItem.level);

                return (
                    <div className="grid grid-cols-2 gap-2">
                        <input name="language" value={langItem.language} onChange={updateItemField} className={commonInputClass} placeholder="Language" />
                        <div>
                            <select
                                value={isCustom ? 'Custom' : langItem.level || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === 'Custom') {
                                        // Use a non-predefined value to trigger custom input.
                                        // Using a space which the user will overwrite.
                                        if (!isCustom) {
                                            updateItem({ level: ' ' });
                                        }
                                    } else {
                                        updateItem({ level: value });
                                    }
                                }}
                                className={commonInputClass}
                            >
                                <option value="">-- Optional --</option>
                                {predefinedLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                                <option value="Custom">Custom...</option>
                            </select>
                            {isCustom && (
                                <input
                                    type="text"
                                    name="level"
                                    value={langItem.level || ''}
                                    onChange={updateItemField}
                                    className={`${commonInputClass} mt-2`}
                                    placeholder="Enter custom level"
                                    autoFocus
                                />
                            )}
                        </div>
                    </div>
                );
            }
            case 'Custom': {
                const customItem = item as CustomEntry;
                return (
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Title</label>
                            <input name="title" value={customItem.title} onChange={updateItemField} className={commonInputClass} placeholder="Title" />
                             <div className="grid grid-cols-2 gap-2">
                                <input name="titleLink" value={customItem.titleLink || ''} onChange={updateItemField} className={commonInputClass} placeholder="Link (optional)"/>
                                <input name="titleExtra" value={customItem.titleExtra || ''} onChange={updateItemField} className={commonInputClass} placeholder="Extra text (optional)"/>
                            </div>
                        </div>
                        {renderDescriptionField(customItem.description)}
                    </div>
                );
            }
            default: return null;
        }
    };

    const getTitle = () => {
        return item.jobTitle || item.degree || item.skillName || item.projectName || item.name || item.language || item.title || 'New Entry';
    }

    return (
        <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-lg mb-2">
            <div className="flex items-center p-2 bg-gray-50 rounded-t-lg">
                <button {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-gray-800 p-1">
                    <GripVerticalIcon className="w-5 h-5" />
                </button>
                <h4 className="flex-grow font-medium text-sm text-gray-800 truncate pl-1">{getTitle()}</h4>
                 <button onClick={() => actions.duplicateItem(section.id, item.id)} className="p-1 text-gray-500 hover:text-gray-800" title="Duplicate Entry">
                    <CopyIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 text-gray-500 hover:text-gray-800">
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                </button>
                <button onClick={() => actions.deleteItem(section.id, item.id)} className="p-1 text-red-500 hover:text-red-700">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            {isExpanded && <div className="p-3 space-y-2">{renderFields()}</div>}
        </div>
    );
};


interface SectionContentEditorProps {
    section: CVSection;
    actions: ReturnType<typeof useCVData>['actions'];
    itemIds: string[];
}

const SectionContentEditor: React.FC<SectionContentEditorProps> = ({ section, actions, itemIds }) => {
    
    const updateSection = (newValues: Partial<CVSection>) => {
        actions.updateSection(section.id, newValues);
    };

    const sortOptionsMap: Record<string, {label: string, value: SortKey}[]> = {
        'Work Experience': [ {label: 'Date', value: 'startDate'}, {label: 'Title', value: 'jobTitle'} ],
        'Education': [ {label: 'Date', value: 'startDate'}, {label: 'Degree', value: 'degree'} ],
        'Skills': [ {label: 'Name', value: 'skillName'} ],
        'Projects': [ {label: 'Name', value: 'projectName'}, { label: 'Length', value: 'descriptionLength'} ],
        'Certifications': [ {label: 'Date', value: 'date'}, {label: 'Name', value: 'name'}, { label: 'Length', value: 'descriptionLength'} ],
        'Languages': [ {label: 'Language', value: 'language'} ],
        'Custom': [ {label: 'Title', value: 'title'}, { label: 'Length', value: 'descriptionLength'} ]
    };
    const sortOptions = sortOptionsMap[section.type] || [];
    
    const [sortKey, setSortKey] = useState<SortKey | undefined>(sortOptions[0]?.value);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>(sortOptions[0]?.value.includes('date') ? 'desc' : 'asc');

    const handleSort = (key: SortKey, dir: 'asc' | 'desc') => {
        setSortKey(key);
        setSortDir(dir);
        if (key) {
            actions.sortItems(section.id, key, dir);
        }
    }
    
    const handleSortKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newKey = e.target.value as SortKey;
        const newDir = newKey.toLowerCase().includes('date') ? 'desc' : 'asc';
        handleSort(newKey, newDir);
    }

    const handleSortDirChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (sortKey) {
            handleSort(sortKey, e.target.value as 'asc' | 'desc');
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Section Title</label>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection({ title: e.target.value })}
                        className="flex-grow p-2 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                        onClick={() => updateSection({ pageBreakAfter: !section.pageBreakAfter })}
                        className={`p-2 rounded-md transition-colors ${
                            section.pageBreakAfter 
                            ? 'bg-indigo-100 text-indigo-700' 
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                        }`}
                        title={section.pageBreakAfter ? 'Remove page break after' : 'Insert page break after'}
                    >
                        <PageBreakIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => updateSection({ visible: !section.visible })} className="p-2 text-gray-500 hover:text-gray-800" title={section.visible ? 'Hide Section' : 'Show Section'}>
                        {section.visible ? <EyeIcon className="w-5 h-5"/> : <EyeSlashIcon className="w-5 h-5"/>}
                    </button>
                    <button onClick={() => actions.duplicateSection(section.id)} className="p-2 text-gray-500 hover:text-gray-800" title="Duplicate Section">
                        <CopyIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => actions.deleteSection(section.id)} className="p-2 text-red-500 hover:text-red-700" title="Delete Section">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2 text-sm">
                    {sortOptions.length > 0 && (
                        <>
                        <label className="font-medium text-gray-700">Sort by:</label>
                        <select
                            value={sortKey}
                            onChange={handleSortKeyChange}
                            className="p-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <select
                            value={sortDir}
                            onChange={handleSortDirChange}
                            disabled={!sortKey}
                            className="p-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                        </>
                    )}
                </div>
                 {(section.type === 'Skills' || section.type === 'Languages') && (
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center gap-2">
                             <label className="font-medium text-gray-700">Display as:</label>
                             <select
                                 value={section.layout}
                                 onChange={(e) => updateSection({ layout: e.target.value as any })}
                                 className="p-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                             >
                                 {section.type === 'Skills' ? (
                                     <>
                                     <option value="chips">Chips</option>
                                     <option value="list">List</option>
                                     </>
                                 ) : (
                                     <>
                                     <option value="compact">Compact</option>
                                     <option value="pills">Pills</option>
                                     <option value="list">List</option>
                                     <option value="bar">Bar</option>
                                     <option value="dots">Dots</option>
                                     </>
                                 )}
                             </select>
                        </div>

                        {section.type === 'Languages' && (
                            <div className="flex items-center gap-2">
                                <label className="font-medium text-gray-700">Arrangement:</label>
                                <div className="flex rounded-md shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => updateSection({ displayStyle: 'inline' })}
                                        className={`relative inline-flex items-center px-3 py-1 text-xs font-semibold focus:z-10 transition-colors ${section.displayStyle !== 'multiline' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} border rounded-l-md`}
                                    >
                                        Inline
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateSection({ displayStyle: 'multiline' })}
                                        className={`relative -ml-px inline-flex items-center px-3 py-1 text-xs font-semibold focus:z-10 transition-colors ${section.displayStyle === 'multiline' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} border rounded-r-md`}
                                    >
                                        Multiline
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            
            <div className="space-y-2">
                {section.items.map((item) => (
                    <ItemEditor key={item.id} section={section} item={item} actions={actions} />
                ))}
            </div>

            <button
                onClick={() => actions.addItem(section.id)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
            >
                <PlusIcon className="w-4 h-4" /> Add new entry
            </button>
        </div>
    );
};

export default SectionContentEditor;