import type { DemoState, SearchFilters, Family, Message } from './types'
import { seedCaregivers } from './caregivers'
import { ago, minutesAgo } from '../lib/format'

export const STATE_VERSION = 4

/** Cuentas de demostración. */
export const DEMO_FAMILY_ID = 'fam-martinez'
export const DEMO_CAREGIVER_ID = 'ana-g'

export const emptyFilters = (): SearchFilters => ({
  careType: '',
  zone: '',
  jornada: '',
  minYears: '',
  careTypes: [],
  training: '',
  days: [],
  language: '',
  onlyTrusted: false,
  docsReviewed: false,
  drivingLicense: false,
  vehicle: false,
  includeUnavailable: false,
  sort: 'relevancia',
})

function family(f: Partial<Family> & Pick<Family, 'id' | 'name' | 'contactName' | 'zone'>): Family {
  return {
    email: `${f.id}@ejemplo.com`,
    phone: '600 000 000',
    personType: 'mayor',
    favorites: [],
    prefs: emptyFilters(),
    createdAt: ago(30),
    ...f,
  }
}

export function buildSeed(): DemoState {
  const families: Family[] = [
    family({
      id: DEMO_FAMILY_ID,
      name: 'Familia Martínez',
      contactName: 'Lucía Martínez',
      email: 'lucia.martinez@demo.mariatecuida.es',
      phone: '655 112 233',
      zone: 'El Puerto',
      favorites: ['laura-m', 'carmen-r', 'ana-s'],
      prefs: { ...emptyFilters(), careType: 'mayores', zone: 'El Puerto', jornada: 'parcial' },
    }),
    family({ id: 'fam-romero', name: 'Familia Romero', contactName: 'Javier Romero', zone: 'Jerez' }),
    family({ id: 'fam-dominguez', name: 'Familia Domínguez', contactName: 'Marisa Domínguez', zone: 'Jerez' }),
    family({ id: 'fam-ortiz', name: 'Familia Ortiz', contactName: 'Manuel Ortiz', zone: 'El Puerto' }),
  ]

  const requests: DemoState['requests'] = [
    // Familia demo → Laura (aceptada: match y chat)
    {
      id: 'req-laura',
      familyId: DEMO_FAMILY_ID,
      caregiverId: 'laura-m',
      need: 'Acompañamiento para mi madre por las tardes, apoyo en la higiene y ayuda en la movilidad.',
      personType: 'mayor',
      start: 'fecha',
      startDate: ago(0).slice(0, 10),
      jornada: 'parcial',
      zone: 'El Puerto',
      status: 'aceptada',
      createdAt: ago(2, 10, 15),
      respondedAt: ago(1, 18, 2),
    },
    // Familia demo → Carmen (pendiente)
    {
      id: 'req-carmen',
      familyId: DEMO_FAMILY_ID,
      caregiverId: 'carmen-r',
      need: 'Necesitamos alguien para las noches, mi padre se despierta desorientado y necesita ayuda para ir al baño.',
      personType: 'mayor',
      start: 'semana',
      jornada: 'noches',
      zone: 'El Puerto',
      status: 'pendiente',
      createdAt: ago(4, 9, 40),
    },
    // Familia demo → Ana S. (aceptada, conversación antigua)
    {
      id: 'req-anas',
      familyId: DEMO_FAMILY_ID,
      caregiverId: 'ana-s',
      need: 'Buscamos cuidadora interna para fines de semana.',
      personType: 'mayor',
      start: 'mes',
      jornada: 'finde',
      zone: 'El Puerto',
      status: 'aceptada',
      createdAt: ago(7, 12, 0),
      respondedAt: ago(6, 9, 0),
    },
    // Otras familias → cuidadora demo (Ana García)
    {
      id: 'req-romero',
      familyId: 'fam-romero',
      caregiverId: DEMO_CAREGIVER_ID,
      need: 'Mi madre tiene Alzheimer en fase inicial. Buscamos a alguien que la acompañe por las mañanas y le ayude con la medicación.',
      personType: 'mayor',
      start: 'proxima',
      jornada: 'parcial',
      zone: 'Jerez',
      status: 'pendiente',
      createdAt: minutesAgo(95),
    },
    {
      id: 'req-dominguez',
      familyId: 'fam-dominguez',
      caregiverId: DEMO_CAREGIVER_ID,
      need: 'Acompañamiento a mi padre a la rehabilitación tres días a la semana.',
      personType: 'dependiente',
      start: 'ya',
      jornada: 'horas',
      zone: 'Jerez',
      status: 'aceptada',
      createdAt: ago(3, 11, 0),
      respondedAt: ago(3, 13, 30),
    },
  ]

  const m = (requestId: string, from: Message['from'], text: string, at: string, read = true): Message => ({
    id: `${requestId}-${at}-${from}`,
    requestId,
    from,
    text,
    at,
    read,
  })

  const messages: Message[] = [
    m('req-laura', 'system', 'Match confirmado. Ya podéis hablar y organizar los detalles del cuidado.', ago(1, 18, 2)),
    m('req-laura', 'family', 'Hola, Laura. Gracias por aceptar la solicitud. Me gustaría concretar contigo el cuidado de mi madre por las tardes. ¿Tienes disponibilidad esta semana para hablar con más detalle?', minutesAgo(190)),
    m('req-laura', 'caregiver', 'Hola, encantada. Sí, tengo disponibilidad. Podemos hacer una videollamada esta tarde a las 18:00 si te viene bien, y así vemos las necesidades y el plan de cuidados.', minutesAgo(165)),
    m('req-laura', 'family', 'Perfecto, a las 18:00 me va bien. ¿Te parece si te envío un breve resumen de la situación antes de la llamada?', minutesAgo(120)),
    m('req-laura', 'caregiver', 'Genial, así lo reviso y lo comentamos tranquila. Muchas gracias.', minutesAgo(16), false),

    m('req-anas', 'system', 'Match confirmado. Ya podéis hablar y organizar los detalles del cuidado.', ago(6, 9, 0)),
    m('req-anas', 'family', '¿Podrías los fines de semana de diciembre?', ago(6, 10, 0)),
    m('req-anas', 'caregiver', 'Quedo a la espera de tu confirmación de fechas para organizarme.', ago(4, 17, 45)),

    m('req-dominguez', 'system', 'Match confirmado. Ya podéis hablar y organizar los detalles del cuidado.', ago(3, 13, 30)),
    m('req-dominguez', 'caregiver', 'Hola, Marisa. Encantada de poder ayudaros. ¿Qué días tiene tu padre la rehabilitación?', ago(3, 13, 45)),
    m('req-dominguez', 'family', 'Lunes, miércoles y viernes a las 10:00 en el centro de salud de La Granja.', ago(1, 16, 12), false),
    m('req-dominguez', 'family', '¿Te vendría bien empezar el próximo lunes?', minutesAgo(60 * 20), false),
  ]

  return {
    version: STATE_VERSION,
    session: { role: 'guest' },
    caregivers: seedCaregivers(),
    families,
    requests,
    messages,
    notifications: [
      { id: 'n1', role: 'family', userId: DEMO_FAMILY_ID, text: 'Laura M. te ha escrito un mensaje.', link: '/mensajes/req-laura', at: minutesAgo(16), read: false },
      { id: 'n2', role: 'family', userId: DEMO_FAMILY_ID, text: 'Laura M. ha aceptado tu solicitud. ¡Match confirmado!', link: '/mensajes/req-laura', at: ago(1, 18, 2), read: true },
      { id: 'n3', role: 'caregiver', userId: DEMO_CAREGIVER_ID, text: 'Familia Romero quiere contactar contigo.', link: '/cuidadora/solicitudes', at: minutesAgo(95), read: false },
      { id: 'n4', role: 'caregiver', userId: DEMO_CAREGIVER_ID, text: 'Familia Domínguez te ha enviado un mensaje.', link: '/mensajes/req-dominguez', at: minutesAgo(60 * 20), read: false },
      { id: 'n5', role: 'caregiver', userId: DEMO_CAREGIVER_ID, text: 'Tu DNI ha sido revisado por el equipo.', link: '/cuidadora/perfil/documentacion', at: ago(5, 11, 3), read: true },
    ],
    activity: [
      { id: 'a1', caregiverId: DEMO_CAREGIVER_ID, text: 'Has recibido una solicitud de contacto de Familia Romero.', at: minutesAgo(95), highlight: true },
      { id: 'a2', caregiverId: DEMO_CAREGIVER_ID, text: 'Has recibido un nuevo mensaje de una familia.', at: ago(1, 16, 12), highlight: true },
      { id: 'a3', caregiverId: DEMO_CAREGIVER_ID, text: 'Tu perfil ha sido revisado y está completo.', at: ago(5, 11, 3) },
      { id: 'a4', caregiverId: DEMO_CAREGIVER_ID, text: 'Has completado la sección de cuidados que puedes ofrecer.', at: ago(8, 18, 45) },
    ],
    integral: [],
    notes: [],
    lastSearch: emptyFilters(),
  }
}
