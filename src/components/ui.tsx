import { useEffect, useId, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  Check,
  ChevronDown,
  Info,
  ShieldCheck,
  Star,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cx, initials } from '../lib/format'
import { DAYS } from '../data/catalog'
import type { Caregiver, DocStatus } from '../data/types'

/* ---------------------------------- Botones ---------------------------------- */

type Variant = 'primary' | 'outline' | 'rosa' | 'soft' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-gradient-to-b from-brand-600 to-brand-800 text-white shadow-[0_6px_16px_-6px_rgb(12_101_102/0.6)] hover:from-brand-500 hover:to-brand-700',
  outline: 'border-[1.5px] border-brand-700 text-brand-800 bg-white hover:bg-brand-50',
  rosa: 'bg-gradient-to-b from-rosa-500 to-rosa-600 text-white shadow-[0_6px_16px_-6px_rgb(219_90_124/0.6)] hover:brightness-105',
  soft: 'bg-brand-100 text-brand-900 hover:bg-brand-200/70',
  ghost: 'text-brand-800 hover:bg-brand-50',
  danger: 'border-[1.5px] border-rosa-300 text-rosa-600 bg-white hover:bg-rosa-50',
}
const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-[15px] gap-2',
  lg: 'h-14 px-7 text-lg gap-3',
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  to?: string
  icon?: LucideIcon
  iconRight?: LucideIcon
  block?: boolean
}

export function Button({ variant = 'primary', size = 'md', to, icon: Icon, iconRight: IconR, block, className, children, ...rest }: BtnProps) {
  const cls = cx(
    'inline-flex items-center justify-center rounded-full font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap',
    variants[variant],
    sizes[size],
    block && 'w-full',
    className,
  )
  const inner = (
    <>
      {Icon && <Icon className={size === 'lg' ? 'size-6' : 'size-[18px]'} strokeWidth={2} />}
      {children}
      {IconR && <IconR className={size === 'lg' ? 'size-6' : 'size-[18px]'} strokeWidth={2.2} />}
    </>
  )
  if (to)
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    )
  return (
    <button type="button" className={cls} {...rest}>
      {inner}
    </button>
  )
}

/* ---------------------------------- Distintivos ---------------------------------- */

export function TrustedBadge({ size = 'md', solid = true }: { size?: 'sm' | 'md'; solid?: boolean }) {
  return (
    <span
      title="Profesional que ya ha trabajado con familias a través de la plataforma y cuyo trabajo ha sido valorado positivamente por el equipo."
      className={cx(
        'inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap',
        solid ? 'bg-brand-900 text-white' : 'bg-brand-100 text-brand-900',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      )}
    >
      <ShieldCheck className={size === 'sm' ? 'size-3.5' : 'size-4'} />
      Cuidadora de confianza
    </span>
  )
}

export function VerifiedBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span
      title="El equipo de María te Cuida ha revisado la documentación aportada."
      className={cx(
        'inline-flex items-center gap-1 rounded-full bg-brand-100 font-semibold text-brand-800 whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      )}
    >
      <BadgeCheck className={size === 'sm' ? 'size-3.5' : 'size-4'} />
      Documentación revisada
    </span>
  )
}

