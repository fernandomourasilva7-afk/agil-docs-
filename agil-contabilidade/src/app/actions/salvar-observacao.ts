'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function salvarObservacao(categoriaId: string, observacao: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: cat } = await supabase
    .from('categorias')
    .select('cliente_id, clientes!inner(contador_id)')
    .eq('id', categoriaId)
    .single()

  if (!cat) throw new Error('Categoria não encontrada')

  const clientes = cat.clientes as unknown as { contador_id: string }
  if (clientes.contador_id !== user.id) throw new Error('Sem permissão')

  const { error } = await supabase
    .from('categorias')
    .update({ observacao: observacao.trim() || null })
    .eq('id', categoriaId)

  if (error) throw error

  if (observacao.trim()) {
    await supabase
      .from('clientes')
      .update({ status: 'falta_documentos' })
      .eq('id', cat.cliente_id)
  }

  revalidatePath(`/clientes/${cat.cliente_id}`)
  revalidatePath('/dashboard')
}
