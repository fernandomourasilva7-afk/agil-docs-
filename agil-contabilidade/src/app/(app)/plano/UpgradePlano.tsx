'use client'

import { useState } from 'react'
import { PLANOS, PlanoKey } from '@/lib/planos'
import { contratarPlano } from '@/app/actions/criar-assinatura'
import { Loader2, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

export default function UpgradePlano({ planosSuperiores }: { planosSuperiores: PlanoKey[] }) {
  const [carregando, setCarregando] = useState<PlanoKey | null>(null)

  async function handleContratar(plano: PlanoKey) {
    setCarregando(plano)
    try {
      const resultado = await contratarPlano({ plano })
      if (resultado.error) {
        toast.error(resultado.error)
        return
      }
      if (resultado.url) {
        window.open(resultado.url, '_blank')
      } else {
        toast.success('Assinatura criada! Você receberá as instruções por e-mail.')
      }
    } finally {
      setCarregando(null)
    }
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Fazer upgrade
      </h2>
      <div className="space-y-3">
        {planosSuperiores.map((key) => {
          const info = PLANOS[key]
          const limiteTexto = info.limite >= 9999 ? 'Ilimitado' : `${info.limite} clientes`
          const loading = carregando === key
          return (
            <div
              key={key}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-gray-900">{info.label}</div>
                  <div className="text-sm text-gray-500">
                    {limiteTexto} · R${info.preco}/mês
                  </div>
                </div>
                <button
                  onClick={() => handleContratar(key)}
                  disabled={!!carregando}
                  className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors shrink-0 disabled:opacity-60"
                >
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CreditCard className="w-4 h-4" />
                  }
                  {loading ? 'Aguarde...' : 'Assinar'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Pagamento via cartão de crédito pelo Stripe. Cobrança mensal automática.
      </p>
    </div>
  )
}
