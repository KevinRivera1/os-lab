import { Activity, LayoutDashboard, Cpu } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { modules } from '../data/modules'
import { useLabProgress } from '../hooks/useLabProgress'

export function Sidebar() {
  const { visited, total } = useLabProgress()
  const percent = total === 0 ? 0 : Math.round((visited.length / total) * 100)

  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand">
        <span className="brand-mark">
          <Cpu size={22} strokeWidth={2.2} />
        </span>
        <span>
          <strong>OS LAB</strong>
          <small>Laboratorio virtual de SO</small>
        </span>
      </NavLink>

      <nav className="side-nav" aria-label="Navegación principal">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <p className="side-label">Módulos</p>
        {modules.map((module) => {
          const Icon = module.icon
          const done = module.labs.filter((lab) => visited.includes(lab.path)).length
          return (
            <NavLink
              key={module.id}
              to={`/${module.id}`}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span className="side-link-text">{module.shortTitle}</span>
              <span className="side-count">{done}/{module.labs.length}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="side-progress">
        <div className="side-progress-head">
          <Activity size={16} />
          <span>Progreso</span>
          <strong>{percent}%</strong>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <small>{visited.length} de {total} laboratorios explorados</small>
      </div>
    </aside>
  )
}
