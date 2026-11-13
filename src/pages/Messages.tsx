import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Handshake,
  MapPin,
  MessageCircleMore,
  NotebookPen,
  Paperclip,
  Phone,
  Save,
  SendHorizontal,
  ShieldCheck,
  Smile,
  User,
  Video,
  Wrench,
} from 'lucide-react'
import { Container } from '../components/Layout'
import { Avatar, Button, EmptyState, Field, focusFirstInvalid, Input, LoginRequired, Modal, Select, Stars, Textarea } from '../components/ui'
import { useMe, useStore } from '../store'
import type { ContactRequest } from '../data/types'
import { JORNADAS, PERSON_TYPES, START_OPTIONS, labelOf } from '../data/catalog'
import { cx, fmtDate, fmtDayLabel, fmtListTime, fmtTime, shortName } from '../lib/format'

const EMOJIS = [
  ['😊', 'Cara sonriente'],
  ['🙏', 'Gracias'],
  ['👍', 'Pulgar arriba'],
  ['❤️', 'Corazón'],
  ['😀', 'Cara alegre'],
  ['👋', 'Saludo con la mano'],
  ['📅', 'Calendario'],
  ['✅', 'Hecho'],
] as const

export default function Messages() {
  const me = useMe()
  const { id } = useParams()
  if (me.role === 'guest') return <LoginRequired next="/mensajes" />
  return <MessagesInner selectedId={id} />
}

