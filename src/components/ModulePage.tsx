import { ArrowRight, Lightbulb, ListChecks, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getModule, type ModuleId } from '../data/modules'
import { ProgressBar } from './ProgressBar'
import { useLabProgress } from '../hooks/useLabProgress'

export interface TheorySection {
  title: string
  body: string
  bullets?: string[]
  note?: string
}

export interface KeyTerm {
  term: string
  definition: string
}

interface ModulePageProps {
  moduleId: ModuleId
  intro: string
  sections: TheorySection[]
  terms: KeyTerm[]
}

export function ModulePage({ moduleId, intro, sections, terms }: ModulePageProps) {
  const module = getModule(moduleId)
  const { visited } = useLabProgress()
  const Icon = module!.icon
  const done = module!.labs.filter((lab) => visited.includes(lab.path)).length
  const progress = Math.round((done / module!.labs.length) * 100)

  return (
    <div className="module-page">
      <section className={`module-hero module-${moduleId}`}>
        <div className="module-hero-main">
          <span className="module-number">Módulo {module!.number}</span>
          <h1>{module!.title}</h1>
          <p className="module-tagline">{module!.tagline}</p>
          <p className="module-intro">{intro}</p>
        </div>
        <div className="module-hero-icon">
          <Icon size={54} strokeWidth={1.5} />
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <Sparkles size={18} />
          <h2>Contenido teórico</h2>
        </div>
        <div className="theory-grid">
          {sections.map((section) => (
            <article key={section.title} className="theory-card panel">
              <h3>{section.title}</h3>
              <p>{section.body}</p>
              {section.bullets && (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
              {section.note && (
                <p className="theory-note">
                  <Lightbulb size={15} />
                  {section.note}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <ListChecks size={18} />
          <h2>Conceptos clave</h2>
        </div>
        <div className="terms-grid">
          {terms.map((item) => (
            <div key={item.term} className="term-card panel">
              <strong>{item.term}</strong>
              <span>{item.definition}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <ArrowRight size={18} />
          <h2>Laboratorios interactivos</h2>
          <span className="section-extra">Explorados: {done}/{module!.labs.length}</span>
        </div>
        <ProgressBar value={progress} showValue={false} />
        <div className="lab-grid">
          {module!.labs.map((lab) => (
            <Link key={lab.path} to={lab.path} className="lab-card panel">
              <span className="lab-card-icon">
                <Icon size={20} />
              </span>
              <div>
                <h3>{lab.label}</h3>
                <p>{lab.description}</p>
              </div>
              <ArrowRight size={18} className="lab-arrow" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
