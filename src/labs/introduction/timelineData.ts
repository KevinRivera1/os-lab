export interface Era {
  id: string
  year: string
  title: string
  summary: string
  representative: string
  features: string[]
  type: string
}

export interface OsType {
  id: string
  name: string
  description: string
  strengths: string[]
  example: string
}

export const eras: Era[] = [
  {
    id: 'manual',
    year: '1940s',
    title: 'Operación manual',
    summary: 'Un operador preparaba el hardware y cargaba los programas uno por uno.',
    representative: 'ENIAC (configuración por interruptores)',
    features: ['Sin sistema operativo', 'Tiempo de preparación muy alto', 'Un usuario por sesión'],
    type: 'batch',
  },
  {
    id: 'batch',
    year: '1950s',
    title: 'Sistemas por lotes',
    summary: 'Los trabajos se agrupaban en cintas y se ejecutaban de forma secuencial.',
    representative: 'IBM 7090 / IBSYS',
    features: ['Monitor residente', 'Procesamiento secuencial', 'Mejor aprovechamiento de la CPU'],
    type: 'batch',
  },
  {
    id: 'multiprogram',
    year: '1960s',
    title: 'Multiprogramación',
    summary: 'Varios programas residen en memoria y se turns la CPU cuando uno espera E/S.',
    representative: 'IBM OS/360',
    features: ['Varios procesos en memoria', 'Interrupciones y planificación', 'Protección de memoria'],
    type: 'timesharing',
  },
  {
    id: 'timesharing',
    year: '1970s',
    title: 'Tiempo compartido y UNIX',
    summary: 'Muchos usuarios interactúan al mismo tiempo mediante terminales.',
    representative: 'UNIX, MULTICS, VMS',
    features: ['Interactiveidad', 'Sistema de archivos jerárquico', 'Shell y pipes'],
    type: 'timesharing',
  },
  {
    id: 'pc',
    year: '1980s',
    title: 'Computadora personal',
    summary: 'El SO llega a escritorios con interfaces gráficas y aplicaciones para el usuario final.',
    representative: 'MS-DOS, Mac OS, Windows',
    features: ['Interfaz gráfica', 'Multitarea', 'Controladores para dispositivos'],
    type: 'personal',
  },
  {
    id: 'network',
    year: '1990s',
    title: 'Redes e Internet',
    summary: 'Los sistemas se conectan y cooperan: aparecen cliente-servidor y servicios distribuidos.',
    representative: 'Windows NT, Linux, Solaris',
    features: ['Soporte de red nativo', 'Seguridad y permisos', 'Servicios distribuidos'],
    type: 'network',
  },
  {
    id: 'modern',
    year: '2000s–hoy',
    title: 'Sistemas modernos',
    summary: 'Virtualización, móviles, múltiples núcleos y contenedores dominan el panorama.',
    representative: 'Linux, Android, iOS, Windows 11',
    features: ['Multiprocesador y multihilo', 'Virtualización y contenedores', 'Gestión energética'],
    type: 'embedded',
  },
]

export const osTypes: OsType[] = [
  {
    id: 'batch',
    name: 'Por lotes',
    description: 'Procesa trabajos completos sin intervención del usuario, optimizando el rendimiento global.',
    strengths: ['Alto rendimiento en trabajos repetitivos', 'Poca interacción requerida'],
    example: 'IBM IBSYS',
  },
  {
    id: 'timesharing',
    name: 'Tiempo compartido',
    description: 'Reparte la CPU entre múltiples usuarios o procesos para dar respuesta interactiva.',
    strengths: ['Multiusuario', 'Tiempos de respuesta cortos'],
    example: 'UNIX',
  },
  {
    id: 'realtime',
    name: 'Tiempo real',
    description: 'Garantiza que las tareas críticas se completen antes de una fecha límite estricta.',
    strengths: ['Predecibilidad', 'Prioridades estrictas'],
    example: 'VxWorks, QNX',
  },
  {
    id: 'personal',
    name: 'Personal / escritorio',
    description: 'Diseñado para un usuario, con interfaz gráfica y amplia compatibilidad de dispositivos.',
    strengths: ['Facilidad de uso', 'Ecosistema de aplicaciones'],
    example: 'Windows, macOS',
  },
  {
    id: 'network',
    name: 'De red y distribuidos',
    description: 'Coordina recursos de varias máquinas y ofrece servicios compartidos a través de la red.',
    strengths: ['Escalabilidad', 'Recursos compartidos'],
    example: 'Linux servidor',
  },
  {
    id: 'embedded',
    name: 'Embebidos y móviles',
    description: 'Optimizado para hardware limitado, bajo consumo y funciones específicas.',
    strengths: ['Bajo consumo', 'Arranque y respuesta rápidos'],
    example: 'Android, FreeRTOS',
  },
]
