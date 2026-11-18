export type FitStrategy = 'first' | 'best' | 'worst'

export interface MemoryBlock {
  start: number
  size: number
  processId: string | null
  color: string
}

export const fitLabels: Record<FitStrategy, string> = {
  first: 'First fit — primer hueco que sirva',
  best: 'Best fit — hueco más pequeño que sirva',
  worst: 'Worst fit — hueco más grande',
}

export function createMemory(total: number): MemoryBlock[] {
  return [{ start: 0, size: total, processId: null, color: '' }]
}

function mergeFree(blocks: MemoryBlock[]): MemoryBlock[] {
  const result: MemoryBlock[] = []
  for (const block of blocks) {
    const last = result[result.length - 1]
    if (block.processId === null && last?.processId === null) {
      last.size += block.size
    } else {
      result.push({ ...block })
    }
  }
  return result
}

export function allocate(
  blocks: MemoryBlock[],
  processId: string,
  size: number,
  strategy: FitStrategy,
  color: string,
): { blocks: MemoryBlock[]; ok: boolean; message: string } {
  if (!processId.trim() || size <= 0) {
    return { blocks, ok: false, message: 'El identificador y un tamaño positivo son obligatorios.' }
  }
  if (blocks.some((block) => block.processId === processId)) {
    return { blocks, ok: false, message: `El proceso ${processId} ya está residente.` }
  }

  const candidates = blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.processId === null && block.size >= size)

  if (candidates.length === 0) {
    return { blocks, ok: false, message: `No hay un hueco libre de ${size} unidades.` }
  }

  let choice = candidates[0]
  if (strategy === 'best') {
    choice = candidates.reduce((best, item) => (item.block.size < best.block.size ? item : best))
  } else if (strategy === 'worst') {
    choice = candidates.reduce((best, item) => (item.block.size > best.block.size ? item : best))
  }

  const updated = [...blocks]
  const allocated: MemoryBlock = { start: choice.block.start, size, processId: processId.trim(), color }
  const remainder = choice.block.size - size
  if (remainder > 0) {
    updated.splice(choice.index, 1, allocated, { start: choice.block.start + size, size: remainder, processId: null, color: '' })
  } else {
    updated[choice.index] = allocated
  }
  return { blocks: updated, ok: true, message: `${processId} asignado en ${allocated.start}–${allocated.start + size} (${strategy} fit).` }
}

export function deallocate(blocks: MemoryBlock[], processId: string): { blocks: MemoryBlock[]; ok: boolean; message: string } {
  const target = blocks.find((block) => block.processId === processId)
  if (!target) return { blocks, ok: false, message: `El proceso ${processId} no está en memoria.` }
  const freed = blocks.map((block) => (block.processId === processId ? { ...block, processId: null, color: '' } : block))
  return { blocks: mergeFree(freed), ok: true, message: `${processId} liberado. Los huecos contiguos se fusionaron.` }
}

export function memoryStats(blocks: MemoryBlock[]) {
  const free = blocks.filter((block) => block.processId === null)
  return {
    total: blocks.reduce((sum, block) => sum + block.size, 0),
    used: blocks.filter((block) => block.processId !== null).reduce((sum, block) => sum + block.size, 0),
    free: free.reduce((sum, block) => sum + block.size, 0),
    fragments: free.length,
    largestFree: free.reduce((max, block) => Math.max(max, block.size), 0),
  }
}