function MessagesInner({ selectedId }: { selectedId?: string }) {
  const { state } = useStore()
  const me = useMe()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'todos' | 'activos'>('todos')
  const role = me.role as 'family' | 'caregiver'

  const convs = useMemo(() => {
    return me.myRequests
      .filter((r) => r.status === 'aceptada')
      .map((r) => {
        const msgs = state.messages.filter((m) => m.requestId === r.id)
        const last = msgs[msgs.length - 1]
        const unread = msgs.filter((m) => m.from !== role && m.from !== 'system' && !m.read).length
        const other =
          role === 'family'
            ? (() => {
                const c = state.caregivers.find((x) => x.id === r.caregiverId)!
                return { name: shortName(c.name), photo: c.photo, caregiver: c }
              })()
            : (() => {
                const f = state.families.find((x) => x.id === r.familyId)!
                return { name: f.name, photo: undefined, caregiver: undefined }
              })()
        return { r, last, unread, other, at: last?.at ?? r.respondedAt ?? r.createdAt }
      })
      .sort((a, b) => b.at.localeCompare(a.at))
  }, [me.myRequests, state.messages, state.caregivers, state.families, role])

  const activeCount = convs.filter((c) => c.unread > 0).length
  const shown = filter === 'activos' ? convs.filter((c) => c.unread > 0) : convs
  const selected = convs.find((c) => c.r.id === selectedId)

  // En escritorio abrimos la primera conversación por defecto
  useEffect(() => {
    if (!selectedId && convs.length && window.matchMedia('(min-width: 1024px)').matches) navigate(`/mensajes/${convs[0].r.id}`, { replace: true })
  }, [selectedId, convs, navigate])

  if (selectedId && !selected && convs.length) return <Navigate to="/mensajes" replace />

  return (
    <Container className="max-w-[1400px] py-4 sm:py-6">
      <div className="grid gap-4 lg:h-[calc(100dvh-140px)] lg:min-h-[640px] lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)_300px]">
        {/* Lista */}
        <aside aria-label="Conversaciones" className={cx('card flex min-h-0 flex-col overflow-hidden', selected && 'max-lg:hidden')}>
          <div className="px-5 pt-5 pb-3">
            <h1 className="text-3xl font-bold">Mensajes</h1>
            <div role="group" aria-label="Filtrar conversaciones" className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-sky-soft p-1">
              {(
                [
                  ['todos', 'Todas'],
                  ['activos', `Sin leer (${activeCount})`],
                ] as const
              ).map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={filter === k}
                  onClick={() => setFilter(k)}
                  className={cx('min-h-11 rounded-full px-3 font-semibold transition-[background-color,color,box-shadow] duration-150', filter === k ? 'bg-sky text-ink shadow-card' : 'text-ink hover:bg-sky-line/60')}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-line">
            {shown.length === 0 && (
              <li>
                <EmptyState icon={Handshake} title={filter === 'activos' ? 'No tienes mensajes sin leer' : 'No hay conversaciones'}>
                  {filter === 'activos' ? 'Todo al día.' : role === 'family' ? 'El chat se abre cuando una cuidadora acepta tu solicitud de contacto.' : 'El chat se abre cuando aceptas la solicitud de una familia.'}
                </EmptyState>
              </li>
            )}
            {shown.map(({ r, last, unread, other }) => {
              const current = r.id === selectedId
              return (
                <li key={r.id} className="border-b border-line">
                  <Link
                    to={`/mensajes/${r.id}`}
                    aria-current={current ? 'page' : undefined}
                    className={cx('relative flex gap-3 px-4 py-4 transition-[background-color] duration-150', current ? 'bg-accent-subtle' : 'hover:bg-sunken')}
                  >
                    {current && <span aria-hidden className="absolute inset-y-3 left-0 w-1 rounded-e-full bg-accent" />}
                    <Avatar name={other.name.replace('Familia ', '')} photo={other.photo} size={52} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="flex-1 truncate text-lg font-semibold">{other.name}</span>
                        <span className="shrink-0 text-sm text-muted tabular-nums">{last ? fmtListTime(last.at) : ''}</span>
                      </div>
                      {other.caregiver?.trusted && (
                        <div className="flex items-center gap-1 text-sm font-medium text-accent">
                          <ShieldCheck aria-hidden className="size-4" strokeWidth={2.25} />
                          Cuidadora de confianza
                        </div>
                      )}
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className={cx('flex-1 truncate', unread ? 'font-semibold text-ink' : 'text-ink-soft')}>
                          {last ? (last.from === role ? 'Tú: ' : '') + (last.attachment ? `Documento: ${last.attachment}` : last.text) : ''}
                        </span>
                        {unread > 0 && (
                          <span className="flex min-w-6 items-center justify-center rounded-full bg-care px-1.5 text-sm font-bold text-white tabular-nums">
                            {unread}
                            <span className="sr-only"> sin leer</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </aside>

        {selected ? (
          <Chat key={selected.r.id} r={selected.r} />
        ) : (
          <div className="card hidden items-center justify-center lg:flex xl:col-span-2">
            <EmptyState icon={MessageCircleMore} title="Elige una conversación" />
          </div>
        )}
      </div>
    </Container>
  )
}

function Chat({ r }: { r: ContactRequest }) {
  const { state, typing, sendMessage, markConversationRead, saveNote, toast } = useStore()
  const me = useMe()
  const role = me.role as 'family' | 'caregiver'
  const navigate = useNavigate()
  const msgs = state.messages.filter((m) => m.requestId === r.id)
  const c = state.caregivers.find((x) => x.id === r.caregiverId)!
  const fam = state.families.find((x) => x.id === r.familyId)!
  const otherName = role === 'family' ? shortName(c.name) : fam.name
  const [text, setText] = useState('')
  const [emoji, setEmoji] = useState(false)
  const [modal, setModal] = useState<'video' | 'note' | 'detail' | null>(null)
  const [callDate, setCallDate] = useState('')
  const [callTime, setCallTime] = useState('18:00')
  const [callError, setCallError] = useState('')
  const note = state.notes.find((n) => n.requestId === r.id && n.role === role)?.text ?? ''
  const [noteDraft, setNoteDraft] = useState(note)
  const fileRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const isTyping = typing[r.id]

  useEffect(() => {
    markConversationRead(r.id, role)
  }, [msgs.length, r.id, role, markConversationRead])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [msgs.length, isTyping])

  const send = (e?: React.FormEvent) => {
    e?.preventDefault()
    const t = text.trim()
    if (!t) return
    sendMessage(r.id, role, t)
    setText('')
    setEmoji(false)
  }

  const proposeCall = (e: React.FormEvent) => {
    e.preventDefault()
    if (!callDate) {
      setCallError('Elige el día de la videollamada.')
      focusFirstInvalid(e.currentTarget)
      return
    }
    const d = new Date(`${callDate}T00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
    sendMessage(r.id, role, `He propuesto una videollamada para el ${d} a las ${callTime}.`)
    setModal(null)
    setCallError('')
    toast('Videollamada propuesta. Se ha enviado al chat.')
  }

  let lastDay = ''

  const detail = (
    <ul className="space-y-3">
      <li className="flex items-center gap-3">
        <User aria-hidden className="size-5 shrink-0 text-accent-icon" strokeWidth={2} />
        {labelOf(PERSON_TYPES, r.personType)}
      </li>
      <li className="flex items-center gap-3">
        <MapPin aria-hidden className="size-5 shrink-0 text-accent-icon" strokeWidth={2} />
        En {r.zone}
      </li>
      <li className="flex items-center gap-3">
        <CalendarDays aria-hidden className="size-5 shrink-0 text-accent-icon" strokeWidth={2} />
        Inicio: {r.start === 'fecha' && r.startDate ? fmtDate(r.startDate) : labelOf(START_OPTIONS, r.start)}
      </li>
      <li className="flex items-center gap-3">
        <Clock aria-hidden className="size-5 shrink-0 text-accent-icon" strokeWidth={2} />
        Jornada: {labelOf(JORNADAS, r.jornada)}
      </li>
    </ul>
  )

  const roundBtn = 'pressable flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-line text-accent hover:border-accent-line hover:bg-accent-subtle'

  return (
    <>
      <section aria-labelledby="chat-title" className="card flex min-h-[75dvh] flex-col overflow-hidden lg:min-h-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-3 py-3 sm:px-5">
          <button type="button" onClick={() => navigate('/mensajes')} className="pressable -ms-1 flex size-12 items-center justify-center rounded-full text-accent hover:bg-accent-subtle lg:hidden" aria-label="Volver a las conversaciones">
            <ArrowLeft aria-hidden className="size-6" strokeWidth={2.25} />
          </button>
          {role === 'family' ? (
            <Link to={`/cuidadoras/${c.id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl">
              <Avatar name={c.name} photo={c.photo} size={52} />
              <div className="min-w-0">
                <h2 id="chat-title" className="truncate text-xl font-bold">
                  {shortName(c.name)}
                  <span className="sr-only">: conversación. Ver perfil</span>
                </h2>
                <Stars rating={c.rating} reviews={c.reviews} size="sm" />
              </div>
            </Link>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar name={fam.name.replace('Familia ', '')} size={52} />
              <div className="min-w-0">
                <h2 id="chat-title" className="truncate text-xl font-bold">
                  {fam.name}
                </h2>
                <div className="truncate text-sm text-ink-soft">
                  {fam.contactName} · {fam.zone}
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setModal('video')} aria-label="Programar videollamada" className={roundBtn}>
              <Video aria-hidden className="size-5" strokeWidth={2} />
            </button>
            <button type="button" onClick={() => toast('Las llamadas desde la app estarán disponibles próximamente.', 'info')} aria-label="Llamar" className={roundBtn}>
              <Phone aria-hidden className="size-5" strokeWidth={2} />
            </button>
            <button type="button" onClick={() => setModal('detail')} aria-label="Ver detalle del cuidado" className={cx(roundBtn, 'xl:hidden')}>
              <ClipboardList aria-hidden className="size-5" strokeWidth={2} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-care-soft px-5 py-2 text-sm font-medium text-care">
          <Handshake aria-hidden className="size-5 shrink-0" strokeWidth={2} />
          Match confirmado: ya podéis hablar y organizar los detalles del cuidado.
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-canvas px-3 py-4 sm:px-6" role="log" aria-label={`Mensajes con ${otherName}`} tabIndex={0}>
          {msgs.map((m) => {
            const day = fmtDayLabel(m.at)
            const showDay = day !== lastDay
            lastDay = day
            const mine = m.from === role
            return (
              <div key={m.id}>
                {showDay && (
                  <div className="my-4 flex justify-center">
                    <span className="rounded-full bg-sunken px-3 py-1 text-sm font-medium text-ink-soft first-letter:uppercase">{day}</span>
                  </div>
                )}
                {m.from === 'system' ? (
                  <div className="flex justify-center">
                    <span className="flex items-center gap-2 rounded-full bg-accent-soft px-4 py-1.5 text-sm font-medium text-accent-strong">
                      <Handshake aria-hidden className="size-4" />
                      {m.text}
                    </span>
                  </div>
                ) : (
                  <div className={cx('flex items-end gap-2', mine ? 'justify-end' : 'justify-start')}>
                    {!mine && <Avatar name={role === 'family' ? c.name : fam.name.replace('Familia ', '')} photo={role === 'family' ? c.photo : undefined} size={36} className="max-sm:hidden" />}
                    <div className={cx('max-w-[85%] rounded-[20px] px-4 py-2.5 leading-relaxed sm:max-w-[70%]', mine ? 'rounded-br-md bg-accent text-white' : 'rounded-bl-md bg-surface shadow-card')}>
                      <span className="sr-only">{mine ? 'Tú' : otherName}: </span>
                      {m.attachment && (
                        <span className={cx('mb-1.5 flex items-center gap-2 rounded-xl px-3 py-2 font-medium', mine ? 'bg-white/15' : 'bg-accent-subtle text-accent-strong')}>
                          <FileText aria-hidden className="size-5" />
                          {m.attachment}
                        </span>
                      )}
                      {m.text}
                      <span className={cx('mt-0.5 flex items-center justify-end gap-1 text-sm tabular-nums', mine ? 'text-white/85' : 'text-muted')}>
                        {fmtTime(m.at)}
                        {mine && <CheckCheck aria-label="Enviado" className="size-4" />}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {isTyping && (
            <div className="flex items-center gap-2 text-ink-soft">
              <span aria-hidden className="typing flex gap-1 rounded-[20px] bg-surface px-4 py-3 shadow-card">
                <span className="size-2 rounded-full bg-accent-icon" />
                <span className="size-2 rounded-full bg-accent-icon" />
                <span className="size-2 rounded-full bg-accent-icon" />
              </span>
              {otherName} está escribiendo…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="relative flex items-center gap-2 border-t border-line bg-surface px-3 py-3 sm:px-4">
          <input
            ref={fileRef}
            type="file"
            tabIndex={-1}
            aria-hidden
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) sendMessage(r.id, role, 'Te comparto este documento.', f.name)
              e.target.value = ''
            }}
          />
          <button type="button" onClick={() => fileRef.current?.click()} aria-label="Adjuntar documento" className="pressable flex size-12 shrink-0 items-center justify-center rounded-full text-accent hover:bg-accent-subtle">
            <Paperclip aria-hidden className="size-6" strokeWidth={2} />
          </button>
          <div className="relative min-w-0 flex-1">
            <label htmlFor="chat-input" className="sr-only">
              Escribe un mensaje a {otherName}
            </label>
            <input id="chat-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje…" autoComplete="off" className="input-base rounded-full pe-14" />
            <button
              type="button"
              onClick={() => setEmoji(!emoji)}
              aria-expanded={emoji}
              aria-controls="emoji-panel"
              aria-label="Insertar emoji"
              className="absolute top-1/2 right-1 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft hover:bg-sunken hover:text-ink"
            >
              <Smile aria-hidden className="size-6" strokeWidth={2} />
            </button>
            {emoji && (
              <div
                id="emoji-panel"
                onKeyDown={(e) => e.key === 'Escape' && setEmoji(false)}
                className="animate-pop absolute right-0 bottom-16 z-10 grid grid-cols-4 gap-1 rounded-[20px] bg-surface p-2 shadow-pop"
              >
                {EMOJIS.map(([e, name]) => (
                  <button key={e} type="button" aria-label={name} onClick={() => setText((t) => t + e)} className="flex size-12 items-center justify-center rounded-xl text-2xl hover:bg-accent-subtle">
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="submit" aria-label="Enviar mensaje" className="pressable flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-white hover:bg-accent-hover">
            <SendHorizontal aria-hidden className="size-6" strokeWidth={2} />
          </button>
        </form>
      </section>

      {/* Columna derecha */}
      <aside aria-label="Detalle y herramientas" className="hidden min-h-0 space-y-4 overflow-y-auto xl:block">
        <section className="card p-5">
          <h3 className="mb-4 flex items-center gap-2.5 text-lg font-semibold">
            <ClipboardList aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
            Detalle del cuidado
          </h3>
          {detail}
          <Button variant="outline" block className="mt-5" iconRight={ChevronRight} onClick={() => setModal('detail')}>
            Ver solicitud
          </Button>
        </section>
        <section className="card p-5">
          <h3 className="mb-3 flex items-center gap-2.5 text-lg font-semibold">
            <Wrench aria-hidden className="size-5 text-accent-icon" strokeWidth={2} />
            Herramientas
          </h3>
          <ul className="space-y-2">
            {[
              { icon: CalendarDays, t: 'Programar videollamada', on: () => setModal('video') },
              { icon: FileText, t: 'Compartir documentos', on: () => fileRef.current?.click() },
              {
                icon: NotebookPen,
                t: note ? 'Ver mi nota privada' : 'Añadir nota privada',
                on: () => {
                  setNoteDraft(note)
                  setModal('note')
                },
              },
            ].map((x) => (
              <li key={x.t}>
                <button type="button" onClick={x.on} className="pressable flex min-h-12 w-full items-center gap-3 rounded-2xl bg-sky-subtle px-4 text-start font-medium hover:bg-sky-soft">
                  <x.icon aria-hidden className="size-5 text-sky-ink" strokeWidth={2} />
                  {x.t}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      <Modal open={modal === 'video'} onClose={() => setModal(null)} title="Programar videollamada">
        <form onSubmit={proposeCall} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Día" required error={callError}>
              <Input
                type="date"
                value={callDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => {
                  setCallDate(e.target.value)
                  setCallError('')
                }}
              />
            </Field>
            <Field label="Hora">
              <Select value={callTime} onChange={setCallTime} options={['10:00', '12:00', '16:00', '17:00', '18:00', '19:00', '20:00']} />
            </Field>
          </div>
          <Button type="submit" block className="mt-6" icon={Video}>
            Proponer videollamada
          </Button>
        </form>
      </Modal>

      <Modal open={modal === 'note'} onClose={() => setModal(null)} title="Nota privada">
        <p className="mb-3 text-ink-soft">Solo tú puedes ver esta nota. {otherName} no la recibe.</p>
        <Field label="Tu nota">
          <Textarea value={noteDraft} onChange={setNoteDraft} max={400} rows={5} placeholder="Ej. Preguntar por experiencia con grúa, confirmar horario de los martes…" />
        </Field>
        <Button
          block
          className="mt-4"
          icon={Save}
          onClick={() => {
            saveNote(r.id, role, noteDraft)
            setModal(null)
            toast('Nota guardada.')
          }}
        >
          Guardar nota
        </Button>
      </Modal>

      <Modal open={modal === 'detail'} onClose={() => setModal(null)} title="Solicitud de contacto">
        <blockquote className="mb-4 rounded-2xl bg-accent-soft p-4">«{r.need}»</blockquote>
        {detail}
        <p className="mt-4 text-sm text-muted">
          Enviada el {fmtDate(r.createdAt)}
          {r.respondedAt ? ` · aceptada el ${fmtDate(r.respondedAt)}` : ''}
        </p>
      </Modal>
    </>
  )
}
