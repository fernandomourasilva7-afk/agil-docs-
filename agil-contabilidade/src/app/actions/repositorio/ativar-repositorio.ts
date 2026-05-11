'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function ativarRepositorio(
  clienteId: string,
  tipo: 'pf' | 'pj',
  ativo: boolean
): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id')
    .eq('id', clienteId)
    .eq('contador_id', user.id)
    .single()

  if (!cliente) return { error: 'Cliente não encontrado' }

  const admin = createAdminClient()

  if (ativo) {
    const { data, error } = await admin
      .from('repositorios')
      .upsert({ cliente_id: clienteId, tipo }, { onConflict: 'cliente_id,tipo' })
      .select('id')
      .single()
    if (error || !data) return { error: 'Erro ao ativar repositório' }
    revalidatePath(`/clientes/${clienteId}`)
    return { id: data.id }
  } else {
    const { error } = await admin
      .from('repositorios')
      .delete()
      .eq('cliente_id', clienteId)
      .eq('tipo', tipo)
    if (error) return { error: 'Erro ao desativar repositório' }
  }

  revalidatePath(`/clientes/${clienteId}`)
  return {}
}
