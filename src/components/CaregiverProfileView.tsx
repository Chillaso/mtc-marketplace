import type { ReactNode } from 'react'
import { Award, BriefcaseBusiness, CalendarDays, Car, Check, Clock, GraduationCap, Heart, Languages, MapPin, ShieldCheck, User } from 'lucide-react'
import type { Caregiver } from '../data/types'
import { CARE_TYPES, ILLNESSES, JORNADAS, TASKS, TRAINING_SHORT, labelOf } from '../data/catalog'
import { Avatar, CaregiverBadges, DaysRow, SectionCard, Stars } from './ui'
import { TASK_ICONS } from './CaregiverForm'
import { shortName, yearsLabel } from '../lib/format'

export const jornadaText = (c: Caregiver) => c.jornadas.map((j) => labelOf(JORNADAS, j)).join(' · ') || 'Sin indicar'

export function CaregiverProfileView({ c, actions, fullName }: { c: Caregiver; actions?: ReactNode; fullName?: boolean }) {
  const tasks = TASKS.filter((t) => c.tasks[t.id]?.length)
  const highlights = c.highlights.length ? c.highlights : c.careTypes.slice(0, 3).map((id) => labelOf(CARE_TYPES, id))
  return (
    <div className="space-y-5">
      <section className="card p-5 sm:p-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-5 md:flex-1">
            <div className="relative shrink-0">
              <Avatar name={c.name} photo={c.photo} size={132} className="max-sm:!size-24" />
              {c.trusted && (
                <span className="absolute -right-1 -bottom-1 flex size-11 items-center justify-center rounded-full bg-brand-800 text-white ring-4 ring-white" title="Cuidadora de confianza">
                  <ShieldCheck className="size-6" />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold sm:text-4xl">{fullName ? c.name : shortName(c.name)}</h1>
              <div className="mt-2">
                <CaregiverBadges c={c} />
              </div>
              <div className="mt-2">
                <Stars rating={c.rating} reviews={c.reviews} />
              </div>
            </div>
          </div>
          <ul className="space-y-3 border-line text-[17px] md:border-l md:pl-8">
            <li className="flex items-center gap-3">
              <MapPin className="size-6 text-brand-600" />
              {c.zone}
              {c.extraZones.length > 0 && <span className="text-sm text-muted">+ {c.extraZones.join(', ')}</span>}
            </li>
            <li className="flex items-center gap-3">
              <CalendarDays className="size-6 text-brand-600" />
              <span>
                Disponibilidad: {jornadaText(c)}
                {!c.available && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-sm font-semibold text-slate-600">No disponible ahora</span>}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <BriefcaseBusiness className="size-6 text-brand-600" />
              {yearsLabel(c.experienceYears)}
            </li>
          </ul>
        </div>
        {actions && <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">{actions}</div>}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <SectionCard icon={User} title="Sobre mí">
            <p className="text-[17px] leading-relaxed text-ink-soft">{c.about || c.experienceText || 'Todavía no ha añadido una descripción.'}</p>
            {c.experienceText && c.about && <p className="mt-3 leading-relaxed text-ink-soft">{c.experienceText}</p>}
          </SectionCard>
          <SectionCard icon={GraduationCap} title="Formación y certificaciones">
            <ul className="space-y-2">
              {c.training.map((t) => (
                <li key={t} className="flex items-center gap-3 text-[17px]">
                  <Check className="size-5 text-brand-600" strokeWidth={3} />
                  {t === 'otra' && c.otherTraining ? c.otherTraining : TRAINING_SHORT[t]}
                </li>
              ))}
              {!c.training.length && <li className="text-muted">Sin formación indicada.</li>}
            </ul>
          </SectionCard>
          <SectionCard icon={Award} title="Experiencia destacada">
            <ul className="space-y-2">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-3 text-[17px]">
                  <Check className="size-5 text-brand-600" strokeWidth={3} />
                  {h}
                </li>
              ))}
            </ul>
            {c.illnesses.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-sm font-semibold text-ink-soft">Ha cuidado a personas con:</div>
                <div className="flex flex-wrap gap-1.5">
                  {c.illnesses.map((i) => (
                    <span key={i} className="rounded-full bg-brand-50 px-3 py-1 text-sm">
                      {labelOf(ILLNESSES, i)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </div>
        <div className="space-y-5">
          <SectionCard icon={Heart} title="Cuidados que ofrece">
            <ul className="space-y-2.5">
              {c.careTypes.map((id) => (
                <li key={id} className="flex items-center gap-3 text-[17px]">
                  <Check className="size-5 text-brand-600" strokeWidth={3} />
                  {labelOf(CARE_TYPES, id)}
                </li>
              ))}
            </ul>
            {tasks.length > 0 && (
              <ul className="mt-4 grid gap-2.5 border-t border-line pt-4 sm:grid-cols-2">
                {tasks.map((t) => {
                  const Icon = TASK_ICONS[t.icon]
                  return (
                    <li key={t.id} className="flex items-start gap-3">
                      <Icon className="mt-0.5 size-5 shrink-0 text-brand-600" />
                      <span>
                        <span className="block font-medium">{t.label}</span>
                        <span className="text-sm text-muted">{c.tasks[t.id].join(', ')}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </SectionCard>
          <SectionCard icon={CalendarDays} title="Disponibilidad">
            <DaysRow days={c.days} />
            <div className="mt-4 flex items-center gap-3 text-[17px]">
              <Clock className="size-6 text-brand-600" />
              Jornada: <strong className="font-semibold">{jornadaText(c)}</strong>
            </div>
          </SectionCard>
          <SectionCard icon={Languages} title="Otros datos">
            <ul className="space-y-2 text-[17px]">
              <li className="flex items-center gap-3">
                <Languages className="size-5 text-brand-600" />
                {c.languages.join(', ')}
              </li>
              <li className="flex items-center gap-3">
                <Car className="size-5 text-brand-600" />
                {c.drivingLicense ? (c.vehicle ? 'Carné de conducir y vehículo propio' : 'Carné de conducir') : 'Sin carné de conducir'}
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
