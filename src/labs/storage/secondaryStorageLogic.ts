export interface DiskBlock {
  index: number
  fileId: string | null
  color: string
}

export interface DiskState {
  total: number
  blocksPerTrack: number
  blocks: DiskBlock[]
}

const colors = ['#7764ed', '#22d3ee', '#f59e0b', '#34d399', '#f472b6', '#60a5fa']

export function createDisk(total: number, blocksPerTrack: number): DiskState {
  return {
    total,
    blocksPerTrack,
    blocks: Array.from({ length: total }, (_, index) => ({ index, fileId: null, color: '' })),
  }
}

export function allocateFile(
  state: DiskState,
  fileId: string,
  count: number,
): { state: DiskState; ok: boolean; message: string } {
  if (!fileId.trim() || count <= 0) return { state, ok: false, message: 'Indica un nombre de archivo y un número de bloques positivo.' }
  if (state.blocks.some((block) => block.fileId === fileId)) return { state, ok: false, message: `El archivo ${fileId} ya existe.` }

  let start = -1
  let run = 0
  for (let index = 0; index <= state.total; index++) {
    if (index < state.total && state.blocks[index].fileId === null) {
      if (run === 0) start = index
      run++
      if (run >= count) break
    } else {
      run = 0
    }
  }
  if (run < count) return { state, ok: false, message: `No hay ${count} bloques contiguos libres.` }

  const color = colors[new Set(state.blocks.map((block) => block.fileId).filter(Boolean)).size % colors.length]
  const blocks = state.blocks.map((block) =>
    block.index >= start && block.index < start + count ? { ...block, fileId: fileId.trim(), color } : block,
  )
  const firstTrack = Math.floor(start / state.blocksPerTrack)
  const lastTrack = Math.floor((start + count - 1) / state.blocksPerTrack)
  return {
    state: { ...state, blocks },
    ok: true,
    message: `${fileId} reservó bloques ${start}–${start + count - 1} (pistas ${firstTrack}–${lastTrack}).`,
  }
}

export function releaseFile(state: DiskState, fileId: string): { state: DiskState; ok: boolean; message: string } {
  if (!state.blocks.some((block) => block.fileId === fileId)) {
    return { state, ok: false, message: `El archivo ${fileId} no está en el disco.` }
  }
  return {
    state: {
      ...state,
      blocks: state.blocks.map((block) => (block.fileId === fileId ? { ...block, fileId: null, color: '' } : block)),
    },
    ok: true,
    message: `${fileId} eliminado; sus bloques quedaron libres.`,
  }
}

export function defragment(state: DiskState): DiskState {
  const files = new Map<string, string>()
  for (const block of state.blocks) {
    if (block.fileId && !files.has(block.fileId)) files.set(block.fileId, block.color)
  }
  let cursor = 0
  const blocks: DiskBlock[] = state.blocks.map((_, index) => ({ index, fileId: null, color: '' }))
  for (const [fileId, color] of files) {
    const count = state.blocks.filter((block) => block.fileId === fileId).length
    for (let i = 0; i < count; i++) {
      blocks[cursor] = { index: cursor, fileId, color }
      cursor++
    }
  }
  return { ...state, blocks }
}

export function diskStats(state: DiskState) {
  const used = state.blocks.filter((block) => block.fileId !== null).length
  let fragments = 0
  let previousFree = false
  for (const block of state.blocks) {
    if (block.fileId === null && !previousFree) fragments++
    previousFree = block.fileId === null
  }
  return { used, free: state.total - used, fragments, files: new Set(state.blocks.map((b) => b.fileId).filter(Boolean)).size }
}
