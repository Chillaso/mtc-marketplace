/** Ruta a una imagen de public/img respetando la base del despliegue (p. ej. GitHub Pages). */
export const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}`

const DAY = 86_400_000

/** Fecha ISO de hace `days` días; con hora opcional (hh, mm). */
export function ago(days: number, hh?: number, mm = 0): string {
  const d = new Date(Date.now() - days * DAY)
  if (hh !== undefined) d.setHours(hh, mm, 0, 0)
  return d.toISOString()
}

export function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString()
}

export const uid = (p = 'id') => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`

export const shortName = (name: string) => {
  const [first, last] = name.split(' ')
  return last ? `${first} ${last[0]}.` : first
}

export const firstName = (name: string) => name.split(' ')[0]

export const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')

export const fmtShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '')

/** «Hoy, 09:24», «Ayer, 16:12» o «05 nov, 11:03». */
export function fmtWhen(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const yesterday = new Date(Date.now() - DAY)
  if (sameDay(d, now)) return `Hoy, ${fmtTime(iso)}`
  if (sameDay(d, yesterday)) return `Ayer, ${fmtTime(iso)}`
  return `${fmtShortDate(iso)}, ${fmtTime(iso)}`
}

/** Para listas de conversaciones: «12:34», «Ayer» o «06 nov». */
export function fmtListTime(iso: string): string {
  const d = new Date(iso)
  if (sameDay(d, new Date())) return fmtTime(iso)
  if (sameDay(d, new Date(Date.now() - DAY))) return 'Ayer'
  return fmtShortDate(iso)
}

export function fmtDayLabel(iso: string): string {
  const d = new Date(iso)
  if (sameDay(d, new Date())) return 'Hoy'
  if (sameDay(d, new Date(Date.now() - DAY))) return 'Ayer'
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

export const yearsLabel = (n: number) => (n < 1 ? 'Menos de 1 año' : n === 1 ? '1 año de experiencia' : `${n} años de experiencia`)

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')
