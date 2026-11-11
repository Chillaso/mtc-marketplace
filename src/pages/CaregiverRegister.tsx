import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, ChevronRight, PartyPopper, Wand2 } from 'lucide-react'
import { Container } from '../components/Layout'
import { Button, ErrorSummary, FormNote } from '../components/ui'
import { emptyDraft, STEPS, StepHeader, validateStep } from '../components/CaregiverForm'
import { useStore, type CaregiverDraft } from '../store'
import { cx, img, uid } from '../lib/format'

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

/** Progreso: lista de pasos con el actual marcado (aria-current) y barra para pantallas pequeñas. */
function Stepper({ step }: { step: number }) {
  return (
    <nav aria-label="Progreso del registro" className="mx-auto max-w-4xl">
      <p className="font-semibold sm:hidden">
        Paso {step} de {STEPS.length}: <span className="font-normal text-ink-soft">{STEPS[step - 1].short}</span>
      </p>
      <div aria-hidden className="mt-2 flex gap-1.5 sm:hidden">
        {STEPS.map((_, i) => (
          <span key={i} className={cx('h-2 flex-1 rounded-full', i < step ? 'bg-accent' : 'bg-line')} />
        ))}
      </div>
      <ol className="hidden grid-cols-6 gap-2 sm:grid">
        {STEPS.map((s, i) => {
          const n = i + 1
          const done = n < step
          const current = n === step
          return (
            <li key={s.short} aria-current={current ? 'step' : undefined} className="flex flex-col gap-2">
              <span aria-hidden className={cx('h-1.5 rounded-full transition-[background-color] duration-300', n <= step ? 'bg-accent' : 'bg-line')} />
              <span className={cx('flex items-center gap-2 text-sm', current ? 'font-semibold text-ink' : done ? 'text-ink-soft' : 'text-muted')}>
                <span
                  aria-hidden
                  className={cx(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums',
                    done ? 'bg-accent text-white' : current ? 'border-2 border-accent text-accent' : 'border-2 border-line text-muted',
                  )}
                >
                  {done ? <Check className="size-3.5" strokeWidth={3} /> : n}
                </span>
                <span className="min-w-0">
                  <span className="sr-only">
                    Paso {n}
                    {done ? ', completado' : ''}:{' '}
                  </span>
                  {s.short}
                </span>
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default function CaregiverRegister() {
  const { registerCaregiver } = useStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [d, setD] = useState<CaregiverDraft>(emptyDraft)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)

  // Al cambiar de paso, el foco va al título del paso nuevo.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    const h1 = document.querySelector<HTMLElement>('main h1')
    if (h1) {
      h1.setAttribute('tabindex', '-1')
      h1.focus({ preventScroll: true })
      document.title = `${h1.textContent} · María te Cuida`
    }
  }, [step, done])

  const set = (patch: Partial<CaregiverDraft>) => {
    setD((prev) => ({ ...prev, ...patch }))
    if (Object.keys(errors).length) setErrors({})
  }

  const next = () => {
    const e = validateStep(step, d)
    setErrors(e)
    if (Object.keys(e).length) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    if (step < 6) setStep(step + 1)
    else {
      registerCaregiver({ ...d, documents: d.documents.map((x) => ({ ...x, status: 'en_revision' })) })
      setDone(true)
    }
  }

  if (done)
    return (
      <Container className="max-w-2xl py-16 text-center">
        <span aria-hidden className="animate-enter mx-auto flex size-20 items-center justify-center rounded-full bg-care-soft text-care">
          <PartyPopper className="size-10" strokeWidth={1.75} />
        </span>
        <h1 className="animate-enter animate-enter-2 mt-6 text-4xl font-bold">Registro completado</h1>
        <p className="animate-enter animate-enter-2 mt-3 text-lg text-ink-soft">
          Tu perfil ya está creado. El equipo de María te Cuida revisará tu documentación; mientras tanto, las familias ya pueden encontrarte en el buscador.
        </p>
        <Button size="lg" className="animate-enter animate-enter-3 mt-8" iconRight={ChevronRight} onClick={() => navigate('/cuidadora')}>
          Ir a mi panel
        </Button>
      </Container>
    )

  const { Comp, title, subtitle, icon } = STEPS[step - 1]

  return (
    <Container className="max-w-6xl py-6 sm:py-10">
      <Stepper step={step} />

      <div className={cx('mx-auto mt-8 grid gap-10', step === 1 ? 'max-w-5xl md:grid-cols-[0.8fr_1fr]' : 'max-w-3xl')}>
        {step === 1 && (
          <div className="relative hidden md:block">
            <span aria-hidden className="absolute -top-4 -right-4 size-40 rounded-full bg-care-soft" />
            <span aria-hidden className="absolute -bottom-4 -left-4 size-32 rounded-full bg-accent-soft" />
            <img src={img('registro.jpg')} alt="" className="relative aspect-[440/690] w-full rounded-[32px] object-cover outline outline-1 -outline-offset-1 outline-black/10" />
          </div>
        )}
        <div className="min-w-0">
          <StepHeader icon={icon} title={title} subtitle={subtitle} eyebrow={`Paso ${step} de ${STEPS.length}`} />
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              next()
            }}
          >
            {Object.keys(errors).length > 0 && (
              <div className="mb-6">
                <ErrorSummary ref={summaryRef} errors={errors} />
              </div>
            )}
            {step !== 3 && step !== 5 && (
              <div className="mb-5">
                <FormNote />
              </div>
            )}
            <Comp d={d} set={set} errors={errors} />

            <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
              <Button type="submit" size="lg" className="sm:flex-1" iconRight={step === 6 ? Check : ChevronRight}>
                {step === 3 ? 'Firmar y continuar' : step === 6 ? 'Finalizar registro' : 'Continuar'}
              </Button>
              {step > 1 && (
                <Button
                  variant="ghost"
                  size="lg"
                  icon={ArrowLeft}
                  onClick={() => {
                    setStep(step - 1)
                    setErrors({})
                  }}
                  className="sm:min-w-44"
                >
                  Paso anterior
                </Button>
              )}
            </div>
          </form>
          {step === 1 && (
            <p className="mt-6 text-center text-ink-soft">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="link">
                Inicia sesión
              </Link>
            </p>
          )}
          <div className="mt-6 text-center">
            <button type="button" onClick={() => set(sampleFor(step, d))} className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-ink-soft hover:bg-sunken hover:text-ink">
              <Wand2 aria-hidden className="size-5" strokeWidth={2} />
              Rellenar con datos de ejemplo (demo)
            </button>
          </div>
        </div>
      </div>
    </Container>
  )
}
