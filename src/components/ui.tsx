import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleAlert,
  Clock,
  Info,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cx, initials } from '../lib/format'
import { DAYS, DAY_NAMES } from '../data/catalog'
import type { Caregiver, DocStatus } from '../data/types'

/* ---------------------------------- Botones ---------------------------------- */

type Variant = 'primary' | 'care' | 'outline' | 'soft' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white shadow-[0_1px_2px_oklch(0_0_0/0.12)] hover:bg-accent-hover',
  care: 'bg-care text-white shadow-[0_1px_2px_oklch(0_0_0/0.12)] hover:bg-care-hover',
  outline: 'border-2 border-accent bg-surface text-accent hover:bg-accent-subtle',
  soft: 'bg-accent-soft text-accent-strong hover:bg-accent-line',
  ghost: 'text-accent hover:bg-accent-subtle',
  danger: 'border-2 border-care bg-surface text-care hover:bg-care-subtle',
}
// Alturas: 44, 48 y 56px. El lado del icono lleva 2px menos de relleno (alineación óptica).
const sizes: Record<Size, { base: string; start: string; end: string; icon: string }> = {
  sm: { base: 'min-h-11 px-4 text-sm gap-2', start: 'ps-3.5', end: 'pe-3.5', icon: 'size-[18px]' },
  md: { base: 'min-h-12 px-6 text-base gap-2.5', start: 'ps-[22px]', end: 'pe-[22px]', icon: 'size-5' },
  lg: { base: 'min-h-14 px-7 text-lg gap-3', start: 'ps-[26px]', end: 'pe-[26px]', icon: 'size-6' },
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
  const s = sizes[size]
  const cls = cx(
    'pressable inline-flex items-center justify-center rounded-full py-2 text-center leading-tight font-semibold',
    'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-sunken disabled:text-muted disabled:shadow-none',
    variants[variant],
    s.base,
    Icon && s.start,
    IconR && s.end,
    block && 'w-full',
    className,
  )
  const inner = (
    <>
      {Icon && <Icon aria-hidden className={cx(s.icon, 'shrink-0')} strokeWidth={2.25} />}
      {children}
      {IconR && <IconR aria-hidden className={cx(s.icon, 'shrink-0')} strokeWidth={2.25} />}
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

/** Enlace para volver atrás: discreto, con flecha y objetivo táctil de 44px. */
export function BackLink({ to, onClick, children }: { to?: string; onClick?: () => void; children: ReactNode }) {
  const cls = 'pressable -ms-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-semibold text-accent hover:bg-accent-subtle'
  const inner = (
    <>
      <ArrowLeft aria-hidden className="size-5" strokeWidth={2.25} />
      {children}
    </>
  )
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}

/* ---------------------------------- Distintivos ---------------------------------- */

const badgeSize = (size: 'sm' | 'md') => (size === 'sm' ? 'gap-1 px-2.5 py-0.5 text-xs' : 'gap-1.5 px-3 py-1 text-sm')
const badgeIcon = (size: 'sm' | 'md') => (size === 'sm' ? 'size-3.5' : 'size-4')

export function TrustedBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span className={cx('inline-flex items-center rounded-full bg-accent-strong font-semibold whitespace-nowrap text-white', badgeSize(size))}>
      <ShieldCheck aria-hidden className={badgeIcon(size)} strokeWidth={2.25} />
      Cuidadora de confianza
    </span>
  )
}

export function VerifiedBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span className={cx('inline-flex items-center rounded-full bg-accent-soft font-semibold whitespace-nowrap text-accent-strong', badgeSize(size))}>
      <BadgeCheck aria-hidden className={badgeIcon(size)} strokeWidth={2.25} />
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
        <span className={cx('inline-flex items-center rounded-full bg-warn-soft font-semibold whitespace-nowrap text-warn-ink', badgeSize(size))}>
          <Sparkles aria-hidden className={badgeIcon(size)} strokeWidth={2.25} />
          Nueva en la plataforma
        </span>
      )}
    </div>
  )
}

