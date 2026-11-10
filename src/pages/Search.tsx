import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  Handshake,
  Heart,
  MapPin,
  MessageSquareText,
  Plus,
  Search as SearchIcon,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  User,
  Users,
  X,
  Info,
} from 'lucide-react'
import { Container } from '../components/Layout'
import { Avatar, Button, CaregiverBadges, Checkbox, Chip, EmptyState, IconBubble, RadioCard, Select, Stars } from '../components/ui'
import { useMe, useStore } from '../store'
import { CARE_TYPES, DAYS, EXPERIENCE_RANGES, JORNADAS, LANGUAGES, TRAINING, TRAINING_SHORT, ZONES, labelOf } from '../data/catalog'
import type { Caregiver, SearchFilters } from '../data/types'
import { emptyFilters } from '../data/seed'
import { activeCount, search } from '../lib/search'
import { cx, shortName, yearsLabel } from '../lib/format'
import { jornadaText } from '../components/CaregiverProfileView'

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

function FilterBlock({ icon: Icon, title, children, tone = 'brand' }: { icon: typeof User; title: string; children: React.ReactNode; tone?: 'brand' | 'rosa' }) {
  return (
    <div className="flex gap-3">
      <IconBubble icon={Icon} tone={tone} />
      <div className="min-w-0 flex-1">
        <div className="mb-2 text-lg font-semibold">{title}</div>
        {children}
      </div>
    </div>
  )
}

/** Filtros «Encuentra a tu cuidadora ideal». */
export function IdealFilters({ f, set }: { f: SearchFilters; set: (p: Partial<SearchFilters>) => void }) {
  const [moreCare, setMoreCare] = useState(false)
  const [more, setMore] = useState(f.docsReviewed || f.drivingLicense || f.vehicle || f.includeUnavailable)
  const careShown = moreCare ? CARE_TYPES : CARE_TYPES.slice(0, 3)
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <FilterBlock icon={User} title="Experiencia">
          <Select aria-label="Años de experiencia" value={f.minYears} onChange={(minYears) => set({ minYears })} options={EXPERIENCE_RANGES.slice(1).map((r) => ({ id: String(r.min), label: `${r.min === 10 ? 'Más de 10' : `Desde ${r.min}`} ${r.min === 1 ? 'año' : 'años'}` }))} placeholder="Años de experiencia" />
        </FilterBlock>
        <FilterBlock icon={Heart} title="Tipo de cuidados" tone="rosa">
          <div className="flex flex-wrap gap-2">
            {careShown.map((c) => (
              <Chip key={c.id} active={f.careTypes.includes(c.id)} onClick={() => set({ careTypes: toggle(f.careTypes, c.id) })}>
                {c.id === 'mayores' ? 'Mayores' : c.label}
              </Chip>
            ))}
            <button type="button" onClick={() => setMoreCare(!moreCare)} className="inline-flex h-10 items-center gap-1 rounded-full bg-brand-100 px-4 font-semibold text-brand-800 hover:bg-brand-200">
              {moreCare ? <X className="size-4" /> : <Plus className="size-4" />}
              {moreCare ? 'Menos' : 'Más'}
            </button>
          </div>
        </FilterBlock>
      </div>
      <div className="grid gap-6 border-t border-line pt-6 md:grid-cols-3">
        <FilterBlock icon={GraduationCap} title="Formación">
          <Select aria-label="Formación" value={f.training} onChange={(training) => set({ training })} options={TRAINING.map((t) => ({ id: t.id, label: TRAINING_SHORT[t.id] }))} placeholder="Selecciona formación" />
        </FilterBlock>
        <FilterBlock icon={CalendarDays} title="Jornada">
          <Select aria-label="Jornada" value={f.jornada} onChange={(jornada) => set({ jornada })} options={JORNADAS} placeholder="Selecciona jornada" />
        </FilterBlock>
        <FilterBlock icon={MapPin} title="Ubicación">
          <Select aria-label="Ubicación" value={f.zone} onChange={(zone) => set({ zone })} options={ZONES} placeholder="Tu zona o municipio" />
        </FilterBlock>
      </div>
      <div className="grid items-start gap-6 border-t border-line pt-6 md:grid-cols-[1.3fr_1fr_auto]">
        <FilterBlock icon={Clock} title="Disponibilidad">
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((d, i) => (
              <button
                key={d}
                type="button"
                aria-pressed={f.days.includes(i)}
                onClick={() => set({ days: toggle(f.days, i) })}
                className={cx('size-11 rounded-xl border font-semibold transition', f.days.includes(i) ? 'border-brand-700 bg-brand-700 text-white' : 'border-brand-200 bg-white hover:border-brand-500')}
              >
                {d}
              </button>
            ))}
          </div>
        </FilterBlock>
        <FilterBlock icon={MessageSquareText} title="Idiomas">
          <Select aria-label="Idiomas" value={f.language} onChange={(language) => set({ language })} options={LANGUAGES} placeholder="Selecciona idiomas" />
        </FilterBlock>
        <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className="inline-flex h-14 items-center gap-3 self-end rounded-full bg-brand-100 px-6 text-lg font-semibold text-brand-900 hover:bg-brand-200">
          <SlidersHorizontal className="size-6" />
          Más filtros
          <ChevronDown className={cx('size-5 transition', more && 'rotate-180')} />
        </button>
      </div>
      {more && (
        <div className="grid gap-x-6 rounded-2xl bg-brand-50 px-5 py-3 sm:grid-cols-2">
          <Checkbox checked={f.docsReviewed} onChange={(docsReviewed) => set({ docsReviewed })} label="Con documentación revisada" />
          <Checkbox checked={f.drivingLicense} onChange={(drivingLicense) => set({ drivingLicense })} label="Con carné de conducir" />
          <Checkbox checked={f.vehicle} onChange={(vehicle) => set({ vehicle })} label="Con vehículo propio" />
          <Checkbox checked={f.includeUnavailable} onChange={(includeUnavailable) => set({ includeUnavailable })} label="Mostrar también cuidadoras no disponibles" />
        </div>
      )}
    </div>
  )
}

