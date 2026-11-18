import { useState } from 'react'
import { ChevronRight, File, Folder, FolderPlus, Info, MoveRight, Trash2 } from 'lucide-react'
import { SimulatorLayout } from '../../components/SimulatorLayout'
import type { TerminalLine } from '../../components/Terminal'
import {
  createEntry, createSeedTree, deleteEntry, findNode, moveEntry, treeStats,
  type FsNode,
} from './fileSystemLogic'

export function FileSystem() {
  const [root, setRoot] = useState<FsNode>(createSeedTree)
  const [currentPath, setCurrentPath] = useState('/')
  const [selectedPath, setSelectedPath] = useState('/docs')
  const [name, setName] = useState('')
  const [type, setType] = useState<'dir' | 'file'>('file')
  const [size, setSize] = useState(4)
  const [destination, setDestination] = useState('/')
  const [log, setLog] = useState<TerminalLine[]>([
    { kind: 'info', text: 'Sistema de archivos simulado listo. Explora el árbol y crea entradas.' },
  ])

  const stats = treeStats(root)
  const selected = findNode(root, selectedPath)

  const addLog = (kind: TerminalLine['kind'], text: string) =>
    setLog((prev) => [...prev, { kind, text }])

  const create = () => {
    const result = createEntry(root, currentPath, name, type, size)
    addLog(result.ok ? 'success' : 'error', result.message)
    if (result.ok) {
      setRoot(result.root)
      const path = `${currentPath === '/' ? '' : currentPath}/${name.trim()}`
      setSelectedPath(path)
      setName('')
    }
  }

  const remove = () => {
    const result = deleteEntry(root, selectedPath)
    addLog(result.ok ? 'warn' : 'error', result.message)
    if (result.ok) {
      setRoot(result.root)
      setSelectedPath('/')
    }
  }

  const move = () => {
    const result = moveEntry(root, selectedPath, destination)
    addLog(result.ok ? 'success' : 'error', result.message)
    if (result.ok) {
      setRoot(result.root)
      const namePart = selectedPath.split('/').filter(Boolean).pop()
      setSelectedPath(`${destination === '/' ? '' : destination}/${namePart}`)
      setCurrentPath(destination)
    }
  }

  const query = () => {
    if (!selected) {
      addLog('error', 'Selecciona una entrada válida para consultar.')
      return
    }
    addLog(
      'info',
      `${selectedPath} · tipo: ${selected.type === 'dir' ? 'directorio' : 'archivo'} · tamaño: ${selected.size} bloques · creado: ${new Date(selected.createdAt).toLocaleString()}`,
    )
  }

  const reset = () => {
    setRoot(createSeedTree())
    setCurrentPath('/')
    setSelectedPath('/docs')
    setName('')
    setLog([{ kind: 'info', text: 'Sistema de archivos reinicializado con su estructura de ejemplo.' }])
  }

  const renderNode = (node: FsNode, path: string, depth: number) => {
    const Icon = node.type === 'dir' ? Folder : File
    return (
      <div key={node.id}>
        <button
          type="button"
          className={`tree-node ${selectedPath === path ? 'selected' : ''}`}
          style={{ paddingLeft: 10 + depth * 18 }}
          onClick={() => {
            setSelectedPath(path)
            if (node.type === 'dir') setCurrentPath(path)
          }}
        >
          <Icon size={16} />
          <span>{node.name}</span>
          {node.type === 'file' && <small>{node.size} b</small>}
        </button>
        {node.children.map((child) => renderNode(child, `${path === '/' ? '' : path}/${child.name}`, depth + 1))}
      </div>
    )
  }

  return (
    <SimulatorLayout
      moduleId="storage"
      title="Sistema de archivos simulado"
      description="Explora un árbol jerárquico, crea directorios y archivos, y organiza su contenido."
      badge="Archivos"
      onReset={reset}
      log={log}
      controls={
        <div className="control-stack">
          <div className="control-group">
            <label>Directorio actual</label>
            <div className="path-box">{currentPath}</div>
          </div>
          <div className="control-group">
            <label htmlFor="entry-name">Nombre</label>
            <input
              id="entry-name"
              className="field"
              value={name}
              placeholder="Ej. informe.txt"
              onChange={(event) => setName(event.target.value)}
            />
            <label htmlFor="entry-type">Tipo</label>
            <select id="entry-type" className="field" value={type} onChange={(event) => setType(event.target.value as 'dir' | 'file')}>
              <option value="file">Archivo</option>
              <option value="dir">Directorio</option>
            </select>
            {type === 'file' && (
              <>
                <label htmlFor="entry-size">Tamaño (bloques)</label>
                <input
                  id="entry-size"
                  className="field"
                  type="number"
                  min={1}
                  value={size}
                  onChange={(event) => setSize(Number(event.target.value))}
                />
              </>
            )}
            <button type="button" className="primary full" onClick={create}>
              <FolderPlus size={15} /> Crear entrada
            </button>
          </div>
          <div className="control-group">
            <label>Entrada seleccionada</label>
            <div className="path-box">{selectedPath}</div>
            <button type="button" className="secondary full" onClick={query}>
              <Info size={15} /> Consultar información
            </button>
            <button type="button" className="secondary full" onClick={remove} disabled={selectedPath === '/'}>
              <Trash2 size={15} /> Eliminar entrada
            </button>
          </div>
          <div className="control-group">
            <label htmlFor="destination">Mover a directorio</label>
            <select id="destination" className="field" value={destination} onChange={(event) => setDestination(event.target.value)}>
              {collectDirectories(root, '/').map((path) => <option key={path} value={path}>{path}</option>)}
            </select>
            <button type="button" className="secondary full" onClick={move} disabled={selectedPath === '/'}>
              <MoveRight size={15} /> Mover entrada
            </button>
          </div>
        </div>
      }
    >
      <h2 className="viz-title">Estructura de directorios</h2>
      <div className="fs-tree panel">
        {renderNode(root, '/', 0)}
      </div>

      <div className="metric-strip compact">
        <div><span>Directorios</span><strong>{stats.dirs}</strong></div>
        <div><span>Archivos</span><strong>{stats.files}</strong></div>
        <div><span>Bloques ocupados</span><strong>{stats.totalSize}</strong></div>
      </div>

      {selected && (
        <div className="selection-detail panel">
          <h3>{selected.name}</h3>
          <p>
            Ruta <strong>{selectedPath}</strong> · Tipo <strong>{selected.type}</strong> · Tamaño <strong>{selected.size} bloques</strong>
          </p>
        </div>
      )}
      <p className="viz-footnote"><ChevronRight size={14} /> Haz clic en un directorio para situarte en él y crear entradas dentro.</p>
    </SimulatorLayout>
  )
}

function collectDirectories(node: FsNode, path: string): string[] {
  const paths = [path]
  for (const child of node.children) {
    if (child.type === 'dir') {
      const childPath = `${path === '/' ? '' : path}/${child.name}`
      paths.push(...collectDirectories(child, childPath))
    }
  }
  return paths
}
