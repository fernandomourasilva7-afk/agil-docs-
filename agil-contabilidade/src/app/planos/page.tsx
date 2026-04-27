import Link from 'next/link'
import Image from 'next/image'
import { Check, MessageCircle, ArrowRight } from 'lucide-react'

// TODO: substituir pelo seu número de WhatsApp (só dígitos, com DDD e código do Brasil)
const WHATSAPP = '5583987095584'

const planos = [
  {
    key: 'free',
    nome: 'Free',
    preco: 0,
    limiteTexto: '10 clientes',
    destaque: false,
    features: [
      'Portal de upload sem login',
      '8 categorias do IR',
      'Link único por cliente',
      'Painel Kanban de status',
      'Cobrança via PIX',
    ],
  },
  {
    key: 'starter',
    nome: 'Starter',
    preco: 79,
    limiteTexto: '50 clientes',
    destaque: false,
    features: [
      'Portal de upload sem login',
      '8 categorias do IR',
      'Link único por cliente',
      'Painel Kanban de status',
      'Cobrança via PIX',
      'Suporte por e-mail',
    ],
  },
  {
    key: 'profissional',
    nome: 'Profissional',
    preco: 199,
    limiteTexto: '200 clientes',
    destaque: true,
    features: [
      'Portal de upload sem login',
      '8 categorias do IR',
      'Link único por cliente',
      'Painel Kanban de status',
      'Cobrança via PIX',
      'Suporte prioritário',
    ],
  },
  {
    key: 'escritorio',
    nome: 'Escritório',
    preco: 399,
    limiteTexto: 'Clientes ilimitados',
    destaque: false,
    features: [
      'Portal de upload sem login',
      '8 categorias do IR',
      'Link único por cliente',
      'Painel Kanban de status',
      'Cobrança via PIX',
      'Suporte dedicado',
      'Configuração assistida',
    ],
  },
]

export default function PlanosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Header */}
      <div className="pt-12 pb-10 px-4 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
          <Image src="/logo.png" alt="Ágil Docs" width={36} height={36} className="w-9 h-9" />
          <span className="text-white font-bold text-xl">Ágil Docs</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Planos e Preços</h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          Comece grátis. Faça upgrade quando precisar de mais clientes.
        </p>
      </div>

      {/* Plans grid */}
      <div className="px-4 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {planos.map((plano) => (
            <div
              key={plano.key}
              className={`relative bg-white rounded-2xl p-6 shadow-xl flex flex-col ${
                plano.destaque ? 'ring-2 ring-teal-500' : ''
              }`}
            >
              {plano.destaque && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Mais popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900">{plano.nome}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  {plano.preco === 0 ? (
                    <span className="text-3xl font-bold text-gray-900">Grátis</span>
                  ) : (
                    <>
                      <span className="text-sm text-gray-500 self-start mt-1">R$</span>
                      <span className="text-3xl font-bold text-gray-900">{plano.preco}</span>
                      <span className="text-sm text-gray-500">/mês</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-teal-600 font-medium mt-1">{plano.limiteTexto}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plano.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {plano.preco === 0 ? (
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium h-10 rounded-lg transition-colors"
                >
                  Começar grátis
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Quero contratar o plano ${plano.nome} do Ágil Docs por R$${plano.preco}/mês. Meu e-mail é: `)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 w-full text-white text-sm font-medium h-10 rounded-lg transition-colors ${
                    plano.destaque
                      ? 'bg-teal-600 hover:bg-teal-700'
                      : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contratar via WhatsApp
                </a>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          Pagamento via PIX. Acesso liberado em minutos após a confirmação.
        </p>
      </div>
    </div>
  )
}
