export type ReplacementAlgorithm = 'FIFO' | 'LRU' | 'OPT'

export interface VMStep {
  reference: number
  frames: (number | null)[]
  hit: boolean
  replaced: number | null
  description: string
}

export interface VMResult {
  steps: VMStep[]
  hits: number
  faults: number
  hitRate: number
  faultRate: number
}

export const replacementLabels: Record<ReplacementAlgorithm, string> = {
  FIFO: 'FIFO — primero en entrar, primero en salir',
  LRU: 'LRU — menos recientemente usado',
  OPT: 'Óptimo — referencia más lejana en el futuro',
}

export function simulateVirtualMemory(
  references: number[],
  frameCount: number,
  algorithm: ReplacementAlgorithm,
): VMResult {
  const frames: (number | null)[] = Array.from({ length: frameCount }, () => null)
  const lastUsed = new Map<number, number>()
  const loadedOrder: number[] = []
  const steps: VMStep[] = []
  let hits = 0
  let faults = 0

  references.forEach((reference, time) => {
    const hit = frames.includes(reference)
    let replaced: number | null = null
    let description: string

    if (hit) {
      hits++
      description = `Página ${reference} ya está en memoria (acierto).`
    } else {
      faults++
      let target = frames.indexOf(null)
      if (target === -1) {
        if (algorithm === 'FIFO') {
          replaced = loadedOrder.shift()!
        } else if (algorithm === 'LRU') {
          const candidates = frames.filter((page): page is number => page !== null)
          replaced = candidates.reduce((oldest, page) =>
            (lastUsed.get(page) ?? -1) < (lastUsed.get(oldest) ?? -1) ? page : oldest,
          )
        } else {
          const candidates = frames.filter((page): page is number => page !== null)
          replaced = candidates.reduce((farthest, page) => {
            const nextOfPage = references.slice(time + 1).findIndex((value) => value === page)
            const nextOfFarthest = references.slice(time + 1).findIndex((value) => value === farthest)
            const distancePage = nextOfPage === -1 ? Infinity : nextOfPage
            const distanceFarthest = nextOfFarthest === -1 ? Infinity : nextOfFarthest
            return distancePage > distanceFarthest ? page : farthest
          })
        }
        target = frames.indexOf(replaced)
        frames[target] = null
        loadedOrder.splice(loadedOrder.indexOf(replaced), 1)
        description = `Fallos de página: se sustituye ${replaced} por ${reference} (${algorithm}).`
      } else {
        description = `Fallo de página: se carga ${reference} en el marco ${target}.`
      }
      frames[target] = reference
      loadedOrder.push(reference)
    }

    lastUsed.set(reference, time)
    steps.push({ reference, frames: [...frames], hit, replaced, description })
  })

  const total = references.length || 1
  return {
    steps,
    hits,
    faults,
    hitRate: Math.round((hits / total) * 100),
    faultRate: Math.round((faults / total) * 100),
  }
}

export function parseReferences(raw: string): number[] | null {
  const values = raw
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((value) => Number(value))
  if (values.length === 0) return null
  if (values.some((value) => !Number.isInteger(value) || value < 0)) return null
  return values
}
