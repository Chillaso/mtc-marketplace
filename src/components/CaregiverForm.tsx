import { useRef, type ReactNode } from 'react'
import {
  Accessibility,
  BedDouble,
  BriefcaseBusiness,
  CalendarDays,
  Car,
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
import { Accordion, Checkbox, Chip, DaysRow, DocStatusChip, Field, IconInput, InfoNote, RadioCard, Select, Textarea } from './ui'
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

export const yearsToRange = (y: number) => (y < 0 ? '' : [...EXPERIENCE_RANGES].reverse().find((r) => y >= r.min)?.id ?? '0')

/* -------------------------------------------------------------------------- */

export function StepHeader({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="flex items-center gap-3 text-[28px] leading-tight font-bold sm:text-4xl">
        <Icon className="size-10 shrink-0 text-brand-800 sm:size-12" strokeWidth={1.6} />
        {title}
      </h1>
      <p className="mt-2 text-[17px] text-ink-soft">{subtitle}</p>
    </div>
  )
}

/* ------------------------------- Paso 1 --------------------------------- */

export function StepDatos({ d, set, errors, editing }: StepProps) {
  return (
    <div className="space-y-4">
      <Field error={errors.name}>
        <IconInput icon={User} placeholder="Nombre y apellidos*" autoComplete="name" value={d.name} invalid={!!errors.name} onChange={(e) => set({ name: e.target.value })} />
      </Field>
      <Field error={errors.email}>
        <IconInput icon={Mail} type="email" placeholder="Correo electrónico*" autoComplete="email" value={d.email} invalid={!!errors.email} onChange={(e) => set({ email: e.target.value })} />
      </Field>
      {!editing && (
        <Field error={errors.password}>
          <PasswordInput value={d.password} onChange={(password) => set({ password })} invalid={!!errors.password} />
        </Field>
      )}
      <Field error={errors.phone}>
        <IconInput icon={Phone} type="tel" placeholder="Teléfono*" autoComplete="tel" value={d.phone} invalid={!!errors.phone} onChange={(e) => set({ phone: e.target.value })} />
      </Field>
    </div>
  )
}

/* ------------------------------- Paso 2 --------------------------------- */

function FileUpload({ label, hint, kind, docs, onChange, error }: { label: string; hint: string; kind: string; docs: UploadedDoc[]; onChange: (docs: UploadedDoc[]) => void; error?: string }) {
  const ref = useRef<HTMLInputElement>(null)
  const mine = docs.filter((x) => x.kind === kind)
  return (
    <Field label={label} hint={hint} error={error}>
      {mine.map((doc) => (
        <div key={doc.id} className="mb-2 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3">
          <FileCheck2 className="size-6 text-brand-700" />
          <span className="min-w-0 flex-1 truncate font-medium">{doc.fileName}</span>
          <DocStatusChip status={doc.status} />
          <button type="button" onClick={() => onChange(docs.filter((x) => x.id !== doc.id))} aria-label={`Quitar ${doc.fileName}`} className="rounded-full p-1.5 text-muted hover:bg-white hover:text-rosa-600">
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <input
        ref={ref}
        type="file"
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
        className={cx('flex h-12 w-full items-center justify-center gap-2.5 rounded-full border-[1.5px] bg-white font-semibold text-brand-800 transition hover:bg-brand-50', error ? 'border-rosa-500' : 'border-brand-700')}
      >
        <Upload className="size-5" />
        {mine.length ? 'Añadir otro archivo' : 'Subir archivo'}
      </button>
    </Field>
  )
}

export function StepDocumentacion({ d, set, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-xl font-semibold">¿Tienes nacionalidad española?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <RadioCard checked={d.spanish} onChange={() => set({ spanish: true, nationality: '' })}>
            <span className="text-lg font-semibold">Sí</span>
          </RadioCard>
          <RadioCard checked={!d.spanish} onChange={() => set({ spanish: false })}>
            <span className="text-lg font-semibold">No, soy extranjera</span>
          </RadioCard>
        </div>
      </div>
      {!d.spanish && (
        <Field label="Tu nacionalidad" error={errors.nationality}>
          <Select value={d.nationality ?? ''} onChange={(nationality) => set({ nationality })} options={NATIONALITIES} placeholder="Selecciona tu nacionalidad" invalid={!!errors.nationality} />
        </Field>
      )}
      <FileUpload
        label="Documento de identidad"
        hint={d.spanish ? 'DNI (anverso y reverso)' : 'Pasaporte o documento de tu país'}
        kind={d.spanish ? 'DNI (anverso y reverso)' : 'Pasaporte o documento de identidad'}
        docs={d.documents}
        onChange={(documents) => set({ documents })}
        error={errors.identity}
      />
      {!d.spanish && (
        <FileUpload
          label="Documentación que acredita tu derecho a trabajar en España"
          hint="Permiso de residencia y trabajo, TIE u otra autorización válida"
          kind="Permiso de residencia y trabajo"
          docs={d.documents}
          onChange={(documents) => set({ documents })}
          error={errors.permit}
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
      <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Declaro responsablemente que:</h2>
        <ul className="mt-4 space-y-4">
          {items.map((t) => (
            <li key={t} className="flex gap-3 text-[17px] leading-snug">
              <svg viewBox="0 0 24 24" className="mt-0.5 size-6 shrink-0 text-brand-700" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
              {t}
            </li>
          ))}
        </ul>
      </div>
      <Field error={errors.declaration}>
        <Checkbox
          checked={!!d.declarationSignedAt}
          onChange={(v) => set({ declarationSignedAt: v ? new Date().toISOString() : undefined })}
          label={<span className="text-lg font-semibold">Acepto la declaración responsable.</span>}
        />
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
    <div className="space-y-5">
      <Field label="Años de experiencia" required error={errors.experienceYears}>
        <Select
          value={yearsToRange(d.experienceYears)}
          onChange={(v) => set({ experienceYears: v === '' ? -1 : EXPERIENCE_RANGES.find((r) => r.id === v)!.min })}
          options={EXPERIENCE_RANGES}
          placeholder="Selecciona una opción"
          invalid={!!errors.experienceYears}
        />
      </Field>
      <div className="rounded-2xl bg-brand-50 px-5 py-4">
        <h2 className="text-xl font-semibold">¿Con qué situaciones tienes experiencia?</h2>
        <p className="text-ink-soft">Abre cada apartado y marca todas las opciones que correspondan.</p>
      </div>
      {errors.careTypes && <p className="text-sm font-medium text-rosa-600">{errors.careTypes}</p>}
      <Accordion icon={Users} title="Experiencia en el cuidado" hint="Ejemplo: mayores, personas con dependencia, niños o adultos con discapacidad." count={d.careTypes.length} defaultOpen>
        <CheckGrid options={CARE_TYPES} values={d.careTypes} onChange={(careTypes) => set({ careTypes })} />
      </Accordion>
      <Accordion icon={HeartPulse} title="¿Has cuidado a alguien con alguna de estas enfermedades?" hint="Ejemplo: Alzheimer, Parkinson, ictus, diabetes, problemas de corazón o respiración, etc." count={d.illnesses.length}>
        <CheckGrid options={ILLNESSES} values={d.illnesses} onChange={(illnesses) => set({ illnesses })} />
      </Accordion>
      <Accordion icon={House} title="¿Dónde has trabajado cuidando?" hint="Ejemplo: en casas particulares, residencias, hospitales, etc." count={d.workplaces.length}>
        <CheckGrid options={WORKPLACES} values={d.workplaces} onChange={(workplaces) => set({ workplaces })} />
      </Accordion>
      <Field label="Cuéntanos brevemente tu experiencia" required error={errors.experienceText}>
        <Textarea
          value={d.experienceText}
          onChange={(experienceText) => set({ experienceText })}
          max={500}
          rows={3}
          invalid={!!errors.experienceText}
          placeholder="Describe de forma sencilla a quién has cuidado, qué apoyo has dado y en qué entorno (por ejemplo, en casa, en una residencia, etc.)."
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
      <div className="mb-4 rounded-2xl bg-brand-50 px-5 py-3.5 text-ink">Marca todas las opciones que correspondan a tu experiencia.</div>
      {errors.tasks && <p className="text-sm font-medium text-rosa-600">{errors.tasks}</p>}
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
    <section className="overflow-hidden rounded-2xl border border-line bg-white">
      <header className="flex flex-wrap items-center gap-4 bg-gradient-to-r from-brand-50 to-white px-4 py-3.5 sm:px-5">
        <Icon className="size-9 shrink-0 text-brand-800" strokeWidth={1.6} />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-ink-soft">{hint}</p>
        </div>
        {aside}
      </header>
      {children && <div className="px-4 py-3 sm:px-5">{children}</div>}
    </section>
  )
}

export function AvailabilitySegment({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="inline-flex rounded-full border border-line bg-white p-1" role="radiogroup" aria-label="Disponibilidad">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cx('rounded-full px-4 py-2 font-semibold transition', value === v ? (v ? 'bg-emerald-700 text-white' : 'bg-slate-600 text-white') : 'text-ink hover:bg-brand-50')}
        >
          {v ? 'Disponible' : 'No disponible'}
        </button>
      ))}
    </div>
  )
}

export function FormacionFields({ d, set }: StepProps) {
  return (
    <Panel icon={GraduationCap} title="Formación" hint="Selecciona tu nivel de estudios y formación relacionada con el cuidado.">
      <div className="grid gap-x-6 sm:grid-cols-2">
        {TRAINING.map((t) => (
          <Checkbox key={t.id} checked={d.training.includes(t.id)} onChange={() => set({ training: toggle(d.training, t.id) })} label={t.label} />
        ))}
      </div>
      {d.training.includes('otra') && <input className="input-base mt-2" placeholder="Especifica cuál" value={d.otherTraining ?? ''} onChange={(e) => set({ otherTraining: e.target.value })} />}
    </Panel>
  )
}

export function PreferenciasFields({ d, set, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <Panel icon={CalendarDays} title="Disponibilidad en la plataforma" hint="Indica si estás disponible para recibir ofertas de trabajo." aside={<AvailabilitySegment value={d.available} onChange={(available) => set({ available })} />} />
      <Panel icon={Car} title="Otros datos" hint="Cuéntanos si dispones de alguno de estos recursos.">
        <div className="grid gap-x-6 sm:grid-cols-2">
          <Checkbox checked={d.drivingLicense} onChange={(drivingLicense) => set({ drivingLicense })} label="Carné de conducir" />
          <Checkbox checked={d.vehicle} onChange={(vehicle) => set({ vehicle })} label="Vehículo propio" />
        </div>
      </Panel>
      <Panel icon={BriefcaseBusiness} title="Tipo de trabajo" hint="¿En qué tipo de servicios estás interesada?">
        {errors.jornadas && <p className="mb-1 text-sm font-medium text-rosa-600">{errors.jornadas}</p>}
        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
          {JORNADAS.map((j) => (
            <Checkbox key={j.id} checked={d.jornadas.includes(j.id)} onChange={() => set({ jornadas: toggle(d.jornadas, j.id) })} label={j.label} />
          ))}
        </div>
        <div className="mt-4 mb-2 text-sm font-semibold text-ink-soft">Días disponibles</div>
        <DaysRow days={d.days} onToggle={(i) => set({ days: toggle(d.days, i).sort() })} />
      </Panel>
      <Panel icon={MapPin} title="Zona de trabajo" hint="Indica dónde puedes ofrecer tus servicios.">
        <Field error={errors.zone}>
          <Select value={d.zone} onChange={(zone) => set({ zone, extraZones: d.extraZones.filter((z) => z !== zone) })} options={ZONES} placeholder="Selecciona tu zona (provincia, municipio o código postal)" invalid={!!errors.zone} />
        </Field>
        {d.zone && (
          <>
            <div className="mt-4 mb-2 text-sm font-semibold text-ink-soft">También puedo desplazarme a:</div>
            <div className="flex flex-wrap gap-2">
              {ZONES.filter((z) => z !== d.zone).map((z) => (
                <Chip key={z} active={d.extraZones.includes(z)} onClick={() => set({ extraZones: toggle(d.extraZones, z) })}>
                  {z}
                </Chip>
              ))}
            </div>
          </>
        )}
      </Panel>
      <Panel icon={Languages} title="Idiomas" hint="¿En qué idiomas puedes comunicarte?">
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <Chip key={l} active={d.languages.includes(l)} onClick={() => set({ languages: toggle(d.languages, l) })}>
              {l}
            </Chip>
          ))}
        </div>
      </Panel>
      <Panel icon={NotebookPen} title="¿Quieres añadir algo más?" hint="Por ejemplo, tus motivaciones, habilidades o cualquier información que consideres importante.">
        <Textarea value={d.about} onChange={(about) => set({ about })} max={500} rows={3} placeholder="Escribe aquí…" />
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
    if (!/^\S+@\S+\.\S+$/.test(d.email)) e.email = 'Introduce un correo electrónico válido.'
    if (!editing && d.password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres.'
    if (d.phone.replace(/\D/g, '').length < 9) e.phone = 'Introduce un teléfono de 9 cifras.'
  }
  if (step === 2) {
    if (!d.spanish && !d.nationality) e.nationality = 'Selecciona tu nacionalidad.'
    const kinds = d.documents.map((x) => x.kind)
    if (!kinds.some((k) => k.startsWith('DNI') || k.startsWith('Pasaporte'))) e.identity = 'Sube tu documento de identidad.'
    if (!d.spanish && !kinds.includes('Permiso de residencia y trabajo')) e.permit = 'Sube el documento que acredita tu derecho a trabajar.'
  }
  if (step === 3 && !d.declarationSignedAt) e.declaration = 'Debes aceptar la declaración responsable para continuar.'
  if (step === 4) {
    if (d.experienceYears < 0) e.experienceYears = 'Selecciona tus años de experiencia.'
    if (!d.careTypes.length) e.careTypes = 'Marca al menos una situación en «Experiencia en el cuidado».'
    if (d.experienceText.trim().length < 20) e.experienceText = 'Cuéntanos tu experiencia en al menos 20 caracteres.'
  }
  if (step === 5 && !Object.keys(d.tasks).length) e.tasks = 'Marca al menos un cuidado que sepas realizar.'
  if (step === 6) {
    if (!d.jornadas.length) e.jornadas = 'Elige al menos un tipo de trabajo.'
    if (!d.zone) e.zone = 'Selecciona tu zona de trabajo.'
  }
  return e
}

export const STEPS: { title: string; subtitle: string; icon: LucideIcon; Comp: (p: StepProps) => ReactNode }[] = [
  { title: 'Registro de cuidadora', subtitle: 'Crea tu perfil profesional para que las familias puedan encontrarte.', icon: User, Comp: StepDatos },
  { title: 'Documentación', subtitle: 'Necesitamos comprobar tu identidad y que puedes trabajar legalmente en España.', icon: FileText, Comp: StepDocumentacion },
  { title: 'Declaración responsable', subtitle: 'Para completar tu registro, confirma que la siguiente información es cierta.', icon: FileCheck2, Comp: StepDeclaracion },
  { title: 'Experiencia profesional', subtitle: 'Cuéntanos tu experiencia en el cuidado y apoyo a otras personas.', icon: BriefcaseBusiness, Comp: StepExperiencia },
  { title: '¿Qué cuidados sabes realizar?', subtitle: 'Indica qué tareas puedes ofrecer en el cuidado y apoyo a otras personas.', icon: HeartPulse, Comp: StepCuidados },
  { title: 'Formación y preferencias laborales', subtitle: 'Cuéntanos tu formación y cómo te gustaría trabajar.', icon: GraduationCap, Comp: StepFormacionPreferencias },
]
