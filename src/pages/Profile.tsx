import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock,
  GraduationCap,
  Handshake,
  Heart,
  Info,
  MapPin,
  MessageCircleMore,
  Search,
  Send,
} from 'lucide-react'
import { Container } from '../components/Layout'
import { Avatar, Button, CaregiverBadges, DaysRow, Field, InfoNote, LoginRequired, Select, Stars, Textarea } from '../components/ui'
import { CaregiverProfileView, jornadaText } from '../components/CaregiverProfileView'
import { FavoriteButton } from './Search'
import { useMe, useStore } from '../store'
import { CARE_TYPES, JORNADAS, PERSON_TYPES, START_OPTIONS, TRAINING_SHORT, labelOf } from '../data/catalog'
import { firstName, shortName, yearsLabel } from '../lib/format'

export function CaregiverPublicProfile() {
  const { id } = useParams()
  const { state } = useStore()
  const me = useMe()
  const navigate = useNavigate()
  const c = state.caregivers.find((x) => x.id === id)
  if (!c) return <Navigate to="/buscar/resultados" replace />
  const existing = me.myRequests.find((r) => r.caregiverId === c.id && r.status !== 'cancelada' && r.status !== 'rechazada')
  const isMe = me.caregiver?.id === c.id

  let contact
  if (isMe) contact = <Button size="lg" variant="soft" to="/cuidadora/perfil">Este es tu perfil</Button>
  else if (existing?.status === 'aceptada')
    contact = <Button size="lg" icon={MessageCircleMore} to={`/mensajes/${existing.id}`} className="sm:min-w-72">Ir al chat</Button>
  else if (existing?.status === 'pendiente')
    contact = <Button size="lg" variant="soft" icon={Clock} to="/familia/solicitudes" className="sm:min-w-72">Solicitud enviada · pendiente</Button>
  else
    contact = (
      <Button size="lg" icon={MessageCircleMore} className="sm:min-w-72" disabled={me.role === 'caregiver' || !c.available} onClick={() => navigate(me.family ? `/cuidadoras/${c.id}/contacto` : `/login?next=/cuidadoras/${c.id}/contacto`)}>
        {c.available ? 'Solicitar contacto' : 'No disponible ahora'}
      </Button>
    )

  return (
    <Container className="max-w-6xl py-6 sm:py-8">
      <button type="button" onClick={() => (window.history.length > 2 ? navigate(-1) : navigate('/buscar/resultados'))} className="mb-5 flex w-full items-center gap-4 rounded-full border border-brand-100 bg-gradient-to-r from-brand-50 to-brand-100/70 px-5 py-3.5 text-left text-lg font-semibold">
        <ArrowLeft className="size-6 text-brand-700" />
        Volver a resultados
      </button>
      <CaregiverProfileView
        c={c}
        actions={
          <>
            {!isMe && <FavoriteButton c={c} size="lg" />}
            {contact}
          </>
        }
      />
      {c.trusted && (
        <div className="mt-5">
          <InfoNote>
            <strong>Cuidadora de confianza María te Cuida:</strong> ya ha trabajado con familias a través de la plataforma y su trabajo ha sido valorado positivamente por el equipo.{' '}
            <Link to="/confianza" className="font-semibold text-brand-800 underline">Más información</Link>
          </InfoNote>
        </div>
      )}
    </Container>
  )
}

/* ------------------------------ Solicitar contacto ------------------------------ */

