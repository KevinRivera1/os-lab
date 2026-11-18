export type Scenario = 'producer-consumer' | 'critical-section' | 'mutex' | 'semaphore'
export type SemaphoreKey = 'empty' | 'full' | 'mutex'
export type SyncAction = 'produce' | 'consume' | 'enter' | 'exit' | 'wait' | 'signal'

export interface SyncState {
  buffer: number[]
  capacity: number
  semaphores: Record<SemaphoreKey, number>
  inCritical: boolean
  produced: number
  consumed: number
  nextValue: number
  blocked: number
}

export interface SyncResult {
  state: SyncState
  messages: string[]
  ok: boolean
}

export const scenarioInfo: Record<Scenario, { title: string; description: string }> = {
  'producer-consumer': {
    title: 'Productor-consumidor',
    description: 'Un productor inserta datos y un consumidor los extrae usando los semáforos empty y full.',
  },
  'critical-section': {
    title: 'Sección crítica',
    description: 'Dos procesos comparten un recurso que solo puede ser usado por uno a la vez.',
  },
  mutex: {
    title: 'Exclusión mutua',
    description: 'El semáforo mutex garantiza que solo un proceso esté dentro de la sección crítica.',
  },
  semaphore: {
    title: 'Semáforos',
    description: 'Manipula directamente los semáforos para observar wait() y signal().',
  },
}

export function initialSyncState(capacity = 4): SyncState {
  return {
    buffer: [],
    capacity,
    semaphores: { empty: capacity, full: 0, mutex: 1 },
    inCritical: false,
    produced: 0,
    consumed: 0,
    nextValue: 1,
    blocked: 0,
  }
}

function wait(state: SyncState, key: SemaphoreKey): { state: SyncState; ok: boolean; message: string } {
  if (state.semaphores[key] <= 0) {
    return {
      state: { ...state, blocked: state.blocked + 1 },
      ok: false,
      message: `wait(${key}): semáforo en 0, proceso bloqueado.`,
    }
  }
  return {
    state: { ...state, semaphores: { ...state.semaphores, [key]: state.semaphores[key] - 1 } },
    ok: true,
    message: `wait(${key}): semáforo ${key} baja a ${state.semaphores[key] - 1}.`,
  }
}

function signal(state: SyncState, key: SemaphoreKey): SyncState {
  return { ...state, semaphores: { ...state.semaphores, [key]: state.semaphores[key] + 1 } }
}

export function executeAction(
  current: SyncState,
  action: SyncAction,
  semaphore: SemaphoreKey,
): SyncResult {
  const messages: string[] = []

  if (action === 'wait' || action === 'signal') {
    if (action === 'wait') {
      const result = wait(current, semaphore)
      messages.push(result.message)
      return { state: result.state, messages, ok: result.ok }
    }
    messages.push(`signal(${semaphore}): semáforo sube a ${current.semaphores[semaphore] + 1}.`)
    return { state: signal(current, semaphore), messages, ok: true }
  }

  if (action === 'enter') {
    const result = wait(current, 'mutex')
    messages.push(result.message)
    if (!result.ok) return { state: result.state, messages, ok: false }
    return { state: { ...result.state, inCritical: true }, messages, ok: true }
  }

  if (action === 'exit') {
    if (!current.inCritical) {
      messages.push('No hay ningún proceso dentro de la sección crítica.')
      return { state: current, messages, ok: false }
    }
    messages.push('signal(mutex): el recurso queda libre.')
    return { state: { ...signal(current, 'mutex'), inCritical: false }, messages, ok: true }
  }

  if (action === 'produce') {
    const empty = wait(current, 'empty')
    messages.push(empty.message)
    if (!empty.ok) return { state: empty.state, messages, ok: false }
    const mutex = wait(empty.state, 'mutex')
    messages.push(mutex.message)
    if (!mutex.ok) return { state: mutex.state, messages, ok: false }
    const value = mutex.state.nextValue
    let next = signal(mutex.state, 'mutex')
    next = signal(next, 'full')
    messages.push(`Productor inserta ${value} en el búfer.`)
    messages.push(`signal(mutex), signal(full): full = ${next.semaphores.full}.`)
    return {
      state: { ...next, buffer: [...next.buffer, value], produced: next.produced + 1, nextValue: value + 1 },
      messages,
      ok: true,
    }
  }

  const full = wait(current, 'full')
  messages.push(full.message)
  if (!full.ok) return { state: full.state, messages, ok: false }
  const mutex = wait(full.state, 'mutex')
  messages.push(mutex.message)
  if (!mutex.ok) return { state: mutex.state, messages, ok: false }
  const value = mutex.state.buffer[0]
  let next = signal(mutex.state, 'mutex')
  next = signal(next, 'empty')
  messages.push(`Consumidor extrae ${value} del búfer.`)
  messages.push(`signal(mutex), signal(empty): empty = ${next.semaphores.empty}.`)
  return {
    state: {
      ...next,
      buffer: next.buffer.slice(1),
      consumed: next.consumed + 1,
    },
    messages,
    ok: true,
  }
}
