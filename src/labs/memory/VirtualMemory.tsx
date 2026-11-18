import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Play } from 'lucide-react'
import { SimulatorLayout } from '../../components/SimulatorLayout'
import type { TerminalLine } from '../../components/Terminal'
import {
  parseReferences, replacementLabels, simulateVirtualMemory,
  type ReplacementAlgorithm, type VMResult,
} from './virtualMemoryLogic'

const defaultReferences = '7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0'

export function VirtualMemory() {
  const [rawReferences, setRawReferences] = useState(defaultReferences)
  const [frameCount, setFrameCount] = useState(3)
  const [algorithm, setAlgorithm] = useState<ReplacementAlgorithm>('FIFO')
  const [result, setResult] = useState<VMResult | null>(null)
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState<TerminalLine[]>([
    { kind: 'info', text: 'Introduce una cadena de referencias y elige el algoritmo de reemplazo.' },
  ])

  const addLog = (kind: TerminalLine['kind'], text: string) =>
    setLog((prev) => [...prev, { kind, text }])

  const run = () => {
    const references = parseReferences(rawReferences)
    if (!references) {
      setError('La cadena debe contener números enteros positivos separados por espacios o comas.')
      setResult(null)
      addLog('error', 'Cadena de referencias inválida.')
      return
    }
    if (frameCount < 1 || frameCount > 10) {
      setError('El número de marcos debe estar entre 1 y 10.')
      setResult(null)
      return
    }
    const simulation = simulateVirtualMemory(references, frameCount, algorithm)
    setError(null)
    setResult(simulation)
    setVisibleSteps(0)
    addLog('success', `${algorithm} ejecutado: ${simulation.faults} fallos, ${simulation.hits} aciertos sobre ${references.length} referencias.`)
    addLog('info', `Tasa de aciertos: ${simulation.hitRate}% · Tasa de fallos: ${simulation.faultRate}%.`)
  }

  const nextStep = () => {
    if (!result) return
    if (visibleSteps >= result.steps.length) {
      addLog('success', 'Todas las referencias han sido procesadas.')
      return
    }
    const step = result.steps[visibleSteps]
    setVisibleSteps((prev) => prev + 1)
    addLog(step.hit ? 'success' : 'warn', `Ref ${step.reference}: ${step.description} Marcos [${step.frames.join(', ')}].`)
  }

  const reset = () => {
    setRawReferences(defaultReferences)
    setFrameCount(3)
    setAlgorithm('FIFO')
    setResult(null)
    setVisibleSteps(0)
    setError(null)
    setLog([{ kind: 'info', text: 'Simulación de memoria virtual reiniciada.' }])
  }

  const pieData = result
    ? [
        { name: 'Aciertos', value: result.hits, color: '#34d399' },
        { name: 'Fallos', value: result.faults, color: '#f472b6' },
      ]
    : []

  return (
    <SimulatorLayout
      moduleId="memory"
      title="Memoria virtual y reemplazo de páginas"
      description="Provoca fallos de página y compara FIFO, LRU y el algoritmo óptimo sobre la misma cadena de referencias."
      badge="Memoria virtual"
      onReset={reset}
      log={log}
      controls={
        <div className="control-stack">
          <div className="control-group">
            <label htmlFor="references">Cadena de referencias</label>
            <textarea
              id="references"
              className="field"
              rows={4}
              value={rawReferences}
              onChange={(event) => {
                setRawReferences(event.target.value)
                setResult(null)
              }}
            />
            <p className="control-tip">Separadas por espacios o comas. Ejemplo: 7 0 1 2 0 3</p>
          </div>
          <div className="control-group">
            <label htmlFor="frames">Marcos de memoria</label>
            <input
              id="frames"
              className="field"
              type="number"
              min={1}
              max={10}
              value={frameCount}
              onChange={(event) => {
                setFrameCount(Number(event.target.value))
                setResult(null)
              }}
            />
          </div>
          <div className="control-group">
            <label htmlFor="replacement">Algoritmo de reemplazo</label>
            <select
              id="replacement"
              className="field"
              value={algorithm}
              onChange={(event) => {
                setAlgorithm(event.target.value as ReplacementAlgorithm)
                setResult(null)
              }}
            >
              {(Object.keys(replacementLabels) as ReplacementAlgorithm[]).map((key) => (
                <option key={key} value={key}>{replacementLabels[key]}</option>
              ))}
            </select>
            <button type="button" className="primary full" onClick={run}>
              <Play size={15} /> Ejecutar simulación
            </button>
            {result && (
              <button type="button" className="secondary full" onClick={nextStep}>Siguiente referencia →</button>
            )}
            {error && <p className="error-box">{error}</p>}
          </div>
        </div>
      }
    >
      {!result ? (
        <div className="empty-state">
          <h2>Sin resultados todavía</h2>
          <p>Ejecuta la simulación para ver la evolución de los marcos, los fallos de página y la comparación de aciertos.</p>
        </div>
      ) : (
        <div className="vm-view">
          <h2 className="viz-title">Secuencia de referencias</h2>
          <div className="reference-strip">
            {result.steps.map((step, index) => (
              <span
                key={index}
                className={`reference-chip ${index >= visibleSteps ? 'pending' : step.hit ? 'hit' : 'fault'}`}
              >
                {step.reference}
              </span>
            ))}
          </div>

          <div className="vm-stats">
            <div className="metric-strip compact">
              <div><span>Fallos</span><strong>{result.faults}</strong></div>
              <div><span>Aciertos</span><strong>{result.hits}</strong></div>
              <div><span>Tasa de fallos</span><strong>{result.faultRate}%</strong></div>
              <div><span>Tasa de aciertos</span><strong>{result.hitRate}%</strong></div>
            </div>
            <div className="pie-wrap">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#131622', border: '1px solid #30364a', borderRadius: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="result-table-wrap">
            <table className="result-table">
              <thead><tr><th>#</th><th>Referencia</th><th>Marcos tras el acceso</th><th>Resultado</th><th>Sustituyó</th></tr></thead>
              <tbody>
                {result.steps.slice(0, visibleSteps).map((step, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{step.reference}</td>
                    <td>
                      {step.frames.map((frame, frameIndex) => (
                        <span key={frameIndex} className="frame-chip">{frame ?? '∅'}</span>
                      ))}
                    </td>
                    <td className={step.hit ? 'hit-text' : 'fault-text'}>{step.hit ? 'Acierto' : 'Fallo'}</td>
                    <td>{step.replaced ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SimulatorLayout>
  )
}
