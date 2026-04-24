import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const PLANO_POR_VALOR: Record<number, string> = {
  79:  'starter',
  199: 'profissional',
  399: 'escritorio',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, payment } = body

    // Só processa pagamentos confirmados
    if (event !== 'PAYMENT_CONFIRMED' && event !== 'PAYMENT_RECEIVED') {
      return NextResponse.json({ ok: true })
    }

    if (!payment?.subscription || !payment?.value) {
      return NextResponse.json({ ok: true })
    }

    const valor = Math.round(payment.value)
    const plano = PLANO_POR_VALOR[valor]
    if (!plano) {
      return NextResponse.json({ ok: true })
    }

    const admin = createAdminClient()

    // Busca o contador pelo asaas_customer_id
    const { data: contador } = await admin
      .from('contadores')
      .select('id')
      .eq('asaas_customer_id', payment.customer)
      .single()

    if (!contador) {
      console.error('Webhook Asaas: contador não encontrado para customer', payment.customer)
      return NextResponse.json({ ok: true })
    }

    // Atualiza o plano
    await admin
      .from('contadores')
      .update({ plano, asaas_subscription_id: payment.subscription })
      .eq('id', contador.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook Asaas erro:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
