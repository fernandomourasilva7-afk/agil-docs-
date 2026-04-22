export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, CheckCircle2, Clock, FileText,
  FolderOpen, ExternalLink, Bell, Receipt,
} from "lucide-react";
import CopiarLink from "@/components/CopiarLink";
import BaixarDocumento from "@/components/BaixarDocumento";
import ObservacaoCategoria from "@/components/ObservacaoCategoria";
import DevolverCliente from "@/components/DevolverCliente";
import CobrancaIR from "@/components/CobrancaIR";

type Props = { params: Promise<{ id: string }> };

export default async function ClienteDetalhePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .eq("contador_id", user.id)
    .single();

  if (!cliente) notFound();

  const { data: categorias } = await supabase
    .from("categorias")
    .select("*, documentos(*)")
    .eq("cliente_id", id)
    .order("ordem");

  const { data: docsFinais } = await supabase
    .from("documentos_finais")
    .select("id, nome_arquivo")
    .eq("cliente_id", id)
    .order("created_at");

  const totalCats = categorias?.length ?? 0;
  const preenchidas = categorias?.filter((c) => c.documentos.length > 0).length ?? 0;
  const pct = totalCats > 0 ? Math.round((preenchidas / totalCats) * 100) : 0;
  const declarouEnvio = (cliente as { declarou_envio?: boolean }).declarou_envio ?? false;

  const c = cliente as {
    id: string; nome: string; cpf?: string; email?: string; slug: string;
    pix_chave?: string | null; pix_tipo?: string | null; pix_nome?: string | null;
    pix_cidade?: string | null; pix_valor?: number | null; pagamento_confirmado?: boolean | null;
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-xl p-1.5">
              <FolderOpen className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900">Ágil Docs</span>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-500">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Painel</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{c.nome}</h1>
              {c.cpf && <p className="text-sm text-gray-500 mt-0.5">CPF: {c.cpf}</p>}
              {c.email && <p className="text-sm text-gray-500">{c.email}</p>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {declarouEnvio && (
                <Badge className="bg-blue-100 text-blue-700 border-0 text-sm px-3 py-1">
                  <Bell className="w-3.5 h-3.5 mr-1.5" />
                  Cliente confirmou o envio
                </Badge>
              )}
              {c.pagamento_confirmado && (
                <Badge className="bg-green-100 text-green-700 border-0 text-sm px-3 py-1">
                  <Receipt className="w-3.5 h-3.5 mr-1.5" />
                  Pagamento confirmado
                </Badge>
              )}
              {pct === 100 ? (
                <Badge className="bg-green-100 text-green-700 border-0 text-sm px-3 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Documentação completa
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  {preenchidas}/{totalCats} categorias
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Progresso geral</span>
              <span className="font-medium text-gray-700">{pct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${pct === 100 ? "bg-green-500" : "bg-blue-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {declarouEnvio && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800">O cliente confirmou o envio dos documentos</p>
              <p className="text-sm text-blue-600 mt-0.5">
                Revise os arquivos abaixo. Se precisar de algo a mais, adicione uma observação na categoria e clique em &quot;Devolver ao cliente&quot;.
              </p>
            </div>
          </div>
        )}

        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-4 pb-4 px-5">
            <p className="text-sm font-medium text-blue-800 mb-2">Link do cliente</p>
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-sm bg-white border border-blue-200 rounded px-3 py-1.5 text-blue-700 flex-1 min-w-0 truncate">
                /portal/{c.slug}
              </code>
              <CopiarLink slug={c.slug} />
              <a href={`/portal/${c.slug}`} target="_blank">
                <Button size="sm" variant="outline" className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-100">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir
                </Button>
              </a>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Envie este link para o cliente. Ele pode fazer upload sem precisar criar conta.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3 mb-8">
          <h2 className="font-semibold text-gray-700">Documentos por categoria</h2>

          {categorias?.map((cat) => {
            const temDocs = cat.documentos.length > 0;
            const observacao = (cat as { observacao?: string | null }).observacao ?? null;
            return (
              <Card key={cat.id} className={`border ${temDocs ? "border-green-200" : "border-gray-200"}`}>
                <CardHeader className="py-3 px-5 pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-800">{cat.nome}</CardTitle>
                    {temDocs ? (
                      <Badge className="bg-green-100 text-green-700 border-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {cat.documentos.length} arquivo{cat.documentos.length > 1 ? "s" : ""}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-gray-400 bg-gray-100 border-0">
                        <Clock className="w-3 h-3 mr-1" />
                        Aguardando
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="py-3 px-5">
                  {cat.documentos.length > 0 ? (
                    <ul className="space-y-2">
                      {cat.documentos.map((doc: { id: string; nome_arquivo: string; storage_path: string; created_at: string }) => (
                        <li key={doc.id} className="flex items-center justify-between gap-2 text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="truncate text-gray-700">{doc.nome_arquivo}</span>
                          </div>
                          <BaixarDocumento storagePath={doc.storage_path} nomeArquivo={doc.nome_arquivo} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Nenhum documento enviado ainda.</p>
                  )}
                  <ObservacaoCategoria catId={cat.id} observacaoAtual={observacao} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {declarouEnvio && <DevolverCliente clienteId={c.id} />}

        {/* Seção de IR Final e Cobrança */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-100 rounded-lg p-1.5">
              <Receipt className="w-5 h-5 text-green-700" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">IR Finalizado — Entrega e Cobrança</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Após concluir a declaração, anexe os arquivos finais, configure a cobrança via PIX e envie o link de pagamento para o cliente.
          </p>

          <CobrancaIR
            clienteId={c.id}
            clienteSlug={c.slug}
            userId={user.id}
            docsIniciais={docsFinais ?? []}
            pixChaveInicial={c.pix_chave ?? null}
            pixTipoInicial={c.pix_tipo ?? null}
            pixNomeInicial={c.pix_nome ?? null}
            pixCidadeInicial={c.pix_cidade ?? null}
            pixValorInicial={c.pix_valor ?? null}
            pagamentoConfirmado={c.pagamento_confirmado ?? false}
            appUrl={appUrl}
          />
        </div>
      </main>
    </div>
  );
}
