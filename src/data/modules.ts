import type { LucideIcon } from 'lucide-react'
import { BookOpen, Boxes, Cpu, HardDrive, MemoryStick } from 'lucide-react'

export type ModuleId = 'introduction' | 'organization' | 'processes' | 'memory' | 'storage'

export interface LabLink {
  label: string
  path: string
  description: string
}

export interface ModuleInfo {
  id: ModuleId
  number: number
  title: string
  shortTitle: string
  tagline: string
  description: string
  topics: string[]
  labs: LabLink[]
  icon: LucideIcon
  accent: string
}

export const modules: ModuleInfo[] = [
  {
    id: 'introduction',
    number: 1,
    title: 'Introducción a los Sistemas Operativos',
    shortTitle: 'Introducción',
    tagline: 'Definiciones, tipos y evolución histórica',
    description:
      'Descubre qué es un sistema operativo, para qué sirve y cómo ha evolucionado hasta los sistemas modernos.',
    topics: ['Definición de SO', 'Tipos de sistemas operativos', 'Historia y evolución'],
    labs: [
      {
        label: 'Línea de tiempo e historia',
        path: '/labs/introduction/timeline',
        description: 'Explora la evolución histórica y compara las características de cada sistema.',
      },
    ],
    icon: BookOpen,
    accent: 'from-sky-500 to-cyan-400',
  },
  {
    id: 'organization',
    number: 2,
    title: 'Organización de los Sistemas Operativos',
    shortTitle: 'Organización',
    tagline: 'Componentes, servicios y estructura',
    description:
      'Recorre la arquitectura interna de un sistema operativo y observa cómo sus componentes se relacionan.',
    topics: ['Componentes y servicios', 'Interfaz de programación', 'Estructura del kernel'],
    labs: [
      {
        label: 'Arquitectura interactiva',
        path: '/labs/organization/architecture',
        description: 'Selecciona un componente y descubre sus funciones y relaciones.',
      },
    ],
    icon: Boxes,
    accent: 'from-indigo-500 to-violet-400',
  },
  {
    id: 'processes',
    number: 3,
    title: 'Gestión de Procesos',
    shortTitle: 'Procesos',
    tagline: 'Estados, planificación, concurrencia y comunicación',
    description:
      'Experimenta con el ciclo de vida de los procesos, los algoritmos de planificación y la cooperación entre ellos.',
    topics: ['Estados de un proceso', 'Planificación de CPU', 'Sincronización', 'Comunicación entre procesos'],
    labs: [
      {
        label: 'Planificación de CPU',
        path: '/labs/processes/cpu-scheduling',
        description: 'FCFS, SJF, SRTF, Round Robin y prioridades con diagrama de Gantt y métricas.',
      },
      {
        label: 'Estados de un proceso',
        path: '/labs/processes/states',
        description: 'Observa las transiciones Nuevo, Listo, Ejecutando, Bloqueado y Terminado.',
      },
      {
        label: 'Sincronización',
        path: '/labs/processes/synchronization',
        description: 'Productor-consumidor, sección crítica, exclusión mutua y semáforos.',
      },
      {
        label: 'Memoria compartida',
        path: '/labs/processes/shared-memory',
        description: 'Visualiza cómo dos procesos intercambian datos mediante una región común.',
      },
      {
        label: 'Paso de mensajes',
        path: '/labs/processes/message-passing',
        description: 'Simula el envío de mensajes entre procesos con colas y acknowledgements.',
      },
      {
        label: 'Hilos',
        path: '/labs/processes/threads',
        description: 'Compara la ejecución de hilos dentro de un mismo proceso.',
      },
    ],
    icon: Cpu,
    accent: 'from-violet-500 to-fuchsia-400',
  },
  {
    id: 'memory',
    number: 4,
    title: 'Gestión de la Memoria',
    shortTitle: 'Memoria',
    tagline: 'Asignación, paginación y memoria virtual',
    description:
      'Comprende cómo el sistema operativo reparte la memoria y traduce direcciones entre procesos y hardware.',
    topics: ['Memoria principal', 'Paginación', 'Memoria virtual y reemplazo'],
    labs: [
      {
        label: 'Memoria principal',
        path: '/labs/memory/main-memory',
        description: 'Asigna y libera bloques de memoria con first fit, best fit y worst fit.',
      },
      {
        label: 'Paginación',
        path: '/labs/memory/paging',
        description: 'Define páginas y marcos, y consulta la tabla de páginas resultante.',
      },
      {
        label: 'Memoria virtual',
        path: '/labs/memory/virtual-memory',
        description: 'Fallos de página y algoritmos de reemplazo FIFO, LRU y óptimo.',
      },
    ],
    icon: MemoryStick,
    accent: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'storage',
    number: 5,
    title: 'Gestión del Almacenamiento',
    shortTitle: 'Almacenamiento',
    tagline: 'Bloques, sistemas de archivos y asignación',
    description:
      'Explora cómo se organiza el disco, cómo se estructuran los archivos y cómo se asignan sus bloques.',
    topics: ['Almacenamiento secundario', 'Sistemas de archivos', 'Asignación de archivos'],
    labs: [
      {
        label: 'Almacenamiento secundario',
        path: '/labs/storage/secondary-storage',
        description: 'Gestiona bloques de disco y visualiza la asignación de espacio.',
      },
      {
        label: 'Sistema de archivos',
        path: '/labs/storage/file-system',
        description: 'Crea directorios y archivos en una estructura jerárquica simulada.',
      },
      {
        label: 'Asignación de archivos',
        path: '/labs/storage/file-allocation',
        description: 'Compara asignación contigua, enlazada e indexada sobre el disco.',
      },
    ],
    icon: HardDrive,
    accent: 'from-amber-500 to-orange-400',
  },
]

export const allLabs = modules.flatMap((module) =>
  module.labs.map((lab) => ({ ...lab, moduleId: module.id, moduleTitle: module.shortTitle })),
)

export const getModule = (id: string | undefined) => modules.find((module) => module.id === id)
