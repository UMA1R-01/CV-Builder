import type { DateFormat } from '@/types'

const LINK_LABEL_KEYWORDS = ['website', 'linkedin', 'github', 'portfolio', 'twitter', 'gitlab', 'blog']

export function formatDate(value: string, format: DateFormat): string {
  if (!value || value === 'Present') return value
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) return value
  const [, year, month] = match
  switch (format) {
    case 'YYYY':
      return year
    case 'MM/YYYY':
      return `${month}/${year}`
    case 'monthYYYY':
    default: {
      const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleString('en-US', {
        month: 'short',
      })
      return `${monthName} ${year}`
    }
  }
}

export function withHttps(value: string): string {
  if (!value) return value
  return value.replace(/^https?:\/\//i, '').replace(/^/, 'https://')
}

export function isEmailLabel(label: string): boolean {
  return label.toLowerCase().includes('email')
}

export function isLinkLabel(label: string): boolean {
  const lower = label.toLowerCase()
  return LINK_LABEL_KEYWORDS.some((kw) => lower.includes(kw))
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}
