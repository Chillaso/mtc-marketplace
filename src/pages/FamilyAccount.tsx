import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock,
  FlaskConical,
  Handshake,
  Heart,
  House,
  Mail,
  MapPin,
  MessageCircleMore,
  Phone,
  Save,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  User,
  UserRound,
  X,
} from 'lucide-react'
import { Container } from '../components/Layout'
import { Avatar, Button, CaregiverBadges, Chip, EmptyState, Field, IconBubble, IconInput, InfoNote, LoginRequired, Modal, PageTitle, Select, Stars } from '../components/ui'
import { IdealFilters } from './Search'
import { useMe, useStore } from '../store'
import type { ContactRequest, Family, SearchFilters } from '../data/types'
import { CARE_TYPES, JORNADAS, PERSON_TYPES, START_OPTIONS, ZONES, labelOf } from '../data/catalog'
import { cx, fmtDate, fmtWhen, shortName } from '../lib/format'

const NAV = [
  { to: '/familia', label: 'Mi cuenta', icon: House, end: true },
  { to: '/familia/favoritas', label: 'Mis favoritas', icon: Heart },
  { to: '/familia/solicitudes', label: 'Mis solicitudes', icon: MessageCircleMore },
  { to: '/mensajes', label: 'Mensajes', icon: Mail },
  { to: '/familia/preferencias', label: 'Mis preferencias', icon: SlidersHorizontal },
  { to: '/familia/datos', label: 'Mis datos', icon: User },
  { to: '/familia/ayuda', label: 'Ayuda', icon: CircleHelp },
]

export function FamilyLayout() {
  const me = useMe()
  if (!me.family) return <LoginRequired next="/familia" role="family" />
  return (
    <Container className="grid grid-cols-[minmax(0,1fr)] gap-6 py-6 sm:py-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
      <nav aria-label="Cuenta de familia" className="min-w-0">
        <ul className="flex flex-wrap gap-2 lg:sticky lg:top-28 lg:flex-col lg:gap-1">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cx(
                    'flex min-h-11 items-center gap-2.5 rounded-full px-4 font-medium transition-[background-color,color] duration-150 lg:min-h-12 lg:gap-3 lg:rounded-2xl',
                    isActive ? 'bg-accent text-white lg:bg-accent-soft lg:font-semibold lg:text-accent-strong' : 'bg-surface text-ink shadow-card hover:bg-accent-subtle lg:bg-transparent lg:shadow-none',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <n.icon aria-hidden className={cx('size-5 lg:size-6', isActive ? 'lg:text-accent' : 'text-accent-icon')} strokeWidth={2} />
                    {n.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">
        <Outlet />
      </div>
    </Container>
  )
}

const useFamily = () => useMe().family as Family

/* ------------------------------ Elementos comunes ------------------------------ */

export function RequestStatusChip({ status }: { status: ContactRequest['status'] }) {
  const map = {
    aceptada: ['bg-ok-soft text-ok-ink', 'En conversación', MessageCircleMore],
    pendiente: ['bg-warn-soft text-warn-ink', 'Pendiente de respuesta', Clock],
    rechazada: ['bg-off-soft text-off-ink', 'No disponible', X],
    cancelada: ['bg-off-soft text-off-ink', 'Cancelada', X],
  } as const
  const [cls, label, Icon] = map[status]
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm leading-tight font-semibold', cls)}>
      <Icon aria-hidden className="size-4 shrink-0" strokeWidth={2.5} />
      {label}
    </span>
  )
}

function Panel({ icon: Icon, title, action, children }: { icon: typeof Heart; title: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <header className="flex items-center gap-3 border-b border-line px-5 py-4">
        <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent">
          <Icon className="size-5" strokeWidth={2} />
        </span>
        <h2 className="flex-1 text-xl font-semibold">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  )
}

const seeAll = 'inline-flex min-h-11 items-center gap-1 rounded-full px-3 font-semibold text-accent hover:bg-accent-subtle'

function FavoriteItem({ id }: { id: string }) {
  const { state, toggleFavorite } = useStore()
  const fam = useFamily()
  const c = state.caregivers.find((x) => x.id === id)
  if (!c) return null
  return (
    <li className="flex flex-wrap items-center gap-4 px-5 py-4">
      <Avatar name={c.name} photo={c.photo} size={64} />
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold">{shortName(c.name)}</h3>
        <CaregiverBadges c={c} size="sm" />
        <div className="mt-1">
          <Stars rating={c.rating} reviews={c.reviews} size="sm" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleFavorite(fam.id, c.id)}
          aria-label={`Quitar a ${shortName(c.name)} de favoritas`}
          className="pressable flex size-12 items-center justify-center rounded-full border-2 border-care-line bg-care-subtle hover:bg-care-soft"
        >
          <Heart aria-hidden className="size-6 fill-care-icon text-care-icon" strokeWidth={2} />
        </button>
        <Button variant="outline" size="sm" to={`/cuidadoras/${c.id}`} iconRight={ChevronRight}>
          Ver perfil<span className="sr-only"> de {shortName(c.name)}</span>
        </Button>
      </div>
    </li>
  )
}

