import { Link } from 'react-router-dom'
import {
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Handshake,
  Heart,
  MessageCircleMore,
  Search,
  Send,
  ShieldCheck,
  UserPlus,
  Users,
  BadgeCheck,
} from 'lucide-react'
import { Container } from '../components/Layout'
import { Avatar, Button, IconBubble, Stars, TrustedBadge } from '../components/ui'
import { useStore } from '../store'
import { shortName } from '../lib/format'

export default function Landing() {
  const { state } = useStore()
  const featured = state.caregivers.filter((c) => c.trusted && c.available).slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Container className="grid items-center gap-6 pt-8 pb-10 md:grid-cols-[1.05fr_1fr] md:pt-14 md:pb-20">
          <div className="relative z-10 max-w-xl">
            <h1 className="text-[40px] leading-[1.08] font-bold text-brand-950 sm:text-6xl">Cuidado de personas, con confianza y cercanía</h1>
            <p className="mt-5 text-lg text-ink-soft sm:text-xl">Conectamos a familias que necesitan apoyo en el cuidado con cuidadoras con experiencia.</p>
            <div className="mt-8 flex flex-col gap-4 sm:max-w-md">
              <Link
                to="/buscar"
                className="group flex items-center gap-4 rounded-3xl bg-gradient-to-b from-brand-600 to-brand-800 px-6 py-5 text-white shadow-[0_14px_30px_-12px_rgb(12_101_102/0.7)] transition hover:brightness-110"
              >
                <Users className="size-8 shrink-0" strokeWidth={1.7} />
                <span className="flex-1 text-xl font-semibold">Necesito una cuidadora</span>
                <ChevronRight className="size-6 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/registro/cuidadora"
                className="group flex items-center gap-4 rounded-3xl bg-gradient-to-b from-rosa-500 to-rosa-600 px-6 py-5 text-white shadow-[0_14px_30px_-12px_rgb(219_90_124/0.7)] transition hover:brightness-105"
              >
                <BriefcaseBusiness className="size-8 shrink-0" strokeWidth={1.7} />
                <span className="flex-1 text-xl leading-tight font-semibold">Quiero trabajar como cuidadora</span>
                <ChevronRight className="size-6 transition group-hover:translate-x-1" />
              </Link>
            </div>
            <p className="mt-6 text-ink-soft">
              ¿Prefieres que lo hagamos por ti?{' '}
              <Link to="/servicio-integral" className="font-semibold text-brand-800 underline decoration-brand-400 decoration-2 underline-offset-4">
                Te ayudamos en la selección
              </Link>
            </p>
          </div>
          <div className="relative -mx-4 md:mx-0">
            <div className="absolute -inset-6 -z-0 rounded-[48%_52%_40%_60%/55%_45%_55%_45%] bg-brand-50" />
            <img
              src="/img/hero.jpg"
              alt="Una cuidadora sonríe junto a una señora mayor"
              className="relative z-10 aspect-[549/640] w-full rounded-[46%_54%_8%_44%/40%_36%_10%_46%] object-cover shadow-pop md:max-h-[620px]"
            />
            <div className="absolute -bottom-3 left-6 z-20 hidden items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-pop backdrop-blur sm:flex">
              <ShieldCheck className="size-8 text-brand-700" />
              <div>
                <div className="font-semibold">Cuidadoras de confianza</div>
                <div className="text-sm text-ink-soft">Valoradas por familias y por el equipo</div>
              </div>
            </div>
          </div>
        </Container>
        <div className="flex justify-center pb-6">
          <a href="#como-funciona" aria-label="Ver cómo funciona" className="flex size-12 items-center justify-center rounded-full border-2 border-brand-100 bg-white text-brand-800 hover:bg-brand-50">
            <ChevronDown className="size-6" />
          </a>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="scroll-mt-24 bg-gradient-to-b from-brand-50 to-white py-16">
        <Container>
          <h2 className="text-center text-3xl font-bold sm:text-4xl">¿Cómo funciona?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-ink-soft">Un proceso sencillo y seguro. El chat solo se abre cuando la familia y la cuidadora están de acuerdo.</p>
          <ol className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              { icon: Search, t: 'Buscas y eliges', d: 'Filtra por cuidados, zona, jornada, experiencia o formación y consulta perfiles completos.' },
              { icon: Heart, t: 'Guardas favoritas', d: 'Marca con el corazón a las que te interesan. Es privado: la cuidadora no recibe aviso.' },
              { icon: Send, t: 'Envías tu solicitud', d: 'Cuéntale qué necesitas. La cuidadora puede aceptarla o rechazarla.' },
              { icon: Handshake, t: 'Hacéis match', d: 'Si ambas partes aceptáis, se confirma el match y se habilita el chat privado.' },
            ].map((s, i) => (
              <li key={s.t} className="card relative p-6">
                <span className="absolute top-5 right-5 flex size-8 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">{i + 1}</span>
                <IconBubble icon={s.icon} size="lg" />
                <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-ink-soft">{s.d}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Dos caminos */}
      <section className="py-16">
        <Container className="grid gap-6 lg:grid-cols-2">
          <div className="card flex flex-col p-7 sm:p-9">
            <IconBubble icon={Users} size="lg" />
            <h2 className="mt-5 text-2xl font-bold sm:text-3xl">Para familias</h2>
            <ul className="mt-4 space-y-3 text-[17px] text-ink-soft">
              <li className="flex gap-3"><BadgeCheck className="size-6 shrink-0 text-brand-600" />Buscador sencillo y filtros «Encuentra a tu cuidadora ideal».</li>
              <li className="flex gap-3"><BadgeCheck className="size-6 shrink-0 text-brand-600" />Fichas resumidas y perfil completo de cada cuidadora.</li>
              <li className="flex gap-3"><BadgeCheck className="size-6 shrink-0 text-brand-600" />Cuenta con favoritas, preferencias, solicitudes y conversaciones.</li>
            </ul>
            <div className="mt-auto flex flex-wrap gap-3 pt-7">
              <Button to="/buscar" icon={Search}>Buscar cuidadora</Button>
              <Button to="/registro/familia" variant="outline" icon={UserPlus}>Crear cuenta de familia</Button>
            </div>
          </div>
          <div className="card flex flex-col bg-gradient-to-br from-white to-rosa-50 p-7 sm:p-9">
            <IconBubble icon={BriefcaseBusiness} size="lg" tone="rosa" />
            <h2 className="mt-5 text-2xl font-bold sm:text-3xl">Para cuidadoras</h2>
            <ul className="mt-4 space-y-3 text-[17px] text-ink-soft">
              <li className="flex gap-3"><ClipboardCheck className="size-6 shrink-0 text-rosa-600" />Registro por pasos: datos, documentación, experiencia, cuidados y preferencias.</li>
              <li className="flex gap-3"><ClipboardCheck className="size-6 shrink-0 text-rosa-600" />Botón «Disponible / No disponible» para cambiar tu situación con un clic.</li>
              <li className="flex gap-3"><MessageCircleMore className="size-6 shrink-0 text-rosa-600" />Recibe solicitudes de familias y decide si aceptarlas.</li>
            </ul>
            <div className="mt-auto pt-7">
              <Button to="/registro/cuidadora" variant="rosa" icon={UserPlus}>Crear mi perfil profesional</Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Confianza */}
      <section className="bg-brand-950 py-16 text-white">
        <Container className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <ShieldCheck className="size-12 text-brand-400" strokeWidth={1.6} />
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Cuidadora de confianza María te Cuida</h2>
            <p className="mt-4 text-lg text-brand-100">
              Es el distintivo que reciben las profesionales que ya han trabajado con familias a través de la plataforma y cuyo trabajo ha sido valorado positivamente por nuestro equipo.
            </p>
            <p className="mt-3 text-brand-200">Es distinto de tener la documentación revisada: mostramos ambas cosas por separado para que sepas exactamente qué significa cada una.</p>
            <Button to="/confianza" variant="soft" className="mt-6" iconRight={ChevronRight}>Saber más</Button>
          </div>
          <div className="grid gap-3">
            {featured.map((c) => (
              <Link key={c.id} to={`/cuidadoras/${c.id}`} className="flex items-center gap-4 rounded-2xl bg-white/95 p-4 text-ink transition hover:bg-white">
                <Avatar name={c.name} photo={c.photo} size={64} />
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-semibold">{shortName(c.name)}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <TrustedBadge size="sm" />
                    <Stars rating={c.rating} reviews={c.reviews} size="sm" />
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted" />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Servicio integral */}
      <section className="py-16">
        <Container>
          <div className="card flex flex-col items-start gap-6 bg-gradient-to-r from-brand-50 via-white to-rosa-50 p-8 sm:flex-row sm:items-center sm:p-10">
            <IconBubble icon={Handshake} size="lg" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold sm:text-3xl">¿Prefieres que busquemos por ti?</h2>
              <p className="mt-2 text-lg text-ink-soft">Con el servicio integral, el equipo de María te Cuida se encarga de buscar y seleccionar a la cuidadora adecuada para tu familia.</p>
            </div>
            <Button to="/servicio-integral" size="lg" iconRight={ChevronRight}>Quiero ayuda</Button>
          </div>
        </Container>
      </section>
    </>
  )
}
