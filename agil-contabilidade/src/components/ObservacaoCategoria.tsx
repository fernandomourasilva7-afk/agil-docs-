'use client'

import { useState } from 'react'
import { salvarObservacao } from '@/app/actions/salvar-observacao'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { MessageSquare, Loader2, Check } from 'lucide-react'

export default function ObservacaoCategoria({
  catId,
  observacaoAtual,
}: {
  catId: string
  observacaoAtual: string | null
}) {
  const [texto, setTexto] = useState(observacaoAtual ?? '')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  async function handleSalvar() {
    setSalvando(true)
    setSalvo(false)
    try {
      await salvarObservacao(catId, texto)
      setSalvo(true)
      toast.success('Observação salva!')
      setTimeout(() => setSalvo(false), 2000)
    } catch {
      toast.error('Erro ao salvar observação.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
        <MessageSquare className="w-3.5 h-3.5" />
        Observação para o cliente
      </p>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Ex: Falta o informe de rendimentos do banco Itaú..."
        rows={2}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 placeholder-gray-300"
      />
      <Button
        size="sm"
        variant="outline"
        className="mt-1.5 gap-1.5 text-xs"
        onClick={handleSalvar}
        disabled={salvando}
      >
        {salvando ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : salvo ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <MessageSquare className="w-3.5 h-3.5" />
        )}
        {salvo ? 'Salvo!' : 'Salvar observação'}
      </Button>
    </div>
  )
}
