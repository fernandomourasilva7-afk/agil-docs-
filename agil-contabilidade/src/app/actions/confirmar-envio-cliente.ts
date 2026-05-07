'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function confirmarEnvioCliente(clienteId: string): Promise<{ error?: string }> {
  const admin = createAdminClient()

  const { error } = await admin
    .from('clientes')
    .update({ declarou_envio: true, status: 'documentos_enviados' })
    .eq('id', clienteId)

  if (error) return { error: 'Erro ao confirmar envio' }
  return {}
}
