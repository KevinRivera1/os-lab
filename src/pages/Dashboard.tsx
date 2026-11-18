import { ArrowRight, BookOpenCheck, Cpu, FlaskConical, Layers3, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProgressBar } from '../components/ProgressBar'
import { StatCard } from '../components/StatCard'
import { allLabs, modules } from '../data/modules'
import { useLabProgress } from '../hooks/useLabProgress'

export function Dashboard() {
  const { visited, total } = useLabProgress()
  const percent = total === 0 ? 0 : Math.round((visited.length / total) * 100)

  return (
    <div className="dashboard">
      <section className="hero panel">
        <div className="hero-copy">
          <span className="badge">Laboratorio virtual · Sistemas Operativos</span>
          <h1>
            Aprende cómo funciona un sistema operativo{' '}
            <em>experimentando con él.</em>
          </h1>
          <p>
            OS LAB reúne contenido teórico y simuladores interactivos para que modifiques parámetros,
            ejecutes algoritmos reales y veas gráficamente qué ocurre en cada paso.
          </p>
          <div className="hero-actions">
            <Link to="/processes" className="primary hero-cta">
              <Play size={17} />
              Explorar laboratorios
            </Link>
            <Link to="/introduction" className="secondary hero-cta">
              <BookOpenCheck size={17} />
              Empezar por la teoría
            </Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit">
            <Cpu size={72} strokeWidth={1.2} />
          </div>
          <span className="orbit-dot dot-a" />
          <span className="orbit-dot dot-b" />
          <span className="orbit-dot dot-c" />
        </div>
      </section>

      <section className="stats-row">
        <StatCard label="Módulos" value={modules.length} hint="Contenido teórico completo" icon={Layers3} tone="violet" />
        <StatCard label="Laboratorios" value={total} hint="Simuladores funcionales" icon={FlaskConical} tone="cyan" />
        <StatCard label="Explorados" value={visited.length} hint="Progreso de esta sesión" icon={BookOpenCheck} tone="emerald" />
        <StatCard label="Avance" value={`${percent}%`} hint="Del recorrido total" icon={Cpu} tone="amber" />
      </section>

      <section className="content-section">
        <div className="section-heading">
          <Layers3 size={18} />
          <h2>Módulos temáticos</h2>
          <span className="section-extra">Cinco bloques, un simulador por tema</span>
        </div>
        <div className="module-grid">
          {modules.map((module) => {
            const Icon = module.icon
            const done = module.labs.filter((lab) => visited.includes(lab.path)).length
            return (
              <Link key={module.id} to={`/${module.id}`} className={`module-card panel module-${module.id}`}>
                <div className="module-card-top">
                  <span className="module-card-icon">
                    <Icon size={24} />
                  </span>
                  <span className="module-chip">Módulo {module.number}</span>
                </div>
                <h3>{module.shortTitle}</h3>
                <p>{module.description}</p>
                <ul className="mini-topics">
                  {module.topics.slice(0, 3).map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
                <div className="module-card-foot">
                  <ProgressBar value={(done / module.labs.length) * 100} showValue={false} />
                  <span>{done}/{module.labs.length} labs</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <FlaskConical size={18} />
          <h2>Acceso directo a los laboratorios</h2>
        </div>
        <div className="direct-labs">
          {allLabs.map((lab) => (
            <Link key={lab.path} to={lab.path} className="direct-lab">
              <span className="direct-lab-title">{lab.label}</span>
              <span className="direct-lab-module">{lab.moduleTitle}</span>
              <ArrowRight size={15} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
