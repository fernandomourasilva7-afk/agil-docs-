import { NextResponse } from 'next/server'

const URLS = [
  'https://api.asaas.com/api/v3/customers?limit=1',
  'https://sandbox.asaas.com/api/v3/customers?limit=1',
  'https://www.asaas.com/api/v3/customers?limit=1',
]

export async function GET() {
  const key = process.env.ASAAS_API_KEY ?? '(vazia)'
  const results = await Promise.all(
    URLS.map(async (url) => {
      try {
        const res = await fetch(url, {
          headers: { 'access_token': key, 'Content-Type': 'application/json' },
          cache: 'no-store',
        })
        const text = await res.text()
        return { url, status: res.status, body: text.slice(0, 300) }
      } catch (e) {
        return { url, status: 'ERRO', body: String(e) }
      }
    })
  )
  return NextResponse.json({ keyPrefix: key.slice(0, 15), results })
}
