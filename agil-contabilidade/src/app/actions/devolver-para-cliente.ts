'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function devolverParaCliente(clienteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .from('clientes')
    .update({ declarou_envio: false, status: 'falta_documentos' })
    .eq('id', clienteId)
    .eq('contador_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard')
  revalidatePath(`/clientes/${clienteId}`)
}
