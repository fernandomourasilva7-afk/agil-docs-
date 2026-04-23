'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function registrarContador(dados: {
  email: string
  senha: string
  nome: string
  telefone: string
  crc?: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: dados.email,
    password: dados.senha,
  })

  if (error || !data.user) {
    throw new Error(error?.message ?? 'Erro ao criar conta')
  }

  const admin = createAdminClient()
  const { error: perfilError } = await admin.from('contadores').insert({
    id: data.user.id,
    nome: dados.nome.trim(),
    telefone: dados.telefone.trim(),
    crc: dados.crc ? dados.crc.trim().toUpperCase() : null,
  })

  if (perfilError) {
    throw new Error('Conta criada, mas erro ao salvar perfil. Entre em contato com o suporte.')
  }
}
