"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";

const CATEGORIAS_PADRAO = [
  { nome: "Documentos Pessoais", ordem: 0 },
  { nome: "Notas Médicas", ordem: 1 },
  { nome: "Notas Educação", ordem: 2 },
  { nome: "Informes Bancários", ordem: 3 },
  { nome: "Corretoras / Investimentos", ordem: 4 },
  { nome: "Criptomoedas", ordem: 5 },
  { nome: "Imóveis", ordem: 6 },
  { nome: "Outros Documentos", ordem: 7 },
];

function gerarSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 50);
}

export default function NovoClientePage() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;

    setCarregando(true);
    const supabase = createClient();
    const slug = gerarSlug(nome) + "-" + Math.random().toString(36).substring(2, 6);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      router.push("/");
      return;
    }

    const { data: cliente, error: erroCliente } = await supabase
      .from("clientes")
      .insert({ nome: nome.trim(), cpf: cpf || null, email: email || null, slug, contador_id: user.id })
      .select()
      .single();

    if (erroCliente || !cliente) {
      toast.error("Erro ao criar cliente. Tente novamente.");
      setCarregando(false);
      return;
    }

    const { error: erroCats } = await supabase.from("categorias").insert(
      CATEGORIAS_PADRAO.map((c) => ({ ...c, cliente_id: cliente.id }))
    );

    if (erroCats) {
      toast.error("Erro ao criar categorias.");
      setCarregando(false);
      return;
    }

    toast.success(`Cliente ${nome} criado com sucesso!`);
    router.push(`/clientes/${cliente.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao painel
        </Link>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-blue-100 text-blue-600 rounded-lg p-2">
                <UserPlus className="w-5 h-5" />
              </div>
              <CardTitle>Novo Cliente</CardTitle>
            </div>
            <CardDescription>
              Após criar, o sistema gera automaticamente as pastas de documentos e um link único para o cliente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input
                  id="nome"
                  placeholder="João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cpf">CPF <span className="text-gray-400 font-normal">(opcional)</span></Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">E-mail do cliente <span className="text-gray-400 font-normal">(opcional)</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                <p className="font-medium mb-1">Pastas criadas automaticamente:</p>
                <ul className="space-y-0.5 text-blue-600">
                  {CATEGORIAS_PADRAO.map((c) => (
                    <li key={c.nome} className="flex items-center gap-1.5">
                      <span className="text-blue-400">•</span> {c.nome}
                    </li>
                  ))}
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={carregando || !nome.trim()}>
                {carregando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Cliente e Gerar Link
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
