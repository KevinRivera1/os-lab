import { useState } from 'react'
import {
  AppWindow, ArrowLeftRight, Cpu, FolderTree, MemoryStick, Monitor,
  PlugZap, Server, Workflow, type LucideIcon,
} from 'lucide-react'
import { SimulatorLayout } from '../../components/SimulatorLayout'
import type { TerminalLine } from '../../components/Terminal'
import { buildSyscallFlow, components, structures, type Structure } from './architectureData'

const iconMap: Record<string, LucideIcon> = {
  Monitor, AppWindow, ArrowLeftRight, Cpu, Workflow, MemoryStick, FolderTree, PlugZap, Server,
}

const layers: { id: 'usuario' | 'kernel' | 'hardware'; label: string }[] = [
  { id: 'usuario', label: 'Espacio de usuario' },
  { id: 'kernel', label: 'Espacio de kernel' },
  { id: 'hardware', label: 'Hardware' },
]

export function ArchitectureExplorer() {
  const [selectedId, setSelectedId] = useState('kernel')
  const [structure, setStructure] = useState<Structure>('monolithic')
  const [flowIndex, setFlowIndex] = useState(-1)
  const [log, setLog] = useState<TerminalLine[]>([
    { kind: 'info', text: 'Arquitectura cargada. Selecciona un componente o simula una llamada al sistema.' },
  ])

  const selected = components.find((item) => item.id === selectedId) ?? components[0]
  const flow = buildSyscallFlow(structure)
  const activeComponentId = flowIndex >= 0 ? flow[flowIndex]?.componentId : selectedId
  const structureInfo = structures.find((item) => item.id === structure)!

  const addLog = (line: TerminalLine) => setLog((prev) => [...prev, line])

  const selectComponent = (id: string) => {
    const component = components.find((item) => item.id === id)
    if (!component) return
    setSelectedId(id)
    setFlowIndex(-1)
    addLog({ kind: 'info', text: `${component.name}: ${component.role}` })
  }

  const startFlow = () => {
    setFlowIndex(0)
    addLog({ kind: 'step', text: `Llamada al sistema con estructura ${structureInfo.name}.` })
    addLog({ kind: 'step', text: flow[0].action })
  }

  const nextStep = () => {
    if (flowIndex < 0) {
      startFlow()
      return
    }
    if (flowIndex >= flow.length - 1) {
      addLog({ kind: 'success', text: 'Petición completada: los datos volvieron a la aplicación.' })
      setFlowIndex(-1)
      return
    }
    const nextIndex = flowIndex + 1
    setFlowIndex(nextIndex)
    addLog({ kind: 'step', text: flow[nextIndex].action })
  }

  const changeStructure = (value: Structure) => {
    setStructure(value)
    setFlowIndex(-1)
    const info = structures.find((item) => item.id === value)!
    addLog({ kind: 'warn', text: `Estructura cambiada a ${info.name}: ${info.description}` })
  }

  const reset = () => {
    setSelectedId('kernel')
    setStructure('monolithic')
    setFlowIndex(-1)
    setLog([{ kind: 'info', text: 'Simulación reiniciada.' }])
  }

  return (
    <SimulatorLayout
      moduleId="organization"
      title="Arquitectura interactiva del sistema operativo"
      description="Explora los componentes del SO, sus relaciones y el recorrido de una llamada al sistema."
      badge="Arquitectura"
      onReset={reset}
      log={log}
      controls={
        <div className="control-stack">
          <div className="control-group">
            <label htmlFor="structure">Estructura del kernel</label>
            <select
              id="structure"
              className="field"
              value={structure}
              onChange={(event) => changeStructure(event.target.value as Structure)}
            >
              {structures.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <p className="control-tip">{structureInfo.description}</p>
          </div>

          <div className="control-group">
            <label htmlFor="component">Componente seleccionado</label>
            <select
              id="component"
              className="field"
              value={selectedId}
              onChange={(event) => selectComponent(event.target.value)}
            >
              {components.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Flujo de llamada al sistema</label>
            <p className="control-tip">Pasos: {flow.length}</p>
            <button type="button" className="primary full" onClick={startFlow}>
              Ejecutar llamada
            </button>
            <button type="button" className="secondary full" onClick={nextStep}>
              Siguiente paso →
            </button>
          </div>
        </div>
      }
    >
      <h2 className="viz-title">Mapa de componentes</h2>
      <div className="arch-map">
        {layers.map((layer) => (
          <div key={layer.id} className={`arch-layer arch-${layer.id}`}>
            <span className="arch-layer-label">{layer.label}</span>
            <div className="arch-layer-items">
              {components
                .filter((item) => item.layer === layer.id)
                .map((item) => {
                  const Icon = iconMap[item.icon] ?? Cpu
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`arch-node ${item.id === activeComponentId ? 'active' : ''}`}
                      onClick={() => selectComponent(item.id)}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </button>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="component-detail panel">
        <div className="component-detail-head">
          <h3>{selected.name}</h3>
          <span className="badge">{selected.layer}</span>
        </div>
        <p>{selected.role}</p>
        <div className="component-detail-grid">
          <div>
            <h4>Funciones</h4>
            <ul>
              {selected.functions.map((fn) => <li key={fn}>{fn}</li>)}
            </ul>
          </div>
          <div>
            <h4>Se relaciona con</h4>
            <div className="relation-chips">
              {selected.relatesTo.map((id) => {
                const related = components.find((item) => item.id === id)
                return related ? (
                  <button key={id} type="button" className="chip-button" onClick={() => selectComponent(id)}>
                    {related.name}
                  </button>
                ) : null
              })}
            </div>
          </div>
        </div>
        {flowIndex >= 0 && (
          <p className="flow-status">
            Paso {flowIndex + 1} de {flow.length}: {flow[flowIndex].action}
          </p>
        )}
      </div>
    </SimulatorLayout>
  )
}
