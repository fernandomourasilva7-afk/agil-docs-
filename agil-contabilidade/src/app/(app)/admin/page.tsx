export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, TrendingUp, Crown, Sparkles, BarChart2, Clock } from 'lucide-react'
import { PLANOS, PlanoKey } from '@/lib/planos'

const ADMIN_EMAIL = 'fernandomourasilva7@gmail.com'

const PLANO_COR: Record<PlanoKey, string> = {
  free:         'bg-slate-100 text-slate-600',
  starter:      'bg-blue-100 text-blue-700',
  profissional: 'bg-purple-100 text-purple-700',
  escritorio:   'bg-teal-100 text-teal-700',
}

const PLANO_ICONE: Record<PlanoKey, typeof Clock> = {
  free:         Clock,
  starter:      Sparkles,
  profissional: BarChart2,
  escritorio:   Crown,
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const { data: contadores } = await supabase
    .from('contadores')
    .select('id, nome, email, telefone, crc, plano, created_at')
    .order('created_at', { ascending: false })

  const todos = contadores ?? []
  const total = todos.length

  const porPlano: Record<PlanoKey, number> = {
    free: 0, starter: 0, profissional: 0, escritorio: 0,
  }
  todos.forEach(c => {
    const p = (c.plano ?? 'free') as PlanoKey
    if (p in porPlano) porPlano[p]++
  })

  const receitaMensal =
    (porPlano.starter * PLANOS.starter.preco) +
    (porPlano.profissional * PLANOS.profissional.preco) +
    (porPlano.escritorio * PLANOS.escritorio.preco)

  const assinantes = total - porPlano.free

  const kpis = [
    { label: 'Total de Contadores', valor: total, sub: 'cadastrados no sistema', icon: Users, cor: 'bg-blue-50 text-blue-600' },
    { label: 'Assinantes Pagos', valor: assinantes, sub: `${porPlano.free} no plano gratuito`, icon: Crown, cor: 'bg-teal-50 text-teal-600' },
    { label: 'Receita Mensal', valor: formatBRL(receitaMensal), sub: 'assinaturas ativas', icon: TrendingUp, cor: 'bg-green-50 text-green-600' },
    { label: 'Taxa de Conversão', valor: `${total > 0 ? Math.round((assinantes / total) * 100) : 0}%`, sub: 'free → plano pago', icon: Sparkles, cor: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-slate-900 text-white rounded-xl p-2">
          <Crown className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Painel Admin</h1>
          <p className="text-sm text-gray-500 mt-0.5">Visão geral do Ágil Docs como negócio</p>
        </div>
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

      {/* Distribuição por plano */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(Object.keys(PLANOS) as PlanoKey[]).map((key) => {
          const info = PLANOS[key]
          const qtd = porPlano[key]
          const Icone = PLANO_ICONE[key]
          const receita = info.preco * qtd
          return (
            <div key={key} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PLANO_COR[key]}`}>
                  {info.label}
                </span>
                <Icone className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">{qtd}</div>
              <div className="text-xs text-gray-400">contadores</div>
              {info.preco > 0 && (
                <div className="text-xs font-semibold text-teal-600 mt-2">
                  {formatBRL(receita)}/mês
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lista de contadores */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Todos os contadores</h2>
          <p className="text-sm text-gray-400 mt-0.5">{total} cadastrado{total !== 1 ? 's' : ''}</p>
        </div>

        {total === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum contador cadastrado ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todos.map((c) => {
              const plano = (c.plano ?? 'free') as PlanoKey
              const Icone = PLANO_ICONE[plano]
              return (
                <div key={c.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-slate-600">
                      {(c.nome ?? '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{c.nome}</div>
                    <div className="text-xs text-gray-400 truncate">{c.email}</div>
                    {c.crc && <div className="text-xs text-gray-400">{c.crc}</div>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${PLANO_COR[plano]}`}>
                      <Icone className="w-3 h-3" />
                      {PLANOS[plano].label}
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
