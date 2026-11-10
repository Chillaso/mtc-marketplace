import { useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  CircleHelp,
  Clock,
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
  User,
  UserRound,
  FlaskConical,
  Trash2,
} from 'lucide-react'
import { Container } from '../components/Layout'
import { Avatar, Button, CaregiverBadges, EmptyState, Field, IconInput, InfoNote, LoginRequired, Modal, Select, Stars } from '../components/ui'
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
]

export function FamilyLayout() {
  const me = useMe()
  if (!me.family) return <LoginRequired next="/familia" role="family" />
  return (
    <Container className="grid grid-cols-[minmax(0,1fr)] gap-6 py-6 sm:py-8 lg:grid-cols-[250px_minmax(0,1fr)]">
      <nav aria-label="Cuenta de familia" className="min-w-0 lg:border-r lg:border-line lg:pr-5">
        <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:px-0">
          {NAV.map((n) => (
            <li key={n.to} className="shrink-0">
              <NavLink
                to={n.to}
                end={n.end}
                className={({ isActive }) => cx('flex items-center gap-3 rounded-2xl px-4 py-3 text-[17px] font-medium transition', isActive ? 'bg-brand-100/70 font-semibold text-ink' : 'text-ink hover:bg-brand-50')}
              >
                <n.icon className="size-6 text-brand-700" strokeWidth={1.8} />
                {n.label}
              </NavLink>
            </li>
          ))}
          <li className="hidden border-t border-line pt-2 lg:mt-3 lg:block">
            <NavLink to="/familia/ayuda" className={({ isActive }) => cx('flex items-center gap-3 rounded-2xl px-4 py-3 text-[17px] font-medium', isActive ? 'bg-brand-100/70' : 'hover:bg-brand-50')}>
              <CircleHelp className="size-6 text-brand-700" strokeWidth={1.8} />
              Ayuda
            </NavLink>
          </li>
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
    aceptada: ['bg-brand-100 text-brand-900', 'En conversación'],
    pendiente: ['bg-amber-soft text-amber-ink', 'Pendiente de respuesta'],
    rechazada: ['bg-slate-100 text-slate-600', 'No disponible'],
    cancelada: ['bg-slate-100 text-slate-500', 'Cancelada'],
  } as const
  const [cls, label] = map[status]
  return <span className={cx('inline-flex items-center rounded-full px-3 py-1 text-center text-sm leading-tight font-semibold', cls)}>{label}</span>
}

function Panel({ icon: Icon, title, action, children }: { icon: typeof Heart; title: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <header className="flex items-center gap-3 bg-gradient-to-r from-brand-50 to-white px-5 py-4">
        <Icon className="size-7 text-brand-700" strokeWidth={1.7} />
        <h2 className="flex-1 text-lg font-semibold">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  )
}

function FavoriteItem({ id }: { id: string }) {
  const { state, toggleFavorite } = useStore()
  const fam = useFamily()
  const c = state.caregivers.find((x) => x.id === id)
  if (!c) return null
  return (
    <li className="flex items-center gap-4 px-5 py-4">
      <Avatar name={c.name} photo={c.photo} size={72} />
      <div className="min-w-0 flex-1">
        <div className="text-lg font-semibold">{shortName(c.name)}</div>
        <CaregiverBadges c={c} size="sm" />
        <div className="mt-1"><Stars rating={c.rating} reviews={c.reviews} size="sm" /></div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button type="button" onClick={() => toggleFavorite(fam.id, c.id)} aria-label={`Quitar a ${shortName(c.name)} de favoritas`} className="rounded-full p-1.5 hover:bg-rosa-50">
          <Heart className="size-7 fill-rosa-500 text-rosa-500" />
        </button>
        <Button variant="outline" size="sm" to={`/cuidadoras/${c.id}`} iconRight={ChevronRight}>Ver perfil</Button>
      </div>
    </li>
  )
}

