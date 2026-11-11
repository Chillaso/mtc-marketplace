import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, Clock, GraduationCap, Handshake, Heart, MapPin, MessageCircleMore, Search, Send } from 'lucide-react'
import { Container } from '../components/Layout'
import { Avatar, BackLink, Button, CaregiverBadges, DaysRow, ErrorSummary, Field, FormNote, InfoNote, Input, LoginRequired, Select, Stars, Textarea } from '../components/ui'
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
  if (isMe)
    contact = (
      <Button size="lg" variant="soft" to="/cuidadora/perfil">
        Este es tu perfil
      </Button>
    )
  else if (existing?.status === 'aceptada')
    contact = (
      <Button size="lg" icon={MessageCircleMore} to={`/mensajes/${existing.id}`} className="sm:min-w-64">
        Ir al chat
      </Button>
    )
  else if (existing?.status === 'pendiente')
    contact = (
      <Button size="lg" variant="soft" icon={Clock} to="/familia/solicitudes" className="sm:min-w-64">
        Solicitud enviada: pendiente
      </Button>
    )
  else
    contact = (
      <Button size="lg" icon={MessageCircleMore} className="sm:min-w-64" disabled={me.role === 'caregiver' || !c.available} onClick={() => navigate(me.family ? `/cuidadoras/${c.id}/contacto` : `/login?next=/cuidadoras/${c.id}/contacto`)}>
        {c.available ? 'Solicitar contacto' : 'No disponible ahora'}
      </Button>
    )

  return (
    <Container className="max-w-6xl py-6 sm:py-8">
      <div className="mb-4">
        <BackLink onClick={() => (window.history.length > 2 ? navigate(-1) : navigate('/buscar/resultados'))}>Volver a resultados</BackLink>
      </div>
      <CaregiverProfileView
        c={c}
        actions={
          <>
            {contact}
            {!isMe && <FavoriteButton c={c} size="lg" />}
          </>
        }
      />
      {c.trusted && (
        <div className="mt-5">
          <InfoNote>
            <strong>Cuidadora de confianza María te Cuida:</strong> ya ha trabajado con familias a través de la plataforma y su trabajo ha sido valorado positivamente por el equipo.{' '}
            <Link to="/confianza" className="link">
              Qué significa cada distintivo
            </Link>
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
  const summaryRef = useRef<HTMLDivElement>(null)

  if (!c) return <Navigate to="/buscar" replace />
  if (!me.family) return <LoginRequired next={`/cuidadoras/${c.id}/contacto`} role="family" />
  const existing = me.myRequests.find((r) => r.caregiverId === c.id && (r.status === 'pendiente' || r.status === 'aceptada'))
  if (existing) return <Navigate to={existing.status === 'aceptada' ? `/mensajes/${existing.id}` : '/familia/solicitudes'} replace />

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const e: Record<string, string> = {}
    if (need.trim().length < 15) e.need = 'Cuéntale un poco más: escribe al menos 15 caracteres.'
    if (!start) e.start = 'Indica cuándo te gustaría comenzar.'
    if (start === 'fecha' && !startDate) e.startDate = 'Elige la fecha de inicio.'
    if (!jornada) e.jornada = 'Selecciona el tipo de jornada.'
    setErrors(e)
    if (Object.keys(e).length) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    sendRequest({ familyId: me.family!.id, caregiverId: c.id, need: need.trim(), start, startDate: start === 'fecha' ? startDate : undefined, jornada, personType, zone: me.family!.zone })
    toast(`Solicitud enviada a ${shortName(c.name)}. Te avisaremos cuando responda.`)
    navigate('/familia/solicitudes')
  }

  const care = c.careTypes
    .slice(0, 2)
    .map((x) => labelOf(CARE_TYPES, x))
    .join(' / ')
  const fact = 'flex items-start gap-3'
  const icon = 'mt-0.5 size-5 shrink-0 text-accent-icon'

  return (
    <Container className="max-w-6xl py-6 sm:py-8">
      <div className="mb-4">
        <BackLink to={`/cuidadoras/${c.id}`}>Volver al perfil de {firstName(c.name)}</BackLink>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="card p-6 sm:p-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Solicitar contacto</h1>
          <p className="mt-2 text-lg text-ink-soft">Cuéntale a {firstName(c.name)} qué necesitas y organiza un primer contacto.</p>
          <form onSubmit={submit} noValidate className="mt-7 space-y-6">
            <ErrorSummary ref={summaryRef} errors={errors} />
            <FormNote />
            <Field label="Describe brevemente tu necesidad" required error={errors.need}>
              <Textarea value={need} onChange={setNeed} max={300} rows={4} placeholder="Ej. Acompañamiento para persona mayor por las tardes, apoyo en la higiene y ayuda en la movilidad…" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="¿Cuándo te gustaría comenzar?" required error={errors.start}>
                <Select value={start} onChange={setStart} options={START_OPTIONS} placeholder="Selecciona una opción" />
              </Field>
              <Field label="Tipo de jornada" required error={errors.jornada}>
                <Select value={jornada} onChange={setJornada} options={JORNADAS} placeholder="Selecciona una opción" />
              </Field>
            </div>
            {start === 'fecha' && (
              <Field label="Fecha de inicio" required error={errors.startDate} className="sm:max-w-xs">
                <Input type="date" value={startDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setStartDate(e.target.value)} />
              </Field>
            )}
            <Field label="¿A quién hay que cuidar?">
              <Select value={personType} onChange={setPersonType} options={PERSON_TYPES} />
            </Field>
            <InfoNote>
              <strong className="block font-semibold">¿Qué ocurre después?</strong>
              {firstName(c.name)} recibirá tu solicitud y podrá aceptarla o rechazarla. Si las dos estáis de acuerdo, se confirma el match y podréis organizar los detalles por el chat privado.
            </InfoNote>
            <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
              <Button type="submit" size="lg" icon={Send} className="sm:min-w-64">
                Enviar solicitud
              </Button>
              <Button variant="ghost" size="lg" to={`/cuidadoras/${c.id}`}>
                Cancelar
              </Button>
            </div>
          </form>
        </section>

        <aside aria-label={`Resumen de ${shortName(c.name)}`} className="card h-fit p-6">
          <div className="flex items-center gap-4">
            <Avatar name={c.name} photo={c.photo} size={88} />
            <div className="min-w-0">
              <h2 className="text-2xl font-bold">{shortName(c.name)}</h2>
              <div className="mt-1.5">
                <CaregiverBadges c={c} size="sm" />
              </div>
              <div className="mt-1.5">
                <Stars rating={c.rating} reviews={c.reviews} size="sm" />
              </div>
            </div>
          </div>
          <ul className="mt-6 space-y-3 border-t border-line pt-5">
            <li className={fact}>
              <CalendarDays aria-hidden className={icon} strokeWidth={2} />
              {yearsLabel(c.experienceYears)}
            </li>
            <li className={fact}>
              <GraduationCap aria-hidden className={icon} strokeWidth={2} />
              {c.training
                .map((t) => TRAINING_SHORT[t])
                .slice(0, 2)
                .join(' · ') || 'Sin formación indicada'}
            </li>
            <li className={fact}>
              <Heart aria-hidden className={icon} strokeWidth={2} />
              {care}
            </li>
            <li className={fact}>
              <MapPin aria-hidden className={icon} strokeWidth={2} />
              {c.zone}
            </li>
          </ul>
          <div className="mt-6 rounded-2xl bg-sunken p-4">
            <h3 className="font-semibold">Disponibilidad</h3>
            <p className="mb-3 text-ink-soft">{jornadaText(c)}</p>
            <DaysRow days={c.days} size="sm" />
          </div>
        </aside>
      </div>

      <section aria-labelledby="como-sigue" className="mt-8">
        <h2 id="como-sigue" className="text-2xl font-bold">
          ¿Cómo funciona?
        </h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { icon: Search, t: 'Buscas y eliges', d: 'Encuentra a la cuidadora que se adapta a ti.' },
            { icon: Send, t: 'Envías tu solicitud', d: 'Cuéntale tu necesidad y disponibilidad.' },
            { icon: Handshake, t: 'Hacéis match', d: 'Si las dos aceptáis, podréis hablar y organizar el cuidado.' },
          ].map((s, i) => (
            <li key={s.t} className={'flex items-start gap-4 rounded-[20px] p-5 ' + (i === 1 ? 'bg-accent-soft' : 'bg-surface shadow-card')}>
              <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-white tabular-nums">
                {i + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold">
                  <span className="sr-only">Paso {i + 1}: </span>
                  {s.t}
                  {i === 1 && <span className="ms-2 text-sm font-semibold text-accent">· Estás aquí</span>}
                </h3>
                <p className="text-ink-soft">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </Container>
  )
}
