import React, { useState, useLayoutEffect, useRef, useCallback, useEffect } from 'react';
import { CVData, CVStyle, DateFormat, WorkExperienceEntry, EducationEntry, SkillEntry, ProjectEntry, CertificationEntry, LanguageEntry, CustomEntry, CVSection, PersonalInfoItem, CVEntry } from '../types';

interface CVPreviewProps {
    cvData: CVData;
    style: CVStyle;
}

// Constants for Page Dimensions (at 96 DPI)
const A4_HEIGHT_PX = 1123; 
const LETTER_HEIGHT_PX = 1056; 
const PX_PER_REM = 16; 

const getPageHeight = (size: string) => size === 'Letter' ? LETTER_HEIGHT_PX : A4_HEIGHT_PX;

const getVerticalPadding = (marginClass: string) => {
    // p-4 = 1rem, p-8 = 2rem, p-12 = 3rem
    switch(marginClass) {
        case 'p-4': return 2 * 1 * PX_PER_REM;
        case 'p-8': return 2 * 2 * PX_PER_REM;
        case 'p-12': return 2 * 3 * PX_PER_REM;
        default: return 2 * 2 * PX_PER_REM;
    }
}

const formatDate = (dateString: string, format: DateFormat): string => {
    if (!dateString) return '';
    if (dateString.toLowerCase() === 'present') return 'Present';
    try {
        const date = new Date(dateString);
        const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        const year = adjustedDate.getUTCFullYear();
        const monthIndex = adjustedDate.getUTCMonth();
        const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(adjustedDate);
        const monthNum = (monthIndex + 1).toString().padStart(2, '0');

        switch (format) {
            case 'Month YYYY': return `${month} ${year}`;
            case 'MM/YYYY': return `${monthNum}/${year}`;
            case 'YYYY': return `${year}`;
            default: return dateString;
        }
    } catch(e) {
        return dateString;
    }
};

