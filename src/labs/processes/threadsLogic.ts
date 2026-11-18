export type ThreadPolicy = 'round-robin' | 'priority'

export interface ThreadState {
  id: number
  name: string
  remaining: number
  instructions: number
  color: string
}

export interface ThreadsState {
  counter: number
  threads: ThreadState[]
  turn: number
  history: string[]
}

const colors = ['#7764ed', '#22d3ee', '#f59e0b', '#34d399']

export function createThreads(count: number): ThreadsState {
  return {
    counter: 0,
    turn: 0,
    history: [],
    threads: Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      name: `Hilo ${index + 1}`,
      remaining: 3,
      instructions: 0,
      color: colors[index % colors.length],
    })),
  }
}

export function stepThreads(state: ThreadsState, policy: ThreadPolicy): { state: ThreadsState; message: string | null } {
  const active = state.threads.filter((thread) => thread.remaining > 0)
  if (active.length === 0) return { state, message: null }

  let chosen: ThreadState
  if (policy === 'priority') {
    chosen = active[0]
  } else {
    chosen = active.find((thread) => thread.id > state.turn) ?? active[0]
  }

  const nextCounter = state.counter + 1
  return {
    state: {
      counter: nextCounter,
      turn: chosen.id,
      history: [...state.history, `${chosen.name}: contador → ${nextCounter}`],
      threads: state.threads.map((thread) =>
        thread.id === chosen.id
          ? { ...thread, remaining: thread.remaining - 1, instructions: thread.instructions + 1 }
          : thread,
      ),
    },
    message: `${chosen.name} ejecuta: lee contador (${state.counter}), suma 1 y escribe ${nextCounter}.`,
  }
}
