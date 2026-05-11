'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function deletarCliente(clienteId: string): Promise<{ error?: string }> {
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

  const [{ data: docs }, { data: docsRepo }, { data: docsFinais }] = await Promise.all([
    admin.from('documentos').select('storage_path').eq('cliente_id', clienteId),
    admin.from('documentos_repositorio').select('storage_path').eq('cliente_id', clienteId),
    admin.from('documentos_finais').select('storage_path').eq('cliente_id', clienteId),
  ])

  const paths = (docs ?? []).map((d) => d.storage_path)
  const pathsRepo = (docsRepo ?? []).map((d) => d.storage_path)
  const pathsFinais = (docsFinais ?? []).map((d) => d.storage_path)

  await Promise.all([
    paths.length       ? admin.storage.from('documentos').remove(paths)       : null,
    pathsRepo.length   ? admin.storage.from('repositorio').remove(pathsRepo)  : null,
    pathsFinais.length ? admin.storage.from('ir-finalizado').remove(pathsFinais) : null,
  ])

  const { error } = await admin.from('clientes').delete().eq('id', clienteId)
  if (error) return { error: 'Erro ao excluir cliente' }

  redirect('/dashboard')
}
