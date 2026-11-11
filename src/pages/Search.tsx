import { useId, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  Handshake,
  Heart,
  Info,
  MapPin,
  MessageSquareText,
  Minus,
  Plus,
  Search as SearchIcon,
  ShieldCheck,
  SlidersHorizontal,
  User,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Container } from '../components/Layout'
import { AvailabilityPill, Avatar, BackLink, Button, CaregiverBadges, Checkbox, Chip, DaysRow, EmptyState, Field, IconBubble, RadioCard, Select, Stars } from '../components/ui'
import { useMe, useStore } from '../store'
import { CARE_TYPES, DAYS, EXPERIENCE_RANGES, JORNADAS, LANGUAGES, TRAINING, TRAINING_SHORT, ZONES, labelOf } from '../data/catalog'
import type { Caregiver, SearchFilters } from '../data/types'
import { emptyFilters } from '../data/seed'
import { activeCount, search } from '../lib/search'
import { cx, img, shortName, yearsLabel } from '../lib/format'
import { jornadaText } from '../components/CaregiverProfileView'

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

/** Etiqueta de filtro con icono. */
const L = ({ icon: Icon, children, tone = 'brand' }: { icon: LucideIcon; children: ReactNode; tone?: 'brand' | 'rosa' }) => (
  <span className="inline-flex items-center gap-2">
    <Icon aria-hidden className={cx('size-5', tone === 'brand' ? 'text-accent-icon' : 'text-care-icon')} strokeWidth={2} />
    {children}
  </span>
)

/** Filtros «Encuentra a tu cuidadora ideal». */
export function IdealFilters({ f, set }: { f: SearchFilters; set: (p: Partial<SearchFilters>) => void }) {
  const [moreCare, setMoreCare] = useState(false)
  const [more, setMore] = useState(f.docsReviewed || f.drivingLicense || f.vehicle || f.includeUnavailable)
  const moreId = useId()
  const careShown = moreCare ? CARE_TYPES : CARE_TYPES.slice(0, 3)
  return (
    <div className="space-y-7">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Field label={<L icon={User}>Experiencia</L>}>
          <Select
            value={f.minYears}
            onChange={(minYears) => set({ minYears })}
            options={EXPERIENCE_RANGES.slice(1).map((r) => ({ id: String(r.min), label: `${r.min === 10 ? 'Más de 10' : `Desde ${r.min}`} ${r.min === 1 ? 'año' : 'años'}` }))}
            placeholder="Cualquier experiencia"
          />
        </Field>
        <Field group label={<L icon={Heart} tone="rosa">Tipo de cuidados</L>}>
          <div className="flex flex-wrap gap-2">
            {careShown.map((c) => (
              <Chip key={c.id} active={f.careTypes.includes(c.id)} onClick={() => set({ careTypes: toggle(f.careTypes, c.id) })}>
                {c.id === 'mayores' ? 'Mayores' : c.label}
              </Chip>
            ))}
            <button type="button" onClick={() => setMoreCare(!moreCare)} aria-expanded={moreCare} className="pressable inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 font-semibold text-accent underline decoration-accent-line underline-offset-4 hover:bg-accent-subtle">
              {moreCare ? <Minus aria-hidden className="size-4" strokeWidth={2.5} /> : <Plus aria-hidden className="size-4" strokeWidth={2.5} />}
              {moreCare ? 'Ver menos' : 'Ver más tipos'}
            </button>
          </div>
        </Field>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Field label={<L icon={GraduationCap}>Formación</L>}>
          <Select value={f.training} onChange={(training) => set({ training })} options={TRAINING.map((t) => ({ id: t.id, label: TRAINING_SHORT[t.id] }))} placeholder="Cualquier formación" />
        </Field>
        <Field label={<L icon={CalendarDays}>Jornada</L>}>
          <Select value={f.jornada} onChange={(jornada) => set({ jornada })} options={JORNADAS} placeholder="Cualquier jornada" />
        </Field>
        <Field label={<L icon={MapPin}>Ubicación</L>}>
          <Select value={f.zone} onChange={(zone) => set({ zone })} options={ZONES} placeholder="Cualquier zona" />
        </Field>
      </div>
      <div className="grid items-start gap-6 md:grid-cols-[1.3fr_1fr]">
        <Field group label={<L icon={Clock}>Días que necesitas</L>}>
          <DaysRow days={f.days} onToggle={(i) => set({ days: toggle(f.days, i) })} />
        </Field>
        <Field label={<L icon={MessageSquareText}>Idioma</L>}>
          <Select value={f.language} onChange={(language) => set({ language })} options={LANGUAGES} placeholder="Cualquier idioma" />
        </Field>
      </div>
      <div>
        <button
          type="button"
          onClick={() => setMore(!more)}
          aria-expanded={more}
          aria-controls={moreId}
          className="pressable inline-flex min-h-12 items-center gap-2.5 rounded-full border-2 border-line bg-surface px-5 font-semibold text-ink hover:border-accent-line hover:bg-accent-subtle"
        >
          <SlidersHorizontal aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
          Más filtros
          <ChevronDown aria-hidden className={cx('size-5 motion-safe:transition-[rotate] motion-safe:duration-200', more && 'rotate-180')} strokeWidth={2.25} />
        </button>
        <div id={moreId} hidden={!more} className="mt-3 grid gap-x-6 rounded-2xl bg-sunken px-5 py-2 sm:grid-cols-2">
          <Checkbox checked={f.docsReviewed} onChange={(docsReviewed) => set({ docsReviewed })} label="Con documentación revisada" />
          <Checkbox checked={f.drivingLicense} onChange={(drivingLicense) => set({ drivingLicense })} label="Con carné de conducir" />
          <Checkbox checked={f.vehicle} onChange={(vehicle) => set({ vehicle })} label="Con vehículo propio" />
          <Checkbox checked={f.includeUnavailable} onChange={(includeUnavailable) => set({ includeUnavailable })} label="Mostrar también cuidadoras no disponibles" />
        </div>
      </div>
    </div>
  )
}

