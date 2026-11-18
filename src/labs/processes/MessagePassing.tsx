import { useState } from 'react'
import { ArrowRight, CheckCheck, Send, Truck } from 'lucide-react'
import { SimulatorLayout } from '../../components/SimulatorLayout'
import type { TerminalLine } from '../../components/Terminal'
import { acknowledge, deliverNext, sendMessage, type Message } from './ipcLogic'

export function MessagePassing() {
  const [queue, setQueue] = useState<Message[]>([])
  const [from, setFrom] = useState('P1')
  const [to, setTo] = useState('P2')
  const [text, setText] = useState('')
  const [ackId, setAckId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState<TerminalLine[]>([
    { kind: 'info', text: 'Canal de mensajes listo. Envía un mensaje para iniciar la comunicación.' },
  ])

  const addLog = (kind: TerminalLine['kind'], message: string) =>
    setLog((prev) => [...prev, { kind, text: message }])

  const send = () => {
    if (!text.trim()) {
      setError('El mensaje no puede estar vacío.')
      return
    }
    if (from === to) {
      setError('Emisor y receptor deben ser procesos distintos.')
      return
    }
    setError(null)
    const updated = sendMessage(queue, from, to, text)
    setQueue(updated)
    const created = updated[updated.length - 1]
    setAckId(created.id)
    setText('')
    addLog('step', `${from} → ${to}: mensaje #${created.id} "${created.text}" enviado.`)
  }

  const deliver = () => {
    const result = deliverNext(queue)
    if (!result.delivered) {
      addLog('warn', 'No hay mensajes pendientes de entrega.')
      return
    }
    setQueue(result.queue)
    setAckId(result.delivered.id)
    addLog('success', `Mensaje #${result.delivered.id} entregado a ${result.delivered.to}.`)
  }

  const ack = () => {
    if (ackId === null) {
      addLog('warn', 'Selecciona un mensaje para confirmar.')
      return
    }
    const message = queue.find((item) => item.id === ackId)
    if (!message) return
    if (message.status !== 'entregado') {
      addLog('warn', `El mensaje #${ackId} todavía no ha sido entregado.`)
      return
    }
    setQueue(acknowledge(queue, ackId))
    addLog('success', `${message.to} confirma la recepción del mensaje #${ackId}.`)
  }

  const reset = () => {
    setQueue([])
    setAckId(null)
    setText('')
    setError(null)
    setLog([{ kind: 'info', text: 'Canal de mensajes reiniciado.' }])
  }

  return (
    <SimulatorLayout
      moduleId="processes"
      title="Comunicación por paso de mensajes"
      description="Envía mensajes entre procesos, entrégalos y confirma su recepción con acknowledgements."
      badge="IPC"
      onReset={reset}
      log={log}
      controls={
        <div className="control-stack">
          <div className="control-group">
            <label htmlFor="from">Emisor</label>
            <select id="from" className="field" value={from} onChange={(event) => setFrom(event.target.value)}>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="to">Receptor</label>
            <select id="to" className="field" value={to} onChange={(event) => setTo(event.target.value)}>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="message">Mensaje</label>
            <textarea
              id="message"
              className="field"
              rows={3}
              value={text}
              placeholder="Escribe el contenido del mensaje"
              onChange={(event) => setText(event.target.value)}
            />
            <button type="button" className="primary full" onClick={send}>
              <Send size={15} /> Enviar mensaje
            </button>
            {error && <p className="error-box">{error}</p>}
          </div>
          <div className="control-group">
            <label>Cola de mensajes</label>
            <button type="button" className="secondary full" onClick={deliver}>
              <Truck size={15} /> Entregar siguiente
            </button>
            <select
              className="field"
              value={ackId ?? ''}
              onChange={(event) => setAckId(event.target.value ? Number(event.target.value) : null)}
            >
              <option value="">Seleccionar mensaje…</option>
              {queue.map((message) => (
                <option key={message.id} value={message.id}>#{message.id} · {message.status}</option>
              ))}
            </select>
            <button type="button" className="secondary full" onClick={ack}>
              <CheckCheck size={15} /> Confirmar recepción
            </button>
          </div>
        </div>
      }
    >
      <h2 className="viz-title">Canal de comunicación</h2>
      <div className="message-layout">
        <div className="ipc-process panel"><h3>{from}</h3><p>Emisor</p><strong>{from}</strong></div>
        <div className="message-channel">
          <ArrowRight size={22} />
          <span>envío</span>
          <ArrowRight size={22} />
        </div>
        <div className="ipc-process panel"><h3>{to}</h3><p>Receptor</p><strong>{to}</strong></div>
      </div>

      <div className="queue-block">
        <h3>Cola de mensajes ({queue.length})</h3>
        {queue.length === 0 ? (
          <p className="state-empty">La cola está vacía.</p>
        ) : (
          <div className="message-list">
            {queue.map((message) => (
              <div key={message.id} className={`message-card status-${message.status}`}>
                <div className="message-card-head">
                  <strong>#{message.id}</strong>
                  <span className="badge">{message.status}</span>
                </div>
                <p>{message.from} → {message.to}</p>
                <p className="message-text">“{message.text}”</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </SimulatorLayout>
  )
}
