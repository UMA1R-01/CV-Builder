import type {
  CVData,
  CVLayout,
  CVSection,
  FontFamilyPreset,
  SectionType,
  StyleConfig,
} from '@/types'

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

/** Every font preset, flat — used where grouping doesn't matter (e.g. iterating for a font-loading check). */
export const FONT_FAMILY_PRESETS: FontFamilyPreset[] = [
  'Poppins',
  'Roboto',
  'Open Sans',
  'Lato',
  'Source Sans Pro',
  'Arial',
  'Helvetica',
  'Calibri',
  'Times New Roman',
  'Georgia',
  'Fraunces',
  'Playfair Display',
  'DM Serif Display',
  'Libre Baskerville',
  'Lora',
  'Bitter',
]

/** Same presets grouped for the font picker UI — purely presentational, every font still applies uniformly to the whole CV. */
export const FONT_FAMILY_GROUPS: { label: string; fonts: FontFamilyPreset[] }[] = [
  {
    label: 'Sans Serif',
    fonts: ['Poppins', 'Roboto', 'Open Sans', 'Lato', 'Source Sans Pro', 'Arial', 'Helvetica', 'Calibri'],
  },
  {
    label: 'Serif',
    fonts: [
      'Times New Roman',
      'Georgia',
      'Fraunces',
      'Playfair Display',
      'DM Serif Display',
      'Libre Baskerville',
      'Lora',
      'Bitter',
    ],
  },
]

/** All single-column CV layouts, from quietest to boldest — order shown in the picker. */
export const LAYOUT_PRESETS: CVLayout[] = ['classic', 'minimal', 'compactAts', 'boldSerif']

export const LAYOUT_LABELS: Record<CVLayout, string> = {
  classic: 'Classic',
  minimal: 'Minimal',
  compactAts: 'Compact ATS',
  boldSerif: 'Bold Serif',
}

export const LAYOUT_DESCRIPTIONS: Record<CVLayout, string> = {
  classic: 'Bold underlines, balanced spacing',
  minimal: 'Quiet, understated, lots of air',
  compactAts: 'Tightest spacing, max content density',
  boldSerif: 'Editorial feel — larger scale, italic subtitle, thin rules',
}

/** Quick-pick swatches for the Accent/Heading/Body Text color fields — a spread of professional, legible resume colors. */
export const COLOR_PRESETS: string[] = [
  '#111113',
  '#374151',
  '#2563EB',
  '#0EA5E9',
  '#0D9488',
  '#16A34A',
  '#CA8A04',
  '#EA580C',
  '#DC2626',
  '#DB2777',
  '#9333EA',
  '#4F46E5',
]

export const FONT_STACKS: Record<FontFamilyPreset, string> = {
  Poppins: "'Poppins', sans-serif",
  Roboto: "'Roboto', sans-serif",
  'Open Sans': "'Open Sans', sans-serif",
  Lato: "'Lato', sans-serif",
  'Source Sans Pro': "'Source Sans 3', sans-serif",
  Arial: 'Arial, Helvetica, sans-serif',
  Helvetica: 'Helvetica, Arial, sans-serif',
  Calibri: "Calibri, 'Segoe UI', sans-serif",
  'Times New Roman': "'Times New Roman', Times, serif",
  Georgia: 'Georgia, serif',
  Fraunces: "'Fraunces', ui-serif, serif",
  'Playfair Display': "'Playfair Display', ui-serif, serif",
  'DM Serif Display': "'DM Serif Display', ui-serif, serif",
  'Libre Baskerville': "'Libre Baskerville', ui-serif, serif",
  Lora: "'Lora', ui-serif, serif",
  Bitter: "'Bitter', ui-serif, serif",
}

export const FONT_SIZE_PX: Record<StyleConfig['fontSize'], number> = {
  xs: 12,
  sm: 13,
  base: 14,
  lg: 16,
}

