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
  MoreVertical,
  Paperclip,
  Phone,
  SendHorizontal,
  Smile,
  Star,
  User,
  Video,
  Wrench,
} from 'lucide-react'
import { Container } from '../components/Layout'
import { Avatar, Button, CaregiverBadges, EmptyState, Field, LoginRequired, Modal, Select, Stars, Textarea } from '../components/ui'
import { useMe, useStore } from '../store'
import type { ContactRequest } from '../data/types'
import { JORNADAS, PERSON_TYPES, START_OPTIONS, labelOf } from '../data/catalog'
import { cx, fmtDate, fmtDayLabel, fmtListTime, fmtTime, shortName } from '../lib/format'

const EMOJIS = ['😊', '🙏', '👍', '❤️', '😀', '👋', '📅', '✅']

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
      <div className="grid gap-4 lg:h-[calc(100dvh-150px)] lg:min-h-[640px] lg:grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_290px]">
        {/* Lista */}
        <aside className={cx('card flex flex-col overflow-hidden', selected && 'max-lg:hidden')}>
          <div className="flex items-center gap-3 bg-gradient-to-r from-brand-50 to-white px-5 py-4">
            <MessageCircleMore className="size-9 text-brand-600" strokeWidth={1.6} />
            <h1 className="text-2xl font-bold">Mensajes</h1>
          </div>
          <div className="flex gap-2 px-4 py-3">
            <button type="button" onClick={() => setFilter('todos')} className={cx('flex-1 rounded-full py-2 font-semibold', filter === 'todos' ? 'bg-brand-100 text-brand-900' : 'text-ink-soft hover:bg-brand-50')}>
              Todos
            </button>
            <button type="button" onClick={() => setFilter('activos')} className={cx('flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 font-semibold', filter === 'activos' ? 'bg-brand-100 text-brand-900' : 'text-ink-soft hover:bg-brand-50')}>
              Sin leer ({activeCount}) {activeCount > 0 && <span className="size-2 rounded-full bg-rosa-500" />}
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {shown.length === 0 && (
              <EmptyState icon={Handshake} title="No hay conversaciones">
                {role === 'family' ? 'El chat se abre cuando una cuidadora acepta tu solicitud de contacto.' : 'El chat se abre cuando aceptas la solicitud de una familia.'}
              </EmptyState>
            )}
            {shown.map(({ r, last, unread, other }) => (
              <li key={r.id}>
                <Link to={`/mensajes/${r.id}`} className={cx('flex gap-3 border-b border-line px-4 py-4 transition', r.id === selectedId ? 'bg-brand-50' : 'hover:bg-brand-50/50')}>
                  <Avatar name={other.name.replace('Familia ', '')} photo={other.photo} size={56} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="flex-1 truncate text-lg font-semibold">{other.name}</span>
                      <span className="text-sm text-ink-soft">{last ? fmtListTime(last.at) : ''}</span>
                    </div>
                    {other.caregiver?.trusted && <div className="text-xs font-semibold text-brand-800">Cuidadora de confianza</div>}
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className={cx('flex-1 truncate text-[15px]', unread ? 'font-semibold text-ink' : 'text-ink-soft')}>
                        {last ? (last.from === role ? 'Tú: ' : '') + (last.attachment ? `📎 ${last.attachment}` : last.text) : ''}
                      </span>
                      {unread > 0 && <span className="flex size-6 items-center justify-center rounded-full bg-rosa-500 text-xs font-bold text-white">{unread}</span>}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {selected ? (
          <Chat key={selected.r.id} r={selected.r} />
        ) : (
          <div className="card hidden items-center justify-center lg:flex xl:col-span-2">
            <EmptyState icon={MessageCircleMore} title="Selecciona una conversación" />
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

  let lastDay = ''

  const detail = (
    <ul className="space-y-3 text-[16px]">
      <li className="flex items-center gap-3"><User className="size-5 text-brand-600" />{labelOf(PERSON_TYPES, r.personType)}</li>
      <li className="flex items-center gap-3"><MapPin className="size-5 text-brand-600" />En {r.zone}</li>
      <li className="flex items-center gap-3"><CalendarDays className="size-5 text-brand-600" />Inicio: {r.start === 'fecha' && r.startDate ? fmtDate(r.startDate) : labelOf(START_OPTIONS, r.start)}</li>
      <li className="flex items-center gap-3"><Clock className="size-5 text-brand-600" />Jornada: {labelOf(JORNADAS, r.jornada)}</li>
    </ul>
  )

  return (
    <>
      <section className="card flex min-h-[70dvh] flex-col overflow-hidden lg:min-h-0">
        <div className="flex items-center gap-3 bg-gradient-to-r from-brand-50 to-brand-100/60 px-4 py-3">
          <button type="button" onClick={() => navigate('/mensajes')} className="rounded-full p-1.5 text-brand-700 hover:bg-white lg:hidden" aria-label="Volver a la lista">
            <ArrowLeft className="size-6" />
          </button>
          <ArrowLeft className="hidden size-6 text-brand-700 lg:block" />
          <h2 className="text-xl font-bold sm:text-2xl">Chat con {otherName}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          {role === 'family' ? (
            <Link to={`/cuidadoras/${c.id}`} className="flex items-center gap-3">
              <Avatar name={c.name} photo={c.photo} size={56} />
              <div>
                <div className="text-lg font-semibold">{shortName(c.name)}</div>
                <CaregiverBadges c={c} size="sm" />
                <Stars rating={c.rating} reviews={c.reviews} size="sm" />
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar name={fam.name.replace('Familia ', '')} size={56} />
              <div>
                <div className="text-lg font-semibold">{fam.name}</div>
                <div className="text-sm text-muted">{fam.contactName} · {fam.zone}</div>
              </div>
            </div>
          )}
          <div className="hidden rounded-2xl border border-brand-100 bg-brand-50 px-3 py-1.5 md:block">
            <div className="flex items-center gap-2 font-semibold text-brand-900"><Handshake className="size-5" />Match confirmado</div>
            <div className="text-xs text-ink-soft">Ya podéis hablar y organizar los detalles del cuidado.</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => setModal('video')} aria-label="Programar videollamada" className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-brand-500 text-brand-700 hover:bg-brand-50"><Video className="size-5" /></button>
            <button type="button" onClick={() => toast('Las llamadas desde la app estarán disponibles próximamente.', 'info')} aria-label="Llamar" className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-brand-500 text-brand-700 hover:bg-brand-50"><Phone className="size-5" /></button>
            <button type="button" onClick={() => setModal('detail')} aria-label="Detalle del cuidado" className="flex size-11 items-center justify-center rounded-full text-ink-soft hover:bg-brand-50 xl:hidden"><MoreVertical className="size-5" /></button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-white px-3 py-4 sm:px-5" role="log" aria-live="polite">
          {msgs.map((m) => {
            const day = fmtDayLabel(m.at)
            const showDay = day !== lastDay
            lastDay = day
            const mine = m.from === role
            return (
              <div key={m.id}>
                {showDay && (
                  <div className="my-3 flex justify-center">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-ink-soft first-letter:uppercase">{day}</span>
                  </div>
                )}
                {m.from === 'system' ? (
                  <div className="flex justify-center">
                    <span className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-900"><Handshake className="size-4" />{m.text}</span>
                  </div>
                ) : (
                  <div className={cx('flex items-end gap-2', mine ? 'justify-end' : 'justify-start')}>
                    {!mine && <Avatar name={role === 'family' ? c.name : fam.name.replace('Familia ', '')} photo={role === 'family' ? c.photo : undefined} size={40} className="max-sm:hidden" />}
                    <div className={cx('max-w-[82%] rounded-2xl border px-4 py-2.5 text-[16px] leading-relaxed sm:max-w-[70%]', mine ? 'rounded-br-md border-brand-100 bg-brand-50' : 'rounded-bl-md border-line bg-white')}>
                      {m.attachment && (
                        <span className="mb-1 flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 font-medium text-brand-900"><FileText className="size-5" />{m.attachment}</span>
                      )}
                      {m.text}
                      <span className="mt-0.5 flex items-center justify-end gap-1 text-xs text-ink-soft">
                        {fmtTime(m.at)}
                        {mine && <CheckCheck className="size-4 text-brand-600" />}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {isTyping && (
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <span className="typing flex gap-1 rounded-2xl border border-line bg-white px-4 py-3">
                <span className="size-2 rounded-full bg-brand-500" />
                <span className="size-2 rounded-full bg-brand-500" />
                <span className="size-2 rounded-full bg-brand-500" />
              </span>
              {otherName} está escribiendo…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="relative flex items-center gap-2 border-t border-line px-3 py-3 sm:px-4">
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) sendMessage(r.id, role, 'Te comparto este documento.', f.name)
              e.target.value = ''
            }}
          />
          <button type="button" onClick={() => fileRef.current?.click()} aria-label="Adjuntar archivo" className="flex size-11 shrink-0 items-center justify-center rounded-full text-brand-600 hover:bg-brand-50"><Paperclip className="size-6" /></button>
          <div className="relative flex-1">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje…" aria-label="Escribe un mensaje" className="input-base rounded-full pr-12" />
            <button type="button" onClick={() => setEmoji(!emoji)} aria-label="Emojis" className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-soft hover:text-ink"><Smile className="size-6" /></button>
            {emoji && (
              <div className="animate-pop absolute right-0 bottom-14 z-10 grid grid-cols-4 gap-1 rounded-2xl border border-line bg-white p-2 shadow-pop">
                {EMOJIS.map((e) => (
                  <button key={e} type="button" onClick={() => setText((t) => t + e)} className="rounded-lg p-2 text-xl hover:bg-brand-50">{e}</button>
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={!text.trim()} aria-label="Enviar" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow transition disabled:opacity-40">
            <SendHorizontal className="size-6" />
          </button>
        </form>
      </section>

      {/* Columna derecha */}
      <aside className="hidden space-y-4 xl:block">
        <section className="card overflow-hidden">
          <header className="flex items-center gap-3 bg-gradient-to-r from-brand-50 to-white px-5 py-3.5"><ClipboardList className="size-6 text-brand-700" /><h3 className="text-lg font-semibold">Detalle del cuidado</h3></header>
          <div className="px-5 py-4">
            {detail}
            <Button variant="outline" block className="mt-5" iconRight={ChevronRight} onClick={() => setModal('detail')}>Ver solicitud</Button>
          </div>
        </section>
        <section className="card overflow-hidden">
          <header className="flex items-center gap-3 bg-gradient-to-r from-brand-50 to-white px-5 py-3.5"><Wrench className="size-6 text-brand-700" /><h3 className="text-lg font-semibold">Herramientas</h3></header>
          <div className="space-y-2.5 px-4 py-4">
            {[
              { icon: CalendarDays, t: 'Programar videollamada', on: () => setModal('video') },
              { icon: FileText, t: 'Compartir documentos', on: () => fileRef.current?.click() },
              { icon: Star, t: note ? 'Ver nota (privada)' : 'Añadir nota (privada)', on: () => { setNoteDraft(note); setModal('note') } },
            ].map((x) => (
              <button key={x.t} type="button" onClick={x.on} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-brand-50/40 px-4 py-3 text-left font-medium hover:bg-brand-50">
                <x.icon className="size-5 text-brand-700" />
                {x.t}
              </button>
            ))}
          </div>
        </section>
      </aside>

      <Modal open={modal === 'video'} onClose={() => setModal(null)} title="Programar videollamada">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Día"><input type="date" className="input-base" value={callDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setCallDate(e.target.value)} /></Field>
          <Field label="Hora"><Select value={callTime} onChange={setCallTime} options={['10:00', '12:00', '16:00', '17:00', '18:00', '19:00', '20:00']} /></Field>
        </div>
        <Button
          block
          className="mt-6"
          icon={Video}
          disabled={!callDate}
          onClick={() => {
            const d = new Date(`${callDate}T00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
            sendMessage(r.id, role, `📅 He propuesto una videollamada para el ${d} a las ${callTime}.`)
            setModal(null)
            toast('Videollamada propuesta. Se ha enviado al chat.')
          }}
        >
          Proponer videollamada
        </Button>
      </Modal>

      <Modal open={modal === 'note'} onClose={() => setModal(null)} title="Nota privada">
        <p className="mb-3 text-ink-soft">Solo tú puedes ver esta nota. {otherName} no la recibe.</p>
        <Textarea value={noteDraft} onChange={setNoteDraft} max={400} rows={5} placeholder="Ej. Preguntar por experiencia con grúa, confirmar horario de los martes…" />
        <Button block className="mt-4" onClick={() => { saveNote(r.id, role, noteDraft); setModal(null); toast('Nota guardada.') }}>Guardar nota</Button>
      </Modal>

      <Modal open={modal === 'detail'} onClose={() => setModal(null)} title="Solicitud de contacto">
        <p className="mb-4 rounded-2xl bg-brand-50 p-4">“{r.need}”</p>
        {detail}
        <p className="mt-4 text-sm text-muted">Enviada el {fmtDate(r.createdAt)}{r.respondedAt ? ` · aceptada el ${fmtDate(r.respondedAt)}` : ''}</p>
      </Modal>
    </>
  )
}
