export interface Job {
  title?: string
  company?: string
  location?: string
  url?: string
  source?: string
  publishedAt?: string
  addedAt?: string
  fitScore?: number | string
  seniority?: string
  topReason?: string
  missingKeywords?: string | string[]
  flag?: string
  status?: string
  description?: string
}

export interface PipelineEntry {
  title: string
  company: string
  url?: string
  fitScore?: number | string
  status: string
  addedAt?: string
}

export type Screen =
  | 'home'
  | 'scrolls'
  | 'campaign'
  | 'oracle'
  | 'armoury'
  | 'training'
  | 'ransom'
  | 'forge'

export interface OracleResult {
  overall_score: number
  technical_score: number
  experience_score: number
  domain_score: number
  soft_skills_score: number
  verdict: string
  strengths: string[]
  gaps: string[]
  missing_keywords: string[]
  recommendation: string
}

export interface TrainingSession {
  active: boolean
  role: string
  type: string
  difficulty: string
  questions: string[]
  currentIdx: number
  scores: (number | null)[]
}
