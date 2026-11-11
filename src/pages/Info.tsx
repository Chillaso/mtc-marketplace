import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, CheckCircle2, ChevronRight, ClipboardCheck, FileSearch, Handshake, Mail, Phone, Search, Send, ShieldCheck, User, UserCheck } from 'lucide-react'
import { Container } from '../components/Layout'
import { Button, Checkbox, ErrorSummary, Field, FormNote, IconBubble, IconInput, InfoNote, PageTitle, Select, Textarea, TrustedBadge, VerifiedBadge } from '../components/ui'
import { useMe, useStore } from '../store'
import { JORNADAS, PERSON_TYPES, START_OPTIONS, TASKS, ZONES } from '../data/catalog'

export function IntegralService() {
  const { addIntegral } = useStore()
  const me = useMe()
  const [sent, setSent] = useState(false)
  const [f, setF] = useState({
    contactName: me.family?.contactName ?? '',
    email: me.family?.email ?? '',
    phone: me.family?.phone ?? '',
    zone: me.family?.zone ?? '',
    personType: me.family?.personType ?? '',
    tasks: [] as string[],
    jornada: '',
    start: '',
    details: '',
    accept: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const summaryRef = useRef<HTMLDivElement>(null)
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }))

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const e: Record<string, string> = {}
    if (f.contactName.trim().length < 3) e.contactName = 'Escribe tu nombre.'
    if (f.phone.replace(/\D/g, '').length < 9) e.phone = 'Escribe un teléfono de 9 cifras.'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Escribe un correo con el formato nombre@ejemplo.com.'
    if (!f.zone) e.zone = 'Selecciona la zona.'
    if (!f.personType) e.personType = 'Indica a quién hay que cuidar.'
    if (!f.jornada) e.jornada = 'Selecciona la jornada.'
    if (!f.accept) e.accept = 'Marca la casilla para que el equipo pueda contactarte.'
    setErrors(e)
    if (Object.keys(e).length) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    const { accept: _a, ...data } = f
    void _a
    addIntegral({ ...data, familyId: me.family?.id })
    setSent(true)
    window.scrollTo(0, 0)
    requestAnimationFrame(() => {
      const h1 = document.querySelector<HTMLElement>('main h1')
      h1?.setAttribute('tabindex', '-1')
      h1?.focus({ preventScroll: true })
    })
  }

  if (sent)
    return (
      <Container className="max-w-2xl py-16 text-center">
        <span aria-hidden className="animate-enter mx-auto flex size-20 items-center justify-center rounded-full bg-ok-soft text-ok">
          <CheckCircle2 className="size-10" strokeWidth={1.75} />
        </span>
        <h1 className="animate-enter animate-enter-2 mt-6 text-4xl font-bold">Hemos recibido tu solicitud</h1>
        <p className="animate-enter animate-enter-2 mt-3 text-lg text-ink-soft">El equipo de María te Cuida revisará tu caso y se pondrá en contacto contigo para conocer mejor vuestras necesidades y proponerte cuidadoras.</p>
        <div className="animate-enter animate-enter-3 mt-8 flex flex-wrap justify-center gap-3">
          {me.family ? (
            <Button to="/familia" iconRight={ChevronRight}>
              Ir a mi cuenta
            </Button>
          ) : (
            <Button to="/" iconRight={ChevronRight}>
              Volver al inicio
            </Button>
          )}
          <Button variant="outline" to="/buscar" icon={Search}>
            Mientras tanto, ver cuidadoras
          </Button>
        </div>
      </Container>
    )

  return (
    <>
      <section className="border-b border-line bg-surface">
        <Container className="max-w-5xl py-10 sm:py-14">
          <IconBubble icon={Handshake} size="lg" tone="rosa" />
          <h1 className="mt-5 text-4xl font-bold sm:text-5xl">Quiero ayuda en la selección</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft">Cuéntanos qué necesitáis y el equipo de María te Cuida se encargará de buscar y seleccionar a la cuidadora más adecuada para tu familia.</p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Send, t: 'Nos cuentas tu caso', d: 'Rellena el formulario en 2 minutos.' },
              { icon: FileSearch, t: 'Buscamos y seleccionamos', d: 'Revisamos perfiles y hablamos con las candidatas.' },
              { icon: UserCheck, t: 'Te presentamos opciones', d: 'Eliges con nuestro asesoramiento.' },
            ].map((s, i) => (
              <li key={s.t} className="flex items-start gap-3 rounded-[20px] bg-canvas p-4">
                <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-white tabular-nums">
                  {i + 1}
                </span>
                <div>
                  <div className="font-semibold">
                    <span className="sr-only">Paso {i + 1}: </span>
                    {s.t}
                  </div>
                  <div className="text-ink-soft">{s.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <Container className="max-w-3xl py-10">
        <form onSubmit={submit} noValidate className="card space-y-6 p-5 sm:p-8">
          <div>
            <h2 className="text-2xl font-bold">Tu solicitud</h2>
            <div className="mt-2">
              <FormNote />
            </div>
          </div>
          <ErrorSummary ref={summaryRef} errors={errors} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre y apellidos" required error={errors.contactName}>
              <IconInput icon={User} autoComplete="name" value={f.contactName} onChange={(e) => set({ contactName: e.target.value })} />
            </Field>
            <Field label="Teléfono" required error={errors.phone}>
              <IconInput icon={Phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="600 000 000" value={f.phone} onChange={(e) => set({ phone: e.target.value })} />
            </Field>
            <Field label="Correo electrónico" required error={errors.email} className="sm:col-span-2">
              <IconInput icon={Mail} type="email" inputMode="email" autoComplete="email" placeholder="nombre@ejemplo.com" value={f.email} onChange={(e) => set({ email: e.target.value })} />
            </Field>
            <Field label="Zona" required error={errors.zone}>
              <Select value={f.zone} onChange={(zone) => set({ zone })} options={ZONES} placeholder="Selecciona" />
            </Field>
            <Field label="¿A quién hay que cuidar?" required error={errors.personType}>
              <Select value={f.personType} onChange={(personType) => set({ personType })} options={PERSON_TYPES} placeholder="Selecciona" />
            </Field>
            <Field label="Jornada" required error={errors.jornada}>
              <Select value={f.jornada} onChange={(jornada) => set({ jornada })} options={JORNADAS} placeholder="Selecciona" />
            </Field>
            <Field label="¿Cuándo?">
              <Select value={f.start} onChange={(start) => set({ start })} options={START_OPTIONS.filter((o) => o.id !== 'fecha')} placeholder="Selecciona" />
            </Field>
          </div>
          <Field group label="¿Qué cuidados necesitáis?">
            <div className="grid gap-x-6 sm:grid-cols-2">
              {TASKS.map((t) => (
                <Checkbox key={t.id} checked={f.tasks.includes(t.id)} onChange={() => set({ tasks: f.tasks.includes(t.id) ? f.tasks.filter((x) => x !== t.id) : [...f.tasks, t.id] })} label={t.label} />
              ))}
            </div>
          </Field>
          <Field label="Cuéntanos un poco más">
            <Textarea value={f.details} onChange={(details) => set({ details })} max={600} rows={4} placeholder="Situación de la persona, horarios, qué es lo más importante para vosotros…" />
          </Field>
          <Field error={errors.accept}>
            <Checkbox checked={f.accept} onChange={(accept) => set({ accept })} label="Acepto que el equipo de María te Cuida me contacte para gestionar esta solicitud." />
          </Field>
          <InfoNote>Las condiciones y el precio del servicio integral se concretarán con el equipo antes de empezar.</InfoNote>
          <Button type="submit" size="lg" block icon={Send}>
            Enviar solicitud
          </Button>
        </form>
      </Container>
    </>
  )
}

export function Trust() {
  return (
    <Container className="max-w-5xl py-10 sm:py-14">
      <PageTitle title="Documentación y confianza" subtitle="En cada perfil distinguimos dos cosas diferentes, para que las familias sepan exactamente qué significa cada una." />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section className="card p-6 sm:p-8">
          <IconBubble icon={ClipboardCheck} size="lg" />
          <h2 className="mt-5 text-2xl font-bold">Documentación revisada</h2>
          <div className="mt-3">
            <VerifiedBadge />
          </div>
          <p className="mt-4 text-ink-soft">Durante el registro, cada cuidadora aporta su documento de identidad y, si es extranjera, la autorización para trabajar en España. También firma una declaración responsable. El equipo revisa los documentos aportados.</p>
          <ul className="mt-5 space-y-2.5">
            {['Documento de identidad (DNI, pasaporte o equivalente)', 'Permiso de residencia y trabajo, TIE u otra autorización válida', 'Declaración responsable firmada', 'Certificados de formación (opcional)'].map((x) => (
              <li key={x} className="flex gap-3">
                <BadgeCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-accent-icon" strokeWidth={2} />
                {x}
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-6 sm:p-8">
          <IconBubble icon={ShieldCheck} size="lg" />
          <h2 className="mt-5 text-2xl font-bold">Cuidadora de confianza María te Cuida</h2>
          <div className="mt-3">
            <TrustedBadge />
          </div>
          <p className="mt-4 text-ink-soft">
            Es un distintivo que se concede a profesionales que <strong className="font-semibold text-ink">ya han trabajado con familias a través de la plataforma</strong> y cuyo trabajo ha sido{' '}
            <strong className="font-semibold text-ink">valorado positivamente por el equipo</strong>.
          </p>
          <div className="mt-5">
            <InfoNote>No equivale a tener la documentación revisada: son indicadores independientes.</InfoNote>
          </div>
        </section>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button to="/buscar" icon={Search}>
          Buscar cuidadoras
        </Button>
        <Link to="/registro/cuidadora" className="link inline-flex min-h-12 items-center px-3">
          Soy cuidadora y quiero registrarme
        </Link>
      </div>
    </Container>
  )
}

export function NotFound() {
  return (
    <Container className="max-w-xl py-20 text-center">
      <p className="text-6xl font-bold text-accent-line" aria-hidden>
        404
      </p>
      <h1 className="mt-4 text-4xl font-bold">Página no encontrada</h1>
      <p className="mt-3 text-lg text-ink-soft">La página que buscas no existe o se ha movido.</p>
      <Button to="/" className="mt-8">
        Volver al inicio
      </Button>
    </Container>
  )
}
