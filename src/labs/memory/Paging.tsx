import { useState } from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { SimulatorLayout } from '../../components/SimulatorLayout'
import type { TerminalLine } from '../../components/Terminal'
import {
  allocateProcess, createPagingState, releaseProcess, translate,
} from './pagingLogic'

export function Paging() {
  const [pageSize, setPageSize] = useState(4)
  const [frameCount, setFrameCount] = useState(8)
  const [state, setState] = useState(createPagingState(4, 8))
  const [processId, setProcessId] = useState('')
  const [size, setSize] = useState(10)
  const [releaseId, setReleaseId] = useState('')
  const [translateProcess, setTranslateProcess] = useState('')
  const [page, setPage] = useState(0)
  const [offset, setOffset] = useState(0)
  const [log, setLog] = useState<TerminalLine[]>([
    { kind: 'info', text: 'Sistema de paginación inicializado: páginas de 4 unidades y 8 marcos.' },
  ])

  const addLog = (kind: TerminalLine['kind'], text: string) =>
    setLog((prev) => [...prev, { kind, text }])

  const reconfigure = (nextSize: number, nextFrames: number) => {
    setPageSize(nextSize)
    setFrameCount(nextFrames)
    setState(createPagingState(nextSize, nextFrames))
    setTranslateProcess('')
    setReleaseId('')
    setLog([{ kind: 'info', text: `Configuración actualizada: página de ${nextSize}, ${nextFrames} marcos.` }])
  }

  const allocate = () => {
    const result = allocateProcess(state, processId, size)
    addLog(result.ok ? 'success' : 'error', result.message)
    if (result.ok) {
      setState(result.state)
      setProcessId('')
      setTranslateProcess(result.state.processes[result.state.processes.length - 1].id)
      setPage(0)
      setOffset(0)
    }
  }

  const release = () => {
    const result = releaseProcess(state, releaseId)
    addLog(result.ok ? 'warn' : 'error', result.message)
    if (result.ok) {
      setState(result.state)
      setReleaseId('')
      if (translateProcess === releaseId) setTranslateProcess('')
    }
  }

  const doTranslate = () => {
    const result = translate(state, translateProcess, page, offset)
    addLog(result.ok ? 'success' : 'error', result.message)
  }

  const reset = () => {
    setState(createPagingState(pageSize, frameCount))
    setProcessId('')
    setReleaseId('')
    setTranslateProcess('')
    setLog([{ kind: 'info', text: 'Paginación reiniciada: todos los marcos quedaron libres.' }])
  }

  const usedFrames = state.frames.filter((frame) => frame.processId !== null).length

  return (
    <SimulatorLayout
      moduleId="memory"
      title="Simulador de paginación"
      description="Divide procesos en páginas, asígnalas a marcos físicos y traduce direcciones lógicas a físicas."
      badge="Paginación"
      onReset={reset}
      log={log}
      controls={
        <div className="control-stack">
          <div className="control-group">
            <label htmlFor="page-size">Tamaño de página</label>
            <select
              id="page-size"
              className="field"
              value={pageSize}
              onChange={(event) => reconfigure(Number(event.target.value), frameCount)}
            >
              {[2, 4, 8, 16].map((value) => <option key={value} value={value}>{value} unidades</option>)}
            </select>
            <label htmlFor="frame-count">Marcos de memoria</label>
            <select
              id="frame-count"
              className="field"
              value={frameCount}
              onChange={(event) => reconfigure(pageSize, Number(event.target.value))}
            >
              {[8, 12, 16].map((value) => <option key={value} value={value}>{value} marcos</option>)}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="paging-process">Proceso</label>
            <input
              id="paging-process"
              className="field"
              value={processId}
              placeholder="Ej. P1"
              onChange={(event) => setProcessId(event.target.value)}
            />
            <label htmlFor="process-size">Tamaño del proceso</label>
            <input
              id="process-size"
              className="field"
              type="number"
              min={1}
              value={size}
              onChange={(event) => setSize(Number(event.target.value))}
            />
            <p className="control-tip">Páginas necesarias: {Math.ceil(size / pageSize)}</p>
            <button type="button" className="primary full" onClick={allocate}>Asignar proceso</button>
          </div>

          <div className="control-group">
            <label htmlFor="release-paging">Liberar proceso</label>
            <select id="release-paging" className="field" value={releaseId} onChange={(event) => setReleaseId(event.target.value)}>
              <option value="">Seleccionar…</option>
              {state.processes.map((process) => <option key={process.id} value={process.id}>{process.id}</option>)}
            </select>
            <button type="button" className="secondary full" onClick={release} disabled={!releaseId}>Liberar</button>
          </div>

          <div className="control-group">
            <label>Traducción de direcciones</label>
            <select
              className="field"
              value={translateProcess}
              onChange={(event) => {
                setTranslateProcess(event.target.value)
                setPage(0)
              }}
            >
              <option value="">Seleccionar proceso…</option>
              {state.processes.map((process) => <option key={process.id} value={process.id}>{process.id}</option>)}
            </select>
            <div className="button-pair">
              <input className="field" type="number" min={0} value={page} aria-label="Número de página" onChange={(event) => setPage(Number(event.target.value))} />
              <input className="field" type="number" min={0} max={pageSize - 1} value={offset} aria-label="Desplazamiento" onChange={(event) => setOffset(Number(event.target.value))} />
            </div>
            <button type="button" className="secondary full" onClick={doTranslate}>
              <ArrowRightLeft size={15} /> Traducir dirección
            </button>
          </div>
        </div>
      }
    >
      <h2 className="viz-title">Memoria física</h2>
      <div className="frame-grid">
        {state.frames.map((frame, index) => (
          <div
            key={index}
            className={`frame-cell ${frame.processId ? 'used' : ''}`}
            style={frame.processId ? { borderColor: frame.color, backgroundColor: `${frame.color}22` } : undefined}
          >
            <small>Marco {index}</small>
            <strong>{frame.processId ?? 'Libre'}</strong>
            <span>{frame.page !== null ? `Página ${frame.page}` : '—'}</span>
          </div>
        ))}
      </div>

      <div className="metric-strip compact">
        <div><span>Marcos usados</span><strong>{usedFrames}/{frameCount}</strong></div>
        <div><span>Marcos libres</span><strong>{frameCount - usedFrames}</strong></div>
        <div><span>Procesos</span><strong>{state.processes.length}</strong></div>
      </div>

      <h3 className="sub-title">Tablas de páginas</h3>
      {state.processes.length === 0 ? (
        <p className="state-empty">Asigna un proceso para ver su tabla de páginas.</p>
      ) : (
        <div className="page-tables">
          {state.processes.map((process) => (
            <div key={process.id} className="page-table panel">
              <h4 style={{ color: process.color }}>{process.id} <small>({process.pages} páginas)</small></h4>
              <table className="result-table">
                <thead><tr><th>Página</th><th>Marco</th><th>Dirección inicial</th></tr></thead>
                <tbody>
                  {process.pageTable.map((frame, pageIndex) => (
                    <tr key={pageIndex}>
                      <td>{pageIndex}</td>
                      <td>{frame}</td>
                      <td>{pageIndex * pageSize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </SimulatorLayout>
  )
}
