export type Algorithm = 'FCFS' | 'SJF' | 'SRTF' | 'RR' | 'PRIORITY_NP' | 'PRIORITY_P'

export interface ProcessInput {
  id: string
  arrival: number
  burst: number
  priority: number
  color: string
}

export interface GanttSegment {
  processId: string
  start: number
  end: number
  color: string
}

export interface ProcessResult extends ProcessInput {
  completion: number
  waiting: number
  turnaround: number
  response: number
}

export interface ScheduleResult {
  segments: GanttSegment[]
  results: ProcessResult[]
  order: string[]
  avgWaiting: number
  avgTurnaround: number
  avgResponse: number
  totalTime: number
}

export const algorithmLabels: Record<Algorithm, string> = {
  FCFS: 'FCFS — First Come First Served',
  SJF: 'SJF — Shortest Job First (no apropiativo)',
  SRTF: 'SRTF — Shortest Remaining Time First',
  RR: 'Round Robin',
  PRIORITY_NP: 'Prioridades no apropiativas',
  PRIORITY_P: 'Prioridades apropiativas',
}

export const processColors = ['#7764ed', '#22d3ee', '#f59e0b', '#34d399', '#f472b6', '#60a5fa', '#fb7185', '#a78bfa']

const round = (value: number) => Math.round(value * 100) / 100

function appendSegment(segments: GanttSegment[], segment: GanttSegment) {
  const last = segments[segments.length - 1]
  if (last && last.processId === segment.processId && last.end === segment.start) {
    last.end = segment.end
    return
  }
  segments.push(segment)
}

export function simulateSchedule(
  processes: ProcessInput[],
  algorithm: Algorithm,
  quantum: number,
): ScheduleResult {
  const n = processes.length
  const remaining = processes.map((process) => process.burst)
  const firstCpu = new Array<number>(n).fill(-1)
  const completion = new Array<number>(n).fill(0)
  const segments: GanttSegment[] = []
  const isPreemptive = algorithm === 'SRTF' || algorithm === 'RR' || algorithm === 'PRIORITY_P'

  if (isPreemptive) {
    const done = new Set<number>()
    const ready: number[] = []
    let quantumLeft = 0
    let finished = 0
    let time = 0
    let guard = 0

    while (finished < n && guard < 100000) {
      guard++
      for (let i = 0; i < n; i++) {
        if (!done.has(i) && processes[i].arrival <= time && !ready.includes(i)) ready.push(i)
      }

      if (ready.length === 0) {
        const nextArrival = Math.min(
          ...processes.map((process, index) => (done.has(index) ? Infinity : process.arrival)),
        )
        time = Number.isFinite(nextArrival) ? nextArrival : time + 1
        continue
      }

      let pick: number
      if (algorithm === 'RR') {
        pick = ready[0]
        if (quantumLeft === 0) quantumLeft = quantum
      } else {
        pick = ready[0]
        for (const candidate of ready.slice(1)) {
          const better =
            algorithm === 'SRTF'
              ? remaining[candidate] < remaining[pick] ||
                (remaining[candidate] === remaining[pick] && processes[candidate].arrival < processes[pick].arrival)
              : processes[candidate].priority < processes[pick].priority ||
                (processes[candidate].priority === processes[pick].priority &&
                  processes[candidate].arrival < processes[pick].arrival)
          if (better) pick = candidate
        }
      }

      if (firstCpu[pick] === -1) firstCpu[pick] = time
      remaining[pick]--
      appendSegment(segments, {
        processId: processes[pick].id,
        start: time,
        end: time + 1,
        color: processes[pick].color,
      })
      time++

      if (remaining[pick] === 0) {
        completion[pick] = time
        ready.splice(ready.indexOf(pick), 1)
        done.add(pick)
        finished++
        quantumLeft = 0
      } else if (algorithm === 'RR') {
        quantumLeft--
        if (quantumLeft === 0) {
          ready.push(ready.shift()!)
        }
      }
    }
  } else {
    const pending = processes.map((_, index) => index).sort((a, b) => {
      if (processes[a].arrival !== processes[b].arrival) return processes[a].arrival - processes[b].arrival
      return a - b
    })
    let time = 0
    let guard = 0

    while (pending.length > 0 && guard < 100000) {
      guard++
      const available = pending.filter((index) => processes[index].arrival <= time)
      if (available.length === 0) {
        time = Math.min(...pending.map((index) => processes[index].arrival))
        continue
      }

      let pick = available[0]
      for (const candidate of available.slice(1)) {
        const better =
          algorithm === 'SJF'
            ? processes[candidate].burst < processes[pick].burst ||
              (processes[candidate].burst === processes[pick].burst &&
                processes[candidate].arrival < processes[pick].arrival)
            : algorithm === 'PRIORITY_NP'
              ? processes[candidate].priority < processes[pick].priority ||
                (processes[candidate].priority === processes[pick].priority &&
                  processes[candidate].arrival < processes[pick].arrival)
              : processes[candidate].arrival < processes[pick].arrival
        if (better) pick = candidate
      }

      const start = time
      const end = time + processes[pick].burst
      appendSegment(segments, {
        processId: processes[pick].id,
        start,
        end,
        color: processes[pick].color,
      })
      firstCpu[pick] = start
      completion[pick] = end
      time = end
      pending.splice(pending.indexOf(pick), 1)
    }
  }

  const results: ProcessResult[] = processes.map((process, index) => ({
    ...process,
    completion: completion[index],
    turnaround: completion[index] - process.arrival,
    waiting: completion[index] - process.arrival - process.burst,
    response: Math.max(0, firstCpu[index] - process.arrival),
  }))

  const order = segments.reduce<string[]>((acc, segment) => {
    if (!acc.includes(segment.processId)) acc.push(segment.processId)
    return acc
  }, [])

  const total = results.length || 1
  return {
    segments,
    results,
    order,
    avgWaiting: round(results.reduce((sum, item) => sum + item.waiting, 0) / total),
    avgTurnaround: round(results.reduce((sum, item) => sum + item.turnaround, 0) / total),
    avgResponse: round(results.reduce((sum, item) => sum + item.response, 0) / total),
    totalTime: segments[segments.length - 1]?.end ?? 0,
  }
}

export function validateInputs(processes: ProcessInput[], algorithm: Algorithm, quantum: number): string | null {
  if (processes.length === 0) return 'Agrega al menos un proceso para simular.'
  for (const process of processes) {
    if (!process.id.trim()) return 'Todos los procesos necesitan un identificador.'
    if (!Number.isInteger(process.arrival) || process.arrival < 0) return `Llegada inválida en ${process.id}.`
    if (!Number.isInteger(process.burst) || process.burst <= 0) return `La ráfaga de ${process.id} debe ser un entero positivo.`
    if (!Number.isInteger(process.priority) || process.priority < 0) return `La prioridad de ${process.id} debe ser un entero ≥ 0.`
  }
  const ids = processes.map((process) => process.id.trim())
  if (new Set(ids).size !== ids.length) return 'Los identificadores de proceso no pueden repetirse.'
  if (algorithm === 'RR' && (!Number.isInteger(quantum) || quantum <= 0)) {
    return 'El quantum debe ser un entero positivo para Round Robin.'
  }
  return null
}
