export type ProcessState = 'nuevo' | 'listo' | 'ejecutando' | 'bloqueado' | 'terminado'

export interface SimProcess {
  id: string
  state: ProcessState
  remaining: number
  color: string
}

export interface Transition {
  from: ProcessState
  to: ProcessState
  event: string
  detail: string
}

export const stateOrder: ProcessState[] = ['nuevo', 'listo', 'ejecutando', 'bloqueado', 'terminado']

export const stateLabels: Record<ProcessState, string> = {
  nuevo: 'Nuevo',
  listo: 'Listo',
  ejecutando: 'Ejecutando',
  bloqueado: 'Bloqueado',
  terminado: 'Terminado',
}

export const transitions: Transition[] = [
  { from: 'nuevo', to: 'listo', event: 'Admitir', detail: 'El planificador acepta el proceso y lo coloca en la cola de listos.' },
  { from: 'listo', to: 'ejecutando', event: 'Despachar', detail: 'La CPU asigna un quantum al proceso.' },
  { from: 'ejecutando', to: 'listo', event: 'Expira quantum', detail: 'El proceso devuelve la CPU sin haber terminado.' },
  { from: 'ejecutando', to: 'bloqueado', event: 'Esperar E/S', detail: 'El proceso espera un evento externo.' },
  { from: 'bloqueado', to: 'listo', event: 'E/S completa', detail: 'El evento termina y el proceso vuelve a la cola de listos.' },
  { from: 'ejecutando', to: 'terminado', event: 'Terminar', detail: 'El proceso completa su ráfaga y libera sus recursos.' },
]

export function availableTransitions(state: ProcessState): Transition[] {
  return transitions.filter((transition) => transition.from === state)
}

export function applyTransition(process: SimProcess, transition: Transition): SimProcess {
  const remaining =
    transition.to === 'ejecutando' || transition.from === 'ejecutando'
      ? Math.max(0, process.remaining - 1)
      : process.remaining
  return { ...process, state: transition.to, remaining }
}