export function DocStatusChip({ status }: { status: DocStatus }) {
  const map = {
    revisada: ['bg-ok-soft text-ok-ink', 'Revisada', Check],
    en_revision: ['bg-off-soft text-off-ink', 'En revisión', Clock],
    pendiente: ['bg-warn-soft text-warn-ink', 'Pendiente', CircleAlert],
  } as const
  const [cls, label, Icon] = map[status]
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap', cls)}>
      <Icon aria-hidden className="size-4" strokeWidth={2.5} />
      {label}
    </span>
  )
}

/** Disponible / No disponible: color + icono + texto. */
export function AvailabilityPill({ available, size = 'md' }: { available: boolean; size?: 'sm' | 'md' }) {
  return (
    <span className={cx('inline-flex items-center rounded-full font-semibold whitespace-nowrap', badgeSize(size), available ? 'bg-ok-soft text-ok-ink' : 'bg-off-soft text-off-ink')}>
      <span aria-hidden className={cx('rounded-full', size === 'sm' ? 'size-2' : 'size-2.5', available ? 'bg-ok' : 'bg-off')} />
      {available ? 'Disponible' : 'No disponible'}
    </span>
  )
}

export function Stars({ rating, reviews, size = 'md' }: { rating: number; reviews: number; size?: 'sm' | 'md' }) {
  if (!reviews) return <span className={cx('text-muted', size === 'sm' ? 'text-sm' : 'text-base')}>Sin valoraciones todavía</span>
  const s = size === 'sm' ? 'size-4' : 'size-5'
  const value = rating.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return (
    <span className={cx('inline-flex flex-wrap items-center gap-x-2 gap-y-0.5', size === 'sm' ? 'text-sm' : 'text-base')}>
      <span role="img" aria-label={`${value} de 5 estrellas`} className="inline-flex">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, rating - i))
          return (
            <span key={i} className="relative inline-block">
              <Star aria-hidden className={cx(s, 'fill-line text-line')} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star aria-hidden className={cx(s, 'fill-star text-star')} />
              </span>
            </span>
          )
        })}
      </span>
      <span className="text-ink-soft tabular-nums">
        <span className="font-semibold text-ink">{value}</span> · {reviews} valoraciones
      </span>
    </span>
  )
}

/* ---------------------------------- Avatar ---------------------------------- */

const AVATAR_TONES = ['bg-accent-soft text-accent-strong', 'bg-care-soft text-care', 'bg-warn-soft text-warn-ink', 'bg-sunken text-ink-soft']

export function Avatar({ name, photo, size = 56, ring, className }: { name: string; photo?: string; size?: number; ring?: boolean; className?: string }) {
  const tone = AVATAR_TONES[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AVATAR_TONES.length]
  return (
    <span className={cx('relative inline-flex shrink-0 overflow-hidden rounded-full', ring && 'ring-4 ring-surface', className)} style={{ width: size, height: size }}>
      {photo ? (
        <img src={photo} alt="" className="size-full rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10" />
      ) : (
        <span aria-hidden className={cx('flex size-full items-center justify-center font-semibold', tone)} style={{ fontSize: size * 0.36 }}>
          {initials(name)}
        </span>
      )}
    </span>
  )
}

/* ---------------------------------- Formularios ---------------------------------- */

type FieldCtx = { id: string; describedBy?: string; invalid: boolean; required?: boolean }
const FieldContext = createContext<FieldCtx | null>(null)

/** Lee el contexto del campo para enlazar etiqueta, ayuda y error con el control. */
function useField(props: { id?: string; invalid?: boolean; 'aria-describedby'?: string; required?: boolean }) {
  const ctx = useContext(FieldContext)
  const describedBy = [props['aria-describedby'], ctx?.describedBy].filter(Boolean).join(' ') || undefined
  return {
    id: props.id ?? ctx?.id,
    'aria-describedby': describedBy,
    'aria-invalid': props.invalid || ctx?.invalid ? true : undefined,
    'aria-required': props.required || ctx?.required ? true : undefined,
  }
}

/**
 * Campo con etiqueta visible, ayuda y error enlazados al control.
 * `group` lo convierte en fieldset/legend para grupos de casillas o botones.
 */
