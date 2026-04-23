export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PLANOS, PlanoKey } from '@/lib/planos'
import { MessageCircle, Sparkles } from 'lucide-react'

// TODO: substituir pelo seu número de WhatsApp (só dígitos, com DDD e código do Brasil)
const WHATSAPP = '5511999999999'

export default async function MeuPlanoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [{ data: contadorData }, { count: totalClientes }] = await Promise.all([
    supabase.from('contadores').select('plano').eq('id', user.id).single(),
    supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('contador_id', user.id),
  ])

  const planoAtual = ((contadorData?.plano) ?? 'free') as PlanoKey
  const infoPlano = PLANOS[planoAtual]
  const usados = totalClientes ?? 0
  const limite = infoPlano.limite
  const ilimitado = limite >= 9999
  const percentual = ilimitado ? 0 : Math.min(100, Math.round((usados / limite) * 100))

  const ordemPlanos: PlanoKey[] = ['free', 'starter', 'profissional', 'escritorio']
  const indiceAtual = ordemPlanos.indexOf(planoAtual)
  const planosSuperiores = ordemPlanos.slice(indiceAtual + 1)

  return (
    <div className="px-4 py-6 lg:px-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Meu Plano</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gerencie sua assinatura do Ágil Docs</p>
      </div>

      {/* Plano atual */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-500" />
            <span className="font-semibold text-gray-900">Plano atual</span>
          </div>
          <span className="bg-teal-100 text-teal-700 text-sm font-semibold px-3 py-1 rounded-full">
            {infoPlano.label}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Clientes cadastrados</span>
            <span className="font-medium text-gray-900">
              {usados}{!ilimitado ? ` de ${limite}` : ' (ilimitado)'}
            </span>
          </div>
          {!ilimitado && (
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  percentual >= 100
                    ? 'bg-red-500'
                    : percentual >= 80
                    ? 'bg-yellow-500'
                    : 'bg-teal-500'
                }`}
                style={{ width: `${percentual}%` }}
              />
            </div>
          )}
          {percentual >= 80 && percentual < 100 && (
            <p className="text-xs text-yellow-600">Você está próximo do limite do plano.</p>
          )}
          {percentual >= 100 && (
            <p className="text-xs text-red-600 font-medium">
              Limite atingido. Faça upgrade para adicionar mais clientes.
            </p>
          )}
        </div>
      </div>

      {/* Opções de upgrade */}
      {planosSuperiores.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Fazer upgrade
          </h2>
          <div className="space-y-3">
            {planosSuperiores.map((key) => {
              const info = PLANOS[key]
              const limiteTexto = info.limite >= 9999 ? 'Ilimitado' : `${info.limite} clientes`
              return (
                <div
                  key={key}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div>
                    <div className="font-semibold text-gray-900">{info.label}</div>
                    <div className="text-sm text-gray-500">
                      {limiteTexto} · R${info.preco}/mês
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Quero contratar o plano ${info.label} do Ágil Docs por R$${info.preco}/mês. Meu e-mail é: `)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contratar
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-teal-50 rounded-xl border border-teal-200 p-4 text-center">
          <p className="text-teal-700 font-semibold">Você está no plano máximo!</p>
          <p className="text-teal-600 text-sm mt-1">
            Clientes ilimitados e todos os recursos disponíveis.
          </p>
        </div>
      )}

      <div className="mt-6">
        <Link href="/planos" className="text-sm text-teal-600 hover:underline">
          Ver página completa de planos →
        </Link>
      </div>
    </div>
  )
}
