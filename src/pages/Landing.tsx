import { Link } from 'react-router-dom'
import { BadgeCheck, BriefcaseBusiness, ChevronRight, ClipboardCheck, Handshake, Heart, MessageCircleMore, Search, Send, ShieldCheck, Star, UserPlus, Users, type LucideIcon } from 'lucide-react'
import { Container } from '../components/Layout'
import { Avatar, Button, IconBubble, Stars, TrustedBadge } from '../components/ui'
import { useStore } from '../store'
import { cx, img, shortName } from '../lib/format'

/** Gran botón de entrada: icono, texto y flecha. Ocupa todo el ancho en móvil. */
function PathLink({ to, icon: Icon, title, sub, tone }: { to: string; icon: LucideIcon; title: string; sub: string; tone: 'accent' | 'sky' }) {
  const sky = tone === 'sky'
  return (
    <Link
      to={to}
      className={cx(
        'pressable group flex min-h-20 items-center gap-4 rounded-[24px] py-4 ps-5 pe-4 shadow-[0_1px_2px_oklch(0_0_0/0.12),0_8px_20px_-8px_oklch(0_0_0/0.3)]',
        sky ? 'bg-sky text-ink hover:bg-sky-line' : 'bg-accent text-white hover:bg-accent-hover',
      )}
    >
      <span aria-hidden className={cx('flex size-12 shrink-0 items-center justify-center rounded-full', sky ? 'bg-white/45' : 'bg-white/15')}>
        <Icon className="size-6" strokeWidth={2} />
      </span>
      <span className="flex-1">
        <span className="block text-xl leading-tight font-semibold">{title}</span>
        <span className={cx('mt-0.5 block', sky ? 'text-ink' : 'text-white/90')}>{sub}</span>
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
      <section className="relative isolate overflow-hidden">
        {/* Escritorio: la foto se funde con el fondo crema mediante un velo en degradado. */}
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-[62%] md:block">
          <img src={img('hero.jpg')} alt="Una cuidadora sonríe junto a una señora mayor" className="absolute inset-0 size-full object-cover object-[50%_25%]" />
          <span aria-hidden className="hero-veil absolute inset-y-0 -left-1 right-0" />
        </div>
        <Container className="grid items-center gap-6 pt-8 md:min-h-[600px] md:grid-cols-[1.05fr_1fr] md:gap-12 md:pt-14 md:pb-20">
          <div className="max-w-xl">
            <h1 className="animate-enter mt-2 text-4xl font-bold text-accent-strong sm:text-6xl">Cuidado de personas, con confianza y cercanía</h1>
            <p className="animate-enter animate-enter-2 mt-5 max-w-[34ch] text-lg text-ink-soft sm:text-xl">Conectamos a familias que necesitan apoyo en el cuidado con cuidadoras con experiencia.</p>
            <div className="animate-enter animate-enter-3 mt-8 grid gap-3 sm:max-w-md">
              <PathLink to="/buscar" icon={Users} tone="accent" title="Necesito una cuidadora" sub="Busca y compara perfiles" />
              <PathLink to="/registro/cuidadora" icon={BriefcaseBusiness} tone="sky" title="Quiero trabajar como cuidadora" sub="Crea tu perfil en 6 pasos" />
            </div>
            <p className="animate-enter animate-enter-3 mt-6 text-ink-soft">
              ¿Prefieres que lo hagamos por ti?{' '}
              <Link to="/servicio-integral" className="link">
                Te ayudamos a elegir
              </Link>
            </p>
          </div>

          <div className="relative -mx-4 sm:-mx-6 md:mx-0 md:self-end">
            {/* Móvil: la foto aparece desde el fondo, sin marco. */}
            <div className="relative md:hidden">
              <img src={img('hero.jpg')} alt="Una cuidadora sonríe junto a una señora mayor" className="aspect-[549/640] max-h-[480px] w-full object-cover object-[50%_25%]" />
              <span aria-hidden className="hero-veil-mobile absolute inset-0" />
            </div>
            <div className="absolute bottom-6 left-4 flex items-center gap-3 rounded-[20px] bg-surface py-3 ps-3 pe-5 shadow-pop sm:left-6 md:relative md:bottom-0 md:left-0 md:w-fit">
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
              {
                icon: BadgeCheck,
                t: 'Documentación revisada',
                d: 'El equipo revisa la identidad y el permiso de trabajo.',
              },
              {
                icon: Star,
                t: 'Valoraciones reales',
                d: 'Solo de familias que han contratado por la plataforma.',
              },
              {
                icon: MessageCircleMore,
                t: 'Chat solo con acuerdo',
                d: 'Se abre cuando las dos partes aceptan.',
              },
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
            {(
              [
                {
                  icon: Search,
                  t: 'Buscas y eliges',
                  d: 'Filtra por cuidados, zona, jornada, experiencia o formación y consulta perfiles completos.',
                  tone: 'brand',
                  num: 'text-accent-line',
                },
                {
                  icon: Heart,
                  t: 'Guardas favoritas',
                  d: 'Marca con el corazón a las que te interesan. Es privado: la cuidadora no recibe aviso.',
                  tone: 'rosa',
                  num: 'text-care',
                },
                {
                  icon: Send,
                  t: 'Envías tu solicitud',
                  d: 'Cuéntale qué necesitas. La cuidadora puede aceptarla o rechazarla.',
                  tone: 'sky-solid',
                  num: 'text-sky',
                },
                {
                  icon: Handshake,
                  t: 'Hacéis match',
                  d: 'Si ambas partes aceptáis, se confirma el match y se habilita el chat privado.',
                  tone: 'solid',
                  num: 'text-accent-line',
                },
              ] as const
            ).map((s, i) => (
              <li key={s.t} className="card p-6">
                <div className="flex items-center justify-between">
                  <span className={cx('text-4xl font-bold tabular-nums', s.num)} aria-hidden>
                    {i + 1}
                  </span>
                  <IconBubble icon={s.icon} size="lg" tone={s.tone} />
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
            <div className="flex items-center gap-4">
              <IconBubble icon={Users} size="lg" />
              <h2 className="text-2xl font-bold sm:text-3xl">Para familias</h2>
            </div>
            <ul className="mt-5 space-y-3 text-ink-soft">
              {['Buscador sencillo con filtros para encontrar a tu cuidadora ideal.', 'Fichas resumidas y perfil completo de cada cuidadora.', 'Tu cuenta con favoritas, preferencias, solicitudes y conversaciones.'].map((t) => (
                <li key={t} className="flex gap-3">
                  <BadgeCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-accent-icon" strokeWidth={2} />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap gap-3 pt-7">
              <Button to="/buscar" icon={Search}>
                Buscar cuidadora
              </Button>
              <Button to="/registro/familia" variant="outline" icon={UserPlus}>
                Crear cuenta de familia
              </Button>
            </div>
          </div>
          <div className="card flex flex-col bg-care-subtle p-7 sm:p-9">
            <div className="flex items-center gap-4">
              <IconBubble icon={BriefcaseBusiness} size="lg" tone="rosa" />
              <h2 className="text-2xl font-bold sm:text-3xl">Para cuidadoras</h2>
            </div>
            <ul className="mt-5 space-y-3 text-ink-soft">
              {['Registro por pasos: datos, documentación, experiencia, cuidados y preferencias.', 'Un botón para indicar si estás disponible o no, cuando quieras.', 'Recibe solicitudes de familias y decide si aceptarlas.'].map((t) => (
                <li key={t} className="flex gap-3">
                  <ClipboardCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-care-icon" strokeWidth={2} />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-7">
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
            <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-accent-on-dark text-accent-strong">
              <ShieldCheck className="size-7" strokeWidth={1.75} />
            </span>
            <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">Cuidadora de confianza María te Cuida</h2>
            <p className="mt-4 text-lg text-white/90">Es el distintivo que reciben las profesionales que ya han trabajado con familias a través de la plataforma y cuyo trabajo ha sido valorado positivamente por nuestro equipo.</p>
            <p className="mt-3 text-accent-soft">Es distinto de tener la documentación revisada: mostramos ambas cosas por separado para que sepas qué significa cada una.</p>
            <Button to="/confianza" variant="soft-sky" className="mt-7" iconRight={ChevronRight}>
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
