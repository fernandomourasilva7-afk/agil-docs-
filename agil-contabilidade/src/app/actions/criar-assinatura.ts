'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { criarAssinatura } from '@/lib/mercadopago'
import { PLANOS, PlanoKey } from '@/lib/planos'

export async function contratarPlano(dados: {
  plano: PlanoKey
}): Promise<{ error?: string; url?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

    const { data: contador } = await supabase
      .from('contadores')
      .select('nome, plano')
      .eq('id', user.id)
      .single()

    if (!contador) return { error: 'Perfil não encontrado.' }

    const info = PLANOS[dados.plano]
    if (!info || info.preco === 0) return { error: 'Plano inválido.' }

    const result = await criarAssinatura({
      email: user.email!,
      plano: info.label,
      valor: info.preco,
    })

    const admin = createAdminClient()
    await admin
      .from('contadores')
      .update({ mp_subscription_id: result.id })
      .eq('id', user.id)

    return { url: result.checkoutUrl ?? undefined }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro inesperado.' }
  }
}