function TrustSelector({ f, set }: { f: SearchFilters; set: (p: Partial<SearchFilters>) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <RadioCard checked={!f.onlyTrusted} onChange={() => set({ onlyTrusted: false })} className="py-4">
        <span className="flex items-center gap-3">
          <Users className="size-9 shrink-0 text-brand-600" strokeWidth={1.6} />
          <span>
            <span className="block text-lg font-semibold">Todas las cuidadoras</span>
            <span className="text-ink-soft">Profesionales registradas en la plataforma.</span>
          </span>
        </span>
      </RadioCard>
      <RadioCard checked={f.onlyTrusted} onChange={() => set({ onlyTrusted: true })} className="py-4">
        <span className="flex items-center gap-3">
          <ShieldCheck className="size-9 shrink-0 text-brand-600" strokeWidth={1.6} />
          <span>
            <span className="block text-lg font-semibold">Cuidadoras de confianza María te Cuida</span>
            <span className="text-ink-soft">Ya han trabajado con familias y están bien valoradas.</span>
          </span>
        </span>
      </RadioCard>
    </div>
  )
}

/* ------------------------------ Inicio de búsqueda ------------------------------ */

export function SearchHome() {
  const { state, setLastSearch } = useStore()
  const me = useMe()
  const navigate = useNavigate()
  const [f, setF] = useState<SearchFilters>(() => (me.family && activeCount(state.lastSearch) === 0 && !state.lastSearch.zone ? { ...me.family.prefs } : state.lastSearch))
  const [ideal, setIdeal] = useState(activeCount(f) > 0)
  const set = (p: Partial<SearchFilters>) => setF((x) => ({ ...x, ...p }))
  const count = search(state.caregivers, f).length

  const go = () => {
    setLastSearch(f)
    navigate('/buscar/resultados')
  }

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-r from-white via-white to-brand-50">
        <img src="/img/manos.jpg" alt="" className="absolute top-0 right-0 hidden h-full w-[42%] object-cover [mask-image:linear-gradient(to_right,transparent,black_35%)] md:block" />
        <Container className="relative py-8 sm:py-12">
          <h1 className="text-[32px] leading-tight font-bold sm:text-5xl md:max-w-[60%]">Hola{me.greetingName && me.role === 'family' ? `, ${me.greetingName}` : ''}, ¿en qué podemos ayudarte?</h1>
          <p className="mt-2 text-lg text-ink-soft">Encuentra la cuidadora que mejor se adapte a tu familia.</p>
        </Container>
      </section>
      <Container className="max-w-6xl pb-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="#buscador" className="flex items-center gap-4 rounded-2xl border-[1.5px] border-brand-400 bg-gradient-to-r from-brand-50 to-brand-100/60 p-5 shadow-card transition hover:shadow-pop">
            <IconBubble icon={SearchIcon} size="lg" />
            <span className="flex-1">
              <span className="block text-xl font-semibold">Buscar una cuidadora</span>
              <span className="text-ink-soft">Consulta perfiles y contacta.</span>
            </span>
            <ChevronRight className="size-6" />
          </a>
          <Link to="/servicio-integral" className="card flex items-center gap-4 p-5 transition hover:shadow-pop">
            <IconBubble icon={Handshake} size="lg" />
            <span className="flex-1">
              <span className="block text-xl font-semibold">Quiero ayuda en la selección</span>
              <span className="text-ink-soft">Te asesoramos y te proponemos la mejor opción.</span>
            </span>
            <ChevronRight className="size-6" />
          </Link>
        </div>

        <section id="buscador" className="card mt-6 scroll-mt-28 p-5 sm:p-8">
          <h2 className="text-3xl font-bold">Encuentra tu cuidadora</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div>
              <div className="mb-2 flex items-center gap-2 text-lg font-semibold"><Users className="size-6 text-brand-600" />Tipo de cuidado</div>
              <Select aria-label="Tipo de cuidado" value={f.careType} onChange={(careType) => set({ careType })} options={CARE_TYPES} placeholder="Selecciona una opción" />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-lg font-semibold"><MapPin className="size-6 text-brand-600" />Ubicación</div>
              <Select aria-label="Ubicación" value={f.zone} onChange={(zone) => set({ zone })} options={ZONES} placeholder="Tu zona" />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-lg font-semibold"><CalendarDays className="size-6 text-brand-600" />Disponibilidad</div>
              <Select aria-label="Disponibilidad" value={f.jornada} onChange={(jornada) => set({ jornada })} options={JORNADAS} placeholder="Selecciona" />
            </div>
          </div>
          <div className="my-6 border-t border-line" />
          <div className={cx('rounded-2xl border-[1.5px] border-brand-400 transition', ideal ? 'bg-white' : 'bg-gradient-to-r from-brand-50 to-brand-100/50')}>
            <button type="button" onClick={() => setIdeal(!ideal)} aria-expanded={ideal} className="flex w-full items-center gap-4 px-5 py-4 text-left">
              <SlidersHorizontal className="size-9 shrink-0 text-brand-800" strokeWidth={1.6} />
              <span className="flex-1">
                <span className="block text-xl font-bold sm:text-2xl">Encuentra a tu cuidadora ideal</span>
                <span className="text-ink-soft">Filtra por experiencia, cuidados, formación, jornada, idiomas y más.</span>
              </span>
              {activeCount(f) > 0 && <span className="rounded-full bg-brand-700 px-2.5 py-0.5 text-sm font-bold text-white">{activeCount(f)}</span>}
              <ChevronDown className={cx('size-7 text-brand-800 transition', ideal && 'rotate-180')} />
            </button>
            {ideal && (
              <div className="border-t border-line px-5 py-6">
                <IdealFilters f={f} set={set} />
              </div>
            )}
          </div>
          <div className="mt-5">
            <TrustSelector f={f} set={set} />
          </div>
          <div className="mt-7 flex flex-col items-center gap-2">
            <Button size="lg" icon={SearchIcon} onClick={go} className="w-full max-w-md text-xl">
              Buscar cuidadoras
            </Button>
            <span className="text-sm text-muted">{count} {count === 1 ? 'cuidadora coincide' : 'cuidadoras coinciden'} con tu búsqueda</span>
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
  if (size === 'lg')
    return (
      <Button variant="outline" size="lg" onClick={onClick} className="sm:min-w-72" disabled={me.role === 'caregiver'}>
        <Heart className={cx('size-6', fav && 'fill-rosa-500 text-rosa-500')} />
        {fav ? 'Guardada en favoritas' : 'Guardar en favoritos'}
      </Button>
    )
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={fav}
      aria-label={fav ? `Quitar a ${shortName(c.name)} de favoritas` : `Guardar a ${shortName(c.name)} en favoritas`}
      title={fav ? 'Quitar de favoritas' : 'Guardar en favoritas (privado)'}
      className="flex size-12 items-center justify-center rounded-full border border-line bg-white transition hover:border-rosa-300 hover:bg-rosa-50"
    >
      <Heart className={cx('size-6 transition', fav ? 'scale-110 fill-rosa-500 text-rosa-500' : 'text-brand-800')} />
    </button>
  )
}

