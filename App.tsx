import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCVData } from './hooks/useCVData';
import { CVData, CVStyle, SavedCV } from './types';
import { CVPreview } from './components/CVPreview';
import ControlPanel from './components/ControlPanel';
import { CVManager } from './components/CVManager';
import { DEFAULT_STYLE, DEFAULT_CV_DATA, generateId } from './constants';
import { getSavedCVs, saveCVs, getWIPCV, saveWIPCV } from './services/cvStore';
import { PencilSquareIcon, EyeIcon } from './components/Icons';

// Let TypeScript know that html2pdf exists on the window object
declare const html2pdf: any;

const App: React.FC = () => {
    const { cvData, actions } = useCVData();
    const [style, setStyle] = useState<CVStyle>(DEFAULT_STYLE);
    const cvPreviewRef = useRef<HTMLDivElement>(null);

    const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
    const [activeCVId, setActiveCVId] = useState<string | null>(null);
    const [cvName, setCvName] = useState('Untitled CV');
    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isSavingPdf, setIsSavingPdf] = useState(false);

    // Responsive State
    const [activeMobileTab, setActiveMobileTab] = useState<'editor' | 'preview'>('editor');
    const [previewScale, setPreviewScale] = useState(1);
    const mainContainerRef = useRef<HTMLDivElement>(null);
    
    // Load from storage on initial render
    useEffect(() => {
        const wipCV = getWIPCV();
        if (wipCV) {
            actions.loadData(wipCV.data);
            // Merge with DEFAULT_STYLE to ensure new properties (like paperSize) are present
            setStyle({ ...DEFAULT_STYLE, ...wipCV.style });
            setCvName(wipCV.name);
            setActiveCVId(wipCV.activeCVId);
        } else {
            const cvsFromStorage = getSavedCVs();
            if (cvsFromStorage.length > 0) {
                const lastUsed = cvsFromStorage.sort((a, b) => b.lastModified - a.lastModified)[0];
                handleLoadCV(lastUsed.id, cvsFromStorage, false);
            }
        }
        setSavedCVs(getSavedCVs());
        setIsInitialized(true);
    }, []);

    // Auto-save work in progress
    useEffect(() => {
        if (!isInitialized) return;
        const handler = setTimeout(() => {
            saveWIPCV({
                name: cvName,
                data: cvData,
                style: style,
                activeCVId: activeCVId,
            });
        }, 500);

        return () => clearTimeout(handler);
    }, [cvData, style, cvName, activeCVId, isInitialized]);

    // Scaling Logic for Preview
    useEffect(() => {
        const calculateScale = () => {
            if (!mainContainerRef.current) return;
            
            const containerWidth = mainContainerRef.current.clientWidth;
            // Increased padding on left to accommodate the sidebar ruler (approx 40px + some spacing)
            // Mobile: 16px right + 60px left = 76px. Desktop: 32px right + 80px left = 112px
            const xPadding = window.innerWidth < 1024 ? 76 : 112; 
            const availableWidth = containerWidth - xPadding;
            
            const pageWidth = style.paperSize === 'Letter' ? 816 : 794;
            
            let newScale = availableWidth / pageWidth;
            // Limit scale: Max 1 (don't zoom in beyond 100%), Min 0.3
            newScale = Math.min(1, Math.max(0.3, newScale));
            
            setPreviewScale(newScale);
        };

        const resizeObserver = new ResizeObserver(() => {
            calculateScale();
        });

        if (mainContainerRef.current) {
            resizeObserver.observe(mainContainerRef.current);
        }
        
        window.addEventListener('resize', calculateScale);
        
        // Initial calc
        calculateScale();
        
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', calculateScale);
        }
    }, [style.paperSize, activeMobileTab]);


    const handleLoadCV = (id: string, cvs: SavedCV[] = savedCVs, openManager = false) => {
        const cvToLoad = cvs.find(cv => cv.id === id);
        if (cvToLoad) {
            actions.loadData(cvToLoad.data);
            // Merge with DEFAULT_STYLE to ensure consistency
            setStyle({ ...DEFAULT_STYLE, ...cvToLoad.style });
            setActiveCVId(cvToLoad.id);
            setCvName(cvToLoad.name);
            if (openManager) {
                setIsManagerOpen(false);
            }
        }
    };

    const handleSaveCV = () => {
        if (!cvName.trim()) {
            alert("Please provide a name for your CV.");
            return;
        }

        const now = Date.now();
        const currentCV: SavedCV = {
            id: activeCVId || generateId(),
            name: cvName.trim(),
            data: cvData,
            style: style,
            lastModified: now,
        };

        const existingIndex = savedCVs.findIndex(cv => cv.id === currentCV.id);
        let newSavedCVs;

        if (existingIndex > -1) {
            newSavedCVs = [...savedCVs];
            newSavedCVs[existingIndex] = currentCV;
        } else {
            newSavedCVs = [...savedCVs, currentCV];
        }

        setSavedCVs(newSavedCVs);
        setActiveCVId(currentCV.id);
        saveCVs(newSavedCVs);
        alert(`CV "${currentCV.name}" saved successfully!`);
    };
    
    const handleCreateNew = () => {
        actions.loadData(DEFAULT_CV_DATA);
        setStyle(DEFAULT_STYLE);
        setActiveCVId(null);
        setCvName('Untitled CV');
        setIsManagerOpen(false);
    };

    const handleDeleteCV = (id: string) => {
        const newSavedCVs = savedCVs.filter(cv => cv.id !== id);
        setSavedCVs(newSavedCVs);
        saveCVs(newSavedCVs);

        if (id === activeCVId) {
            handleCreateNew();
        }
    };
    
    const handleExportJson = useCallback(() => {
        const dataToExport = {
            name: cvName,
            data: cvData,
            style: style,
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        const safeName = cvName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${safeName || 'cv'}.json`;
        link.click();
    }, [cvName, cvData, style]);

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result as string;
                const parsed = JSON.parse(result);
                // Basic validation
                if (parsed.name && parsed.data && parsed.style) {
                    actions.loadData(parsed.data);
                    setStyle({ ...DEFAULT_STYLE, ...parsed.style });
                    setCvName(parsed.name);
                    setActiveCVId(null); // Imported CV is unsaved
                    alert(`Successfully imported "${parsed.name}"`);
                } else {
                    throw new Error("Invalid CV file format.");
                }
            } catch (error) {
                console.error("Error parsing imported file:", error);
                alert("Could not import CV. The file may be in the wrong format or corrupt.");
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };

    const handleSavePdf = useCallback(() => {
        if (!cvPreviewRef.current || isSavingPdf) {
            return;
        }
    
        setIsSavingPdf(true);
    
        if (typeof html2pdf === 'undefined') {
            alert("PDF generation library failed to load. Please try again later.");
            console.error("html2pdf.js is not loaded.");
            setIsSavingPdf(false);
            return;
        }
    
        const element = cvPreviewRef.current;
        const safeName = (cvName || 'cv').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
        const elementToExport = element.cloneNode(true) as HTMLElement;
        
        // Remove preview-only styles from the pages to ensure clean PDF generation
        const pages = elementToExport.querySelectorAll('.cv-page');
        pages.forEach((page: any) => {
            page.classList.remove('cv-page-shadow');
            page.classList.remove('mt-8'); // Remove vertical spacing between pages
            page.style.marginBottom = '0'; 
            page.style.boxShadow = 'none';
        });

        // Remove page break markers and rulers from PDF
        elementToExport.querySelectorAll('.page-break-marker').forEach((el: any) => el.remove());
        elementToExport.querySelectorAll('.cv-ruler').forEach((el: any) => el.remove());
        
        // Remove measurement container if present in clone
        Array.from(elementToExport.children).forEach((child: any) => {
            if (
                child.style.visibility === 'hidden' || 
                child.style.display === 'none' ||
                (child.style.position === 'absolute' && child.style.zIndex === '-1000')
            ) {
                child.remove();
            }
        });

        const opt = {
          margin: 0,
          filename: `${safeName}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { 
              scale: 2,
              useCORS: true,
              logging: false,
          },
          jsPDF: { 
              unit: 'in', 
              format: 'a4', 
              orientation: 'portrait' 
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
    
        html2pdf().from(elementToExport).set(opt).save()
            .catch((err: any) => {
                console.error("PDF Generation Error:", err);
                alert("An error occurred while generating the PDF. It might be too large or complex. Please try again.");
            })
            .finally(() => {
                setIsSavingPdf(false);
            });
    }, [cvName, isSavingPdf]);

    const handleExportHtml = useCallback(() => {
        if (!cvPreviewRef.current) return;
    
        const element = cvPreviewRef.current;
        // Clone to remove markers without affecting UI
        const clone = element.cloneNode(true) as HTMLElement;
        
        // Remove markers and rulers
        clone.querySelectorAll('.page-break-marker').forEach((el: any) => el.remove());
        clone.querySelectorAll('.cv-ruler').forEach((el: any) => el.remove());

        // Remove the invisible measurement container
        Array.from(clone.children).forEach((child: any) => {
            if (
                child.style.visibility === 'hidden' || 
                child.style.display === 'none' ||
                (child.style.position === 'absolute' && child.style.zIndex === '-1000')
            ) {
                child.remove();
            }
        });

        const cvHtml = clone.innerHTML;

        const fontLinks = Array.from(document.head.querySelectorAll('link[href*="fonts.googleapis.com"]'))
            .map(link => link.outerHTML)
            .join('\n');

        const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${cvName || 'CV'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    ${fontLinks}
    <style>
        /* Base page styling matching the preview */
        body {
            background-color: #f3f4f6; /* Gray-100 */
            margin: 0;
            padding: 2rem 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        /* Individual Page styling */
        .cv-page {
            background-color: white;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            margin-bottom: 2rem;
            position: relative;
            /* Ensure content rendering matches app */
            display: block;
            box-sizing: border-box;
        }
        
        /* Typography helpers */
        .prose ul { list-style-type: disc; padding-left: 1.5rem; }
        .prose ol { list-style-type: decimal; padding-left: 1.5rem; }
        .prose li { margin-bottom: 0.25rem; }
        .prose a { text-decoration: underline; }
        .prose, .prose p, .prose ul, .prose ol, .prose li, .prose strong, .prose em, .prose b, .prose i, .prose u { color: inherit; }

        /* Print Styles - Ensure exact pagination */
        @media print {
            @page { margin: 0; }
            body {
                background-color: white;
                padding: 0;
                display: block;
            }
            .cv-page {
                box-shadow: none;
                margin: 0;
                width: 100% !important;
                page-break-after: always;
                break-after: page;
                /* Prevent unintended scaling */
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            .cv-page:last-child {
                page-break-after: auto;
                break-after: auto;
            }
        }
    </style>
</head>
<body>
    ${cvHtml}
</body>
</html>`;

        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const safeName = (cvName || 'cv').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${safeName}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [cvName]);

    return (
        <>
            <div className="w-full h-[100dvh] bg-gray-100 font-sans flex flex-col lg:flex-row overflow-hidden">
                {/* Main Preview Area */}
                <main 
                    ref={mainContainerRef}
                    className={`flex-grow h-full overflow-y-auto overflow-x-hidden bg-gray-100 flex flex-col items-center py-8 lg:py-8 lg:px-0 px-4 transition-all
                        ${activeMobileTab === 'preview' ? 'block' : 'hidden lg:flex'}
                    `}
                >
                    <div 
                        style={{ 
                            transform: `scale(${previewScale})`, 
                            transformOrigin: 'top center',
                        }}
                        className="transition-transform duration-200 ease-out origin-top ml-8 lg:ml-0" // Add margin on mobile/desktop to ensure ruler isn't clipped by center alignment
                    >
                         <CVPreview ref={cvPreviewRef} cvData={cvData} style={style} />
                    </div>
                     {/* Bottom padding to allow scrolling past the scaled content */}
                    <div className="w-full h-24 lg:h-12 flex-shrink-0"></div>
                </main>

                 {/* Sidebar Controls */}
                <aside 
                    className={`
                        w-full lg:w-[450px] flex-shrink-0 h-full border-l border-gray-200 bg-white z-10 overflow-hidden
                        ${activeMobileTab === 'editor' ? 'block' : 'hidden lg:block'}
                    `}
                >
                    <ControlPanel 
                        cvData={cvData} 
                        actions={actions}
                        style={style}
                        setStyle={setStyle}
                        cvName={cvName}
                        setCvName={setCvName}
                        onSave={handleSaveCV}
                        onOpenManager={() => setIsManagerOpen(true)}
                        onExportJson={handleExportJson}
                        onImport={handleImport}
                        onSavePdf={handleSavePdf}
                        isSavingPdf={isSavingPdf}
                        onExportHtml={handleExportHtml}
                    />
                     {/* Padding for mobile bottom nav */}
                     <div className="lg:hidden h-16 w-full"></div>
                </aside>

                {/* Mobile Bottom Navigation */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-50 shadow-lg">
                    <button 
                        onClick={() => setActiveMobileTab('editor')}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg flex-1 transition-colors ${activeMobileTab === 'editor' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <PencilSquareIcon className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">Editor</span>
                    </button>
                    <button 
                         onClick={() => setActiveMobileTab('preview')}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg flex-1 transition-colors ${activeMobileTab === 'preview' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <EyeIcon className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">Preview</span>
                    </button>
                </div>
            </div>
            
            <CVManager 
                isOpen={isManagerOpen}
                onClose={() => setIsManagerOpen(false)}
                savedCVs={savedCVs}
                activeCVId={activeCVId}
                onLoad={(id) => handleLoadCV(id, savedCVs, true)}
                onDelete={handleDeleteCV}
                onCreate={handleCreateNew}
            />
        </>
    );
};

export default App;