export function Field({ label, required, hint, error, children, className, group }: { label?: ReactNode; required?: boolean; hint?: ReactNode; error?: string; children: ReactNode; className?: string; group?: boolean }) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const labelEl = label && (
    <>
      {label}
      {required && (
        <span aria-hidden className="text-care">
          {' '}
          *
        </span>
      )}
    </>
  )
  const body = (
    <>
      {hint && (
        <p id={hintId} className="-mt-0.5 mb-2 text-sm text-muted">
          {hint}
        </p>
      )}
      <FieldContext.Provider value={{ id, describedBy, invalid: !!error, required }}>{children}</FieldContext.Provider>
      {error && (
        <p id={errorId} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-care">
          <CircleAlert aria-hidden className="mt-0.5 size-[18px] shrink-0" strokeWidth={2.25} />
          {error}
        </p>
      )}
    </>
  )
  if (group)
    return (
      <fieldset className={cx('min-w-0', className)} aria-describedby={describedBy}>
        {label && <legend className="mb-2 font-semibold text-ink">{labelEl}</legend>}
        {body}
      </fieldset>
    )
  return (
    <div className={cx('min-w-0', className)}>
      {label && (
        <label htmlFor={id} className="mb-2 block font-semibold text-ink">
          {labelEl}
        </label>
      )}
      {body}
    </div>
  )
}

export function FormNote() {
  return (
    <p className="text-sm text-muted">
      Los campos marcados con <span className="text-care">*</span> son obligatorios.
    </p>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ invalid, className, ...rest }, ref) {
  const f = useField({ ...rest, invalid })
  return <input ref={ref} {...rest} {...f} className={cx('input-base', className)} />
})

