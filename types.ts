

export type UniqueIdentifier = string;

export interface PersonalInfoItem {
    id: UniqueIdentifier;
    label: string;
    value: string;
}

export interface PersonalInfo {
    name: string;
    jobTitle: string;
    details: PersonalInfoItem[];
}

export type SectionType = 
    | 'Work Experience' 
    | 'Education' 
    | 'Skills' 
    | 'Projects' 
    | 'Certifications' 
    | 'Languages' 
    | 'Custom';

export interface CVEntry {
    id: UniqueIdentifier;
    [key: string]: any;
}

export interface WorkExperienceEntry extends CVEntry {
    jobTitle: string;
    jobTitleLink?: string;
    jobTitleExtra?: string;
    company: string;
    companyLink?: string;
    companyExtra?: string;
    location:string;
    startDate: string;
    endDate: string;
    description: string; // Will contain HTML
}

export interface EducationEntry extends CVEntry {
    degree: string;
    degreeLink?: string;
    degreeExtra?: string;
    institution: string;
    institutionLink?: string;
    institutionExtra?: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string; // Will contain HTML
}

export interface SkillEntry extends CVEntry {
    skillName: string;
    level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | '';
    category?: string;
    description?: string;
}

export interface ProjectEntry extends CVEntry {
    projectName: string;
    projectNameLink?: string;
    projectNameExtra?: string;
    link: string;
    description: string; // Will contain HTML
}

export interface CertificationEntry extends CVEntry {
    name: string;
    nameLink?: string;
    nameExtra?: string;
    issuer: string;
    date: string;
}

export interface LanguageEntry extends CVEntry {
    language: string;
    level?: string;
}

export interface CustomEntry extends CVEntry {
    title: string;
    titleLink?: string;
    titleExtra?: string;
    description: string; // Will contain HTML
}

export interface CVSection {
    id: UniqueIdentifier;
    title: string;
    type: SectionType;
    items: CVEntry[];
    layout?: 'list' | 'compact' | 'chips' | 'bullets' | 'bar' | 'dots' | 'pills';
    displayStyle?: 'multiline' | 'inline';
    visible: boolean;
    pageBreakAfter?: boolean;
}

export interface CVData {
    personalInfo: PersonalInfo;
    sections: CVSection[];
}

export type DateFormat = 'MM/YYYY' | 'Month YYYY' | 'YYYY';
export type SortKey = 'startDate' | 'date' | 'skillName' | 'projectName' | 'degree' | 'jobTitle' | 'company' | 'name' | 'title' | 'language' | 'descriptionLength';

export interface CVStyle {
    fontFamily: string;
    fontSize: 'text-xs' | 'text-sm' | 'text-base' | 'text-lg';
    lineHeight: 'leading-tight' | 'leading-normal' | 'leading-relaxed';
    margin: 'p-4' | 'p-8' | 'p-12';
    sectionSpacing: 'mb-3' | 'mb-4' | 'mb-6';
    dateFormat: DateFormat;
    pageAlignment: 'left' | 'center';
    accentColor: string;
    headingColor: string;
    bodyTextColor: string;
    headingStyle: 'companyFirst' | 'titleFirst';
    personalInfoColumns: 1 | 2 | 3 | 4;
    personalInfoColumnGap: number;
    personalInfoRowGap: number;
    personalInfoLabelValueGap: number;
}

export interface SavedCV {
    id: string;
    name: string;
    data: CVData;
    style: CVStyle;
    lastModified: number;
}