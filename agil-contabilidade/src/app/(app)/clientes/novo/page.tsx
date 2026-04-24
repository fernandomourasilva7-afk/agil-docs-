"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PLANOS, PlanoKey } from "@/lib/planos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, UserPlus, CheckCircle2, MessageCircle, ExternalLink, UserPlus2 } from "lucide-react";
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

function gerarLinkWhatsApp(telefone: string, nome: string, portalUrl: string): string {
  const numero = "55" + telefone.replace(/\D/g, "").replace(/^0/, "");
  const mensagem =
    `Olá, ${nome}! 👋\n\n` +
    `Seu contador enviou um link para você enviar os documentos da declaração do Imposto de Renda.\n\n` +
    `📂 Acesse o link abaixo, clique em cada categoria e faça o upload dos seus arquivos:\n` +
    `${portalUrl}\n\n` +
    `Qualquer dúvida, é só chamar!`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

type ClienteCriado = {
  id: string;
  slug: string;
  nome: string;
  telefone: string;
};

export default function NovoClientePage() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [honorario, setHonorario] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [clienteCriado, setClienteCriado] = useState<ClienteCriado | null>(null);
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
      return;
    }

    // Verificar limite do plano
    const [{ data: contadorData }, { count: totalClientes }] = await Promise.all([
      supabase.from("contadores").select("plano").eq("id", user.id).single(),
      supabase.from("clientes").select("*", { count: "exact", head: true }).eq("contador_id", user.id),
    ]);
    const plano = ((contadorData?.plano) ?? "free") as PlanoKey;
    const limite = PLANOS[plano].limite;
    if ((totalClientes ?? 0) >= limite) {
      toast.error(
        `Limite de ${limite} clientes do plano ${PLANOS[plano].label} atingido. Faça upgrade para continuar.`
      );
      setCarregando(false);
      router.push("/plano");
      return;
    }

    // Verificar telefone duplicado
    if (telefone.trim()) {
      const { data: dupTel } = await supabase
        .from("clientes")
        .select("id, nome")
        .eq("contador_id", user.id)
        .eq("telefone", telefone.trim())
        .maybeSingle();
      if (dupTel) {
        toast.error(`Este número de WhatsApp já está cadastrado para ${dupTel.nome}.`);
        setCarregando(false);
        return;
      }
    }

    // Verificar nome duplicado (sem distinção de maiúsculas/minúsculas)
    const { data: dupNome } = await supabase
      .from("clientes")
      .select("id")
      .eq("contador_id", user.id)
      .ilike("nome", nome.trim())
      .maybeSingle();
    if (dupNome) {
      toast.error("Já existe um cliente com esse nome completo.");
      setCarregando(false);
      return;
    }

    const { data: cliente, error: erroCliente } = await supabase
      .from("clientes")
      .insert({
        nome: nome.trim(),
        telefone: telefone || null,
        email: email || null,
        slug,
        contador_id: user.id,
        valor_honorario: honorario ? parseFloat(honorario.replace(",", ".")) : null,
      })
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

    setClienteCriado({ id: cliente.id, slug: cliente.slug, nome: nome.trim(), telefone });
    setCarregando(false);
  }

  if (clienteCriado) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const portalUrl = `${appUrl}/portal/${clienteCriado.slug}`;
    const temTelefone = clienteCriado.telefone.replace(/\D/g, "").length >= 10;
    const whatsAppLink = temTelefone
      ? gerarLinkWhatsApp(clienteCriado.telefone, clienteCriado.nome, portalUrl)
      : null;

    return (
      <div className="px-4 py-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          <Card className="shadow-sm">
            <CardContent className="pt-8 pb-8 px-6 text-center">
              <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Cliente criado com sucesso!
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                As pastas de documentos foram criadas automaticamente para{" "}
                <span className="font-medium text-gray-700">{clienteCriado.nome}</span>.
              </p>

              <div className="space-y-3">
                {whatsAppLink ? (
                  <a href={whatsAppLink} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full gap-2 bg-green-500 hover:bg-green-600 text-white text-base h-12">
                      <MessageCircle className="w-5 h-5" />
                      Enviar link pelo WhatsApp
                    </Button>
                  </a>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                    Nenhum telefone cadastrado. Copie o link manualmente na tela do cliente.
                  </div>
                )}

                <Link href={`/clientes/${clienteCriado.id}`} className="block">
                  <Button variant="outline" className="w-full gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Ver detalhes do cliente
                  </Button>
                </Link>

                <button
                  onClick={() => {
                    setClienteCriado(null);
                    setNome("");
                    setTelefone("");
                    setEmail("");
                    setHonorario("");
                  }}
                  className="w-full text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1.5 py-2"
                >
                  <UserPlus2 className="w-4 h-4" />
                  Criar outro cliente
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-teal-100 text-teal-600 rounded-lg p-2">
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
                <Label htmlFor="telefone">
                  WhatsApp do cliente{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </Label>
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
                <p className="text-xs text-gray-400">
                  Usado para enviar o link de documentos direto pelo WhatsApp.
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">
                  E-mail do cliente{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="honorario">
                  Honorário{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                  <Input
                    id="honorario"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={honorario}
                    onChange={(e) => setHonorario(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Valor cobrado pela declaração. Usado nas métricas de receita.
                </p>
              </div>

              <div className="bg-teal-50 rounded-lg p-3 text-sm text-teal-700">
                <p className="font-medium mb-1">Pastas criadas automaticamente:</p>
                <ul className="space-y-0.5 text-teal-600">
                  {CATEGORIAS_PADRAO.map((c) => (
                    <li key={c.nome} className="flex items-center gap-1.5">
                      <span className="text-teal-400">•</span> {c.nome}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                disabled={carregando || !nome.trim()}
              >
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
