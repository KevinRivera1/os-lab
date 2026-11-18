import { useState } from 'react'
import { GitBranch, ListOrdered, RectangleHorizontal } from 'lucide-react'
import { SimulatorLayout } from '../../components/SimulatorLayout'
import type { TerminalLine } from '../../components/Terminal'
import {
  computeAllocation, methodInfo, type AllocationMethod, type AllocationLayout,
} from './fileAllocationLogic'

const methods = Object.keys(methodInfo) as AllocationMethod[]

export function FileAllocation() {
  const [method, setMethod] = useState<AllocationMethod>('contiguous')
  const [diskSize, setDiskSize] = useState(16)
  const [start, setStart] = useState(2)
  const [count, setCount] = useState(4)
  const [layout, setLayout] = useState<AllocationLayout | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState<TerminalLine[]>([
    { kind: 'info', text: 'Selecciona un método de asignación y calcula la distribución en disco.' },
  ])

  const addLog = (kind: TerminalLine['kind'], text: string) =>
    setLog((prev) => [...prev, { kind, text }])

  const compute = () => {
    const result = computeAllocation(method, diskSize, start, count)
    if (!result.ok) {
      setError(result.message)
      setLayout(null)
      addLog('error', result.message)
      return
    }
    setError(null)
    setLayout(result)
    addLog('success', result.message)
    addLog('info', methodInfo[method].access)
  }

  const changeDisk = (value: number) => {
    const safe = Math.max(8, Math.min(32, value || 8))
    setDiskSize(safe)
    setStart(Math.min(start, safe - 1))
    setLayout(null)
  }

  const reset = () => {
    setMethod('contiguous')
    setDiskSize(16)
    setStart(2)
    setCount(4)
    setLayout(null)
    setError(null)
    setLog([{ kind: 'info', text: 'Simulación de asignación reiniciada.' }])
  }

  const methodIcons: Record<AllocationMethod, typeof RectangleHorizontal> = {
    contiguous: RectangleHorizontal,
    linked: GitBranch,
    indexed: ListOrdered,
  }

  return (
    <SimulatorLayout
      moduleId="storage"
      title="Métodos de asignación de archivos"
      description="Compara la asignación contigua, enlazada e indexada sobre una vista de bloques de disco."
      badge="Asignación"
      onReset={reset}
      log={log}
      controls={
        <div className="control-stack">
          <div className="control-group">
            <label htmlFor="method">Método de asignación</label>
            <select
              id="method"
              className="field"
              value={method}
              onChange={(event) => {
                setMethod(event.target.value as AllocationMethod)
                setLayout(null)
              }}
            >
              {methods.map((key) => <option key={key} value={key}>{methodInfo[key].title}</option>)}
            </select>
            <p className="control-tip">{methodInfo[method].description}</p>
          </div>
          <div className="control-group">
            <label htmlFor="disk-size">Bloques del disco</label>
            <input
              id="disk-size"
              className="field"
              type="number"
              min={8}
              max={32}
              value={diskSize}
              onChange={(event) => changeDisk(Number(event.target.value))}
            />
            <label htmlFor="start-block">Bloque inicial</label>
            <input
              id="start-block"
              className="field"
              type="number"
              min={0}
              max={diskSize - 1}
              value={start}
              onChange={(event) => {
                setStart(Number(event.target.value))
                setLayout(null)
              }}
            />
            <label htmlFor="file-blocks">Bloques del archivo</label>
            <input
              id="file-blocks"
              className="field"
              type="number"
              min={1}
              max={diskSize}
              value={count}
              onChange={(event) => {
                setCount(Number(event.target.value))
                setLayout(null)
              }}
            />
            <button type="button" className="primary full" onClick={compute}>Calcular asignación</button>
            {error && <p className="error-box">{error}</p>}
          </div>
        </div>
      }
    >
      <h2 className="viz-title">{methodInfo[method].title}</h2>

      <div className="allocation-disk">
        {Array.from({ length: diskSize }, (_, index) => {
          const isData = layout?.dataBlocks.includes(index) ?? false
          const isIndex = layout?.indexBlock === index
          return (
            <div
              key={index}
              className={`allocation-block ${isData ? 'data' : ''} ${isIndex ? 'index' : ''}`}
              title={`Bloque ${index}${isData ? ' · dato' : isIndex ? ' · índice' : ' · libre'}`}
            >
              <small>{index}</small>
              {isIndex ? 'ÍND' : isData ? 'DAT' : '·'}
            </div>
          )
        })}
      </div>

      {layout && (
        <div className="allocation-detail">
          {layout.method === 'linked' && (
            <div className="linked-chain">
              {layout.dataBlocks.map((block, index) => (
                <span key={block} className="chain-item">
                  <strong>{block}</strong>
                  <small>→ {layout.nextPointers[block] ?? 'fin'}</small>
                  {index < layout.dataBlocks.length - 1 && <span className="chain-arrow">→</span>}
                </span>
              ))}
            </div>
          )}
          {layout.method === 'indexed' && layout.indexBlock !== null && (
            <div className="index-table">
              <h3>Bloque índice {layout.indexBlock}</h3>
              <div className="index-entries">
                {Object.entries(layout.nextPointers).map(([position, block]) => (
                  <span key={position} className="index-entry"><small>{position}</small> → <strong>{block}</strong></span>
                ))}
              </div>
            </div>
          )}
          {layout.method === 'contiguous' && (
            <p className="allocation-note">Dirección inicial: <strong>{layout.dataBlocks[0]}</strong> · Longitud: <strong>{layout.dataBlocks.length}</strong></p>
          )}
        </div>
      )}

      <div className="method-comparison">
        {methods.map((key) => {
          const Icon = methodIcons[key]
          return (
            <article key={key} className={`method-card ${key === method ? 'selected' : ''}`}>
              <h3><Icon size={17} /> {methodInfo[key].title}</h3>
              <p>{methodInfo[key].access}</p>
              <small>{methodInfo[key].fragmentation}</small>
            </article>
          )
        })}
      </div>
    </SimulatorLayout>
  )
}
