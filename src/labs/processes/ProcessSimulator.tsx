import { useState } from 'react'
import { ArrowRight, Plus, Trash2 } from 'lucide-react'
import { SimulatorLayout } from '../../components/SimulatorLayout'
import type { TerminalLine } from '../../components/Terminal'
import {
  applyTransition, availableTransitions, stateLabels, stateOrder,
  type ProcessState, type SimProcess, type Transition,
} from './processStatesLogic'

const stateColors: Record<ProcessState, string> = {
  nuevo: '#64748b',
  listo: '#22d3ee',
  ejecutando: '#a78bfa',
  bloqueado: '#f59e0b',
  terminado: '#34d399',
}

const palette = ['#7764ed', '#22d3ee', '#f59e0b', '#34d399', '#f472b6']

const initial: SimProcess[] = [
  { id: 'P1', state: 'listo', remaining: 3, color: palette[0] },
  { id: 'P2', state: 'ejecutando', remaining: 2, color: palette[1] },
  { id: 'P3', state: 'bloqueado', remaining: 4, color: palette[2] },
]

const cycleEvents = ['Despachar', 'Esperar E/S', 'E/S completa', 'Despachar', 'Terminar']

export function ProcessSimulator() {
  const [processes, setProcesses] = useState<SimProcess[]>(initial)
  const [selectedId, setSelectedId] = useState('P1')
  const [log, setLog] = useState<TerminalLine[]>([
    { kind: 'info', text: 'Estados cargados. Selecciona un proceso y aplica una transición.' },
  ])

  const selected = processes.find((process) => process.id === selectedId) ?? processes[0]
  const available = selected ? availableTransitions(selected.state) : []

  const addLog = (kind: TerminalLine['kind'], text: string) =>
    setLog((prev) => [...prev, { kind, text }])

  const apply = (transition: Transition) => {
    if (!selected) return
    if (transition.event === 'Despachar' && processes.some((p) => p.state === 'ejecutando' && p.id !== selected.id)) {
      addLog('error', 'La CPU ya está ocupada. Solo un proceso puede estar en Ejecutando.')
      return
    }
    setProcesses((prev) => prev.map((p) => (p.id === selected.id ? applyTransition(p, transition) : p)))
    addLog('step', `${selected.id}: ${transition.event} → ${stateLabels[transition.to]}. ${transition.detail}`)
  }

  const runCycle = () => {
    if (!selected) return
    let current = selected
    if (current.state === 'nuevo') {
      const admit = availableTransitions(current.state)[0]
      setProcesses((prev) => prev.map((p) => (p.id === current.id ? applyTransition(p, admit) : p)))
      addLog('step', `${current.id}: Admitir → Listo.`)
      current = applyTransition(current, admit)
    }
    if (current.state === 'bloqueado') {
      const unblock = availableTransitions(current.state).find((t) => t.event === 'E/S completa')!
      setProcesses((prev) => prev.map((p) => (p.id === current.id ? applyTransition(p, unblock) : p)))
      addLog('step', `${current.id}: E/S completa → Listo.`)
      current = applyTransition(current, unblock)
    }
    for (const event of cycleEvents) {
      const transition = availableTransitions(current.state).find((t) => t.event === event)
      if (!transition) continue
      if (transition.event === 'Despachar' && processes.some((p) => p.state === 'ejecutando' && p.id !== current.id)) {
        addLog('warn', 'No se puede despachar: otro proceso está usando la CPU.')
        break
      }
      setProcesses((prev) => prev.map((p) => (p.id === current.id ? applyTransition(p, transition) : p)))
      current = applyTransition(current, transition)
      addLog('step', `${current.id}: ${transition.event} → ${stateLabels[transition.to]}.`)
      if (transition.to === 'terminado') break
      if (transition.to === 'bloqueado') {
        const unblock = availableTransitions('bloqueado')[0]
        setProcesses((prev) => prev.map((p) => (p.id === current.id ? applyTransition(p, unblock) : p)))
        current = applyTransition(current, unblock)
        addLog('step', `${current.id}: E/S completa → Listo.`)
      }
    }
    addLog('success', `Ciclo de ${selected.id} finalizado en estado ${stateLabels[current.state]}.`)
  }

  const addProcess = () => {
    const id = `P${processes.length + 1}`
    setProcesses((prev) => [
      ...prev,
      { id, state: 'nuevo', remaining: 2 + (prev.length % 3), color: palette[prev.length % palette.length] },
    ])
    setSelectedId(id)
    addLog('info', `Proceso ${id} creado en estado Nuevo.`)
  }

  const removeProcess = (id: string) => {
    setProcesses((prev) => prev.filter((p) => p.id !== id))
    if (selectedId === id) setSelectedId(processes.find((p) => p.id !== id)?.id ?? '')
    addLog('warn', `Proceso ${id} eliminado del sistema.`)
  }

  const reset = () => {
    setProcesses(initial)
    setSelectedId('P1')
    setLog([{ kind: 'info', text: 'Simulación de estados reiniciada.' }])
  }

  return (
    <SimulatorLayout
      moduleId="processes"
      title="Simulador de estados de un proceso"
      description="Provoca transiciones entre los cinco estados clásicos y observa cómo cambia el sistema."
      badge="Ciclo de vida"
      onReset={reset}
      log={log}
      controls={
        <div className="control-stack">
          <div className="control-group">
            <label htmlFor="process-select">Proceso</label>
            <select
              id="process-select"
              className="field"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {processes.map((process) => (
                <option key={process.id} value={process.id}>{process.id} — {stateLabels[process.state]}</option>
              ))}
            </select>
          </div>

          {selected && (
            <div className="control-group">
              <label>Transiciones disponibles</label>
              {available.length === 0 ? (
                <p className="control-tip">El proceso ha terminado. No hay transiciones posibles.</p>
              ) : (
                available.map((transition) => (
                  <button
                    key={`${transition.from}-${transition.to}`}
                    type="button"
                    className="secondary full transition-button"
                    onClick={() => apply(transition)}
                  >
                    {transition.event} → {stateLabels[transition.to]}
                  </button>
                ))
              )}
              <button type="button" className="primary full" onClick={runCycle}>
                Simular ciclo completo
              </button>
            </div>
          )}

          <div className="control-group">
            <label>Administrar procesos</label>
            <button type="button" className="secondary full" onClick={addProcess}>
              <Plus size={15} /> Crear proceso
            </button>
            {selected && (
              <button type="button" className="secondary full" onClick={() => removeProcess(selected.id)}>
                <Trash2 size={15} /> Eliminar {selected.id}
              </button>
            )}
          </div>

          <p className="control-tip">
            Regla: solo un proceso puede estar en <strong>Ejecutando</strong> a la vez.
          </p>
        </div>
      }
    >
      <h2 className="viz-title">Diagrama de estados</h2>
      <div className="state-board">
        {stateOrder.map((state) => {
          const inState = processes.filter((process) => process.state === state)
          return (
            <div key={state} className="state-column">
              <div className="state-column-head" style={{ borderColor: stateColors[state] }}>
                <span className="state-dot" style={{ backgroundColor: stateColors[state] }} />
                <strong>{stateLabels[state]}</strong>
                <span className="state-count">{inState.length}</span>
              </div>
              <div className="state-column-body">
                {inState.length === 0 && <p className="state-empty">Sin procesos</p>}
                {inState.map((process) => (
                  <button
                    key={process.id}
                    type="button"
                    className={`state-process ${process.id === selectedId ? 'selected' : ''}`}
                    onClick={() => setSelectedId(process.id)}
                  >
                    <span className="color-dot" style={{ backgroundColor: process.color }} />
                    <strong>{process.id}</strong>
                    <small>{process.remaining} ciclos</small>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="transition-map">
        <h3>Transiciones del modelo</h3>
        <div className="transition-list">
          <span>Nuevo <ArrowRight size={13} /> Listo <ArrowRight size={13} /> Ejecutando <ArrowRight size={13} /> Terminado</span>
          <span>Ejecutando <ArrowRight size={13} /> Bloqueado <ArrowRight size={13} /> Listo</span>
          <span>Ejecutando <ArrowRight size={13} /> Listo (quantum)</span>
        </div>
      </div>

      {selected && (
        <div className="selection-detail panel">
          <h3>{selected.id}</h3>
          <p>Estado actual: <strong>{stateLabels[selected.state]}</strong> · Ciclos de CPU restantes: <strong>{selected.remaining}</strong></p>
        </div>
      )}
    </SimulatorLayout>
  )
}
