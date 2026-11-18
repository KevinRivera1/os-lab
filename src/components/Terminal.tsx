import { useEffect, useRef } from 'react'
import { TerminalSquare } from 'lucide-react'

export type TerminalKind = 'info' | 'step' | 'success' | 'warn' | 'error'

export interface TerminalLine {
  kind: TerminalKind
  text: string
}

interface TerminalProps {
  lines: TerminalLine[]
  title?: string
  height?: number
}

export function Terminal({ lines, title = 'Consola de simulación', height = 190 }: TerminalProps) {
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [lines])

  return (
    <section className="terminal panel">
      <header className="terminal-head">
        <TerminalSquare size={16} />
        <span>{title}</span>
        <span className="terminal-count">{lines.length} eventos</span>
      </header>
      <div className="terminal-body" style={{ maxHeight: height }}>
        {lines.length === 0 ? (
          <p className="terminal-empty">Ejecuta la simulación para ver cada paso aquí.</p>
        ) : (
          lines.map((line, index) => (
            <p key={`${index}-${line.text}`} className={`terminal-line terminal-${line.kind}`}>
              <span className="terminal-prefix">
                {line.kind === 'success' ? '✓' : line.kind === 'warn' ? '!' : line.kind === 'error' ? '×' : '›'}
              </span>
              {line.text}
            </p>
          ))
        )}
        <div ref={endRef} />
      </div>
    </section>
  )
}
