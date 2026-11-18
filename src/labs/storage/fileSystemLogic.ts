export interface FsNode {
  id: string
  name: string
  type: 'dir' | 'file'
  children: FsNode[]
  size: number
  createdAt: string
}

let counter = 0
const nextId = () => `node-${++counter}`

export function createRoot(): FsNode {
  return { id: nextId(), name: '/', type: 'dir', children: [], size: 0, createdAt: new Date().toISOString() }
}

export function createSeedTree(): FsNode {
  const root = createRoot()
  const docs: FsNode = { id: nextId(), name: 'docs', type: 'dir', children: [], size: 0, createdAt: new Date().toISOString() }
  const system: FsNode = { id: nextId(), name: 'system', type: 'dir', children: [], size: 0, createdAt: new Date().toISOString() }
  docs.children.push(
    { id: nextId(), name: 'apuntes.txt', type: 'file', children: [], size: 12, createdAt: new Date().toISOString() },
    { id: nextId(), name: 'ejercicios.md', type: 'file', children: [], size: 8, createdAt: new Date().toISOString() },
  )
  system.children.push(
    { id: nextId(), name: 'kernel.bin', type: 'file', children: [], size: 64, createdAt: new Date().toISOString() },
  )
  root.children.push(docs, system)
  return root
}

const segmentsOf = (path: string) => path.split('/').filter(Boolean)

export function findNode(root: FsNode, path: string): FsNode | null {
  const segments = segmentsOf(path)
  let current = root
  for (const segment of segments) {
    const next = current.children.find((child) => child.name === segment)
    if (!next) return null
    current = next
  }
  return current
}

function updateNode(root: FsNode, path: string, updater: (node: FsNode) => FsNode): FsNode {
  const segments = segmentsOf(path)
  if (segments.length === 0) return updater(root)
  const [head, ...rest] = segments
  return {
    ...root,
    children: root.children.map((child) =>
      child.name === head ? updateNode(child, `/${rest.join('/')}`, updater) : child,
    ),
  }
}

function parentPathOf(path: string): string {
  const segments = segmentsOf(path)
  segments.pop()
  return segments.length ? `/${segments.join('/')}` : '/'
}

export function pathExists(root: FsNode, path: string): boolean {
  return findNode(root, path) !== null
}

export function createEntry(
  root: FsNode,
  parent: string,
  name: string,
  type: 'dir' | 'file',
  size: number,
): { root: FsNode; ok: boolean; message: string } {
  const parentNode = findNode(root, parent)
  if (!parentNode || parentNode.type !== 'dir') return { root, ok: false, message: 'El directorio destino no existe.' }
  const clean = name.trim()
  if (!clean || clean.includes('/')) return { root, ok: false, message: 'El nombre no puede estar vacío ni contener "/".' }
  if (parentNode.children.some((child) => child.name === clean)) {
    return { root, ok: false, message: `Ya existe una entrada llamada "${clean}" en ${parent}.` }
  }
  if (type === 'file' && (!Number.isInteger(size) || size <= 0)) {
    return { root, ok: false, message: 'El tamaño del archivo debe ser un entero positivo.' }
  }
  const node: FsNode = {
    id: nextId(), name: clean, type, children: [], size: type === 'file' ? size : 0,
    createdAt: new Date().toISOString(),
  }
  return {
    root: updateNode(root, parent, (current) => ({ ...current, children: [...current.children, node] })),
    ok: true,
    message: `${type === 'dir' ? 'Directorio' : 'Archivo'} "${clean}" creado en ${parent}.`,
  }
}

export function deleteEntry(root: FsNode, path: string): { root: FsNode; ok: boolean; message: string } {
  if (segmentsOf(path).length === 0) return { root, ok: false, message: 'No se puede eliminar la raíz.' }
  const node = findNode(root, path)
  if (!node) return { root, ok: false, message: `No existe "${path}".` }
  const parent = parentPathOf(path)
  return {
    root: updateNode(root, parent, (current) => ({
      ...current,
      children: current.children.filter((child) => child.name !== node.name),
    })),
    ok: true,
    message: `"${node.name}" eliminado${node.type === 'dir' ? ' junto con su contenido' : ''}.`,
  }
}

export function moveEntry(
  root: FsNode,
  from: string,
  toParent: string,
): { root: FsNode; ok: boolean; message: string } {
  if (segmentsOf(from).length === 0) return { root, ok: false, message: 'No se puede mover la raíz.' }
  const node = findNode(root, from)
  const destination = findNode(root, toParent)
  if (!node || !destination || destination.type !== 'dir') {
    return { root, ok: false, message: 'Origen o directorio destino no válido.' }
  }
  if (toParent === from || toParent.startsWith(`${from}/`)) {
    return { root, ok: false, message: 'Un directorio no puede moverse dentro de sí mismo.' }
  }
  if (destination.children.some((child) => child.name === node.name)) {
    return { root, ok: false, message: `Ya existe "${node.name}" en ${toParent}.` }
  }
  const oldParent = parentPathOf(from)
  const detached = updateNode(root, oldParent, (current) => ({
    ...current,
    children: current.children.filter((child) => child.name !== node.name),
  }))
  const moved = updateNode(detached, toParent, (current) => ({ ...current, children: [...current.children, node] }))
  return { root: moved, ok: true, message: `"${node.name}" movido a ${toParent}.` }
}

export function treeStats(root: FsNode) {
  let dirs = 0
  let files = 0
  let totalSize = 0
  const visit = (node: FsNode) => {
    if (node.type === 'dir') dirs++
    else {
      files++
      totalSize += node.size
    }
    node.children.forEach(visit)
  }
  visit(root)
  return { dirs, files, totalSize }
}
