'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { criarCliente, criarAssinatura } from '@/lib/asaas'
import { PLANOS, PlanoKey } from '@/lib/planos'

function proximaData() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export async function contratarPlano(dados: {
  plano: PlanoKey
  cpf: string
}): Promise<{ error?: string; url?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

    const { data: contador } = await supabase
      .from('contadores')
      .select('nome, asaas_customer_id, plano')
      .eq('id', user.id)
      .single()

    if (!contador) return { error: 'Perfil não encontrado.' }

    const admin = createAdminClient()

    const info = PLANOS[dados.plano]
    if (!info || info.preco === 0) return { error: 'Plano inválido.' }

    // Limpa CPF (só dígitos)
    const cpf = dados.cpf.replace(/\D/g, '')
    if (cpf.length !== 11) return { error: 'CPF inválido. Digite os 11 dígitos.' }

    // Cria ou reutiliza o cliente no Asaas
    let customerId = contador.asaas_customer_id

    if (!customerId) {
      const cliente = await criarCliente({
        name: contador.nome,
        email: user.email!,
        cpfCnpj: cpf,
      })

      if (cliente.errors?.length) {
        const msg = cliente.errors[0]?.description ?? 'Erro ao criar cliente no Asaas.'
        return { error: msg }
      }

      customerId = cliente.id

      // Salva o ID do cliente Asaas e o CPF
      await admin.from('contadores').update({
        asaas_customer_id: customerId,
        cpf,
      }).eq('id', user.id)
    }

    // Cria a assinatura
    const assinatura = await criarAssinatura({
      customer: customerId,
      billingType: 'BOLETO',
      value: info.preco,
      nextDueDate: proximaData(),
      cycle: 'MONTHLY',
      description: `Ágil Docs — Plano ${info.label}`,
    })

    if (assinatura.errors?.length) {
      const msg = assinatura.errors[0]?.description ?? 'Erro ao criar assinatura.'
      return { error: msg }
    }

    // Retorna o link de pagamento da primeira cobrança
    const linkPagamento = assinatura.paymentLink ?? assinatura.bankSlipUrl ?? null

    return { url: linkPagamento ?? undefined }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro inesperado.' }
  }
}
