'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { salvarCobranca } from '@/app/actions/salvar-cobranca'
import { confirmarPagamento } from '@/app/actions/confirmar-pagamento'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Upload, Loader2, FileText, X, Copy, Check,
  CheckCircle2, QrCode, Banknote,
} from 'lucide-react'

type DocFinal = { id: string; nome_arquivo: string }

type Props = {
  clienteId: string
  clienteSlug: string
  userId: string
  docsIniciais: DocFinal[]
  pixChaveInicial: string | null
  pixTipoInicial: string | null
  pixNomeInicial: string | null
  pixCidadeInicial: string | null
  pixValorInicial: number | null
  pagamentoConfirmado: boolean
  appUrl: string
}

export default function CobrancaIR({
  clienteId,
  clienteSlug,
  userId,
  docsIniciais,
  pixChaveInicial,
  pixTipoInicial,
  pixNomeInicial,
  pixCidadeInicial,
  pixValorInicial,
  pagamentoConfirmado: pagoInicial,
  appUrl,
}: Props) {
  const router = useRouter()
  const [docs, setDocs] = useState(docsIniciais)
  const [arquivos, setArquivos] = useState<File[]>([])
  const [uploadando, setUploadando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const [pixChave, setPixChave] = useState(pixChaveInicial ?? '')
  const [pixTipo, setPixTipo] = useState(pixTipoInicial ?? 'email')
  const [pixNome, setPixNome] = useState(pixNomeInicial ?? '')
  const [pixCidade, setPixCidade] = useState(pixCidadeInicial ?? '')
  const [pixValor, setPixValor] = useState(pixValorInicial?.toString() ?? '')
  const [salvando, setSalvando] = useState(false)

  const linkAtivo = !!(pixChaveInicial && pixValorInicial)
  const [pago, setPago] = useState(pagoInicial)
  const [confirmando, setConfirmando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const linkPagamento = `${appUrl}/pagamento/${clienteSlug}`

  async function handleUpload() {
    if (!arquivos.length) return
    const supabase = createClient()
    setUploadando(true)
    const novos: DocFinal[] = []

    for (const arquivo of arquivos) {
      const ext = arquivo.name.split('.').pop()
      const path = `${clienteId}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`

      const { error: errUpload } = await supabase.storage
        .from('ir-finalizado')
        .upload(path, arquivo)

      if (errUpload) {
        toast.error(`Erro ao enviar ${arquivo.name}`)
        continue
      }

      const { data: doc, error: errDB } = await supabase
        .from('documentos_finais')
        .insert({
          cliente_id: clienteId,
          contador_id: userId,
          nome_arquivo: arquivo.name,
          storage_path: path,
          tamanho: arquivo.size,
          tipo: arquivo.type,
        })
        .select('id, nome_arquivo')
        .single()

      if (errDB || !doc) {
        toast.error(`Erro ao registrar ${arquivo.name}`)
        continue
      }

      novos.push(doc as DocFinal)
    }

    setDocs(prev => [...prev, ...novos])
    setArquivos([])
    setUploadando(false)
    if (novos.length) toast.success(`${novos.length} arquivo(s) enviado(s)!`)
  }

  async function handleSalvarPix() {
    if (!pixChave.trim() || !pixNome.trim() || !pixCidade.trim() || !pixValor) {
      toast.warning('Preencha todos os campos PIX.')
      return
    }
    setSalvando(true)
    try {
      await salvarCobranca(clienteId, {
        chave: pixChave.trim(),
        tipo: pixTipo,
        nome: pixNome.trim(),
        cidade: pixCidade.trim(),
        valor: parseFloat(pixValor),
      })
      toast.success('Dados PIX salvos! Link gerado.')
      router.refresh()
    } catch {
      toast.error('Erro ao salvar dados PIX.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleConfirmar() {
    setConfirmando(true)
    try {
      await confirmarPagamento(clienteId)
      setPago(true)
      toast.success('Pagamento confirmado! Documentos liberados para o cliente.')
    } catch {
      toast.error('Erro ao confirmar pagamento.')
    } finally {
      setConfirmando(false)
    }
  }

  function copiarLink() {
    navigator.clipboard.writeText(linkPagamento)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
    toast.success('Link copiado!')
  }

  return (
    <div className="space-y-6">
      {/* 1. Upload de documentos finais */}
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-3">1. Anexar documentos da declaração</p>

        {docs.length > 0 && (
          <ul className="space-y-2 mb-3">
            {docs.map(doc => (
              <li key={doc.id} className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <FileText className="w-4 h-4 text-green-600 shrink-0" />
                <span className="truncate text-gray-700 flex-1">{doc.nome_arquivo}</span>
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              </li>
            ))}
          </ul>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={e => setArquivos(Array.from(e.target.files ?? []))}
        />

        {arquivos.length > 0 && (
          <ul className="space-y-1.5 mb-3">
            {arquivos.map((f, i) => (
              <li key={i} className="flex items-center justify-between gap-2 bg-gray-50 rounded px-3 py-1.5 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate text-gray-700">{f.name}</span>
                </div>
                <button onClick={() => setArquivos(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => inputRef.current?.click()} disabled={uploadando}>
            <FileText className="w-3.5 h-3.5" />
            Selecionar arquivos
          </Button>
          {arquivos.length > 0 && (
            <Button size="sm" className="gap-1.5" onClick={handleUpload} disabled={uploadando}>
              {uploadando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Enviar ({arquivos.length})
            </Button>
          )}
        </div>
      </div>

      {/* 2. Dados PIX */}
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-3">2. Dados para cobrança PIX</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Tipo de chave</label>
            <select
              value={pixTipo}
              onChange={e => setPixTipo(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            >
              <option value="email">E-mail</option>
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="phone">Telefone</option>
              <option value="random">Chave aleatória</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Chave PIX</label>
            <input
              type="text"
              value={pixChave}
              onChange={e => setPixChave(e.target.value)}
              placeholder="seu@email.com"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Seu nome (como aparece no PIX)</label>
            <input
              type="text"
              value={pixNome}
              onChange={e => setPixNome(e.target.value)}
              placeholder="João Silva"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Cidade</label>
            <input
              type="text"
              value={pixCidade}
              onChange={e => setPixCidade(e.target.value)}
              placeholder="São Paulo"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-500 block mb-1">Valor do serviço (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={pixValor}
              onChange={e => setPixValor(e.target.value)}
              placeholder="350.00"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
        <Button size="sm" className="mt-3 gap-1.5" onClick={handleSalvarPix} disabled={salvando}>
          {salvando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
          Salvar e gerar link de cobrança
        </Button>
      </div>

      {/* 3. Link e confirmação */}
      {linkAtivo && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-green-800">3. Link de cobrança gerado ✓</p>
          <p className="text-xs text-green-600">Envie este link para o cliente pelo WhatsApp ou e-mail:</p>

          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-sm bg-white border border-green-200 rounded px-3 py-1.5 text-green-700 flex-1 min-w-0 truncate">
              {linkPagamento}
            </code>
            <Button size="sm" variant="outline" onClick={copiarLink} className="gap-1.5 border-green-300 text-green-700 hover:bg-green-100 shrink-0">
              {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiado ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>

          {pago ? (
            <div className="flex items-center gap-2 text-green-700 text-sm font-medium pt-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Pagamento confirmado — documentos liberados para o cliente
            </div>
          ) : (
            <div className="pt-1">
              <p className="text-xs text-green-600 mb-2">
                Após verificar o pagamento no seu banco, clique abaixo para liberar os documentos:
              </p>
              <Button size="sm" onClick={handleConfirmar} disabled={confirmando} className="gap-1.5 bg-green-600 hover:bg-green-700 text-white">
                {confirmando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Banknote className="w-3.5 h-3.5" />}
                Confirmar pagamento recebido
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
