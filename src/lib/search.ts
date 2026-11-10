import type { Caregiver, SearchFilters } from '../data/types'

export function matches(c: Caregiver, f: SearchFilters): boolean {
  if (!f.includeUnavailable && !c.available) return false
  const care = [...new Set([f.careType, ...f.careTypes].filter(Boolean))]
  if (care.length && !care.every((t) => c.careTypes.includes(t) || (t === 'alzheimer' && c.illnesses.includes('alzheimer')))) return false
  if (f.zone && c.zone !== f.zone && !c.extraZones.includes(f.zone)) return false
  if (f.jornada && !c.jornadas.includes(f.jornada)) return false
  if (f.minYears && c.experienceYears < Number(f.minYears)) return false
  if (f.training && !c.training.includes(f.training)) return false
  if (f.days.length && !f.days.every((d) => c.days.includes(d))) return false
  if (f.language && !c.languages.includes(f.language)) return false
  if (f.onlyTrusted && !c.trusted) return false
  if (f.docsReviewed && c.docsStatus !== 'revisada') return false
  if (f.drivingLicense && !c.drivingLicense) return false
  if (f.vehicle && !c.vehicle) return false
  return true
}

export function search(list: Caregiver[], f: SearchFilters): Caregiver[] {
  const res = list.filter((c) => matches(c, f))
  const score = (c: Caregiver) => (c.trusted ? 2 : 0) + (c.docsStatus === 'revisada' ? 1 : 0) + c.rating / 5 + (f.zone && c.zone === f.zone ? 1.5 : 0) + (c.available ? 3 : 0)
  if (f.sort === 'experiencia') return res.sort((a, b) => b.experienceYears - a.experienceYears)
  if (f.sort === 'valoracion') return res.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
  return res.sort((a, b) => score(b) - score(a))
}

/** Número de filtros avanzados activos (para la etiqueta del desplegable). */
export function activeCount(f: SearchFilters): number {
  return (
    (f.minYears ? 1 : 0) +
    f.careTypes.length +
    (f.training ? 1 : 0) +
    f.days.length +
    (f.language ? 1 : 0) +
    (f.docsReviewed ? 1 : 0) +
    (f.drivingLicense ? 1 : 0) +
    (f.vehicle ? 1 : 0) +
    (f.includeUnavailable ? 1 : 0)
  )
}
