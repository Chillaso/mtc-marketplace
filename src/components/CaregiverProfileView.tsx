import type { ReactNode } from 'react'
import { Award, BriefcaseBusiness, CalendarDays, Car, Check, Clock, GraduationCap, Heart, Languages, MapPin, ShieldCheck, User } from 'lucide-react'
import type { Caregiver } from '../data/types'
import { CARE_TYPES, ILLNESSES, JORNADAS, TASKS, TRAINING_SHORT, labelOf } from '../data/catalog'
import { AvailabilityPill, Avatar, CaregiverBadges, DaysRow, SectionCard, Stars } from './ui'
import { TASK_ICONS } from './CaregiverForm'
import { shortName, yearsLabel } from '../lib/format'

export const jornadaText = (c: Caregiver) => c.jornadas.map((j) => labelOf(JORNADAS, j)).join(' · ') || 'Sin indicar'

function CheckList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-3">
          <span aria-hidden className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Check className="size-4" strokeWidth={3} />
          </span>
          {t}
        </li>
      ))}
    </ul>
  )
}

export function CaregiverProfileView({ c, actions, fullName }: { c: Caregiver; actions?: ReactNode; fullName?: boolean }) {
  const tasks = TASKS.filter((t) => c.tasks[t.id]?.length)
  const highlights = c.highlights.length ? c.highlights : c.careTypes.slice(0, 3).map((id) => labelOf(CARE_TYPES, id))
  const fact = 'flex items-start gap-3'
  const icon = 'mt-0.5 size-6 shrink-0 text-accent-icon'
  return (
    <div className="space-y-5">
      <section className="card overflow-hidden">
        <div aria-hidden className="h-20 bg-accent-soft sm:h-24">
          <svg viewBox="0 0 600 96" preserveAspectRatio="none" className="size-full">
            <path d="M0 70 C 120 30 220 30 330 62 S 520 96 600 50 V96 H0Z" fill="var(--rose-100)" />
          </svg>
        </div>
        <div className="-mt-12 px-5 pb-6 sm:-mt-14 sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end md:flex-1">
              <div className="relative w-fit shrink-0">
                <Avatar name={c.name} photo={c.photo} size={128} ring className="max-sm:!size-28" />
                {c.trusted && (
                  <span aria-hidden className="absolute right-0 bottom-1 flex size-10 items-center justify-center rounded-full bg-accent-strong text-white ring-4 ring-surface">
                    <ShieldCheck className="size-5" strokeWidth={2.25} />
                  </span>
                )}
              </div>
              <div className="min-w-0 pb-1">
                <h1 className="text-3xl font-bold sm:text-4xl">{fullName ? c.name : shortName(c.name)}</h1>
                <div className="mt-2">
                  <CaregiverBadges c={c} />
                </div>
                <div className="mt-2">
                  <Stars rating={c.rating} reviews={c.reviews} />
                </div>
              </div>
            </div>
          </div>

          <ul className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-2 lg:grid-cols-4">
            <li className={fact}>
              <MapPin aria-hidden className={icon} strokeWidth={2} />
              <span>
                <span className="block text-sm text-muted">Zona</span>
                {c.zone}
                {c.extraZones.length > 0 && <span className="block text-sm text-ink-soft">También: {c.extraZones.join(', ')}</span>}
              </span>
            </li>
            <li className={fact}>
              <CalendarDays aria-hidden className={icon} strokeWidth={2} />
              <span>
                <span className="block text-sm text-muted">Jornada</span>
                {jornadaText(c)}
              </span>
            </li>
            <li className={fact}>
              <BriefcaseBusiness aria-hidden className={icon} strokeWidth={2} />
              <span>
                <span className="block text-sm text-muted">Experiencia</span>
                {yearsLabel(c.experienceYears)}
              </span>
            </li>
            <li className={fact}>
              <Clock aria-hidden className={icon} strokeWidth={2} />
              <span>
                <span className="block text-sm text-muted">Ahora mismo</span>
                <AvailabilityPill available={c.available} size="sm" />
              </span>
            </li>
          </ul>
          {actions && <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <SectionCard icon={User} title="Sobre mí">
            <p className="max-w-[65ch] leading-relaxed text-ink-soft">{c.about || c.experienceText || 'Todavía no ha añadido una descripción.'}</p>
            {c.experienceText && c.about && <p className="mt-3 max-w-[65ch] leading-relaxed text-ink-soft">{c.experienceText}</p>}
          </SectionCard>
          <SectionCard icon={GraduationCap} title="Formación y certificaciones">
            {c.training.length ? <CheckList items={c.training.map((t) => (t === 'otra' && c.otherTraining ? c.otherTraining : TRAINING_SHORT[t]))} /> : <p className="text-muted">Sin formación indicada.</p>}
          </SectionCard>
          <SectionCard icon={Award} title="Experiencia destacada">
            <CheckList items={highlights} />
            {c.illnesses.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-base font-semibold text-ink-soft">Ha cuidado a personas con:</h3>
                <ul className="flex flex-wrap gap-2">
                  {c.illnesses.map((i) => (
                    <li key={i} className="rounded-full bg-sunken px-3 py-1 text-sm text-ink">
                      {labelOf(ILLNESSES, i)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </SectionCard>
        </div>
        <div className="space-y-5">
          <SectionCard icon={Heart} title="Cuidados que ofrece">
            <CheckList items={c.careTypes.map((id) => labelOf(CARE_TYPES, id))} />
            {tasks.length > 0 && (
              <ul className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
                {tasks.map((t) => {
                  const Icon = TASK_ICONS[t.icon]
                  return (
                    <li key={t.id} className="flex items-start gap-3">
                      <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-accent-icon" strokeWidth={2} />
                      <span>
                        <span className="block font-medium">{t.label}</span>
                        <span className="text-sm text-ink-soft">{c.tasks[t.id].join(', ')}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </SectionCard>
          <SectionCard icon={CalendarDays} title="Disponibilidad">
            <DaysRow days={c.days} />
            <p className="mt-4 flex items-center gap-3">
              <Clock aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
              <span>
                Jornada: <strong className="font-semibold">{jornadaText(c)}</strong>
              </span>
            </p>
          </SectionCard>
          <SectionCard icon={Languages} title="Otros datos">
            <ul className="space-y-2.5">
              <li className="flex items-center gap-3">
                <Languages aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
                {c.languages.join(', ')}
              </li>
              <li className="flex items-center gap-3">
                <Car aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
                {c.drivingLicense ? (c.vehicle ? 'Carné de conducir y vehículo propio' : 'Carné de conducir') : 'Sin carné de conducir'}
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
