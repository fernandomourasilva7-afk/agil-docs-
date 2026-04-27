'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { criarCheckout } from '@/lib/stripe'
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

    const result = await criarCheckout({
      userId: user.id,
      email: user.email!,
      nome: contador.nome,
      plano: dados.plano,
      planoLabel: info.label,
      valor: info.preco,
    })

    const admin = createAdminClient()
    await admin
      .from('contadores')
      .update({ stripe_customer_id: result.customerId })
      .eq('id', user.id)

    return { url: result.checkoutUrl ?? undefined }
  } catch (err: unknown) {
    console.error('Erro contratarPlano:', err)
    if (err instanceof Error) return { error: err.message }
    return { error: 'Erro inesperado.' }
  }
}
