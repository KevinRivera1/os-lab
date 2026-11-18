import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getModule, type ModuleId } from '../data/modules'
import { markLabVisited } from '../hooks/useLabProgress'
import { Terminal, type TerminalLine } from './Terminal'

interface SimulatorLayoutProps {
  moduleId: ModuleId
  title: string
  description: string
  badge?: string
  controls: ReactNode
  children: ReactNode
  log: TerminalLine[]
  onReset: () => void
}

export function SimulatorLayout({
  moduleId,
  title,
  description,
  badge,
  controls,
  children,
  log,
  onReset,
}: SimulatorLayoutProps) {
  const { pathname } = useLocation()
  const module = getModule(moduleId)

  useEffect(() => {
    markLabVisited(pathname)
  }, [pathname])

  return (
    <div className="simulator-page">
      <Link to={`/${moduleId}`} className="back-link">
        <ArrowLeft size={16} />
        Volver a {module?.shortTitle ?? 'la página anterior'}
      </Link>

      <div className="sim-heading">
        <div>
          {badge && <span className="badge">Laboratorio · {badge}</span>}
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button type="button" className="secondary reset-button" onClick={onReset}>
          <RotateCcw size={16} />
          Reiniciar
        </button>
      </div>

      <div className="sim-grid">
        <aside className="sim-controls panel">
          <h2>Controles</h2>
          {controls}
        </aside>
        <div className="sim-visual panel">{children}</div>
      </div>

      <Terminal lines={log} />
    </div>
  )
}
