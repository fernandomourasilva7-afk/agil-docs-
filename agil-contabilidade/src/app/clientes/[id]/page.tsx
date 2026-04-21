export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Copy, CheckCircle2, Clock, FileText,
  Download, FolderOpen, ExternalLink
} from "lucide-react";
import CopiarLink from "@/components/CopiarLink";
import BaixarDocumento from "@/components/BaixarDocumento";

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

  const totalCats = categorias?.length ?? 0;
  const preenchidas = categorias?.filter((c) => c.documentos.length > 0).length ?? 0;
  const pct = totalCats > 0 ? Math.round((preenchidas / totalCats) * 100) : 0;
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/portal/${cliente.slug}`;

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
              <h1 className="text-2xl font-bold text-gray-900">{cliente.nome}</h1>
              {cliente.cpf && <p className="text-sm text-gray-500 mt-0.5">CPF: {cliente.cpf}</p>}
              {cliente.email && <p className="text-sm text-gray-500">{cliente.email}</p>}
            </div>
            <div className="flex items-center gap-2">
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

        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-4 pb-4 px-5">
            <p className="text-sm font-medium text-blue-800 mb-2">Link do cliente</p>
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-sm bg-white border border-blue-200 rounded px-3 py-1.5 text-blue-700 flex-1 min-w-0 truncate">
                /portal/{cliente.slug}
              </code>
              <CopiarLink slug={cliente.slug} />
              <a href={`/portal/${cliente.slug}`} target="_blank">
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

        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700">Documentos por categoria</h2>

          {categorias?.map((cat) => {
            const temDocs = cat.documentos.length > 0;
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
