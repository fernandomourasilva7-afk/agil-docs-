'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function registrarContador(dados: {
  email: string
  senha: string
  nome: string
  telefone: string
  crc?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: dados.email,
    password: dados.senha,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Não foi possível criar o usuário. Tente novamente.' }
  }

  const admin = createAdminClient()
  const { error: perfilError } = await admin.from('contadores').insert({
    id: data.user.id,
    nome: dados.nome.trim(),
    telefone: dados.telefone.trim(),
    crc: dados.crc ? dados.crc.trim().toUpperCase() : null,
    plano: 'free',
  })

  if (perfilError) {
    return { error: `Erro ao salvar perfil: ${perfilError.message}` }
  }

  return {}
}
