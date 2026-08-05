import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { RichTextEditor } from '@/components/cv/RichTextEditor'
import type {
  CertificationItem,
  CustomItem,
  EducationItem,
  LanguageItem,
  ProjectItem,
  SkillItem,
  WorkExperienceItem,
} from '@/types'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate">
        {label}
      </label>
      {children}
    </div>
  )
}

function LinkExtraRow({
  link,
  extra,
  onLinkChange,
  onExtraChange,
}: {
  link: string
  extra: string
  onLinkChange: (v: string) => void
  onExtraChange: (v: string) => void
}) {
  return (
    <div className="mb-3 flex gap-2.5">
      <div className="flex-1">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate">
          Link
        </label>
        <Input placeholder="https://" value={link} onChange={(e) => onLinkChange(e.target.value)} />
      </div>
      <div className="flex-1">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate">
          Extra
        </label>
        <Input placeholder="e.g. Contractor" value={extra} onChange={(e) => onExtraChange(e.target.value)} />
      </div>
    </div>
  )
}

function DateRangeRow({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: {
  startDate: string
  endDate: string
  onStartChange: (v: string) => void
  onEndChange: (v: string) => void
}) {
  const isPresent = endDate === 'Present'
  return (
    <>
      <div className="mb-3 flex gap-2.5">
        <div className="flex-1">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate">
            Start Date
          </label>
          <Input type="month" value={startDate} onChange={(e) => onStartChange(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate">
            End Date
          </label>
          <Input
            type="month"
            value={isPresent ? '' : endDate}
            disabled={isPresent}
            onChange={(e) => onEndChange(e.target.value)}
          />
        </div>
      </div>
      <label className="mb-4 flex items-center gap-2 text-sm font-medium text-ink">
        <Switch
          checked={isPresent}
          onCheckedChange={(checked) => onEndChange(checked ? 'Present' : '')}
        />
        Currently ongoing (Present)
      </label>
    </>
  )
}

export function WorkExperienceFields({
  item,
  onChange,
}: {
  item: WorkExperienceItem
  onChange: (patch: Partial<WorkExperienceItem>) => void
}) {
  return (
    <>
      <Field label="Job Title">
        <Input value={item.jobTitle} onChange={(e) => onChange({ jobTitle: e.target.value })} />
      </Field>
      <LinkExtraRow
        link={item.jobTitleLink}
        extra={item.jobTitleExtra}
        onLinkChange={(v) => onChange({ jobTitleLink: v })}
        onExtraChange={(v) => onChange({ jobTitleExtra: v })}
      />
      <Field label="Company">
        <Input value={item.company} onChange={(e) => onChange({ company: e.target.value })} />
      </Field>
      <LinkExtraRow
        link={item.companyLink}
        extra={item.companyExtra}
        onLinkChange={(v) => onChange({ companyLink: v })}
        onExtraChange={(v) => onChange({ companyExtra: v })}
      />
      <Field label="Location">
        <Input value={item.location} onChange={(e) => onChange({ location: e.target.value })} />
      </Field>
      <DateRangeRow
        startDate={item.startDate}
        endDate={item.endDate}
        onStartChange={(v) => onChange({ startDate: v })}
        onEndChange={(v) => onChange({ endDate: v })}
      />
      <Field label="Description">
        <RichTextEditor value={item.description} onChange={(html) => onChange({ description: html })} />
      </Field>
    </>
  )
}

export function EducationFields({
  item,
  onChange,
}: {
  item: EducationItem
  onChange: (patch: Partial<EducationItem>) => void
}) {
  return (
    <>
      <Field label="Degree">
        <Input value={item.degree} onChange={(e) => onChange({ degree: e.target.value })} />
      </Field>
      <LinkExtraRow
        link={item.degreeLink}
        extra={item.degreeExtra}
        onLinkChange={(v) => onChange({ degreeLink: v })}
        onExtraChange={(v) => onChange({ degreeExtra: v })}
      />
      <Field label="Institution">
        <Input value={item.institution} onChange={(e) => onChange({ institution: e.target.value })} />
      </Field>
      <LinkExtraRow
        link={item.institutionLink}
        extra={item.institutionExtra}
        onLinkChange={(v) => onChange({ institutionLink: v })}
        onExtraChange={(v) => onChange({ institutionExtra: v })}
      />
      <Field label="Location">
        <Input value={item.location} onChange={(e) => onChange({ location: e.target.value })} />
      </Field>
      <DateRangeRow
        startDate={item.startDate}
        endDate={item.endDate}
        onStartChange={(v) => onChange({ startDate: v })}
        onEndChange={(v) => onChange({ endDate: v })}
      />
      <Field label="Description">
        <RichTextEditor value={item.description} onChange={(html) => onChange({ description: html })} />
      </Field>
    </>
  )
}

const SKILL_LEVELS = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'] as const

export function SkillFields({
  item,
  onChange,
}: {
  item: SkillItem
  onChange: (patch: Partial<SkillItem>) => void
}) {
  return (
    <>
      <Field label="Skill Name">
        <Input value={item.skillName} onChange={(e) => onChange({ skillName: e.target.value })} />
      </Field>
      <Field label="Level">
        <Select
          value={item.level === '' ? '__none' : item.level}
          onValueChange={(v) => onChange({ level: v === '__none' ? '' : (v as SkillItem['level']) })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SKILL_LEVELS.map((level) => (
              <SelectItem key={level || '__none'} value={level || '__none'}>
                {level || 'None'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Category">
        <Input
          placeholder="e.g. Languages, Tools"
          value={item.category}
          onChange={(e) => onChange({ category: e.target.value })}
        />
      </Field>
      <Field label="Description">
        <Textarea
          value={item.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </Field>
    </>
  )
}

export function ProjectFields({
  item,
  onChange,
}: {
  item: ProjectItem
  onChange: (patch: Partial<ProjectItem>) => void
}) {
  return (
    <>
      <Field label="Project Name">
        <Input value={item.projectName} onChange={(e) => onChange({ projectName: e.target.value })} />
      </Field>
      <LinkExtraRow
        link={item.projectNameLink}
        extra={item.projectNameExtra}
        onLinkChange={(v) => onChange({ projectNameLink: v })}
        onExtraChange={(v) => onChange({ projectNameExtra: v })}
      />
      <Field label="Project URL">
        <Input
          placeholder="https://"
          value={item.projectUrl}
          onChange={(e) => onChange({ projectUrl: e.target.value })}
        />
      </Field>
      <Field label="Description">
        <RichTextEditor value={item.description} onChange={(html) => onChange({ description: html })} />
      </Field>
    </>
  )
}

export function CertificationFields({
  item,
  onChange,
}: {
  item: CertificationItem
  onChange: (patch: Partial<CertificationItem>) => void
}) {
  return (
    <>
      <Field label="Name">
        <Input value={item.name} onChange={(e) => onChange({ name: e.target.value })} />
      </Field>
      <LinkExtraRow
        link={item.nameLink}
        extra={item.nameExtra}
        onLinkChange={(v) => onChange({ nameLink: v })}
        onExtraChange={(v) => onChange({ nameExtra: v })}
      />
      <Field label="Issuer">
        <Input value={item.issuer} onChange={(e) => onChange({ issuer: e.target.value })} />
      </Field>
      <Field label="Date">
        <Input type="month" value={item.date} onChange={(e) => onChange({ date: e.target.value })} />
      </Field>
    </>
  )
}

const LANGUAGE_LEVELS = ['Elementary', 'Intermediate', 'Advanced', 'Fluent', 'Native', 'Custom'] as const

export function LanguageFields({
  item,
  onChange,
}: {
  item: LanguageItem
  onChange: (patch: Partial<LanguageItem>) => void
}) {
  return (
    <>
      <Field label="Language">
        <Input value={item.language} onChange={(e) => onChange({ language: e.target.value })} />
      </Field>
      <Field label="Level">
        <Select
          value={item.level}
          onValueChange={(v) => {
            const level = v as LanguageItem['level']
            onChange(
              level === 'Custom'
                ? { level, customLevel: item.customLevel || ' ' }
                : { level },
            )
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level === 'Custom' ? 'Custom…' : level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {item.level === 'Custom' && (
        <Field label="Custom Level">
          <Input
            value={item.customLevel}
            onChange={(e) => onChange({ customLevel: e.target.value })}
          />
        </Field>
      )}
    </>
  )
}

export function CustomFields({
  item,
  onChange,
}: {
  item: CustomItem
  onChange: (patch: Partial<CustomItem>) => void
}) {
  return (
    <>
      <Field label="Title">
        <Input value={item.title} onChange={(e) => onChange({ title: e.target.value })} />
      </Field>
      <LinkExtraRow
        link={item.titleLink}
        extra={item.titleExtra}
        onLinkChange={(v) => onChange({ titleLink: v })}
        onExtraChange={(v) => onChange({ titleExtra: v })}
      />
      <Field label="Description">
        <RichTextEditor value={item.description} onChange={(html) => onChange({ description: html })} />
      </Field>
    </>
  )
}
