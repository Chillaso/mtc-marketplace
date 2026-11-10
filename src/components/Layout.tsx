import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  CircleCheck,
  FlaskConical,
  Handshake,
  Heart,
  House,
  Info,
  LogOut,
  Menu,
  MessageCircleMore,
  RotateCcw,
  Search,
  User,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { useMe, useStore } from '../store'
import { Avatar } from './ui'
import { cx, fmtWhen } from '../lib/format'
import { DEMO_CAREGIVER_ID, DEMO_FAMILY_ID } from '../data/seed'

function useClickOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close()
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open, close])
  return ref
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" aria-label="María te Cuida, inicio" className={cx('inline-flex shrink-0', className)}>
      <img src="/img/logo.png" alt="María te Cuida" className="h-11 w-auto sm:h-[52px]" />
    </Link>
  )
}

function Notifications() {
  const { markNotificationsRead } = useStore()
  const me = useMe()
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(open, () => setOpen(false))
  const navigate = useNavigate()
  const toggle = () => {
    setOpen((o) => !o)
    if (!open && me.unreadNotifications) setTimeout(() => markNotificationsRead(me.role, me.userId), 1500)
  }
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={toggle} aria-label={`Notificaciones (${me.unreadNotifications} sin leer)`} className="relative rounded-full p-2.5 text-ink hover:bg-brand-50">
        <Bell className="size-6" strokeWidth={1.8} />
        {me.unreadNotifications > 0 && <span className="absolute top-2 right-2 size-2.5 rounded-full bg-rosa-500 ring-2 ring-white" />}
      </button>
      {open && (
        <div className="animate-pop absolute right-0 z-40 mt-2 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-line bg-white shadow-pop">
          <div className="border-b border-line px-4 py-3 font-semibold">Notificaciones</div>
          <ul className="max-h-96 overflow-y-auto">
            {me.notifications.length === 0 && <li className="px-4 py-6 text-center text-muted">No tienes notificaciones.</li>}
            {me.notifications.slice(0, 12).map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    navigate(n.link)
                  }}
                  className={cx('flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-brand-50', !n.read && 'bg-brand-50/60')}
                >
                  <span className={cx('mt-1.5 size-2 shrink-0 rounded-full', n.read ? 'bg-slate-300' : 'bg-rosa-500')} />
                  <span className="min-w-0">
                    <span className="block text-[15px] leading-snug">{n.text}</span>
                    <span className="text-xs text-muted">{fmtWhen(n.at)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function AccountMenu() {
  const me = useMe()
  const { logout } = useStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(open, () => setOpen(false))
  const items =
    me.role === 'family'
      ? [
          { to: '/familia', label: 'Mi cuenta', icon: House },
          { to: '/familia/favoritas', label: 'Mis favoritas', icon: Heart },
          { to: '/familia/solicitudes', label: 'Mis solicitudes', icon: MessageCircleMore },
          { to: '/mensajes', label: 'Mensajes', icon: MessageCircleMore },
        ]
      : [
          { to: '/cuidadora', label: 'Inicio', icon: House },
          { to: '/cuidadora/perfil', label: 'Mi perfil', icon: User },
          { to: '/cuidadora/solicitudes', label: 'Solicitudes', icon: Handshake },
          { to: '/mensajes', label: 'Mensajes', icon: MessageCircleMore },
        ]
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-2.5 rounded-full py-1 pr-2 pl-1 hover:bg-brand-50" aria-expanded={open}>
        {me.caregiver ? (
          <Avatar name={me.caregiver.name} photo={me.caregiver.photo} size={44} />
        ) : (
          <span className="flex size-11 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <UserRound className="size-6" />
          </span>
        )}
        <span className="hidden font-semibold sm:inline">{me.role === 'caregiver' ? me.displayName : 'Mi cuenta'}</span>
        <ChevronDown className="hidden size-5 sm:block" />
      </button>
      {open && (
        <div className="animate-pop absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-pop">
          <div className="px-4 pt-1 pb-3">
            <div className="font-semibold">{me.displayName}</div>
            <div className="text-sm text-muted">{me.role === 'family' ? me.family?.name : 'Cuenta de cuidadora'}</div>
          </div>
          {items.map((it) => (
            <Link key={it.to} to={it.to} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50">
              <it.icon className="size-5 text-brand-700" />
              {it.label}
            </Link>
          ))}
          <div className="my-1 border-t border-line" />
          <button
            type="button"
            onClick={() => {
              logout()
              setOpen(false)
              navigate('/')
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-brand-50"
          >
            <LogOut className="size-5 text-brand-700" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

function MainMenu() {
  const me = useMe()
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => setOpen(false), [loc.pathname])
  const links = [
    { to: '/', label: 'Inicio', icon: House },
    { to: '/buscar', label: 'Buscar cuidadora', icon: Search },
    { to: '/servicio-integral', label: 'Quiero ayuda en la selección', icon: Handshake },
    { to: '/registro/cuidadora', label: 'Trabajar como cuidadora', icon: BriefcaseBusiness, hide: me.role !== 'guest' },
    { to: '/confianza', label: 'Documentación y confianza', icon: CircleCheck },
    { to: '/#como-funciona', label: '¿Cómo funciona?', icon: Info },
  ].filter((l) => !l.hide)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menú" className="rounded-xl p-2 text-brand-900 hover:bg-brand-50">
        <Menu className="size-8" strokeWidth={2.2} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px]" onClick={() => setOpen(false)}>
          <nav onClick={(e) => e.stopPropagation()} className="animate-pop absolute top-0 right-0 flex h-full w-[min(88vw,360px)] flex-col bg-white shadow-pop" aria-label="Menú principal">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú" className="rounded-full p-2 hover:bg-brand-50">
                <X className="size-6" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto p-3">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="flex items-center gap-3 rounded-xl px-3 py-3 text-[17px] font-medium hover:bg-brand-50">
                    <l.icon className="size-6 text-brand-700" strokeWidth={1.8} />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-line p-4 text-sm text-muted">María te Cuida · Demo funcional con datos ficticios</div>
          </nav>
        </div>
      )}
    </>
  )
}

export function Header() {
  const me = useMe()
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center gap-2 px-4 sm:h-[88px] sm:px-6">
        <Logo />
        <div className="flex-1" />
        {me.role === 'guest' ? (
          <Link to="/login" className="mr-1 inline-flex h-11 items-center gap-2 rounded-full border-[1.5px] border-brand-200 bg-brand-50/50 px-4 font-semibold text-brand-900 hover:bg-brand-50 sm:px-5">
            <User className="size-5" />
            Iniciar sesión
          </Link>
        ) : (
          <>
            <Notifications />
            <span className="mx-1 hidden h-8 w-px bg-line sm:block" />
            <AccountMenu />
          </>
        )}
        <MainMenu />
      </div>
    </header>
  )
}

export function Waves() {
  return (
    <svg aria-hidden viewBox="0 0 1440 120" preserveAspectRatio="none" className="pointer-events-none block h-16 w-full sm:h-24">
      <defs>
        <linearGradient id="wv" x1="0" x2="1">
          <stop offset="0" stopColor="#c9efec" />
          <stop offset="0.55" stopColor="#e7f6f6" />
          <stop offset="1" stopColor="#fbd3df" />
        </linearGradient>
      </defs>
      <path d="M0 60 C 240 10 420 10 720 55 S 1200 110 1440 40 V120 H0Z" fill="url(#wv)" opacity="0.9" />
      <path d="M0 90 C 300 50 520 70 760 95 S 1180 80 1440 70 V120 H0Z" fill="#fde5ec" opacity="0.6" />
    </svg>
  )
}

function Footer() {
  return (
    <footer className="mt-auto">
      <Waves />
      <div className="bg-gradient-to-r from-brand-50 to-rosa-50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-6 text-sm text-ink-soft sm:px-6">
          <span className="font-semibold text-ink">© {new Date().getFullYear()} María te Cuida</span>
          <Link to="/confianza" className="hover:text-ink">Documentación y confianza</Link>
          <Link to="/servicio-integral" className="hover:text-ink">Servicio integral</Link>
          <Link to="/registro/cuidadora" className="hover:text-ink">Trabajar como cuidadora</Link>
          <span className="ml-auto">Demo con datos ficticios</span>
        </div>
      </div>
    </footer>
  )
}

function CaregiverTabBar() {
  const me = useMe()
  const pending = me.myRequests.filter((r) => r.status === 'pendiente').length
  const tabs = [
    { to: '/cuidadora', label: 'Inicio', icon: House, end: true },
    { to: '/cuidadora/solicitudes', label: 'Solicitudes', icon: Search, badge: pending },
    { to: '/mensajes', label: 'Mensajes', icon: MessageCircleMore, badge: me.unreadMessages },
    { to: '/cuidadora/perfil', label: 'Mi perfil', icon: User },
  ]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur md:hidden" aria-label="Navegación de cuidadora">
      <ul className="grid grid-cols-4">
        {tabs.map((t) => (
          <li key={t.to}>
            <NavLink
              to={t.to}
              end={t.end}
              className={({ isActive }) => cx('relative flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium', isActive ? 'text-brand-800' : 'text-ink-soft')}
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <t.icon className="size-6" strokeWidth={isActive ? 2.2 : 1.8} />
                    {!!t.badge && <span className="absolute -top-1.5 -right-2.5 flex size-[18px] items-center justify-center rounded-full bg-rosa-500 text-[11px] font-bold text-white">{t.badge}</span>}
                  </span>
                  {t.label}
                  {isActive && <span className="absolute bottom-0 h-[3px] w-10 rounded-full bg-brand-700" />}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Toasts() {
  const { toasts, dismissToast } = useStore()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="animate-pop pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl bg-brand-950 px-4 py-3 text-[15px] text-white shadow-pop">
          {t.tone === 'ok' ? <CircleCheck className="mt-0.5 size-5 shrink-0 text-brand-400" /> : <Info className="mt-0.5 size-5 shrink-0 text-brand-400" />}
          <span className="flex-1">{t.text}</span>
          <button type="button" onClick={() => dismissToast(t.id)} aria-label="Cerrar aviso" className="opacity-70 hover:opacity-100">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

function DemoOption({ role, current, onPick, icon: Icon, title, sub }: { role: 'guest' | 'family' | 'caregiver'; current: string; onPick: (r: 'guest' | 'family' | 'caregiver') => void; icon: typeof Users; title: string; sub: string }) {
  return (
    <button type="button" onClick={() => onPick(role)} className={cx('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-brand-50', current === role && 'bg-brand-50 ring-1 ring-brand-200')}>
      <Icon className="size-5 text-brand-700" />
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-xs text-muted">{sub}</span>
      </span>
    </button>
  )
}

/** Panel flotante para presentar la demo: cambiar de rol y reiniciar datos. */
function DemoPanel() {
  const { loginAs, resetDemo, toast } = useStore()
  const me = useMe()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(open, () => setOpen(false))
  const go = (role: 'guest' | 'family' | 'caregiver') => {
    loginAs(role, role === 'family' ? DEMO_FAMILY_ID : role === 'caregiver' ? DEMO_CAREGIVER_ID : undefined)
    setOpen(false)
    navigate(role === 'family' ? '/familia' : role === 'caregiver' ? '/cuidadora' : '/')
  }
  return (
    <div ref={ref} className="fixed bottom-20 left-3 z-40 md:bottom-5 md:left-5">
      {open && (
        <div className="animate-pop mb-2 w-72 rounded-2xl border border-line bg-white p-3 shadow-pop">
          <div className="px-1 pb-2 text-xs font-bold tracking-wider text-muted uppercase">Modo demo · Ver como</div>
          <DemoOption current={me.role} onPick={go} role="family" icon={Users} title="Familia" sub="Lucía Martínez · Familia Martínez" />
          <DemoOption current={me.role} onPick={go} role="caregiver" icon={BriefcaseBusiness} title="Cuidadora" sub="Ana García · Jerez" />
          <DemoOption current={me.role} onPick={go} role="guest" icon={UserRound} title="Visitante" sub="Sin iniciar sesión" />
          <div className="mt-2 border-t border-line pt-2">
            <button
              type="button"
              onClick={() => {
                resetDemo()
                setOpen(false)
                toast('Datos de la demo restablecidos.')
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-rosa-50"
            >
              <RotateCcw className="size-4 text-rosa-600" />
              Reiniciar datos de la demo
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-ink px-3.5 py-3 text-sm font-semibold text-white opacity-90 shadow-pop hover:bg-brand-950 hover:opacity-100 sm:px-4 sm:py-2.5"
        aria-expanded={open}
      >
        <FlaskConical className="size-4" />
        <span className="max-sm:sr-only">Demo</span>
      </button>
    </div>
  )
}

export function AppLayout() {
  const me = useMe()
  const loc = useLocation()
  useEffect(() => {
    if (loc.hash) {
      const el = document.getElementById(loc.hash.slice(1))
      if (el) return el.scrollIntoView({ behavior: 'smooth' })
    }
    window.scrollTo(0, 0)
  }, [loc.pathname, loc.hash])
  const showTabs = me.role === 'caregiver'
  return (
    <div className={cx('flex min-h-dvh flex-col', showTabs && 'pb-16 md:pb-0')}>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {showTabs && <CaregiverTabBar />}
      <DemoPanel />
      <Toasts />
    </div>
  )
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto w-full max-w-7xl px-4 sm:px-6', className)}>{children}</div>
}
