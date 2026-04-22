'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

export default function BotaoCopiar({ texto, label = 'Copiar código PIX' }: { texto: string; label?: string }) {
  const [copiado, setCopiado] = useState(false)

  function copiar() {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  return (
    <Button onClick={copiar} variant="outline" className="gap-2 w-full">
      {copiado ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      {copiado ? 'Copiado!' : label}
    </Button>
  )
}
