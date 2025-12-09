
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useCVData } from './hooks/useCVData';
import { CVData, CVStyle, SavedCV, WorkExperienceEntry, EducationEntry, SkillEntry, ProjectEntry, CertificationEntry, LanguageEntry, CustomEntry } from './types';
import { CVPreview } from './components/CVPreview';
import ControlPanel from './components/ControlPanel';
import { CVManager } from './components/CVManager';
import { DEFAULT_STYLE, DEFAULT_CV_DATA, generateId } from './constants';
import { getSavedCVs, saveCVs, getWIPCV, saveWIPCV } from './services/cvStore';
import { usePDF, Font } from '@react-pdf/renderer';
import { PdfDocument } from './components/PdfDocument';

// Register fonts
Font.register({
  family: 'Arial',
  fonts: [
    { src: '/fonts/arial.ttf' },
    { src: '/fonts/arialbd.ttf', fontWeight: 'bold' },
    { src: '/fonts/ariali.ttf', fontStyle: 'italic' },
    { src: '/fonts/arialbi.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Calibri',
  fonts: [
    { src: '/fonts/calibri.ttf' },
    { src: '/fonts/calibrib.ttf', fontWeight: 'bold' },
    { src: '/fonts/calibrii.ttf', fontStyle: 'italic' },
    { src: '/fonts/calibriz.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Georgia',
  fonts: [
    { src: '/fonts/georgia.ttf' },
    { src: '/fonts/georgiab.ttf', fontWeight: 'bold' },
    { src: '/fonts/georgiai.ttf', fontStyle: 'italic' },
    { src: '/fonts/georgiaz.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: '/fonts/helvetica.ttf' },
    { src: '/fonts/helveticab.ttf', fontWeight: 'bold' },
    { src: '/fonts/helveticai.ttf', fontStyle: 'italic' },
            { src: '/fonts/helveticabi.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Lato',
  fonts: [
    { src: '/fonts/Lato-Regular.ttf' },
    { src: '/fonts/Lato-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/Lato-Italic.ttf', fontStyle: 'italic' },
    { src: '/fonts/Lato-BoldItalic.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: '/fonts/OpenSans-Regular.ttf' },
    { src: '/fonts/OpenSans-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/OpenSans-Italic.ttf', fontStyle: 'italic' },
    { src: '/fonts/OpenSans-BoldItalic.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Poppins',
  fonts: [
    { src: '/fonts/Poppins-Regular.otf' },
    { src: '/fonts/Poppins-Bold.otf', fontWeight: 'bold' },
    { src: '/fonts/Poppins-Italic.otf', fontStyle: 'italic' },
    { src: '/fonts/Poppins-BoldItalic.otf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/Roboto-Italic.ttf', fontStyle: 'italic' },
    { src: '/fonts/Roboto-BoldItalic.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Source Sans Pro',
  fonts: [
    { src: '/fonts/SourceSansPro-Regular.otf' },
    { src: '/fonts/SourceSansPro-Bold.otf', fontWeight: 'bold' },
    { src: '/fonts/SourceSansPro-It.otf', fontStyle: 'italic' },
    { src: '/fonts/SourceSansPro-BoldIt.otf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Source Code Pro',
  fonts: [
    { src: '/fonts/SourceCodePro-Regular.otf' },
    { src: '/fonts/SourceCodePro-Bold.otf', fontWeight: 'bold' },
    { src: '/fonts/SourceCodePro-It.otf', fontStyle: 'italic' },
    { src: '/fonts/SourceCodePro-BoldIt.otf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Times New Roman',
  fonts: [
    { src: '/fonts/times.ttf' },
    { src: '/fonts/timesbd.ttf', fontWeight: 'bold' },
    { src: '/fonts/timesi.ttf', fontStyle: 'italic' },
    { src: '/fonts/timesbi.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

const App: React.FC = () => {
    const { cvData, actions } = useCVData();
    const [style, setStyle] = useState<CVStyle>(DEFAULT_STYLE);
    const [instance, updateInstance] = usePDF({ document: useMemo(() => <PdfDocument cv={cvData} style={style} />, [cvData, style]) });
    const cvPreviewRef = useRef<HTMLDivElement>(null);

    const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
    const [activeCVId, setActiveCVId] = useState<string | null>(null);
    const [cvName, setCvName] = useState('Untitled CV');
    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    
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

    useEffect(() => {
        updateInstance();
    }, [cvData, style]);


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

    const handleSavePdf = useCallback(() => {
        if (instance.loading || !instance.blob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(instance.blob);
        const safeName = cvName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${safeName || 'cv'}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
    }, [instance.loading, instance.blob, cvName]);

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
