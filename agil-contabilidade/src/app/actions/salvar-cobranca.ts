'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type DadosPix = {
  chave: string
  tipo: string
  nome: string
  cidade: string
  valor: number
}

export async function salvarCobranca(clienteId: string, dados: DadosPix) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .from('clientes')
    .update({
      pix_chave: dados.chave,
      pix_tipo: dados.tipo,
      pix_nome: dados.nome,
      pix_cidade: dados.cidade,
      pix_valor: dados.valor,
    })
    .eq('id', clienteId)
    .eq('contador_id', user.id)

  if (error) throw error

  revalidatePath(`/clientes/${clienteId}`)
}
