
import React from 'react';
import { SavedCV } from '../types';
import { TrashIcon, XMarkIcon, FolderPlusIcon } from './Icons';

interface CVManagerProps {
    isOpen: boolean;
    onClose: () => void;
    savedCVs: SavedCV[];
    activeCVId: string | null;
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    onCreate: () => void;
}

export const CVManager: React.FC<CVManagerProps> = ({ isOpen, onClose, savedCVs, activeCVId, onLoad, onDelete, onCreate }) => {
    if (!isOpen) return null;

    const sortedCVs = [...savedCVs].sort((a, b) => b.lastModified - a.lastModified);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Manage Your CVs</h2>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="p-4">
                     <button
                        onClick={onCreate}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                        <FolderPlusIcon className="w-5 h-5" /> Create New CV
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto px-4 pb-4">
                    <ul className="space-y-2">
                        {sortedCVs.length > 0 ? (
                            sortedCVs.map(cv => (
                                <li key={cv.id} className={`p-3 rounded-lg flex items-center justify-between transition-colors ${cv.id === activeCVId ? 'bg-indigo-50 border-indigo-200 border' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                    <div>
                                        <p className="font-semibold text-gray-900">{cv.name}</p>
                                        <p className="text-xs text-gray-500">
                                            Last modified: {new Date(cv.lastModified).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => onLoad(cv.id)}
                                            className="px-3 py-1 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                                            disabled={cv.id === activeCVId}
                                        >
                                            {cv.id === activeCVId ? 'Loaded' : 'Load'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to delete "${cv.name}"? This cannot be undone.`)) {
                                                    onDelete(cv.id);
                                                }
                                            }}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                                            title="Delete CV"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>You have no saved CVs.</p>
                                <p className="text-sm">Click "Create New CV" to get started.</p>
                            </div>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};