export function CaregiverBadges({ c, size = 'md' }: { c: Caregiver; size?: 'sm' | 'md' }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {c.trusted && <TrustedBadge size={size} />}
      {c.docsStatus === 'revisada' && <VerifiedBadge size={size} />}
      {!c.trusted && c.docsStatus !== 'revisada' && (
        <span className={cx('inline-flex items-center rounded-full bg-amber-soft font-semibold text-amber-ink', size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm')}>
          Nueva en la plataforma
        </span>
      )}
    </div>
  )
}

export function DocStatusChip({ status }: { status: DocStatus }) {
  const map = {
    revisada: ['bg-brand-100 text-brand-800', 'Revisada'],
    en_revision: ['bg-slate-100 text-slate-600', 'En revisión'],
    pendiente: ['bg-amber-soft text-amber-ink', 'Pendiente'],
  } as const
  const [cls, label] = map[status]
  return <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', cls)}>{label}</span>
}

export function Stars({ rating, reviews, size = 'md' }: { rating: number; reviews: number; size?: 'sm' | 'md' }) {
  if (!reviews) return <span className="text-sm text-muted">Sin valoraciones todavía</span>
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`${rating.toFixed(1)} de 5 estrellas, ${reviews} valoraciones`}>
      <span className="inline-flex">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, rating - i))
          return (
            <span key={i} className="relative inline-block">
              <Star className={cx(size === 'sm' ? 'size-3.5' : 'size-[18px]', 'fill-slate-200 text-slate-200')} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={cx(size === 'sm' ? 'size-3.5' : 'size-[18px]', 'fill-amber-400 text-amber-400')} />
              </span>
            </span>
          )
        })}
      </span>
      <span className={cx('text-ink-soft', size === 'sm' ? 'text-xs' : 'text-sm')}>({reviews} valoraciones)</span>
    </span>
  )
}

/* ---------------------------------- Avatar ---------------------------------- */

const AVATAR_TONES = [
  'from-brand-200 to-brand-400 text-brand-950',
  'from-rosa-100 to-rosa-300 text-rosa-600',
  'from-amber-100 to-amber-300 text-amber-800',
  'from-sky-100 to-sky-300 text-sky-800',
  'from-violet-100 to-violet-300 text-violet-800',
]

export function Avatar({ name, photo, size = 56, ring, className }: { name: string; photo?: string; size?: number; ring?: boolean; className?: string }) {
  const tone = AVATAR_TONES[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AVATAR_TONES.length]
  return (
    <span
      className={cx('relative inline-flex shrink-0 overflow-hidden rounded-full', ring && 'ring-4 ring-white shadow-card', className)}
      style={{ width: size, height: size }}
    >
      {photo ? (
        <img src={photo} alt="" className="size-full object-cover" />
      ) : (
        <span className={cx('flex size-full items-center justify-center bg-gradient-to-br font-semibold', tone)} style={{ fontSize: size * 0.36 }}>
          {initials(name)}
        </span>
      )}
    </span>
  )
}

/* ---------------------------------- Formularios ---------------------------------- */

export function Field({ label, required, hint, error, children, className }: { label?: ReactNode; required?: boolean; hint?: ReactNode; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 font-semibold text-ink">
          {label}
          {required && <span className="text-rosa-600"> *</span>}
        </div>
      )}
      {hint && <div className="-mt-1 mb-2 text-sm text-muted">{hint}</div>}
      {children}
      {error && <p className="mt-1.5 text-sm font-medium text-rosa-600">{error}</p>}
    </div>
  )
}

export function IconInput({ icon: Icon, right, invalid, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: LucideIcon; right?: ReactNode; invalid?: boolean }) {
  return (
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-brand-800" />}
      <input {...rest} className={cx('input-base', Icon && 'pl-12', right ? 'pr-12' : '', invalid && 'border-rosa-500')} />
      {right && <div className="absolute top-1/2 right-3 -translate-y-1/2">{right}</div>}
    </div>
  )
}

