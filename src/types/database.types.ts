export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ── Shared Domain Enumerations ─────────────────────────────────
export type UserRole = 'student' | 'alumni' | 'recruiter' | 'faculty' | 'admin'
export type PSUSector = 'Maharatna' | 'Navratna' | 'Miniratna' | 'Central PSU' | 'State PSU'
export type ProjectCategory = 'Process Simulation' | 'Equipment Design' | 'Research Paper' | 'Optimization' | 'Data Science'
export type OpportunityType = 'internship' | 'full_time' | 'research' | 'part_time' | 'contract' | 'fellowship'
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
export type ContentStatus = 'draft' | 'published' | 'archived'

// ── Core Identity Maps ──────────────────────────────────────────
export interface User {
  id:              string
  email:           string
  role:            UserRole
  isEmailVerified: boolean
  isDeleted:       boolean
  deletedAt:       string | null
  createdAt:       string
  updatedAt:       string
  profile?:        Profile | null
}

export interface Profile {
  id:          string
  userId:      string
  username:    string | null
  fullName:    string | null
  avatarUrl:   string | null
  bio:         string | null
  college:     string | null
  branch:      string | null
  gradYear:    number | null
  linkedinUrl: string | null
  githubUrl:   string | null
  websiteUrl:  string | null
  skills:      string[]
  createdAt:   string
  updatedAt:   string
  user?:       User | null
}

// ── Chemical Engineering Domains ──────────────────────────────
export interface PSU {
  id:               string
  slug:             string
  name:             string
  fullName:         string | null
  sector:           string
  description:      string | null
  logoUrl:          string | null
  websiteUrl:       string | null
  headquarters:     string | null
  packageMinLpa:    number | null
  packageMaxLpa:    number | null
  gateRequired:     boolean
  gateCutoff:       number | null
  eligibleBranches: string[]
  bondYears:        number | null
  recruitmentMode:  string | null
  isFeatured:       boolean
  status:           ContentStatus
  createdAt:        string
  updatedAt:        string
}

export interface Project {
  id:          string
  slug:        string
  title:       string
  description: string | null
  content:     string | null
  coverUrl:    string | null
  githubUrl:   string | null
  demoUrl:     string | null
  techStack:   string[]
  category:    string
  authorId:    string
  teamMembers: string[]
  isFeatured:  boolean
  status:      ContentStatus
  views:       number
  createdAt:   string
  updatedAt:   string
  author?:     { profile: Profile } | null
}

export interface Blog {
  id:          string
  slug:        string
  title:       string
  excerpt:     string | null
  content:     string | null
  coverUrl:    string | null
  authorId:    string
  readTimeMin: number | null
  isFeatured:  boolean
  status:      ContentStatus
  views:       number
  publishedAt: string | null
  createdAt:   string
  updatedAt:   string
  author?:     { profile: Profile } | null
}

// ── Engagements & Placement Channels ──────────────────────────
export interface Event {
  id:          string
  slug:        string
  title:       string
  description: string | null
  coverUrl:    string | null
  venue:       string | null
  isOnline:    boolean
  meetingUrl:  string | null
  startsAt:    string
  endsAt:      string | null
  organizerId: string
  maxCapacity: number | null
  rsvpCount:   number
  isFeatured:  boolean
  status:      EventStatus
  createdAt:   string
  updatedAt:   string
  organizer?:  Profile | null
}

export interface Opportunity {
  id:               string
  title:            string
  company:          string
  description:      string | null
  type:             OpportunityType
  location:         string | null
  isRemote:         boolean
  stipendMin:       number | null
  stipendMax:       number | null
  applyUrl:         string | null
  deadline:         string | null
  eligibleBranches: string[]
  minCgpa:          number | null
  postedBy:         string
  isFeatured:       boolean
  status:           ContentStatus
  createdAt:        string
  updatedAt:        string
}

// ── Interaction Framework Utilities ────────────────────────────
export interface Resource {
  id:          string
  title:       string
  description: string | null
  type:        string // 'pdf' | 'video' | 'link' | 'notes'
  url:         string
  fileUrl:     string | null
  subject:     string | null
  semester:    number | null
  uploadedBy:  string
  status:      ContentStatus
  downloads:   number
  createdAt:   string
  updatedAt:   string
}

export interface Bookmark {
  id:         string
  userId:     string
  entityType: string // 'psu' | 'project' | 'blog' | 'opportunity'
  entityId:   string
  createdAt:  string
}

export interface Comment {
  id:         string
  content:    string
  authorId:   string
  entityType: string
  entityId:   string
  parentId:   string | null
  isDeleted:  boolean
  createdAt:  string
  updatedAt:  string
  author?:    { profile: Profile } | null
}

export interface Newsletter {
  id:        string
  email:     string
  name:      string | null
  createdAt: string
}

export interface EventRSVP {
  id:        string
  userId:    string
  eventId:   string
  createdAt: string
}