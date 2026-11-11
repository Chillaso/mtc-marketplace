import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BriefcaseBusiness, ChevronRight, Eye, EyeOff, Lock, LogIn, Mail, Phone, User, Users } from 'lucide-react'
import { Container } from '../components/Layout'
import { Button, ErrorSummary, Field, FormNote, IconInput, InfoNote, Select } from '../components/ui'
import { useStore } from '../store'
import { PERSON_TYPES, ZONES } from '../data/catalog'
import { img } from '../lib/format'

export function PasswordInput({ value, onChange, autoComplete = 'new-password' }: { value: string; onChange: (v: string) => void; autoComplete?: string }) {
  const [show, setShow] = useState(false)
  return (
    <IconInput
      icon={Lock}
      type={show ? 'text' : 'password'}
      autoComplete={autoComplete}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      right={
        <button type="button" onClick={() => setShow(!show)} aria-pressed={show} aria-label="Mostrar contraseña" className="flex size-11 items-center justify-center rounded-full text-ink-soft hover:bg-sunken hover:text-ink">
          {show ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
        </button>
      }
    />
  )
}

export function Login() {
  const { state, loginAs, toast } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const errorRef = useRef<HTMLParagraphElement>(null)

  const enter = (role: 'family' | 'caregiver', id?: string) => {
    loginAs(role, id)
    const name = role === 'family' ? (state.families.find((f) => f.id === id)?.contactName ?? 'Lucía') : (state.caregivers.find((c) => c.id === id)?.name ?? 'Ana')
    toast(`Hola, ${name.split(' ')[0]}. Has iniciado sesión.`)
    navigate(next ?? (role === 'family' ? '/familia' : '/cuidadora'))
  }

  const fail = (msg: string) => {
    setError(msg)
    requestAnimationFrame(() => errorRef.current?.focus())
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const em = email.trim().toLowerCase()
    if (!em || !password) return fail('Escribe tu correo y tu contraseña.')
    const fam = state.families.find((f) => f.email.toLowerCase() === em)
    if (fam) return enter('family', fam.id)
    const cg = state.caregivers.find((c) => c.email.toLowerCase() === em)
    if (cg) return enter('caregiver', cg.id)
    fail('No encontramos ninguna cuenta con ese correo. Revisa que esté bien escrito o usa los accesos de demostración.')
  }

  return (
    <Container className="grid max-w-5xl items-start gap-8 py-10 md:grid-cols-2 md:gap-12 md:py-16">
      <div>
        <h1 className="text-4xl font-bold text-accent-strong">Iniciar sesión</h1>
        <p className="mt-2 text-lg text-ink-soft">Accede a tu cuenta de familia o de cuidadora.</p>
        <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
          {error && (
            <p ref={errorRef} tabIndex={-1} role="alert" className="rounded-2xl border-2 border-care bg-care-subtle px-4 py-3 font-medium text-care">
              {error}
            </p>
          )}
          <Field label="Correo electrónico">
            <IconInput icon={Mail} type="email" inputMode="email" autoComplete="email" placeholder="nombre@ejemplo.com" value={email} invalid={!!error && !email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Contraseña">
            <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
          </Field>
          <Button type="submit" block size="lg" icon={LogIn}>
            Entrar
          </Button>
        </form>
        <p className="mt-7 text-ink-soft">
          ¿No tienes cuenta?{' '}
          <Link to="/registro/familia" className="link">
            Regístrate como familia
          </Link>{' '}
          o{' '}
          <Link to="/registro/cuidadora" className="link">
            como cuidadora
          </Link>
          .
        </p>
      </div>
      <section aria-labelledby="demo-title" className="card bg-accent-subtle p-6 sm:p-8">
        <h2 id="demo-title" className="text-xl font-semibold">
          Accesos de demostración
        </h2>
        <p className="mt-1 text-ink-soft">Entra directamente con una cuenta de ejemplo. Puedes cambiar de rol en cualquier momento con el botón «Demo».</p>
        <div className="mt-5 space-y-3">
          {[
            { role: 'family' as const, id: 'fam-martinez', icon: Users, t: 'Entrar como familia', s: 'Lucía Martínez · El Puerto', tone: 'bg-accent-soft text-accent' },
            { role: 'caregiver' as const, id: 'ana-g', icon: BriefcaseBusiness, t: 'Entrar como cuidadora', s: 'Ana García · Jerez', tone: 'bg-care-soft text-care' },
          ].map((x) => (
            <button key={x.id} type="button" onClick={() => enter(x.role, x.id)} className="pressable flex w-full items-center gap-4 rounded-2xl border border-transparent bg-surface p-4 text-start shadow-card hover:shadow-card-hover">
              <span aria-hidden className={'flex size-12 shrink-0 items-center justify-center rounded-full ' + x.tone}>
                <x.icon className="size-6" strokeWidth={2} />
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{x.t}</span>
                <span className="text-sm text-ink-soft">{x.s}</span>
              </span>
              <ChevronRight aria-hidden className="size-5 text-ink-soft" />
            </button>
          ))}
        </div>
      </section>
    </Container>
  )
}

export function FamilyRegister() {
  const { registerFamily, toast } = useStore()
  const navigate = useNavigate()
  const [f, setF] = useState({ contactName: '', email: '', password: '', phone: '', zone: '', personType: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const summaryRef = useRef<HTMLDivElement>(null)
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (f.contactName.trim().length < 3) er.contactName = 'Escribe tu nombre y apellidos.'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = 'Escribe un correo con el formato nombre@ejemplo.com.'
    if (f.password.length < 6) er.password = 'Elige una contraseña de al menos 6 caracteres.'
    if (f.phone.replace(/\D/g, '').length < 9) er.phone = 'Escribe un teléfono de 9 cifras.'
    if (!f.zone) er.zone = 'Selecciona tu zona.'
    setErrors(er)
    if (Object.keys(er).length) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    const last = f.contactName.trim().split(' ').slice(1).join(' ') || f.contactName.trim()
    registerFamily({ name: `Familia ${last.split(' ')[0]}`, contactName: f.contactName.trim(), email: f.email, phone: f.phone, zone: f.zone, personType: f.personType || 'mayor' })
    toast('Cuenta creada. Te damos la bienvenida a María te Cuida.')
    navigate('/buscar')
  }

  return (
    <Container className="grid max-w-6xl items-start gap-10 py-10 md:grid-cols-[0.85fr_1.15fr] md:py-14">
      <div className="relative hidden md:block">
        <span aria-hidden className="absolute -top-5 -left-5 size-40 rounded-full bg-care-soft" />
        <img src={img('manos.jpg')} alt="" className="relative aspect-[4/5] w-full rounded-[32px] object-cover outline outline-1 -outline-offset-1 outline-black/10" />
      </div>
      <div>
        <h1 className="text-4xl font-bold text-accent-strong sm:text-5xl">Crea tu cuenta de familia</h1>
        <p className="mt-3 text-lg text-ink-soft">Así podrás guardar favoritas, enviar solicitudes y hablar con las cuidadoras.</p>
        <form onSubmit={submit} noValidate className="mt-8 space-y-5">
          <ErrorSummary ref={summaryRef} errors={errors} />
          <FormNote />
          <Field label="Nombre y apellidos" required error={errors.contactName}>
            <IconInput icon={User} autoComplete="name" value={f.contactName} onChange={(e) => set('contactName')(e.target.value)} />
          </Field>
          <Field label="Correo electrónico" required error={errors.email}>
            <IconInput icon={Mail} type="email" inputMode="email" autoComplete="email" placeholder="nombre@ejemplo.com" value={f.email} onChange={(e) => set('email')(e.target.value)} />
          </Field>
          <Field label="Contraseña" required hint="Al menos 6 caracteres." error={errors.password}>
            <PasswordInput value={f.password} onChange={set('password')} />
          </Field>
          <Field label="Teléfono" required error={errors.phone}>
            <IconInput icon={Phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="600 000 000" value={f.phone} onChange={(e) => set('phone')(e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Tu zona" required error={errors.zone}>
              <Select value={f.zone} onChange={set('zone')} options={ZONES} placeholder="Selecciona" />
            </Field>
            <Field label="¿A quién hay que cuidar?">
              <Select value={f.personType} onChange={set('personType')} options={PERSON_TYPES} placeholder="Selecciona" />
            </Field>
          </div>
          <InfoNote>Tus datos de contacto no se muestran a las cuidadoras hasta que hacéis match.</InfoNote>
          <Button type="submit" block size="lg" iconRight={ChevronRight}>
            Crear cuenta
          </Button>
          <p className="text-center text-ink-soft">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="link">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </Container>
  )
}
