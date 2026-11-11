import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  BriefcaseBusiness,
  ChevronRight,
  ClipboardCheck,
  Handshake,
  Heart,
  MessageCircleMore,
  Search,
  Send,
  ShieldCheck,
  Star,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Container } from '../components/Layout'
import { Avatar, Button, IconBubble, Stars, TrustedBadge } from '../components/ui'
import { useStore } from '../store'
import { cx, img, shortName } from '../lib/format'

/** Gran botón de entrada: icono, texto y flecha. Ocupa todo el ancho en móvil. */
function PathLink({ to, icon: Icon, title, sub, tone }: { to: string; icon: LucideIcon; title: string; sub: string; tone: 'accent' | 'care' }) {
  return (
    <Link
      to={to}
      className={cx(
        'pressable group flex min-h-20 items-center gap-4 rounded-[24px] py-4 ps-5 pe-4 text-white shadow-[0_1px_2px_oklch(0_0_0/0.12),0_8px_20px_-8px_oklch(0_0_0/0.3)]',
        tone === 'accent' ? 'bg-accent hover:bg-accent-hover' : 'bg-care hover:bg-care-hover',
      )}
    >
      <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15">
        <Icon className="size-6" strokeWidth={2} />
      </span>
      <span className="flex-1">
        <span className="block text-xl leading-tight font-semibold">{title}</span>
        <span className="mt-0.5 block text-white/90">{sub}</span>
      </span>
      <ChevronRight aria-hidden className="size-6 shrink-0 motion-safe:transition-[translate] motion-safe:duration-150 group-hover:translate-x-0.5" strokeWidth={2.25} />
    </Link>
  )
}

