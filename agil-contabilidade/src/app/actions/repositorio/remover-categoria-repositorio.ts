'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function removerCategoriaRepositorio(
  categoriaId: string,
  clienteId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: cat } = await supabase
    .from('categorias_repositorio')
    .select('id, repositorios!inner(clientes!inner(contador_id))')
    .eq('id', categoriaId)
    .single()

  if (!cat) return { error: 'Categoria não encontrada' }
  const repositorios = cat.repositorios as unknown as { clientes: { contador_id: string } }
  if (repositorios.clientes.contador_id !== user.id) return { error: 'Sem permissão' }

  const { error } = await supabase
    .from('categorias_repositorio')
    .delete()
    .eq('id', categoriaId)

  if (error) return { error: 'Erro ao remover categoria' }

  revalidatePath(`/clientes/${clienteId}`)
  return {}
}
