import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const formatDate = (date: string | Date): string =>
  format(typeof date === 'string' ? parseISO(date) : date, 'MMM d, yyyy')

export const formatDateFull = (date: string | Date): string =>
  format(typeof date === 'string' ? parseISO(date) : date, 'MMMM d, yyyy')

export const formatRelative = (date: string | Date): string =>
  formatDistanceToNow(
    typeof date === 'string' ? parseISO(date) : date,
    { addSuffix: true }
  )

export const formatLPA = (lpa: number): string => `₹${lpa} LPA`

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const truncate = (text: string, maxLength: number): string =>
  text.length <= maxLength ? text : `${text.slice(0, maxLength).trimEnd()}…`

export const pluralize = (count: number, singular: string, plural?: string): string =>
  `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`