'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { atualizarStatus } from '@/app/actions/atualizar-status'
import Link from 'next/link'
import { GripVertical } from 'lucide-react'

type ClienteKanban = {
  id: string
  nome: string
  slug: string
  status: string
  categorias: { id: string; documentos: { id: string }[] }[]
}

type Coluna = {
  id: string
  label: string
  textoCor: string
  bgCor: string
  borderCor: string
  dotCor: string
}

const COLUNAS: Coluna[] = [
  {
    id: 'link_enviado',
    label: 'Link Enviado',
    textoCor: 'text-blue-700',
    bgCor: 'bg-blue-50',
    borderCor: 'border-blue-200',
    dotCor: 'bg-blue-400',
  },
  {
    id: 'falta_documentos',
    label: 'Falta Documentos',
    textoCor: 'text-yellow-700',
    bgCor: 'bg-yellow-50',
    borderCor: 'border-yellow-200',
    dotCor: 'bg-yellow-400',
  },
  {
    id: 'documentos_enviados',
    label: 'Docs Enviados',
    textoCor: 'text-purple-700',
    bgCor: 'bg-purple-50',
    borderCor: 'border-purple-200',
    dotCor: 'bg-purple-400',
  },
  {
    id: 'fazendo_declaracao',
    label: 'Fazendo Declaração',
    textoCor: 'text-orange-700',
    bgCor: 'bg-orange-50',
    borderCor: 'border-orange-200',
    dotCor: 'bg-orange-400',
  },
  {
    id: 'ir_finalizado',
    label: 'IR Finalizado',
    textoCor: 'text-green-700',
    bgCor: 'bg-green-50',
    borderCor: 'border-green-200',
    dotCor: 'bg-green-400',
  },
]

function calcProgresso(cliente: ClienteKanban) {
  const total = cliente.categorias.length
  const preenchidas = cliente.categorias.filter((c) => c.documentos.length > 0).length
  const pct = total > 0 ? Math.round((preenchidas / total) * 100) : 0
  return { total, preenchidas, pct }
}

function CardConteudo({ cliente }: { cliente: ClienteKanban }) {
  const { total, preenchidas, pct } = calcProgresso(cliente)
  return (
    <>
      <p className="text-sm font-medium text-gray-900 truncate leading-tight">{cliente.nome}</p>
      <div className="mt-2 space-y-1">
        <div className="flex justify-between text-xs text-gray-400">
          <span>{preenchidas}/{total} categorias</span>
          <span className="font-medium">{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1">
          <div
            className="h-1 rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#22c55e' : '#3b82f6' }}
          />
        </div>
      </div>
    </>
  )
}

function DraggableCard({ cliente }: { cliente: ClienteKanban }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: cliente.id,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm select-none ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          {...listeners}
          {...attributes}
          className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 touch-none"
          aria-label="Arrastar cliente"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <Link href={`/clientes/${cliente.id}`} className="hover:opacity-75 transition-opacity block">
            <CardConteudo cliente={cliente} />
          </Link>
        </div>
      </div>
    </div>
  )
}

function OverlayCard({ cliente }: { cliente: ClienteKanban }) {
  return (
    <div className="bg-white rounded-lg border border-gray-300 p-3 shadow-xl w-52">
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <CardConteudo cliente={cliente} />
        </div>
      </div>
    </div>
  )
}

function KanbanColuna({ coluna, clientes }: { coluna: Coluna; clientes: ClienteKanban[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: coluna.id })

  return (
    <div className="flex-shrink-0 w-52">
      <div className={`rounded-xl border ${coluna.borderCor} ${coluna.bgCor} flex flex-col`}>
        <div className="flex items-center gap-2 p-3 pb-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${coluna.dotCor}`} />
          <h3 className={`text-xs font-bold uppercase tracking-wide ${coluna.textoCor} flex-1 leading-tight`}>
            {coluna.label}
          </h3>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${coluna.textoCor} border ${coluna.borderCor}`}>
            {clientes.length}
          </span>
        </div>
        <div
          ref={setNodeRef}
          className={`min-h-40 space-y-2 p-2 rounded-b-xl transition-colors ${isOver ? 'bg-black/5' : ''}`}
        >
          {clientes.map((cliente) => (
            <DraggableCard key={cliente.id} cliente={cliente} />
          ))}
          {clientes.length === 0 && (
            <div className="flex items-center justify-center h-16">
              <p className="text-xs text-gray-300 italic">Vazio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function KanbanBoard({ clientesIniciais }: { clientesIniciais: ClienteKanban[] }) {
  const [clientes, setClientes] = useState(clientesIniciais)
  const [ativo, setAtivo] = useState<ClienteKanban | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  )

  function onDragStart(event: DragStartEvent) {
    setAtivo(clientes.find((c) => c.id === event.active.id) ?? null)
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setAtivo(null)

    if (!over) return

    const clienteId = active.id as string
    const novoStatus = over.id as string
    const clienteAtual = clientes.find((c) => c.id === clienteId)

    if (!clienteAtual || clienteAtual.status === novoStatus) return
    if (!COLUNAS.some((col) => col.id === novoStatus)) return

    setClientes((prev) =>
      prev.map((c) => (c.id === clienteId ? { ...c, status: novoStatus } : c))
    )

    try {
      await atualizarStatus(clienteId, novoStatus)
    } catch {
      setClientes((prev) =>
        prev.map((c) => (c.id === clienteId ? { ...c, status: clienteAtual.status } : c))
      )
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-6">
        {COLUNAS.map((coluna) => (
          <KanbanColuna
            key={coluna.id}
            coluna={coluna}
            clientes={clientes.filter((c) => c.status === coluna.id)}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {ativo ? <OverlayCard cliente={ativo} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
