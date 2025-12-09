
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useCVData } from './hooks/useCVData';
import { CVData, CVStyle, SavedCV } from './types';
import { CVPreview } from './components/CVPreview';
import ControlPanel from './components/ControlPanel';
import { CVManager } from './components/CVManager';
import { DEFAULT_STYLE, DEFAULT_CV_DATA, generateId, FONT_OPTIONS } from './constants';
import { getSavedCVs, saveCVs, getWIPCV, saveWIPCV } from './services/cvStore';
import { usePDF, Font } from '@react-pdf/renderer';
import PdfDocument from './components/pdf/PdfDocument';

// Filter for Google Fonts and dynamically register them
const GOOGLE_FONTS = ['Poppins', 'Roboto', 'Open Sans', 'Lato', 'Source Sans Pro'];
const fontsToRegister = FONT_OPTIONS.filter(f => GOOGLE_FONTS.includes(f.name));

fontsToRegister.forEach(font => {
    const fontName = font.name;
    const googleFontName = fontName.replace(/\s/g, '+');
    // NOTE: This uses a simplified URL structure for Google Fonts.
    // A more robust solution might need a mapping for specific font weights and styles.
    Font.register({
        family: fontName,
        fonts: [
            { src: `https://fonts.gstatic.com/s/${googleFontName.toLowerCase()}/v20/whatever.ttf`, fontWeight: 400 },
            { src: `https://fonts.gstatic.com/s/${googleFontName.toLowerCase()}/v20/whatever.ttf`, fontWeight: 700 },
            { src: `https://fonts.gstatic.com/s/${googleFontName.toLowerCase()}/v20/whatever.ttf`, fontStyle: 'italic' },
        ]
    });
});

const App: React.FC = () => {
    const { cvData, actions } = useCVData();
    const [style, setStyle] = useState<CVStyle>(DEFAULT_STYLE);
    const cvPreviewRef = useRef<HTMLDivElement>(null);

    const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
    const [activeCVId, setActiveCVId] = useState<string | null>(null);
    const [cvName, setCvName] = useState('Untitled CV');
    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    
    // PDF Generation
    const memoizedPdfDocument = useMemo(() => <PdfDocument cvData={cvData} style={style} />, [cvData, style]);
    const [instance] = usePDF({ document: memoizedPdfDocument });


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
        if (instance.loading || !instance.url) {
            return;
        }
        const link = document.createElement('a');
        link.href = instance.url;
        const safeName = (cvName || 'cv').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${safeName}.pdf`;
        link.click();
    }, [instance.loading, instance.url, cvName]);

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
                        isPdfLoading={instance.loading}
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
