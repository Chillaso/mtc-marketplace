import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  GraduationCap,
  Handshake,
  Heart,
  Mail,
  MapPin,
  MessageCircleMore,
  Pencil,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  User,
  UserRoundCheck,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Container } from '../components/Layout'
import { Avatar, Button, DocStatusChip, EmptyState, IconBubble, InfoNote, LoginRequired, Toggle } from '../components/ui'
import { CaregiverProfileView } from '../components/CaregiverProfileView'
import {
  FormacionFields,
  PreferenciasFields,
  StepCuidados,
  StepDatos,
  StepDocumentacion,
  StepExperiencia,
  StepHeader,
  validateStep,
  type StepProps,
} from '../components/CaregiverForm'
import { useMe, useStore, type CaregiverDraft } from '../store'
import type { Caregiver, ContactRequest } from '../data/types'
import { JORNADAS, PERSON_TYPES, START_OPTIONS, labelOf } from '../data/catalog'
import { cx, fmtDate, fmtWhen } from '../lib/format'

type SectionId = 'datos' | 'documentacion' | 'experiencia' | 'cuidados' | 'formacion' | 'preferencias'

const SECTIONS: Record<SectionId, { title: string; subtitle: string; icon: LucideIcon; step: number; Comp: (p: StepProps) => React.ReactNode }> = {
  datos: { title: 'Mi perfil', subtitle: 'Tus datos personales y de contacto.', icon: User, step: 1, Comp: StepDatos },
  experiencia: { title: 'Mi experiencia', subtitle: 'Tu trayectoria profesional.', icon: BriefcaseBusiness, step: 4, Comp: StepExperiencia },
  formacion: { title: 'Mis formaciones', subtitle: 'Estudios y cursos que has realizado.', icon: GraduationCap, step: 0, Comp: FormacionFields },
  cuidados: { title: 'Mis cuidados', subtitle: 'Qué tipo de cuidados puedes ofrecer.', icon: Heart, step: 5, Comp: StepCuidados },
  preferencias: { title: 'Preferencias laborales', subtitle: 'Tu disponibilidad, tipo de trabajo y zona.', icon: SlidersHorizontal, step: 6, Comp: PreferenciasFields },
  documentacion: { title: 'Documentación', subtitle: 'Tus documentos y certificados.', icon: FileText, step: 2, Comp: StepDocumentacion },
}

function sectionStatus(id: SectionId, c: Caregiver): 'ok' | 'review' | 'todo' {
  switch (id) {
    case 'datos':
      return c.name && c.email && c.phone ? 'ok' : 'todo'
    case 'experiencia':
      return c.experienceYears >= 0 && c.careTypes.length && c.experienceText ? 'ok' : 'todo'
    case 'formacion':
      return c.training.length ? 'ok' : 'todo'
    case 'cuidados':
      return Object.keys(c.tasks).length ? 'ok' : 'todo'
    case 'preferencias':
      return c.jornadas.length && c.zone ? 'ok' : 'todo'
    case 'documentacion':
      return c.docsStatus === 'revisada' && !c.documents.some((d) => d.status !== 'revisada') ? 'ok' : c.documents.length ? 'review' : 'todo'
  }
}

function StatusPill({ s }: { s: 'ok' | 'review' | 'todo' }) {
  if (s === 'ok')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-900">
        <Check className="size-4 text-brand-700" strokeWidth={3} />
        Completado
      </span>
    )
  if (s === 'review')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
        <Clock className="size-4" />
        En revisión
      </span>
    )
  return <span className="inline-flex items-center rounded-full bg-amber-soft px-3 py-1 text-sm font-semibold text-amber-ink">Pendiente</span>
}

function RequireCaregiver({ children }: { children: (c: Caregiver) => React.ReactNode }) {
  const me = useMe()
  if (!me.caregiver) return <LoginRequired next="/cuidadora" role="caregiver" />
  return <>{children(me.caregiver)}</>
}

/* ------------------------------ Panel principal ------------------------------ */

export function CaregiverDashboard() {
  return <RequireCaregiver>{(c) => <Dashboard c={c} />}</RequireCaregiver>
}

