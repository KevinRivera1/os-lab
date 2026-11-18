import { useState } from 'react'
import { StepForward } from 'lucide-react'
import { SimulatorLayout } from '../../components/SimulatorLayout'
import type { TerminalLine } from '../../components/Terminal'
import { createThreads, stepThreads, type ThreadPolicy } from './threadsLogic'

export function Threads() {
  const [count, setCount] = useState(3)
  const [policy, setPolicy] = useState<ThreadPolicy>('round-robin')
  const [state, setState] = useState(createThreads(3))
  const [log, setLog] = useState<TerminalLine[]>([
    { kind: 'info', text: 'Hilos creados dentro de un mismo proceso. Comparten el contador global.' },
  ])

  const finished = state.threads.every((thread) => thread.remaining === 0)

  const step = () => {
    const result = stepThreads(state, policy)
    if (!result.message) {
      setLog((prev) => [...prev, { kind: 'success', text: 'Todos los hilos han terminado su trabajo.' }])
      return
    }
    setState(result.state)
    setLog((prev) => [...prev, { kind: 'step', text: result.message! }])
    if (result.state.threads.every((thread) => thread.remaining === 0)) {
      setLog((prev) => [...prev, { kind: 'success', text: `Contador final: ${result.state.counter}. El resultado depende del orden de ejecución.` }])
    }
  }

  const changeCount = (value: number) => {
    const safe = Math.max(1, Math.min(4, value || 1))
    setCount(safe)
    setState(createThreads(safe))
    setLog([{ kind: 'info', text: `${safe} hilo(s) creados. Cada uno incrementará el contador 3 veces.` }])
  }

  const reset = () => {
    setState(createThreads(count))
    setLog([{ kind: 'info', text: 'Simulación de hilos reiniciada.' }])
  }

  return (
    <SimulatorLayout
      moduleId="processes"
      title="Hilos dentro de un proceso"
      description="Observa cómo varios hilos comparten datos y cómo el orden de planificación afecta al resultado."
      badge="Hilos"
      onReset={reset}
      log={log}
      controls={
        <div className="control-stack">
          <div className="control-group">
            <label htmlFor="thread-count">Número de hilos</label>
            <input
              id="thread-count"
              className="field"
              type="number"
              min={1}
              max={4}
              value={count}
              onChange={(event) => changeCount(Number(event.target.value))}
            />
          </div>
          <div className="control-group">
            <label htmlFor="policy">Política de selección</label>
            <select
              id="policy"
              className="field"
              value={policy}
              onChange={(event) => setPolicy(event.target.value as ThreadPolicy)}
            >
              <option value="round-robin">Round robin</option>
              <option value="priority">Por prioridad (Hilo 1 primero)</option>
            </select>
          </div>
          <button type="button" className="primary full" onClick={step} disabled={finished}>
            <StepForward size={15} /> Ejecutar siguiente instrucción
          </button>
          {finished && <p className="control-tip">Los cuatro hilos han terminado. Reinicia para volver a ejecutar.</p>}
        </div>
      }
    >
      <h2 className="viz-title">Proceso compartido</h2>
      <div className="process-envelope">
        <div className="process-envelope-head">
          <strong>Proceso P1</strong>
          <span>Espacio de direcciones compartido</span>
        </div>
        <div className="shared-counter">
          <span>Contador global</span>
          <strong>{state.counter}</strong>
        </div>
        <div className="thread-grid">
          {state.threads.map((thread) => (
            <div key={thread.id} className="thread-card" style={{ borderColor: thread.color }}>
              <h3 style={{ color: thread.color }}>{thread.name}</h3>
              <p>Instrucciones ejecutadas: <strong>{thread.instructions}</strong></p>
              <p>Incrementos pendientes: <strong>{thread.remaining}</strong></p>
              <div className="thread-stack">
                <span>pila propia</span>
                <span>PC: {thread.instructions + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="history-block">
        <h3>Historial de ejecución</h3>
        {state.history.length === 0 ? (
          <p className="state-empty">Aún no hay instrucciones ejecutadas.</p>
        ) : (
          <ol>
            {state.history.map((entry, index) => <li key={index}>{entry}</li>)}
          </ol>
        )}
      </div>
    </SimulatorLayout>
  )
}
