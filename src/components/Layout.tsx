import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
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
  Mail,
  Menu,
  MessageCircleMore,
  Phone,
  RotateCcw,
  Search,
  User,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { useMe, useStore } from '../store'
import { Avatar } from './ui'
import { cx, fmtWhen, img } from '../lib/format'
import { DEMO_CAREGIVER_ID, DEMO_FAMILY_ID } from '../data/seed'

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Cierra un desplegable al pulsar fuera o con Escape, devolviendo el foco al botón. */
function usePopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const close = useCallback((restoreFocus = false) => {
    setOpen(false)
    if (restoreFocus) buttonRef.current?.focus()
  }, [])
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(true)
    const onFocus = (e: FocusEvent) => ref.current && !ref.current.contains(e.target as Node) && close()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocus)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('focusin', onFocus)
    }
  }, [open, close])
  return { open, setOpen, close, ref, buttonRef }
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cx('inline-flex shrink-0 rounded-lg', className)}>
      <img src={img('logo.png')} alt="María te Cuida, ir al inicio" className="h-11 w-auto sm:h-12" />
    </Link>
  )
}

const iconBtn = 'pressable relative flex size-12 items-center justify-center rounded-full text-ink hover:bg-sunken'

function Notifications() {
  const { markNotificationsRead } = useStore()
  const me = useMe()
  const { open, setOpen, close, ref, buttonRef } = usePopover()
  const navigate = useNavigate()
  const panelId = useId()
  const toggle = () => {
    setOpen(!open)
    if (!open && me.unreadNotifications) setTimeout(() => markNotificationsRead(me.role, me.userId), 1500)
  }
  const unread = me.unreadNotifications
  return (
    <div className="relative" ref={ref}>
      <button ref={buttonRef} type="button" onClick={toggle} aria-expanded={open} aria-controls={panelId} aria-label={unread ? `Avisos, ${unread} sin leer` : 'Avisos'} className={iconBtn}>
        <Bell aria-hidden className="size-6" strokeWidth={2} />
        {unread > 0 && (
          <span aria-hidden className="absolute top-1 right-0.5 flex min-w-5 items-center justify-center rounded-full bg-care px-1 text-xs font-bold text-white tabular-nums ring-2 ring-surface">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div id={panelId} className="animate-pop absolute right-0 z-40 mt-2 w-[min(calc(100vw-2rem),380px)] overflow-hidden rounded-[20px] bg-surface shadow-pop">
          <h2 className="border-b border-line px-5 py-3.5 text-lg font-semibold">Avisos</h2>
          <ul className="max-h-[60dvh] overflow-y-auto overscroll-contain">
            {me.notifications.length === 0 && <li className="px-5 py-8 text-center text-muted">No tienes avisos.</li>}
            {me.notifications.slice(0, 12).map((n) => (
              <li key={n.id} className="border-b border-line last:border-0">
                <button
                  type="button"
                  onClick={() => {
                    close()
                    navigate(n.link)
                  }}
                  className={cx('flex w-full items-start gap-3 px-5 py-3.5 text-start hover:bg-accent-subtle', !n.read && 'bg-care-subtle')}
                >
                  <span aria-hidden className={cx('mt-2 size-2.5 shrink-0 rounded-full', n.read ? 'bg-line' : 'bg-care')} />
                  <span className="min-w-0">
                    {!n.read && <span className="sr-only">Nuevo: </span>}
                    <span className="block leading-snug">{n.text}</span>
                    <span className="text-sm text-muted">{fmtWhen(n.at)}</span>
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
  const { open, setOpen, close, ref, buttonRef } = usePopover()
  const panelId = useId()
  const items =
    me.role === 'family'
      ? [
          { to: '/familia', label: 'Mi cuenta', icon: House },
          { to: '/familia/favoritas', label: 'Mis favoritas', icon: Heart },
          { to: '/familia/solicitudes', label: 'Mis solicitudes', icon: MessageCircleMore },
          { to: '/mensajes', label: 'Mensajes', icon: Mail },
        ]
      : [
          { to: '/cuidadora', label: 'Mi panel', icon: House },
          { to: '/cuidadora/perfil', label: 'Mi perfil', icon: User },
          { to: '/cuidadora/solicitudes', label: 'Solicitudes', icon: Handshake },
          { to: '/mensajes', label: 'Mensajes', icon: Mail },
        ]
  return (
    <div className="relative" ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="pressable flex min-h-12 items-center gap-2.5 rounded-full py-1 ps-1 pe-1 hover:bg-sunken sm:pe-3"
      >
        {me.caregiver ? (
          <Avatar name={me.caregiver.name} photo={me.caregiver.photo} size={40} />
        ) : (
          <span aria-hidden className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent">
            <UserRound className="size-5" strokeWidth={2} />
          </span>
        )}
        <span className="max-sm:sr-only font-semibold">{me.role === 'caregiver' ? me.displayName : 'Mi cuenta'}</span>
        <ChevronDown aria-hidden className={cx('hidden size-5 text-ink-soft sm:block motion-safe:transition-[rotate] motion-safe:duration-200', open && 'rotate-180')} strokeWidth={2.25} />
      </button>
      {open && (
        <div id={panelId} className="animate-pop absolute right-0 z-40 mt-2 w-72 overflow-hidden rounded-[20px] bg-surface p-2 shadow-pop">
          <div className="px-3 pt-2 pb-3">
            <div className="font-semibold">{me.displayName}</div>
            <div className="text-sm text-muted">{me.role === 'family' ? me.family?.name : 'Cuenta de cuidadora'}</div>
          </div>
          <ul>
            {items.map((it) => (
              <li key={it.to}>
                <Link to={it.to} onClick={() => close()} className="flex min-h-12 items-center gap-3 rounded-xl px-3 hover:bg-accent-subtle">
                  <it.icon aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="my-1 border-t border-line" />
          <button
            type="button"
            onClick={() => {
              logout()
              close()
              navigate('/')
            }}
            className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-start hover:bg-accent-subtle"
          >
            <LogOut aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

function useMainLinks() {
  const me = useMe()
  return [
    { to: '/buscar', label: 'Buscar cuidadora', icon: Search },
    { to: '/servicio-integral', label: 'Ayuda en la selección', icon: Handshake },
    { to: '/registro/cuidadora', label: 'Trabajar como cuidadora', icon: BriefcaseBusiness, hide: me.role !== 'guest' },
    { to: '/confianza', label: 'Confianza', icon: CircleCheck },
  ].filter((l) => !l.hide)
}

function DesktopNav() {
  const links = useMainLinks()
  return (
    <nav aria-label="Principal" className="hidden xl:block">
      <ul className="flex items-center gap-1">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              className={({ isActive }) =>
                cx('flex min-h-11 items-center rounded-full px-4 font-medium transition-[background-color,color] duration-150', isActive ? 'bg-accent-soft text-accent-strong' : 'text-ink hover:bg-sunken')
              }
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function MainMenu() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const links = [{ to: '/', label: 'Inicio', icon: House }, ...useMainLinks(), { to: '/#como-funciona', label: '¿Cómo funciona?', icon: Info }]
  const ref = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  useEffect(() => setOpen(false), [loc.pathname, loc.hash])
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) {
      d.close()
      triggerRef.current?.focus()
    }
  }, [open])
  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="pressable flex min-h-12 items-center gap-2 rounded-full border-2 border-line px-3 font-semibold text-ink hover:bg-sunken sm:px-4 xl:hidden">
        <Menu aria-hidden className="size-6" strokeWidth={2.25} />
        <span className="max-sm:sr-only">Menú</span>
      </button>
      <dialog
        ref={ref}
        aria-label="Menú principal"
        onCancel={(e) => {
          e.preventDefault()
          setOpen(false)
        }}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        className="animate-drawer m-0 ms-auto h-dvh max-h-none w-[min(88vw,380px)] overflow-y-auto overscroll-contain bg-surface p-0 shadow-pop"
      >
        {open && (
          <div className="flex min-h-full flex-col">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú" className={iconBtn}>
                <X aria-hidden className="size-6" strokeWidth={2.25} />
              </button>
            </div>
            <nav aria-label="Principal" className="flex-1 p-3">
              <ul>
                {links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="flex min-h-14 items-center gap-4 rounded-2xl px-3 text-lg font-medium hover:bg-accent-subtle">
                      <span aria-hidden className="flex size-10 items-center justify-center rounded-full bg-accent-subtle text-accent">
                        <l.icon className="size-5" strokeWidth={2} />
                      </span>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-line p-5 text-sm text-muted">María te Cuida · Demo con datos ficticios</div>
          </div>
        )}
      </dialog>
    </>
  )
}

export function Header() {
  const me = useMe()
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center gap-2 px-4 sm:h-[84px] sm:gap-3 sm:px-6">
        <Logo />
        <div className="flex-1" />
        <DesktopNav />
        {me.role === 'guest' ? (
          <Link to="/login" className="pressable flex min-h-12 items-center gap-2 rounded-full bg-accent-soft px-4 font-semibold text-accent-strong hover:bg-accent-line sm:px-5">
            <User aria-hidden className="size-5" strokeWidth={2.25} />
            <span>
              <span className="max-sm:hidden">Iniciar sesión</span>
              <span className="sm:hidden">Entrar</span>
            </span>
          </Link>
        ) : (
          <>
            <Notifications />
            <AccountMenu />
          </>
        )}
        <MainMenu />
      </div>
    </header>
  )
}

/** Curva suave que recuerda los trazos del logo. Decorativa. */
export function Waves({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 1440 80" preserveAspectRatio="none" className={cx('pointer-events-none block h-10 w-full sm:h-16', className)}>
      <path d="M0 48 C 260 8 480 8 760 40 S 1220 76 1440 28 V80 H0Z" fill="var(--teal-100)" />
      <path d="M0 66 C 320 40 560 56 800 70 S 1200 60 1440 54 V80 H0Z" fill="var(--rose-100)" opacity="0.8" />
    </svg>
  )
}

function Footer() {
  return (
    <footer className="mt-auto">
      <Waves />
      <div className="bg-accent-subtle">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <img src={img('logo.png')} alt="María te Cuida" className="h-11 w-auto" />
            <p className="mt-3 max-w-xs text-ink-soft">Cuidado de personas, con confianza y cercanía.</p>
          </div>
          <nav aria-label="Enlaces del pie">
            <h2 className="text-sm font-semibold text-ink">María te Cuida</h2>
            <ul className="mt-2">
              {[
                ['/buscar', 'Buscar cuidadora'],
                ['/servicio-integral', 'Ayuda en la selección'],
                ['/confianza', 'Documentación y confianza'],
                ['/registro/cuidadora', 'Trabajar como cuidadora'],
              ].map(([to, l]) => (
                <li key={to}>
                  <Link to={to} className="inline-flex min-h-11 items-center text-ink-soft underline decoration-accent-line underline-offset-4 hover:text-ink hover:decoration-accent">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="text-sm font-semibold text-ink">¿Hablamos?</h2>
            <ul className="mt-3 space-y-2 text-ink-soft">
              <li className="flex items-center gap-2.5">
                <Phone aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
                956 000 000
              </li>
              <li className="flex items-center gap-2.5">
                <Mail aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
                hola@mariatecuida.es
              </li>
              <li className="text-sm text-muted">Lunes a viernes, de 9:00 a 19:00</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-accent-line">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-x-6 gap-y-1 px-4 py-4 text-sm text-ink-soft sm:px-6">
            <span>© {new Date().getFullYear()} María te Cuida</span>
            <span>Demo con datos ficticios</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function CaregiverTabBar() {
  const me = useMe()
  const pending = me.myRequests.filter((r) => r.status === 'pendiente').length
  const tabs = [
    { to: '/cuidadora', label: 'Inicio', icon: House, end: true, badge: 0 },
    { to: '/cuidadora/solicitudes', label: 'Solicitudes', icon: Handshake, badge: pending },
    { to: '/mensajes', label: 'Mensajes', icon: MessageCircleMore, badge: me.unreadMessages },
    { to: '/cuidadora/perfil', label: 'Mi perfil', icon: User, badge: 0 },
  ]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Accesos de cuidadora">
      <ul className="grid grid-cols-4">
        {tabs.map((t) => (
          <li key={t.to}>
            <NavLink to={t.to} end={t.end} className={({ isActive }) => cx('relative flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold', isActive ? 'text-accent' : 'text-ink-soft')}>
              {({ isActive }) => (
                <>
                  <span aria-hidden className={cx('relative flex h-8 w-14 items-center justify-center rounded-full transition-[background-color] duration-150', isActive && 'bg-accent-soft')}>
                    <t.icon className="size-6" strokeWidth={isActive ? 2.25 : 1.75} />
                    {t.badge > 0 && (
                      <span className="absolute -top-1 right-1.5 flex min-w-5 items-center justify-center rounded-full bg-care px-1 text-xs font-bold text-white tabular-nums ring-2 ring-surface">{t.badge}</span>
                    )}
                  </span>
                  {t.label}
                  {t.badge > 0 && <span className="sr-only">, {t.badge} pendientes</span>}
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
    <div role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6">
      {toasts.map((t) => (
        <div key={t.id} className="animate-pop pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl bg-accent-strong py-2 ps-4 pe-2 text-white shadow-pop">
          {t.tone === 'ok' ? <CircleCheck aria-hidden className="mt-2.5 size-5 shrink-0 text-accent-on-dark" /> : <Info aria-hidden className="mt-2.5 size-5 shrink-0 text-accent-on-dark" />}
          <span className="flex-1 py-2">{t.text}</span>
          <button type="button" onClick={() => dismissToast(t.id)} aria-label="Cerrar aviso" className="on-dark flex size-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10">
            <X aria-hidden className="size-5" />
          </button>
        </div>
      ))}
    </div>
  )
}

function DemoOption({ role, current, onPick, icon: Icon, title, sub }: { role: 'guest' | 'family' | 'caregiver'; current: string; onPick: (r: 'guest' | 'family' | 'caregiver') => void; icon: typeof Users; title: string; sub: string }) {
  const active = current === role
  return (
    <button type="button" aria-pressed={active} onClick={() => onPick(role)} className={cx('flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-start hover:bg-accent-subtle', active && 'bg-accent-subtle ring-2 ring-accent-line')}>
      <Icon aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
      <span className="flex-1">
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-muted">{sub}</span>
      </span>
      {active && <CircleCheck aria-hidden className="size-5 text-accent" />}
    </button>
  )
}

/** Panel flotante para presentar la demo: cambiar de rol y reiniciar datos. */
function DemoPanel() {
  const { loginAs, resetDemo, toast } = useStore()
  const me = useMe()
  const navigate = useNavigate()
  const { open, setOpen, close, ref, buttonRef } = usePopover()
  const panelId = useId()
  const go = (role: 'guest' | 'family' | 'caregiver') => {
    loginAs(role, role === 'family' ? DEMO_FAMILY_ID : role === 'caregiver' ? DEMO_CAREGIVER_ID : undefined)
    close()
    navigate(role === 'family' ? '/familia' : role === 'caregiver' ? '/cuidadora' : '/')
  }
  return (
    <div ref={ref} className={cx('fixed left-3 z-40 md:bottom-5 md:left-5', me.role === 'caregiver' ? 'bottom-[88px]' : 'bottom-4')}>
      {open && (
        <div id={panelId} className="animate-pop mb-2 w-[min(calc(100vw-1.5rem),300px)] rounded-[20px] bg-surface p-2 shadow-pop">
          <h2 className="px-3 pt-2 pb-2 text-sm font-semibold text-muted">Modo demo · Ver como</h2>
          <DemoOption current={me.role} onPick={go} role="family" icon={Users} title="Familia" sub="Lucía Martínez · Familia Martínez" />
          <DemoOption current={me.role} onPick={go} role="caregiver" icon={BriefcaseBusiness} title="Cuidadora" sub="Ana García · Jerez" />
          <DemoOption current={me.role} onPick={go} role="guest" icon={UserRound} title="Visitante" sub="Sin iniciar sesión" />
          <div className="mt-1 border-t border-line pt-1">
            <button
              type="button"
              onClick={() => {
                resetDemo()
                close(true)
                toast('Datos de la demo restablecidos.')
              }}
              className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-start hover:bg-care-subtle"
            >
              <RotateCcw aria-hidden className="size-5 text-care" strokeWidth={2} />
              Reiniciar datos de la demo
            </button>
          </div>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Modo demo"
        className="pressable flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-ink px-3.5 font-semibold text-white shadow-pop hover:bg-accent-strong sm:px-4"
      >
        <FlaskConical aria-hidden className="size-5" strokeWidth={2} />
        <span aria-hidden className="max-sm:hidden">
          Demo
        </span>
      </button>
    </div>
  )
}

/**
 * Al cambiar de página: título del documento, scroll arriba y foco en el h1,
 * para que lectores de pantalla y teclado empiecen por el contenido nuevo.
 */
function useRouteFocus() {
  const loc = useLocation()
  const first = useRef(true)
  useEffect(() => {
    const h1 = document.querySelector<HTMLElement>('main h1')
    document.title = h1?.textContent ? `${h1.textContent.trim()} · María te Cuida` : 'María te Cuida'
    if (loc.hash) {
      const el = document.getElementById(loc.hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
        el.querySelector<HTMLElement>('h2')?.setAttribute('tabindex', '-1')
        el.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
        return
      }
    }
    window.scrollTo(0, 0)
    if (first.current) {
      first.current = false
      return
    }
    if (h1) {
      h1.setAttribute('tabindex', '-1')
      h1.focus({ preventScroll: true })
    }
  }, [loc.pathname, loc.hash])
}

export function AppLayout() {
  const me = useMe()
  useRouteFocus()
  const showTabs = me.role === 'caregiver'
  return (
    <div className={cx('flex min-h-dvh flex-col', showTabs && 'pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0')}>
      <a href="#main" className="fixed top-3 left-3 z-[70] -translate-y-24 rounded-full bg-accent-strong px-5 py-3 font-semibold text-white shadow-pop focus:translate-y-0">
        Saltar al contenido
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1">
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
