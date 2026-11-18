import { useState } from 'react'
import { Lock, LockOpen, PackagePlus, PackageMinus, Pause, Play } from 'lucide-react'
import { SimulatorLayout } from '../../components/SimulatorLayout'
import type { TerminalLine } from '../../components/Terminal'
import {
  executeAction, initialSyncState, scenarioInfo,
  type Scenario, type SemaphoreKey, type SyncAction,
} from './synchronizationLogic'

const scenarios = Object.keys(scenarioInfo) as Scenario[]

export function Synchronization() {
  const [scenario, setScenario] = useState<Scenario>('producer-consumer')
  const [capacity, setCapacity] = useState(4)
  const [semaphore, setSemaphore] = useState<SemaphoreKey>('empty')
  const [state, setState] = useState(initialSyncState(4))
  const [log, setLog] = useState<TerminalLine[]>([
    { kind: 'info', text: 'Simulación de sincronización lista. Elige un escenario y ejecuta acciones.' },
  ])

  const info = scenarioInfo[scenario]

  const run = (action: SyncAction) => {
    const result = executeAction(state, action, semaphore)
    setState(result.state)
    result.messages.forEach((message, index) => {
      setLog((prev) => [...prev, { kind: result.ok ? (index === result.messages.length - 1 ? 'success' : 'step') : 'warn', text: message }])
    })
  }

  const changeScenario = (value: Scenario) => {
    setScenario(value)
    const fresh = initialSyncState(capacity)
    setState(fresh)
    setLog([
      { kind: 'info', text: `Escenario: ${scenarioInfo[value].title}.` },
      { kind: 'info', text: scenarioInfo[value].description },
    ])
  }

  const changeCapacity = (value: number) => {
    const safe = Math.max(1, Math.min(10, value || 1))
    setCapacity(safe)
    setState(initialSyncState(safe))
    setLog((prev) => [...prev, { kind: 'info', text: `Capacidad del búfer cambiada a ${safe}.` }])
  }

  const reset = () => {
    setState(initialSyncState(capacity))
    setLog([{ kind: 'info', text: 'Simulación reiniciada: búfer vacío y semáforos en su estado inicial.' }])
  }

  return (
    <SimulatorLayout
      moduleId="processes"
      title="Simulador de sincronización"
      description="Explora productor-consumidor, sección crítica, exclusión mutua y semáforos con pasos verificables."
      badge="Concurrencia"
      onReset={reset}
      log={log}
      controls={
        <div className="control-stack">
          <div className="control-group">
            <label htmlFor="scenario">Escenario</label>
            <select
              id="scenario"
              className="field"
              value={scenario}
              onChange={(event) => changeScenario(event.target.value as Scenario)}
            >
              {scenarios.map((key) => (
                <option key={key} value={key}>{scenarioInfo[key].title}</option>
              ))}
            </select>
            <p className="control-tip">{info.description}</p>
          </div>

          <div className="control-group">
            <label htmlFor="capacity">Capacidad del búfer</label>
            <input
              id="capacity"
              className="field"
              type="number"
              min={1}
              max={10}
              value={capacity}
              onChange={(event) => changeCapacity(Number(event.target.value))}
            />
          </div>

          {(scenario === 'producer-consumer' || scenario === 'semaphore') && (
            <div className="control-group">
              <label>Operaciones del búfer</label>
              <button type="button" className="primary full" onClick={() => run('produce')}>
                <PackagePlus size={15} /> Producir dato
              </button>
              <button type="button" className="secondary full" onClick={() => run('consume')}>
                <PackageMinus size={15} /> Consumir dato
              </button>
            </div>
          )}

          {(scenario === 'critical-section' || scenario === 'mutex') && (
            <div className="control-group">
              <label>Sección crítica</label>
              <button type="button" className="primary full" onClick={() => run('enter')}>
                <Lock size={15} /> Entrar
              </button>
              <button type="button" className="secondary full" onClick={() => run('exit')}>
                <LockOpen size={15} /> Salir
              </button>
            </div>
          )}

          <div className="control-group">
            <label htmlFor="semaphore">Semáforo manual</label>
            <select
              id="semaphore"
              className="field"
              value={semaphore}
              onChange={(event) => setSemaphore(event.target.value as SemaphoreKey)}
            >
              <option value="empty">empty</option>
              <option value="full">full</option>
              <option value="mutex">mutex</option>
            </select>
            <div className="button-pair">
              <button type="button" className="secondary" onClick={() => run('wait')}><Pause size={14} /> wait</button>
              <button type="button" className="secondary" onClick={() => run('signal')}><Play size={14} /> signal</button>
            </div>
          </div>
        </div>
      }
    >
      <h2 className="viz-title">{info.title}</h2>

      <div className="sync-buffer">
        <div className="sync-buffer-head">
          <strong>Búfer compartido</strong>
          <span>{state.buffer.length} / {state.capacity}</span>
        </div>
        <div className="buffer-cells">
          {Array.from({ length: state.capacity }, (_, index) => (
            <div key={index} className={`buffer-cell ${state.buffer[index] !== undefined ? 'filled' : ''}`}>
              {state.buffer[index] ?? '—'}
            </div>
          ))}
        </div>
      </div>

      <div className="semaphore-grid">
        {(['empty', 'full', 'mutex'] as SemaphoreKey[]).map((key) => (
          <div key={key} className="semaphore-card">
            <span>{key}</span>
            <strong>{state.semaphores[key]}</strong>
            <div className="semaphore-bar">
              <div style={{ width: `${Math.min(100, state.semaphores[key] * 25)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="sync-stats">
        <div><span>Producidos</span><strong>{state.produced}</strong></div>
        <div><span>Consumidos</span><strong>{state.consumed}</strong></div>
        <div><span>Bloqueos</span><strong>{state.blocked}</strong></div>
        <div>
          <span>Sección crítica</span>
          <strong className={state.inCritical ? 'busy' : 'free'}>
            {state.inCritical ? 'Ocupada' : 'Libre'}
          </strong>
        </div>
      </div>

      <p className="viz-footnote">
        wait() decrementa el semáforo; si llega a 0, el proceso se bloquea. signal() lo incrementa y puede despertar a otro proceso.
      </p>
    </SimulatorLayout>
  )
}
