import { useId, useRef, type ReactNode } from 'react'
import {
  Accessibility,
  BedDouble,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  CirclePause,
  CircleCheck,
  CookingPot,
  FileCheck2,
  FileText,
  GraduationCap,
  HeartPulse,
  House,
  Languages,
  Mail,
  MapPin,
  NotebookPen,
  Paperclip,
  Phone,
  Pill,
  Shirt,
  ShowerHead,
  Soup,
  Trash2,
  Upload,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Accordion, Checkbox, Chip, DaysRow, DocStatusChip, Field, IconInput, InfoNote, Input, RadioCard, Select, Textarea } from './ui'
import { PasswordInput } from '../pages/Auth'
import { CARE_TYPES, EXPERIENCE_RANGES, ILLNESSES, JORNADAS, LANGUAGES, NATIONALITIES, TASKS, TRAINING, WORKPLACES, ZONES } from '../data/catalog'
import type { UploadedDoc } from '../data/types'
import type { CaregiverDraft } from '../store'
import { cx, uid } from '../lib/format'

export type StepProps = { d: CaregiverDraft; set: (patch: Partial<CaregiverDraft>) => void; errors: Record<string, string>; editing?: boolean }

export const TASK_ICONS: Record<string, LucideIcon> = {
  ShowerHead,
  Shirt,
  Accessibility,
  Soup,
  CookingPot,
  Pill,
  Users,
  House,
  BedDouble,
}

export const emptyDraft = (): CaregiverDraft => ({
  name: '',
  email: '',
  password: '',
  phone: '',
  spanish: true,
  nationality: '',
  zone: '',
  extraZones: [],
  experienceYears: -1,
  careTypes: [],
  illnesses: [],
  workplaces: [],
  experienceText: '',
  tasks: {},
  training: [],
  otherTraining: '',
  drivingLicense: false,
  vehicle: false,
  jornadas: [],
  days: [0, 1, 2, 3, 4],
  languages: ['Español'],
  about: '',
  documents: [],
  declarationSignedAt: undefined,
  available: true,
})

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

export const yearsToRange = (y: number) => (y < 0 ? '' : ([...EXPERIENCE_RANGES].reverse().find((r) => y >= r.min)?.id ?? '0'))

/* -------------------------------------------------------------------------- */

export function StepHeader({ icon: Icon, title, subtitle, eyebrow }: { icon: LucideIcon; title: string; subtitle: string; eyebrow?: string }) {
  return (
    <div className="mb-7 flex items-start gap-4">
      <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent max-sm:hidden">
        <Icon className="size-7" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 font-semibold text-accent">{eyebrow}</p>}
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-[60ch] text-lg text-ink-soft">{subtitle}</p>
      </div>
    </div>
  )
}

/* ------------------------------- Paso 1 --------------------------------- */

