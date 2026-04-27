'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function registrarContador(dados: {
  email: string
  senha: string
  nome: string
  telefone: string
  crc?: string
  cpfCnpj: string
}): Promise<{ error?: string }> {
  try {
    const admin = createAdminClient()

    const { data, error } = await admin.auth.admin.createUser({
      email: dados.email,
      password: dados.senha,
      email_confirm: true,
    })

    if (error) {
      return { error: error.message }
    }

    if (!data.user) {
      return { error: 'Não foi possível criar o usuário. Tente novamente.' }
    }

    const { error: perfilError } = await admin.from('contadores').insert({
      id: data.user.id,
      nome: dados.nome.trim(),
      telefone: dados.telefone.trim(),
      crc: dados.crc ? dados.crc.trim().toUpperCase() : null,
      cpf_cnpj: dados.cpfCnpj.replace(/\D/g, ''),
      plano: 'free',
    })

    if (perfilError) {
      return { error: `Erro ao salvar perfil: ${perfilError.message}` }
    }

    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.' }
  }
}