export function Select({ value, onChange, options, placeholder, invalid, className, 'aria-label': ariaLabel }: { value: string; onChange: (v: string) => void; options: { id: string; label: string }[] | string[]; placeholder?: string; invalid?: boolean; className?: string; 'aria-label'?: string }) {
  const opts = options.map((o) => (typeof o === 'string' ? { id: o, label: o } : o))
  return (
    <div className={cx('relative', className)}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx('input-base appearance-none pr-11', !value && 'text-muted', invalid && 'border-rosa-500')}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {opts.map((o) => (
          <option key={o.id} value={o.id} className="text-ink">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink" />
    </div>
  )
}

export function Textarea({ value, onChange, max, placeholder, rows = 4, invalid }: { value: string; onChange: (v: string) => void; max: number; placeholder?: string; rows?: number; invalid?: boolean }) {
  return (
    <div>
      <textarea
        value={value}
        maxLength={max}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cx('input-base resize-none leading-relaxed', invalid && 'border-rosa-500')}
      />
      <div className="mt-1 text-right text-sm text-muted">
        {value.length} / {max}
      </div>
    </div>
  )
}

export function Checkbox({ checked, onChange, label, className }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; className?: string }) {
  return (
    <label className={cx('group flex cursor-pointer items-start gap-3 py-1.5', className)}>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        className={cx(
          'mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-md border-2 transition peer-focus-visible:ring-4 peer-focus-visible:ring-brand-200',
          checked ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white group-hover:border-brand-500',
        )}
      >
        {checked && <Check className="size-4" strokeWidth={3} />}
      </span>
      <span className="text-[15px] leading-snug text-ink">{label}</span>
    </label>
  )
}

export function RadioCard({ checked, onChange, children, className }: { checked: boolean; onChange: () => void; children: ReactNode; className?: string }) {
  return (
    <label
      className={cx(
        'flex cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 transition',
        checked ? 'border-brand-700 bg-brand-50' : 'border-line bg-white hover:border-brand-400',
        className,
      )}
    >
      <input type="radio" className="peer sr-only" checked={checked} onChange={onChange} />
      <span className={cx('flex size-6 shrink-0 items-center justify-center rounded-full border-2 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-200', checked ? 'border-brand-700' : 'border-slate-300')}>
        {checked && <span className="size-3 rounded-full bg-brand-700" />}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  )
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        'inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[15px] font-medium transition',
        active ? 'border-brand-700 bg-brand-700 text-white' : 'border-line bg-white text-ink hover:border-brand-400',
      )}
    >
      {active && <Check className="size-4" strokeWidth={3} />}
      {children}
    </button>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition', checked ? 'bg-emerald-600' : 'bg-slate-300')}
    >
      <span className={cx('absolute size-6 rounded-full bg-white shadow transition-all', checked ? 'left-7' : 'left-1')} />
    </button>
  )
}

/* ---------------------------------- Bloques ---------------------------------- */

export function Accordion({ icon: Icon, title, hint, count, defaultOpen = false, children }: { icon?: LucideIcon; title: string; hint?: string; count?: number; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <div className={cx('overflow-hidden rounded-2xl border border-line bg-white transition', open && 'shadow-card')}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 bg-gradient-to-r from-brand-50 to-white px-4 py-3.5 text-left sm:px-5"
      >
        {Icon && <Icon className="size-8 shrink-0 text-brand-800" strokeWidth={1.6} />}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[17px] font-semibold text-ink">
            {title}
            {!!count && <span className="rounded-full bg-brand-700 px-2 py-0.5 text-xs font-bold text-white">{count}</span>}
          </span>
          {hint && <span className="mt-0.5 block text-sm leading-snug text-ink-soft">{hint}</span>}
        </span>
        <ChevronDown className={cx('size-6 shrink-0 text-ink transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div id={id} className="border-t border-line px-4 py-3 sm:px-5">
          {children}
        </div>
      )}
    </div>
  )
}

