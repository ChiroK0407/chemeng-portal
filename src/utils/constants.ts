export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'ChemEng Portal'
export const APP_URL  = import.meta.env.VITE_APP_URL  ?? 'http://localhost:5173'
export const IS_DEV   = import.meta.env.DEV
export const IS_PROD  = import.meta.env.PROD

export const DEFAULT_PAGE_SIZE = 12
export const BLOG_PAGE_SIZE    = 9

export const PSU_SECTORS = [
  'Oil & Gas',
  'Petrochemicals',
  'Power',
  'Fertilizers',
  'Steel',
  'Mining',
  'Defence',
  'Chemicals',
  'Pharmaceuticals',
  'Water Treatment',
  'Renewable Energy',
  'Nuclear',
] as const

export const GATE_SUBJECTS = [
  'Chemical Engineering (CH)',
  'Instrumentation (IN)',
  'Electrical (EE)',
  'Mechanical (ME)',
  'Civil (CE)',
] as const

export const PROJECT_CATEGORIES = [
  'Process Design',
  'Simulation',
  'Environmental',
  'Materials',
  'Biotechnology',
  'Energy',
  'Safety',
  'Data Science',
  'Research',
] as const

export const OPPORTUNITY_TYPES = [
  'Internship',
  'Full-time',
  'Research',
  'Part-time',
  'Contract',
  'Fellowship',
] as const

export const USER_ROLES = [
  'student',
  'alumni',
  'recruiter',
  'faculty',
  'admin',
] as const

export type PSUSector       = (typeof PSU_SECTORS)[number]
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number]
export type UserRole        = (typeof USER_ROLES)[number]