import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
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
  X,
  type LucideIcon,
} from 'lucide-react'
import { Container } from '../components/Layout'
import { Avatar, BackLink, Button, DocStatusChip, EmptyState, ErrorSummary, IconBubble, InfoNote, LoginRequired, Modal } from '../components/ui'
import { CaregiverProfileView } from '../components/CaregiverProfileView'
import {
  AvailabilitySegment,
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
  const map = {
    ok: ['bg-ok-soft text-ok-ink', 'Completado', Check],
    review: ['bg-off-soft text-off-ink', 'En revisión', Clock],
    todo: ['bg-warn-soft text-warn-ink', 'Pendiente', CircleAlert],
  } as const
  const [cls, label, Icon] = map[s]
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold', cls)}>
      <Icon aria-hidden className="size-4" strokeWidth={2.5} />
      {label}
    </span>
  )
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
      <section className="card overflow-hidden">
        <div className="flex items-center gap-4 p-5 sm:p-7">
          <Avatar name={c.name} photo={c.photo} size={72} />
          <div className="min-w-0">
            <h1 className="text-3xl font-bold sm:text-4xl">Hola, {me.greetingName}</h1>
            <p className="mt-1 text-lg text-ink-soft">Aquí tienes tu perfil y toda la información de tu cuenta.</p>
          </div>
        </div>
        <div className={cx('flex flex-col gap-4 border-t px-5 py-5 sm:px-7 md:flex-row md:items-center', c.available ? 'border-ok-soft bg-ok-soft/60' : 'border-line bg-sunken')}>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">¿Estás disponible para nuevas familias?</h2>
            <p className="mt-1 text-ink-soft" aria-live="polite">
              {c.available ? 'Sí. Apareces en las búsquedas y las familias pueden enviarte solicitudes.' : 'No. Ahora no apareces en las búsquedas. Puedes volver a activarte cuando quieras.'}
            </p>
          </div>
          <AvailabilitySegment size="lg" value={c.available} onChange={(v) => setAvailability(c.id, v)} />
        </div>
      </section>

      {pending.length > 0 && (
        <Link to="/cuidadora/solicitudes" className="pressable mt-5 flex items-center gap-4 rounded-[20px] border-2 border-care-line bg-care-subtle p-4 hover:bg-care-soft sm:p-5">
          <IconBubble icon={Handshake} tone="rosa" />
          <div className="flex-1">
            <div className="text-lg font-semibold">
              Tienes {pending.length} {pending.length === 1 ? 'solicitud de contacto nueva' : 'solicitudes de contacto nuevas'}
            </div>
            <div className="text-ink-soft">Revisa qué necesita la familia y decide si quieres aceptarla.</div>
          </div>
          <ChevronRight aria-hidden className="size-6 text-care" strokeWidth={2.25} />
        </Link>
      )}

      <h2 className="mt-10 text-2xl font-bold">Tu perfil</h2>
      <p className="mt-1 text-ink-soft">Mantén tu información al día para recibir más oportunidades de trabajo.</p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {(Object.keys(SECTIONS) as SectionId[]).map((id) => {
          const s = SECTIONS[id]
          return (
            <li key={id}>
              <Link to={`/cuidadora/perfil/${id}`} className="card pressable group flex h-full flex-col gap-4 p-5 hover:shadow-card-hover">
                <div className="flex items-start gap-4">
                  <IconBubble icon={s.icon} size="lg" />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{s.title}</h3>
                    <p className="text-ink-soft">{s.subtitle}</p>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                  <StatusPill s={sectionStatus(id, c)} />
                  <span className="inline-flex items-center gap-1 font-semibold text-accent">
                    Ver y editar
                    <ChevronRight aria-hidden className="size-5 motion-safe:transition-[translate] motion-safe:duration-150 group-hover:translate-x-0.5" strokeWidth={2.25} />
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link to="/mensajes" className="card pressable flex items-center gap-4 p-5 hover:shadow-card-hover">
          <IconBubble icon={Mail} size="lg" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold">Mensajes</h2>
            <p className="text-ink-soft">
              {me.unreadMessages > 0 ? `${me.unreadMessages} ${me.unreadMessages === 1 ? 'mensaje sin leer' : 'mensajes sin leer'}` : 'Tus conversaciones con familias.'}
            </p>
          </div>
          <ChevronRight aria-hidden className="size-5 text-ink-soft" />
        </Link>
        <Link to="/cuidadora/perfil" className="card pressable flex items-center gap-4 p-5 hover:shadow-card-hover">
          <IconBubble icon={Eye} size="lg" tone="rosa" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold">Mi perfil público</h2>
            <p className="text-ink-soft">Así te ven las familias.</p>
          </div>
          <ChevronRight aria-hidden className="size-5 text-ink-soft" />
        </Link>
      </div>

      <section className="card mt-4 p-5 sm:p-6">
        <h2 className="flex items-center gap-3 text-xl font-semibold">
          <CalendarDays aria-hidden className="size-6 text-accent-icon" strokeWidth={2} />
          Tu actividad reciente
        </h2>
        <ol className="mt-4">
          {activity.map((a) => (
            <li key={a.id} className="relative flex gap-4 pb-4 ps-1 last:pb-0">
              <span aria-hidden className={cx('relative z-10 mt-1.5 size-3 shrink-0 rounded-full ring-4 ring-surface', a.highlight ? 'bg-accent' : 'bg-line')} />
              <span className="min-w-0">
                <span className={cx('block', a.highlight ? 'font-medium text-ink' : 'text-ink-soft')}>{a.text}</span>
                <span className="text-sm text-muted">{fmtWhen(a.at)}</span>
              </span>
            </li>
          ))}
        </ol>
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
          <div className="mb-4">
            <BackLink to="/cuidadora">Volver a mi panel</BackLink>
          </div>
          <InfoNote icon={Eye}>
            <strong>Así ven tu perfil las familias.</strong> Tu correo y tu teléfono no se muestran: solo se comparten cuando aceptas una solicitud.
          </InfoNote>
          <div className="mt-5">
            <CaregiverProfileView
              c={c}
              fullName
              actions={
                <>
                  <Button variant="outline" icon={Pencil} to="/cuidadora/perfil/datos">
                    Editar mis datos
                  </Button>
                  <Button variant="outline" icon={Pencil} to="/cuidadora/perfil/experiencia">
                    Editar experiencia
                  </Button>
                  <Button variant="outline" icon={Pencil} to="/cuidadora/perfil/preferencias">
                    Editar preferencias
                  </Button>
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
  const summaryRef = useRef<HTMLDivElement>(null)
  const set = (patch: Partial<CaregiverDraft>) => {
    setD((p) => ({ ...p, ...patch }))
    setErrors({})
  }
  const save = (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = sec.step ? validateStep(sec.step, d, true) : {}
    setErrors(e)
    if (Object.keys(e).length) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
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
      <div className="mb-5">
        <BackLink to="/cuidadora">Volver a mi panel</BackLink>
      </div>
      <StepHeader icon={sec.icon} title={sec.title} subtitle={sec.subtitle} />
      {id === 'documentacion' && (
        <div className="mb-7 space-y-3">
          <InfoNote icon={ShieldCheck}>
            La revisión de documentos es distinta del distintivo <strong>«Cuidadora de confianza»</strong>, que se concede a quienes ya han trabajado con familias a través de la plataforma y han sido valoradas positivamente.
          </InfoNote>
          <div className="card flex flex-wrap items-center gap-3 p-4">
            <span className="flex-1 font-semibold">Estado de tu documentación</span>
            <DocStatusChip status={c.docsStatus} />
          </div>
        </div>
      )}
      <form onSubmit={save} noValidate>
        {Object.keys(errors).length > 0 && (
          <div className="mb-6">
            <ErrorSummary ref={summaryRef} errors={errors} />
          </div>
        )}
        <sec.Comp d={d} set={set} errors={errors} editing />
        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
          <Button type="submit" size="lg" className="sm:flex-1" icon={Save}>
            Guardar cambios
          </Button>
          <Button variant="ghost" size="lg" to="/cuidadora">
            Cancelar
          </Button>
        </div>
      </form>
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
  const [rejecting, setRejecting] = useState<ContactRequest | null>(null)
  const rejectingFam = rejecting && state.families.find((f) => f.id === rejecting.familyId)
  const mine = state.requests.filter((r) => r.caregiverId === c.id && r.status !== 'cancelada')
  const list = mine.filter((r) => (tab === 'pendiente' ? r.status === 'pendiente' : r.status !== 'pendiente'))
  const pendingCount = mine.filter((r) => r.status === 'pendiente').length

  return (
    <Container className="max-w-4xl py-6 sm:py-8">
      <h1 className="text-3xl font-bold sm:text-4xl">Solicitudes de contacto</h1>
      <p className="mt-2 max-w-[60ch] text-lg text-ink-soft">Las familias te cuentan qué necesitan. Si aceptas, se confirma el match y se abre el chat privado.</p>
      <div role="group" aria-label="Mostrar solicitudes" className="mt-6 inline-grid grid-cols-2 gap-1 rounded-full bg-sunken p-1">
        {(
          [
            ['pendiente', `Nuevas (${pendingCount})`],
            ['resto', 'Respondidas'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={tab === k}
            onClick={() => setTab(k)}
            className={cx('min-h-12 rounded-full px-5 font-semibold transition-[background-color,color,box-shadow] duration-150', tab === k ? 'bg-surface text-ink shadow-card' : 'text-ink-soft hover:text-ink')}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-4">
        {list.length === 0 && (
          <div className="card">
            <EmptyState icon={Handshake} title={tab === 'pendiente' ? 'No tienes solicitudes nuevas' : 'Aún no has respondido solicitudes'}>
              {c.available ? 'Cuando una familia quiera contactar contigo, la verás aquí.' : 'Ahora mismo apareces como «No disponible». Actívate en tu panel para recibir nuevas solicitudes.'}
            </EmptyState>
          </div>
        )}
        {list.map((r) => {
          const fam = state.families.find((f) => f.id === r.familyId)!
          return (
            <article key={r.id} className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Avatar name={fam.name.replace('Familia ', '')} size={52} />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{fam.name}</h2>
                  <div className="text-sm text-muted">Recibida {fmtWhen(r.createdAt)}</div>
                </div>
                {r.status === 'aceptada' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-soft px-3 py-1 text-sm font-semibold text-ok-ink">
                    <Check aria-hidden className="size-4" strokeWidth={2.5} />
                    Match confirmado
                  </span>
                )}
                {r.status === 'rechazada' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-off-soft px-3 py-1 text-sm font-semibold text-off-ink">
                    <X aria-hidden className="size-4" strokeWidth={2.5} />
                    Rechazada
                  </span>
                )}
              </div>
              <blockquote className="mt-4 rounded-2xl bg-sunken p-4 leading-relaxed">«{r.need}»</blockquote>
              <ul className="mt-4 grid gap-2 text-ink-soft sm:grid-cols-2">
                <li className="flex items-center gap-2.5">
                  <User aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
                  {labelOf(PERSON_TYPES, r.personType)}
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
                  {r.zone}
                </li>
                <li className="flex items-center gap-2.5">
                  <CalendarDays aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
                  Inicio: {startText(r)}
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
                  {labelOf(JORNADAS, r.jornada)}
                </li>
              </ul>
              {r.status !== 'rechazada' && (
                <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-5">
                  {r.status === 'pendiente' ? (
                    <>
                      <Button
                        icon={Check}
                        onClick={() => {
                          respondRequest(r.id, true)
                          toast('Match confirmado. Ya podéis hablar por el chat.')
                          navigate(`/mensajes/${r.id}`)
                        }}
                      >
                        Aceptar solicitud
                      </Button>
                      <Button
                        variant="danger"
                        icon={X}
                        onClick={() => setRejecting(r)}
                      >
                        Rechazar
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" icon={MessageCircleMore} to={`/mensajes/${r.id}`}>
                      Ir a la conversación
                    </Button>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>
      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title={`¿Rechazar la solicitud de ${rejectingFam?.name ?? 'la familia'}?`}>
        <p className="text-ink-soft">La familia recibirá un aviso de que no estás disponible. No se puede deshacer.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="danger"
            icon={X}
            onClick={() => {
              if (rejecting) respondRequest(rejecting.id, false)
              setRejecting(null)
              toast('Has rechazado la solicitud. La familia recibirá un aviso.', 'info')
            }}
          >
            Rechazar solicitud
          </Button>
          <Button variant="ghost" onClick={() => setRejecting(null)}>
            Mantener solicitud
          </Button>
        </div>
      </Modal>
    </Container>
  )
}
