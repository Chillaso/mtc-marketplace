import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type {
  Caregiver,
  ContactRequest,
  DemoState,
  Family,
  IntegralRequest,
  Message,
  Notification,
  Role,
  SearchFilters,
} from './data/types'
import { buildSeed, DEMO_CAREGIVER_ID, DEMO_FAMILY_ID, emptyFilters, STATE_VERSION } from './data/seed'
import { firstName, shortName, uid } from './lib/format'

const STORAGE_KEY = 'mtc-demo-state'

function load(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState
      if (parsed.version === STATE_VERSION) return parsed
    }
  } catch {
    /* almacenamiento no disponible: se usa la semilla */
  }
  return buildSeed()
}

const CAREGIVER_REPLIES = [
  '¡Gracias por escribir! Lo reviso y te digo algo en un ratito.',
  'Perfecto, me parece muy bien. ¿Quieres que lo hablemos por videollamada?',
  'Entendido. Tengo disponibilidad esos días, sin problema.',
  'Muchas gracias por la información, así me hago una idea mejor.',
]
const FAMILY_REPLIES = [
  '¡Genial, muchas gracias! Lo comento en casa y te confirmo.',
  'Perfecto. ¿Te vendría bien que nos conociéramos esta semana?',
  'Muchas gracias por responder tan rápido.',
]
const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

export type CaregiverDraft = Omit<
  Caregiver,
  'id' | 'rating' | 'reviews' | 'trusted' | 'docsStatus' | 'createdAt' | 'highlights'
> & { password: string }

export type NewRequest = Pick<ContactRequest, 'familyId' | 'caregiverId' | 'need' | 'personType' | 'start' | 'startDate' | 'jornada' | 'zone'>

type Toast = { id: string; text: string; tone: 'ok' | 'info' }

