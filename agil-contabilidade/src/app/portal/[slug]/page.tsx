export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Image from "next/image";
import PortalUpload from "@/components/PortalUpload";
import CardDeclaracaoPortal from "@/components/CardDeclaracaoPortal";
import { CategoriasRepoSemCard } from "@/components/repositorio/PortalRepositorio";

type Props = { params: Promise<{ slug: string }> };

export default async function PortalClientePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nome, declarou_envio")
    .eq("slug", slug)
    .single();

  if (!cliente) notFound();

  const { data: categorias } = await supabase
    .from("categorias")
    .select("id, nome, ordem, observacao, mensagem_cliente, documentos(id)")
    .eq("cliente_id", cliente.id)
    .order("ordem");

  const admin = createAdminClient();
  const { data: repositorios } = await admin
    .from("repositorios")
    .select("id, tipo, categorias_repositorio(id, nome, ordem, documentos_repositorio(id))")
    .eq("cliente_id", cliente.id)
    .order("tipo");

  const declarouEnvio = (cliente as { declarou_envio?: boolean }).declarou_envio ?? false;

  // Progresso CPF (categorias principais do IR)
  const totalCats = categorias?.length ?? 0;
  const preenchidas = categorias?.filter((c) => c.documentos.length > 0).length ?? 0;
  const pctCPF = totalCats > 0 ? Math.round((preenchidas / totalCats) * 100) : 0;

  // Repositório PJ para o card CNPJ
  const repoPJ = (repositorios ?? []).find((r) => r.tipo === "pj") ?? null;
  const catsPJ = repoPJ?.categorias_repositorio ?? [];
  const pctCNPJ = catsPJ.length > 0
    ? Math.round(catsPJ.filter((c) => c.documentos_repositorio.length > 0).length / catsPJ.length * 100)
    : 0;

  const observacoes: Record<string, string> = {};
  const mensagensCliente: Record<string, string> = {};
  categorias?.forEach((c) => {
    const obs = (c as { observacao?: string | null }).observacao;
    if (obs) observacoes[c.id] = obs;
    const msg = (c as { mensagem_cliente?: string | null }).mensagem_cliente;
    if (msg) mensagensCliente[c.id] = msg;
  });

  const categoriasParaUpload = categorias?.map((c) => ({
    id: c.id,
    nome: c.nome,
    quantidade: c.documentos.length,
  })) ?? [];

  const categoriasPJ = catsPJ.map((c) => ({
    id: c.id,
    nome: c.nome,
    quantidade: c.documentos_repositorio.length,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 border-b border-slate-700/60">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Image src="/logo.png" alt="Ágil Docs" width={32} height={32} className="w-8 h-8" />
          <span className="font-bold text-white">Ágil Docs</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Olá, {cliente.nome}!</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Envie seus documentos para a declaração do Imposto de Renda.
          </p>
        </div>

        <div className="space-y-4">
          {/* Card CPF — sempre visível se há categorias IR */}
          {totalCats > 0 && (
            <CardDeclaracaoPortal label="CPF" pct={pctCPF}>
              <div className="px-4 py-4">
                <PortalUpload
                  clienteId={cliente.id}
                  declarouEnvio={declarouEnvio}
                  observacoes={observacoes}
                  categorias={categoriasParaUpload}
                  mensagensIniciais={mensagensCliente}
                  clienteSlug={slug}
                />
              </div>
            </CardDeclaracaoPortal>
          )}

          {/* Card CNPJ — só se o repositório PJ estiver ativado */}
          {repoPJ && (
            <CardDeclaracaoPortal label="CNPJ" pct={pctCNPJ}>
              <CategoriasRepoSemCard
                repo={{ id: repoPJ.id, tipo: "pj", categorias: categoriasPJ }}
                clienteId={cliente.id}
              />
            </CardDeclaracaoPortal>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Seus arquivos são enviados de forma segura e criptografada. Apenas seu contador tem acesso.
        </p>
      </main>
    </div>
  );
}