function Dashboard({ c }: { c: Caregiver }) {
  const { state, setAvailability } = useStore()
  const me = useMe()
  const pending = me.myRequests.filter((r) => r.status === 'pendiente')
  const activity = state.activity.filter((a) => a.caregiverId === c.id).slice(0, 5)

  return (
    <Container className="max-w-5xl py-6 sm:py-8">
      <section className="flex flex-col gap-5 rounded-3xl border border-brand-100 bg-gradient-to-r from-brand-50 to-white p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex flex-1 items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 sm:size-20">
            <UserRoundCheck className="size-9" strokeWidth={1.6} />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Hola, {me.greetingName}</h1>
            <p className="mt-1 text-[17px] text-ink-soft">Aquí tienes tu perfil y toda la información de tu cuenta.</p>
          </div>
        </div>
        <div className="sm:text-right">
          <div className="inline-flex items-center gap-4 rounded-full border border-line bg-white py-2 pr-2 pl-5 shadow-card">
            <span className={cx('size-3 rounded-full', c.available ? 'bg-emerald-600' : 'bg-slate-400')} />
            <span className={cx('text-lg font-semibold', c.available ? 'text-emerald-800' : 'text-slate-600')}>{c.available ? 'Disponible' : 'No disponible'}</span>
            <Toggle checked={c.available} onChange={(v) => setAvailability(c.id, v)} label="Cambiar disponibilidad" />
          </div>
          <p className="mt-2 text-xs text-muted">Puedes cambiar tu disponibilidad en cualquier momento.</p>
        </div>
      </section>

      {pending.length > 0 && (
        <Link to="/cuidadora/solicitudes" className="mt-5 flex items-center gap-4 rounded-2xl bg-rosa-50 p-4 ring-1 ring-rosa-100 transition hover:ring-rosa-300 sm:p-5">
          <IconBubble icon={Handshake} tone="rosa" />
          <div className="flex-1">
            <div className="text-lg font-semibold">
              Tienes {pending.length} {pending.length === 1 ? 'solicitud de contacto nueva' : 'solicitudes de contacto nuevas'}
            </div>
            <div className="text-ink-soft">Revisa qué necesita la familia y decide si quieres aceptarla.</div>
          </div>
          <ChevronRight className="size-6 text-rosa-600" />
        </Link>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {(Object.keys(SECTIONS) as SectionId[]).map((id) => {
          const s = SECTIONS[id]
          return (
            <Link key={id} to={`/cuidadora/perfil/${id}`} className="card group flex flex-col gap-4 p-5 transition hover:border-brand-200 hover:shadow-pop">
              <div className="flex items-start gap-4">
                <IconBubble icon={s.icon} size="lg" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{s.title}</h2>
                  <p className="text-ink-soft">{s.subtitle}</p>
                </div>
                <ChevronRight className="mt-1 size-5 text-ink transition group-hover:translate-x-0.5" />
              </div>
              <div className="flex items-center justify-between">
                <StatusPill s={sectionStatus(id, c)} />
                <span className="inline-flex h-9 items-center gap-1 rounded-full border border-brand-200 px-4 text-sm font-semibold text-brand-800 group-hover:bg-brand-50">
                  Ver y editar <ChevronRight className="size-4" />
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      <Link to="/mensajes" className="card mt-4 flex items-center gap-4 p-5 transition hover:shadow-pop">
        <IconBubble icon={Mail} size="lg" />
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Mensajes</h2>
          <p className="text-ink-soft">Contacta con familias y consulta tus conversaciones.</p>
        </div>
        {me.unreadMessages > 0 && <span className="flex size-8 items-center justify-center rounded-full bg-rosa-500 font-bold text-white">{me.unreadMessages}</span>}
        <ChevronRight className="size-5" />
      </Link>

      <section className="mt-4 flex flex-col gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-5 sm:flex-row sm:items-center">
        <IconBubble icon={ShieldCheck} size="lg" />
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Tu perfil, siempre actualizado</h2>
          <p className="text-ink-soft">Mantén tu información al día para recibir más oportunidades de trabajo.</p>
        </div>
        <Button variant="outline" to="/cuidadora/perfil" iconRight={ChevronRight}>
          Ver mi perfil público
        </Button>
      </section>

      <section className="card mt-4 p-5">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-7 text-brand-700" />
          <h2 className="flex-1 text-xl font-semibold">Tu actividad reciente</h2>
        </div>
        <ul className="mt-3 divide-y divide-line">
          {activity.map((a) => (
            <li key={a.id} className="grid grid-cols-[110px_16px_1fr] items-center gap-3 py-3 text-[15px] sm:grid-cols-[140px_16px_1fr]">
              <span className="text-sm text-muted">{fmtWhen(a.at)}</span>
              <span className={cx('size-2.5 rounded-full', a.highlight ? 'bg-brand-600' : 'bg-slate-300')} />
              <span className={a.highlight ? 'text-brand-900' : 'text-ink-soft'}>{a.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  )
}

/* ------------------------------ Mi perfil público ------------------------------ */

export function CaregiverOwnProfile() {
  return (
    <RequireCaregiver>
      {(c) => (
        <Container className="max-w-6xl py-6 sm:py-8">
          <InfoNote icon={Eye}>
            <strong>Así ven tu perfil las familias.</strong> Tu correo y teléfono no se muestran: solo se comparten cuando aceptas una solicitud.
          </InfoNote>
          <div className="mt-5">
            <CaregiverProfileView
              c={c}
              fullName
              actions={
                <>
                  <Button variant="outline" icon={Pencil} to="/cuidadora/perfil/datos">Editar mis datos</Button>
                  <Button variant="outline" icon={Pencil} to="/cuidadora/perfil/experiencia">Editar experiencia</Button>
                  <Button variant="outline" icon={Pencil} to="/cuidadora/perfil/preferencias">Editar preferencias</Button>
                </>
              }
            />
          </div>
        </Container>
      )}
    </RequireCaregiver>
  )
}

/* ------------------------------ Edición por secciones ------------------------------ */

export function CaregiverSectionEdit() {
  const { section } = useParams()
  return <RequireCaregiver>{(c) => (section && section in SECTIONS ? <SectionEditor key={section} c={c} id={section as SectionId} /> : <Navigate to="/cuidadora" replace />)}</RequireCaregiver>
}

function SectionEditor({ c, id }: { c: Caregiver; id: SectionId }) {
  const { updateCaregiver, toast } = useStore()
  const navigate = useNavigate()
  const sec = SECTIONS[id]
  const [d, setD] = useState<CaregiverDraft>({ ...c, password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = (patch: Partial<CaregiverDraft>) => {
    setD((p) => ({ ...p, ...patch }))
    setErrors({})
  }
  const save = () => {
    const e = sec.step ? validateStep(sec.step, d, true) : {}
    setErrors(e)
    if (Object.keys(e).length) return
    const { password: _pw, ...rest } = d
    void _pw
    const patch: Partial<Caregiver> = { ...rest }
    if (id === 'documentacion') {
      patch.documents = d.documents.map((x) => (x.status === 'pendiente' ? { ...x, status: 'en_revision' } : x))
      if (patch.documents.some((x) => x.status !== 'revisada')) patch.docsStatus = 'en_revision'
    }
    updateCaregiver(c.id, patch, `Has actualizado la sección «${sec.title}».`)
    toast('Cambios guardados.')
    navigate('/cuidadora')
  }
  return (
    <Container className="max-w-3xl py-6 sm:py-8">
      <Link to="/cuidadora" className="mb-6 flex items-center gap-3 rounded-full bg-gradient-to-r from-brand-50 to-brand-100 px-5 py-3 font-semibold text-ink">
        <ArrowLeft className="size-5" /> Volver a mi cuenta
      </Link>
      <StepHeader icon={sec.icon} title={sec.title} subtitle={sec.subtitle} />
      {id === 'documentacion' && (
        <div className="mb-6 space-y-3">
          <InfoNote icon={ShieldCheck}>
            La revisión de documentos es distinta del distintivo <strong>«Cuidadora de confianza»</strong>, que se concede a quienes ya han trabajado con familias a través de la plataforma y han sido valoradas positivamente.
          </InfoNote>
          <div className="flex items-center gap-3 rounded-2xl border border-line p-4">
            <span className="flex-1 font-semibold">Estado de tu documentación</span>
            <DocStatusChip status={c.docsStatus} />
          </div>
        </div>
      )}
      <sec.Comp d={d} set={set} errors={errors} editing />
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
        <Button variant="outline" size="lg" to="/cuidadora">Cancelar</Button>
        <Button size="lg" className="sm:flex-1" icon={Save} onClick={save}>Guardar cambios</Button>
      </div>
    </Container>
  )
}

/* ------------------------------ Solicitudes recibidas ------------------------------ */

export function CaregiverRequests() {
  return <RequireCaregiver>{(c) => <Requests c={c} />}</RequireCaregiver>
}

const startText = (r: ContactRequest) => (r.start === 'fecha' && r.startDate ? fmtDate(r.startDate) : labelOf(START_OPTIONS, r.start))

function Requests({ c }: { c: Caregiver }) {
  const { state, respondRequest, toast } = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'pendiente' | 'resto'>('pendiente')
  const mine = state.requests.filter((r) => r.caregiverId === c.id && r.status !== 'cancelada')
  const list = mine.filter((r) => (tab === 'pendiente' ? r.status === 'pendiente' : r.status !== 'pendiente'))
  const pendingCount = mine.filter((r) => r.status === 'pendiente').length

  return (
    <Container className="max-w-4xl py-6 sm:py-8">
      <h1 className="text-3xl font-bold sm:text-4xl">Solicitudes de contacto</h1>
      <p className="mt-1 text-[17px] text-ink-soft">Las familias te cuentan qué necesitan. Si aceptas, se confirma el match y se abre el chat privado.</p>
      <div className="mt-6 inline-flex rounded-full bg-brand-50 p-1">
        {(
          [
            ['pendiente', `Nuevas (${pendingCount})`],
            ['resto', 'Respondidas'],
          ] as const
        ).map(([k, label]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={cx('rounded-full px-5 py-2 font-semibold transition', tab === k ? 'bg-white text-brand-900 shadow-card' : 'text-ink-soft')}>
            {label}
          </button>
        ))}
      </div>
      <div className="mt-5 space-y-4">
        {list.length === 0 && (
          <div className="card">
            <EmptyState icon={Handshake} title={tab === 'pendiente' ? 'No tienes solicitudes nuevas' : 'Aún no has respondido solicitudes'}>
              {c.available ? 'Cuando una familia quiera contactar contigo, la verás aquí.' : 'Ahora mismo apareces como «No disponible». Actívate para recibir nuevas solicitudes.'}
            </EmptyState>
          </div>
        )}
        {list.map((r) => {
          const fam = state.families.find((f) => f.id === r.familyId)!
          return (
            <article key={r.id} className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Avatar name={fam.name.replace('Familia ', '')} size={48} />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{fam.name}</h2>
                  <div className="text-sm text-muted">Recibida: {fmtWhen(r.createdAt)}</div>
                </div>
                {r.status === 'aceptada' && <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-900">Match confirmado</span>}
                {r.status === 'rechazada' && <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">Rechazada</span>}
              </div>
              <p className="mt-4 rounded-2xl bg-brand-50/60 p-4 text-[17px] leading-relaxed">“{r.need}”</p>
              <div className="mt-4 grid gap-2 text-[15px] text-ink-soft sm:grid-cols-2">
                <span className="flex items-center gap-2"><User className="size-5 text-brand-600" />{labelOf(PERSON_TYPES, r.personType)}</span>
                <span className="flex items-center gap-2"><MapPin className="size-5 text-brand-600" />{r.zone}</span>
                <span className="flex items-center gap-2"><CalendarDays className="size-5 text-brand-600" />Inicio: {startText(r)}</span>
                <span className="flex items-center gap-2"><Clock className="size-5 text-brand-600" />{labelOf(JORNADAS, r.jornada)}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {r.status === 'pendiente' ? (
                  <>
                    <Button
                      icon={Check}
                      onClick={() => {
                        respondRequest(r.id, true)
                        toast('¡Match confirmado! Ya podéis hablar por el chat.')
                        navigate(`/mensajes/${r.id}`)
                      }}
                    >
                      Aceptar solicitud
                    </Button>
                    <Button
                      variant="danger"
                      icon={X}
                      onClick={() => {
                        respondRequest(r.id, false)
                        toast('Has rechazado la solicitud. La familia recibirá un aviso.', 'info')
                      }}
                    >
                      Rechazar
                    </Button>
                  </>
                ) : r.status === 'aceptada' ? (
                  <Button variant="outline" icon={MessageCircleMore} to={`/mensajes/${r.id}`}>Ir a la conversación</Button>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </Container>
  )
}
