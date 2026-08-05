// ---------- Personal info ----------

export interface PersonalDetail {
  id: string
  label: string
  value: string
}

export interface PersonalInfo {
  name: string
  jobTitle: string
  details: PersonalDetail[]
}

// ---------- Section items (per type) ----------

export interface WorkExperienceItem {
  id: string
  jobTitle: string
  jobTitleLink: string
  jobTitleExtra: string
  company: string
  companyLink: string
  companyExtra: string
  location: string
  startDate: string
  endDate: string // literal "Present" when ongoing
  description: string // rich-text HTML
}

export interface EducationItem {
  id: string
  degree: string
  degreeLink: string
  degreeExtra: string
  institution: string
  institutionLink: string
  institutionExtra: string
  location: string
  startDate: string
  endDate: string // literal "Present" when ongoing
  description: string
}

export type SkillLevel = '' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'

export interface SkillItem {
  id: string
  skillName: string
  level: SkillLevel
  category: string
  description: string
}

export interface ProjectItem {
  id: string
  projectName: string
  projectNameLink: string
  projectNameExtra: string
  projectUrl: string
  description: string
}

export interface CertificationItem {
  id: string
  name: string
  nameLink: string
  nameExtra: string
  issuer: string
  date: string
}

export type LanguageLevel =
  | 'Elementary'
  | 'Intermediate'
  | 'Advanced'
  | 'Fluent'
  | 'Native'
  | 'Custom'

export interface LanguageItem {
  id: string
  language: string
  level: LanguageLevel
  customLevel: string // seeded with a single space when level === 'Custom'
}

export interface CustomItem {
  id: string
  title: string
  titleLink: string
  titleExtra: string
  description: string
}

export type SectionItem =
  | WorkExperienceItem
  | EducationItem
  | SkillItem
  | ProjectItem
  | CertificationItem
  | LanguageItem
  | CustomItem

// ---------- Sections ----------

export type SectionType =
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'custom'

export type SkillsDisplayStyle = 'chips' | 'list'
export type LanguagesDisplayStyle = 'compact' | 'pills' | 'list' | 'bar' | 'dots'
export type LanguagesArrangement = 'inline' | 'multiline'

interface BaseSection {
  id: string
  title: string
  visible: boolean
  pageBreakBefore: boolean
  /** Dead data for every type except Skills/Languages — kept for parity with the original data model. */
  layout: 'bullets'
}

export interface WorkExperienceSection extends BaseSection {
  type: 'experience'
  displayStyle: 'bullets'
  items: WorkExperienceItem[]
}

export interface EducationSection extends BaseSection {
  type: 'education'
  displayStyle: 'bullets'
  items: EducationItem[]
}

export interface SkillsSection extends BaseSection {
  type: 'skills'
  displayStyle: SkillsDisplayStyle
  items: SkillItem[]
}

export interface ProjectsSection extends BaseSection {
  type: 'projects'
  displayStyle: 'bullets'
  items: ProjectItem[]
}

export interface CertificationsSection extends BaseSection {
  type: 'certifications'
  displayStyle: 'bullets'
  items: CertificationItem[]
}

export interface LanguagesSection extends BaseSection {
  type: 'languages'
  displayStyle: LanguagesDisplayStyle
  arrangement: LanguagesArrangement
  items: LanguageItem[]
}

export interface CustomSection extends BaseSection {
  type: 'custom'
  displayStyle: 'bullets'
  items: CustomItem[]
}

export type CVSection =
  | WorkExperienceSection
  | EducationSection
  | SkillsSection
  | ProjectsSection
  | CertificationsSection
  | LanguagesSection
  | CustomSection

export interface CVData {
  personalInfo: PersonalInfo
  sections: CVSection[]
}

// ---------- Style ----------

/**
 * One font family, applied uniformly to the entire CV (name, section titles, entry headings,
 * and body text alike) — deliberately a single axis rather than splitting "heading font" from
 * "body font": mixing two families reads as inconsistent rather than intentional. Grouped into
 * sans-serif/serif for the picker UI via `FONT_FAMILY_GROUPS` in constants.ts, but the grouping
 * is presentation-only — every preset here applies everywhere.
 */
export type FontFamilyPreset =
  | 'Poppins'
  | 'Roboto'
  | 'Open Sans'
  | 'Lato'
  | 'Source Sans Pro'
  | 'Arial'
  | 'Helvetica'
  | 'Calibri'
  | 'Times New Roman'
  | 'Georgia'
  | 'Fraunces'
  | 'Playfair Display'
  | 'DM Serif Display'
  | 'Libre Baskerville'
  | 'Lora'
  | 'Bitter'

export type FontSizePreset = 'xs' | 'sm' | 'base' | 'lg'
export type LineHeightPreset = 'tight' | 'normal' | 'relaxed'
export type PaperSize = 'A4' | 'Letter'
export type SpacingPreset = 'small' | 'medium' | 'large'
export type HeaderAlignment = 'left' | 'center'
export type HeadingStyle = 'companyFirst' | 'titleFirst'
export type DateFormat = 'monthYYYY' | 'MM/YYYY' | 'YYYY'

/**
 * Structural/decorative treatment for the personal-info header and section titles — always
 * single-column, single-flow layouts (no side-by-side columns), which is deliberate: multi-column
 * resumes are notoriously unreliable with ATS parsers. Everything a layout changes is purely
 * visual (borders, case, weight, color placement); it never alters the underlying reading order.
 */
export type CVLayout = 'classic' | 'minimal' | 'compactAts' | 'boldSerif'

export interface StyleConfig {
  fontFamily: FontFamilyPreset
  fontSize: FontSizePreset
  lineHeight: LineHeightPreset

  layout: CVLayout

  headingColor: string
  bodyColor: string

  paperSize: PaperSize
  margin: SpacingPreset
  sectionSpacing: SpacingPreset
  headerAlignment: HeaderAlignment
  headingStyle: HeadingStyle

  personalInfoColumns: number
  personalInfoColumnGap: number
  personalInfoRowGap: number
  personalInfoLabelGap: number

  dateFormat: DateFormat
}

// ---------- Persistence ----------

export interface SavedCV {
  id: string
  name: string
  data: CVData
  style: StyleConfig
  lastModified: number
}

export interface WipSnapshot {
  name: string
  data: CVData
  style: StyleConfig
  activeCVId: string | null
}
