export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderOpen, Plus, Users } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { KanbanBoard } from "@/components/KanbanBoard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: clientes } = await supabase
    .from("clientes")
    .select(`
      id, nome, slug, status,
      categorias (
        id,
        documentos (id)
      )
    `)
    .order("created_at", { ascending: false });

  const clientesNormalizados = (clientes ?? []).map((c) => ({
    ...c,
    status: (c as { status?: string | null }).status ?? "link_enviado",
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-xl p-1.5">
              <FolderOpen className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900">Ágil Docs</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Painel de Clientes</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {clientesNormalizados.length} cliente{clientesNormalizados.length !== 1 ? "s" : ""} cadastrado{clientesNormalizados.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/clientes/novo">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Cliente
            </Button>
          </Link>
        </div>

        {clientesNormalizados.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum cliente ainda</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              Adicione seu primeiro cliente para gerar o link de coleta de documentos.
            </p>
            <Link href="/clientes/novo">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Cliente
              </Button>
            </Link>
          </div>
        ) : (
          <KanbanBoard clientesIniciais={clientesNormalizados} />
        )}
      </main>
    </div>
  );
}
