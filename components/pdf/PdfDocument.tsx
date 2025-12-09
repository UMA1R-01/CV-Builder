
import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font, Link } from '@react-pdf/renderer';
import { CVData, CVStyle, DateFormat, WorkExperienceEntry, EducationEntry, SkillEntry, ProjectEntry, CertificationEntry, LanguageEntry, CustomEntry, CVSection, PersonalInfoItem } from '../../types';
import HtmlToPdf from './html-to-pdf';

const PdfDocument: React.FC<{ cvData: CVData; style: CVStyle }> = ({ cvData, style }) => {
    const { personalInfo, sections } = cvData;
    const {
        fontFamily,
        fontSize,
        lineHeight,
        margin,
        headingColor,
        bodyTextColor,
        accentColor,
        sectionSpacing,
        dateFormat,
        pageAlignment,
        personalInfoColumns,
        personalInfoColumnGap,
        personalInfoRowGap,
        personalInfoLabelValueGap,
    } = style;

    const parseNumeric = (str: string | undefined, fallback: number) => {
        if (!str) return fallback;
        const match = str.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : fallback;
    };

    const baseFontSize = parseNumeric(fontSize, 11);
    const pageMargin = parseNumeric(margin, 8) * 4;
    const lh = parseNumeric(lineHeight, 1.5);
    const sectionMargin = parseNumeric(sectionSpacing, 4) * 4;
    const piColGap = parseNumeric(personalInfoColumnGap, 1) * 16;
    const piRowGap = parseNumeric(personalInfoRowGap, 0.5) * 16;
    const piLabelGap = parseNumeric(personalInfoLabelValueGap, 0.5) * 16;
    const piCols = personalInfoColumns || 2;


    const styles = StyleSheet.create({
        page: { fontFamily: style.fontFamily.split(',')[0].replace(/'/g, ''), fontSize: baseFontSize, lineHeight: lh, padding: pageMargin, color: bodyTextColor },
        header: { marginBottom: 20, textAlign: pageAlignment === 'center' ? 'center' : 'left', alignItems: pageAlignment === 'center' ? 'center' : 'flex-start' },
        name: { fontSize: baseFontSize * 2, fontWeight: 700, color: headingColor },
        jobTitle: { fontSize: baseFontSize * 1.25, marginTop: 2, color: accentColor, opacity: 0.9 },
        personalInfoContainer: { marginTop: 15, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', columnGap: piColGap, rowGap: piRowGap },
        personalInfoItem: { flexDirection: 'row', alignItems: 'baseline', width: `${100 / piCols - (piCols > 1 ? (piColGap / 10) : 0)}%` },
        personalInfoLabel: { fontWeight: 700, color: headingColor, marginRight: piLabelGap, flexShrink: 0 },
        personalInfoValue: { flexShrink: 1, overflow: 'hidden' },
        link: { color: accentColor, textDecoration: 'none' },
        section: { marginBottom: sectionMargin, breakAfter: 'avoid' },
        sectionTitle: { fontSize: baseFontSize * 1.1, fontWeight: 700, color: headingColor, borderBottomWidth: 1, borderBottomColor: headingColor, paddingBottom: 4, marginBottom: 8, textTransform: 'uppercase' },
        itemContainer: { marginBottom: 10 },
        flexBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
        itemMain: { flex: 1 },
        itemDate: { fontSize: baseFontSize * 0.8, color: '#555', marginLeft: 10, flexShrink: 0 },
        itemHeading: { fontSize: baseFontSize * 1.05, fontWeight: 700, color: headingColor },
        itemSubheading: { fontWeight: 600, marginTop: 1, color: bodyTextColor },
        description: { marginTop: 4, fontSize: baseFontSize * 0.95 },
        skillPill: { backgroundColor: accentColor, color: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 6, marginBottom: 6, fontSize: baseFontSize * 0.9 },
    });

    const formatDate = (dateString: string, format: DateFormat): string => {
        if (!dateString) return '';
        if (dateString.toLowerCase() === 'present') return 'Present';
        try {
            const date = new Date(dateString);
            const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
            const year = adjustedDate.getUTCFullYear();
            const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(adjustedDate);
            const monthNum = (adjustedDate.getUTCMonth() + 1).toString().padStart(2, '0');

            switch (format) {
                case 'Month YYYY': return `${month} ${year}`;
                case 'MM/YYYY': return `${monthNum}/${year}`;
                case 'YYYY': return `${year}`;
                default: return dateString;
            }
        } catch(e) { return dateString; }
    };

    const HeadingPart: React.FC<{ text?: string, link?: string, style?: any }> = ({ text, link, style }) => {
        if (!text) return null;
        const cleanLink = link ? `https://${link.replace(/^https?:\/\//, '')}` : undefined;
        return cleanLink ? <Link src={cleanLink} style={[styles.link, style]}><Text>{text}</Text></Link> : <Text style={style}>{text}</Text>;
    };

    const renderItem = (section: CVSection, item: any) => {
        const key = item.id;
        switch (section.type) {
            case 'Work Experience': {
                const workItem = item as WorkExperienceEntry;
                return (
                    <View key={key} style={styles.itemContainer} wrap={false}>
                        <View style={styles.flexBetween}>
                            <View style={styles.itemMain}>
                                <HeadingPart text={workItem.company} link={workItem.companyLink} style={styles.itemHeading} />
                                <HeadingPart text={workItem.jobTitle} link={workItem.jobTitleLink} style={styles.itemSubheading} />
                            </View>
                            <Text style={styles.itemDate}>{formatDate(workItem.startDate, dateFormat)} - {formatDate(workItem.endDate, dateFormat)}</Text>
                        </View>
                        {workItem.description && <HtmlToPdf html={workItem.description} style={styles.description} />}
                    </View>
                );
            }
            case 'Education': {
                const eduItem = item as EducationEntry;
                return (
                    <View key={key} style={styles.itemContainer} wrap={false}>
                        <View style={styles.flexBetween}>
                            <View style={styles.itemMain}>
                                <HeadingPart text={eduItem.institution} link={eduItem.institutionLink} style={styles.itemHeading} />
                                <HeadingPart text={eduItem.degree} link={eduItem.degreeLink} style={styles.itemSubheading} />
                            </View>
                            <Text style={styles.itemDate}>{formatDate(eduItem.startDate, dateFormat)} - {formatDate(eduItem.endDate, dateFormat)}</Text>
                        </View>
                        {eduItem.description && <HtmlToPdf html={eduItem.description} style={styles.description} />}
                    </View>
                );
            }
            case 'Skills': {
                // This case is handled by the custom rendering logic below
                return null;
            }
            case 'Projects': {
                const projItem = item as ProjectEntry;
                return (
                    <View key={key} style={styles.itemContainer} wrap={false}>
                        <HeadingPart text={projItem.projectName} link={projItem.projectNameLink} style={styles.itemHeading} />
                        {projItem.description && <HtmlToPdf html={projItem.description} style={styles.description} />}
                    </View>
                );
            }
            case 'Certifications': {
                const certItem = item as CertificationEntry;
                return (
                    <View key={key} style={[styles.itemContainer, styles.flexBetween]} wrap={false}>
                        <View style={styles.itemMain}>
                            <HeadingPart text={certItem.name} link={certItem.nameLink} style={styles.itemHeading} />
                            <Text style={styles.itemSubheading}>{certItem.issuer}</Text>
                        </View>
                        <Text style={styles.itemDate}>{formatDate(certItem.date, dateFormat)}</Text>
                    </View>
                );
            }
            case 'Languages': {
                const langItem = item as LanguageEntry;
                if (section.layout === 'pills') {
                    return (
                        <Text key={key} style={styles.skillPill}>
                            {langItem.language}
                            {langItem.level ? ` (${langItem.level})` : ''}
                        </Text>
                    );
                }
                return (
                    <View key={key} style={{ flexDirection: 'row', marginBottom: 4 }}>
                        <Text style={{ fontWeight: 700, color: headingColor }}>{langItem.language}</Text>
                        {langItem.level && <Text>: {langItem.level}</Text>}
                    </View>
                );
            }
            case 'Custom': {
                const customItem = item as CustomEntry;
                return (
                    <View key={key} style={styles.itemContainer} wrap={false}>
                        <HeadingPart text={customItem.title} link={customItem.titleLink} style={styles.itemHeading} />
                        {customItem.description && <HtmlToPdf html={customItem.description} style={styles.description} />}
                    </View>
                );
            }
            default:
                return null;
        }
    };

    const pages: CVSection[][] = [];
    let currentPage: CVSection[] = [];
    sections.filter(s => s.visible).forEach(section => {
        currentPage.push(section);
        if (section.pageBreakAfter) {
            pages.push(currentPage);
            currentPage = [];
        }
    });
    if (currentPage.length > 0) pages.push(currentPage);

    return (
        <Document>
            {pages.map((pageSections, pageIndex) => (
                <Page key={pageIndex} size="A4" style={styles.page}>
                    {pageIndex === 0 && (
                        <View style={styles.header}>
                            <Text style={styles.name}>{personalInfo.name}</Text>
                            <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text>
                             <View style={styles.personalInfoContainer}>
                                {personalInfo.details.map(item => (
                                    <View key={item.id} style={styles.personalInfoItem}>
                                        <Text style={styles.personalInfoLabel}>{item.label}</Text>
                                        <HeadingPart text={item.value} style={styles.personalInfoValue} />
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {pageSections.map(section => (
                        <View key={section.id} style={styles.section} wrap>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            {section.type === 'Skills' ? (
                                <View>
                                    {Object.entries(
                                        (section.items as SkillEntry[]).reduce((acc, skill) => {
                                            const category = skill.category || 'Uncategorized';
                                            if (!acc[category]) acc[category] = [];
                                            acc[category].push(skill);
                                            return acc;
                                        }, {} as Record<string, SkillEntry[]>)
                                    ).map(([category, skills]) => (
                                        <View key={category} style={{ marginBottom: 8 }}>
                                            <Text style={styles.itemSubheading}>{category}</Text>
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                                                {skills.map(skill => (
                                                    <Text key={skill.id} style={styles.skillPill}>{skill.skillName}</Text>
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={{ flexDirection: 'column', flexWrap: 'wrap' }}>
                                    {section.items.map(item => renderItem(section, item))}
                                </View>
                            )}
                        </View>
                    ))}
                </Page>
            ))}
        </Document>
    );
};

export default PdfDocument;
