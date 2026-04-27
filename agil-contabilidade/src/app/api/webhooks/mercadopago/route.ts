import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const PLANO_POR_VALOR: Record<number, string> = {
  79: 'starter',
  199: 'profissional',
  399: 'escritorio',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // MP envia notificações de pagamento com type "payment"
    if (body.type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id as string | undefined
    if (!paymentId) return NextResponse.json({ ok: true })

    // Busca os detalhes do pagamento via API do MP
    const token = process.env.MP_ACCESS_TOKEN ?? ''
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const pagamento = await res.json()

    if (pagamento.status !== 'approved') {
      return NextResponse.json({ ok: true })
    }

    const valor = Math.round(pagamento.transaction_amount ?? 0)
    const plano = PLANO_POR_VALOR[valor]
    if (!plano) return NextResponse.json({ ok: true })

    // external_reference tem o user ID do contador
    const userId = pagamento.external_reference as string | undefined
    if (!userId) return NextResponse.json({ ok: true })

    const admin = createAdminClient()
    await admin
      .from('contadores')
      .update({ plano, mp_subscription_id: String(paymentId) })
      .eq('id', userId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook MP erro:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