function RequestItem({ r, onOpen }: { r: ContactRequest; onOpen: () => void }) {
  const { state } = useStore()
  const c = state.caregivers.find((x) => x.id === r.caregiverId)!
  return (
    <li>
      <button type="button" onClick={onOpen} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-brand-50/50">
        <Avatar name={c.name} photo={c.photo} size={60} />
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold">{shortName(c.name)}</div>
          <div className="text-sm text-ink-soft">Solicitud enviada: {fmtDate(r.createdAt)}</div>
        </div>
        <RequestStatusChip status={r.status} />
        <ChevronRight className="size-5 text-ink" />
      </button>
    </li>
  )
}

function RequestModal({ r, onClose }: { r: ContactRequest | null; onClose: () => void }) {
  const { state, cancelRequest, respondRequest, toast } = useStore()
  const navigate = useNavigate()
  if (!r) return null
  const c = state.caregivers.find((x) => x.id === r.caregiverId)!
  const isDemoCaregiver = r.caregiverId === 'ana-g' || r.caregiverId.startsWith('cg-new')
  return (
    <Modal open onClose={onClose} title={`Solicitud a ${shortName(c.name)}`}>
      <div className="flex items-center gap-3">
        <Avatar name={c.name} photo={c.photo} size={56} />
        <div className="flex-1">
          <div className="font-semibold">{shortName(c.name)}</div>
          <div className="text-sm text-muted">Enviada {fmtWhen(r.createdAt)}</div>
        </div>
        <RequestStatusChip status={r.status} />
      </div>
      <p className="mt-4 rounded-2xl bg-brand-50 p-4">“{r.need}”</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-[15px]">
        <div><dt className="text-muted">Persona</dt><dd className="font-medium">{labelOf(PERSON_TYPES, r.personType)}</dd></div>
        <div><dt className="text-muted">Zona</dt><dd className="font-medium">{r.zone}</dd></div>
        <div><dt className="text-muted">Inicio</dt><dd className="font-medium">{r.start === 'fecha' && r.startDate ? fmtDate(r.startDate) : labelOf(START_OPTIONS, r.start)}</dd></div>
        <div><dt className="text-muted">Jornada</dt><dd className="font-medium">{labelOf(JORNADAS, r.jornada)}</dd></div>
      </dl>
      <div className="mt-6 flex flex-col gap-3">
        {r.status === 'aceptada' && <Button icon={MessageCircleMore} onClick={() => navigate(`/mensajes/${r.id}`)}>Ir al chat</Button>}
        {r.status === 'pendiente' && (
          <>
            <InfoNote>Cuando {shortName(c.name)} acepte tu solicitud se confirmará el match y se abrirá el chat privado.</InfoNote>
            {isDemoCaregiver ? (
              <InfoNote icon={FlaskConical} tone="rosa">Para responder, entra como cuidadora desde el botón «Demo» y acepta la solicitud.</InfoNote>
            ) : (
              <Button
                variant="soft"
                icon={FlaskConical}
                onClick={() => {
                  respondRequest(r.id, true)
                  toast(`${shortName(c.name)} ha aceptado tu solicitud. ¡Match confirmado!`)
                  navigate(`/mensajes/${r.id}`)
                }}
              >
                Simular que la cuidadora acepta (demo)
              </Button>
            )}
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => {
                cancelRequest(r.id)
                toast('Solicitud cancelada.', 'info')
                onClose()
              }}
            >
              Cancelar solicitud
            </Button>
          </>
        )}
        {r.status === 'rechazada' && (
          <Button variant="outline" icon={Search} to="/buscar/resultados">Buscar otras cuidadoras</Button>
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
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-brand-50 to-brand-100/60 px-1 py-2">
        <h1 className="text-4xl font-bold sm:text-5xl">Mi cuenta</h1>
        <p className="mt-1 text-lg text-ink-soft">Hola, {me.greetingName}. Gestiona tus búsquedas y contactos.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {[
          { to: '/buscar', icon: Search, t: 'Buscar cuidadora', d: 'Encuentra la persona que mejor se adapte' },
          { to: '/familia/favoritas', icon: Heart, t: 'Mis favoritas', d: 'Cuidadoras que has guardado' },
          { to: '/familia/solicitudes', icon: MessageCircleMore, t: 'Mis solicitudes', d: 'Contactos y mensajes enviados' },
        ].map((x) => (
          <Link key={x.to} to={x.to} className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5 transition hover:shadow-pop">
            <x.icon className="size-11 shrink-0 text-brand-600" strokeWidth={1.6} />
            <span className="flex-1">
              <span className="block text-xl font-semibold">{x.t}</span>
              <span className="text-ink-soft">{x.d}</span>
            </span>
            <ChevronRight className="size-6" />
          </Link>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel icon={Heart} title={`Mis cuidadoras favoritas (${fam.favorites.length})`} action={<Link to="/familia/favoritas" className="text-sm font-semibold text-brand-800">Ver todas ›</Link>}>
          {fam.favorites.length ? (
            <ul className="divide-y divide-line">{fam.favorites.slice(0, 3).map((id) => <FavoriteItem key={id} id={id} />)}</ul>
          ) : (
            <EmptyState icon={Heart} title="Aún no tienes favoritas">Pulsa el corazón en cualquier perfil para guardarlo aquí.</EmptyState>
          )}
        </Panel>
        <div className="space-y-5">
          <Panel icon={MessageCircleMore} title={`Mis solicitudes de contacto (${requests.length})`} action={<Link to="/familia/solicitudes" className="text-sm font-semibold text-brand-800">Ver todas ›</Link>}>
            {requests.length ? (
              <ul className="divide-y divide-line">{requests.slice(0, 3).map((r) => <RequestItem key={r.id} r={r} onOpen={() => setOpen(r)} />)}</ul>
            ) : (
              <EmptyState icon={MessageCircleMore} title="Sin solicitudes todavía">Cuando solicites contacto con una cuidadora aparecerá aquí.</EmptyState>
            )}
          </Panel>
          <section className="card flex flex-wrap items-center gap-4 p-5">
            <Settings className="size-10 text-brand-600" strokeWidth={1.6} />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Mis preferencias de búsqueda</h2>
              <p className="text-ink-soft">{prefSummary || 'Cuidados, disponibilidad y zona'}</p>
            </div>
            <Button variant="outline" to="/familia/preferencias" iconRight={ChevronRight}>Modificar</Button>
          </section>
          {integral.length > 0 && (
            <section className="card flex items-center gap-4 p-5">
              <Handshake className="size-10 text-brand-600" strokeWidth={1.6} />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Servicio integral</h2>
                <p className="text-ink-soft">Solicitud recibida el {fmtDate(integral[0].createdAt)}. El equipo se pondrá en contacto contigo.</p>
              </div>
            </section>
          )}
        </div>
      </div>
      <RequestModal r={open} onClose={() => setOpen(null)} />
    </div>
  )
}

export function FamilyFavorites() {
  const fam = useFamily()
  return (
    <div>
      <h1 className="text-4xl font-bold">Mis favoritas</h1>
      <p className="mt-1 text-lg text-ink-soft">Cuidadoras que has guardado para consultarlas después. Es privado: ellas no reciben ningún aviso.</p>
      <div className="card mt-6">
        {fam.favorites.length ? (
          <ul className="divide-y divide-line">{fam.favorites.map((id) => <FavoriteItem key={id} id={id} />)}</ul>
        ) : (
          <EmptyState icon={Heart} title="Aún no tienes favoritas" action={<Button to="/buscar" icon={Search}>Buscar cuidadoras</Button>}>
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
      <h1 className="text-4xl font-bold">Mis solicitudes</h1>
      <p className="mt-1 text-lg text-ink-soft">Cuando una cuidadora acepta tu solicitud se confirma el match y se habilita el chat.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {(
          [
            ['todas', `Todas (${all.length})`],
            ['pendiente', 'Pendientes'],
            ['aceptada', 'En conversación'],
          ] as const
        ).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setShow(k)} className={cx('rounded-full px-4 py-2 font-semibold', show === k ? 'bg-brand-700 text-white' : 'bg-brand-50 text-ink hover:bg-brand-100')}>
            {l}
          </button>
        ))}
      </div>
      <div className="card mt-5">
        {list.length ? (
          <ul className="divide-y divide-line">{list.map((r) => <RequestItem key={r.id} r={r} onOpen={() => setOpen(r)} />)}</ul>
        ) : (
          <EmptyState icon={MessageCircleMore} title="No hay solicitudes" action={<Button to="/buscar" icon={Search}>Buscar cuidadoras</Button>} />
        )}
      </div>
      <RequestModal r={open ? me.myRequests.find((x) => x.id === open.id) ?? null : null} onClose={() => setOpen(null)} />
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
      <h1 className="text-4xl font-bold">Mis preferencias</h1>
      <p className="mt-1 text-lg text-ink-soft">Se aplicarán por defecto cuando busques cuidadora.</p>
      <div className="card mt-6 space-y-6 p-5 sm:p-7">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tipo de cuidado principal">
            <Select value={f.careType} onChange={(careType) => set({ careType })} options={CARE_TYPES} placeholder="Selecciona una opción" />
          </Field>
          <Field label="Mostrar">
            <Select value={f.onlyTrusted ? 't' : 'a'} onChange={(v) => set({ onlyTrusted: v === 't' })} options={[{ id: 'a', label: 'Todas las cuidadoras' }, { id: 't', label: 'Solo cuidadoras de confianza' }]} />
          </Field>
        </div>
        <IdealFilters f={f} set={set} />
        <div className="flex flex-wrap gap-3 border-t border-line pt-5">
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
      <h1 className="text-4xl font-bold">Mis datos</h1>
      <p className="mt-1 text-lg text-ink-soft">Tus datos de contacto solo se comparten con una cuidadora cuando hacéis match.</p>
      <div className="card mt-6 grid gap-4 p-5 sm:p-7 md:grid-cols-2">
        <Field label="Nombre y apellidos"><IconInput icon={UserRound} value={d.contactName} onChange={(e) => set('contactName')(e.target.value)} /></Field>
        <Field label="Nombre visible"><IconInput icon={House} value={d.name} onChange={(e) => set('name')(e.target.value)} /></Field>
        <Field label="Correo electrónico"><IconInput icon={Mail} type="email" value={d.email} onChange={(e) => set('email')(e.target.value)} /></Field>
        <Field label="Teléfono"><IconInput icon={Phone} type="tel" value={d.phone} onChange={(e) => set('phone')(e.target.value)} /></Field>
        <Field label="Zona"><Select value={d.zone} onChange={set('zone')} options={ZONES} /></Field>
        <Field label="¿A quién hay que cuidar?"><Select value={d.personType} onChange={set('personType')} options={PERSON_TYPES} /></Field>
        <div className="md:col-span-2">
          <Button
            icon={Save}
            onClick={() => {
              updateFamily(fam.id, d)
              toast('Datos actualizados.')
            }}
          >
            Guardar cambios
          </Button>
        </div>
      </div>
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
      <h1 className="text-4xl font-bold">Ayuda</h1>
      <div className="mt-6 space-y-3">
        {qa.map(([q, a]) => (
          <details key={q} className="card group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold">
              {q}
              <ChevronRight className="size-5 transition group-open:rotate-90" />
            </summary>
            <p className="mt-3 text-ink-soft">{a}</p>
          </details>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3 text-ink-soft">
        <span className="flex items-center gap-2"><Phone className="size-5 text-brand-700" />956 000 000</span>
        <span className="flex items-center gap-2"><Mail className="size-5 text-brand-700" />hola@mariatecuida.es</span>
        <span className="flex items-center gap-2"><MapPin className="size-5 text-brand-700" />Provincia de Cádiz</span>
        <span className="flex items-center gap-2"><Clock className="size-5 text-brand-700" />L-V 9:00-19:00</span>
      </div>
    </div>
  )
}
