export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Plus, LogOut, Users, CheckCircle2, Clock } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: clientes } = await supabase
    .from("clientes")
    .select(`
      id, nome, slug, created_at,
      categorias (
        id,
        documentos (id)
      )
    `)
    .order("created_at", { ascending: false });

  function calcularProgresso(cliente: typeof clientes extends (infer T)[] | null ? T : never) {
    if (!cliente || !("categorias" in cliente)) return { total: 0, preenchidas: 0 };
    const cats = (cliente as { categorias: { documentos: { id: string }[] }[] }).categorias;
    const total = cats.length;
    const preenchidas = cats.filter((c) => c.documentos.length > 0).length;
    return { total, preenchidas };
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
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

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Meus Clientes</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {clientes?.length ?? 0} cliente{clientes?.length !== 1 ? "s" : ""} cadastrado{clientes?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/clientes/novo">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Cliente
            </Button>
          </Link>
        </div>

        {!clientes?.length ? (
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clientes.map((cliente) => {
              const { total, preenchidas } = calcularProgresso(cliente);
              const pct = total > 0 ? Math.round((preenchidas / total) * 100) : 0;
              const completo = pct === 100 && total > 0;

              return (
                <Link key={cliente.id} href={`/clientes/${cliente.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200 h-full">
                    <CardContent className="pt-5 pb-4 px-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 leading-tight">{cliente.nome}</h3>
                        {completo ? (
                          <Badge className="bg-green-100 text-green-700 border-0 shrink-0 ml-2">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="shrink-0 ml-2">
                            <Clock className="w-3 h-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{preenchidas} de {total} categorias</span>
                          <span className="font-medium">{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${completo ? "bg-green-500" : "bg-blue-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-blue-600 mt-3 truncate">
                        /portal/{cliente.slug}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
