import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  COLOR_PRESETS,
  FONT_FAMILY_GROUPS,
  FONT_STACKS,
  LAYOUT_DESCRIPTIONS,
  LAYOUT_LABELS,
  LAYOUT_PRESETS,
} from '@/constants'
import { hexToHsl, hslToHex, isValidHex } from '@/lib/color'
import type { StyleConfig } from '@/types'

interface StyleControlsProps {
  style: StyleConfig
  onChange: (patch: Partial<StyleConfig>) => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 font-display text-[15px] font-bold text-ink">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate">
        {label}
      </label>
      {children}
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const safeHex = isValidHex(value) ? value : '#000000'
  const hsl = hexToHsl(safeHex)

  function setHue(h: number) {
    onChange(hslToHex(h, hsl.s, hsl.l))
  }

  function setSaturation(s: number) {
    onChange(hslToHex(hsl.h, s, hsl.l))
  }

  return (
    <Field label={label}>
      <div className="space-y-3 rounded-xl border border-hairline p-3">
        <div className="flex items-center gap-2.5">
          <div
            className="h-8.5 w-8.5 shrink-0 rounded-md border-2 border-ink"
            style={{ background: safeHex }}
            aria-hidden
          />
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              aria-label={preset}
              title={preset}
              className={`h-6 w-6 shrink-0 rounded-full transition-transform hover:scale-110 ${
                safeHex.toLowerCase() === preset.toLowerCase()
                  ? 'ring-2 ring-ink ring-offset-2'
                  : 'ring-1 ring-hairline'
              }`}
              style={{ background: preset }}
            />
          ))}
        </div>

        <div className="space-y-2 border-t border-hairline pt-2.5">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate">Hue</div>
            <Slider
              value={[hsl.h]}
              min={0}
              max={359}
              step={1}
              onValueChange={([h]) => setHue(h)}
              aria-label={`${label} hue`}
              className="[&_[data-slot=slider-range]]:bg-transparent [&_[data-slot=slider-track]]:bg-[linear-gradient(to_right,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)]"
            />
          </div>

          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate">Intensity</div>
            <Slider
              value={[hsl.s]}
              min={0}
              max={100}
              step={1}
              onValueChange={([s]) => setSaturation(s)}
              aria-label={`${label} intensity`}
              className={`[&_[data-slot=slider-range]]:bg-transparent [&_[data-slot=slider-track]]:bg-[linear-gradient(to_right,hsl(${hsl.h}_0%_${hsl.l}%),hsl(${hsl.h}_100%_${hsl.l}%))]`}
            />
          </div>
        </div>
      </div>
    </Field>
  )
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <Field label={`${label} — ${value.toFixed(2)}rem`}>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      />
    </Field>
  )
}