export default function Landing() {
  const { state } = useStore()
  const featured = state.caregivers.filter((c) => c.trusted && c.available).slice(0, 3)

  return (
    <>
      {/* Portada */}
      <section className="relative overflow-hidden">
        <Container className="grid items-center gap-10 pt-8 pb-14 md:grid-cols-[1.05fr_1fr] md:gap-12 md:pt-14 md:pb-20">
          <div className="max-w-xl">
            <p className="animate-enter inline-flex items-center gap-2 rounded-full bg-care-subtle px-3.5 py-1.5 text-sm font-semibold text-care">
              <Heart aria-hidden className="size-4 fill-current" />
              Para familias y cuidadoras
            </p>
            <h1 className="animate-enter animate-enter-2 mt-5 text-4xl font-bold text-accent-strong sm:text-6xl">Cuidado de personas, con confianza y cercanía</h1>
            <p className="animate-enter animate-enter-2 mt-5 max-w-[34ch] text-lg text-ink-soft sm:text-xl">Conectamos a familias que necesitan apoyo en el cuidado con cuidadoras con experiencia.</p>
            <div className="animate-enter animate-enter-3 mt-8 grid gap-3 sm:max-w-md">
              <PathLink to="/buscar" icon={Users} tone="accent" title="Necesito una cuidadora" sub="Busca y compara perfiles" />
              <PathLink to="/registro/cuidadora" icon={BriefcaseBusiness} tone="care" title="Quiero trabajar como cuidadora" sub="Crea tu perfil en 6 pasos" />
            </div>
            <p className="animate-enter animate-enter-3 mt-6 text-ink-soft">
              ¿Prefieres que lo hagamos por ti?{' '}
              <Link to="/servicio-integral" className="link">
                Te ayudamos a elegir
              </Link>
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            {/* Formas decorativas que recuerdan los lazos del logo */}
            <span aria-hidden className="absolute -top-6 -right-10 size-48 rounded-full bg-accent-soft sm:size-64" />
            <span aria-hidden className="absolute -bottom-8 -left-8 size-40 rounded-full bg-care-soft sm:size-52" />
            <img
              src={img('hero.jpg')}
              alt="Una cuidadora sonríe junto a una señora mayor"
              className="relative aspect-[549/640] w-full rounded-[32px] object-cover outline outline-1 -outline-offset-1 outline-black/10 md:max-h-[600px]"
            />
            <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-[20px] bg-surface py-3 ps-3 pe-5 shadow-pop sm:left-6">
              <span aria-hidden className="flex size-11 items-center justify-center rounded-full bg-accent text-white">
                <ShieldCheck className="size-6" strokeWidth={2} />
              </span>
              <div>
                <div className="font-semibold">Cuidadoras de confianza</div>
                <div className="text-sm text-ink-soft">Valoradas por familias y por el equipo</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Garantías */}
      <section aria-labelledby="garantias" className="border-y border-line bg-surface">
        <h2 id="garantias" className="sr-only">
          Lo que te garantizamos
        </h2>
        <Container>
          <ul className="grid gap-x-8 gap-y-5 py-7 md:grid-cols-3">
            {[
              { icon: BadgeCheck, t: 'Documentación revisada', d: 'El equipo revisa la identidad y el permiso de trabajo.' },
              { icon: Star, t: 'Valoraciones reales', d: 'Solo de familias que han contratado por la plataforma.' },
              { icon: MessageCircleMore, t: 'Chat solo con acuerdo', d: 'Se abre cuando las dos partes aceptan.' },
            ].map((x) => (
              <li key={x.t} className="flex items-start gap-3.5">
                <IconBubble icon={x.icon} size="sm" />
                <div>
                  <div className="font-semibold">{x.t}</div>
                  <div className="text-ink-soft">{x.d}</div>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">¿Cómo funciona?</h2>
            <p className="mt-3 text-lg text-ink-soft">Un proceso sencillo y seguro. El chat solo se abre cuando la familia y la cuidadora están de acuerdo.</p>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Search, t: 'Buscas y eliges', d: 'Filtra por cuidados, zona, jornada, experiencia o formación y consulta perfiles completos.' },
              { icon: Heart, t: 'Guardas favoritas', d: 'Marca con el corazón a las que te interesan. Es privado: la cuidadora no recibe aviso.' },
              { icon: Send, t: 'Envías tu solicitud', d: 'Cuéntale qué necesitas. La cuidadora puede aceptarla o rechazarla.' },
              { icon: Handshake, t: 'Hacéis match', d: 'Si ambas partes aceptáis, se confirma el match y se habilita el chat privado.' },
            ].map((s, i) => (
              <li key={s.t} className="card p-6">
                <div className="flex items-center justify-between">
                  <IconBubble icon={s.icon} size="lg" tone={i === 1 ? 'rosa' : 'brand'} />
                  <span className="text-4xl font-bold text-accent-line tabular-nums" aria-hidden>
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold">
                  <span className="sr-only">Paso {i + 1}: </span>
                  {s.t}
                </h3>
                <p className="mt-2 text-ink-soft">{s.d}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Dos caminos */}
      <section className="pb-16 sm:pb-20">
        <Container className="grid gap-5 lg:grid-cols-2">
          <div className="card flex flex-col p-7 sm:p-9">
            <IconBubble icon={Users} size="lg" />
            <h2 className="mt-5 text-2xl font-bold sm:text-3xl">Para familias</h2>
            <ul className="mt-5 space-y-3 text-ink-soft">
              {['Buscador sencillo con filtros para encontrar a tu cuidadora ideal.', 'Fichas resumidas y perfil completo de cada cuidadora.', 'Tu cuenta con favoritas, preferencias, solicitudes y conversaciones.'].map((t) => (
                <li key={t} className="flex gap-3">
                  <BadgeCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-accent-icon" strokeWidth={2} />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap gap-3 pt-8">
              <Button to="/buscar" icon={Search}>
                Buscar cuidadora
              </Button>
              <Button to="/registro/familia" variant="outline" icon={UserPlus}>
                Crear cuenta de familia
              </Button>
            </div>
          </div>
          <div className="card flex flex-col bg-care-subtle p-7 sm:p-9">
            <IconBubble icon={BriefcaseBusiness} size="lg" tone="rosa" />
            <h2 className="mt-5 text-2xl font-bold sm:text-3xl">Para cuidadoras</h2>
            <ul className="mt-5 space-y-3 text-ink-soft">
              {[
                'Registro por pasos: datos, documentación, experiencia, cuidados y preferencias.',
                'Un botón para indicar si estás disponible o no, cuando quieras.',
                'Recibe solicitudes de familias y decide si aceptarlas.',
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <ClipboardCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-care-icon" strokeWidth={2} />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <Button to="/registro/cuidadora" variant="care" icon={UserPlus}>
                Crear mi perfil profesional
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Confianza */}
      <section className="on-dark bg-accent-strong py-16 text-white sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-white/10 text-accent-on-dark">
              <ShieldCheck className="size-7" strokeWidth={1.75} />
            </span>
            <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">Cuidadora de confianza María te Cuida</h2>
            <p className="mt-4 text-lg text-white/90">
              Es el distintivo que reciben las profesionales que ya han trabajado con familias a través de la plataforma y cuyo trabajo ha sido valorado positivamente por nuestro equipo.
            </p>
            <p className="mt-3 text-accent-soft">Es distinto de tener la documentación revisada: mostramos ambas cosas por separado para que sepas qué significa cada una.</p>
            <Button to="/confianza" variant="soft" className="mt-7" iconRight={ChevronRight}>
              Saber más sobre la confianza
            </Button>
          </div>
          <ul className="grid gap-3">
            {featured.map((c) => (
              <li key={c.id}>
                <Link to={`/cuidadoras/${c.id}`} className="pressable flex items-center gap-4 rounded-[20px] bg-surface p-4 text-ink hover:bg-accent-subtle">
                  <Avatar name={c.name} photo={c.photo} size={64} />
                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-semibold">
                      {shortName(c.name)}
                      <span className="sr-only">, ver perfil</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <TrustedBadge size="sm" />
                      <Stars rating={c.rating} reviews={c.reviews} size="sm" />
                    </div>
                  </div>
                  <ChevronRight aria-hidden className="size-5 text-ink-soft" />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Servicio integral */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="card flex flex-col items-start gap-6 p-7 sm:flex-row sm:items-center sm:p-10">
            <IconBubble icon={Handshake} size="lg" tone="rosa" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold sm:text-3xl">¿Prefieres que busquemos por ti?</h2>
              <p className="mt-2 max-w-[60ch] text-lg text-ink-soft">Con el servicio integral, el equipo de María te Cuida se encarga de buscar y seleccionar a la cuidadora adecuada para tu familia.</p>
            </div>
            <Button to="/servicio-integral" size="lg" iconRight={ChevronRight}>
              Pedir ayuda al equipo
            </Button>
          </div>
        </Container>
      </section>
    </>
  )
}
