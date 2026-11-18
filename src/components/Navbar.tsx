import { ChevronRight, GitBranch, Home } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { allLabs, modules } from '../data/modules'

const pathLabels: Record<string, string> = {
  introduction: 'Introducción',
  organization: 'Organización',
  processes: 'Procesos',
  memory: 'Memoria',
  storage: 'Almacenamiento',
}

export function Navbar() {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)
  const section = parts[0] === 'labs' ? parts[1] : parts[0]
  const lab = parts[0] === 'labs' ? allLabs.find((item) => item.path === pathname) : undefined
  const module = modules.find((item) => item.id === section)

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <Link to="/" className="breadcrumb-home" aria-label="Ir al dashboard">
          <Home size={16} />
        </Link>
        {section && (
          <>
            <ChevronRight size={14} />
            {module ? (
              <Link to={`/${module.id}`}>{module.shortTitle}</Link>
            ) : (
              <span>{pathLabels[section] ?? section}</span>
            )}
          </>
        )}
        {lab && (
          <>
            <ChevronRight size={14} />
            <span className="breadcrumb-current">{lab.label}</span>
          </>
        )}
      </div>

      <nav className="top-links" aria-label="Módulos">
        {modules.map((item) => (
          <NavLink
            key={item.id}
            to={`/${item.id}`}
            className={({ isActive }) => (isActive ? 'top-link active' : 'top-link')}
          >
            {item.shortTitle}
          </NavLink>
        ))}
      </nav>

      <a
        className="top-icon"
        href="https://github.com/KevinRivera1/os-lab.git"
        target="_blank"
        rel="noreferrer"
        aria-label="Repositorio en GitHub"
      >
        <GitBranch size={18} />
      </a>
    </header>
  )
}
