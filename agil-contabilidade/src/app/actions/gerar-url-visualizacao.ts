'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function gerarUrlVisualizacao(storagePath: string): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: doc } = await supabase
    .from('documentos')
    .select('id, clientes!inner(contador_id)')
    .eq('storage_path', storagePath)
    .single()

  if (!doc) return { error: 'Documento não encontrado' }

  const clientes = doc.clientes as unknown as { contador_id: string }
  if (clientes.contador_id !== user.id) return { error: 'Sem permissão' }

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('documentos')
    .createSignedUrl(storagePath, 3600)

  if (error || !data) return { error: 'Erro ao gerar URL de visualização' }
  return { url: data.signedUrl }
}
