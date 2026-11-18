export type Structure = 'monolithic' | 'layered' | 'microkernel' | 'hybrid'

export interface OsComponent {
  id: string
  name: string
  layer: 'usuario' | 'kernel' | 'hardware'
  icon: string
  role: string
  functions: string[]
  relatesTo: string[]
}

export const components: OsComponent[] = [
  {
    id: 'ui',
    name: 'Interfaz de usuario',
    layer: 'usuario',
    icon: 'Monitor',
    role: 'Punto de entrada visible para el usuario: línea de comandos o interfaz gráfica.',
    functions: ['Recibir comandos', 'Mostrar resultados', 'Lanzar aplicaciones'],
    relatesTo: ['syscalls', 'process'],
  },
  {
    id: 'apps',
    name: 'Aplicaciones',
    layer: 'usuario',
    icon: 'AppWindow',
    role: 'Programas que solicitan servicios al sistema operativo mediante llamadas al sistema.',
    functions: ['Ejecutar lógica de usuario', 'Solicitar E/S', 'Crear procesos e hilos'],
    relatesTo: ['syscalls', 'ui'],
  },
  {
    id: 'syscalls',
    name: 'Llamadas al sistema',
    layer: 'kernel',
    icon: 'ArrowLeftRight',
    role: 'Interfaz de programación que permite pasar de modo usuario a modo kernel de forma controlada.',
    functions: ['Validar parámetros', 'Cambiar modo de ejecución', 'Verificar permisos'],
    relatesTo: ['kernel', 'process', 'filesystem', 'drivers'],
  },
  {
    id: 'kernel',
    name: 'Kernel',
    layer: 'kernel',
    icon: 'Cpu',
    role: 'Núcleo del sistema: gestiona recursos, arbitra el acceso y mantiene el estado del sistema.',
    functions: ['Planificación', 'Control de interrupciones', 'Coordinación de subsistemas'],
    relatesTo: ['process', 'memory', 'filesystem', 'drivers', 'syscalls'],
  },
  {
    id: 'process',
    name: 'Gestión de procesos',
    layer: 'kernel',
    icon: 'Workflow',
    role: 'Controla el ciclo de vida de procesos e hilos y decide qué entidad usa la CPU.',
    functions: ['Crear y terminar procesos', 'Planificar CPU', 'Sincronizar y comunicar'],
    relatesTo: ['kernel', 'memory', 'syscalls'],
  },
  {
    id: 'memory',
    name: 'Gestión de memoria',
    layer: 'kernel',
    icon: 'MemoryStick',
    role: 'Asigna, protege y traduce la memoria usada por los procesos.',
    functions: ['Asignación y liberación', 'Paginación', 'Protección entre procesos'],
    relatesTo: ['kernel', 'process'],
  },
  {
    id: 'filesystem',
    name: 'Sistema de archivos',
    layer: 'kernel',
    icon: 'FolderTree',
    role: 'Organiza los datos persistentes en archivos y directorios sobre el almacenamiento.',
    functions: ['Crear y eliminar archivos', 'Gestionar directorios', 'Controlar permisos'],
    relatesTo: ['kernel', 'drivers', 'syscalls'],
  },
  {
    id: 'drivers',
    name: 'Controladores de dispositivos',
    layer: 'kernel',
    icon: 'PlugZap',
    role: 'Traducen las peticiones genéricas del kernel a comandos específicos del hardware.',
    functions: ['Manejar interrupciones', 'Transferir datos', 'Abstraer dispositivos'],
    relatesTo: ['kernel', 'filesystem', 'hardware'],
  },
  {
    id: 'hardware',
    name: 'Hardware',
    layer: 'hardware',
    icon: 'Server',
    role: 'CPU, memoria y dispositivos físicos sobre los que se ejecuta el sistema.',
    functions: ['Ejecutar instrucciones', 'Almacenar datos', 'Generar interrupciones'],
    relatesTo: ['drivers'],
  },
]

export const structures: { id: Structure; name: string; description: string }[] = [
  {
    id: 'monolithic',
    name: 'Monolítico',
    description: 'Todos los subsistemas comparten un mismo espacio de kernel y se llaman entre sí directamente.',
  },
  {
    id: 'layered',
    name: 'Por capas',
    description: 'Cada nivel usa únicamente los servicios de la capa inmediatamente inferior.',
  },
  {
    id: 'microkernel',
    name: 'Microkernel',
    description: 'El kernel es mínimo y la mayoría de servicios se ejecutan en espacio de usuario.',
  },
  {
    id: 'hybrid',
    name: 'Híbrido',
    description: 'Combina un núcleo compacto con servicios adicionales dentro del espacio de kernel.',
  },
]

export interface FlowStep {
  componentId: string
  action: string
}

export function buildSyscallFlow(structure: Structure): FlowStep[] {
  const base: FlowStep[] = [
    { componentId: 'apps', action: 'La aplicación solicita una operación (por ejemplo, leer un archivo).' },
    { componentId: 'syscalls', action: 'La llamada al sistema valida parámetros y cambia a modo kernel.' },
  ]

  if (structure === 'microkernel') {
    return [
      ...base,
      { componentId: 'kernel', action: 'El microkernel comprueba permisos y envía el mensaje al servicio.' },
      { componentId: 'filesystem', action: 'El servicio de archivos (en espacio de usuario) resuelve la petición.' },
      { componentId: 'drivers', action: 'El controlador traduce la lectura a comandos del dispositivo.' },
      { componentId: 'hardware', action: 'El dispositivo devuelve los datos y se produce la interrupción.' },
    ]
  }

  if (structure === 'layered') {
    return [
      ...base,
      { componentId: 'kernel', action: 'La capa superior delega en la capa inmediatamente inferior.' },
      { componentId: 'filesystem', action: 'La capa de archivos localiza el bloque solicitado.' },
      { componentId: 'drivers', action: 'La capa de controladores programa la transferencia.' },
      { componentId: 'hardware', action: 'El disco entrega el bloque y se notifica la finalización.' },
    ]
  }

  return [
    ...base,
    { componentId: 'kernel', action: 'El kernel interpreta la petición y verifica los permisos.' },
    { componentId: 'filesystem', action: 'El sistema de archivos traduce el nombre a ubicaciones en disco.' },
    { componentId: 'drivers', action: 'El controlador emite la orden de lectura al dispositivo.' },
    { componentId: 'hardware', action: 'El hardware transfiere los datos y genera una interrupción.' },
  ]
}