function TrustSelector({ f, set }: { f: SearchFilters; set: (p: Partial<SearchFilters>) => void }) {
  const name = useId()
  return (
    <fieldset>
      <legend className="mb-3 text-lg font-semibold">¿Qué cuidadoras quieres ver?</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <RadioCard name={name} checked={!f.onlyTrusted} onChange={() => set({ onlyTrusted: false })}>
          <span className="flex items-center gap-3">
            <Users aria-hidden className="size-8 shrink-0 text-accent-icon" strokeWidth={1.75} />
            <span>
              <span className="block font-semibold">Todas las cuidadoras</span>
              <span className="text-sm text-ink-soft">Profesionales registradas en la plataforma.</span>
            </span>
          </span>
        </RadioCard>
        <RadioCard name={name} checked={f.onlyTrusted} onChange={() => set({ onlyTrusted: true })}>
          <span className="flex items-center gap-3">
            <ShieldCheck aria-hidden className="size-8 shrink-0 text-accent-icon" strokeWidth={1.75} />
            <span>
              <span className="block font-semibold">Solo cuidadoras de confianza</span>
              <span className="text-sm text-ink-soft">Ya han trabajado con familias y están bien valoradas.</span>
            </span>
          </span>
        </RadioCard>
      </div>
    </fieldset>
  )
}

const countText = (n: number) => (n === 1 ? '1 cuidadora coincide con tu búsqueda' : `${n} cuidadoras coinciden con tu búsqueda`)

/* ------------------------------ Inicio de búsqueda ------------------------------ */

