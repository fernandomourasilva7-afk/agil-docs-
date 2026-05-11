'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function criarCategoriaRepositorio(
  repositorioId: string,
  nome: string,
  clienteId: string
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const admin = createAdminClient()

  const { data: repo } = await admin
    .from('repositorios')
    .select('id, clientes!inner(contador_id)')
    .eq('id', repositorioId)
    .single()

  if (!repo) return { error: 'Repositório não encontrado' }
  const clientes = repo.clientes as unknown as { contador_id: string }
  if (clientes.contador_id !== user.id) return { error: 'Sem permissão' }

  const { data: maxOrdem } = await admin
    .from('categorias_repositorio')
    .select('ordem')
    .eq('repositorio_id', repositorioId)
    .order('ordem', { ascending: false })
    .limit(1)
    .single()

  const ordem = (maxOrdem?.ordem ?? -1) + 1

  const { data, error } = await admin
    .from('categorias_repositorio')
    .insert({ repositorio_id: repositorioId, nome: nome.trim(), ordem })
    .select('id')
    .single()

  if (error) return { error: 'Erro ao criar categoria' }

  revalidatePath(`/clientes/${clienteId}`)
  return { id: data.id }
}