function RequestItem({ r, onOpen }: { r: ContactRequest; onOpen: () => void }) {
  const { state } = useStore()
  const c = state.caregivers.find((x) => x.id === r.caregiverId)!
  return (
    <li>
      <button type="button" onClick={onOpen} aria-haspopup="dialog" className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 text-start hover:bg-accent-subtle">
        <Avatar name={c.name} photo={c.photo} size={56} />
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold">{shortName(c.name)}</span>
          <span className="text-sm text-ink-soft">Enviada el {fmtDate(r.createdAt)}</span>
        </span>
        <RequestStatusChip status={r.status} />
        <ChevronRight aria-hidden className="size-5 text-ink-soft max-sm:hidden" />
      </button>
    </li>
  )
}

function RequestModal({ r, onClose }: { r: ContactRequest | null; onClose: () => void }) {
  const { state, cancelRequest, respondRequest, toast } = useStore()
  const navigate = useNavigate()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)
  const touched = useRef(false)
  // Al abrir o cerrar la confirmación, el foco va a la opción segura o vuelve al botón que la abrió.
  useEffect(() => {
    if (!touched.current) return
    actionsRef.current?.querySelector<HTMLElement>(confirmCancel ? '[data-safe]' : '[data-cancel]')?.focus()
  }, [confirmCancel])
  const toggleConfirm = (v: boolean) => {
    touched.current = true
    setConfirmCancel(v)
  }
  if (!r) return null
  const c = state.caregivers.find((x) => x.id === r.caregiverId)!
  const isDemoCaregiver = r.caregiverId === 'ana-g' || r.caregiverId.startsWith('cg-new')
  return (
    <Modal open onClose={onClose} title={`Solicitud a ${shortName(c.name)}`}>
      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={c.name} photo={c.photo} size={56} />
        <div className="flex-1">
          <div className="font-semibold">{shortName(c.name)}</div>
          <div className="text-sm text-muted">Enviada {fmtWhen(r.createdAt)}</div>
        </div>
        <RequestStatusChip status={r.status} />
      </div>
      <blockquote className="mt-4 rounded-2xl bg-sunken p-4">«{r.need}»</blockquote>
      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-sm text-muted">Persona</dt>
          <dd className="font-medium">{labelOf(PERSON_TYPES, r.personType)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Zona</dt>
          <dd className="font-medium">{r.zone}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Inicio</dt>
          <dd className="font-medium">{r.start === 'fecha' && r.startDate ? fmtDate(r.startDate) : labelOf(START_OPTIONS, r.start)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Jornada</dt>
          <dd className="font-medium">{labelOf(JORNADAS, r.jornada)}</dd>
        </div>
      </dl>
      <div ref={actionsRef} className="mt-6 flex flex-col gap-3">
        {r.status === 'aceptada' && (
          <Button icon={MessageCircleMore} onClick={() => navigate(`/mensajes/${r.id}`)}>
            Ir al chat
          </Button>
        )}
        {r.status === 'pendiente' && !confirmCancel && (
          <>
            <InfoNote>Cuando {shortName(c.name)} acepte tu solicitud se confirmará el match y se abrirá el chat privado.</InfoNote>
            {isDemoCaregiver ? (
              <InfoNote icon={FlaskConical} tone="rosa">
                Para responder, entra como cuidadora desde el botón «Demo» y acepta la solicitud.
              </InfoNote>
            ) : (
              <Button
                variant="soft"
                icon={FlaskConical}
                onClick={() => {
                  respondRequest(r.id, true)
                  toast(`${shortName(c.name)} ha aceptado tu solicitud. Match confirmado.`)
                  navigate(`/mensajes/${r.id}`)
                }}
              >
                Simular que la cuidadora acepta (demo)
              </Button>
            )}
            <Button variant="danger" icon={Trash2} data-cancel onClick={() => toggleConfirm(true)}>
              Cancelar solicitud
            </Button>
          </>
        )}
        {r.status === 'pendiente' && confirmCancel && (
          <div role="group" aria-labelledby="cancel-q" className="rounded-2xl border-2 border-care bg-care-subtle p-4">
            <p id="cancel-q" className="font-semibold">¿Cancelar la solicitud a {shortName(c.name)}?</p>
            <p className="mt-1 text-ink-soft">Dejará de verla. Si cambias de opinión, tendrás que enviar una nueva.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => {
                  cancelRequest(r.id)
                  toast('Solicitud cancelada.', 'info')
                  onClose()
                }}
              >
                Sí, cancelar solicitud
              </Button>
              <Button variant="ghost" data-safe onClick={() => toggleConfirm(false)}>
                No, mantenerla
              </Button>
            </div>
          </div>
        )}
        {r.status === 'rechazada' && (
          <Button variant="outline" icon={Search} to="/buscar/resultados">
            Buscar otras cuidadoras
          </Button>
        )}
      </div>
    </Modal>
  )
}

