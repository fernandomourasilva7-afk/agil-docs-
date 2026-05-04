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
import { Link2, FileCheck2, FileWarning, FileText, CheckCircle2, MoreHorizontal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type ClienteKanban = {
  id: string
  nome: string
  slug: string
  status: string
  categorias: { id: string; nome: string; observacao: string | null; documentos: { id: string }[] }[]
}

type Coluna = {
  id: string
  label: string
  icon: LucideIcon
  accentColor: string
  iconBg: string
  badgeCls: string
  ringCls: string
}

const COLUNAS: Coluna[] = [
  {
    id: 'link_enviado',
    label: 'Link Enviado',
    icon: Link2,
    accentColor: '#3b82f6',
    iconBg: 'bg-blue-100',
    badgeCls: 'bg-blue-100 text-blue-700',
    ringCls: 'ring-blue-200',
  },
  {
    id: 'documentos_enviados',
    label: 'Docs Enviados',
    icon: FileCheck2,
    accentColor: '#8b5cf6',
    iconBg: 'bg-violet-100',
    badgeCls: 'bg-violet-100 text-violet-700',
    ringCls: 'ring-violet-200',
  },
  {
    id: 'falta_documentos',
    label: 'Falta Documentos',
    icon: FileWarning,
    accentColor: '#f59e0b',
    iconBg: 'bg-amber-100',
    badgeCls: 'bg-amber-100 text-amber-700',
    ringCls: 'ring-amber-200',
  },
  {
    id: 'fazendo_declaracao',
    label: 'Fazendo Declaração',
    icon: FileText,
    accentColor: '#f97316',
    iconBg: 'bg-orange-100',
    badgeCls: 'bg-orange-100 text-orange-700',
    ringCls: 'ring-orange-200',
  },
  {
    id: 'ir_finalizado',
    label: 'IR Finalizado',
    icon: CheckCircle2,
    accentColor: '#10b981',
    iconBg: 'bg-emerald-100',
    badgeCls: 'bg-emerald-100 text-emerald-700',
    ringCls: 'ring-emerald-200',
  },
]

function temObservacoes(observacao: string | null): boolean {
  if (!observacao) return false
  try {
    const arr = JSON.parse(observacao)
    return Array.isArray(arr) ? arr.length > 0 : true
  } catch { return true }
}

function calcProgresso(cliente: ClienteKanban) {
  const total = cliente.categorias.length
  const preenchidas = cliente.categorias.filter(
    (c) => c.documentos.length > 0 && !temObservacoes(c.observacao)
  ).length
  const pct = total > 0 ? Math.round((preenchidas / total) * 100) : 0
  return { total, preenchidas, pct }
}

function statusDot(pct: number) {
  if (pct === 100) return 'bg-emerald-400'
  if (pct >= 50) return 'bg-amber-400'
  if (pct > 0) return 'bg-orange-400'
  return 'bg-red-400'
}

function barGradient(pct: number) {
  if (pct === 100) return 'linear-gradient(90deg, #34d399, #10b981)'
  if (pct >= 50) return 'linear-gradient(90deg, #fcd34d, #f59e0b)'
  return 'linear-gradient(90deg, #fb923c, #f97316)'
}

function cardStyle(pct: number, temPendencias: boolean) {
  if (temPendencias) return 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300'
  if (pct === 100) return 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:border-emerald-300'
  return 'bg-white border-gray-200 hover:border-gray-300'
}

function CardConteudo({ cliente }: { cliente: ClienteKanban }) {
  const { total, preenchidas, pct } = calcProgresso(cliente)
  const categoriasComDocs = cliente.categorias.filter(c => c.documentos.length > 0)

  return (
    <>
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot(pct)}`} />
        <p className="text-sm font-semibold text-gray-800 leading-snug truncate flex-1">
          {cliente.nome}
        </p>
      </div>

      {categoriasComDocs.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {categoriasComDocs.slice(0, 3).map(cat => (
            <span
              key={cat.id}
              className={`text-[10px] rounded-full px-2 py-0.5 font-medium leading-tight ${
                temObservacoes(cat.observacao)
                  ? 'bg-red-100 text-red-600'
                  : 'bg-teal-50 text-teal-700'
              }`}
            >
              {cat.nome}
            </span>
          ))}
          {categoriasComDocs.length > 3 && (
            <span className="text-[10px] rounded-full px-2 py-0.5 font-medium leading-tight bg-gray-100 text-gray-500">
              +{categoriasComDocs.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-400">{preenchidas}/{total} categorias</span>
          <span
            className="text-[11px] font-bold"
            style={{ color: pct === 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f97316' }}
          >
            {pct}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: barGradient(pct) }}
          />
        </div>
      </div>
    </>
  )
}

function DraggableCard({ cliente }: { cliente: ClienteKanban }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: cliente.id })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  const { pct } = calcProgresso(cliente)
  const temPendencias = cliente.categorias.some(c => temObservacoes(c.observacao))

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`select-none cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-40' : ''}`}
    >
      <Link href={`/clientes/${cliente.id}`} draggable={false}>
        <div
          className={`rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${cardStyle(pct, temPendencias)}`}
        >
          <div className="p-4">
            <CardConteudo cliente={cliente} />
          </div>
        </div>
      </Link>
    </div>
  )
}

function OverlayCard({ cliente }: { cliente: ClienteKanban }) {
  const { pct } = calcProgresso(cliente)
  const temPendencias = cliente.categorias.some(c => temObservacoes(c.observacao))

  return (
    <div
      className={`rounded-xl border shadow-2xl w-64 p-4 rotate-2 scale-105 ${cardStyle(pct, temPendencias)}`}
    >
      <CardConteudo cliente={cliente} />
    </div>
  )
}

function KanbanColuna({ coluna, clientes }: { coluna: Coluna; clientes: ClienteKanban[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: coluna.id })
  const Icon = coluna.icon

  return (
    <div className="flex-shrink-0 w-64">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3 px-0.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${coluna.iconBg} shrink-0`}>
          <Icon className="w-4 h-4" style={{ color: coluna.accentColor }} />
        </div>
        <h3 className="text-sm font-semibold text-gray-700 flex-1 leading-tight truncate">
          {coluna.label}
        </h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${coluna.badgeCls}`}>
          {clientes.length}
        </span>
        <button className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors shrink-0">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Coluna body */}
      <div
        ref={setNodeRef}
        className={`min-h-48 space-y-2.5 p-2.5 rounded-2xl transition-all duration-200 ${
          isOver
            ? `bg-gray-100 ring-2 ring-inset ${coluna.ringCls}`
            : 'bg-gray-50/80'
        }`}
      >
        {clientes.map((cliente) => (
          <DraggableCard key={cliente.id} cliente={cliente} />
        ))}
        {clientes.length === 0 && (
          <div
            className={`flex items-center justify-center h-20 rounded-xl border-2 border-dashed transition-colors ${
              isOver ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
            }`}
          >
            <p className="text-xs text-gray-300 select-none">Arraste aqui</p>
          </div>
        )}
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
      <div className="flex gap-4 overflow-x-auto pb-6">
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
