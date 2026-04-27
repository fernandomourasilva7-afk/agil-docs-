'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Crown, X } from 'lucide-react'

export default function TrialExpiredModal() {
  const [fechado, setFechado] = useState(false)
  const router = useRouter()

  if (fechado) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <button
          onClick={() => setFechado(true)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-4">
          <div className="bg-amber-100 p-4 rounded-full">
            <Crown className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        <h2 className="text-xl font-black text-gray-900 mb-2">
          Seu período gratuito encerrou
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Você utilizou os 30 dias gratuitos do Ágil Docs. Para continuar
          organizando os documentos dos seus clientes, escolha um plano.
        </p>

        <Button
          onClick={() => { setFechado(true); router.push('/plano') }}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white h-11 text-base font-semibold"
        >
          Ver planos
        </Button>

        <button
          onClick={() => setFechado(true)}
          className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Continuar sem assinar
        </button>
      </div>
    </div>
  )
}
