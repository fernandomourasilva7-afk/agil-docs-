import MercadoPagoConfig, { PreApproval } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? '',
})

const preApproval = new PreApproval(client)

export async function criarAssinatura(dados: {
  email: string
  plano: string
  valor: number
}) {
  const result = await preApproval.create({
    body: {
      reason: `Ágil Docs — Plano ${dados.plano}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: dados.valor,
        currency_id: 'BRL',
      },
      back_url: `${process.env.NEXT_PUBLIC_URL ?? 'https://agil-docs.vercel.app'}/plano`,
      payer_email: dados.email,
      status: 'pending',
    },
  })
  return { id: result.id, checkoutUrl: result.init_point }
}

export async function buscarAssinatura(preapprovalId: string) {
  return preApproval.get({ id: preapprovalId })
}

export async function cancelarAssinatura(preapprovalId: string) {
  return preApproval.update({
    id: preapprovalId,
    body: { status: 'cancelled' },
  })
}
