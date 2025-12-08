

import React, { useState, useRef } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CVData, CVStyle, PersonalInfoItem } from '../types';
import { useCVData } from '../hooks/useCVData';
import StyleControls from './StyleControls';
import SectionContentEditor from './SectionContentEditor';
import { GripVerticalIcon, ChevronDownIcon, PlusIcon, SaveIcon, TrashIcon } from './Icons';


interface PersonalInfoItemEditorProps {
    item: PersonalInfoItem;
    onUpdate: (id: string, newValues: Partial<PersonalInfoItem>) => void;
    onDelete: (id: string) => void;
}

const PersonalInfoItemEditor: React.FC<PersonalInfoItemEditorProps> = ({ item, onUpdate, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const commonInputClass = "block w-full p-2 text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500";

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-white rounded-md border">
            <button {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-gray-800 p-1">
                <GripVerticalIcon className="w-5 h-5" />
            </button>
            <div className="flex-grow grid grid-cols-2 gap-2">
                <input
                    value={item.label}
                    onChange={e => onUpdate(item.id, { label: e.target.value })}
                    placeholder="Label (e.g., Email)"
                    className={commonInputClass}
                />
                <input
                    value={item.value}
                    onChange={e => onUpdate(item.id, { value: e.target.value })}
                    placeholder="Value"
                    className={commonInputClass}
                />
            </div>
            <button onClick={() => onDelete(item.id)} className="p-1 text-red-500 hover:text-red-700" title="Delete Detail">
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    );
};


interface SectionHeaderProps {
    id: string;
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ id, title, isExpanded, onToggle }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <h3 ref={setNodeRef} style={style} className="w-full">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
                <div className="flex items-center">
                    <span {...attributes} {...listeners} className="cursor-grab p-1 text-gray-500">
                         <GripVerticalIcon className="w-5 h-5" />
                    </span>
                    <span className="font-semibold text-gray-800 ml-2">{title}</span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
            </button>
        </h3>
    );
};