export function SectionCard({ icon: Icon, title, action, children, className }: { icon?: LucideIcon; title: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('card overflow-hidden', className)}>
      <header className="flex items-center gap-3 bg-gradient-to-r from-brand-50 to-white px-5 py-3.5">
        {Icon && <Icon className="size-7 text-brand-700" strokeWidth={1.7} />}
        <h2 className="flex-1 text-lg font-semibold">{title}</h2>
        {action}
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

export function InfoNote({ children, tone = 'brand', icon: Icon = Info }: { children: ReactNode; tone?: 'brand' | 'rosa'; icon?: LucideIcon }) {
  return (
    <div className={cx('flex items-start gap-3 rounded-2xl px-4 py-3 text-[15px]', tone === 'brand' ? 'bg-brand-50 text-ink' : 'bg-rosa-50 text-ink')}>
      <Icon className={cx('mt-0.5 size-5 shrink-0', tone === 'brand' ? 'text-brand-700' : 'text-rosa-600')} />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function DaysRow({ days, onToggle, size = 'md' }: { days: number[]; onToggle?: (d: number) => void; size?: 'sm' | 'md' }) {
  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {DAYS.map((d, i) => {
        const on = days.includes(i)
        const box = (
          <>
            <span className={cx('flex w-full items-center justify-center rounded-lg border font-semibold', size === 'sm' ? 'h-8 text-sm' : 'h-10', onToggle && on ? 'border-brand-700 bg-brand-700 text-white' : 'border-brand-200 bg-brand-50 text-ink')}>{d}</span>
            {!onToggle && (
              <span className={cx('flex size-6 items-center justify-center rounded-md', on ? 'bg-brand-600 text-white' : 'border-[1.5px] border-slate-300 bg-white')}>
                {on && <Check className="size-4" strokeWidth={3} />}
              </span>
            )}
          </>
        )
        return onToggle ? (
          <button key={d} type="button" aria-pressed={on} onClick={() => onToggle(i)} className="flex flex-col items-center gap-1.5">
            {box}
          </button>
        ) : (
          <div key={d} className="flex flex-col items-center gap-1.5" aria-label={`${d}: ${on ? 'disponible' : 'no disponible'}`}>
            {box}
          </div>
        )
      })}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cx('animate-pop max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-pop sm:rounded-3xl', wide ? 'sm:max-w-2xl' : 'sm:max-w-md')}
      >
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-white px-6 py-4">
          <h2 className="flex-1 text-xl font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-1.5 text-muted hover:bg-brand-50 hover:text-ink">
            <X className="size-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export function IconBubble({ icon: Icon, tone = 'brand', size = 'md' }: { icon: LucideIcon; tone?: 'brand' | 'rosa'; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg' ? 'size-16' : size === 'sm' ? 'size-10' : 'size-12'
  const i = size === 'lg' ? 'size-8' : size === 'sm' ? 'size-5' : 'size-6'
  return (
    <span className={cx('inline-flex shrink-0 items-center justify-center rounded-full', s, tone === 'brand' ? 'bg-brand-100 text-brand-700' : 'bg-rosa-100 text-rosa-600')}>
      <Icon className={i} strokeWidth={1.8} />
    </span>
  )
}

export function EmptyState({ icon: Icon, title, children, action }: { icon: LucideIcon; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <IconBubble icon={Icon} size="lg" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {children && <p className="mt-1 max-w-sm text-ink-soft">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function PageTitle({ icon: Icon, title, subtitle, children }: { icon?: LucideIcon; title: string; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {Icon && <IconBubble icon={Icon} size="lg" />}
      <div className="min-w-0 flex-1">
        <h1 className="text-[28px] leading-tight font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-[17px] text-ink-soft">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

/** Se muestra en páginas privadas cuando no hay sesión del tipo adecuado. */
export function LoginRequired({ next, role }: { next: string; role?: 'family' | 'caregiver' }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <ShieldCheck className="size-8" />
      </span>
      <h1 className="mt-5 text-3xl font-bold">Inicia sesión para continuar</h1>
      <p className="mt-2 text-lg text-ink-soft">
        {role === 'caregiver' ? 'Esta sección es para cuidadoras registradas.' : role === 'family' ? 'Esta sección es para familias registradas.' : 'Necesitas una cuenta para ver esta sección.'}
      </p>
      <Button to={`/login?next=${encodeURIComponent(next)}`} size="lg" className="mt-7">
        Iniciar sesión
      </Button>
    </div>
  )
}
