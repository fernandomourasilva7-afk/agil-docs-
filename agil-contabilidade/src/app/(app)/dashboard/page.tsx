export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Users, Sparkles } from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { PLANOS, PlanoKey } from "@/lib/planos";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: clientes }, { data: contadorData }] = await Promise.all([
    supabase
      .from("clientes")
      .select(`id, nome, slug, status, categorias(id, nome, documentos(id))`)
      .order("created_at", { ascending: false }),
    supabase.from("contadores").select("plano").eq("id", user.id).single(),
  ]);

  const clientesNormalizados = (clientes ?? []).map((c) => ({
    ...c,
    status: (c as { status?: string | null }).status ?? "link_enviado",
  }));

  const planoAtual = ((contadorData?.plano) ?? "free") as PlanoKey;
  const infoPlano = PLANOS[planoAtual];
  const totalClientes = clientesNormalizados.length;
  const limite = infoPlano.limite;
  const ilimitado = limite >= 9999;
  const percentual = ilimitado ? 0 : Math.min(100, Math.round((totalClientes / limite) * 100));

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Painel de Clientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {clientesNormalizados.length} cliente{clientesNormalizados.length !== 1 ? "s" : ""} cadastrado{clientesNormalizados.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/clientes/novo">
          <Button className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Cliente</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </Link>
      </div>

      {/* Indicador de uso do plano */}
      <Link href="/plano" className="block mb-4">
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm flex items-center gap-2 text-sm hover:border-teal-300 transition-colors">
          <Sparkles className="w-4 h-4 text-teal-500 shrink-0" />
          <span className={`flex-1 ${percentual >= 100 ? "text-red-600 font-medium" : percentual >= 80 ? "text-yellow-600" : "text-gray-600"}`}>
            {totalClientes}{!ilimitado ? `/${limite}` : ""} clientes
            {" · Plano "}
            <span className="font-medium text-gray-700">{infoPlano.label}</span>
          </span>
          <span className={`text-xs font-medium shrink-0 ${percentual >= 100 ? "text-red-600" : percentual >= 80 ? "text-yellow-600" : "text-teal-600"}`}>
            {percentual >= 100 ? "Fazer upgrade →" : percentual >= 80 ? "Próximo do limite →" : "Ver plano →"}
          </span>
        </div>
      </Link>

      {clientesNormalizados.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="bg-teal-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-teal-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum cliente ainda</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
            Adicione seu primeiro cliente para gerar o link de coleta de documentos.
          </p>
          <Link href="/clientes/novo">
            <Button className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="w-4 h-4" />
              Adicionar Cliente
            </Button>
          </Link>
        </div>
      ) : (
        <KanbanBoard clientesIniciais={clientesNormalizados} />
      )}
    </div>
  );
}