function useDemoStore() {
  const [state, setState] = useState<DemoState>(load)
  const [typing, setTyping] = useState<Record<string, boolean>>({})
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<number[]>([])
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignorar */
    }
  }, [state])

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), [])

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  const toast = useCallback(
    (text: string, tone: Toast['tone'] = 'ok') => {
      const id = uid('t')
      setToasts((t) => [...t, { id, text, tone }])
      later(3800, () => setToasts((t) => t.filter((x) => x.id !== id)))
    },
    [later],
  )

  const notify = (s: DemoState, n: Omit<Notification, 'id' | 'at' | 'read'>): DemoState => ({
    ...s,
    notifications: [{ ...n, id: uid('n'), at: new Date().toISOString(), read: false }, ...s.notifications],
  })

  const logActivity = (s: DemoState, caregiverId: string, text: string, highlight = false): DemoState => ({
    ...s,
    activity: [{ id: uid('a'), caregiverId, text, at: new Date().toISOString(), highlight }, ...s.activity],
  })

  const pushMessage = (s: DemoState, msg: Omit<Message, 'id' | 'at' | 'read'>): DemoState => ({
    ...s,
    messages: [...s.messages, { ...msg, id: uid('m'), at: new Date().toISOString(), read: false }],
  })

  // ---------- Sesión ----------
  const loginAs = useCallback((role: Role, userId?: string) => {
    setState((s) => ({
      ...s,
      session: role === 'guest' ? { role } : { role, userId: userId ?? (role === 'family' ? DEMO_FAMILY_ID : DEMO_CAREGIVER_ID) },
    }))
  }, [])

  const logout = useCallback(() => setState((s) => ({ ...s, session: { role: 'guest' } })), [])

  const resetDemo = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current = []
    setTyping({})
    setState((s) => ({ ...buildSeed(), session: s.session.userId?.startsWith('cg-new') || s.session.userId?.startsWith('fam-new') ? { role: 'guest' } : s.session }))
  }, [])

  // ---------- Cuidadoras ----------
  const registerCaregiver = useCallback((draft: CaregiverDraft): string => {
    const id = uid('cg-new')
    const { password: _password, ...data } = draft
    void _password
    const caregiver: Caregiver = {
      ...data,
      id,
      rating: 0,
      reviews: 0,
      trusted: false,
      docsStatus: 'en_revision',
      highlights: [],
      createdAt: new Date().toISOString(),
    }
    setState((s) => {
      let next: DemoState = { ...s, caregivers: [...s.caregivers, caregiver], session: { role: 'caregiver', userId: id } }
      next = logActivity(next, id, 'Has completado tu registro. ¡Bienvenida a María te Cuida!', true)
      next = notify(next, {
        role: 'caregiver',
        userId: id,
        text: 'Hemos recibido tu documentación. El equipo la revisará en breve.',
        link: '/cuidadora/perfil/documentacion',
      })
      return next
    })
    return id
  }, [])

  const updateCaregiver = useCallback((id: string, patch: Partial<Caregiver>, activity?: string) => {
    setState((s) => {
      let next = { ...s, caregivers: s.caregivers.map((c) => (c.id === id ? { ...c, ...patch } : c)) }
      if (activity) next = logActivity(next, id, activity)
      return next
    })
  }, [])

  const setAvailability = useCallback(
    (id: string, available: boolean) => {
      setState((s) =>
        logActivity(
          { ...s, caregivers: s.caregivers.map((c) => (c.id === id ? { ...c, available } : c)) },
          id,
          `Has actualizado tu disponibilidad (${available ? 'Disponible' : 'No disponible'}).`,
          true,
        ),
      )
      toast(available ? 'Ahora apareces como disponible para las familias.' : 'Has dejado de aparecer en las búsquedas de las familias.', 'info')
    },
    [toast],
  )

  // ---------- Familias ----------
  const registerFamily = useCallback((data: Pick<Family, 'name' | 'contactName' | 'email' | 'phone' | 'zone' | 'personType'>) => {
    const id = uid('fam-new')
    setState((s) => ({
      ...s,
      families: [...s.families, { ...data, id, favorites: [], prefs: { ...emptyFilters(), zone: data.zone }, createdAt: new Date().toISOString() }],
      session: { role: 'family', userId: id },
    }))
    return id
  }, [])

  const updateFamily = useCallback((id: string, patch: Partial<Family>) => {
    setState((s) => ({ ...s, families: s.families.map((f) => (f.id === id ? { ...f, ...patch } : f)) }))
  }, [])

  const toggleFavorite = useCallback(
    (familyId: string, caregiverId: string) => {
      const fam = stateRef.current.families.find((f) => f.id === familyId)
      if (!fam) return
      const added = !fam.favorites.includes(caregiverId)
      setState((s) => ({
        ...s,
        families: s.families.map((f) =>
          f.id !== familyId ? f : { ...f, favorites: added ? [...new Set([...f.favorites, caregiverId])] : f.favorites.filter((x) => x !== caregiverId) },
        ),
      }))
      toast(added ? 'Guardada en favoritas. Es privado: la cuidadora no recibe ningún aviso.' : 'Eliminada de tus favoritas.', 'info')
    },
    [toast],
  )

  const setLastSearch = useCallback((f: SearchFilters) => setState((s) => ({ ...s, lastSearch: f })), [])

  // ---------- Solicitudes ----------
  const sendRequest = useCallback((r: NewRequest) => {
    const id = uid('req')
    setState((s) => {
      const fam = s.families.find((f) => f.id === r.familyId)
      let next: DemoState = {
        ...s,
        requests: [{ ...r, id, status: 'pendiente', createdAt: new Date().toISOString() }, ...s.requests],
      }
      next = notify(next, { role: 'caregiver', userId: r.caregiverId, text: `${fam?.name ?? 'Una familia'} quiere contactar contigo.`, link: '/cuidadora/solicitudes' })
      next = logActivity(next, r.caregiverId, `Has recibido una solicitud de contacto de ${fam?.name ?? 'una familia'}.`, true)
      return next
    })
    return id
  }, [])

  const respondRequest = useCallback(
    (requestId: string, accept: boolean) => {
      let familyId = ''
      setState((s) => {
        const req = s.requests.find((r) => r.id === requestId)
        if (!req) return s
        familyId = req.familyId
        const cg = s.caregivers.find((c) => c.id === req.caregiverId)
        const fam = s.families.find((f) => f.id === req.familyId)
        let next: DemoState = {
          ...s,
          requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: accept ? 'aceptada' : 'rechazada', respondedAt: new Date().toISOString() } : r)),
        }
        if (accept) {
          next = pushMessage(next, { requestId, from: 'system', text: 'Match confirmado. Ya podéis hablar y organizar los detalles del cuidado.' })
          next = notify(next, { role: 'family', userId: req.familyId, text: `${shortName(cg?.name ?? '')} ha aceptado tu solicitud. ¡Match confirmado!`, link: `/mensajes/${requestId}` })
          next = logActivity(next, req.caregiverId, `Has aceptado la solicitud de ${fam?.name}. Ya podéis hablar por el chat.`, true)
        } else {
          next = notify(next, { role: 'family', userId: req.familyId, text: `${shortName(cg?.name ?? '')} no puede atender tu solicitud en este momento.`, link: '/familia/solicitudes' })
          next = logActivity(next, req.caregiverId, `Has rechazado la solicitud de ${fam?.name}.`)
        }
        return next
      })
      // Si la familia no es la cuenta demo, simulamos que escribe al confirmar el match.
      if (accept) {
        later(50, () => {
          if (familyId && familyId !== DEMO_FAMILY_ID) {
            setTyping((t) => ({ ...t, [requestId]: true }))
            later(2600, () => {
              setTyping((t) => ({ ...t, [requestId]: false }))
              setState((s) => pushMessage(s, { requestId, from: 'family', text: '¡Hola! Muchas gracias por aceptar. ¿Cuándo podríamos hablar para contarte la situación?' }))
            })
          }
        })
      }
    },
    [later],
  )

  const cancelRequest = useCallback((requestId: string) => {
    setState((s) => ({ ...s, requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'cancelada' } : r)) }))
  }, [])

  // ---------- Mensajes ----------
  const sendMessage = useCallback(
    (requestId: string, from: 'family' | 'caregiver', text: string, attachment?: string) => {
      let counterpartIsDemo = true
      setState((s) => {
        const req = s.requests.find((r) => r.id === requestId)
        if (!req) return s
        counterpartIsDemo = from === 'family' ? req.caregiverId === DEMO_CAREGIVER_ID || req.caregiverId.startsWith('cg-new') : req.familyId === DEMO_FAMILY_ID || req.familyId.startsWith('fam-new')
        let next = pushMessage(s, { requestId, from, text, attachment })
        // el mensaje propio se marca como leído
        next = { ...next, messages: next.messages.map((m, i) => (i === next.messages.length - 1 ? { ...m, read: true } : m)) }
        const fam = s.families.find((f) => f.id === req.familyId)
        const cg = s.caregivers.find((c) => c.id === req.caregiverId)
        next =
          from === 'family'
            ? notify(next, { role: 'caregiver', userId: req.caregiverId, text: `${fam?.name} te ha enviado un mensaje.`, link: `/mensajes/${requestId}` })
            : notify(next, { role: 'family', userId: req.familyId, text: `${shortName(cg?.name ?? '')} te ha escrito un mensaje.`, link: `/mensajes/${requestId}` })
        return next
      })
      // Respuesta automática cuando la otra parte no es una cuenta de demo con la que se pueda entrar.
      later(30, () => {
        if (counterpartIsDemo) return
        later(900, () => setTyping((t) => ({ ...t, [requestId]: true })))
        later(3200, () => {
          setTyping((t) => ({ ...t, [requestId]: false }))
          setState((s) => pushMessage(s, { requestId, from: from === 'family' ? 'caregiver' : 'family', text: pick(from === 'family' ? CAREGIVER_REPLIES : FAMILY_REPLIES) }))
        })
      })
    },
    [later],
  )

  const markConversationRead = useCallback((requestId: string, role: 'family' | 'caregiver') => {
    setState((s) => {
      if (!s.messages.some((m) => m.requestId === requestId && m.from !== role && !m.read)) return s
      return { ...s, messages: s.messages.map((m) => (m.requestId === requestId && m.from !== role ? { ...m, read: true } : m)) }
    })
  }, [])

  const markNotificationsRead = useCallback((role: Role, userId?: string) => {
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => (n.role === role && n.userId === userId ? { ...n, read: true } : n)) }))
  }, [])

  // ---------- Servicio integral ----------
  const addIntegral = useCallback((r: Omit<IntegralRequest, 'id' | 'status' | 'createdAt'>) => {
    setState((s) => ({ ...s, integral: [{ ...r, id: uid('int'), status: 'recibida', createdAt: new Date().toISOString() }, ...s.integral] }))
  }, [])

  const saveNote = useCallback((requestId: string, role: 'family' | 'caregiver', text: string) => {
    setState((s) => ({ ...s, notes: [...s.notes.filter((n) => !(n.requestId === requestId && n.role === role)), { requestId, role, text }] }))
  }, [])

  return {
    state,
    typing,
    toasts,
    toast,
    dismissToast: (id: string) => setToasts((t) => t.filter((x) => x.id !== id)),
    loginAs,
    logout,
    resetDemo,
    registerCaregiver,
    updateCaregiver,
    setAvailability,
    registerFamily,
    updateFamily,
    toggleFavorite,
    setLastSearch,
    sendRequest,
    respondRequest,
    cancelRequest,
    sendMessage,
    markConversationRead,
    markNotificationsRead,
    addIntegral,
    saveNote,
  }
}