export function SearchHome() {
  const { state, setLastSearch } = useStore()
  const me = useMe()
  const navigate = useNavigate()
  const [f, setF] = useState<SearchFilters>(() => (me.family && activeCount(state.lastSearch) === 0 && !state.lastSearch.zone ? { ...me.family.prefs } : state.lastSearch))
  const [ideal, setIdeal] = useState(activeCount(f) > 0)
  const idealId = useId()
  const set = (p: Partial<SearchFilters>) => setF((x) => ({ ...x, ...p }))
  const count = search(state.caregivers, f).length
  const active = activeCount(f)

  const go = () => {
    setLastSearch(f)
    navigate('/buscar/resultados')
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <img src={img('manos.jpg')} alt="" className="absolute inset-y-0 right-0 hidden h-full w-[40%] object-cover [mask-image:linear-gradient(to_right,transparent,black_40%)] md:block" />
        <Container className="relative py-10 sm:py-14">
          <h1 className="text-3xl font-bold sm:text-5xl md:max-w-[58%]">
            Hola{me.greetingName && me.role === 'family' ? `, ${me.greetingName}` : ''}. ¿En qué podemos ayudarte?
          </h1>
          <p className="mt-3 text-lg text-ink-soft md:max-w-[50%]">Encuentra la cuidadora que mejor se adapte a tu familia.</p>
        </Container>
      </section>

      <Container className="max-w-6xl py-8 sm:py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="#buscador" className="pressable flex items-center gap-4 rounded-[20px] border-2 border-accent bg-accent-subtle p-5 hover:bg-accent-soft">
            <IconBubble icon={SearchIcon} size="lg" />
            <span className="flex-1">
              <span className="block text-xl font-semibold">Buscar yo una cuidadora</span>
              <span className="text-ink-soft">Consulta perfiles y contacta.</span>
            </span>
            <ChevronDown aria-hidden className="size-6 text-accent" strokeWidth={2.25} />
          </a>
          <Link to="/servicio-integral" className="card pressable flex items-center gap-4 p-5 hover:shadow-card-hover">
            <IconBubble icon={Handshake} size="lg" tone="rosa" />
            <span className="flex-1">
              <span className="block text-xl font-semibold">Quiero ayuda en la selección</span>
              <span className="text-ink-soft">Te asesoramos y te proponemos la mejor opción.</span>
            </span>
            <ChevronRight aria-hidden className="size-6 text-ink-soft" strokeWidth={2.25} />
          </Link>
        </div>

        <section id="buscador" aria-labelledby="buscador-title" className="card mt-6 p-4 sm:p-8">
          <h2 id="buscador-title" className="text-2xl font-bold sm:text-3xl">
            Encuentra tu cuidadora
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <Field label={<L icon={Users}>Tipo de cuidado</L>}>
              <Select value={f.careType} onChange={(careType) => set({ careType })} options={CARE_TYPES} placeholder="Cualquier tipo" />
            </Field>
            <Field label={<L icon={MapPin}>Ubicación</L>}>
              <Select value={f.zone} onChange={(zone) => set({ zone })} options={ZONES} placeholder="Cualquier zona" />
            </Field>
            <Field label={<L icon={CalendarDays}>Jornada</L>}>
              <Select value={f.jornada} onChange={(jornada) => set({ jornada })} options={JORNADAS} placeholder="Cualquier jornada" />
            </Field>
          </div>

          <div className={cx('mt-7 rounded-2xl border-2 transition-[border-color] duration-150', ideal ? 'border-accent-line' : 'border-line')}>
            <h3>
              <button type="button" onClick={() => setIdeal(!ideal)} aria-expanded={ideal} aria-controls={idealId} className="flex min-h-16 w-full items-center gap-4 rounded-2xl px-4 py-4 text-start hover:bg-accent-subtle sm:px-5">
                <span className="max-sm:hidden">
                  <IconBubble icon={SlidersHorizontal} />
                </span>
                <span className="flex-1">
                  <span className="block text-xl font-semibold">Encuentra a tu cuidadora ideal</span>
                  <span className="block text-base font-normal text-ink-soft">Filtra por experiencia, cuidados, formación, días, idiomas y más.</span>
                </span>
                {active > 0 && <span className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-white tabular-nums">{active} {active === 1 ? 'filtro' : 'filtros'}</span>}
                <ChevronDown aria-hidden className={cx('size-6 shrink-0 text-accent motion-safe:transition-[rotate] motion-safe:duration-200', ideal && 'rotate-180')} strokeWidth={2.25} />
              </button>
            </h3>
            <div id={idealId} hidden={!ideal} className="border-t border-line px-4 py-6 sm:px-5">
              {ideal && <IdealFilters f={f} set={set} />}
            </div>
          </div>

          <div className="mt-7">
            <TrustSelector f={f} set={set} />
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 border-t border-line pt-7">
            <Button size="lg" icon={SearchIcon} onClick={go} className="w-full max-w-md">
              Ver cuidadoras
            </Button>
            <p role="status" className="text-ink-soft tabular-nums">
              {countText(count)}
            </p>
          </div>
        </section>
      </Container>
    </>
  )
}

/* ------------------------------ Resultados ------------------------------ */

export function FavoriteButton({ c, size = 'md' }: { c: Caregiver; size?: 'md' | 'lg' }) {
  const me = useMe()
  const { toggleFavorite } = useStore()
  const navigate = useNavigate()
  const loc = useLocation()
  const fav = !!me.family?.favorites.includes(c.id)
  const onClick = () => {
    if (me.role === 'caregiver') return
    if (!me.family) return navigate(`/login?next=${encodeURIComponent(loc.pathname)}`)
    toggleFavorite(me.family.id, c.id)
  }
  if (me.role === 'caregiver') return null
  if (size === 'lg')
    return (
      <Button variant="outline" size="lg" onClick={onClick} aria-pressed={fav} className="sm:min-w-64">
        <Heart aria-hidden className={cx('size-6', fav && 'fill-care-icon text-care-icon')} strokeWidth={2} />
        {fav ? 'Guardada en favoritas' : 'Guardar en favoritas'}
      </Button>
    )
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={fav}
      aria-label={`Guardar a ${shortName(c.name)} en favoritas`}
      className={cx('pressable flex size-12 shrink-0 items-center justify-center rounded-full border-2', fav ? 'border-care-line bg-care-subtle' : 'border-line bg-surface hover:border-care-line hover:bg-care-subtle')}
    >
      <Heart aria-hidden className={cx('size-6', fav ? 'fill-care-icon text-care-icon' : 'text-ink-soft')} strokeWidth={2} />
    </button>
  )
}

