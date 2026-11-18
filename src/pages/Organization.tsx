import { ModulePage, type KeyTerm, type TheorySection } from '../components/ModulePage'

const sections: TheorySection[] = [
  {
    title: 'Componentes principales',
    body: 'Un sistema operativo moderno se organiza como un conjunto de subsistemas que cooperan. Cada uno resuelve una responsabilidad concreta y expone servicios a los demás.',
    bullets: [
      'Gestión de procesos: creación, estados, planificación y sincronización.',
      'Gestión de memoria: asignación, paginación y protección.',
      'Sistema de archivos: organización y persistencia de datos.',
      'Controladores de dispositivos: abstracción del hardware.',
      'Interfaz de usuario y llamadas al sistema.',
    ],
  },
  {
    title: 'Servicios del sistema operativo',
    body: 'El SO ofrece servicios que las aplicaciones utilizan sin necesidad de conocer los detalles físicos del hardware.',
    bullets: [
      'Creación y terminación de programas y procesos.',
      'Operaciones de E/S y manipulación de archivos y directorios.',
      'Comunicación entre procesos.',
      'Protección, contabilidad y detección de errores.',
    ],
    note: 'Las llamadas al sistema son la puerta de entrada: cambian el modo de ejecución a privilegiado y verifican permisos.',
  },
  {
    title: 'Estructura del kernel',
    body: 'La forma de organizar estos componentes define la estructura del sistema y afecta a su rendimiento, seguridad y facilidad de mantenimiento.',
    bullets: [
      'Monolítico: todos los servicios en un único espacio de direcciones.',
      'Por capas: cada capa usa solo los servicios de la inmediatamente inferior.',
      'Microkernel: núcleo mínimo y servicios en espacio de usuario.',
      'Híbrido: combina ideas de monolítico y microkernel.',
    ],
  },
]

const terms: KeyTerm[] = [
  { term: 'Syscall', definition: 'Mecanismo controlado para solicitar un servicio del kernel desde un proceso de usuario.' },
  { term: 'Modo usuario', definition: 'Modo de ejecución restringido donde corren las aplicaciones.' },
  { term: 'Modo kernel', definition: 'Modo privilegiado con acceso completo al hardware.' },
  { term: 'Driver', definition: 'Módulo que traduce las operaciones genéricas del SO a comandos específicos de un dispositivo.' },
]

export function Organization() {
  return (
    <ModulePage
      moduleId="organization"
      intro="Observa de cerca la arquitectura de un sistema operativo: qué piezas existen, qué hacen y cómo se conectan entre sí."
      sections={sections}
      terms={terms}
    />
  )
}
