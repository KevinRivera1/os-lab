import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertCircle, ArrowRight, Plus, Trash2 } from 'lucide-react'
import { SimulatorLayout } from '../../components/SimulatorLayout'
import type { TerminalLine } from '../../components/Terminal'
import {
  algorithmLabels, processColors, simulateSchedule, validateInputs,
  type Algorithm, type ProcessInput, type ScheduleResult,
} from './cpuSchedulingLogic'

const defaults: ProcessInput[] = [
  { id: 'P1', arrival: 0, burst: 5, priority: 2, color: processColors[0] },
  { id: 'P2', arrival: 1, burst: 3, priority: 1, color: processColors[1] },
  { id: 'P3', arrival: 2, burst: 4, priority: 3, color: processColors[2] },
  { id: 'P4', arrival: 4, burst: 2, priority: 1, color: processColors[3] },
]

type EditableField = 'id' | 'arrival' | 'burst' | 'priority'

export function CpuScheduling() {
  const [processes, setProcesses] = useState<ProcessInput[]>(defaults)
  const [algorithm, setAlgorithm] = useState<Algorithm>('FCFS')
  const [quantum, setQuantum] = useState(2)
  const [result, setResult] = useState<ScheduleResult | null>(null)
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState<TerminalLine[]>([
    { kind: 'info', text: 'Configura los procesos y elige un algoritmo para ejecutar la simulación.' },
  ])

  const addLog = (kind: TerminalLine['kind'], text: string) =>
    setLog((prev) => [...prev, { kind, text }])

  const updateProcess = (index: number, field: EditableField, rawValue: string) => {
    setProcesses((prev) =>
      prev.map((process, i) => {
        if (i !== index) return process
        const updated = { ...process }
        if (field === 'id') updated.id = rawValue
        else updated[field] = Number(rawValue)
        return updated
      }),
    )
    setError(null)
  }

  const addProcess = () => {
    const id = `P${processes.length + 1}`
    setProcesses((prev) => [
      ...prev,
      { id, arrival: prev.length, burst: 2, priority: 1, color: processColors[prev.length % processColors.length] },
    ])
    addLog('info', `Proceso ${id} agregado a la cola.`)
  }

  const removeProcess = (index: number) => {
    const removed = processes[index]
    setProcesses((prev) => prev.filter((_, i) => i !== index))
    addLog('warn', `Proceso ${removed.id} eliminado.`)
  }

  const run = () => {
    const problem = validateInputs(processes, algorithm, quantum)
    if (problem) {
      setError(problem)
      setResult(null)
      addLog('error', problem)
      return
    }
    const schedule = simulateSchedule(processes, algorithm, quantum)
    setError(null)
    setResult(schedule)
    setVisibleSteps(0)
    addLog('success', `${algorithmLabels[algorithm]} ejecutado: ${schedule.segments.length} tramos, ${schedule.totalTime} unidades de tiempo.`)
    addLog('info', `Orden de ejecución: ${schedule.order.join(' → ')}`)
    addLog('info', `Promedios — espera: ${schedule.avgWaiting}, retorno: ${schedule.avgTurnaround}, respuesta: ${schedule.avgResponse}`)
  }

  const nextStep = () => {
    if (!result) return
    if (visibleSteps >= result.segments.length) {
      addLog('success', 'Simulación completa. Todos los procesos han terminado.')
      return
    }
    const segment = result.segments[visibleSteps]
    setVisibleSteps((prev) => prev + 1)
    addLog('step', `t=${segment.start}–${segment.end}: ${segment.processId} usa la CPU.`)
  }

  const reset = () => {
    setProcesses(defaults)
    setAlgorithm('FCFS')
    setQuantum(2)
    setResult(null)
    setVisibleSteps(0)
    setError(null)
    setLog([{ kind: 'info', text: 'Simulación reiniciada con los procesos de ejemplo.' }])
  }

  const tableData = result?.results.map((item) => ({
    name: item.id,
    espera: item.waiting,
    retorno: item.turnaround,
  })) ?? []

  return (
    <SimulatorLayout
      moduleId="processes"
      title="Simulador de planificación de CPU"
      description="Agrega procesos, elige un algoritmo y observa el diagrama de Gantt y las métricas reales."
      badge="Planificación"
      onReset={reset}
      log={log}
      controls={
        <div className="control-stack">
          <div className="control-group">
            <label htmlFor="algorithm">Algoritmo</label>
            <select
              id="algorithm"
              className="field"
              value={algorithm}
              onChange={(event) => {
                setAlgorithm(event.target.value as Algorithm)
                setResult(null)
              }}
            >
              {(Object.keys(algorithmLabels) as Algorithm[]).map((key) => (
                <option key={key} value={key}>{algorithmLabels[key]}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="quantum">Quantum (Round Robin)</label>
            <input
              id="quantum"
              className="field"
              type="number"
              min={1}
              value={quantum}
              disabled={algorithm !== 'RR'}
              onChange={(event) => setQuantum(Number(event.target.value))}
            />
          </div>

          <div className="control-group">
            <label>Procesos</label>
            <div className="process-table-head">
              <span>ID</span><span>Llegada</span><span>Ráfaga</span><span>Prior.</span><span />
            </div>
            <div className="process-rows">
              {processes.map((process, index) => (
                <div key={`${index}-${process.id}`} className="process-row">
                  <input
                    aria-label={`Identificador del proceso ${index + 1}`}
                    className="field compact"
                    value={process.id}
                    onChange={(event) => updateProcess(index, 'id', event.target.value)}
                  />
                  <input
                    aria-label={`Llegada de ${process.id}`}
                    className="field compact"
                    type="number"
                    min={0}
                    value={process.arrival}
                    onChange={(event) => updateProcess(index, 'arrival', event.target.value)}
                  />
                  <input
                    aria-label={`Ráfaga de ${process.id}`}
                    className="field compact"
                    type="number"
                    min={1}
                    value={process.burst}
                    onChange={(event) => updateProcess(index, 'burst', event.target.value)}
                  />
                  <input
                    aria-label={`Prioridad de ${process.id}`}
                    className="field compact"
                    type="number"
                    min={0}
                    value={process.priority}
                    onChange={(event) => updateProcess(index, 'priority', event.target.value)}
                  />
                  <button
                    type="button"
                    className="icon-button danger"
                    aria-label={`Eliminar ${process.id}`}
                    onClick={() => removeProcess(index)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="secondary full" onClick={addProcess}>
              <Plus size={15} /> Agregar proceso
            </button>
          </div>

          {error && (
            <p className="error-box">
              <AlertCircle size={15} /> {error}
            </p>
          )}

          <button type="button" className="primary full" onClick={run}>
            Ejecutar simulación
          </button>
          {result && (
            <>
              <button type="button" className="secondary full" onClick={nextStep}>
                Siguiente paso →
              </button>
              <button
                type="button"
                className="secondary full"
                onClick={() => {
                  setVisibleSteps(result.segments.length)
                  addLog('success', 'Simulación mostrada por completo.')
                }}
              >
                Ver resultado completo
              </button>
            </>
          )}
        </div>
      }
    >
      {!result ? (
        <div className="empty-state">
          <h2>Sin resultados todavía</h2>
          <p>Configura los procesos y pulsa <strong>Ejecutar simulación</strong>. Aquí aparecerán el diagrama de Gantt, el orden de ejecución y las métricas.</p>
        </div>
      ) : (
        <div className="schedule-view">
          <h2 className="viz-title">Diagrama de Gantt</h2>
          <div className="gantt">
            <div className="gantt-track">
              {result.segments.map((segment, index) => (
                <div
                  key={`${segment.processId}-${index}`}
                  className={`gantt-segment ${index >= visibleSteps ? 'pending' : ''}`}
                  style={{
                    width: `${((segment.end - segment.start) / result.totalTime) * 100}%`,
                    backgroundColor: segment.color,
                  }}
                  title={`${segment.processId}: ${segment.start}–${segment.end}`}
                >
                  {segment.processId}
                </div>
              ))}
            </div>
            <div className="gantt-axis">
              {Array.from({ length: result.totalTime + 1 }, (_, tick) => (
                <span key={tick} style={{ left: `${(tick / result.totalTime) * 100}%` }}>{tick}</span>
              ))}
            </div>
          </div>

          <div className="metric-strip">
            <div><span>Espera promedio</span><strong>{result.avgWaiting}</strong></div>
            <div><span>Retorno promedio</span><strong>{result.avgTurnaround}</strong></div>
            <div><span>Respuesta promedio</span><strong>{result.avgResponse}</strong></div>
            <div><span>Tiempo total</span><strong>{result.totalTime}</strong></div>
          </div>

          <div className="order-row">
            <span>Orden de ejecución</span>
            <div className="order-chips">
              {result.order.map((id) => <span key={id} className="order-chip">{id}</span>)}
            </div>
          </div>

          <div className="result-table-wrap">
            <table className="result-table">
              <thead>
                <tr>
                  <th>Proceso</th><th>Llegada</th><th>Ráfaga</th><th>Prioridad</th>
                  <th>Finalización</th><th>Espera</th><th>Retorno</th><th>Respuesta</th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((item) => (
                  <tr key={item.id}>
                    <td><span className="color-dot" style={{ backgroundColor: item.color }} />{item.id}</td>
                    <td>{item.arrival}</td>
                    <td>{item.burst}</td>
                    <td>{item.priority}</td>
                    <td>{item.completion}</td>
                    <td>{item.waiting}</td>
                    <td>{item.turnaround}</td>
                    <td>{item.response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="chart-block">
            <h3>Tiempos por proceso</h3>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={tableData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252a3a" />
                <XAxis dataKey="name" stroke="#969bad" />
                <YAxis stroke="#969bad" />
                <Tooltip contentStyle={{ background: '#131622', border: '1px solid #30364a', borderRadius: 10 }} />
                <Legend />
                <Bar dataKey="espera" name="Espera" fill="#7764ed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="retorno" name="Retorno" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="viz-footnote">
            <ArrowRight size={14} /> Menor prioridad numérica = mayor prioridad de ejecución.
          </p>
        </div>
      )}
    </SimulatorLayout>
  )
}
