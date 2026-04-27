export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import PortalUpload from "@/components/PortalUpload";

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
    .select("id, nome, ordem, observacao, documentos(id)")
    .eq("cliente_id", cliente.id)
    .order("ordem");

  const totalCats = categorias?.length ?? 0;
  const preenchidas = categorias?.filter((c) => c.documentos.length > 0).length ?? 0;
  const tudo_enviado = preenchidas === totalCats && totalCats > 0;
  const declarouEnvio = (cliente as { declarou_envio?: boolean }).declarou_envio ?? false;
  const pct = totalCats > 0 ? Math.round((preenchidas / totalCats) * 100) : 0;

  const observacoes: Record<string, string> = {};
  categorias?.forEach((c) => {
    const obs = (c as { observacao?: string | null }).observacao;
    if (obs) observacoes[c.id] = obs;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 border-b border-slate-700/60">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Image src="/logo.png" alt="Ágil Docs" width={32} height={32} className="w-8 h-8" />
          <span className="font-bold text-white">Ágil Docs</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Olá, {cliente.nome}!</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Envie seus documentos para a declaração do Imposto de Renda. Clique em cada categoria e faça o upload dos arquivos.
          </p>
        </div>

        {tudo_enviado && !declarouEnvio && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800">Tudo enviado!</p>
              <p className="text-sm text-green-600">Todas as categorias têm arquivos. Clique em confirmar abaixo para avisar seu contador.</p>
            </div>
          </div>
        )}

        <div className="mb-5 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{preenchidas} de {totalCats} categorias enviadas</span>
            <span className="font-semibold text-gray-700">{pct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${tudo_enviado ? "bg-green-500" : "bg-teal-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <PortalUpload
          clienteId={cliente.id}
          declarouEnvio={declarouEnvio}
          observacoes={observacoes}
          categorias={categorias?.map((c) => ({
            id: c.id,
            nome: c.nome,
            quantidade: c.documentos.length,
          })) ?? []}
        />

        <p className="text-center text-xs text-gray-400 mt-8">
          Seus arquivos são enviados de forma segura e criptografada. Apenas seu contador tem acesso.
        </p>
      </main>
    </div>
  );
}