export const LINE_HEIGHT_VALUE: Record<StyleConfig['lineHeight'], number> = {
  tight: 1.25,
  normal: 1.45,
  relaxed: 1.7,
}

export const MARGIN_PX: Record<StyleConfig['margin'], number> = {
  small: 32,
  medium: 48,
  large: 64,
}

export const SECTION_SPACING_PX: Record<StyleConfig['sectionSpacing'], number> = {
  small: 12,
  medium: 20,
  large: 32,
}

export const PAGE_PX: Record<StyleConfig['paperSize'], [number, number]> = {
  A4: [794, 1123],
  Letter: [816, 1056],
}

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
  custom: 'Custom',
}

/** Sort keys available per section type, in the order they appear in the dropdown. */
export const SORT_KEYS_BY_TYPE: Record<SectionType, string[]> = {
  experience: ['Date', 'Title'],
  education: ['Date', 'Degree'],
  skills: ['Name'],
  projects: ['Name', 'Length'],
  certifications: ['Date', 'Name', 'Length'],
  languages: ['Language'],
  custom: ['Title', 'Length'],
}

export const DEFAULT_STYLE: StyleConfig = {
  fontFamily: 'Poppins',
  fontSize: 'base',
  lineHeight: 'normal',

  layout: 'classic',

  headingColor: '#111113',
  bodyColor: '#374151',

  paperSize: 'A4',
  margin: 'medium',
  sectionSpacing: 'medium',
  headerAlignment: 'left',
  headingStyle: 'companyFirst',

  personalInfoColumns: 2,
  personalInfoColumnGap: 1.5,
  personalInfoRowGap: 0.25,
  personalInfoLabelGap: 0.375,

  dateFormat: 'monthYYYY',
}

function makeDefaultCVData(): CVData {
  return {
    personalInfo: {
      name: 'Jane Doe',
      jobTitle: 'Senior Software Engineer',
      details: [
        { id: generateId(), label: 'Email:', value: 'jane.doe@example.com' },
        { id: generateId(), label: 'Phone:', value: '(555) 123-4567' },
        { id: generateId(), label: 'Location:', value: 'San Francisco, CA' },
        { id: generateId(), label: 'LinkedIn:', value: 'linkedin.com/in/janedoe' },
      ],
    },
    sections: [
      {
        id: generateId(),
        type: 'experience',
        title: 'Work Experience',
        visible: true,
        pageBreakBefore: false,
        layout: 'bullets',
        displayStyle: 'bullets',
        items: [
          {
            id: generateId(),
            jobTitle: 'Senior Software Engineer',
            jobTitleLink: '',
            jobTitleExtra: '',
            company: 'Tech Innovations Inc.',
            companyLink: '',
            companyExtra: '',
            location: 'San Francisco, CA',
            startDate: '2021-03',
            endDate: 'Present',
            description:
              '<ul><li>Led development of a microservices platform serving 2M+ daily active users.</li><li>Mentored a team of 5 engineers and drove adoption of TypeScript across the org.</li></ul>',
          },
          {
            id: generateId(),
            jobTitle: 'Software Engineer',
            jobTitleLink: '',
            jobTitleExtra: '',
            company: 'Digital Solutions LLC',
            companyLink: '',
            companyExtra: '',
            location: 'Oakland, CA',
            startDate: '2018-06',
            endDate: '2021-02',
            description:
              '<ul><li>Built and shipped customer-facing features for a B2B SaaS analytics product.</li></ul>',
          },
        ],
      },
      {
        id: generateId(),
        type: 'education',
        title: 'Education',
        visible: true,
        pageBreakBefore: false,
        layout: 'bullets',
        displayStyle: 'bullets',
        items: [
          {
            id: generateId(),
            degree: 'B.S. Computer Science',
            degreeLink: '',
            degreeExtra: '',
            institution: 'University of California, Berkeley',
            institutionLink: '',
            institutionExtra: '',
            location: 'Berkeley, CA',
            startDate: '2014-08',
            endDate: '2018-05',
            description: '',
          },
        ],
      },
      {
        id: generateId(),
        type: 'skills',
        title: 'Skills',
        visible: true,
        pageBreakBefore: false,
        layout: 'bullets',
        displayStyle: 'chips',
        items: [
          { id: generateId(), skillName: 'TypeScript', level: 'Expert', category: '', description: '' },
          { id: generateId(), skillName: 'React', level: 'Expert', category: '', description: '' },
          { id: generateId(), skillName: 'Node.js', level: 'Advanced', category: '', description: '' },
          { id: generateId(), skillName: 'PostgreSQL', level: 'Advanced', category: '', description: '' },
        ],
      },
      {
        id: generateId(),
        type: 'projects',
        title: 'Projects',
        visible: true,
        pageBreakBefore: false,
        layout: 'bullets',
        displayStyle: 'bullets',
        items: [
          {
            id: generateId(),
            projectName: 'Open Source Contribution Tracker',
            projectNameLink: '',
            projectNameExtra: '',
            projectUrl: 'https://github.com/janedoe/contrib-tracker',
            description: '<ul><li>A CLI tool for visualizing open-source contribution history.</li></ul>',
          },
        ],
      },
      {
        id: generateId(),
        type: 'certifications',
        title: 'Certifications',
        visible: false,
        pageBreakBefore: false,
        layout: 'bullets',
        displayStyle: 'bullets',
        items: [],
      },
      {
        id: generateId(),
        type: 'languages',
        title: 'Languages',
        visible: false,
        pageBreakBefore: false,
        layout: 'bullets',
        displayStyle: 'pills',
        arrangement: 'inline',
        items: [],
      },
    ] as CVSection[],
  }
}

