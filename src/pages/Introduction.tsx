import { ModulePage, type KeyTerm, type TheorySection } from '../components/ModulePage'

const sections: TheorySection[] = [
  {
    title: '¿Qué es un sistema operativo?',
    body: 'Es el software de sistema que actúa como intermediario entre el hardware y los programas de usuario. Gestiona los recursos de la computadora y ofrece un entorno cómodo y seguro para ejecutar aplicaciones.',
    bullets: [
      'Administra CPU, memoria, dispositivos y almacenamiento.',
      'Provee una interfaz para usuarios y programas.',
      'Controla el acceso y resuelve conflictos entre procesos.',
    ],
    note: 'Desde el punto de vista del usuario, el SO es una interfaz; desde el punto de vista del sistema, es un gestor de recursos.',
  },
  {
    title: 'Tipos de sistemas operativos',
    body: 'Cada tipo responde a una necesidad distinta: eficiencia por lotes, interactividad, cumplimiento de plazos o coordinación de varias máquinas.',
    bullets: [
      'Por lotes (batch): agrupa trabajos y los ejecuta sin interacción.',
      'De tiempo compartido: reparte la CPU entre varios usuarios mediante multiprogramación.',
      'De tiempo real: garantiza respuestas dentro de plazos estrictos.',
      'Distribuidos, de red, embebidos y mainframe.',
    ],
  },
  {
    title: 'Historia y evolución',
    body: 'La evolución ha estado ligada al abaratamiento del hardware y a la necesidad de aprovechar mejor la CPU: de operadores manuales a sistemas multiprogramados y modernos kernels multihilo.',
    bullets: [
      '1940s–50s: operación manual y tarjetas perforadas.',
      '1960s: sistemas por lotes y multiprogramación.',
      '1970s: tiempo compartido, UNIX y microprocesadores.',
      '1980s–hoy: interfaces gráficas, redes, virtualización y móviles.',
    ],
    note: 'El laboratorio de este módulo recorre esta línea de tiempo para que compares cada generación.',
  },
]

const terms: KeyTerm[] = [
  { term: 'Recurso', definition: 'Cualquier componente del sistema susceptible de ser asignado, como CPU, memoria o un dispositivo.' },
  { term: 'Multiprogramación', definition: 'Mantener varios procesos en memoria para maximizar el uso de la CPU.' },
  { term: 'Time sharing', definition: 'Reparto rápido de la CPU entre procesos para dar sensación de uso simultáneo.' },
  { term: 'Kernel', definition: 'Parte central del SO que corre en modo privilegiado y gestiona los recursos.' },
]

export function Introduction() {
  return (
    <ModulePage
      moduleId="introduction"
      intro="Antes de simular algoritmos, necesitamos entender qué problema resuelve un sistema operativo y cómo llegó a ser lo que es hoy."
      sections={sections}
      terms={terms}
    />
  )
}
