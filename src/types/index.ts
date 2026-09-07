export * from './database.types'

export interface AuthUser {
  id:    string
  email: string
  role?: string
}

export interface PaginatedResponse<T> {
  data:     T[]
  count:    number
  page:     number
  pageSize: number
  hasMore:  boolean
}

export interface ApiError {
  message: string
  code?:   string
  details?: unknown
}

export interface BaseFilters {
  search?:  string
  page?:    number
  limit?:   number
  sortBy?:  string
  sortDir?: 'asc' | 'desc'
}

export interface PSUFilters extends BaseFilters {
  sector?:       string
  gateRequired?: boolean
  minPackage?:   number
  maxPackage?:   number
  branch?:       string
}

export interface OpportunityFilters extends BaseFilters {
  type?:       string
  location?:   string
  isRemote?:   boolean
  minStipend?: number
}

export interface ProjectFilters extends BaseFilters {
  category?:  string
  techStack?: string[]
}

export interface BlogFilters extends BaseFilters {
  categoryId?: string
  tags?:       string[]
}

export interface WithClassName {
  className?: string
}

export interface WithChildren {
  children: React.ReactNode
}