/* ------------------------------ Resumen ------------------------------ */

export function FamilyHome() {
  const fam = useFamily()
  const me = useMe()
  const { state } = useStore()
  const [open, setOpen] = useState<ContactRequest | null>(null)
  const requests = me.myRequests.filter((r) => r.status !== 'cancelada')
  const integral = state.integral.filter((i) => i.familyId === fam.id)
  const p = fam.prefs
  const prefSummary = [p.careType && labelOf(CARE_TYPES, p.careType), p.zone, p.jornada && labelOf(JORNADAS, p.jornada)].filter(Boolean).join(' · ')

  return (
    <div className="space-y-6">
      <PageTitle title="Mi cuenta" subtitle={`Hola, ${me.greetingName}. Desde aquí gestionas tus búsquedas y tus contactos.`} />
      <ul className="grid gap-4 xl:grid-cols-3">
        {[
          { to: '/buscar', icon: Search, t: 'Buscar cuidadora', d: 'Encuentra a la persona que mejor se adapte', tone: 'brand' as const },
          { to: '/familia/favoritas', icon: Heart, t: 'Mis favoritas', d: 'Cuidadoras que has guardado', tone: 'rosa' as const },
          { to: '/familia/solicitudes', icon: MessageCircleMore, t: 'Mis solicitudes', d: 'Contactos que has enviado', tone: 'brand' as const },
        ].map((x) => (
          <li key={x.to}>
            <Link to={x.to} className="card pressable flex h-full items-center gap-4 p-5 hover:shadow-card-hover">
              <IconBubble icon={x.icon} size="lg" tone={x.tone} />
              <span className="flex-1">
                <span className="block text-xl font-semibold">{x.t}</span>
                <span className="text-ink-soft">{x.d}</span>
              </span>
              <ChevronRight aria-hidden className="size-6 text-ink-soft" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Panel
          icon={Heart}
          title={`Mis favoritas (${fam.favorites.length})`}
          action={
            <Link to="/familia/favoritas" className={seeAll}>
              Ver todas<span className="sr-only"> las favoritas</span>
              <ChevronRight aria-hidden className="size-4" strokeWidth={2.5} />
            </Link>
          }
        >
          {fam.favorites.length ? (
            <ul className="divide-y divide-line">
              {fam.favorites.slice(0, 3).map((id) => (
                <FavoriteItem key={id} id={id} />
              ))}
            </ul>
          ) : (
            <EmptyState icon={Heart} title="Aún no tienes favoritas" action={<Button to="/buscar" icon={Search}>Buscar cuidadoras</Button>}>
              Pulsa el corazón en cualquier perfil para guardarlo aquí.
            </EmptyState>
          )}
        </Panel>
        <div className="space-y-5">
          <Panel
            icon={MessageCircleMore}
            title={`Mis solicitudes (${requests.length})`}
            action={
              <Link to="/familia/solicitudes" className={seeAll}>
                Ver todas<span className="sr-only"> las solicitudes</span>
                <ChevronRight aria-hidden className="size-4" strokeWidth={2.5} />
              </Link>
            }
          >
            {requests.length ? (
              <ul className="divide-y divide-line">
                {requests.slice(0, 3).map((r) => (
                  <RequestItem key={r.id} r={r} onOpen={() => setOpen(r)} />
                ))}
              </ul>
            ) : (
              <EmptyState icon={MessageCircleMore} title="Sin solicitudes todavía">
                Cuando solicites contacto con una cuidadora aparecerá aquí.
              </EmptyState>
            )}
          </Panel>
          <section className="card flex flex-wrap items-center gap-4 p-5">
            <IconBubble icon={Settings} />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold">Mis preferencias de búsqueda</h2>
              <p className="text-ink-soft">{prefSummary || 'Cuidados, disponibilidad y zona'}</p>
            </div>
            <Button variant="outline" to="/familia/preferencias" iconRight={ChevronRight}>
              Cambiar preferencias
            </Button>
          </section>
          {integral.length > 0 && (
            <section className="card flex items-center gap-4 bg-care-subtle p-5">
              <IconBubble icon={Handshake} tone="rosa" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold">Servicio integral</h2>
                <p className="text-ink-soft">Solicitud recibida el {fmtDate(integral[0].createdAt)}. El equipo se pondrá en contacto contigo.</p>
              </div>
            </section>
          )}
        </div>
      </div>
      <RequestModal key={open?.id} r={open} onClose={() => setOpen(null)} />
    </div>
  )
}

export function FamilyFavorites() {
  const fam = useFamily()
  return (
    <div>
      <PageTitle title="Mis favoritas" subtitle="Cuidadoras que has guardado para consultarlas después. Es privado: ellas no reciben ningún aviso." />
      <div className="card mt-6">
        {fam.favorites.length ? (
          <ul className="divide-y divide-line">
            {fam.favorites.map((id) => (
              <FavoriteItem key={id} id={id} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Heart}
            title="Aún no tienes favoritas"
            action={
              <Button to="/buscar" icon={Search}>
                Buscar cuidadoras
              </Button>
            }
          >
            Pulsa el corazón en cualquier perfil para guardarlo aquí.
          </EmptyState>
        )}
      </div>
    </div>
  )
}

export function FamilyRequests() {
  const me = useMe()
  const [open, setOpen] = useState<ContactRequest | null>(null)
  const [show, setShow] = useState<'todas' | 'pendiente' | 'aceptada'>('todas')
  const all = me.myRequests.filter((r) => r.status !== 'cancelada')
  const list = all.filter((r) => show === 'todas' || r.status === show)
  return (
    <div>
      <PageTitle title="Mis solicitudes" subtitle="Cuando una cuidadora acepta tu solicitud se confirma el match y se habilita el chat." />
      <div role="group" aria-label="Filtrar solicitudes" className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ['todas', `Todas (${all.length})`],
            ['pendiente', 'Pendientes'],
            ['aceptada', 'En conversación'],
          ] as const
        ).map(([k, l]) => (
          <Chip key={k} active={show === k} onClick={() => setShow(k)}>
            {l}
          </Chip>
        ))}
      </div>
      <div className="card mt-5">
        {list.length ? (
          <ul className="divide-y divide-line">
            {list.map((r) => (
              <RequestItem key={r.id} r={r} onOpen={() => setOpen(r)} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={MessageCircleMore}
            title="No hay solicitudes en esta lista"
            action={
              <Button to="/buscar" icon={Search}>
                Buscar cuidadoras
              </Button>
            }
          />
        )}
      </div>
      <RequestModal key={open?.id} r={open ? (me.myRequests.find((x) => x.id === open.id) ?? null) : null} onClose={() => setOpen(null)} />
    </div>
  )
}

export function FamilyPreferences() {
  const fam = useFamily()
  const { updateFamily, setLastSearch, toast } = useStore()
  const navigate = useNavigate()
  const [f, setF] = useState<SearchFilters>(fam.prefs)
  const set = (p: Partial<SearchFilters>) => setF((x) => ({ ...x, ...p }))
  return (
    <div>
      <PageTitle title="Mis preferencias" subtitle="Se aplicarán por defecto cuando busques cuidadora." />
      <div className="card mt-6 space-y-7 p-5 sm:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Tipo de cuidado principal">
            <Select value={f.careType} onChange={(careType) => set({ careType })} options={CARE_TYPES} placeholder="Cualquier tipo" />
          </Field>
          <Field label="Mostrar">
            <Select value={f.onlyTrusted ? 't' : 'a'} onChange={(v) => set({ onlyTrusted: v === 't' })} options={[{ id: 'a', label: 'Todas las cuidadoras' }, { id: 't', label: 'Solo cuidadoras de confianza' }]} />
          </Field>
        </div>
        <IdealFilters f={f} set={set} />
        <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
          <Button
            icon={Save}
            onClick={() => {
              updateFamily(fam.id, { prefs: f })
              toast('Preferencias guardadas.')
            }}
          >
            Guardar preferencias
          </Button>
          <Button
            variant="outline"
            icon={Search}
            onClick={() => {
              updateFamily(fam.id, { prefs: f })
              setLastSearch(f)
              navigate('/buscar/resultados')
            }}
          >
            Guardar y buscar
          </Button>
        </div>
      </div>
    </div>
  )
}

export function FamilyData() {
  const fam = useFamily()
  const { updateFamily, toast } = useStore()
  const [d, setD] = useState({ contactName: fam.contactName, name: fam.name, email: fam.email, phone: fam.phone, zone: fam.zone, personType: fam.personType })
  const set = (k: keyof typeof d) => (v: string) => setD({ ...d, [k]: v })
  return (
    <div>
      <PageTitle title="Mis datos" subtitle="Tus datos de contacto solo se comparten con una cuidadora cuando hacéis match." />
      <form
        className="card mt-6 grid gap-5 p-5 sm:p-7 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          updateFamily(fam.id, d)
          toast('Datos actualizados.')
        }}
      >
        <Field label="Nombre y apellidos">
          <IconInput icon={UserRound} autoComplete="name" value={d.contactName} onChange={(e) => set('contactName')(e.target.value)} />
        </Field>
        <Field label="Nombre visible" hint="Así te ven las cuidadoras.">
          <IconInput icon={House} value={d.name} onChange={(e) => set('name')(e.target.value)} />
        </Field>
        <Field label="Correo electrónico">
          <IconInput icon={Mail} type="email" inputMode="email" autoComplete="email" value={d.email} onChange={(e) => set('email')(e.target.value)} />
        </Field>
        <Field label="Teléfono">
          <IconInput icon={Phone} type="tel" inputMode="tel" autoComplete="tel" value={d.phone} onChange={(e) => set('phone')(e.target.value)} />
        </Field>
        <Field label="Zona">
          <Select value={d.zone} onChange={set('zone')} options={ZONES} />
        </Field>
        <Field label="¿A quién hay que cuidar?">
          <Select value={d.personType} onChange={set('personType')} options={PERSON_TYPES} />
        </Field>
        <div className="border-t border-line pt-6 md:col-span-2">
          <Button type="submit" icon={Save}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  )
}

export function FamilyHelp() {
  const qa = [
    ['¿Qué pasa cuando guardo una favorita?', 'Nada más: es una lista privada para consultarla después. La cuidadora no recibe aviso y no se abre ningún chat.'],
    ['¿Cuándo puedo hablar con una cuidadora?', 'Cuando le envías una solicitud de contacto y ella la acepta. En ese momento se confirma el match y se habilita el chat privado.'],
    ['¿Qué significa «Cuidadora de confianza»?', 'Que ya ha trabajado con familias a través de la plataforma y su trabajo ha sido valorado positivamente por el equipo. No es lo mismo que tener la documentación revisada.'],
    ['¿Podéis buscar la cuidadora por mí?', 'Sí. Con el servicio integral, el equipo de María te Cuida se encarga de la búsqueda y la selección.'],
  ]
  return (
    <div>
      <PageTitle title="Ayuda" subtitle="Respuestas a las dudas más habituales." />
      <div className="mt-6 space-y-3">
        {qa.map(([q, a]) => (
          <details key={q} className="card group overflow-hidden">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-lg font-semibold hover:bg-accent-subtle [&::-webkit-details-marker]:hidden">
              {q}
              <ChevronDown aria-hidden className="size-6 shrink-0 text-accent motion-safe:transition-[rotate] motion-safe:duration-200 group-open:rotate-180" strokeWidth={2.25} />
            </summary>
            <p className="max-w-[65ch] px-5 pb-5 text-ink-soft">{a}</p>
          </details>
        ))}
      </div>
      <section aria-labelledby="contacto" className="card mt-6 p-5 sm:p-6">
        <h2 id="contacto" className="text-xl font-semibold">
          ¿Prefieres hablar con nosotros?
        </h2>
        <ul className="mt-4 grid gap-3 text-ink-soft sm:grid-cols-2">
          <li className="flex items-center gap-3">
            <Phone aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
            956 000 000
          </li>
          <li className="flex items-center gap-3">
            <Mail aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
            hola@mariatecuida.es
          </li>
          <li className="flex items-center gap-3">
            <MapPin aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
            Provincia de Cádiz
          </li>
          <li className="flex items-center gap-3">
            <Clock aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
            Lunes a viernes, de 9:00 a 19:00
          </li>
        </ul>
      </section>
    </div>
  )
}
