const key = process.env.ASAAS_API_KEY ?? ''
const ASAAS_BASE = key.startsWith('$aact_hmlg_')
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/api/v3'

async function req(path: string, method = 'GET', body?: object) {
  const res = await fetch(`${ASAAS_BASE}${path}`, {
    method,
    headers: {
      'access_token': process.env.ASAAS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  return res.json()
}

export async function criarCliente(dados: { name: string; email: string; cpfCnpj: string }) {
  return req('/customers', 'POST', dados)
}

export async function criarAssinatura(dados: {
  customer: string
  billingType: string
  value: number
  nextDueDate: string
  cycle: string
  description: string
}) {
  return req('/subscriptions', 'POST', dados)
}

export async function buscarPagamentosAssinatura(subscriptionId: string) {
  return req(`/payments?subscription=${subscriptionId}`)
}

export async function cancelarAssinatura(subscriptionId: string) {
  return req(`/subscriptions/${subscriptionId}`, 'DELETE')
}
