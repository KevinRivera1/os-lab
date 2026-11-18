import { useState } from 'react'
import { CalendarDays, GitCompare, History, Layers } from 'lucide-react'
import { SimulatorLayout } from '../../components/SimulatorLayout'
import type { TerminalLine } from '../../components/Terminal'
import { eras, osTypes } from './timelineData'

type View = 'history' | 'compare'

export function SystemTimeline() {
  const [selectedId, setSelectedId] = useState(eras[0].id)
  const [typeFilter, setTypeFilter] = useState('all')
  const [view, setView] = useState<View>('history')
  const [log, setLog] = useState<TerminalLine[]>([
    { kind: 'info', text: 'Línea de tiempo cargada. Selecciona una era o compara los tipos de sistema.' },
  ])

  const selected = eras.find((era) => era.id === selectedId) ?? eras[0]
  const filteredEras = typeFilter === 'all' ? eras : eras.filter((era) => era.type === typeFilter)
  const selectedType = osTypes.find((type) => type.id === typeFilter)

  const addLog = (kind: TerminalLine['kind'], text: string) =>
    setLog((prev) => [...prev, { kind, text }])

  const selectEra = (id: string) => {
    const era = eras.find((item) => item.id === id)
    if (!era) return
    setSelectedId(id)
    addLog('step', `${era.year} · ${era.title}: ${era.representative}`)
  }

  const advance = () => {
    const index = eras.findIndex((era) => era.id === selectedId)
    const next = eras[(index + 1) % eras.length]
    selectEra(next.id)
  }

  const changeFilter = (value: string) => {
    setTypeFilter(value)
    const label = osTypes.find((type) => type.id === value)?.name ?? 'todos los tipos'
    addLog('info', `Filtro aplicado: ${label}. ${value === 'all' ? eras.length : filteredEras.length} eras visibles.`)
  }

  const reset = () => {
    setSelectedId(eras[0].id)
    setTypeFilter('all')
    setView('history')
    setLog([{ kind: 'info', text: 'Simulación reiniciada. Línea de tiempo en su estado inicial.' }])
  }

  return (
    <SimulatorLayout
      moduleId="introduction"
      title="Línea de tiempo y tipos de sistemas operativos"
      description="Recorre la evolución histórica de los sistemas operativos y compara las características de cada enfoque."
      badge="Historia"
      onReset={reset}
      log={log}
      controls={
        <div className="control-stack">
          <div className="control-group">
            <label>Vista</label>
            <div className="segmented">
              <button type="button" className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>
                <History size={15} /> Historial
              </button>
              <button type="button" className={view === 'compare' ? 'active' : ''} onClick={() => setView('compare')}>
                <GitCompare size={15} /> Comparar
              </button>
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="type-filter">Filtrar por tipo</label>
            <select id="type-filter" className="field" value={typeFilter} onChange={(event) => changeFilter(event.target.value)}>
              <option value="all">Todos los tipos</option>
              {osTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Era seleccionada</label>
            <div className="selected-era">
              <CalendarDays size={18} />
              <div>
                <strong>{selected.year}</strong>
                <span>{selected.title}</span>
              </div>
            </div>
          </div>

          <button type="button" className="primary full" onClick={advance}>
            Siguiente era →
          </button>

          <p className="control-tip">
            {filteredEras.length} eras coinciden con el filtro. Haz clic en cualquier punto de la línea de tiempo.
          </p>
        </div>
      }
    >
      {view === 'history' ? (
        <div className="timeline-view">
          <h2 className="viz-title">Evolución histórica</h2>
          <div className="timeline-track">
            {eras.map((era) => {
              const dimmed = typeFilter !== 'all' && era.type !== typeFilter
              return (
                <button
                  key={era.id}
                  type="button"
                  className={`timeline-node ${era.id === selectedId ? 'selected' : ''} ${dimmed ? 'dimmed' : ''}`}
                  onClick={() => selectEra(era.id)}
                >
                  <span className="timeline-dot" />
                  <span className="timeline-year">{era.year}</span>
                  <span className="timeline-label">{era.title}</span>
                </button>
              )
            })}
          </div>

          <div className="era-detail">
            <div className="era-head">
              <span className="badge">{selected.year}</span>
              <h3>{selected.title}</h3>
            </div>
            <p>{selected.summary}</p>
            <div className="era-meta">
              <Layers size={16} />
              <span><strong>Sistema representativo:</strong> {selected.representative}</span>
            </div>
            <ul className="feature-list">
              {selected.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="compare-view">
          <h2 className="viz-title">Comparación de tipos de sistema operativo</h2>
          {selectedType && (
            <p className="compare-highlight">
              Mostrando <strong>{selectedType.name}</strong>: {selectedType.description}
            </p>
          )}
          <div className="type-grid">
            {osTypes
              .filter((type) => typeFilter === 'all' || type.id === typeFilter)
              .map((type) => (
                <article key={type.id} className="type-card">
                  <h3>{type.name}</h3>
                  <p>{type.description}</p>
                  <ul>
                    {type.strengths.map((strength) => (
                      <li key={strength}>{strength}</li>
                    ))}
                  </ul>
                  <small>Ejemplo: {type.example}</small>
                </article>
              ))}
          </div>
        </div>
      )}
    </SimulatorLayout>
  )
}
