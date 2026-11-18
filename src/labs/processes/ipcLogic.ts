export interface MemoryCell {
  index: number
  value: string | null
  writer: string | null
  readers: string[]
}

export function createCells(size: number): MemoryCell[] {
  return Array.from({ length: size }, (_, index) => ({ index, value: null, writer: null, readers: [] }))
}

export function writeCell(cells: MemoryCell[], index: number, value: string, writer: string): MemoryCell[] {
  if (index < 0 || index >= cells.length || !value.trim()) return cells
  return cells.map((cell) =>
    cell.index === index ? { ...cell, value: value.trim(), writer, readers: [] } : cell,
  )
}

export function readCell(cells: MemoryCell[], index: number, reader: string): { cells: MemoryCell[]; value: string | null } {
  const cell = cells[index]
  if (!cell) return { cells, value: null }
  return {
    cells: cells.map((item) =>
      item.index === index && !item.readers.includes(reader)
        ? { ...item, readers: [...item.readers, reader] }
        : item,
    ),
    value: cell.value,
  }
}

export type MessageStatus = 'enviado' | 'entregado' | 'confirmado'

export interface Message {
  id: number
  from: string
  to: string
  text: string
  status: MessageStatus
}

export function sendMessage(queue: Message[], from: string, to: string, text: string): Message[] {
  if (!text.trim() || from === to) return queue
  const id = queue.length === 0 ? 1 : Math.max(...queue.map((message) => message.id)) + 1
  return [...queue, { id, from, to, text: text.trim(), status: 'enviado' }]
}

export function deliverNext(queue: Message[]): { queue: Message[]; delivered: Message | null } {
  const index = queue.findIndex((message) => message.status === 'enviado')
  if (index === -1) return { queue, delivered: null }
  return {
    queue: queue.map((message, i) => (i === index ? { ...message, status: 'entregado' as const } : message)),
    delivered: queue[index],
  }
}

export function acknowledge(queue: Message[], id: number): Message[] {
  return queue.map((message) => (message.id === id ? { ...message, status: 'confirmado' as const } : message))
}