export function ContactRequestPage() {
  const { id } = useParams()
  const { state, sendRequest, toast } = useStore()
  const me = useMe()
  const navigate = useNavigate()
  const c = state.caregivers.find((x) => x.id === id)
  const [need, setNeed] = useState('')
  const [start, setStart] = useState('')
  const [startDate, setStartDate] = useState('')
  const [jornada, setJornada] = useState(c?.jornadas.length === 1 ? c.jornadas[0] : '')
  const [personType, setPersonType] = useState(me.family?.personType ?? 'mayor')
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!c) return <Navigate to="/buscar" replace />
  if (!me.family) return <LoginRequired next={`/cuidadoras/${c.id}/contacto`} role="family" />
  const existing = me.myRequests.find((r) => r.caregiverId === c.id && (r.status === 'pendiente' || r.status === 'aceptada'))
  if (existing) return <Navigate to={existing.status === 'aceptada' ? `/mensajes/${existing.id}` : '/familia/solicitudes'} replace />

  const submit = () => {
    const e: Record<string, string> = {}
    if (need.trim().length < 15) e.need = 'Cuéntale un poco más (mínimo 15 caracteres).'
    if (!start) e.start = 'Indica cuándo te gustaría comenzar.'
    if (start === 'fecha' && !startDate) e.start = 'Elige una fecha.'
    if (!jornada) e.jornada = 'Selecciona el tipo de jornada.'
    setErrors(e)
    if (Object.keys(e).length) return
    sendRequest({ familyId: me.family!.id, caregiverId: c.id, need: need.trim(), start, startDate: start === 'fecha' ? startDate : undefined, jornada, personType, zone: me.family!.zone })
    toast(`Solicitud enviada a ${shortName(c.name)}. Te avisaremos cuando responda.`)
    navigate('/familia/solicitudes')
  }

  const care = c.careTypes.slice(0, 2).map((x) => labelOf(CARE_TYPES, x)).join(' / ')

  return (
    <Container className="max-w-6xl py-6 sm:py-8">
      <Link to={`/cuidadoras/${c.id}`} className="mb-5 flex items-center gap-4 rounded-full border border-brand-100 bg-gradient-to-r from-brand-50 to-brand-100/70 px-5 py-3.5 text-lg font-semibold">
        <ArrowLeft className="size-6 text-brand-700" />
        Solicitar contacto
      </Link>
      <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="card h-fit p-5">
          <div className="flex items-center gap-4">
            <Avatar name={c.name} photo={c.photo} size={96} />
            <div>
              <h2 className="text-3xl font-bold">{shortName(c.name)}</h2>
              <div className="mt-1"><CaregiverBadges c={c} size="sm" /></div>
              <div className="mt-1"><Stars rating={c.rating} reviews={c.reviews} size="sm" /></div>
            </div>
          </div>
          <ul className="mt-5 space-y-3 border-t border-line pt-5 text-[16px]">
            <li className="flex items-center gap-3"><CalendarDays className="size-5 text-brand-600" />{yearsLabel(c.experienceYears)}</li>
            <li className="flex items-center gap-3"><GraduationCap className="size-5 text-brand-600" />{c.training.map((t) => TRAINING_SHORT[t]).slice(0, 2).join(' · ')}</li>
            <li className="flex items-center gap-3"><Heart className="size-5 text-brand-600" />{care}</li>
            <li className="flex items-center gap-3"><MapPin className="size-5 text-brand-600" />{c.zone}</li>
          </ul>
          <div className="mt-5 rounded-2xl bg-brand-50 p-4">
            <div className="flex items-center gap-3 font-semibold"><CalendarDays className="size-6 text-brand-700" />Disponibilidad</div>
            <div className="mb-3 pl-9 text-ink-soft">{jornadaText(c)}</div>
            <DaysRow days={c.days} size="sm" />
          </div>
        </aside>

        <section className="card overflow-hidden">
          <header className="flex items-start gap-4 bg-gradient-to-r from-brand-50 to-white px-5 py-5 sm:px-7">
            <MessageCircleMore className="size-11 shrink-0 text-brand-600" strokeWidth={1.6} />
            <div>
              <h1 className="text-3xl font-bold">Solicitar contacto</h1>
              <p className="text-ink-soft">Cuéntale a {firstName(c.name)} qué necesitas y organiza un primer contacto.</p>
            </div>
          </header>
          <div className="space-y-5 px-5 py-6 sm:px-7">
            <Field label="Describe brevemente tu necesidad" required error={errors.need}>
              <Textarea value={need} onChange={setNeed} max={300} rows={3} invalid={!!errors.need} placeholder="Ej. Acompañamiento para persona mayor por las tardes, apoyo en la higiene y ayuda en la movilidad…" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="¿Cuándo te gustaría comenzar?" error={errors.start}>
                <Select value={start} onChange={setStart} options={START_OPTIONS} placeholder="Selecciona una fecha" invalid={!!errors.start} />
                {start === 'fecha' && <input type="date" className="input-base mt-2" value={startDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setStartDate(e.target.value)} />}
              </Field>
              <Field label="Tipo de jornada" error={errors.jornada}>
                <Select value={jornada} onChange={setJornada} options={JORNADAS} placeholder="Selecciona una opción" invalid={!!errors.jornada} />
              </Field>
            </div>
            <Field label="¿A quién hay que cuidar?">
              <Select value={personType} onChange={setPersonType} options={PERSON_TYPES} />
            </Field>
            <div className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
              <Info className="mt-0.5 size-6 shrink-0 text-brand-700" />
              <div>
                <div className="font-semibold">¿Qué ocurre después?</div>
                <p className="text-ink-soft">
                  {firstName(c.name)} recibirá tu solicitud y podrá aceptarla o rechazarla. Si ambas partes estáis de acuerdo, se confirma el match y <strong className="text-brand-800">podréis organizar</strong> los detalles por el chat privado.
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <Button variant="outline" size="lg" to={`/cuidadoras/${c.id}`} className="sm:min-w-52">Cancelar</Button>
              <Button size="lg" icon={Send} onClick={submit} className="sm:min-w-72">Enviar solicitud</Button>
            </div>
          </div>
        </section>
      </div>

      <section className="card mt-5 grid items-center gap-5 bg-gradient-to-r from-brand-50 to-white p-5 md:grid-cols-[auto_1fr_auto_1fr_auto_1fr] md:gap-3">
        <h2 className="text-2xl font-bold md:pr-4">¿Cómo funciona?</h2>
        {[
          { icon: Search, n: 1, t: 'Buscas y eliges', d: 'Encuentra a la cuidadora que se adapta a ti.' },
          { icon: Send, n: 2, t: 'Envías tu solicitud', d: 'Cuéntale tu necesidad y disponibilidad.' },
          { icon: Handshake, n: 3, t: 'Hacéis match', d: 'Si ambos aceptáis, podréis contactar y organizar el cuidado.' },
        ].map((s, i) => (
          <div key={s.n} className="contents">
            {i > 0 && <ChevronRight className="hidden size-6 text-brand-600 md:block" />}
            <div className="flex items-start gap-3">
              <s.icon className="size-9 shrink-0 text-brand-600" strokeWidth={1.6} />
              <div>
                <div className="flex items-center gap-2 font-semibold">
                  <span className="flex size-6 items-center justify-center rounded-full bg-brand-700 text-xs text-white">{s.n}</span>
                  {s.t}
                </div>
                <p className="text-sm text-ink-soft">{s.d}</p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </Container>
  )
}
