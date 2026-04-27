async function req(path: string, method = 'GET', body?: object) {
  const key = process.env.ASAAS_API_KEY ?? ''
  const base = 'https://www.asaas.com/api/v3'

  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      'access_token': key,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  const text = await res.text()

  if (!text) return { errors: [{ description: `Asaas: resposta vazia (HTTP ${res.status})` }] }
  try {
    return JSON.parse(text)
  } catch {
    return { errors: [{ description: `Asaas: resposta inválida (HTTP ${res.status}): ${text.slice(0, 200)}` }] }
  }
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
