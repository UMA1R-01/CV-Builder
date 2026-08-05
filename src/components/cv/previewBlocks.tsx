import type { ReactNode } from 'react'
import { SECTION_SPACING_PX, SECTION_TYPE_LABELS } from '@/constants'
import { formatDate, isEmailLabel, isLinkLabel, withHttps } from '@/lib/format'
import type {
  CVData,
  CVSection,
  LanguageItem,
  PersonalDetail,
  SectionItem,
  SkillItem,
  StyleConfig,
} from '@/types'

export interface Block {
  id: string
  pageBreakBefore: boolean
  marginTop: number
  node: ReactNode
}

const LANGUAGE_RANK: Record<LanguageItem['level'], number> = {
  Elementary: 1,
  Intermediate: 2,
  Advanced: 3,
  Fluent: 4,
  Native: 5,
  Custom: 3,
}

function HeadingLine({
  primary,
  primaryExtra,
  date,
  headingColor,
}: {
  primary: ReactNode
  primaryExtra?: string
  date?: string
  headingColor?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="font-bold" style={{ fontSize: '1.02em', color: headingColor }}>
        {primary}
        {primaryExtra ? (
          <span className="font-normal text-slate"> ({primaryExtra})</span>
        ) : null}
      </div>
      {date ? <div className="shrink-0 whitespace-nowrap text-slate" style={{ fontSize: '0.85em' }}>{date}</div> : null}
    </div>
  )
}

function LinkOrText({ text, link, className }: { text: string; link?: string; className?: string }) {
  if (link) {
    return (
      <a href={withHttps(link)} className={className} style={{ textDecorationColor: 'var(--accent, currentColor)' }}>
        {text}
      </a>
    )
  }
  return <span className={className}>{text}</span>
}

