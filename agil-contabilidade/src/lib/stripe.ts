import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
})

export async function criarCheckout(dados: {
  userId: string
  email: string
  nome: string
  plano: string
  planoLabel: string
  valor: number
  customerId?: string
  cpfCnpj?: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://agil-docs.vercel.app'

  let customerId = dados.customerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dados.email,
      name: dados.nome,
      metadata: { userId: dados.userId },
    })
    customerId = customer.id
    if (dados.cpfCnpj) {
      const digits = dados.cpfCnpj.replace(/\D/g, '')
      await stripe.customers.createTaxId(customerId, {
        type: digits.length === 14 ? 'br_cnpj' : 'br_cpf',
        value: digits,
      })
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card', 'pix'],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: { name: `Ágil Docs — Plano ${dados.planoLabel}` },
          unit_amount: dados.valor * 100,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/plano?sucesso=1`,
    cancel_url: `${baseUrl}/plano`,
    metadata: { userId: dados.userId, plano: dados.plano },
  })

  return { customerId, checkoutUrl: session.url }
}