export function CaregiverRow({ c }: { c: Caregiver }) {
  const care = c.careTypes.slice(0, 2).map((id) => (id === 'mayores' ? 'Mayores' : labelOf(CARE_TYPES, id).replace('Demencia / Alzheimer', 'Alzheimer'))).join(' · ')
  return (
    <article className="card grid gap-4 p-4 transition hover:border-brand-200 hover:shadow-pop sm:p-5 md:grid-cols-[1.1fr_1.2fr_1fr_auto] md:items-center">
      <div className="flex items-center gap-4">
        <Avatar name={c.name} photo={c.photo} size={88} />
        <div className="min-w-0">
          <h3 className="text-2xl font-bold">
            <Link to={`/cuidadoras/${c.id}`} className="hover:text-brand-800">{shortName(c.name)}</Link>
          </h3>
          <div className="mt-1"><CaregiverBadges c={c} size="sm" /></div>
          <div className="mt-1.5"><Stars rating={c.rating} reviews={c.reviews} size="sm" /></div>
        </div>
      </div>
      <ul className="space-y-2 text-[15px] md:border-l md:border-line md:pl-5">
        <li className="flex items-center gap-2.5"><BriefcaseBusiness className="size-5 shrink-0 text-brand-500" />{yearsLabel(c.experienceYears)}</li>
        <li className="flex items-center gap-2.5"><Heart className="size-5 shrink-0 text-brand-500" />{care}</li>
        <li className="flex items-center gap-2.5"><GraduationCap className="size-5 shrink-0 text-brand-500" />{c.training[0] ? (c.training[0] === 'otra' && c.otherTraining ? c.otherTraining : TRAINING_SHORT[c.training[0]]) : 'Sin formación indicada'}</li>
      </ul>
      <ul className="space-y-2 text-[15px] md:border-l md:border-line md:pl-5">
        <li className="flex items-center gap-2.5">
          <CalendarDays className="size-5 shrink-0 text-brand-500" />
          <span className={cx('rounded-full px-2.5 py-0.5 text-sm font-semibold', c.available ? 'bg-brand-100 text-brand-900' : 'bg-slate-100 text-slate-600')}>{c.available ? 'Disponible' : 'No disponible'}</span>
        </li>
        <li className="pl-[30px]">{jornadaText(c)}</li>
        <li className="flex items-center gap-2.5"><MapPin className="size-5 shrink-0 text-brand-500" />{c.zone}</li>
      </ul>
      <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
        <FavoriteButton c={c} />
        <Button to={`/cuidadoras/${c.id}`} iconRight={ChevronRight} className="max-md:flex-1">Ver perfil</Button>
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
  if (f.minYears) chips.push({ label: `+${f.minYears} años`, clear: { minYears: '' } })
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
      {chips.map((c) => (
        <button key={c.label} type="button" onClick={() => set(c.clear)} className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1.5 text-sm font-medium text-brand-900 hover:bg-brand-200">
          {c.label}
          <X className="size-3.5" />
        </button>
      ))}
      <button type="button" onClick={() => set({ ...emptyFilters(), sort: f.sort })} className="px-2 text-sm font-semibold text-brand-800 underline underline-offset-2">
        Borrar filtros
      </button>
    </div>
  )
}

