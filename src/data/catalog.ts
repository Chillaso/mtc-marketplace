// Catálogos compartidos entre el registro de cuidadoras, sus perfiles y los filtros de búsqueda.

export type Option = { id: string; label: string }

export const ZONES = [
  'Jerez',
  'El Puerto',
  'Cádiz',
  'San Fernando',
  'Chiclana',
  'Puerto Real',
  'Rota',
  'Sanlúcar',
  'Chipiona',
  'Arcos',
]

export const NATIONALITIES = [
  'Argentina',
  'Bolivia',
  'Colombia',
  'Ecuador',
  'Honduras',
  'Marruecos',
  'Nicaragua',
  'Paraguay',
  'Perú',
  'Rumanía',
  'Ucrania',
  'Venezuela',
  'Otra',
]

export const EXPERIENCE_RANGES: { id: string; label: string; min: number }[] = [
  { id: '0', label: 'Menos de 1 año', min: 0 },
  { id: '1', label: '1 a 2 años', min: 1 },
  { id: '3', label: '3 a 5 años', min: 3 },
  { id: '6', label: '6 a 10 años', min: 6 },
  { id: '10', label: 'Más de 10 años', min: 10 },
]

/** Experiencia en el cuidado (tipo de persona cuidada). Se usa también como filtro «Tipo de cuidado». */
export const CARE_TYPES: Option[] = [
  { id: 'mayores', label: 'Personas mayores' },
  { id: 'dependencia', label: 'Dependencia' },
  { id: 'alzheimer', label: 'Demencia / Alzheimer' },
  { id: 'movilidad', label: 'Movilidad reducida' },
  { id: 'discapacidad', label: 'Adultos con discapacidad' },
  { id: 'ninos', label: 'Niños' },
  { id: 'paliativos', label: 'Cuidados paliativos' },
  { id: 'postoperatorio', label: 'Recuperación postoperatoria' },
]

export const ILLNESSES: Option[] = [
  { id: 'alzheimer', label: 'Alzheimer y otras demencias' },
  { id: 'parkinson', label: 'Parkinson' },
  { id: 'ictus', label: 'Ictus' },
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'corazon', label: 'Problemas de corazón' },
  { id: 'respiracion', label: 'Problemas respiratorios (EPOC, oxígeno)' },
  { id: 'ela', label: 'ELA / esclerosis' },
  { id: 'oncologia', label: 'Enfermedad oncológica' },
]

export const WORKPLACES: Option[] = [
  { id: 'domicilio', label: 'Casas particulares' },
  { id: 'residencia', label: 'Residencias' },
  { id: 'hospital', label: 'Hospitales' },
  { id: 'centro-dia', label: 'Centros de día' },
]

export type TaskDef = { id: string; label: string; hint: string; icon: string; subtasks: string[] }

