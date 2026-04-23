export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, FileCheck, CheckCircle2, TrendingUp, Clock } from 'lucide-react'
import MetricasCharts from '@/components/MetricasCharts'

const STATUS_CONFIG = [
  { key: 'link_enviado',        nome: 'Link Enviado',      cor: '#3b82f6' },
  { key: 'falta_documentos',    nome: 'Falta Documentos',  cor: '#f59e0b' },
  { key: 'documentos_enviados', nome: 'Docs Enviados',     cor: '#8b5cf6' },
  { key: 'fazendo_declaracao',  nome: 'Em Declaração',     cor: '#f97316' },
  { key: 'ir_finalizado',       nome: 'Concluído',         cor: '#14b8a6' },
]

function nomeMes(d: Date) {
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

function ultimos6Meses() {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (5 - i))
    return { mes: nomeMes(d), ano: d.getFullYear(), mesNum: d.getMonth() }
  })
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function MetricasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: clientes } = await supabase
    .from('clientes')
    .select('status, created_at, valor_honorario, pagamento_confirmado')
    .eq('contador_id', user.id)

  const todos = clientes ?? []

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const total = todos.length
  const docsRecebidos = todos.filter(c =>
    ['documentos_enviados', 'fazendo_declaracao', 'ir_finalizado'].includes(c.status ?? '')
  ).length
  const concluidos = todos.filter(c => c.status === 'ir_finalizado').length
  const emAndamento = total - concluidos

  const temHonorario = todos.some(c => c.valor_honorario && c.valor_honorario > 0)
  const receitaConfirmada = todos
    .filter(c => c.pagamento_confirmado && c.valor_honorario)
    .reduce((s, c) => s + (c.valor_honorario ?? 0), 0)
  const receitaPendente = todos
    .filter(c => !c.pagamento_confirmado && c.valor_honorario && c.valor_honorario > 0)
    .reduce((s, c) => s + (c.valor_honorario ?? 0), 0)

  // ── Status chart data ────────────────────────────────────────────────────
  const statusCounts: Record<string, number> = {}
  todos.forEach(c => {
    const s = c.status ?? 'link_enviado'
    statusCounts[s] = (statusCounts[s] ?? 0) + 1
  })
  const statusData = STATUS_CONFIG.map(s => ({
    nome: s.nome,
    total: statusCounts[s.key] ?? 0,
    cor: s.cor,
  }))

  // ── Clientes por mês ─────────────────────────────────────────────────────
  const meses = ultimos6Meses()
  todos.forEach(c => {
    const d = new Date(c.created_at)
    const idx = meses.findIndex(m => m.ano === d.getFullYear() && m.mesNum === d.getMonth())
    if (idx !== -1) (meses[idx] as typeof meses[number] & { count?: number }).count = ((meses[idx] as typeof meses[number] & { count?: number }).count ?? 0) + 1
  })
  const mesesData = meses.map(m => ({ mes: m.mes, clientes: (m as typeof m & { count?: number }).count ?? 0 }))

  // ── Receita por mês ──────────────────────────────────────────────────────
  const receitaMesData = meses.map(m => {
    const clientesMes = todos.filter(c => {
      const d = new Date(c.created_at)
      return d.getFullYear() === m.ano && d.getMonth() === m.mesNum
    })
    return {
      mes: m.mes,
      confirmada: clientesMes.filter(c => c.pagamento_confirmado).reduce((s, c) => s + (c.valor_honorario ?? 0), 0),
      pendente: clientesMes.filter(c => !c.pagamento_confirmado && (c.valor_honorario ?? 0) > 0).reduce((s, c) => s + (c.valor_honorario ?? 0), 0),
    }
  })

  const kpis = [
    {
      label: 'Total de Clientes',
      valor: total,
      sub: 'cadastrados',
      icon: Users,
      cor: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Docs Recebidos',
      valor: docsRecebidos,
      sub: `${total > 0 ? Math.round((docsRecebidos / total) * 100) : 0}% do total`,
      icon: FileCheck,
      cor: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Concluídos',
      valor: concluidos,
      sub: `${emAndamento} em andamento`,
      icon: CheckCircle2,
      cor: 'bg-teal-50 text-teal-600',
    },
    temHonorario
      ? {
          label: 'Receita Confirmada',
          valor: formatBRL(receitaConfirmada),
          sub: `${formatBRL(receitaPendente)} a receber`,
          icon: TrendingUp,
          cor: 'bg-green-50 text-green-600',
        }
      : {
          label: 'Em Andamento',
          valor: emAndamento,
          sub: 'aguardando conclusão',
          icon: Clock,
          cor: 'bg-orange-50 text-orange-600',
        },
  ]

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Métricas</h1>
        <p className="text-sm text-gray-500 mt-0.5">Visão geral do seu escritório e progresso dos clientes</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${k.cor}`}>
              <k.icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-gray-900 leading-none mb-1">{k.valor}</div>
            <div className="text-xs font-medium text-gray-500">{k.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="bg-teal-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-teal-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum dado ainda</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Cadastre seus primeiros clientes para visualizar as métricas aqui.
          </p>
        </div>
      ) : (
        <MetricasCharts
          statusData={statusData}
          mesesData={mesesData}
          receitaMesData={receitaMesData}
          temHonorario={temHonorario}
        />
      )}
    </div>
  )
}