export function CaregiverRow({ c }: { c: Caregiver }) {
  const care = c.careTypes
    .slice(0, 2)
    .map((id) => (id === 'mayores' ? 'Mayores' : labelOf(CARE_TYPES, id).replace('Demencia / Alzheimer', 'Alzheimer')))
    .join(' · ')
  const fact = 'flex items-start gap-2.5'
  const icon = 'mt-1 size-5 shrink-0 text-accent-icon'
  return (
    <article className="card grid gap-5 p-5 sm:p-6 md:grid-cols-[1.15fr_1.2fr_1fr_auto] md:items-center md:gap-6">
      <div className="flex items-center gap-4">
        <Avatar name={c.name} photo={c.photo} size={88} />
        <div className="min-w-0">
          <h2 className="text-2xl font-bold">
            <Link to={`/cuidadoras/${c.id}`} className="underline decoration-transparent underline-offset-4 hover:decoration-accent">
              {shortName(c.name)}
            </Link>
          </h2>
          <div className="mt-1.5">
            <CaregiverBadges c={c} size="sm" />
          </div>
          <div className="mt-1.5">
            <Stars rating={c.rating} reviews={c.reviews} size="sm" />
          </div>
        </div>
      </div>
      <ul className="space-y-2 border-line md:border-s md:ps-6">
        <li className={fact}>
          <BriefcaseBusiness aria-hidden className={icon} strokeWidth={2} />
          {yearsLabel(c.experienceYears)}
        </li>
        <li className={fact}>
          <Heart aria-hidden className={icon} strokeWidth={2} />
          {care}
        </li>
        <li className={fact}>
          <GraduationCap aria-hidden className={icon} strokeWidth={2} />
          {c.training[0] ? (c.training[0] === 'otra' && c.otherTraining ? c.otherTraining : TRAINING_SHORT[c.training[0]]) : 'Sin formación indicada'}
        </li>
      </ul>
      <ul className="space-y-2 border-line md:border-s md:ps-6">
        <li>
          <AvailabilityPill available={c.available} size="sm" />
        </li>
        <li className={fact}>
          <CalendarDays aria-hidden className={icon} strokeWidth={2} />
          {jornadaText(c)}
        </li>
        <li className={fact}>
          <MapPin aria-hidden className={icon} strokeWidth={2} />
          {c.zone}
        </li>
      </ul>
      <div className="flex items-center gap-3 md:flex-col md:items-end">
        <FavoriteButton c={c} />
        <Button to={`/cuidadoras/${c.id}`} iconRight={ChevronRight} className="flex-1 md:flex-none">
          Ver perfil<span className="sr-only"> de {shortName(c.name)}</span>
        </Button>
      </div>
    </article>
  )
}

