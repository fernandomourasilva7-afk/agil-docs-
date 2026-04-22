'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { devolverParaCliente } from '@/app/actions/devolver-para-cliente'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { RotateCcw, Loader2 } from 'lucide-react'

export default function DevolverCliente({ clienteId }: { clienteId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDevolver() {
    setLoading(true)
    try {
      await devolverParaCliente(clienteId)
      toast.success('Cliente notificado — status atualizado para "Falta Documentos".')
      router.push('/dashboard')
    } catch {
      toast.error('Erro ao devolver para o cliente.')
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="font-semibold text-orange-800 text-sm">Faltou algo?</p>
        <p className="text-xs text-orange-600 mt-0.5">
          Adicione observações nas categorias acima e devolva para o cliente revisar.
        </p>
      </div>
      <Button
        onClick={handleDevolver}
        disabled={loading}
        className="gap-2 bg-orange-500 hover:bg-orange-600 text-white shrink-0"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
        Devolver ao cliente
      </Button>
    </div>
  )
}