type Store = ReturnType<typeof useDemoStore>
const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useDemoStore()
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore fuera de StoreProvider')
  return s
}

/** Usuario actual y datos derivados útiles. */
export function useMe() {
  const { state } = useStore()
  const { role, userId } = state.session
  return useMemo(() => {
    const caregiver = role === 'caregiver' ? state.caregivers.find((c) => c.id === userId) : undefined
    const family = role === 'family' ? state.families.find((f) => f.id === userId) : undefined
    const myRequests = state.requests.filter((r) => (role === 'family' ? r.familyId === userId : role === 'caregiver' ? r.caregiverId === userId : false))
    const accepted = new Set(myRequests.filter((r) => r.status === 'aceptada').map((r) => r.id))
    const unreadMessages = state.messages.filter((m) => accepted.has(m.requestId) && m.from !== role && m.from !== 'system' && !m.read).length
    const notifications = state.notifications.filter((n) => n.role === role && n.userId === userId)
    const displayName = caregiver ? caregiver.name : family ? family.contactName : ''
    return {
      role,
      userId,
      caregiver,
      family,
      myRequests,
      unreadMessages,
      notifications,
      unreadNotifications: notifications.filter((n) => !n.read).length,
      displayName,
      greetingName: displayName ? firstName(displayName) : '',
    }
  }, [state, role, userId])
}
