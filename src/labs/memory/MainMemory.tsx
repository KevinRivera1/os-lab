import { useState } from 'react'
import { HardDriveDownload, HardDriveUpload } from 'lucide-react'
import { SimulatorLayout } from '../../components/SimulatorLayout'
import type { TerminalLine } from '../../components/Terminal'
import {
  allocate, createMemory, deallocate, fitLabels, memoryStats,
  type FitStrategy, type MemoryBlock,
} from './mainMemoryLogic'

const colors = ['#7764ed', '#22d3ee', '#f59e0b', '#34d399', '#f472b6', '#60a5fa']

export function MainMemory() {
  const [total, setTotal] = useState(64)
  const [blocks, setBlocks] = useState<MemoryBlock[]>(createMemory(64))
  const [strategy, setStrategy] = useState<FitStrategy>('first')
  const [processId, setProcessId] = useState('')
  const [size, setSize] = useState(8)
  const [releaseId, setReleaseId] = useState('')
  const [log, setLog] = useState<TerminalLine[]>([
    { kind: 'info', text: 'Memoria inicializada como un único bloque libre de 64 unidades.' },
  ])

  const stats = memoryStats(blocks)
  const resident = blocks.filter((block) => block.processId !== null)

  const addLog = (kind: TerminalLine['kind'], text: string) =>
    setLog((prev) => [...prev, { kind, text }])

  const doAllocate = () => {
    const color = colors[resident.length % colors.length]
    const result = allocate(blocks, processId, size, strategy, color)
    addLog(result.ok ? 'success' : 'error', result.message)
    if (result.ok) {
      setBlocks(result.blocks)
      setProcessId('')
      setReleaseId('')
    }
  }

  const doRelease = () => {
    const result = deallocate(blocks, releaseId)
    addLog(result.ok ? 'warn' : 'error', result.message)
    if (result.ok) {
      setBlocks(result.blocks)
      setReleaseId('')
    }
  }

  const changeTotal = (value: number) => {
    const safe = Math.max(8, Math.min(256, value || 8))
    setTotal(safe)
    setBlocks(createMemory(safe))
    setLog([{ kind: 'info', text: `Memoria reinicializada: ${safe} unidades libres.` }])
  }

  const reset = () => {
    setBlocks(createMemory(total))
    setProcessId('')
    setReleaseId('')
    setLog([{ kind: 'info', text: 'Simulación de memoria principal reiniciada.' }])
  }

  return (
    <SimulatorLayout
      moduleId="memory"
      title="Asignación de memoria principal"
      description="Asigna y libera particiones de memoria comparando first fit, best fit y worst fit."
      badge="Memoria principal"
      onReset={reset}
      log={log}
      controls={
        <div className="control-stack">
          <div className="control-group">
            <label htmlFor="total-memory">Tamaño total</label>
            <input
              id="total-memory"
              className="field"
              type="number"
              min={8}
              max={256}
              value={total}
              onChange={(event) => changeTotal(Number(event.target.value))}
            />
          </div>
          <div className="control-group">
            <label htmlFor="fit-strategy">Estrategia</label>
            <select
              id="fit-strategy"
              className="field"
              value={strategy}
              onChange={(event) => setStrategy(event.target.value as FitStrategy)}
            >
              {(Object.keys(fitLabels) as FitStrategy[]).map((key) => (
                <option key={key} value={key}>{fitLabels[key]}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="process-id">Identificador del proceso</label>
            <input
              id="process-id"
              className="field"
              value={processId}
              placeholder="Ej. P1"
              onChange={(event) => setProcessId(event.target.value)}
            />
            <label htmlFor="block-size">Tamaño (unidades)</label>
            <input
              id="block-size"
              className="field"
              type="number"
              min={1}
              max={total}
              value={size}
              onChange={(event) => setSize(Number(event.target.value))}
            />
            <button type="button" className="primary full" onClick={doAllocate}>
              <HardDriveUpload size={15} /> Asignar bloque
            </button>
          </div>
          <div className="control-group">
            <label htmlFor="release-process">Liberar proceso</label>
            <select
              id="release-process"
              className="field"
              value={releaseId}
              onChange={(event) => setReleaseId(event.target.value)}
            >
              <option value="">Seleccionar…</option>
              {resident.map((block) => (
                <option key={block.processId} value={block.processId!}>{block.processId} ({block.size} u.)</option>
              ))}
            </select>
            <button type="button" className="secondary full" onClick={doRelease} disabled={!releaseId}>
              <HardDriveDownload size={15} /> Liberar bloque
            </button>
          </div>
        </div>
      }
    >
      <h2 className="viz-title">Mapa de memoria</h2>
      <div className="memory-map">
        {blocks.map((block) => (
          <div
            key={`${block.start}-${block.processId ?? 'free'}`}
            className={`memory-block ${block.processId ? 'allocated' : 'free'}`}
            style={{
              width: `${(block.size / stats.total) * 100}%`,
              backgroundColor: block.processId ? block.color : undefined,
            }}
            title={`${block.processId ?? 'Libre'}: ${block.start}–${block.start + block.size} (${block.size} u.)`}
          >
            <strong>{block.processId ?? 'Libre'}</strong>
            <small>{block.size} u.</small>
          </div>
        ))}
      </div>
      <div className="memory-ruler">
        <span>0</span><span>{Math.round(stats.total / 2)}</span><span>{stats.total}</span>
      </div>

      <div className="metric-strip">
        <div><span>Usada</span><strong>{stats.used} u.</strong></div>
        <div><span>Libre</span><strong>{stats.free} u.</strong></div>
        <div><span>Huecos</span><strong>{stats.fragments}</strong></div>
        <div><span>Mayor hueco</span><strong>{stats.largestFree} u.</strong></div>
      </div>

      <div className="result-table-wrap">
        <table className="result-table">
          <thead><tr><th>Inicio</th><th>Fin</th><th>Tamaño</th><th>Estado</th></tr></thead>
          <tbody>
            {blocks.map((block) => (
              <tr key={`${block.start}-${block.processId ?? 'free'}`}>
                <td>{block.start}</td>
                <td>{block.start + block.size}</td>
                <td>{block.size}</td>
                <td>{block.processId ?? 'Libre'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SimulatorLayout>
  )
}
