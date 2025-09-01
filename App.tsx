
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCVData } from './hooks/useCVData';
import { CVData, CVStyle, SavedCV } from './types';
import { CVPreview } from './components/CVPreview';
import ControlPanel from './components/ControlPanel';
import { CVManager } from './components/CVManager';
import { DEFAULT_STYLE, DEFAULT_CV_DATA, generateId } from './constants';
import { getSavedCVs, saveCVs, getWIPCV, saveWIPCV } from './services/cvStore';

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
    
    // Load from storage on initial render
    useEffect(() => {
        const wipCV = getWIPCV();
        if (wipCV) {
            actions.loadData(wipCV.data);
            setStyle(wipCV.style);
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


    const handleLoadCV = (id: string, cvs: SavedCV[] = savedCVs, openManager = false) => {
        const cvToLoad = cvs.find(cv => cv.id === id);
        if (cvToLoad) {
            actions.loadData(cvToLoad.data);
            setStyle(cvToLoad.style);
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
                    setStyle(parsed.style);
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
        elementToExport.classList.remove('cv-page-shadow');

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
    
        const cvHtml = cvPreviewRef.current.outerHTML;
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
        body {
            background-color: #f7fafc;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 2rem;
            min-height: 100vh;
        }
        .prose ul { list-style-type: disc; padding-left: 1.5rem; }
        .prose ol { list-style-type: decimal; padding-left: 1.5rem; }
        .prose li { margin-bottom: 0.25rem; }
        .prose a { text-decoration: underline; }
        .prose, .prose p, .prose ul, .prose ol, .prose li, .prose strong, .prose em, .prose b, .prose i, .prose u { color: inherit; }
        .cv-page-shadow { box-shadow: 0 0 0.5cm rgba(0,0,0,0.2); }
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
            <div className="w-screen h-screen bg-gray-100 font-sans flex overflow-hidden">
                <main className="flex-grow h-full overflow-auto p-8 flex justify-center">
                    <CVPreview ref={cvPreviewRef} cvData={cvData} style={style} />
                </main>
                <aside className="w-[450px] flex-shrink-0 h-full">
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
                </aside>
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