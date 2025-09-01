import React from 'react';
import { CVData, CVStyle, DateFormat, WorkExperienceEntry, EducationEntry, SkillEntry, ProjectEntry, CertificationEntry, LanguageEntry, CustomEntry, CVSection, PersonalInfoItem } from '../types';

interface CVPreviewProps {
    cvData: CVData;
    style: CVStyle;
}

const formatDate = (dateString: string, format: DateFormat): string => {
    if (!dateString) return '';
    if (dateString.toLowerCase() === 'present') return 'Present';
    try {
        const date = new Date(dateString);
        // Add timezone offset to prevent date from shifting
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

    // Check for email
    if (lowerLabel.includes('email')) {
        return <a href={`mailto:${value}`} className={commonClasses} style={linkStyle}>{value}</a>;
    }

    // Check for websites
    const websiteKeywords = ['website', 'linkedin', 'github', 'portfolio', 'twitter', 'gitlab', 'blog'];
    if (websiteKeywords.some(keyword => lowerLabel.includes(keyword))) {
        const href = value.startsWith('http') ? value : `https://${value}`;
        return <a href={href} target="_blank" rel="noopener noreferrer" className={commonClasses} style={linkStyle}>{value}</a>;
    }

    // Default: non-clickable text
    return <span className="text-left break-words">{value}</span>;
};


const SectionRenderer: React.FC<{ section: CVData['sections'][0], style: CVStyle }> = ({ section, style }) => {
    if (!section.visible || section.items.length === 0) return null;
    
    const { headingColor, bodyTextColor, accentColor } = style;

    const renderItem = (item: any) => {
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
                    <div key={item.id} className="mb-4">
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
                    <div key={item.id} className="mb-3">
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
                        <p key={item.id} className="mb-1 w-full" style={commonBodyStyle}>
                            <span className="font-semibold" style={commonHeadingStyle}>{skillItem.skillName}</span>
                            {skillItem.level && <span className="opacity-90"> ({skillItem.level})</span>}
                            {skillItem.description && <span className="italic opacity-80">: {skillItem.description}</span>}
                        </p>
                    );
                }
                return <span key={item.id} className="inline-block text-white rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2" style={{ backgroundColor: accentColor }}>{skillItem.skillName}</span>;
            }
            case 'Projects': {
                const projItem = item as ProjectEntry;
                return (
                     <div key={item.id} className="mb-3">
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
                    <div key={item.id} className="mb-2 flex justify-between">
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
                    <p key={item.id} style={commonBodyStyle}>
                        <span className="font-semibold" style={commonHeadingStyle}>{langItem.language}</span>
                        {langItem.level && langItem.level.trim() ? <span className="opacity-90"> ({langItem.level.trim()})</span> : null}
                    </p>
                );

                if (section.layout === 'compact') {
                    return compactDisplay;
                }

                if (section.layout === 'pills') {
                    return (
                        <span key={item.id} className="inline-flex items-center text-white rounded-full px-3 py-1.5 text-sm font-medium" style={{ backgroundColor: accentColor }}>
                            {langItem.language}
                            {langItem.level && langItem.level.trim() ? <span className="ml-2 text-xs font-normal opacity-80 border-l border-white/50 pl-2">{langItem.level.trim()}</span> : null}
                        </span>
                    );
                }

                if (section.layout === 'bar') {
                    const levelValue = langItem.level ? levelMap[langItem.level] : 0;
                    if (!levelValue) return compactDisplay;
                    
                    return (
                        <div key={item.id} className={isInline ? 'inline-block min-w-[10rem]' : 'w-full'}>
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
                         <div key={item.id} className="flex items-center gap-3 text-sm">
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
                return <p key={item.id} className={isInline ? '' : 'mb-1'}><span className="font-semibold" style={commonHeadingStyle}>{langItem.language}</span>{langItem.level && langItem.level.trim() ? <span style={commonBodyStyle}>: {langItem.level.trim()}</span> : null}</p>
             }
             case 'Custom': {
                const customItem = item as CustomEntry;
                return (
                    <div key={item.id} className="mb-2">
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
    
    if (section.type === 'Languages') {
        const isInline = section.displayStyle === 'inline';
        return (
            <div className={style.sectionSpacing}>
                <h3 className="text-base font-bold uppercase tracking-wider border-b pb-2 mb-3" style={{ color: headingColor, borderColor: headingColor }}>{section.title}</h3>
                <div className={isInline ? "flex flex-wrap items-center gap-x-6 gap-y-3" : "flex flex-col gap-y-3"}>
                    {section.items.map(item => renderItem(item))}
                </div>
            </div>
        );
    }

    if (section.type === 'Skills' && section.layout !== 'list') {
        const skills = section.items as SkillEntry[];
        const categorized: Record<string, SkillEntry[]> = {};
        const uncategorized: SkillEntry[] = [];

        skills.forEach(skill => {
            if (skill.category?.trim()) {
                if (!categorized[skill.category]) {
                    categorized[skill.category] = [];
                }
                categorized[skill.category].push(skill);
            } else {
                uncategorized.push(skill);
            }
        });

        return (
            <div className={style.sectionSpacing}>
                <h3 className="text-base font-bold uppercase tracking-wider border-b pb-2 mb-3" style={{ color: headingColor, borderColor: headingColor }}>{section.title}</h3>
                {uncategorized.length > 0 && (
                    <div className="flex flex-wrap -mb-2">
                        {uncategorized.map(item => <div key={item.id}>{renderItem(item)}</div>)}
                    </div>
                )}
                {Object.entries(categorized).map(([category, items]) => (
                    <div key={category} className={uncategorized.length > 0 ? "mt-3" : ""}>
                         <h4 className="font-semibold text-sm mb-2" style={{color: headingColor, opacity: 0.9}}>{category}</h4>
                         <div className="flex flex-wrap -mb-2">
                            {items.map(item => <div key={item.id}>{renderItem(item)}</div>)}
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    return (
        <div className={style.sectionSpacing}>
            <h3 className="text-base font-bold uppercase tracking-wider border-b pb-2 mb-3" style={{ color: headingColor, borderColor: headingColor }}>{section.title}</h3>
            <div>
                {section.items.map(item => renderItem(item))}
            </div>
        </div>
    );
};

export const CVPreview = React.forwardRef<HTMLDivElement, CVPreviewProps>(({ cvData, style }, ref) => {
    const { personalInfo, sections } = cvData;

    // Create pages based on sections with pageBreakAfter
    const pages: CVSection[][] = [];
    let currentPage: CVSection[] = [];
    
    sections.filter(s => s.visible).forEach(section => {
        currentPage.push(section);
        if (section.pageBreakAfter) {
            pages.push(currentPage);
            currentPage = [];
        }
    });
    
    if (currentPage.length > 0) {
        pages.push(currentPage);
    }

    const headerAlignmentClass = style.pageAlignment === 'center' ? 'text-center' : 'text-left';
    const headerFlexAlignmentClass = style.pageAlignment === 'center' ? 'justify-center' : 'justify-start';

    return (
        <div ref={ref}>
            {pages.map((pageSections, pageIndex) => (
                 <div
                    key={pageIndex}
                    className={`cv-page cv-page-shadow bg-white w-[794px] min-h-[1123px] ${style.fontSize} ${style.lineHeight} ${style.margin} ${pageIndex > 0 ? 'mt-8' : ''}`}
                    style={{ fontFamily: style.fontFamily, color: style.bodyTextColor }}
                >
                    {pageIndex === 0 && (
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
                    )}
                    <main>
                        {pageSections.map(section => (
                            <div key={section.id}>
                                <SectionRenderer section={section} style={style} />
                            </div>
                        ))}
                    </main>
                </div>
            ))}
        </div>
    );
});