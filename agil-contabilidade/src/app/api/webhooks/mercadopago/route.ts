import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buscarAssinatura } from '@/lib/mercadopago'

const PLANO_POR_VALOR: Record<number, string> = {
  79: 'starter',
  199: 'profissional',
  399: 'escritorio',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.type !== 'subscription_preapproval') {
      return NextResponse.json({ ok: true })
    }

    const preapprovalId = body.data?.id as string | undefined
    if (!preapprovalId) return NextResponse.json({ ok: true })

    const preapproval = await buscarAssinatura(preapprovalId)

    if (preapproval.status !== 'authorized') {
      return NextResponse.json({ ok: true })
    }

    const valor = Math.round(preapproval.auto_recurring?.transaction_amount ?? 0)
    const plano = PLANO_POR_VALOR[valor]
    if (!plano) return NextResponse.json({ ok: true })

    const admin = createAdminClient()

    const { data: contador } = await admin
      .from('contadores')
      .select('id')
      .eq('mp_subscription_id', preapprovalId)
      .single()

    if (!contador) {
      console.error('Webhook MP: contador não encontrado para preapproval', preapprovalId)
      return NextResponse.json({ ok: true })
    }

    await admin
      .from('contadores')
      .update({ plano })
      .eq('id', contador.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook MP erro:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
