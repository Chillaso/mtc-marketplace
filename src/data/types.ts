export type Role = 'guest' | 'family' | 'caregiver'

export type DocStatus = 'pendiente' | 'en_revision' | 'revisada'

export type UploadedDoc = { id: string; kind: string; fileName: string; status: DocStatus; uploadedAt: string }

export interface Caregiver {
  id: string
  name: string
  email: string
  phone: string
  photo?: string
  spanish: boolean
  nationality?: string
  zone: string
  /** Zonas adicionales donde puede trabajar. */
  extraZones: string[]
  experienceYears: number
  careTypes: string[]
  illnesses: string[]
  workplaces: string[]
  experienceText: string
  /** Por cada apartado de TASKS, las tareas concretas marcadas. */
  tasks: Record<string, string[]>
  training: string[]
  otherTraining?: string
  drivingLicense: boolean
  vehicle: boolean
  jornadas: string[]
  days: number[]
  languages: string[]
  about: string
  highlights: string[]
  rating: number
  reviews: number
  /** Distintivo «Cuidadora de confianza María te Cuida»: ya ha trabajado con familias a través de la plataforma y está bien valorada. */
  trusted: boolean
  /** Documentación aportada y revisada por el equipo (independiente del distintivo). */
  docsStatus: DocStatus
  documents: UploadedDoc[]
  declarationSignedAt?: string
  available: boolean
  createdAt: string
}

export interface SearchFilters {
  careType: string
  zone: string
  jornada: string
  minYears: string
  careTypes: string[]
  training: string
  days: number[]
  language: string
  onlyTrusted: boolean
  docsReviewed: boolean
  drivingLicense: boolean
  vehicle: boolean
  includeUnavailable: boolean
  sort: 'relevancia' | 'experiencia' | 'valoracion'
}

export interface Family {
  id: string
  name: string
  contactName: string
  email: string
  phone: string
  zone: string
  personType: string
  favorites: string[]
  prefs: SearchFilters
  createdAt: string
}

export type RequestStatus = 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada'

export interface ContactRequest {
  id: string
  familyId: string
  caregiverId: string
  need: string
  personType: string
  start: string
  startDate?: string
  jornada: string
  zone: string
  status: RequestStatus
  createdAt: string
  respondedAt?: string
}

export interface Message {
  id: string
  requestId: string
  from: 'family' | 'caregiver' | 'system'
  text: string
  attachment?: string
  at: string
  read: boolean
}

export interface Notification {
  id: string
  role: Exclude<Role, 'guest'>
  userId: string
  text: string
  link: string
  at: string
  read: boolean
}

export interface Activity {
  id: string
  caregiverId: string
  text: string
  at: string
  highlight?: boolean
}

export interface IntegralRequest {
  id: string
  familyId?: string
  contactName: string
  email: string
  phone: string
  zone: string
  personType: string
  tasks: string[]
  jornada: string
  start: string
  details: string
  status: 'recibida' | 'en_curso'
  createdAt: string
}

export interface PrivateNote {
  requestId: string
  role: Exclude<Role, 'guest'>
  text: string
}

export interface DemoState {
  version: number
  session: { role: Role; userId?: string }
  caregivers: Caregiver[]
  families: Family[]
  requests: ContactRequest[]
  messages: Message[]
  notifications: Notification[]
  activity: Activity[]
  integral: IntegralRequest[]
  notes: PrivateNote[]
  lastSearch: SearchFilters
}
