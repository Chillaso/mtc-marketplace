import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, CheckCircle2, ChevronRight, ClipboardCheck, FileSearch, Handshake, Mail, Phone, Search, Send, ShieldCheck, User, UserCheck } from 'lucide-react'
import { Container } from '../components/Layout'
import { Button, Checkbox, Field, IconBubble, IconInput, InfoNote, Select, Textarea, TrustedBadge, VerifiedBadge } from '../components/ui'
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
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }))

  const submit = () => {
    const e: Record<string, string> = {}
    if (f.contactName.trim().length < 3) e.contactName = 'Indica tu nombre.'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Introduce un correo válido.'
    if (f.phone.replace(/\D/g, '').length < 9) e.phone = 'Introduce un teléfono de 9 cifras.'
    if (!f.zone) e.zone = 'Selecciona la zona.'
    if (!f.personType) e.personType = 'Indica a quién hay que cuidar.'
    if (!f.jornada) e.jornada = 'Selecciona la jornada.'
    if (!f.accept) e.accept = 'Necesitamos tu consentimiento para contactarte.'
    setErrors(e)
    if (Object.keys(e).length) return
    const { accept: _a, ...data } = f
    void _a
    addIntegral({ ...data, familyId: me.family?.id })
    setSent(true)
    window.scrollTo(0, 0)
  }

  if (sent)
    return (
      <Container className="max-w-2xl py-16 text-center">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand-100 text-brand-700"><CheckCircle2 className="size-10" /></span>
        <h1 className="mt-6 text-4xl font-bold">Hemos recibido tu solicitud</h1>
        <p className="mt-3 text-lg text-ink-soft">El equipo de María te Cuida revisará tu caso y se pondrá en contacto contigo para conocer mejor vuestras necesidades y proponerte cuidadoras.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {me.family ? <Button to="/familia" iconRight={ChevronRight}>Ir a mi cuenta</Button> : <Button to="/" iconRight={ChevronRight}>Volver al inicio</Button>}
          <Button variant="outline" to="/buscar" icon={Search}>Mientras tanto, ver cuidadoras</Button>
        </div>
      </Container>
    )

  return (
    <>
      <section className="bg-gradient-to-r from-brand-50 via-white to-rosa-50">
        <Container className="max-w-5xl py-10 sm:py-14">
          <IconBubble icon={Handshake} size="lg" />
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Quiero ayuda en la selección</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft">Cuéntanos qué necesitáis y el equipo de María te Cuida se encargará de buscar y seleccionar a la cuidadora más adecuada para tu familia.</p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Send, t: 'Nos cuentas tu caso', d: 'Rellena el formulario en 2 minutos.' },
              { icon: FileSearch, t: 'Buscamos y seleccionamos', d: 'Revisamos perfiles y hablamos con las candidatas.' },
              { icon: UserCheck, t: 'Te presentamos opciones', d: 'Eliges con nuestro asesoramiento.' },
            ].map((s) => (
              <li key={s.t} className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 shadow-card">
                <s.icon className="size-8 shrink-0 text-brand-600" strokeWidth={1.6} />
                <div><div className="font-semibold">{s.t}</div><div className="text-sm text-ink-soft">{s.d}</div></div>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <Container className="max-w-3xl py-10">
        <div className="card space-y-5 p-5 sm:p-8">
          <h2 className="text-2xl font-bold">Tu solicitud</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field error={errors.contactName}><IconInput icon={User} placeholder="Nombre y apellidos*" value={f.contactName} invalid={!!errors.contactName} onChange={(e) => set({ contactName: e.target.value })} /></Field>
            <Field error={errors.phone}><IconInput icon={Phone} type="tel" placeholder="Teléfono*" value={f.phone} invalid={!!errors.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
            <Field error={errors.email} className="sm:col-span-2"><IconInput icon={Mail} type="email" placeholder="Correo electrónico*" value={f.email} invalid={!!errors.email} onChange={(e) => set({ email: e.target.value })} /></Field>
            <Field label="Zona" required error={errors.zone}><Select value={f.zone} onChange={(zone) => set({ zone })} options={ZONES} placeholder="Selecciona" invalid={!!errors.zone} /></Field>
            <Field label="¿A quién hay que cuidar?" required error={errors.personType}><Select value={f.personType} onChange={(personType) => set({ personType })} options={PERSON_TYPES} placeholder="Selecciona" invalid={!!errors.personType} /></Field>
            <Field label="Jornada" required error={errors.jornada}><Select value={f.jornada} onChange={(jornada) => set({ jornada })} options={JORNADAS} placeholder="Selecciona" invalid={!!errors.jornada} /></Field>
            <Field label="¿Cuándo?"><Select value={f.start} onChange={(start) => set({ start })} options={START_OPTIONS.filter((o) => o.id !== 'fecha')} placeholder="Selecciona" /></Field>
          </div>
          <Field label="¿Qué cuidados necesitáis?">
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
          <Button size="lg" block icon={Send} onClick={submit}>Enviar solicitud</Button>
        </div>
      </Container>
    </>
  )
}

export function Trust() {
  return (
    <Container className="max-w-5xl py-10 sm:py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">Documentación y confianza</h1>
      <p className="mt-3 max-w-3xl text-lg text-ink-soft">En cada perfil distinguimos dos cosas diferentes, para que las familias sepan exactamente qué significa cada una.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section className="card p-6 sm:p-8">
          <IconBubble icon={ClipboardCheck} size="lg" />
          <h2 className="mt-4 text-2xl font-bold">Documentación revisada</h2>
          <div className="mt-2"><VerifiedBadge /></div>
          <p className="mt-4 text-ink-soft">Durante el registro, cada cuidadora aporta su documento de identidad y, si es extranjera, la autorización para trabajar en España. También firma una declaración responsable. El equipo revisa los documentos aportados.</p>
          <ul className="mt-4 space-y-2 text-[15px]">
            {['Documento de identidad (DNI, pasaporte o equivalente)', 'Permiso de residencia y trabajo, TIE u otra autorización válida', 'Declaración responsable firmada', 'Certificados de formación (opcional)'].map((x) => (
              <li key={x} className="flex gap-2"><BadgeCheck className="size-5 shrink-0 text-brand-600" />{x}</li>
            ))}
          </ul>
        </section>
        <section className="card bg-gradient-to-br from-white to-brand-50 p-6 sm:p-8">
          <IconBubble icon={ShieldCheck} size="lg" />
          <h2 className="mt-4 text-2xl font-bold">Cuidadora de confianza María te Cuida</h2>
          <div className="mt-2"><TrustedBadge /></div>
          <p className="mt-4 text-ink-soft">Es un distintivo que se concede a profesionales que <strong className="text-ink">ya han trabajado con familias a través de la plataforma</strong> y cuyo trabajo ha sido <strong className="text-ink">valorado positivamente por el equipo</strong>.</p>
          <InfoNote>No equivale a tener la documentación revisada: son indicadores independientes.</InfoNote>
        </section>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button to="/buscar" icon={Search}>Buscar cuidadoras</Button>
        <Link to="/registro/cuidadora" className="inline-flex h-11 items-center gap-2 px-3 font-semibold text-brand-800 underline decoration-brand-400 decoration-2 underline-offset-4">Soy cuidadora, quiero registrarme</Link>
      </div>
    </Container>
  )
}

export function NotFound() {
  return (
    <Container className="max-w-xl py-20 text-center">
      <h1 className="text-5xl font-bold">Página no encontrada</h1>
      <p className="mt-3 text-lg text-ink-soft">La página que buscas no existe o se ha movido.</p>
      <Button to="/" className="mt-8">Volver al inicio</Button>
    </Container>
  )
}