function ActiveChips({ f, set }: { f: SearchFilters; set: (p: Partial<SearchFilters>) => void }) {
  const chips: { label: string; clear: Partial<SearchFilters> }[] = []
  if (f.careType) chips.push({ label: labelOf(CARE_TYPES, f.careType), clear: { careType: '' } })
  f.careTypes.forEach((t) => chips.push({ label: labelOf(CARE_TYPES, t), clear: { careTypes: f.careTypes.filter((x) => x !== t) } }))
  if (f.zone) chips.push({ label: f.zone, clear: { zone: '' } })
  if (f.jornada) chips.push({ label: labelOf(JORNADAS, f.jornada), clear: { jornada: '' } })
  if (f.minYears) chips.push({ label: `Desde ${f.minYears} años`, clear: { minYears: '' } })
  if (f.training) chips.push({ label: TRAINING_SHORT[f.training], clear: { training: '' } })
  if (f.days.length) chips.push({ label: f.days.map((d) => DAYS[d]).join(' '), clear: { days: [] } })
  if (f.language) chips.push({ label: f.language, clear: { language: '' } })
  if (f.onlyTrusted) chips.push({ label: 'De confianza', clear: { onlyTrusted: false } })
  if (f.docsReviewed) chips.push({ label: 'Documentación revisada', clear: { docsReviewed: false } })
  if (f.drivingLicense) chips.push({ label: 'Carné', clear: { drivingLicense: false } })
  if (f.vehicle) chips.push({ label: 'Vehículo', clear: { vehicle: false } })
  if (f.includeUnavailable) chips.push({ label: 'Incluye no disponibles', clear: { includeUnavailable: false } })
  if (!chips.length) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="me-1 text-ink-soft">Filtros activos:</span>
      <ul className="contents">
        {chips.map((c) => (
          <li key={c.label}>
            <button type="button" onClick={() => set(c.clear)} aria-label={`Quitar filtro: ${c.label}`} className="pressable inline-flex min-h-11 items-center gap-1.5 rounded-full bg-accent-soft ps-4 pe-3 font-medium text-accent-strong hover:bg-accent-line">
              {c.label}
              <X aria-hidden className="size-4" strokeWidth={2.5} />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => set({ ...emptyFilters(), sort: f.sort })} className="link inline-flex min-h-11 items-center px-2">
        Borrar todos
      </button>
    </div>
  )
}

export function Results() {
  const { state, setLastSearch } = useStore()
  const f = state.lastSearch
  const set = (p: Partial<SearchFilters>) => setLastSearch({ ...f, ...p })
  const [editing, setEditing] = useState(false)
  const editId = useId()
  const list = search(state.caregivers, f)

  return (
    <Container className="max-w-6xl py-6 sm:py-8">
      <BackLink to="/buscar">Volver al buscador</BackLink>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {f.includeUnavailable ? 'Cuidadoras' : 'Cuidadoras disponibles'} <span className="font-normal text-ink-soft tabular-nums">({list.length})</span>
          </h1>
          <p className="mt-1 text-lg text-ink-soft">Según tus preferencias</p>
        </div>
        <Field label="Ordenar por" className="w-full sm:w-56">
          <Select value={f.sort} onChange={(sort) => set({ sort: sort as SearchFilters['sort'] })} options={[{ id: 'relevancia', label: 'Más relevantes' }, { id: 'valoracion', label: 'Mejor valoradas' }, { id: 'experiencia', label: 'Más experiencia' }]} />
        </Field>
        <Button variant="outline" size="lg" icon={SlidersHorizontal} onClick={() => setEditing(!editing)} aria-expanded={editing} aria-controls={editId} className="max-sm:w-full">
          {editing ? 'Ocultar filtros' : 'Cambiar filtros'}
        </Button>
      </div>
      <div className="mt-4">
        <ActiveChips f={f} set={set} />
      </div>
      <div id={editId} hidden={!editing} className="card mt-5 p-5 sm:p-7">
        {editing && (
          <>
            <div className="mb-7 grid gap-5 md:grid-cols-2">
              <Field label="Tipo de cuidado">
                <Select value={f.careType} onChange={(careType) => set({ careType })} options={CARE_TYPES} placeholder="Cualquier tipo" />
              </Field>
              <Field label="Mostrar">
                <Select value={f.onlyTrusted ? 'trusted' : 'all'} onChange={(v) => set({ onlyTrusted: v === 'trusted' })} options={[{ id: 'all', label: 'Todas las cuidadoras' }, { id: 'trusted', label: 'Solo cuidadoras de confianza' }]} />
              </Field>
            </div>
            <IdealFilters f={f} set={set} />
            <p className="mt-6 flex items-center gap-2 text-ink-soft">
              <Info aria-hidden className="size-5 text-accent-icon" />
              Los resultados se actualizan al momento.
            </p>
          </>
        )}
      </div>
      <p role="status" className="sr-only">
        {countText(list.length)}
      </p>
      <div className="mt-6 space-y-4">
        {list.map((c) => (
          <CaregiverRow key={c.id} c={c} />
        ))}
        {list.length === 0 && (
          <div className="card">
            <EmptyState
              icon={SearchIcon}
              title="No hay cuidadoras con estos filtros"
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" onClick={() => set({ ...emptyFilters(), sort: f.sort })}>
                    Borrar filtros
                  </Button>
                  <Button to="/servicio-integral" icon={Handshake}>
                    Pedir ayuda al equipo
                  </Button>
                </div>
              }
            >
              Prueba a quitar algún filtro o pide al equipo de María te Cuida que busque por ti.
            </EmptyState>
          </div>
        )}
      </div>
      <div className="mt-8">
        <p className="flex items-start gap-3 rounded-2xl bg-accent-subtle p-4 text-ink-soft">
          <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
          Las valoraciones son de familias que han contratado a través de la plataforma. Guardar una favorita es privado: la cuidadora no recibe ningún aviso.
        </p>
      </div>
    </Container>
  )
}
