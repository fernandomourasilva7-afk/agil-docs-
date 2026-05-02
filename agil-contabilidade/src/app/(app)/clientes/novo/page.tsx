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
import { Loader2, UserPlus, CheckCircle2, MessageCircle, ExternalLink, UserPlus2, Plus, X } from "lucide-react";
import Link from "next/link";

const CATEGORIAS_LISTA = [
  { nome: "Documentos Pessoais",                  padrao: true  },
  { nome: "Notas Médicas / Plano de Saúde",       padrao: true  },
  { nome: "Notas de Educação",                    padrao: true  },
  { nome: "Informes Bancários",                   padrao: true  },
  { nome: "Corretoras / Investimentos",           padrao: true  },
  { nome: "Criptomoedas",                         padrao: true  },
  { nome: "Imóveis",                              padrao: true  },
  { nome: "Outros Documentos",                    padrao: true  },
  { nome: "Comprovante de Residência",            padrao: false },
  { nome: "Informe de Rendimentos (empregador)",  padrao: false },
  { nome: "Pró-labore / Distribuição de Lucros",  padrao: false },
  { nome: "Recibos de Aluguel Recebido",          padrao: false },
  { nome: "Pensão Alimentícia",                   padrao: false },
  { nome: "Previdência Privada (PGBL/VGBL)",      padrao: false },
  { nome: "Compra / Venda de Imóvel",             padrao: false },
  { nome: "Dependentes",                          padrao: false },
  { nome: "Doações",                              padrao: false },
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
  totalCategorias: number;
};

export default function NovoClientePage() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [honorario, setHonorario] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [clienteCriado, setClienteCriado] = useState<ClienteCriado | null>(null);

  const [selecionadas, setSelecionadas] = useState<Set<string>>(
    () => new Set(CATEGORIAS_LISTA.filter((c) => c.padrao).map((c) => c.nome))
  );
  const [customCats, setCustomCats] = useState<string[]>([]);
  const [novaCategoria, setNovaCategoria] = useState("");

  const router = useRouter();

  function toggleCategoria(nome: string) {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(nome)) next.delete(nome);
      else next.add(nome);
      return next;
    });
  }

  function marcarTodas() {
    setSelecionadas(new Set(CATEGORIAS_LISTA.map((c) => c.nome)));
  }

  function desmarcarTodas() {
    setSelecionadas(new Set());
  }

  function adicionarCustom() {
    const nome = novaCategoria.trim();
    if (!nome) return;
    if (CATEGORIAS_LISTA.some((c) => c.nome.toLowerCase() === nome.toLowerCase())) {
      toast.error("Essa categoria já existe na lista.");
      return;
    }
    if (customCats.includes(nome)) {
      toast.error("Categoria já adicionada.");
      return;
    }
    setCustomCats((prev) => [...prev, nome]);
    setNovaCategoria("");
  }

  function removerCustom(nome: string) {
    setCustomCats((prev) => prev.filter((c) => c !== nome));
  }

  const totalSelecionadas = selecionadas.size + customCats.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;

    if (totalSelecionadas === 0) {
      toast.error("Selecione pelo menos uma categoria de documento.");
      return;
    }

    setCarregando(true);
    const supabase = createClient();
    const slug = gerarSlug(nome) + "-" + Math.random().toString(36).substring(2, 6);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      setCarregando(false);
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

    // Verificar nome duplicado
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
        status: 'link_enviado',
      })
      .select()
      .single();

    if (erroCliente || !cliente) {
      toast.error("Erro ao criar cliente. Tente novamente.");
      setCarregando(false);
      return;
    }

    const todasCategorias = [
      ...[...selecionadas].map((nome, i) => ({ nome, ordem: i, cliente_id: cliente.id })),
      ...customCats.map((nome, i) => ({ nome, ordem: selecionadas.size + i, cliente_id: cliente.id })),
    ];

    const { error: erroCats } = await supabase.from("categorias").insert(todasCategorias);

    if (erroCats) {
      toast.error("Erro ao criar categorias.");
      setCarregando(false);
      return;
    }

    setClienteCriado({ id: cliente.id, slug: cliente.slug, nome: nome.trim(), telefone, totalCategorias: totalSelecionadas });
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
                <span className="font-medium text-gray-700">{clienteCriado.totalCategorias}</span>{" "}
                {clienteCriado.totalCategorias === 1 ? "categoria foi criada" : "categorias foram criadas"} para{" "}
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
                    setSelecionadas(new Set(CATEGORIAS_LISTA.filter((c) => c.padrao).map((c) => c.nome)));
                    setCustomCats([]);
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
              Selecione os tipos de documentos necessários para este cliente.
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

              {/* Seleção de categorias */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Documentos necessários</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={marcarTodas}
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Marcar todas
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={desmarcarTodas}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Desmarcar
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {CATEGORIAS_LISTA.map((cat) => (
                    <label
                      key={cat.nome}
                      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selecionadas.has(cat.nome)}
                        onChange={() => toggleCategoria(cat.nome)}
                        className="w-4 h-4 accent-teal-600 shrink-0"
                      />
                      <span className="text-sm text-gray-700">{cat.nome}</span>
                    </label>
                  ))}

                  {/* Categorias personalizadas adicionadas */}
                  {customCats.map((cat) => (
                    <div key={cat} className="flex items-center gap-3 px-3 py-2.5 bg-teal-50">
                      <input type="checkbox" checked readOnly className="w-4 h-4 accent-teal-600 shrink-0" />
                      <span className="text-sm text-gray-700 flex-1">{cat}</span>
                      <button
                        type="button"
                        onClick={() => removerCustom(cat)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Input para categoria personalizada */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar categoria personalizada..."
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionarCustom(); } }}
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={adicionarCustom}
                    disabled={!novaCategoria.trim()}
                    className="shrink-0 gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </Button>
                </div>

                <p className="text-xs text-gray-400">
                  {totalSelecionadas === 0
                    ? "Nenhuma categoria selecionada."
                    : `${totalSelecionadas} ${totalSelecionadas === 1 ? "categoria selecionada" : "categorias selecionadas"}.`}
                </p>
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
