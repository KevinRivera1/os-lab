export type AllocationMethod = 'contiguous' | 'linked' | 'indexed'

export interface AllocationLayout {
  method: AllocationMethod
  dataBlocks: number[]
  indexBlock: number | null
  nextPointers: Record<number, number | null>
  message: string
  ok: boolean
}

export const methodInfo: Record<AllocationMethod, { title: string; description: string; access: string; fragmentation: string }> = {
  contiguous: {
    title: 'Contigua',
    description: 'El archivo ocupa bloques consecutivos. El directorio guarda la dirección inicial y la longitud.',
    access: 'Acceso directo al bloque k con solo sumar k a la dirección inicial.',
    fragmentation: 'Sufre fragmentación externa; requiere compactación.',
  },
  linked: {
    title: 'Enlazada',
    description: 'Cada bloque contiene un puntero al siguiente. El directorio guarda solo la dirección del primero.',
    access: 'Acceso secuencial: hay que recorrer los bloques anteriores.',
    fragmentation: 'Sin fragmentación externa; cada bloque pierde espacio para el puntero.',
  },
  indexed: {
    title: 'Indexada',
    description: 'Un bloque índice concentra todos los punteros a los bloques de datos del archivo.',
    access: 'Acceso directo leyendo primero el bloque índice.',
    fragmentation: 'Sin fragmentación externa; coste adicional de un bloque índice.',
  },
}

export function computeAllocation(
  method: AllocationMethod,
  diskSize: number,
  start: number,
  count: number,
): AllocationLayout {
  const empty: AllocationLayout = {
    method, dataBlocks: [], indexBlock: null, nextPointers: {}, message: '', ok: false,
  }
  if (!Number.isInteger(count) || count <= 0) return { ...empty, message: 'El tamaño debe ser un entero positivo.' }
  if (!Number.isInteger(start) || start < 0 || start >= diskSize) {
    return { ...empty, message: `El bloque inicial debe estar entre 0 y ${diskSize - 1}.` }
  }

  if (method === 'contiguous') {
    if (start + count > diskSize) {
      return { ...empty, message: `No caben ${count} bloques contiguos desde ${start}.` }
    }
    const dataBlocks = Array.from({ length: count }, (_, index) => start + index)
    return {
      ...empty,
      ok: true,
      dataBlocks,
      message: `Bloques ${dataBlocks[0]}–${dataBlocks[dataBlocks.length - 1]} reservados de forma contigua.`,
    }
  }

  let cursor = start
  const dataBlocks: number[] = []
  for (let i = 0; i < count; i++) {
    if (cursor >= diskSize) {
      return { ...empty, message: `No hay suficientes bloques libres desde ${start} (disco de ${diskSize} bloques).` }
    }
    dataBlocks.push(cursor)
    cursor++
  }

  if (method === 'linked') {
    const nextPointers: Record<number, number | null> = {}
    dataBlocks.forEach((block, index) => {
      nextPointers[block] = index === dataBlocks.length - 1 ? null : dataBlocks[index + 1]
    })
    return {
      ...empty,
      ok: true,
      dataBlocks,
      nextPointers,
      message: `Cadena enlazada: ${dataBlocks.join(' → ')} → fin.`,
    }
  }

  const indexBlock = cursor < diskSize ? cursor : null
  if (indexBlock === null) {
    return { ...empty, message: 'No queda un bloque libre para el índice.' }
  }
  const nextPointers: Record<number, number | null> = {}
  dataBlocks.forEach((block, index) => {
    nextPointers[index] = block
  })
  return {
    ...empty,
    ok: true,
    dataBlocks,
    indexBlock,
    nextPointers,
    message: `Bloque índice ${indexBlock} apunta a ${dataBlocks.join(', ')}.`,
  }
}