const HeadingPart: React.FC<{
    text?: string;
    link?: string;
    extra?: string;
    className?: string;
    textStyle?: React.CSSProperties;
    linkStyle?: React.CSSProperties;
}> = ({ text, link, extra, className, textStyle, linkStyle }) => {
    if (!text) return null;
    
    const content = <>{text}{extra && <span className="font-normal opacity-80"> ({extra})</span>}</>;
    
    if (link) {
        return <a href={`https://${link.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className={`${className || ''} hover:underline`} style={linkStyle}>{content}</a>;
    }
    
    return <span className={className} style={textStyle}>{content}</span>;
};

const PersonalInfoValue: React.FC<{ item: PersonalInfoItem, style: CVStyle }> = ({ item, style }) => {
    const { label, value } = item;
    const lowerLabel = label.toLowerCase();
    const commonClasses = "hover:underline text-left break-words";
    const linkStyle = { color: style.accentColor };

    if (lowerLabel.includes('email')) {
        return <a href={`mailto:${value}`} className={commonClasses} style={linkStyle}>{value}</a>;
    }

    const websiteKeywords = ['website', 'linkedin', 'github', 'portfolio', 'twitter', 'gitlab', 'blog'];
    if (websiteKeywords.some(keyword => lowerLabel.includes(keyword))) {
        const href = value.startsWith('http') ? value : `https://${value}`;
        return <a href={href} target="_blank" rel="noopener noreferrer" className={commonClasses} style={linkStyle}>{value}</a>;
    }

    return <span className="text-left break-words">{value}</span>;
};

// --- Ruler Component ---
const PageRuler: React.FC<{ heightPx: number }> = ({ heightPx }) => {
    // 96 DPI standard for screen/web inches
    const tickInterval = 96; 
    const numTicks = Math.floor(heightPx / tickInterval);
    
    return (
        <div className="cv-ruler absolute top-0 left-0 bottom-0 w-8 -translate-x-full flex flex-col items-end py-0 select-none opacity-40 hover:opacity-100 transition-opacity">
            {/* Border Line */}
            <div className="absolute top-0 bottom-0 right-0 w-px bg-gray-400"></div>
            
            {Array.from({ length: numTicks + 1 }).map((_, i) => (
                <React.Fragment key={i}>
                    {/* Major Tick (Inch) */}
                    <div 
                        className="absolute right-0 w-3 h-px bg-gray-500 flex items-center justify-start" 
                        style={{ top: `${i * tickInterval}px` }}
                    >
                        <span className="absolute right-4 text-[10px] text-gray-600 font-mono transform -translate-y-1/2 pr-1">{i}"</span>
                    </div>
                    
                    {/* Minor Tick (Half Inch) */}
                    {i < numTicks && (
                        <div 
                            className="absolute right-0 w-1.5 h-px bg-gray-300" 
                            style={{ top: `${(i + 0.5) * tickInterval}px` }}
                        ></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// --- Render Helpers ---

const renderSectionHeader = (section: CVSection, style: CVStyle) => {
    return (
        <h3 className="text-base font-bold uppercase tracking-wider border-b pb-2 mb-3" style={{ color: style.headingColor, borderColor: style.headingColor }}>
            {section.title}
        </h3>
    );
};

const renderItemContent = (section: CVSection, item: CVEntry, style: CVStyle) => {
    const { headingColor, bodyTextColor, accentColor } = style;
    const commonHeadingStyle = { color: headingColor };
    const commonBodyStyle = { color: bodyTextColor };
    const commonLinkStyle = { color: accentColor };

    switch (section.type) {
        case 'Work Experience': {
            const workItem = item as WorkExperienceEntry;
            const isCompanyFirst = style.headingStyle === 'companyFirst';
            const companyAndLocation = `${workItem.company}${workItem.location ? `, ${workItem.location}` : ''}`;
            
            const mainPart = isCompanyFirst
                ? { text: companyAndLocation, link: workItem.companyLink, extra: workItem.companyExtra }
                : { text: workItem.jobTitle, link: workItem.jobTitleLink, extra: workItem.jobTitleExtra };
                
            const subPart = isCompanyFirst
                ? { text: workItem.jobTitle, link: workItem.jobTitleLink, extra: workItem.jobTitleExtra }
                : { text: companyAndLocation, link: workItem.companyLink, extra: workItem.companyExtra };

            return (
                <div className="mb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-[1.1em]">
                                <HeadingPart {...mainPart} textStyle={commonHeadingStyle} linkStyle={commonLinkStyle} />
                            </h4>
                            <p className="font-semibold">
                                <HeadingPart {...subPart} textStyle={commonBodyStyle} linkStyle={commonLinkStyle} />
                            </p>
                        </div>
                        <p className="text-xs text-gray-500 whitespace-nowrap pl-4 pt-1">{formatDate(workItem.startDate, style.dateFormat)} - {formatDate(workItem.endDate, style.dateFormat)}</p>
                    </div>
                    <div className="prose mt-1" style={commonBodyStyle} dangerouslySetInnerHTML={{ __html: workItem.description }} />
                </div>
            );
        }
        case 'Education': {
            const eduItem = item as EducationEntry;
            const isCompanyFirst = style.headingStyle === 'companyFirst';
            const institutionAndLocation = `${eduItem.institution}${eduItem.location ? `, ${eduItem.location}` : ''}`;

            const mainPart = isCompanyFirst
                ? { text: institutionAndLocation, link: eduItem.institutionLink, extra: eduItem.institutionExtra }
                : { text: eduItem.degree, link: eduItem.degreeLink, extra: eduItem.degreeExtra };
                
            const subPart = isCompanyFirst
                ? { text: eduItem.degree, link: eduItem.degreeLink, extra: eduItem.degreeExtra }
                : { text: institutionAndLocation, link: eduItem.institutionLink, extra: eduItem.institutionExtra };


            return (
                <div className="mb-3">
                    <div className="flex justify-between items-start">
                            <div>
                            <h4 className="font-bold text-[1.1em]">
                                <HeadingPart {...mainPart} textStyle={commonHeadingStyle} linkStyle={commonLinkStyle} />
                            </h4>
                            <p className="font-semibold">
                                    <HeadingPart {...subPart} textStyle={commonBodyStyle} linkStyle={commonLinkStyle} />
                            </p>
                        </div>
                            <p className="text-xs text-gray-500 whitespace-nowrap pl-4 pt-1">{formatDate(eduItem.startDate, style.dateFormat)} - {formatDate(eduItem.endDate, style.dateFormat)}</p>
                    </div>
                    {eduItem.description && <div className="prose mt-1" style={commonBodyStyle} dangerouslySetInnerHTML={{ __html: eduItem.description }} />}
                </div>
            );
        }
        case 'Skills': {
            const skillItem = item as SkillEntry;
            if (section.layout === 'list') {
                return (
                    <p className="mb-1 w-full" style={commonBodyStyle}>
                        <span className="font-semibold" style={commonHeadingStyle}>{skillItem.skillName}</span>
                        {skillItem.level && <span className="opacity-90"> ({skillItem.level})</span>}
                        {skillItem.description && <span className="italic opacity-80">: {skillItem.description}</span>}
                    </p>
                );
            }
            return <span className="inline-block text-white rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2" style={{ backgroundColor: accentColor }}>{skillItem.skillName}</span>;
        }
        case 'Projects': {
            const projItem = item as ProjectEntry;
            return (
                    <div className="mb-3">
                    <h4 className="font-semibold flex items-center flex-wrap" style={commonHeadingStyle}>
                        <HeadingPart text={projItem.projectName} link={projItem.projectNameLink} extra={projItem.projectNameExtra} textStyle={commonHeadingStyle} linkStyle={commonLinkStyle} />
                        {projItem.link && <a href={`https://${projItem.link.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-sm font-normal ml-2" style={commonLinkStyle}>(view project)</a>}
                    </h4>
                    <div className="prose" style={commonBodyStyle} dangerouslySetInnerHTML={{ __html: projItem.description }}/>
                </div>
            );
        }
        case 'Certifications': {
            const certItem = item as CertificationEntry;
                return (
                <div className="mb-2 flex justify-between">
                        <div>
                        <h4 className="font-semibold" style={commonHeadingStyle}>
                            <HeadingPart text={certItem.name} link={certItem.nameLink} extra={certItem.nameExtra} textStyle={commonHeadingStyle} linkStyle={commonLinkStyle} />
                        </h4>
                        <p className="italic" style={commonBodyStyle}>{certItem.issuer}</p>
                        </div>
                        <p className="text-xs text-gray-500 whitespace-nowrap pl-4 pt-1">{formatDate(certItem.date, style.dateFormat)}</p>
                </div>
                )
        }
        case 'Languages': {
            const langItem = item as LanguageEntry;
            const levelMap: Record<string, number> = {
                'Elementary': 1, 'Intermediate': 2, 'Advanced': 3, 'Fluent': 4, 'Native': 5
            };
            const isInline = section.displayStyle === 'inline';
            
            const compactDisplay = (
                <p style={commonBodyStyle}>
                    <span className="font-semibold" style={commonHeadingStyle}>{langItem.language}</span>
                    {langItem.level && langItem.level.trim() ? <span className="opacity-90"> ({langItem.level.trim()})</span> : null}
                </p>
            );

            if (section.layout === 'compact') {
                return compactDisplay;
            }

            if (section.layout === 'pills') {
                return (
                    <span className="inline-flex items-center text-white rounded-full px-3 py-1.5 text-sm font-medium" style={{ backgroundColor: accentColor }}>
                        {langItem.language}
                        {langItem.level && langItem.level.trim() ? <span className="ml-2 text-xs font-normal opacity-80 border-l border-white/50 pl-2">{langItem.level.trim()}</span> : null}
                    </span>
                );
            }

            if (section.layout === 'bar') {
                const levelValue = langItem.level ? levelMap[langItem.level] : 0;
                if (!levelValue) return compactDisplay;
                
                return (
                    <div className={isInline ? 'inline-block min-w-[10rem]' : 'w-full'}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-semibold" style={commonHeadingStyle}>{langItem.language}</span>
                            <span className="text-xs" style={commonBodyStyle}>{langItem.level}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full" style={{ width: `${levelValue * 20}%`, backgroundColor: accentColor }}></div>
                        </div>
                    </div>
                );
            }

            if (section.layout === 'dots') {
                const levelValue = langItem.level ? levelMap[langItem.level] : 0;
                if (!levelValue) return compactDisplay;

                return (
                        <div className="flex items-center gap-3 text-sm">
                        <span className="font-semibold" style={commonHeadingStyle}>{langItem.language}</span>
                        <div className="flex-shrink-0 flex gap-1.5">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: i < levelValue ? accentColor : '#e5e7eb' }}></span>
                            ))}
                        </div>
                        </div>
                );
            }
            
            // Default list layout
            return <p className={isInline ? '' : 'mb-1'}><span className="font-semibold" style={commonHeadingStyle}>{langItem.language}</span>{langItem.level && langItem.level.trim() ? <span style={commonBodyStyle}>: {langItem.level.trim()}</span> : null}</p>
        }
        case 'Custom': {
            const customItem = item as CustomEntry;
            return (
                <div className="mb-2">
                    <h4 className="font-semibold" style={commonHeadingStyle}>
                        <HeadingPart text={customItem.title} link={customItem.titleLink} extra={customItem.titleExtra} textStyle={commonHeadingStyle} linkStyle={commonLinkStyle} />
                    </h4>
                    <div className="prose" style={commonBodyStyle} dangerouslySetInnerHTML={{ __html: customItem.description }}/>
                </div>
            )
        }
        default: return null;
    }
};

const renderSkillGroup = (category: string, items: SkillEntry[], section: CVSection, style: CVStyle) => {
    return (
        <div className={category ? "mt-3" : ""}>
            {category && <h4 className="font-semibold text-sm mb-2" style={{color: style.headingColor, opacity: 0.9}}>{category}</h4>}
            <div className="flex flex-wrap -mb-2">
                {items.map(item => <div key={item.id}>{renderItemContent(section, item, style)}</div>)}
            </div>
        </div>
    );
};

const renderLanguageGroup = (items: LanguageEntry[], section: CVSection, style: CVStyle) => {
     const isInline = section.displayStyle === 'inline';
     return (
         <div className={isInline ? "flex flex-wrap items-center gap-x-6 gap-y-3" : "flex flex-col gap-y-3"}>
             {items.map(item => <div key={item.id}>{renderItemContent(section, item, style)}</div>)}
         </div>
     )
}


// --- Main Component ---

export const CVPreview = React.forwardRef<HTMLDivElement, CVPreviewProps>(({ cvData, style }, ref) => {
    const { personalInfo, sections } = cvData;
    const measureRef = useRef<HTMLDivElement>(null);
    const [pageLayout, setPageLayout] = useState<Record<string, number>>({});
    const [layoutReady, setLayoutReady] = useState(false);

    // Header Renderer
    const headerAlignmentClass = style.pageAlignment === 'center' ? 'text-center' : 'text-left';
    const headerFlexAlignmentClass = style.pageAlignment === 'center' ? 'justify-center' : 'justify-start';

    const renderHeader = () => (
        <header className={`mb-8 ${headerAlignmentClass}`}>
            <h1 className="text-4xl font-bold" style={{ color: style.headingColor }}>{personalInfo.name}</h1>
            <h2 className="text-xl font-light mt-1" style={{ color: style.accentColor }}>{personalInfo.jobTitle}</h2>
                <div className={`mt-4 text-sm flex ${headerFlexAlignmentClass}`}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${style.personalInfoColumns || 2}, 1fr)`,
                    columnGap: `${style.personalInfoColumnGap}rem`,
                    rowGap: `${style.personalInfoRowGap}rem`,
                }}>
                    {personalInfo.details.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'baseline' }}>
                            <strong className="font-bold" style={{color: style.headingColor, paddingRight: `${style.personalInfoLabelValueGap}rem`, whiteSpace: 'nowrap'}}>{item.label}</strong>
                            <PersonalInfoValue item={item} style={style} />
                        </div>
                    ))}
                </div>
            </div>
        </header>
    );

    // Dimensions based on Paper Size
    const isLetter = style.paperSize === 'Letter';
    // Use fixed pixel widths matching standard DPI for print consistency
    const widthStyle = isLetter ? { width: '816px', minHeight: '1056px' } : { width: '794px', minHeight: '1123px' };
    const pagePxHeight = isLetter ? LETTER_HEIGHT_PX : A4_HEIGHT_PX;

    // Measurement Logic
    const calculateLayout = useCallback(() => {
        if (!measureRef.current) return;
        
        // If the component is hidden (e.g. on mobile tab), offsetParent is null. 
        if (measureRef.current.offsetParent === null) return;

        const pageHeight = getPageHeight(style.paperSize || 'A4');
        const padding = getVerticalPadding(style.margin);
        const contentHeightAvailable = pageHeight - padding;
        
        let currentPage = 0;
        let currentHeight = 0;
        const newLayout: Record<string, number> = {};

        // Measure children directly. 
        // IMPORTANT: The measureRef container must have the same width/padding context as the real pages for accurate height.
        const elements = Array.from(measureRef.current.children) as HTMLElement[];

        elements.forEach(el => {
            const id = el.dataset.id;
            const isPageBreak = el.dataset.break === 'true';
            
            if (!id) return;

            const rect = el.getBoundingClientRect();
            // Use Math.ceil to avoid sub-pixel rounding issues
            const elHeight = Math.ceil(rect.height);
            const computedStyle = window.getComputedStyle(el);
            const marginTop = parseFloat(computedStyle.marginTop) || 0;
            const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
            const totalElHeight = elHeight + marginTop + marginBottom;
            
            // Logic for explicit page break
            if (isPageBreak && currentHeight > 0) {
                currentPage++;
                currentHeight = 0;
            }

            // Logic for overflow
            // We use a small tolerance (1px) to avoid precision errors
            if (currentHeight + totalElHeight > contentHeightAvailable + 1) {
                // If it's the very first element on the page and it doesn't fit, 
                // we must keep it here (overflow), otherwise we push to next page
                if (currentHeight > 0) {
                    currentPage++;
                    currentHeight = 0;
                }
            }

            newLayout[id] = currentPage;
            currentHeight += totalElHeight;
        });

        setPageLayout(newLayout);
        setLayoutReady(true);

    }, [cvData, style]);

    // Recalculate when data changes
    useLayoutEffect(() => {
        calculateLayout();
    }, [calculateLayout]);

    // Recalculate when visibility/size changes (e.g. mobile tab switch)
    useEffect(() => {
        const ro = new ResizeObserver(() => {
           calculateLayout();
        });
        
        if (measureRef.current && measureRef.current.parentElement) {
            ro.observe(measureRef.current.parentElement);
        }
        
        window.addEventListener('resize', calculateLayout);

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', calculateLayout);
        };
    }, [calculateLayout]);


    // Determine number of pages. 
    // If layout isn't ready, we show 1 page to prevent empty flash, 
    // and fallback logic below ensures content is displayed on page 0.
    const numPages = Object.values(pageLayout).length > 0 ? Math.max(...(Object.values(pageLayout) as number[])) + 1 : 1;

    // Helper to generate flattened renderable blocks
    const generateRenderBlocks = (isMeasurement: boolean) => {
        const blocks: React.ReactElement[] = [];

        // Header
        blocks.push(
            <div key="header" data-id="header" className="mb-8">
                {renderHeader()}
            </div>
        );

        sections.filter(s => s.visible).forEach(section => {
             // Section Header
             blocks.push(
                 <div 
                    key={`section-header-${section.id}`} 
                    data-id={`section-header-${section.id}`} 
                    data-break={section.pageBreakBefore ? 'true' : 'false'}
                    className="mt-4" // simulate margin logic
                 >
                     {renderSectionHeader(section, style)}
                 </div>
             );

             // Items
             if (section.type === 'Skills' && section.layout !== 'list') {
                 // Grouped Skills
                 const skills = section.items as SkillEntry[];
                 const categorized: Record<string, SkillEntry[]> = {};
                 const uncategorized: SkillEntry[] = [];
         
                 skills.forEach(skill => {
                     if (skill.category?.trim()) {
                         if (!categorized[skill.category]) categorized[skill.category] = [];
                         categorized[skill.category].push(skill);
                     } else {
                         uncategorized.push(skill);
                     }
                 });

                 if (uncategorized.length > 0) {
                     blocks.push(
                         <div key={`group-${section.id}-uncat`} data-id={`group-${section.id}-uncat`}>
                             {renderSkillGroup('', uncategorized, section, style)}
                         </div>
                     );
                 }
                 Object.entries(categorized).forEach(([cat, items]) => {
                    blocks.push(
                        <div key={`group-${section.id}-${cat}`} data-id={`group-${section.id}-${cat}`}>
                            {renderSkillGroup(cat, items, section, style)}
                        </div>
                    );
                 });

             } else if (section.type === 'Languages') {
                 // Grouped Languages
                 const langs = section.items as LanguageEntry[];
                 blocks.push(
                    <div key={`group-${section.id}-langs`} data-id={`group-${section.id}-langs`}>
                        {renderLanguageGroup(langs, section, style)}
                    </div>
                );
             } else {
                 // Standard List Items
                 section.items.forEach(item => {
                     blocks.push(
                         <div key={item.id} data-id={item.id}>
                             {renderItemContent(section, item, style)}
                         </div>
                     );
                 });
             }
        });
        return blocks;
    };


    return (
        <div ref={ref}>
            {/* Inject strict font styles to enforce consistency even with pasted content */}
            <style>{`
                .cv-page, .cv-page *, .cv-measurement-container, .cv-measurement-container * {
                    font-family: ${style.fontFamily} !important;
                }
            `}</style>

            {/* Hidden Measurement Container */}
            <div 
                ref={measureRef} 
                style={{ 
                    ...widthStyle, 
                    fontSize: '1rem', 
                    position: 'absolute', 
                    visibility: 'hidden', 
                    zIndex: -1000,
                    top: 0,
                    left: 0,
                    height: 'auto',
                    minHeight: '0'
                }}
                // Apply margin directly here so children have correct width context.
                className={`cv-measurement-container ${style.fontSize} ${style.lineHeight} ${style.margin}`}
            >
                {/* Render children directly to ensure measureRef.children matches layout blocks */}
                {generateRenderBlocks(true)}
            </div>

            {/* Visible Pages */}
            {Array.from({ length: numPages }).map((_, pageIndex) => (
                <div
                    key={pageIndex}
                    className={`cv-page cv-page-shadow bg-white ${style.fontSize} ${style.lineHeight} ${style.margin} ${pageIndex > 0 ? 'mt-8' : ''}`}
                    style={{ 
                        color: style.bodyTextColor,
                        ...widthStyle,
                        position: 'relative', // Ensure relative positioning for absolute markers
                    }}
                >
                     {/* Side Ruler */}
                    <PageRuler heightPx={pagePxHeight} />

                    {/* Visual Marker for Page End */}
                    <div 
                        className="page-break-marker absolute left-0 w-full border-b-2 border-dashed border-red-300 z-50 pointer-events-none flex justify-end"
                        style={{ top: `${pagePxHeight}px` }}
                    >
                        <span className="text-red-400 text-xs font-mono bg-white px-1 -mb-2 mr-2">End of Page</span>
                    </div>

                    {/* 
                        Render logic:
                        - If layout is ready: check if item belongs to this page.
                        - If layout is NOT ready (layoutReady=false): Render everything on the first page (pageIndex=0) to act as a fallback.
                    */}
                    {( (layoutReady && pageLayout['header'] === pageIndex) || (!layoutReady && pageIndex === 0) ) && renderHeader()}
                    
                    <main>
                        {sections.filter(s => s.visible).map(section => {
                            const sectionHeaderPage = pageLayout[`section-header-${section.id}`];
                            // Show title if on this page OR if fallback mode on page 0
                            const showTitle = (layoutReady && sectionHeaderPage === pageIndex) || (!layoutReady && pageIndex === 0);
                            
                            // Get items that belong to this page
                            let pageItems: React.ReactElement[] = [];

                             if (section.type === 'Skills' && section.layout !== 'list') {
                                 // Skills logic (Groups)
                                 const skills = section.items as SkillEntry[];
                                 const categorized: Record<string, SkillEntry[]> = {};
                                 const uncategorized: SkillEntry[] = [];
                                 skills.forEach(skill => skill.category?.trim() ? (categorized[skill.category] = categorized[skill.category] || []).push(skill) : uncategorized.push(skill));
                                 
                                 // Check uncat group
                                 const uncatPage = pageLayout[`group-${section.id}-uncat`];
                                 if (uncategorized.length > 0 && ((layoutReady && uncatPage === pageIndex) || (!layoutReady && pageIndex === 0))) {
                                     pageItems.push(<div key={`uncat`} className="-mb-2">{renderSkillGroup('', uncategorized, section, style)}</div>);
                                 }
                                 // Check cat groups
                                 Object.entries(categorized).forEach(([cat, items]) => {
                                     const catPage = pageLayout[`group-${section.id}-${cat}`];
                                     if ((layoutReady && catPage === pageIndex) || (!layoutReady && pageIndex === 0)) {
                                         pageItems.push(<div key={cat} className="-mb-2">{renderSkillGroup(cat, items, section, style)}</div>);
                                     }
                                 });

                             } else if (section.type === 'Languages') {
                                 const groupPage = pageLayout[`group-${section.id}-langs`];
                                 if ((layoutReady && groupPage === pageIndex) || (!layoutReady && pageIndex === 0)) {
                                     pageItems.push(renderLanguageGroup(section.items as LanguageEntry[], section, style));
                                 }
                             } else {
                                 // Standard List
                                 pageItems = section.items
                                     .filter(item => {
                                         const itemPage = pageLayout[item.id];
                                         return (layoutReady && itemPage === pageIndex) || (!layoutReady && pageIndex === 0);
                                     })
                                     .map(item => <div key={item.id}>{renderItemContent(section, item, style)}</div>);
                             }

                             if (!showTitle && pageItems.length === 0) return null;

                             return (
                                 <div key={section.id} className={style.sectionSpacing}>
                                     {showTitle && renderSectionHeader(section, style)}
                                     <div className={section.type === 'Languages' || (section.type === 'Skills' && section.layout !== 'list') ? "" : "space-y-0"}>
                                         {pageItems}
                                     </div>
                                 </div>
                             );
                        })}
                    </main>
                </div>
            ))}
        </div>
    );
});