export function StyleControls({ style, onChange }: StyleControlsProps) {
  return (
    <div>
      <Section title="Layout">
        <div className="grid grid-cols-2 gap-2">
          {LAYOUT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange({ layout: preset })}
              aria-pressed={style.layout === preset}
              className={`rounded-lg border-2 px-3 py-2 text-left transition-colors ${
                style.layout === preset
                  ? 'border-ink bg-ink text-paper'
                  : 'border-hairline hover:border-slate'
              }`}
            >
              <div className="font-display text-[12.5px] font-bold">{LAYOUT_LABELS[preset]}</div>
              <div
                className={`mt-0.5 text-[10.5px] leading-snug ${
                  style.layout === preset ? 'text-paper/70' : 'text-slate'
                }`}
              >
                {LAYOUT_DESCRIPTIONS[preset]}
              </div>
            </button>
          ))}
        </div>
      </Section>

      <div className="h-px bg-hairline" />

      <Section title="Typography">
        <Field label="Font Family">
          <Select
            value={style.fontFamily}
            onValueChange={(v) => onChange({ fontFamily: v as StyleConfig['fontFamily'] })}
          >
            <SelectTrigger className="w-full" style={{ fontFamily: FONT_STACKS[style.fontFamily] }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILY_GROUPS.map((group) => (
                <SelectGroup key={group.label}>
                  <SelectLabel>{group.label}</SelectLabel>
                  {group.fonts.map((f) => (
                    <SelectItem key={f} value={f} style={{ fontFamily: FONT_STACKS[f] }}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-[10.5px] leading-snug text-slate">
            Applies to the whole CV — name, section headings, and body text all use this one font.
          </p>
        </Field>
        <div className="flex gap-2.5">
          <div className="flex-1">
            <Field label="Font Size">
              <Select
                value={style.fontSize}
                onValueChange={(v) => onChange({ fontSize: v as StyleConfig['fontSize'] })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['xs', 'sm', 'base', 'lg'] as const).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="flex-1">
            <Field label="Line Height">
              <Select
                value={style.lineHeight}
                onValueChange={(v) => onChange({ lineHeight: v as StyleConfig['lineHeight'] })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['tight', 'normal', 'relaxed'] as const).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
      </Section>

      <div className="h-px bg-hairline" />

      <Section title="Colors">
        <ColorField
          label="Heading Color"
          value={style.headingColor}
          onChange={(v) => onChange({ headingColor: v })}
        />
        <ColorField
          label="Body Text"
          value={style.bodyColor}
          onChange={(v) => onChange({ bodyColor: v })}
        />
      </Section>

      <div className="h-px bg-hairline" />

      <Section title="Layout">
        <div className="flex gap-2.5">
          <div className="flex-1">
            <Field label="Paper Size">
              <Select
                value={style.paperSize}
                onValueChange={(v) => onChange({ paperSize: v as StyleConfig['paperSize'] })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="flex-1">
            <Field label="Header Alignment">
              <Select
                value={style.headerAlignment}
                onValueChange={(v) => onChange({ headerAlignment: v as StyleConfig['headerAlignment'] })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
        <div className="flex gap-2.5">
          <div className="flex-1">
            <Field label="Margin">
              <Select
                value={style.margin}
                onValueChange={(v) => onChange({ margin: v as StyleConfig['margin'] })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="flex-1">
            <Field label="Section Spacing">
              <Select
                value={style.sectionSpacing}
                onValueChange={(v) => onChange({ sectionSpacing: v as StyleConfig['sectionSpacing'] })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
        <Field label="Primary Heading">
          <Select
            value={style.headingStyle}
            onValueChange={(v) => onChange({ headingStyle: v as StyleConfig['headingStyle'] })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="companyFirst">Company / Institution first</SelectItem>
              <SelectItem value="titleFirst">Job Title / Degree first</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <div className="h-px bg-hairline" />

      <Section title="Personal Info Layout">
        <Field label="Columns">
          <Select
            value={String(style.personalInfoColumns)}
            onValueChange={(v) => onChange({ personalInfoColumns: Number(v) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <SliderField
          label="Column Gap"
          value={style.personalInfoColumnGap}
          min={0}
          max={4}
          step={0.125}
          onChange={(v) => onChange({ personalInfoColumnGap: v })}
        />
        <SliderField
          label="Row Gap"
          value={style.personalInfoRowGap}
          min={0}
          max={2}
          step={0.125}
          onChange={(v) => onChange({ personalInfoRowGap: v })}
        />
        <SliderField
          label="Label-to-Value Gap"
          value={style.personalInfoLabelGap}
          min={0}
          max={1.5}
          step={0.0625}
          onChange={(v) => onChange({ personalInfoLabelGap: v })}
        />
      </Section>

      <div className="h-px bg-hairline" />

      <Section title="Formatting">
        <Field label="Date Format">
          <Select
            value={style.dateFormat}
            onValueChange={(v) => onChange({ dateFormat: v as StyleConfig['dateFormat'] })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthYYYY">Month YYYY</SelectItem>
              <SelectItem value="MM/YYYY">MM/YYYY</SelectItem>
              <SelectItem value="YYYY">YYYY</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Section>
    </div>
  )
}