export function StepDatos({ d, set, errors, editing }: StepProps) {
  return (
    <div className="space-y-5">
      <Field label="Nombre y apellidos" required error={errors.name}>
        <IconInput icon={User} autoComplete="name" value={d.name} onChange={(e) => set({ name: e.target.value })} />
      </Field>
      <Field label="Correo electrónico" required error={errors.email}>
        <IconInput icon={Mail} type="email" inputMode="email" autoComplete="email" placeholder="nombre@ejemplo.com" value={d.email} onChange={(e) => set({ email: e.target.value })} />
      </Field>
      {!editing && (
        <Field label="Contraseña" required hint="Al menos 6 caracteres." error={errors.password}>
          <PasswordInput value={d.password} onChange={(password) => set({ password })} />
        </Field>
      )}
      <Field label="Teléfono" required error={errors.phone}>
        <IconInput icon={Phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="600 000 000" value={d.phone} onChange={(e) => set({ phone: e.target.value })} />
      </Field>
    </div>
  )
}

/* ------------------------------- Paso 2 --------------------------------- */

function FileUpload({ label, hint, kind, docs, onChange, error, required }: { label: string; hint: string; kind: string; docs: UploadedDoc[]; onChange: (docs: UploadedDoc[]) => void; error?: string; required?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  const mine = docs.filter((x) => x.kind === kind)
  return (
    <Field group label={label} hint={hint} error={error} required={required}>
      {mine.length > 0 && (
        <ul className="mb-3 space-y-2">
          {mine.map((doc) => (
            <li key={doc.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-accent-subtle py-2 ps-4 pe-2">
              <FileCheck2 aria-hidden className="size-6 shrink-0 text-accent" strokeWidth={2} />
              <span className="min-w-0 flex-1 font-medium break-all">{doc.fileName}</span>
              <DocStatusChip status={doc.status} />
              <button type="button" onClick={() => onChange(docs.filter((x) => x.id !== doc.id))} aria-label={`Quitar ${doc.fileName}`} className="pressable flex size-11 items-center justify-center rounded-full text-ink-soft hover:bg-surface hover:text-care">
                <Trash2 aria-hidden className="size-5" strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        ref={ref}
        type="file"
        tabIndex={-1}
        aria-hidden
        accept=".pdf,.jpg,.jpeg,.png"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onChange([...docs, { id: uid('doc'), kind, fileName: f.name, status: 'pendiente', uploadedAt: new Date().toISOString() }])
          e.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        aria-invalid={error ? true : undefined}
        className={cx(
          'pressable flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed bg-surface font-semibold text-accent hover:bg-accent-subtle',
          error ? 'border-care' : 'border-accent-line',
        )}
      >
        <Upload aria-hidden className="size-5" strokeWidth={2.25} />
        {mine.length ? 'Añadir otro archivo' : 'Subir archivo'}
        <span className="sr-only">: {label}</span>
      </button>
    </Field>
  )
}

export function StepDocumentacion({ d, set, errors }: StepProps) {
  const name = useId()
  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="mb-3 text-xl font-semibold">¿Tienes nacionalidad española?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <RadioCard name={name} checked={d.spanish} onChange={() => set({ spanish: true, nationality: '' })}>
            <span className="text-lg font-semibold">Sí</span>
          </RadioCard>
          <RadioCard name={name} checked={!d.spanish} onChange={() => set({ spanish: false })}>
            <span className="text-lg font-semibold">No, soy extranjera</span>
          </RadioCard>
        </div>
      </fieldset>
      {!d.spanish && (
        <Field label="Tu nacionalidad" required error={errors.nationality}>
          <Select value={d.nationality ?? ''} onChange={(nationality) => set({ nationality })} options={NATIONALITIES} placeholder="Selecciona tu nacionalidad" />
        </Field>
      )}
      <FileUpload
        label="Documento de identidad"
        hint={d.spanish ? 'DNI (anverso y reverso)' : 'Pasaporte o documento de tu país'}
        kind={d.spanish ? 'DNI (anverso y reverso)' : 'Pasaporte o documento de identidad'}
        docs={d.documents}
        onChange={(documents) => set({ documents })}
        error={errors.identity}
        required
      />
      {!d.spanish && (
        <FileUpload
          label="Documento que acredita tu derecho a trabajar en España"
          hint="Permiso de residencia y trabajo, TIE u otra autorización válida"
          kind="Permiso de residencia y trabajo"
          docs={d.documents}
          onChange={(documents) => set({ documents })}
          error={errors.permit}
          required
        />
      )}
      <FileUpload label="Certificados de formación (opcional)" hint="Títulos, cursos o certificados que quieras aportar" kind="Certificado de formación" docs={d.documents} onChange={(documents) => set({ documents })} />
      <InfoNote icon={Paperclip}>Formatos admitidos: PDF, JPG o PNG. El equipo de María te Cuida revisará tus documentos; no se muestran a las familias.</InfoNote>
    </div>
  )
}

/* ------------------------------- Paso 3 --------------------------------- */

export function StepDeclaracion({ d, set, errors }: StepProps) {
  const items = [
    'Los datos que facilito en mi perfil son veraces y están actualizados.',
    'Cuento con la documentación necesaria y en vigor para residir y trabajar legalmente en España.',
    'Dispongo de la capacitación y condiciones necesarias para desempeñar las tareas de cuidado que ofrezco.',
  ]
  return (
    <div className="space-y-6">
      <div className="card p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Declaro responsablemente que:</h2>
        <ol className="mt-5 space-y-4">
          {items.map((t, i) => (
            <li key={t} className="flex gap-4 leading-snug">
              <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent tabular-nums">
                {i + 1}
              </span>
              <span className="pt-1">{t}</span>
            </li>
          ))}
        </ol>
      </div>
      <Field error={errors.declaration}>
        <div className={cx('rounded-2xl border-2 px-4 py-2', d.declarationSignedAt ? 'border-accent bg-accent-subtle' : errors.declaration ? 'border-care bg-surface' : 'border-line bg-surface')}>
          <Checkbox
            checked={!!d.declarationSignedAt}
            onChange={(v) => set({ declarationSignedAt: v ? new Date().toISOString() : undefined })}
            label={<span className="text-lg font-semibold">Acepto la declaración responsable.</span>}
          />
        </div>
      </Field>
    </div>
  )
}

/* ------------------------------- Paso 4 --------------------------------- */

function CheckGrid({ options, values, onChange }: { options: { id: string; label: string }[]; values: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="grid gap-x-6 sm:grid-cols-2">
      {options.map((o) => (
        <Checkbox key={o.id} checked={values.includes(o.id)} onChange={() => onChange(toggle(values, o.id))} label={o.label} />
      ))}
    </div>
  )
}

export function StepExperiencia({ d, set, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <Field label="Años de experiencia" required error={errors.experienceYears} className="sm:max-w-sm">
        <Select
          value={yearsToRange(d.experienceYears)}
          onChange={(v) => set({ experienceYears: v === '' ? -1 : EXPERIENCE_RANGES.find((r) => r.id === v)!.min })}
          options={EXPERIENCE_RANGES}
          placeholder="Selecciona una opción"
        />
      </Field>
      <div>
        <h2 className="text-xl font-semibold">¿Con qué situaciones tienes experiencia?</h2>
        <p className="text-ink-soft">Abre cada apartado y marca todas las opciones que correspondan.</p>
      </div>
      {errors.careTypes && (
        <p className="rounded-2xl border-2 border-care bg-care-subtle px-4 py-3 font-medium text-care">{errors.careTypes}</p>
      )}
      <div className="space-y-3">
        <Accordion icon={Users} title="Experiencia en el cuidado" hint="Ejemplo: mayores, personas con dependencia, niños o adultos con discapacidad." count={d.careTypes.length} defaultOpen>
          <CheckGrid options={CARE_TYPES} values={d.careTypes} onChange={(careTypes) => set({ careTypes })} />
        </Accordion>
        <Accordion icon={HeartPulse} title="¿Has cuidado a alguien con alguna de estas enfermedades?" hint="Ejemplo: Alzheimer, Parkinson, ictus, diabetes, problemas de corazón o respiración, etc." count={d.illnesses.length}>
          <CheckGrid options={ILLNESSES} values={d.illnesses} onChange={(illnesses) => set({ illnesses })} />
        </Accordion>
        <Accordion icon={House} title="¿Dónde has trabajado cuidando?" hint="Ejemplo: en casas particulares, residencias, hospitales, etc." count={d.workplaces.length}>
          <CheckGrid options={WORKPLACES} values={d.workplaces} onChange={(workplaces) => set({ workplaces })} />
        </Accordion>
      </div>
      <Field label="Cuéntanos brevemente tu experiencia" required error={errors.experienceText}>
        <Textarea
          value={d.experienceText}
          onChange={(experienceText) => set({ experienceText })}
          max={500}
          rows={4}
          placeholder="Por ejemplo: a quién has cuidado, qué apoyo has dado y dónde (en casa, en una residencia…)."
        />
      </Field>
      <InfoNote>No es necesario incluir nombres ni teléfonos de familias anteriores.</InfoNote>
    </div>
  )
}

/* ------------------------------- Paso 5 --------------------------------- */

export function StepCuidados({ d, set, errors }: StepProps) {
  return (
    <div className="space-y-3">
      <p className="mb-4 text-ink-soft">Abre cada apartado y marca todas las tareas que sabes realizar.</p>
      {errors.tasks && <p className="rounded-2xl border-2 border-care bg-care-subtle px-4 py-3 font-medium text-care">{errors.tasks}</p>}
      {TASKS.map((t) => {
        const sel = d.tasks[t.id] ?? []
        return (
          <Accordion key={t.id} icon={TASK_ICONS[t.icon]} title={t.label} hint={`Por ejemplo: ${t.hint.charAt(0).toLowerCase()}${t.hint.slice(1)}`} count={sel.length}>
            <div className="grid gap-x-6 sm:grid-cols-2">
              {t.subtasks.map((s) => (
                <Checkbox
                  key={s}
                  checked={sel.includes(s)}
                  onChange={() => {
                    const next = toggle(sel, s)
                    const tasks = { ...d.tasks, [t.id]: next }
                    if (!next.length) delete tasks[t.id]
                    set({ tasks })
                  }}
                  label={s}
                />
              ))}
            </div>
          </Accordion>
        )
      })}
    </div>
  )
}

/* ------------------------------- Paso 6 --------------------------------- */

function Panel({ icon: Icon, title, hint, children, aside }: { icon: LucideIcon; title: string; hint: string; children?: ReactNode; aside?: ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <header className="flex flex-wrap items-center gap-4">
        <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent">
          <Icon className="size-6" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-ink-soft">{hint}</p>
        </div>
        {aside}
      </header>
      {children && <div className="mt-4">{children}</div>}
    </section>
  )
}

/** Disponible / No disponible: dos opciones grandes con icono y texto (radios nativos). */
export function AvailabilitySegment({ value, onChange, size = 'md' }: { value: boolean; onChange: (v: boolean) => void; size?: 'md' | 'lg' }) {
  const name = useId()
  return (
    <fieldset className="w-full sm:w-auto">
      <legend className="sr-only">Tu disponibilidad</legend>
      <div className="grid grid-cols-2 gap-1 rounded-full bg-sunken p-1">
        {[true, false].map((v) => {
          const on = value === v
          const Icon = v ? CircleCheck : CirclePause
          return (
            <label
              key={String(v)}
              className={cx(
                'flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 font-semibold whitespace-nowrap transition-[background-color,color,box-shadow] duration-150',
                'has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus',
                size === 'lg' ? 'min-h-14 text-lg' : 'min-h-12',
                on ? (v ? 'bg-ok text-white shadow-card' : 'bg-off text-white shadow-card') : 'text-ink-soft hover:bg-surface hover:text-ink',
              )}
            >
              <input type="radio" name={name} value={v ? "si" : "no"} className="sr-only" checked={on} onChange={() => onChange(v)} />
              <Icon aria-hidden className="size-5" strokeWidth={2.25} />
              {v ? 'Disponible' : 'No disponible'}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function FormacionFields({ d, set }: StepProps) {
  return (
    <Panel icon={GraduationCap} title="Formación" hint="Marca tu nivel de estudios y la formación relacionada con el cuidado.">
      <div className="grid gap-x-6 sm:grid-cols-2">
        {TRAINING.map((t) => (
          <Checkbox key={t.id} checked={d.training.includes(t.id)} onChange={() => set({ training: toggle(d.training, t.id) })} label={t.label} />
        ))}
      </div>
      {d.training.includes('otra') && (
        <Field label="¿Qué otra formación tienes?" className="mt-3">
          <Input value={d.otherTraining ?? ''} placeholder="Ej. Curso de cuidados paliativos" onChange={(e) => set({ otherTraining: e.target.value })} />
        </Field>
      )}
    </Panel>
  )
}

export function PreferenciasFields({ d, set, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <Panel icon={CalendarDays} title="Disponibilidad en la plataforma" hint="Indica si estás disponible para recibir ofertas de trabajo." aside={<AvailabilitySegment value={d.available} onChange={(available) => set({ available })} />} />
      <Panel icon={BriefcaseBusiness} title="Tipo de trabajo" hint="¿En qué tipo de servicios estás interesada?">
        <Field group label="Jornadas que te interesan" required error={errors.jornadas}>
          <div className="grid gap-x-6 sm:grid-cols-3">
            {JORNADAS.map((j) => (
              <Checkbox key={j.id} checked={d.jornadas.includes(j.id)} onChange={() => set({ jornadas: toggle(d.jornadas, j.id) })} label={j.label} />
            ))}
          </div>
        </Field>
        <Field group label="Días disponibles" className="mt-5">
          <DaysRow days={d.days} onToggle={(i) => set({ days: toggle(d.days, i).sort() })} />
        </Field>
      </Panel>
      <Panel icon={MapPin} title="Zona de trabajo" hint="Indica dónde puedes ofrecer tus servicios.">
        <Field label="Zona principal" required error={errors.zone}>
          <Select value={d.zone} onChange={(zone) => set({ zone, extraZones: d.extraZones.filter((z) => z !== zone) })} options={ZONES} placeholder="Selecciona tu zona" />
        </Field>
        {d.zone && (
          <Field group label="También puedo desplazarme a:" className="mt-5">
            <div className="flex flex-wrap gap-2">
              {ZONES.filter((z) => z !== d.zone).map((z) => (
                <Chip key={z} active={d.extraZones.includes(z)} onClick={() => set({ extraZones: toggle(d.extraZones, z) })}>
                  {z}
                </Chip>
              ))}
            </div>
          </Field>
        )}
      </Panel>
      <Panel icon={Car} title="Otros datos" hint="Cuéntanos si dispones de alguno de estos recursos.">
        <div className="grid gap-x-6 sm:grid-cols-2">
          <Checkbox checked={d.drivingLicense} onChange={(drivingLicense) => set({ drivingLicense })} label="Carné de conducir" />
          <Checkbox checked={d.vehicle} onChange={(vehicle) => set({ vehicle })} label="Vehículo propio" />
        </div>
      </Panel>
      <Panel icon={Languages} title="Idiomas" hint="¿En qué idiomas puedes comunicarte?">
        <Field group label="Idiomas" className="[&>legend]:sr-only">
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <Chip key={l} active={d.languages.includes(l)} onClick={() => set({ languages: toggle(d.languages, l) })}>
                {l}
              </Chip>
            ))}
          </div>
        </Field>
      </Panel>
      <Panel icon={NotebookPen} title="¿Quieres añadir algo más?" hint="Por ejemplo, tus motivaciones, habilidades o cualquier información que consideres importante.">
        <Textarea value={d.about} onChange={(about) => set({ about })} max={500} rows={4} aria-label="Algo más sobre ti" placeholder="Ej. Soy una persona paciente y alegre…" />
      </Panel>
    </div>
  )
}

export function StepFormacionPreferencias(p: StepProps) {
  return (
    <div className="space-y-4">
      <FormacionFields {...p} />
      <PreferenciasFields {...p} />
    </div>
  )
}

/* ------------------------------- Validación ----------------------------- */

export function validateStep(step: number, d: CaregiverDraft, editing = false): Record<string, string> {
  const e: Record<string, string> = {}
  if (step === 1) {
    if (d.name.trim().split(' ').length < 2) e.name = 'Escribe tu nombre y al menos un apellido.'
    if (!/^\S+@\S+\.\S+$/.test(d.email)) e.email = 'Escribe un correo con el formato nombre@ejemplo.com.'
    if (!editing && d.password.length < 6) e.password = 'Elige una contraseña de al menos 6 caracteres.'
    if (d.phone.replace(/\D/g, '').length < 9) e.phone = 'Escribe un teléfono de 9 cifras.'
  }
  if (step === 2) {
    if (!d.spanish && !d.nationality) e.nationality = 'Selecciona tu nacionalidad.'
    const kinds = d.documents.map((x) => x.kind)
    if (!kinds.some((k) => k.startsWith('DNI') || k.startsWith('Pasaporte'))) e.identity = 'Sube tu documento de identidad.'
    if (!d.spanish && !kinds.includes('Permiso de residencia y trabajo')) e.permit = 'Sube el documento que acredita tu derecho a trabajar.'
  }
  if (step === 3 && !d.declarationSignedAt) e.declaration = 'Marca «Acepto la declaración responsable» para continuar.'
  if (step === 4) {
    if (d.experienceYears < 0) e.experienceYears = 'Selecciona tus años de experiencia.'
    if (!d.careTypes.length) e.careTypes = 'Marca al menos una situación en «Experiencia en el cuidado».'
    if (d.experienceText.trim().length < 20) e.experienceText = 'Cuéntanos tu experiencia con al menos 20 caracteres.'
  }
  if (step === 5 && !Object.keys(d.tasks).length) e.tasks = 'Marca al menos un cuidado que sepas realizar.'
  if (step === 6) {
    if (!d.jornadas.length) e.jornadas = 'Elige al menos un tipo de jornada.'
    if (!d.zone) e.zone = 'Selecciona tu zona de trabajo.'
  }
  return e
}

export const STEPS: { title: string; short: string; subtitle: string; icon: LucideIcon; Comp: (p: StepProps) => ReactNode }[] = [
  { title: 'Registro de cuidadora', short: 'Tus datos', subtitle: 'Crea tu perfil profesional para que las familias puedan encontrarte.', icon: User, Comp: StepDatos },
  { title: 'Documentación', short: 'Documentación', subtitle: 'Necesitamos comprobar tu identidad y que puedes trabajar legalmente en España.', icon: FileText, Comp: StepDocumentacion },
  { title: 'Declaración responsable', short: 'Declaración', subtitle: 'Para completar tu registro, confirma que la siguiente información es cierta.', icon: FileCheck2, Comp: StepDeclaracion },
  { title: 'Experiencia profesional', short: 'Experiencia', subtitle: 'Cuéntanos tu experiencia en el cuidado y apoyo a otras personas.', icon: BriefcaseBusiness, Comp: StepExperiencia },
  { title: '¿Qué cuidados sabes realizar?', short: 'Cuidados', subtitle: 'Indica qué tareas puedes ofrecer en el cuidado y apoyo a otras personas.', icon: HeartPulse, Comp: StepCuidados },
  { title: 'Formación y preferencias', short: 'Preferencias', subtitle: 'Cuéntanos tu formación y cómo te gustaría trabajar.', icon: GraduationCap, Comp: StepFormacionPreferencias },
]
