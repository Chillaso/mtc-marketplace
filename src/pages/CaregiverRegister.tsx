import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, ChevronRight, PartyPopper, Wand2 } from 'lucide-react'
import { Container } from '../components/Layout'
import { Button } from '../components/ui'
import { emptyDraft, STEPS, StepHeader, validateStep } from '../components/CaregiverForm'
import { useStore, type CaregiverDraft } from '../store'
import { cx, uid } from '../lib/format'

/** Datos de ejemplo para rellenar cada paso rápidamente durante una demo. */
function sampleFor(step: number, d: CaregiverDraft): Partial<CaregiverDraft> {
  switch (step) {
    case 1:
      return { name: 'Rosario Jiménez Alba', email: 'rosario.jimenez@ejemplo.com', password: 'demo1234', phone: '644 556 677' }
    case 2:
      return d.documents.length
        ? {}
        : { documents: [{ id: uid('doc'), kind: d.spanish ? 'DNI (anverso y reverso)' : 'Pasaporte o documento de identidad', fileName: 'dni_rosario.pdf', status: 'pendiente', uploadedAt: new Date().toISOString() }] }
    case 3:
      return { declarationSignedAt: new Date().toISOString() }
    case 4:
      return {
        experienceYears: 3,
        careTypes: ['mayores', 'dependencia'],
        illnesses: ['diabetes', 'ictus'],
        workplaces: ['domicilio'],
        experienceText: 'He cuidado durante cuatro años a una señora mayor con diabetes en su casa de Jerez, ayudándola con la higiene, las comidas y la medicación.',
      }
    case 5:
      return { tasks: { aseo: ['Ducha o baño asistido'], alimentacion: ['Dar de comer'], medicacion: ['Recordar tomas', 'Control de glucosa'], acompanamiento: ['Citas médicas', 'Paseos'] } }
    case 6:
      return { training: ['sociosanitaria', 'primeros'], jornadas: ['parcial', 'horas'], zone: 'Jerez', extraZones: ['El Puerto'], drivingLicense: true, about: 'Soy una persona paciente y alegre. Me gusta que la persona a la que cuido se sienta acompañada.' }
  }
  return {}
}

export default function CaregiverRegister() {
  const { registerCaregiver } = useStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [d, setD] = useState<CaregiverDraft>(emptyDraft)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  const set = (patch: Partial<CaregiverDraft>) => {
    setD((prev) => ({ ...prev, ...patch }))
    if (Object.keys(errors).length) setErrors({})
  }

  const next = () => {
    const e = validateStep(step, d)
    setErrors(e)
    if (Object.keys(e).length) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (step < 6) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    } else {
      registerCaregiver({ ...d, documents: d.documents.map((x) => ({ ...x, status: 'en_revision' })) })
      setDone(true)
      window.scrollTo(0, 0)
    }
  }

  if (done)
    return (
      <Container className="max-w-2xl py-16 text-center">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <PartyPopper className="size-10" />
        </span>
        <h1 className="mt-6 text-4xl font-bold">¡Registro completado!</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Tu perfil ya está creado. El equipo de María te Cuida revisará tu documentación; mientras tanto, las familias ya pueden encontrarte en el buscador.
        </p>
        <Button size="lg" className="mt-8" iconRight={ChevronRight} onClick={() => navigate('/cuidadora')}>
          Ir a mi cuenta
        </Button>
      </Container>
    )

  const { Comp, title, subtitle, icon } = STEPS[step - 1]

  return (
    <Container className="max-w-6xl py-6 sm:py-10">
      {/* Progreso */}
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        <span className="font-semibold whitespace-nowrap">
          Paso {step} de {STEPS.length}
        </span>
        <div className="flex flex-1 justify-end gap-1.5 sm:max-w-sm" aria-hidden>
          {STEPS.map((_, i) => (
            <span key={i} className={cx('h-2.5 flex-1 rounded-full transition', i < step ? 'bg-brand-600' : 'bg-slate-200')} />
          ))}
        </div>
      </div>

      <div className={cx('mx-auto mt-8 grid gap-10', step === 1 ? 'max-w-5xl md:grid-cols-[0.8fr_1fr]' : 'max-w-3xl')}>
        {step === 1 && (
          <div className="relative hidden md:block">
            <div className="absolute -inset-4 rounded-[50%_50%_45%_55%/40%_40%_60%_60%] bg-gradient-to-br from-brand-100 to-rosa-100" />
            <img src="/img/registro.jpg" alt="Cuidadora sonriendo junto a una persona mayor" className="relative aspect-[440/690] w-full rounded-[44%_44%_38%_38%/26%_26%_22%_22%] object-cover" />
          </div>
        )}
        <div className="min-w-0">
          <StepHeader icon={icon} title={title} subtitle={subtitle} />
          <Comp d={d} set={set} errors={errors} />

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:gap-4">
            {step > 1 && (
              <Button variant="outline" size="lg" icon={ArrowLeft} onClick={() => { setStep(step - 1); setErrors({}); window.scrollTo(0, 0) }} className="sm:min-w-44">
                Anterior
              </Button>
            )}
            <Button size="lg" className="sm:flex-1" iconRight={step === 6 ? Check : ChevronRight} onClick={next}>
              {step === 3 ? 'Firmar y continuar' : step === 6 ? 'Finalizar registro' : 'Continuar'}
            </Button>
          </div>
          {step === 1 && (
            <p className="mt-6 text-center text-ink-soft">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-semibold text-brand-800 underline decoration-brand-400 decoration-2 underline-offset-4">
                Iniciar sesión
              </Link>
            </p>
          )}
          <div className="mt-6 text-center">
            <button type="button" onClick={() => set(sampleFor(step, d))} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted hover:bg-brand-50 hover:text-brand-800">
              <Wand2 className="size-4" />
              Rellenar con datos de ejemplo (demo)
            </button>
          </div>
        </div>
      </div>
    </Container>
  )
}
