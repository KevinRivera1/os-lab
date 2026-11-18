import { ModulePage, type KeyTerm, type TheorySection } from '../components/ModulePage'

const sections: TheorySection[] = [
  {
    title: 'Proceso e hilo',
    body: 'Un proceso es un programa en ejecución con su propio espacio de direcciones, recursos y estado. Un hilo es una unidad de ejecución dentro del proceso que comparte ese espacio con otros hilos.',
    bullets: [
      'El proceso incluye código, datos, heap, pila y registros.',
      'Los hilos comparten código y datos, pero tienen pila y registros propios.',
      'Cambiar de hilo es más barato que cambiar de proceso.',
    ],
  },
  {
    title: 'Estados y transiciones',
    body: 'Un proceso atraviesa estados a medida que el planificador y los eventos de E/S lo mueven de un lugar a otro.',
    bullets: [
      'Nuevo → Listo: el proceso se admite en el sistema.',
      'Listo → Ejecutando: el planificador le asigna la CPU.',
      'Ejecutando → Bloqueado: espera un evento o una E/S.',
      'Ejecutando → Listo: expira su quantum o llega otro proceso de mayor prioridad.',
      'Ejecutando → Terminado: finaliza su ráfaga de CPU.',
    ],
  },
  {
    title: 'Planificación, sincronización y comunicación',
    body: 'El planificador decide quién usa la CPU; la sincronización evita condiciones de carrera; la comunicación permite cooperar a procesos independientes.',
    bullets: [
      'Planificaciones: FCFS, SJF, SRTF, Round Robin y prioridades.',
      'Sincronización: semáforos, exclusión mutua y productor-consumidor.',
      'Comunicación: memoria compartida y paso de mensajes.',
    ],
    note: 'Los laboratorios calculan métricas reales: tiempos de espera, retorno y respuesta.',
  },
]

const terms: KeyTerm[] = [
  { term: 'Ráfaga de CPU', definition: 'Intervalo durante el cual un proceso usa efectivamente la CPU.' },
  { term: 'Quantum', definition: 'Unidad de tiempo que se asigna a cada proceso en Round Robin.' },
  { term: 'Sección crítica', definition: 'Fragmento de código que debe ejecutarse de forma exclusiva para evitar inconsistencias.' },
  { term: 'Condición de carrera', definition: 'Resultado dependiente del orden no determinista de acceso a datos compartidos.' },
]

export function Processes() {
  return (
    <ModulePage
      moduleId="processes"
      intro="Aquí la teoría se vuelve ejecución: crea procesos, cambia algoritmos y observa cómo cambian los resultados."
      sections={sections}
      terms={terms}
    />
  )
}