interface ControlPanelProps {
    cvData: CVData;
    actions: ReturnType<typeof useCVData>['actions'];
    style: CVStyle;
    setStyle: React.Dispatch<React.SetStateAction<CVStyle>>;
    cvName: string;
    setCvName: (name: string) => void;
    onSave: () => void;
    onOpenManager: () => void;
    pdfLink: React.ReactNode;
    onExportHtml: () => void;
    onExportJson: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ cvData, actions, style, setStyle, cvName, setCvName, onSave, onOpenManager, pdfLink, onExportHtml, onExportJson, onImport }) => {
    const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
    const [expandedSection, setExpandedSection] = useState<string | null>('personal');
    const [newSectionName, setNewSectionName] = useState('');
    const importInputRef = useRef<HTMLInputElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleSectionDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = cvData.sections.findIndex(s => s.id === active.id);
            const newIndex = cvData.sections.findIndex(s => s.id === over.id);
            actions.moveSection(oldIndex, newIndex);
        }
    };
    
     const handlePersonalInfoDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = cvData.personalInfo.details.findIndex(d => d.id === active.id);
            const newIndex = cvData.personalInfo.details.findIndex(d => d.id === over.id);
            actions.movePersonalInfoItem(oldIndex, newIndex);
        }
    };

    const handleItemDragEnd = (sectionId: string) => (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const section = cvData.sections.find(s => s.id === sectionId);
            if(section) {
                const oldIndex = section.items.findIndex(i => i.id === active.id);
                const newIndex = section.items.findIndex(i => i.id === over.id);
                actions.moveItem(sectionId, oldIndex, newIndex);
            }
        }
    };

    const handleAddCustomSection = () => {
        if(newSectionName.trim()){
            actions.addSection(newSectionName, 'Custom');
            setNewSectionName('');
        }
    };

    const sectionIds = cvData.sections.map(s => s.id);
    const personalInfoDetailIds = cvData.personalInfo.details.map(d => d.id);
    
    return (
        <div className="h-full bg-white border-l border-gray-200 flex flex-col">
            <div className="flex border-b border-gray-200">
                <button onClick={() => setActiveTab('content')} className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors ${activeTab === 'content' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>Content</button>
                <button onClick={() => setActiveTab('style')} className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors ${activeTab === 'style' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>Style</button>
            </div>
            <div className="flex-grow overflow-y-auto">
                {activeTab === 'content' ? (
                    <div className="p-4 space-y-4">
                        {/* CV Management */}
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CV Name</label>
                                <input
                                    type="text"
                                    value={cvName}
                                    onChange={(e) => setCvName(e.target.value)}
                                    placeholder="e.g., My Frontend CV"
                                    className="block w-full p-2 text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                             <div className="grid grid-cols-2 gap-2">
                                <button onClick={onSave} className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors text-sm">
                                    <SaveIcon className="w-4 h-4" /> Save
                                </button>
                                <button onClick={onOpenManager} className="bg-white text-gray-700 font-semibold py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm">
                                    Manage CVs
                                </button>
                            </div>
                            <div className="pt-2 border-t">
                                <label className="block text-sm font-medium text-gray-700 my-1">Export / Import</label>
                                <div className="flex justify-center w-full">
                                    {pdfLink}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={onExportHtml} className="bg-white text-gray-700 font-semibold py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm">
                                        Export as HTML
                                    </button>
                                    <button onClick={onExportJson} className="bg-white text-gray-700 font-semibold py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm">
                                        Export JSON
                                    </button>
                                     <input type="file" accept=".json" ref={importInputRef} onChange={onImport} className="hidden" />
                                    <button onClick={() => importInputRef.current?.click()} className="bg-white text-gray-700 font-semibold py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm">
                                        Import JSON
                                    </button>
                                </div>
                            </div>
                        </div>


                        {/* Personal Info */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                             <button onClick={() => setExpandedSection(expandedSection === 'personal' ? null : 'personal')} className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 rounded-t-lg transition-colors">
                                <span className="font-semibold text-gray-800">Personal Information</span>
                                <ChevronDownIcon className={`w-5 h-5 text-gray-600 transition-transform ${expandedSection === 'personal' ? '' : '-rotate-90'}`} />
                            </button>
                            {expandedSection === 'personal' && (
                               <div className="p-3 space-y-3">
                                    <input value={cvData.personalInfo.name} onChange={e => actions.updatePersonalInfo('name', e.target.value)} placeholder="Full Name" className="block w-full p-2 text-sm border-gray-300 rounded-md shadow-sm"/>
                                    <input value={cvData.personalInfo.jobTitle} onChange={e => actions.updatePersonalInfo('jobTitle', e.target.value)} placeholder="Job Title" className="block w-full p-2 text-sm border-gray-300 rounded-md shadow-sm"/>
                                    
                                    <div className="pt-3 border-t">
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePersonalInfoDragEnd}>
                                            <SortableContext items={personalInfoDetailIds} strategy={verticalListSortingStrategy}>
                                                <div className="space-y-2">
                                                    {cvData.personalInfo.details.map(item => (
                                                        <PersonalInfoItemEditor
                                                            key={item.id}
                                                            item={item}
                                                            onUpdate={actions.updatePersonalInfoItem}
                                                            onDelete={actions.deletePersonalInfoItem}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    </div>

                                    <button
                                        onClick={() => actions.addPersonalInfoItem()}
                                        className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                                    >
                                        <PlusIcon className="w-4 h-4" /> Add new detail
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Sections */}
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
                            <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                                {cvData.sections.map(section => (
                                    <div key={section.id} className="bg-white border border-gray-200 rounded-lg">
                                        <SectionHeader id={section.id} title={section.title} isExpanded={expandedSection === section.id} onToggle={() => setExpandedSection(expandedSection === section.id ? null : section.id)} />
                                        {expandedSection === section.id && (
                                            <div className="p-3">
                                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleItemDragEnd(section.id)}>
                                                    <SortableContext items={section.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                                        <SectionContentEditor section={section} actions={actions} itemIds={section.items.map(i => i.id)} />
                                                    </SortableContext>
                                                </DndContext>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </SortableContext>
                        </DndContext>
                        
                        {/* Add Custom Section */}
                        <div className="pt-4 border-t">
                             <h4 className="font-semibold text-gray-800 mb-2">Add Custom Section</h4>
                             <div className="flex gap-2">
                                <input 
                                    value={newSectionName}
                                    onChange={(e) => setNewSectionName(e.target.value)}
                                    placeholder="e.g., Awards"
                                    className="flex-grow p-2 block w-full text-sm border-gray-300 rounded-md shadow-sm"
                                />
                                <button onClick={handleAddCustomSection} className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700">
                                    <PlusIcon className="w-5 h-5"/>
                                </button>
                             </div>
                        </div>

                    </div>
                ) : (
                    <StyleControls 
                        style={style} 
                        setStyle={setStyle}
                    />
                )}
            </div>
        </div>
    );
};

export default ControlPanel;