/** «¿Qué cuidados sabes realizar?» (paso 5). Cada apartado se despliega en tareas concretas. */
export const TASKS: TaskDef[] = [
  {
    id: 'aseo',
    label: 'Aseo e higiene personal',
    hint: 'Ayuda con la ducha, el baño, el aseo diario, cambio de ropa.',
    icon: 'ShowerHead',
    subtasks: ['Ducha o baño asistido', 'Aseo en cama', 'Cambio de pañal', 'Cuidado de la piel'],
  },
  {
    id: 'vestir',
    label: 'Vestirse y arreglo personal',
    hint: 'Ayuda para vestirse, peinarse o cuidado básico de la imagen.',
    icon: 'Shirt',
    subtasks: ['Vestir y desvestir', 'Peinado', 'Afeitado', 'Cuidado de uñas'],
  },
  {
    id: 'movilidad',
    label: 'Movilidad y traslados',
    hint: 'Ayudar a levantarse, sentarse, caminar o realizar traslados dentro de casa.',
    icon: 'Accessibility',
    subtasks: ['Transferencias cama-silla', 'Uso de grúa', 'Paseos con andador', 'Cambios posturales'],
  },
  {
    id: 'alimentacion',
    label: 'Alimentación',
    hint: 'Dar de comer, apoyar en la alimentación o en el uso de sondas/botón.',
    icon: 'Soup',
    subtasks: ['Dar de comer', 'Supervisar la ingesta', 'Alimentación por sonda o botón', 'Dietas de textura adaptada'],
  },
  {
    id: 'comidas',
    label: 'Preparación de comidas',
    hint: 'Planificar y cocinar comidas adaptadas a sus necesidades.',
    icon: 'CookingPot',
    subtasks: ['Cocina casera', 'Dietas para diabetes', 'Dietas sin sal', 'Hacer la compra'],
  },
  {
    id: 'medicacion',
    label: 'Apoyo en la medicación',
    hint: 'Recordar la toma de medicación según la pauta indicada.',
    icon: 'Pill',
    subtasks: ['Recordar tomas', 'Preparar pastilleros', 'Control de glucosa', 'Toma de tensión'],
  },
  {
    id: 'acompanamiento',
    label: 'Acompañamiento',
    hint: 'Acudir a citas médicas, paseos, compras o actividades de ocio.',
    icon: 'Users',
    subtasks: ['Citas médicas', 'Paseos', 'Gestiones y compras', 'Estimulación cognitiva'],
  },
  {
    id: 'hogar',
    label: 'Tareas del hogar',
    hint: 'Limpieza ligera, lavado de ropa, ordenar o mantener el entorno.',
    icon: 'House',
    subtasks: ['Limpieza ligera', 'Lavado y planchado', 'Orden del hogar'],
  },
  {
    id: 'nocturnos',
    label: 'Cuidados nocturnos',
    hint: 'Vigilancia, apoyo en el descanso o atención durante la noche.',
    icon: 'BedDouble',
    subtasks: ['Vigilancia nocturna', 'Cambios posturales de noche', 'Acompañamiento en hospital'],
  },
]

export const TRAINING: Option[] = [
  { id: 'tcae', label: 'Técnico/a en Cuidados Auxiliares de Enfermería (TCAE)' },
  { id: 'sociosanitaria', label: 'Atención Sociosanitaria' },
  { id: 'dependientes', label: 'Formación en cuidados a personas dependientes' },
  { id: 'especializados', label: 'Cursos especializados (Alzheimer, demencias, etc.)' },
  { id: 'primeros', label: 'Primeros auxilios / RCP' },
  { id: 'otra', label: 'Otra formación' },
]

export const TRAINING_SHORT: Record<string, string> = {
  tcae: 'Auxiliar de Enfermería (TCAE)',
  sociosanitaria: 'Atención Sociosanitaria',
  dependientes: 'Cuidado de personas dependientes',
  especializados: 'Curso especializado en demencias',
  primeros: 'Primeros Auxilios / RCP',
  otra: 'Otra formación',
}

export const JORNADAS: Option[] = [
  { id: 'completa', label: 'Jornada completa' },
  { id: 'parcial', label: 'Jornada parcial' },
  { id: 'horas', label: 'Por horas' },
  { id: 'noches', label: 'Turnos de noche' },
  { id: 'finde', label: 'Fin de semana' },
  { id: 'interna', label: 'Cuidadora interna' },
]

export const LANGUAGES = ['Español', 'Inglés', 'Francés', 'Portugués', 'Rumano', 'Árabe', 'Ucraniano', 'Italiano']

export const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
export const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export const START_OPTIONS: Option[] = [
  { id: 'ya', label: 'Lo antes posible' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'proxima', label: 'La próxima semana' },
  { id: 'mes', label: 'Este mes' },
  { id: 'fecha', label: 'Elegir una fecha concreta' },
]

export const PERSON_TYPES: Option[] = [
  { id: 'mayor', label: 'Persona mayor' },
  { id: 'dependiente', label: 'Persona con dependencia' },
  { id: 'discapacidad', label: 'Adulto con discapacidad' },
  { id: 'nino', label: 'Niño o niña' },
  { id: 'convalecencia', label: 'Persona en recuperación' },
]

export const labelOf = (list: Option[], id?: string) => list.find((o) => o.id === id)?.label ?? id ?? ''
