export interface PagingProcess {
  id: string
  size: number
  pages: number
  color: string
  pageTable: (number | null)[]
}

export interface PagingState {
  pageSize: number
  frameCount: number
  frames: { processId: string | null; page: number | null; color: string }[]
  processes: PagingProcess[]
}

const colors = ['#7764ed', '#22d3ee', '#f59e0b', '#34d399', '#f472b6', '#60a5fa']

export function createPagingState(pageSize: number, frameCount: number): PagingState {
  return {
    pageSize,
    frameCount,
    frames: Array.from({ length: frameCount }, () => ({ processId: null, page: null, color: '' })),
    processes: [],
  }
}

export function allocateProcess(
  state: PagingState,
  id: string,
  size: number,
): { state: PagingState; ok: boolean; message: string } {
  if (!id.trim() || size <= 0) return { state, ok: false, message: 'Indica un identificador y un tamaño positivo.' }
  if (state.processes.some((process) => process.id === id)) return { state, ok: false, message: `El proceso ${id} ya está asignado.` }

  const pages = Math.ceil(size / state.pageSize)
  const freeFrames = state.frames
    .map((frame, index) => (frame.processId === null ? index : -1))
    .filter((index) => index >= 0)

  if (freeFrames.length < pages) {
    return { state, ok: false, message: `Se necesitan ${pages} marcos libres; solo hay ${freeFrames.length}.` }
  }

  const color = colors[state.processes.length % colors.length]
  const chosen = freeFrames.slice(0, pages)
  const frames = state.frames.map((frame, index) => {
    const position = chosen.indexOf(index)
    return position === -1 ? frame : { processId: id, page: position, color }
  })
  const pageTable = Array.from({ length: pages }, (_, page) => chosen[page])
  const process: PagingProcess = { id: id.trim(), size, pages, color, pageTable }

  return {
    state: { ...state, frames, processes: [...state.processes, process] },
    ok: true,
    message: `${id} ocupa ${pages} página(s) en los marcos ${chosen.join(', ')}.`,
  }
}

export function releaseProcess(state: PagingState, id: string): { state: PagingState; ok: boolean; message: string } {
  if (!state.processes.some((process) => process.id === id)) {
    return { state, ok: false, message: `El proceso ${id} no existe.` }
  }
  return {
    state: {
      ...state,
      frames: state.frames.map((frame) =>
        frame.processId === id ? { processId: null, page: null, color: '' } : frame,
      ),
      processes: state.processes.filter((process) => process.id !== id),
    },
    ok: true,
    message: `${id} liberó todos sus marcos.`,
  }
}

export function translate(
  state: PagingState,
  processId: string,
  page: number,
  offset: number,
): { ok: boolean; message: string } {
  const process = state.processes.find((item) => item.id === processId)
  if (!process) return { ok: false, message: 'Selecciona un proceso asignado.' }
  if (page < 0 || page >= process.pages) return { ok: false, message: `El proceso solo tiene ${process.pages} página(s).` }
  if (offset < 0 || offset >= state.pageSize) return { ok: false, message: `El desplazamiento debe estar entre 0 y ${state.pageSize - 1}.` }
  const frame = process.pageTable[page]
  if (frame === null) return { ok: false, message: 'Página sin marco asignado.' }
  const virtual = page * state.pageSize + offset
  const physical = frame * state.pageSize + offset
  return {
    ok: true,
    message: `Dir. lógica ${virtual} (pág. ${page}, despl. ${offset}) → marco ${frame} → dir. física ${physical}.`,
  }
}
