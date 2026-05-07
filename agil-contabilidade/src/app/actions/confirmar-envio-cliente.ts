'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function confirmarEnvioCliente(clienteId: string): Promise<{ error?: string }> {
  const admin = createAdminClient()

  const { count } = await admin
    .from('documentos')
    .select('id', { count: 'exact', head: true })
    .eq('cliente_id', clienteId)

  const novoStatus = count && count > 0 ? 'documentos_enviados' : 'link_enviado'

  const { error } = await admin
    .from('clientes')
    .update({ declarou_envio: true, status: novoStatus })
    .eq('id', clienteId)

  if (error) return { error: 'Erro ao confirmar envio' }
  return {}
}
