'use client'

import { useState } from 'react'
import { salvarObservacao } from '@/app/actions/salvar-observacao'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { MessageSquare, Loader2, Check, AlertCircle, X } from 'lucide-react'

function parseObservacoes(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter(Boolean)
  } catch {}
  return [raw]
}

export default function ObservacaoCategoria({
  catId,
  observacaoAtual,
}: {
  catId: string
  observacaoAtual: string | null
}) {
  const [observacoes, setObservacoes] = useState<string[]>(() => parseObservacoes(observacaoAtual))
  const [texto, setTexto] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  async function persistir(lista: string[]) {
    const payload = lista.length > 0 ? JSON.stringify(lista) : ''
    await salvarObservacao(catId, payload)
  }

  async function handleSalvar() {
    if (!texto.trim()) return
    setSalvando(true)
    setSalvo(false)
    try {
      const novaLista = [...observacoes, texto.trim()]
      await persistir(novaLista)
      setObservacoes(novaLista)
      setTexto('')
      setSalvo(true)
      toast.success('Observação salva!')
      setTimeout(() => setSalvo(false), 2000)
    } catch {
      toast.error('Erro ao salvar observação.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleRemover(index: number) {
    const novaLista = observacoes.filter((_, i) => i !== index)
    try {
      await persistir(novaLista)
      setObservacoes(novaLista)
      toast.success('Observação removida.')
    } catch {
      toast.error('Erro ao remover observação.')
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
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-teal-300 text-gray-700 placeholder-gray-300"
      />
      <div className="mt-1.5">
        <Button
          size="sm"
          className="gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white"
          onClick={handleSalvar}
          disabled={salvando || !texto.trim()}
        >
          {salvando ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : salvo ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <MessageSquare className="w-3.5 h-3.5" />
          )}
          {salvo ? 'Salvo!' : 'Salvar observação'}
        </Button>
      </div>
      {observacoes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {observacoes.map((obs, i) => (
            <div
              key={i}
              className="flex items-start gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 max-w-full"
            >
              <AlertCircle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
              <span className="flex-1">{obs}</span>
              <button
                onClick={() => handleRemover(i)}
                className="ml-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                aria-label="Remover observação"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
