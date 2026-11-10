import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BriefcaseBusiness, ChevronRight, Eye, EyeOff, Lock, Mail, Phone, User, Users } from 'lucide-react'
import { Container } from '../components/Layout'
import { Button, Field, IconInput, InfoNote, Select } from '../components/ui'
import { useStore } from '../store'
import { PERSON_TYPES, ZONES } from '../data/catalog'
import { img } from '../lib/format'

export function PasswordInput({ value, onChange, invalid }: { value: string; onChange: (v: string) => void; invalid?: boolean }) {
  const [show, setShow] = useState(false)
  return (
    <IconInput
      icon={Lock}
      type={show ? 'text' : 'password'}
      placeholder="Contraseña*"
      autoComplete="new-password"
      value={value}
      invalid={invalid}
      onChange={(e) => onChange(e.target.value)}
      right={
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="rounded-full p-1.5 text-ink hover:bg-brand-50">
          {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
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

  const enter = (role: 'family' | 'caregiver', id?: string) => {
    loginAs(role, id)
    const name = role === 'family' ? state.families.find((f) => f.id === id)?.contactName ?? 'Lucía' : state.caregivers.find((c) => c.id === id)?.name ?? 'Ana'
    toast(`Hola, ${name.split(' ')[0]}. Has iniciado sesión.`)
    navigate(next ?? (role === 'family' ? '/familia' : '/cuidadora'))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const em = email.trim().toLowerCase()
    if (!em || !password) return setError('Introduce tu correo y tu contraseña.')
    const fam = state.families.find((f) => f.email.toLowerCase() === em)
    if (fam) return enter('family', fam.id)
    const cg = state.caregivers.find((c) => c.email.toLowerCase() === em)
    if (cg) return enter('caregiver', cg.id)
    setError('No encontramos ninguna cuenta con ese correo. Prueba con los accesos de demostración.')
  }

  return (
    <Container className="grid max-w-5xl gap-10 py-10 md:grid-cols-[1fr_1fr] md:py-16">
      <div>
        <h1 className="text-4xl font-bold text-brand-950">Iniciar sesión</h1>
        <p className="mt-2 text-lg text-ink-soft">Accede a tu cuenta de familia o de cuidadora.</p>
        <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
          <IconInput icon={Mail} type="email" placeholder="Correo electrónico*" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <PasswordInput value={password} onChange={setPassword} />
          {error && <p className="text-sm font-medium text-rosa-600">{error}</p>}
          <Button type="submit" block size="lg" iconRight={ChevronRight}>Entrar</Button>
        </form>
        <p className="mt-6 text-ink-soft">
          ¿No tienes cuenta?{' '}
          <Link to="/registro/familia" className="font-semibold text-brand-800 underline decoration-brand-400 decoration-2 underline-offset-4">Soy una familia</Link>
          {' · '}
          <Link to="/registro/cuidadora" className="font-semibold text-brand-800 underline decoration-brand-400 decoration-2 underline-offset-4">Soy cuidadora</Link>
        </p>
      </div>
      <div className="card h-fit bg-gradient-to-br from-brand-50 to-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Accesos de demostración</h2>
        <p className="mt-1 text-ink-soft">Entra directamente con una cuenta de ejemplo. Puedes cambiar de rol en cualquier momento con el botón «Demo».</p>
        <div className="mt-5 space-y-3">
          <button type="button" onClick={() => enter('family', 'fam-martinez')} className="flex w-full items-center gap-4 rounded-2xl border border-line bg-white p-4 text-left transition hover:border-brand-400 hover:shadow-card">
            <span className="flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-700"><Users className="size-6" /></span>
            <span className="flex-1">
              <span className="block font-semibold">Entrar como familia</span>
              <span className="text-sm text-muted">Lucía Martínez · El Puerto</span>
            </span>
            <ChevronRight className="size-5 text-muted" />
          </button>
          <button type="button" onClick={() => enter('caregiver', 'ana-g')} className="flex w-full items-center gap-4 rounded-2xl border border-line bg-white p-4 text-left transition hover:border-rosa-300 hover:shadow-card">
            <span className="flex size-12 items-center justify-center rounded-full bg-rosa-100 text-rosa-600"><BriefcaseBusiness className="size-6" /></span>
            <span className="flex-1">
              <span className="block font-semibold">Entrar como cuidadora</span>
              <span className="text-sm text-muted">Ana García · Jerez</span>
            </span>
            <ChevronRight className="size-5 text-muted" />
          </button>
        </div>
      </div>
    </Container>
  )
}

export function FamilyRegister() {
  const { registerFamily, toast } = useStore()
  const navigate = useNavigate()
  const [f, setF] = useState({ contactName: '', email: '', password: '', phone: '', zone: '', personType: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (f.contactName.trim().length < 3) er.contactName = 'Indica tu nombre y apellidos.'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = 'Introduce un correo válido.'
    if (f.password.length < 6) er.password = 'La contraseña debe tener al menos 6 caracteres.'
    if (f.phone.replace(/\D/g, '').length < 9) er.phone = 'Introduce un teléfono de 9 cifras.'
    if (!f.zone) er.zone = 'Selecciona tu zona.'
    setErrors(er)
    if (Object.keys(er).length) return
    const last = f.contactName.trim().split(' ').slice(1).join(' ') || f.contactName.trim()
    registerFamily({ name: `Familia ${last.split(' ')[0]}`, contactName: f.contactName.trim(), email: f.email, phone: f.phone, zone: f.zone, personType: f.personType || 'mayor' })
    toast('Cuenta creada. ¡Bienvenida a María te Cuida!')
    navigate('/buscar')
  }

  return (
    <Container className="grid max-w-6xl items-center gap-10 py-10 md:grid-cols-[0.9fr_1.1fr] md:py-14">
      <img src={img("manos.jpg")} alt="" className="hidden aspect-[4/5] w-full rounded-[40%_60%_20%_50%/30%_30%_30%_40%] object-cover shadow-pop md:block" />
      <div>
        <h1 className="text-4xl font-bold text-brand-950 sm:text-5xl">Registro de familia</h1>
        <p className="mt-3 text-lg text-ink-soft">Crea tu cuenta para guardar favoritas, enviar solicitudes y hablar con las cuidadoras.</p>
        <form onSubmit={submit} noValidate className="mt-8 space-y-4">
          <Field error={errors.contactName}><IconInput icon={User} placeholder="Nombre y apellidos*" value={f.contactName} invalid={!!errors.contactName} onChange={(e) => set('contactName')(e.target.value)} /></Field>
          <Field error={errors.email}><IconInput icon={Mail} type="email" placeholder="Correo electrónico*" value={f.email} invalid={!!errors.email} onChange={(e) => set('email')(e.target.value)} /></Field>
          <Field error={errors.password}><PasswordInput value={f.password} onChange={set('password')} invalid={!!errors.password} /></Field>
          <Field error={errors.phone}><IconInput icon={Phone} type="tel" placeholder="Teléfono*" value={f.phone} invalid={!!errors.phone} onChange={(e) => set('phone')(e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tu zona" required error={errors.zone}><Select value={f.zone} onChange={set('zone')} options={ZONES} placeholder="Selecciona" invalid={!!errors.zone} /></Field>
            <Field label="¿A quién hay que cuidar?"><Select value={f.personType} onChange={set('personType')} options={PERSON_TYPES} placeholder="Selecciona" /></Field>
          </div>
          <InfoNote>Tus datos de contacto no se muestran a las cuidadoras hasta que hacéis match.</InfoNote>
          <Button type="submit" block size="lg" iconRight={ChevronRight}>Crear cuenta</Button>
          <p className="text-center text-ink-soft">
            ¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-brand-800 underline decoration-brand-400 decoration-2 underline-offset-4">Iniciar sesión</Link>
          </p>
        </form>
      </div>
    </Container>
  )
}
