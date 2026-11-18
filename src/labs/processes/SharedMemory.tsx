import { useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, Database } from 'lucide-react'
import { SimulatorLayout } from '../../components/SimulatorLayout'
import type { TerminalLine } from '../../components/Terminal'
import { createCells, readCell, writeCell } from './ipcLogic'

const size = 8

export function SharedMemory() {
  const [cells, setCells] = useState(createCells(size))
  const [writer, setWriter] = useState('P1')
  const [reader, setReader] = useState('P2')
  const [index, setIndex] = useState(0)
  const [value, setValue] = useState('')
  const [reads, setReads] = useState<Record<string, string | null>>({ P1: null, P2: null })
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState<TerminalLine[]>([
    { kind: 'info', text: 'Región de memoria compartida creada. Escribe en una celda para comenzar.' },
  ])

  const addLog = (kind: TerminalLine['kind'], text: string) =>
    setLog((prev) => [...prev, { kind, text }])

  const write = () => {
    if (!value.trim()) {
      setError('Introduce un valor antes de escribir.')
      addLog('error', 'Escritura cancelada: el valor está vacío.')
      return
    }
    setError(null)
    setCells((prev) => writeCell(prev, index, value, writer))
    addLog('step', `${writer} escribe "${value.trim()}" en la celda ${index}.`)
    setValue('')
  }

  const read = () => {
    const result = readCell(cells, index, reader)
    setCells(result.cells)
    setReads((prev) => ({ ...prev, [reader]: result.value }))
    addLog(
      result.value === null ? 'warn' : 'success',
      result.value === null
        ? `${reader} lee la celda ${index}: está vacía.`
        : `${reader} lee la celda ${index}: "${result.value}" (escrito por ${cells[index].writer}).`,
    )
  }

  const reset = () => {
    setCells(createCells(size))
    setReads({ P1: null, P2: null })
    setIndex(0)
    setValue('')
    setError(null)
    setLog([{ kind: 'info', text: 'Memoria compartida reiniciada.' }])
  }

  return (
    <SimulatorLayout
      moduleId="processes"
      title="Comunicación por memoria compartida"
      description="Dos procesos leen y escriben en una región común de memoria sin pasar por el kernel en cada acceso."
      badge="IPC"
      onReset={reset}
      log={log}
      controls={
        <div className="control-stack">
          <div className="control-group">
            <label htmlFor="writer">Proceso escritor</label>
            <select id="writer" className="field" value={writer} onChange={(event) => setWriter(event.target.value)}>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="cell-index">Celda</label>
            <select id="cell-index" className="field" value={index} onChange={(event) => setIndex(Number(event.target.value))}>
              {cells.map((cell) => <option key={cell.index} value={cell.index}>Celda {cell.index}</option>)}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="cell-value">Valor a escribir</label>
            <input
              id="cell-value"
              className="field"
              value={value}
              placeholder="Ej. 42"
              onChange={(event) => setValue(event.target.value)}
            />
            <button type="button" className="primary full" onClick={write}>
              <ArrowUpFromLine size={15} /> Escribir
            </button>
            {error && <p className="error-box">{error}</p>}
          </div>

          <div className="control-group">
            <label htmlFor="reader">Proceso lector</label>
            <select id="reader" className="field" value={reader} onChange={(event) => setReader(event.target.value)}>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
            </select>
            <button type="button" className="secondary full" onClick={read}>
              <ArrowDownToLine size={15} /> Leer celda
            </button>
          </div>
        </div>
      }
    >
      <h2 className="viz-title">Región compartida</h2>
      <div className="memory-grid">
        {cells.map((cell) => (
          <div
            key={cell.index}
            className={`memory-cell ${cell.value !== null ? 'used' : ''} ${cell.index === index ? 'target' : ''}`}
          >
            <small>{cell.index}</small>
            <strong>{cell.value ?? '∅'}</strong>
            <span>{cell.writer ? `por ${cell.writer}` : 'libre'}</span>
          </div>
        ))}
      </div>

      <div className="ipc-processes">
        {['P1', 'P2'].map((process) => (
          <div key={process} className="ipc-process panel">
            <h3>Proceso {process}</h3>
            <p>Último valor leído</p>
            <strong>{reads[process] === null ? '—' : reads[process]}</strong>
          </div>
        ))}
      </div>

      <p className="viz-footnote">
        <Database size={14} /> La sincronización es responsabilidad de los procesos: sin mutex pueden aparecer condiciones de carrera.
      </p>
    </SimulatorLayout>
  )
}