export const DEFAULT_CV_DATA: CVData = makeDefaultCVData()

// ---------- Item / section factories ----------

export function createItem(type: SectionType) {
  const id = generateId()
  switch (type) {
    case 'experience':
      return {
        id,
        jobTitle: 'New Job',
        jobTitleLink: '',
        jobTitleExtra: '',
        company: 'Company',
        companyLink: '',
        companyExtra: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
      }
    case 'education':
      return {
        id,
        degree: 'New Degree',
        degreeLink: '',
        degreeExtra: '',
        institution: 'Institution',
        institutionLink: '',
        institutionExtra: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
      }
    case 'skills':
      return {
        id,
        skillName: 'New Skill',
        level: '' as const,
        category: '',
        description: '',
      }
    case 'projects':
      return {
        id,
        projectName: 'New Project',
        projectNameLink: '',
        projectNameExtra: '',
        projectUrl: '',
        description: '',
      }
    case 'certifications':
      return {
        id,
        name: 'New Certification',
        nameLink: '',
        nameExtra: '',
        issuer: '',
        date: '',
      }
    case 'languages':
      return {
        id,
        language: 'New Language',
        level: 'Intermediate' as const,
        customLevel: '',
      }
    case 'custom':
      return {
        id,
        title: 'New Item',
        titleLink: '',
        titleExtra: '',
        description: '',
      }
  }
}

export function createSection(type: SectionType, title?: string): CVSection {
  const base = {
    id: generateId(),
    title: title ?? SECTION_TYPE_LABELS[type],
    visible: true,
    pageBreakBefore: false,
    layout: 'bullets' as const,
  }
  switch (type) {
    case 'experience':
      return { ...base, type, displayStyle: 'bullets', items: [] }
    case 'education':
      return { ...base, type, displayStyle: 'bullets', items: [] }
    case 'skills':
      return { ...base, type, displayStyle: 'chips', items: [] }
    case 'projects':
      return { ...base, type, displayStyle: 'bullets', items: [] }
    case 'certifications':
      return { ...base, type, displayStyle: 'bullets', items: [] }
    case 'languages':
      return { ...base, type, displayStyle: 'pills', arrangement: 'inline', items: [] }
    case 'custom':
      return { ...base, type, displayStyle: 'bullets', items: [] }
  }
}
