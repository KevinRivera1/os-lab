import { useState } from 'react'
import { FilePlus2, Trash2, Wind } from 'lucide-react'
import { SimulatorLayout } from '../../components/SimulatorLayout'
import type { TerminalLine } from '../../components/Terminal'
import {
  allocateFile, createDisk, defragment, diskStats, releaseFile,
} from './secondaryStorageLogic'

export function SecondaryStorage() {
  const [total, setTotal] = useState(32)
  const [blocksPerTrack, setBlocksPerTrack] = useState(8)
  const [disk, setDisk] = useState(createDisk(32, 8))
  const [fileName, setFileName] = useState('')
  const [blockCount, setBlockCount] = useState(3)
  const [releaseName, setReleaseName] = useState('')
  const [log, setLog] = useState<TerminalLine[]>([
    { kind: 'info', text: 'Disco simulado con 32 bloques repartidos en 4 pistas.' },
  ])

  const stats = diskStats(disk)
  const files = [...new Set(disk.blocks.map((block) => block.fileId).filter((id): id is string => id !== null))]

  const addLog = (kind: TerminalLine['kind'], text: string) =>
    setLog((prev) => [...prev, { kind, text }])

  const allocate = () => {
    const result = allocateFile(disk, fileName, blockCount)
    addLog(result.ok ? 'success' : 'error', result.message)
    if (result.ok) {
      setDisk(result.state)
      setFileName('')
    }
  }

  const release = () => {
    const result = releaseFile(disk, releaseName)
    addLog(result.ok ? 'warn' : 'error', result.message)
    if (result.ok) {
      setDisk(result.state)
      setReleaseName('')
    }
  }

  const compact = () => {
    setDisk(defragment(disk))
    addLog('success', 'Desfragmentación completada: los archivos ocupan los primeros bloques contiguos.')
  }

  const reconfigure = (nextTotal: number, nextPerTrack: number) => {
    const safeTotal = Math.max(8, Math.min(128, nextTotal || 8))
    const safePerTrack = Math.max(4, Math.min(16, nextPerTrack || 4))
    setTotal(safeTotal)
    setBlocksPerTrack(safePerTrack)
    setDisk(createDisk(safeTotal, safePerTrack))
    setLog([{ kind: 'info', text: `Disco reinicializado: ${safeTotal} bloques, ${safePerTrack} por pista.` }])
  }

  const reset = () => {
    setDisk(createDisk(total, blocksPerTrack))
    setFileName('')
    setReleaseName('')
    setLog([{ kind: 'info', text: 'Simulación de almacenamiento reiniciada.' }])
  }

  const trackCount = Math.ceil(disk.total / disk.blocksPerTrack)

  return (
    <SimulatorLayout
      moduleId="storage"
      title="Almacenamiento secundario"
      description="Gestiona bloques de disco, observa su organización por pistas y compacta el espacio fragmentado."
      badge="Disco"
      onReset={reset}
      log={log}
      controls={
        <div className="control-stack">
          <div className="control-group">
            <label htmlFor="disk-total">Bloques totales</label>
            <input
              id="disk-total"
              className="field"
              type="number"
              min={8}
              max={128}
              value={total}
              onChange={(event) => reconfigure(Number(event.target.value), blocksPerTrack)}
            />
            <label htmlFor="per-track">Bloques por pista</label>
            <input
              id="per-track"
              className="field"
              type="number"
              min={4}
              max={16}
              value={blocksPerTrack}
              onChange={(event) => reconfigure(total, Number(event.target.value))}
            />
          </div>
          <div className="control-group">
            <label htmlFor="file-name">Nombre del archivo</label>
            <input
              id="file-name"
              className="field"
              value={fileName}
              placeholder="Ej. datos.txt"
              onChange={(event) => setFileName(event.target.value)}
            />
            <label htmlFor="block-count">Bloques contiguos</label>
            <input
              id="block-count"
              className="field"
              type="number"
              min={1}
              max={total}
              value={blockCount}
              onChange={(event) => setBlockCount(Number(event.target.value))}
            />
            <button type="button" className="primary full" onClick={allocate}>
              <FilePlus2 size={15} /> Asignar archivo
            </button>
          </div>
          <div className="control-group">
            <label htmlFor="release-file">Eliminar archivo</label>
            <select id="release-file" className="field" value={releaseName} onChange={(event) => setReleaseName(event.target.value)}>
              <option value="">Seleccionar…</option>
              {files.map((file) => <option key={file} value={file}>{file}</option>)}
            </select>
            <button type="button" className="secondary full" onClick={release} disabled={!releaseName}>
              <Trash2 size={15} /> Eliminar
            </button>
          </div>
          <button type="button" className="secondary full" onClick={compact}>
            <Wind size={15} /> Desfragmentar disco
          </button>
        </div>
      }
    >
      <h2 className="viz-title">Mapa de bloques del disco</h2>
      <div className="disk-view">
        {Array.from({ length: trackCount }, (_, track) => (
          <div key={track} className="disk-track">
            <span className="track-label">Pista {track}</span>
            <div className="track-blocks">
              {disk.blocks
                .filter((block) => Math.floor(block.index / disk.blocksPerTrack) === track)
                .map((block) => (
                  <div
                    key={block.index}
                    className={`disk-block ${block.fileId ? 'used' : ''}`}
                    style={block.fileId ? { backgroundColor: block.color } : undefined}
                    title={`Bloque ${block.index}${block.fileId ? ` · ${block.fileId}` : ' · libre'}`}
                  >
                    {block.index}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="metric-strip">
        <div><span>Bloques usados</span><strong>{stats.used}</strong></div>
        <div><span>Bloques libres</span><strong>{stats.free}</strong></div>
        <div><span>Archivos</span><strong>{stats.files}</strong></div>
        <div><span>Regiones libres</span><strong>{stats.fragments}</strong></div>
      </div>

      <div className="legend-row">
        {files.map((file) => {
          const color = disk.blocks.find((block) => block.fileId === file)?.color
          return <span key={file}><i className="color-dot" style={{ backgroundColor: color }} />{file}</span>
        })}
      </div>
    </SimulatorLayout>
  )
}
