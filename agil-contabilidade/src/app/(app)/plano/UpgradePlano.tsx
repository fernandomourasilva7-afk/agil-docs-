'use client'

import { useState } from 'react'
import { PLANOS, PlanoKey } from '@/lib/planos'
import { contratarPlano } from '@/app/actions/criar-assinatura'
import { Loader2, ExternalLink, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

export default function UpgradePlano({ planosSuperiores }: { planosSuperiores: PlanoKey[] }) {
  const [planoEscolhido, setPlanoEscolhido] = useState<PlanoKey | null>(null)
  const [cpf, setCpf] = useState('')
  const [carregando, setCarregando] = useState(false)

  function formatarCpf(v: string) {
    return v
      .replace(/\D/g, '')
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  async function handleContratar(e: React.FormEvent) {
    e.preventDefault()
    if (!planoEscolhido) return
    setCarregando(true)
    try {
      const resultado = await contratarPlano({ plano: planoEscolhido, cpf })
      if (resultado.error) {
        toast.error(resultado.error)
        return
      }
      if (resultado.url) {
        toast.success('Assinatura criada! Abrindo link de pagamento...')
        window.open(resultado.url, '_blank')
        setPlanoEscolhido(null)
        setCpf('')
      } else {
        toast.success('Assinatura criada! Você receberá o boleto por e-mail.')
        setPlanoEscolhido(null)
        setCpf('')
      }
    } finally {
      setCarregando(false)
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
                  onClick={() => setPlanoEscolhido(planoEscolhido === key ? null : key)}
                  className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors shrink-0"
                >
                  <CreditCard className="w-4 h-4" />
                  Contratar
                </button>
              </div>

              {/* Formulário inline de CPF */}
              {planoEscolhido === key && (
                <form onSubmit={handleContratar} className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF (necessário para emitir cobrança)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(formatarCpf(e.target.value))}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Usado apenas para identificação na plataforma de pagamento.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={carregando}
                      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {carregando
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <ExternalLink className="w-4 h-4" />
                      }
                      {carregando ? 'Gerando...' : 'Ir para pagamento'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlanoEscolhido(null)}
                      className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Após o pagamento, seu plano é ativado automaticamente. Cobrança mensal via boleto ou PIX.
      </p>
    </div>
  )
}