function Description({ html }: { html: string }) {
  if (!html) return null
  return (
    <div
      className="mt-1 [&_ul]:ml-4 [&_ul]:mt-1 [&_ul]:list-disc [&_li]:mb-0.5"
      style={{ fontSize: '0.93em' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function SectionTitle({
  section,
  headingColor,
  layout,
}: {
  section: CVSection
  headingColor: string
  layout: StyleConfig['layout']
}) {
  const title = section.title

  switch (layout) {
    case 'minimal':
      return (
        <div
          className="inline-block font-bold uppercase"
          style={{ fontSize: '0.88em', letterSpacing: '0.16em', color: 'var(--slate)' }}
        >
          {title}
        </div>
      )
    case 'compactAts':
      return (
        <div className="font-bold uppercase" style={{ fontSize: '1em', color: headingColor }}>
          {title}
        </div>
      )
    case 'boldSerif':
      return (
        <div
          className="border-b font-bold"
          style={{
            fontSize: '1.15em',
            color: headingColor,
            borderColor: 'var(--hairline)',
            paddingBottom: '0.25em',
          }}
        >
          {title}
        </div>
      )
    case 'classic':
    default:
      return (
        <div
          className="inline-block border-b-[3px] pb-1 font-bold uppercase tracking-wide"
          style={{ fontSize: '1.02em', letterSpacing: '0.05em', borderColor: headingColor, color: headingColor }}
        >
          {title}
        </div>
      )
  }
}

function personalInfoDetailNode(label: string, value: string) {
  if (isEmailLabel(label)) {
    return (
      <a href={`mailto:${value}`} className="hover:underline">
        {value}
      </a>
    )
  }
  if (isLinkLabel(label)) {
    return (
      <a href={withHttps(value)} className="hover:underline">
        {value}
      </a>
    )
  }
  return <span>{value}</span>
}

function PersonalDetailsGrid({
  details,
  style,
  align,
}: {
  details: PersonalDetail[]
  style: StyleConfig
  align: 'left' | 'center'
}) {
  if (details.length === 0) return null
  return (
    <div
      className="mt-2.5 grid"
      style={{
        gridTemplateColumns: `repeat(${style.personalInfoColumns}, minmax(0, auto))`,
        columnGap: `${style.personalInfoColumnGap}rem`,
        rowGap: `${style.personalInfoRowGap}rem`,
        justifyContent: align === 'center' ? 'center' : 'start',
      }}
    >
      {details.map((detail) => (
        <div
          key={detail.id}
          className="flex min-w-0"
          style={{ fontSize: '0.9em', gap: `${style.personalInfoLabelGap}rem` }}
        >
          <span className="shrink-0 whitespace-nowrap" style={{ color: 'var(--slate)' }}>
            {detail.label}
          </span>
          <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {personalInfoDetailNode(detail.label, detail.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function renderPersonalHeader(data: CVData, style: StyleConfig): ReactNode {
  const align = style.headerAlignment === 'center' ? 'center' : 'left'
  const name = data.personalInfo.name || 'Your Name'
  const details = data.personalInfo.details
  const grid = <PersonalDetailsGrid details={details} style={style} align={align} />

  switch (style.layout) {
    case 'minimal':
      return (
        <div className="pb-3" style={{ textAlign: align }}>
          <div className="font-bold leading-none" style={{ fontSize: '2em', color: style.headingColor }}>
            {name}
          </div>
          <div className="mt-1.5" style={{ fontSize: '1em', color: style.headingColor }}>
            {data.personalInfo.jobTitle}
          </div>
          {grid}
        </div>
      )
    case 'compactAts':
      return (
        <div className="pb-2" style={{ textAlign: align }}>
          <div className="font-black leading-none" style={{ fontSize: '2.1em', color: style.headingColor }}>
            {name}
          </div>
          <div className="mt-1" style={{ fontSize: '1em', color: 'var(--slate)' }}>
            {data.personalInfo.jobTitle}
          </div>
          {grid}
        </div>
      )
    case 'boldSerif':
      return (
        <div className="pb-3" style={{ textAlign: align, borderBottom: '1px solid var(--hairline)' }}>
          <div className="font-black leading-none" style={{ fontSize: '2.6em', color: style.headingColor }}>
            {name}
          </div>
          <div className="mt-1.5 italic" style={{ fontSize: '1.1em', color: 'var(--slate)' }}>
            {data.personalInfo.jobTitle}
          </div>
          {grid}
        </div>
      )
    case 'classic':
    default:
      return (
        <div className="border-b-[3px] pb-3" style={{ borderColor: style.headingColor, textAlign: align }}>
          <div className="font-black leading-none" style={{ fontSize: '2.4em', color: style.headingColor }}>
            {name}
          </div>
          <div className="mt-1.5" style={{ fontSize: '1.05em', color: 'var(--slate)' }}>
            {data.personalInfo.jobTitle}
          </div>
          {grid}
        </div>
      )
  }
}

function renderExperienceItem(item: SectionItem, style: StyleConfig): ReactNode {
  const it = item as import('@/types').WorkExperienceItem
  const dateRange = `${formatDate(it.startDate, style.dateFormat)} — ${formatDate(it.endDate, style.dateFormat) || 'Present'}`
  const primaryFirst = style.headingStyle === 'titleFirst'
  const primary = primaryFirst ? it.jobTitle : it.company
  const primaryLink = primaryFirst ? it.jobTitleLink : it.companyLink
  const primaryExtra = primaryFirst ? it.jobTitleExtra : it.companyExtra
  const secondary = primaryFirst ? it.company : it.jobTitle
  const secondaryLink = primaryFirst ? it.companyLink : it.jobTitleLink
  const secondaryExtra = primaryFirst ? it.companyExtra : it.jobTitleExtra
  return (
    <div>
      <HeadingLine
        primary={<LinkOrText text={primary} link={primaryLink} />}
        primaryExtra={primaryExtra}
        date={dateRange}
        headingColor={style.headingColor}
      />
      <div className="text-slate" style={{ fontSize: '0.9em' }}>
        <LinkOrText text={secondary} link={secondaryLink} />
        {secondaryExtra ? <span> ({secondaryExtra})</span> : null}
        {it.location ? <span> · {it.location}</span> : null}
      </div>
      <Description html={it.description} />
    </div>
  )
}

function renderEducationItem(item: SectionItem, style: StyleConfig): ReactNode {
  const it = item as import('@/types').EducationItem
  const dateRange = `${formatDate(it.startDate, style.dateFormat)} — ${formatDate(it.endDate, style.dateFormat) || 'Present'}`
  const primaryFirst = style.headingStyle === 'titleFirst'
  const primary = primaryFirst ? it.degree : it.institution
  const primaryLink = primaryFirst ? it.degreeLink : it.institutionLink
  const primaryExtra = primaryFirst ? it.degreeExtra : it.institutionExtra
  const secondary = primaryFirst ? it.institution : it.degree
  const secondaryLink = primaryFirst ? it.institutionLink : it.degreeLink
  const secondaryExtra = primaryFirst ? it.institutionExtra : it.degreeExtra
  return (
    <div>
      <HeadingLine
        primary={<LinkOrText text={primary} link={primaryLink} />}
        primaryExtra={primaryExtra}
        date={dateRange}
        headingColor={style.headingColor}
      />
      <div className="text-slate" style={{ fontSize: '0.9em' }}>
        <LinkOrText text={secondary} link={secondaryLink} />
        {secondaryExtra ? <span> ({secondaryExtra})</span> : null}
        {it.location ? <span> · {it.location}</span> : null}
      </div>
      <Description html={it.description} />
    </div>
  )
}

function renderProjectItem(item: SectionItem, style: StyleConfig): ReactNode {
  const it = item as import('@/types').ProjectItem
  return (
    <div>
      <HeadingLine
        primary={
          <>
            <LinkOrText text={it.projectName} link={it.projectNameLink} />
            {it.projectUrl ? (
              <a href={withHttps(it.projectUrl)} className="ml-1.5 font-normal" style={{ color: style.headingColor, fontSize: '0.85em' }}>
                (view project)
              </a>
            ) : null}
          </>
        }
        primaryExtra={it.projectNameExtra}
        headingColor={style.headingColor}
      />
      <Description html={it.description} />
    </div>
  )
}

function renderCertificationItem(item: SectionItem, style: StyleConfig): ReactNode {
  const it = item as import('@/types').CertificationItem
  return (
    <HeadingLine
      primary={<LinkOrText text={it.name} link={it.nameLink} />}
      primaryExtra={it.nameExtra}
      date={formatDate(it.date, style.dateFormat)}
      headingColor={style.headingColor}
    />
  )
}

function renderCustomItem(item: SectionItem, style: StyleConfig): ReactNode {
  const it = item as import('@/types').CustomItem
  return (
    <div>
      <HeadingLine
        primary={<LinkOrText text={it.title} link={it.titleLink} />}
        primaryExtra={it.titleExtra}
        headingColor={style.headingColor}
      />
      <Description html={it.description} />
    </div>
  )
}

function renderSkillGroup(section: CVSection, category: string, items: SkillItem[]): ReactNode {
  const chips = section.type === 'skills' && section.displayStyle === 'chips'
  return (
    <div>
      {category ? (
        <div className="mb-1.5 font-bold uppercase tracking-wide text-slate" style={{ fontSize: '0.78em' }}>
          {category}
        </div>
      ) : null}
      {chips ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((skill) => (
            <span
              key={skill.id}
              className="rounded-full border-2 font-semibold"
              style={{ fontSize: '0.82em', padding: '0.2em 0.7em', borderColor: 'currentColor' }}
            >
              {skill.skillName}
              {skill.level ? <span className="font-normal text-slate"> · {skill.level}</span> : null}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-4 gap-y-0.5">
          {items.map((skill) => (
            <span key={skill.id} style={{ fontSize: '0.9em' }}>
              {skill.skillName}
              {skill.level ? <span className="text-slate"> ({skill.level})</span> : null}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function languageLevelLabel(item: LanguageItem): string {
  return item.level === 'Custom' ? item.customLevel.trim() : item.level
}

function renderLanguagesBlock(section: import('@/types').LanguagesSection): ReactNode {
  const arrangementClass = section.arrangement === 'inline' ? 'flex flex-wrap gap-x-5 gap-y-1' : 'flex flex-col gap-1'

  if (section.displayStyle === 'compact') {
    return (
      <div style={{ fontSize: '0.9em' }}>
        {section.items.map((it, i) => (
          <span key={it.id}>
            {it.language} ({languageLevelLabel(it)})
            {i < section.items.length - 1 ? ', ' : ''}
          </span>
        ))}
      </div>
    )
  }

  if (section.displayStyle === 'pills') {
    return (
      <div className={arrangementClass}>
        {section.items.map((it) => (
          <span key={it.id} className="rounded-full border-2 font-semibold" style={{ fontSize: '0.82em', padding: '0.2em 0.7em', borderColor: 'currentColor' }}>
            {it.language} <span className="font-normal text-slate">· {languageLevelLabel(it)}</span>
          </span>
        ))}
      </div>
    )
  }

  if (section.displayStyle === 'list') {
    return (
      <div className={arrangementClass}>
        {section.items.map((it) => (
          <div key={it.id} style={{ fontSize: '0.9em' }}>
            {it.language} <span className="text-slate">— {languageLevelLabel(it)}</span>
          </div>
        ))}
      </div>
    )
  }

  if (section.displayStyle === 'bar') {
    return (
      <div className={arrangementClass}>
        {section.items.map((it) => (
          <div key={it.id} className="flex items-center gap-2" style={{ fontSize: '0.9em' }}>
            <span className="w-24 shrink-0">{it.language}</span>
            <span className="flex h-1.5 flex-1 max-w-32 gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-full"
                  style={{ background: i < LANGUAGE_RANK[it.level] ? 'currentColor' : 'var(--hairline)' }}
                />
              ))}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // dots
  return (
    <div className={arrangementClass}>
      {section.items.map((it) => (
        <div key={it.id} className="flex items-center gap-2" style={{ fontSize: '0.9em' }}>
          <span className="w-24 shrink-0">{it.language}</span>
          <span className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: i < LANGUAGE_RANK[it.level] ? 'currentColor' : 'var(--hairline)' }}
              />
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}

export function buildBlocks(data: CVData, style: StyleConfig): Block[] {
  const blocks: Block[] = []

  blocks.push({
    id: 'personal-header',
    pageBreakBefore: false,
    marginTop: 0,
    node: renderPersonalHeader(data, style),
  })

  data.sections
    .filter((s) => s.visible)
    .forEach((section) => {
      blocks.push({
        id: `${section.id}-header`,
        pageBreakBefore: section.pageBreakBefore,
        marginTop: SECTION_SPACING_PX[style.sectionSpacing],
        node: (
          <SectionTitle
            section={section}
            headingColor={style.headingColor}
            layout={style.layout}
          />
        ),
      })

      if (section.type === 'skills') {
        const groups = new Map<string, SkillItem[]>()
        section.items.forEach((item) => {
          const key = item.category.trim()
          if (!groups.has(key)) groups.set(key, [])
          groups.get(key)!.push(item)
        })
        const orderedKeys = ['', ...Array.from(groups.keys()).filter((k) => k !== '')]
        orderedKeys
          .filter((k) => groups.has(k))
          .forEach((key) => {
            blocks.push({
              id: `${section.id}-group-${key || 'uncategorized'}`,
              pageBreakBefore: false,
              marginTop: 8,
              node: renderSkillGroup(section, key, groups.get(key)!),
            })
          })
      } else if (section.type === 'languages') {
        blocks.push({
          id: `${section.id}-languages`,
          pageBreakBefore: false,
          marginTop: 8,
          node: renderLanguagesBlock(section),
        })
      } else {
        section.items.forEach((item, i) => {
          const node =
            section.type === 'experience'
              ? renderExperienceItem(item, style)
              : section.type === 'education'
                ? renderEducationItem(item, style)
                : section.type === 'projects'
                  ? renderProjectItem(item, style)
                  : section.type === 'certifications'
                    ? renderCertificationItem(item, style)
                    : renderCustomItem(item, style)
          blocks.push({
            id: `${section.id}-item-${item.id}`,
            pageBreakBefore: false,
            marginTop: i === 0 ? 10 : 8,
            node,
          })
        })
      }
    })

  return blocks
}

export function sectionLabel(type: CVSection['type']): string {
  return SECTION_TYPE_LABELS[type]
}