export function IconInput({ icon: Icon, right, invalid, className, ...rest }: InputProps & { icon?: LucideIcon; right?: ReactNode }) {
  const f = useField({ ...rest, invalid })
  return (
    <div className="relative">
      {Icon && <Icon aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-accent-icon" strokeWidth={2} />}
      <input {...rest} {...f} className={cx('input-base', Icon && 'ps-12', right ? 'pe-14' : '', className)} />
      {right && <div className="absolute top-1/2 right-1.5 -translate-y-1/2">{right}</div>}
    </div>
  )
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  invalid,
  className,
  id,
  'aria-label': ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  options: { id: string; label: string }[] | string[]
  placeholder?: string
  invalid?: boolean
  className?: string
  id?: string
  'aria-label'?: string
}) {
  const f = useField({ id, invalid })
  const opts = options.map((o) => (typeof o === 'string' ? { id: o, label: o } : o))
  return (
    <div className={cx('relative', className)}>
      <select {...f} aria-label={ariaLabel} value={value} onChange={(e) => onChange(e.target.value)} className={cx('input-base appearance-none pe-12', !value && 'text-muted')}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {opts.map((o) => (
          <option key={o.id} value={o.id} className="text-ink">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink-soft" strokeWidth={2.25} />
    </div>
  )
}

export function Textarea({ value, onChange, max, placeholder, rows = 4, invalid, id, 'aria-label': ariaLabel }: { value: string; onChange: (v: string) => void; max: number; placeholder?: string; rows?: number; invalid?: boolean; id?: string; 'aria-label'?: string }) {
  const counterId = useId()
  const f = useField({ id, invalid, 'aria-describedby': counterId })
  return (
    <div>
      <textarea {...f} aria-label={ariaLabel} value={value} maxLength={max} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="input-base resize-y leading-relaxed" />
      <div id={counterId} className="mt-1.5 text-end text-sm text-muted tabular-nums">
        {value.length} de {max} caracteres
      </div>
    </div>
  )
}

export function Checkbox({ checked, onChange, label, className }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; className?: string }) {
  const f = useField({})
  return (
    <label className={cx('group flex min-h-11 cursor-pointer items-start gap-3 py-2', className)}>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-describedby={f['aria-describedby']} aria-invalid={f['aria-invalid']} />
      <span
        aria-hidden
        className={cx(
          'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-[background-color,border-color] duration-150',
          'peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus',
          checked ? 'border-accent bg-accent text-white' : 'border-field bg-surface group-hover:border-accent',
        )}
      >
        {checked && <Check className="size-4" strokeWidth={3} />}
      </span>
      <span className="leading-snug text-ink">{label}</span>
    </label>
  )
}

export function RadioCard({ checked, onChange, children, className, name }: { checked: boolean; onChange: () => void; children: ReactNode; className?: string; name?: string }) {
  return (
    <label
      className={cx(
        'flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3.5 transition-[background-color,border-color] duration-150',
        'has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus',
        checked ? 'border-accent bg-accent-subtle' : 'border-line bg-surface hover:border-accent-line',
        className,
      )}
    >
      <input type="radio" name={name} className="sr-only" checked={checked} onChange={onChange} />
      <span aria-hidden className={cx('flex size-6 shrink-0 items-center justify-center rounded-full border-2', checked ? 'border-accent' : 'border-field')}>
        {checked && <span className="size-3 rounded-full bg-accent" />}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  )
}

export function Chip({ active, onClick, children, label }: { active: boolean; onClick: () => void; children: ReactNode; label?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={cx(
        'pressable inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 px-4 font-medium',
        active ? 'border-accent bg-accent ps-3 text-white' : 'border-line bg-surface text-ink hover:border-accent-line hover:bg-accent-subtle',
      )}
    >
      {active && <Check aria-hidden className="size-[18px]" strokeWidth={3} />}
      {children}
    </button>
  )
}

/* ---------------------------------- Bloques ---------------------------------- */

export function Accordion({ icon: Icon, title, hint, count, defaultOpen = false, children }: { icon?: LucideIcon; title: string; hint?: string; count?: number; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <div className={cx('card overflow-hidden', open && 'shadow-card-hover')}>
      <h3 className="text-base">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
          className="flex min-h-16 w-full items-center gap-4 px-4 py-4 text-start transition-[background-color] duration-150 hover:bg-accent-subtle sm:px-5"
        >
          {Icon && (
            <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent">
              <Icon className="size-6" strokeWidth={1.75} />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2 text-lg font-semibold text-ink">
              {title}
              {!!count && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-white tabular-nums">{count} {count === 1 ? 'marcada' : 'marcadas'}</span>}
            </span>
            {hint && <span className="mt-0.5 block text-sm font-normal text-ink-soft">{hint}</span>}
          </span>
          <ChevronDown aria-hidden className={cx('size-6 shrink-0 text-ink-soft motion-safe:transition-[rotate] motion-safe:duration-200', open && 'rotate-180')} strokeWidth={2.25} />
        </button>
      </h3>
      <div id={id} hidden={!open} className="border-t border-line px-4 py-3 sm:px-5">
        {open && children}
      </div>
    </div>
  )
}

export function SectionCard({ icon: Icon, title, action, children, className }: { icon?: LucideIcon; title: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('card p-5 sm:p-6', className)}>
      <header className="mb-4 flex items-center gap-3">
        {Icon && (
          <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent">
            <Icon className="size-5" strokeWidth={2} />
          </span>
        )}
        <h2 className="flex-1 text-xl font-semibold">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  )
}

export function InfoNote({ children, tone = 'brand', icon: Icon = Info }: { children: ReactNode; tone?: 'brand' | 'rosa'; icon?: LucideIcon }) {
  return (
    <div className={cx('flex items-start gap-3 rounded-2xl px-4 py-3.5', tone === 'brand' ? 'bg-accent-subtle text-ink' : 'bg-care-subtle text-ink')}>
      <Icon aria-hidden className={cx('mt-0.5 size-[22px] shrink-0', tone === 'brand' ? 'text-accent' : 'text-care')} strokeWidth={2} />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

/** Resumen de errores al enviar: se enfoca y se anuncia. */
export const ErrorSummary = forwardRef<HTMLDivElement, { errors: Record<string, string> }>(function ErrorSummary({ errors }, ref) {
  const list = Object.values(errors)
  if (!list.length) return null
  return (
    <div ref={ref} tabIndex={-1} role="alert" className="rounded-2xl border-2 border-care bg-care-subtle px-5 py-4">
      <p className="flex items-center gap-2 font-semibold text-care">
        <CircleAlert aria-hidden className="size-5" strokeWidth={2.25} />
        {list.length === 1 ? 'Falta un dato para continuar:' : `Faltan ${list.length} datos para continuar:`}
      </p>
      <ul className="mt-2 list-disc space-y-1 ps-6 text-ink">
        {list.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  )
})

/** Tras validar, lleva el foco al primer campo con error. */
export function focusFirstInvalid(root: ParentNode = document) {
  requestAnimationFrame(() => {
    const el = root.querySelector<HTMLElement>('[aria-invalid="true"]')
    el?.focus()
  })
}

export function DaysRow({ days, onToggle, size = 'md' }: { days: number[]; onToggle?: (d: number) => void; size?: 'sm' | 'md' }) {
  if (onToggle)
    return (
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {DAYS.map((d, i) => {
          const on = days.includes(i)
          return (
            <button
              key={d}
              type="button"
              aria-pressed={on}
              aria-label={DAY_NAMES[i]}
              onClick={() => onToggle(i)}
              className={cx('pressable flex min-h-12 flex-col items-center justify-center rounded-xl border-2 font-semibold', on ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink hover:border-accent-line')}
            >
              <span aria-hidden>{d}</span>
              <span aria-hidden className="h-4">
                {on && <Check className="size-4" strokeWidth={3} />}
              </span>
            </button>
          )
        })}
      </div>
    )
  return (
    <ul className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {DAYS.map((d, i) => {
        const on = days.includes(i)
        return (
          <li key={d} className={cx('flex flex-col items-center gap-1 rounded-xl py-2 font-semibold', size === 'sm' ? 'text-sm' : 'text-base', on ? 'bg-accent-soft text-accent-strong' : 'bg-sunken text-muted')}>
            <span aria-hidden>{d}</span>
            <span aria-hidden className="flex size-5 items-center justify-center">
              {on ? <Check className="size-4" strokeWidth={3} /> : <X className="size-3.5" strokeWidth={2.5} />}
            </span>
            <span className="sr-only">
              {DAY_NAMES[i]}: {on ? 'disponible' : 'no disponible'}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/** Diálogo nativo: fondo inerte, Escape y devolución del foco los gestiona el navegador. */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const d = ref.current
    if (!open || !d) return
    const trigger = document.activeElement as HTMLElement | null
    if (!d.open) d.showModal()
    return () => {
      if (d.open) d.close()
      // El diálogo se desmonta: devolvemos el foco al control que lo abrió.
      if (trigger?.isConnected) trigger.focus()
    }
  }, [open])
  if (!open) return null
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={cx(
        'animate-pop m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface p-0 shadow-pop sm:m-auto sm:rounded-[28px]',
        wide ? 'sm:max-w-2xl' : 'sm:max-w-lg',
      )}
    >
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface px-6 py-4">
        <h2 id={titleId} className="flex-1 text-xl font-semibold">
          {title}
        </h2>
        <button type="button" onClick={onClose} aria-label="Cerrar ventana" className="pressable -me-2 flex size-11 items-center justify-center rounded-full text-ink-soft hover:bg-sunken hover:text-ink">
          <X aria-hidden className="size-6" strokeWidth={2.25} />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </dialog>
  )
}

export function IconBubble({ icon: Icon, tone = 'brand', size = 'md' }: { icon: LucideIcon; tone?: 'brand' | 'rosa'; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg' ? 'size-14' : size === 'sm' ? 'size-10' : 'size-12'
  const i = size === 'lg' ? 'size-7' : size === 'sm' ? 'size-5' : 'size-6'
  return (
    <span aria-hidden className={cx('inline-flex shrink-0 items-center justify-center rounded-full', s, tone === 'brand' ? 'bg-accent-soft text-accent' : 'bg-care-soft text-care')}>
      <Icon className={i} strokeWidth={1.75} />
    </span>
  )
}

export function EmptyState({ icon: Icon, title, children, action }: { icon: LucideIcon; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <IconBubble icon={Icon} size="lg" />
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      {children && <p className="mt-1 max-w-sm text-ink-soft">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function PageTitle({ title, subtitle, children, eyebrow }: { title: string; subtitle?: ReactNode; children?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="mb-2 text-sm font-semibold text-accent">{eyebrow}</p>}
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-[65ch] text-lg text-ink-soft">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

/** Se muestra en páginas privadas cuando no hay sesión del tipo adecuado. */
export function LoginRequired({ next, role }: { next: string; role?: 'family' | 'caregiver' }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <span aria-hidden className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent">
        <ShieldCheck className="size-8" strokeWidth={1.75} />
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
