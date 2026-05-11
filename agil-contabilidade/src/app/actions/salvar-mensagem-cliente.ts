'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function salvarMensagemCliente(
  categoriaId: string,
  texto: string,
  clienteSlug: string
): Promise<{ error?: string }> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('categorias')
    .update({ mensagem_cliente: texto.trim() || null })
    .eq('id', categoriaId)
  if (error) return { error: 'Erro ao enviar mensagem' }
  revalidatePath(`/portal/${clienteSlug}`)
  return {}
}