export function Results() {
  const { state, setLastSearch } = useStore()
  const f = state.lastSearch
  const set = (p: Partial<SearchFilters>) => setLastSearch({ ...f, ...p })
  const [editing, setEditing] = useState(false)
  const list = search(state.caregivers, f)

  return (
    <Container className="max-w-6xl py-6 sm:py-8">
      <Link to="/buscar" className="flex items-center gap-4 rounded-full border border-brand-100 bg-gradient-to-r from-brand-50 to-brand-100/60 px-5 py-3.5 text-lg font-semibold">
        <ArrowLeft className="size-6 text-brand-700" />
        Encuentra a tu cuidadora ideal
      </Link>
      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {f.includeUnavailable ? 'Cuidadoras' : 'Cuidadoras disponibles'} <span className="font-normal">({list.length})</span>
          </h1>
          <p className="mt-1 text-lg text-ink-soft">Según tus preferencias</p>
        </div>
        <Select aria-label="Ordenar" className="w-52" value={f.sort} onChange={(sort) => set({ sort: sort as SearchFilters['sort'] })} options={[{ id: 'relevancia', label: 'Más relevantes' }, { id: 'valoracion', label: 'Mejor valoradas' }, { id: 'experiencia', label: 'Más experiencia' }]} />
        <Button variant="outline" size="lg" icon={SlidersHorizontal} onClick={() => setEditing(!editing)} aria-expanded={editing}>
          {editing ? 'Ocultar filtros' : 'Modificar búsqueda'}
        </Button>
      </div>
      <div className="mt-4"><ActiveChips f={f} set={set} /></div>
      {editing && (
        <div className="card animate-pop mt-5 p-5 sm:p-7">
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 font-semibold">Tipo de cuidado</div>
              <Select aria-label="Tipo de cuidado" value={f.careType} onChange={(careType) => set({ careType })} options={CARE_TYPES} placeholder="Cualquiera" />
            </div>
            <div>
              <div className="mb-2 font-semibold">Mostrar</div>
              <Select aria-label="Mostrar" value={f.onlyTrusted ? 'trusted' : 'all'} onChange={(v) => set({ onlyTrusted: v === 'trusted' })} options={[{ id: 'all', label: 'Todas las cuidadoras' }, { id: 'trusted', label: 'Solo cuidadoras de confianza' }]} />
            </div>
          </div>
          <IdealFilters f={f} set={set} />
          <p className="mt-5 text-sm text-muted">Los resultados se actualizan al momento.</p>
        </div>
      )}
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
                  <Button variant="outline" onClick={() => set({ ...emptyFilters(), sort: f.sort })}>Borrar filtros</Button>
                  <Button to="/servicio-integral" icon={Handshake}>Pedir ayuda al equipo</Button>
                </div>
              }
            >
              Prueba a quitar algún filtro o pide al equipo de María te Cuida que busque por ti.
            </EmptyState>
          </div>
        )}
      </div>
      <div className="mt-8 flex items-start gap-3 rounded-2xl bg-brand-50 p-4 text-[15px] text-ink-soft">
        <Info className="mt-0.5 size-5 shrink-0 text-brand-700" />
        <p>
          <Star className="inline size-4 fill-amber-400 text-amber-400" /> Las valoraciones son de familias que han contratado a través de la plataforma. Guardar una favorita es privado: la cuidadora no recibe ningún aviso.
        </p>
      </div>
    </Container>
  )
}
