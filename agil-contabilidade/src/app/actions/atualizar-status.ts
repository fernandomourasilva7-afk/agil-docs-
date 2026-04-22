'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const STATUS_VALIDOS = [
  'link_enviado',
  'falta_documentos',
  'documentos_enviados',
  'fazendo_declaracao',
  'ir_finalizado',
]

export async function atualizarStatus(clienteId: string, novoStatus: string) {
  if (!STATUS_VALIDOS.includes(novoStatus)) {
    throw new Error('Status inválido')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .from('clientes')
    .update({ status: novoStatus })
    .eq('id', clienteId)
    .eq('contador_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard')
}
