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
}) {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://agil-docs.vercel.app'

  const customerId = dados.customerId ?? (await stripe.customers.create({
    email: dados.email,
    name: dados.nome,
    metadata: { userId: dados.userId },
  })).id

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
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
