"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { registrarContador } from "@/app/actions/registrar-contador";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";
import {
  FolderOpen, Loader2, Eye, EyeOff, Check, ArrowRight,
  Upload, Link2, LayoutDashboard, FileCheck, QrCode, Download,
  MessageCircle, ChevronRight, AlertTriangle, Clock, Search,
} from "lucide-react";

// TODO: substituir pelo seu WhatsApp (só dígitos com DDD e código do Brasil 55)
const WHATSAPP = "5583987095584";

const dores = [
  {
    icon: MessageCircle,
    titulo: "Documentos espalhados em todo lugar",
    descricao: "WhatsApp, e-mail, Drive, pendrive, papel. Cada cliente entrega de um jeito diferente e você perde horas juntando tudo.",
  },
  {
    icon: Clock,
    titulo: "Cobrando o mesmo cliente três vezes",
    descricao: "Você manda mensagem, eles esquecem. Manda de novo, mandam errado. A declaração atrasa e a culpa sobra pra você.",
  },
  {
    icon: Search,
    titulo: "Na hora H, você não sabe o que chegou",
    descricao: "Faltam 2 dias pra entrega. Você não tem visibilidade do que foi enviado, o que está faltando e quem ainda não mandou nada.",
  },
];

const passos = [
  {
    numero: "01",
    titulo: "Cadastre o cliente",
    descricao: "Em segundos, o sistema cria as 8 pastas do IR automaticamente e gera um link único para o cliente.",
  },
  {
    numero: "02",
    titulo: "Cliente envia sem complicação",
    descricao: "O cliente acessa o link, escolhe a categoria e faz o upload. Sem criar conta, sem baixar app, sem confusão.",
  },
  {
    numero: "03",
    titulo: "Você acompanha tudo em tempo real",
    descricao: "Veja quem entregou, o que está faltando e mova os clientes pelo Kanban conforme o andamento da declaração.",
  },
];

const funcionalidades = [
  { icon: Upload,          titulo: "Portal sem login",          descricao: "O cliente envia documentos pelo link sem precisar criar nenhuma conta." },
  { icon: FolderOpen,      titulo: "8 categorias do IR",        descricao: "Pessoais, médicos, educação, bancários, investimentos e mais — tudo organizado." },
  { icon: LayoutDashboard, titulo: "Painel Kanban",             descricao: "Visualize o progresso de todos os clientes em um único painel de controle." },
  { icon: Link2,           titulo: "Link único por cliente",    descricao: "Cada cliente tem seu próprio portal personalizado. Fácil de compartilhar pelo WhatsApp." },
  { icon: QrCode,          titulo: "Cobrança via PIX",          descricao: "Gere a cobrança dos seus honorários com QR Code PIX direto pelo sistema." },
  { icon: Download,        titulo: "Download dos documentos",   descricao: "Baixe tudo em um clique após a confirmação do pagamento." },
];

const planos = [
  {
    key: "free",
    nome: "Free",
    preco: "Grátis",
    periodo: "",
    limite: "5 clientes",
    destaque: false,
    features: ["Portal de upload sem login", "8 categorias do IR", "Link único por cliente", "Painel Kanban"],
    cta: "Começar grátis",
    tipo: "signup",
  },
  {
    key: "starter",
    nome: "Starter",
    preco: "R$36,99",
    periodo: "/mês",
    limite: "20 clientes",
    destaque: false,
    features: ["Tudo do Free", "Cobrança via PIX", "Download de documentos", "Suporte por e-mail"],
    cta: "Contratar via WhatsApp",
    tipo: "whatsapp",
  },
  {
    key: "profissional",
    nome: "Profissional",
    preco: "R$65",
    periodo: "/mês",
    limite: "50 clientes",
    destaque: true,
    features: ["Tudo do Starter", "Múltiplas temporadas", "Relatórios de progresso", "Suporte prioritário"],
    cta: "Contratar via WhatsApp",
    tipo: "whatsapp",
  },
  {
    key: "escritorio",
    nome: "Escritório",
    preco: "R$299",
    periodo: "/mês",
    limite: "Ilimitado",
    destaque: false,
    features: ["Tudo do Profissional", "Clientes ilimitados", "Configuração assistida", "Suporte dedicado"],
    cta: "Contratar via WhatsApp",
    tipo: "whatsapp",
  },
];

export default function LandingPage() {
  const [modalAberto, setModalAberto] = useState(false);
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [emailCad, setEmailCad] = useState("");
  const [telefone, setTelefone] = useState("");
  const [crc, setCrc] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [senhaCad, setSenhaCad] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [planoSelecionado, setPlanoSelecionado] = useState("free");

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) router.push("/dashboard");
    });
  }, [router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function abrirModal(m: "entrar" | "cadastrar") {
    setModo(m);
    setPlanoSelecionado("free");
    setModalAberto(true);
  }

  async function handleEntrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    const { error } = await createClient().auth.signInWithPassword({ email, password: senha });
    if (error) {
      toast.error("E-mail ou senha incorretos.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    setCarregando(false);
  }

  function mascaraCpfCnpj(valor: string) {
    const digits = valor.replace(/\D/g, '').slice(0, 14)
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        .replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3')
        .replace(/(\d{3})(\d{0,3})/, '$1.$2')
    }
    return digits
      .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
      .replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4')
      .replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3')
      .replace(/(\d{2})(\d{0,3})/, '$1.$2')
  }

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (senhaCad !== confirmarSenha) { toast.error("As senhas não coincidem."); return; }
    if (senhaCad.length < 6) { toast.error("A senha deve ter ao menos 6 caracteres."); return; }
    const digits = cpfCnpj.replace(/\D/g, '')
    if (digits.length !== 11 && digits.length !== 14) { toast.error("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido."); return; }
    setCarregando(true);
    try {
      const resultado = await registrarContador({ nome, email: emailCad, telefone, crc, senha: senhaCad, cpfCnpj });
      if (resultado?.error) {
        toast.error(resultado.error);
        return;
      }
      if (planoSelecionado !== "free") {
        const planoInfo = planos.find((p) => p.key === planoSelecionado);
        const msg = `Olá! Acabei de criar minha conta no Ágil Docs e gostaria de ativar o plano ${planoInfo?.nome} (${planoInfo?.preco}${planoInfo?.periodo}). Meu e-mail é: ${emailCad}`;
        window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
        toast.success(`Conta criada! Você será redirecionado para o WhatsApp para ativar o plano ${planoInfo?.nome}.`);
      } else {
        toast.success("Conta criada com sucesso! Faça login para acessar.");
      }
      setModo("entrar");
      setEmail(emailCad);
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white antialiased">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 lg:px-10 transition-all duration-300 ${scrolled ? "bg-slate-950/95 backdrop-blur-md border-b border-slate-800/60 shadow-lg" : "bg-transparent"}`}>
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Ágil Docs" width={28} height={28} className="w-7 h-7" />
          <span className="font-bold text-white text-base tracking-tight">Ágil Docs</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => abrirModal("entrar")}
            className="text-slate-400 hover:text-white text-sm font-medium transition-colors hidden sm:block"
          >
            Entrar
          </button>
          <button
            onClick={() => abrirModal("cadastrar")}
            className="bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Começar grátis
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Imagem de fundo — substitua a URL pela sua foto */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          {/* Camada escura base */}
          <div className="absolute inset-0 bg-slate-950/60" />
          {/* Overlay gradiente: mais escuro à esquerda */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/50" />
          {/* Fade para a próxima seção */}
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-slate-950 to-transparent" />
        </div>

        {/* Conteúdo — alinhado à esquerda */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-10 py-24">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              O sistema dos contadores de alto desempenho
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-black tracking-tight leading-[1.05] mb-6">
              Contadores de Alto{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                Desempenho
              </span>{" "}
              Têm Sistema.{" "}
              <br className="hidden sm:block" />
              Você Também Pode.
            </h1>

            {/* Subheadline */}
            <p className="text-slate-300 text-lg sm:text-xl leading-relaxed mb-10">
              Profissionais de alto desempenho não dependem de sorte — eles têm sistema.
              Com Ágil Docs, você centraliza documentos, elimina o caos e entrega
              declarações com a <span className="text-white font-semibold">eficiência que seus clientes merecem</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
              <button
                onClick={() => abrirModal("cadastrar")}
                className="group flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-teal-600/30 hover:shadow-teal-500/40"
              >
                Começar grátis agora
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => abrirModal("entrar")}
                className="flex items-center gap-2 border border-slate-600 hover:border-slate-400 bg-slate-900/60 backdrop-blur-sm text-slate-300 hover:text-white font-medium text-base px-8 py-3.5 rounded-xl transition-all"
              >
                Já tenho conta
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
              {[
                "Portal sem login para o cliente",
                "8 categorias do IR",
                "Grátis para começar",
              ].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-500 shrink-0" />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-slate-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        </div>
      </section>

      {/* ── DOR ── */}
      <section className="py-24 px-4 bg-white text-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5" />
              Você ainda opera assim?
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4">
              A desordem tem um custo que{" "}
              <span className="text-gray-500">você ainda não calculou</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Cada documento perdido, cada cliente cobrado três vezes, cada declaração atrasada — tudo isso tem uma única causa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dores.map(({ icon: Icon, titulo, descricao }) => (
              <div key={titulo} className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <div className="bg-slate-200 text-slate-600 rounded-xl p-2.5 w-fit mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{descricao}</p>
              </div>
            ))}
          </div>

          <p className="text-center mt-10 text-gray-400 text-base italic">
            "Se você se identificou com pelo menos uma dessas situações, o problema não é você — é a falta de sistema."
          </p>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="py-24 px-4 bg-slate-50 text-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4">
              3 passos para{" "}
              <span className="text-teal-600">transformar seu escritório</span>
            </h2>
            <p className="text-gray-500 text-lg">Simples o suficiente para começar hoje. Poderoso o suficiente para escalar.</p>
          </div>

          <div className="space-y-6">
            {passos.map(({ numero, titulo, descricao }, i) => (
              <div key={numero} className="flex gap-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-4xl font-black text-teal-100 select-none w-14 shrink-0 text-right leading-none pt-1">
                  {numero}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{titulo}</h3>
                  <p className="text-gray-500 leading-relaxed">{descricao}</p>
                </div>
                {i < passos.length - 1 && (
                  <div className="hidden" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ── */}
      <section className="py-24 px-4 bg-white text-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4">
              Tudo que você precisa.{" "}
              <span className="text-teal-600">Nada que você não usa.</span>
            </h2>
            <p className="text-gray-500 text-lg">Feito especificamente para a realidade dos escritórios de contabilidade brasileiros.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {funcionalidades.map(({ icon: Icon, titulo, descricao }) => (
              <div key={titulo} className="border border-gray-100 rounded-2xl p-6 hover:border-teal-200 hover:shadow-md transition-all group">
                <div className="bg-teal-50 group-hover:bg-teal-100 text-teal-600 rounded-xl p-2.5 w-fit mb-4 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CITAÇÃO / COACHING ── */}
      <section className="py-24 px-4 relative overflow-hidden bg-slate-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-teal-600/10 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="text-teal-500 text-5xl font-black leading-none mb-6 select-none">"</div>
          <blockquote className="text-xl sm:text-2xl font-medium text-white leading-relaxed mb-8">
            O problema não é a falta de clientes. É a falta de processo para atendê-los com excelência.{" "}
            <span className="text-teal-400">
              Organize seus processos e seus resultados se organizarão.
            </span>{" "}
            Pessoas de alta performance não têm sorte — elas têm sistema.
          </blockquote>
          <p className="text-slate-500 text-sm mb-10">
            Inspirado na metodologia do Coaching Integral Sistêmico · Paulo Vieira
          </p>
          <button
            onClick={() => abrirModal("cadastrar")}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-teal-600/25"
          >
            Quero transformar meu escritório
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section className="py-24 px-4 bg-slate-50 text-gray-900" id="planos">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4">
              Escolha o plano do seu escritório
            </h2>
            <p className="text-gray-500 text-lg">Comece grátis. Faça upgrade quando o crescimento exigir.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {planos.map((plano) => (
              <div
                key={plano.key}
                className={`relative bg-white rounded-2xl p-6 flex flex-col shadow-sm ${
                  plano.destaque
                    ? "ring-2 ring-teal-500 shadow-teal-100 shadow-xl"
                    : "border border-gray-200"
                }`}
              >
                {plano.destaque && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      Mais popular
                    </span>
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="font-bold text-gray-900 text-lg">{plano.nome}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={`text-3xl font-black ${plano.destaque ? "text-teal-600" : "text-gray-900"}`}>
                      {plano.preco}
                    </span>
                    {plano.periodo && <span className="text-gray-400 text-sm">{plano.periodo}</span>}
                  </div>
                  <p className="text-teal-600 text-sm font-semibold mt-1">{plano.limite}</p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plano.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plano.tipo === "signup" ? (
                  <button
                    onClick={() => abrirModal("cadastrar")}
                    className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold h-10 rounded-xl transition-colors"
                  >
                    {plano.cta}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <a
                    href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Quero contratar o plano ${plano.nome} do Ágil Docs por ${plano.preco}${plano.periodo}. Meu e-mail é: `)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 w-full text-white text-sm font-semibold h-10 rounded-xl transition-colors ${
                      plano.destaque
                        ? "bg-teal-600 hover:bg-teal-500"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {plano.cta}
                  </a>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">
            Pagamento via PIX. Acesso liberado em minutos após confirmação.
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-4 relative overflow-hidden bg-slate-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-teal-600/8 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal-800/10 blur-[80px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight mb-4">
            A decisão que você toma{" "}
            <span className="text-teal-400">hoje</span>{" "}
            define o resultado de amanhã.
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Cada dia sem sistema é mais um dia no caos. Comece agora — é gratuito.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => abrirModal("cadastrar")}
              className="group flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-base px-8 py-4 rounded-xl transition-all shadow-xl shadow-teal-600/25 hover:shadow-teal-500/40"
            >
              Criar minha conta grátis agora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => abrirModal("entrar")}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Já tenho conta → Entrar
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-slate-600">
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" /> Sem cartão de crédito</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" /> Configuração em 2 minutos</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" /> Cancele quando quiser</div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6 border-t border-slate-800/60 bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Ágil Docs" width={28} height={28} className="w-7 h-7" />
            <span className="font-bold text-white text-sm">Ágil Docs</span>
          </div>
          <p className="text-slate-600 text-xs">
            © 2025 Ágil Docs · Repositório inteligente para contadores brasileiros
          </p>
          <button
            onClick={() => abrirModal("entrar")}
            className="text-slate-500 hover:text-teal-400 text-xs transition-colors"
          >
            Acessar o sistema →
          </button>
        </div>
      </footer>

      {/* ── MODAL DE LOGIN/CADASTRO ── */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-5xl p-0 gap-0 overflow-hidden max-h-[92vh]">
          <DialogTitle className="sr-only">
            {modo === "entrar" ? "Entrar na conta" : "Criar conta"}
          </DialogTitle>

          {modo === "entrar" ? (
            <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] h-full">
              {/* Painel esquerdo */}
              <div className="hidden lg:flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-8">
                <div className="flex items-center gap-2 mb-7">
                  <Image src="/logo.png" alt="Ágil Docs" width={28} height={28} className="w-7 h-7" />
                  <span className="font-bold text-white text-sm">Ágil Docs</span>
                </div>
                <h3 className="text-xl font-black text-white mb-1">O sistema dos contadores</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Centralize o recebimento de documentos do IR dos seus clientes em um só lugar.
                </p>
                <div className="space-y-2.5 flex-1">
                  {[
                    { nome: "Free", preco: "Grátis", limite: "5 clientes" },
                    { nome: "Starter", preco: "R$36,99/mês", limite: "20 clientes" },
                    { nome: "Profissional", preco: "R$65/mês", limite: "50 clientes" },
                    { nome: "Escritório", preco: "R$299/mês", limite: "Ilimitado" },
                  ].map((p) => (
                    <div
                      key={p.nome}
                      className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-lg px-3.5 py-2.5"
                    >
                      <div>
                        <span className="text-white text-sm font-semibold">{p.nome}</span>
                        <span className="text-teal-500 text-xs ml-2">{p.limite}</span>
                      </div>
                      <span className="text-slate-300 text-sm font-medium">{p.preco}</span>
                    </div>
                  ))}
                </div>
                <p className="text-slate-600 text-xs mt-6">Sem cartão de crédito · Pagamento via PIX</p>
              </div>

              {/* Painel direito — formulário de login */}
              <div className="p-6 sm:p-8 flex flex-col justify-center overflow-y-auto">
                <div className="flex items-center gap-2 mb-4 lg:hidden">
                  <Image src="/logo.png" alt="Ágil Docs" width={28} height={28} className="w-7 h-7" />
                  <span className="font-bold text-gray-900 text-sm">Ágil Docs</span>
                </div>
                <div className="mb-5">
                  <h2 className="text-xl font-black text-gray-900">Bem-vindo de volta</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Entre para acessar seu painel</p>
                </div>
                <form onSubmit={handleEntrar} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="contador@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="senha">Senha</Label>
                    <div className="relative">
                      <Input id="senha" type={mostrarSenha ? "text" : "password"} placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} className="pr-10" />
                      <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10" disabled={carregando}>
                    {carregando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Entrar
                  </Button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-400">
                  Não tem conta?{" "}
                  <button onClick={() => setModo("cadastrar")} className="text-teal-600 hover:underline font-medium">
                    Criar agora
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] h-full">
              {/* Painel esquerdo — planos (só desktop) */}
              <div className="hidden lg:flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-8 overflow-y-auto">
                <div className="flex items-center gap-2 mb-7">
                  <Image src="/logo.png" alt="Ágil Docs" width={28} height={28} className="w-7 h-7" />
                  <span className="font-bold text-white text-sm">Ágil Docs</span>
                </div>
                <h3 className="text-xl font-black text-white mb-1">Escolha seu plano</h3>
                <p className="text-slate-400 text-sm mb-6">Comece grátis. Upgrade quando crescer.</p>
                <div className="space-y-3 flex-1">
                  {planos.map((plano) => {
                    const selecionado = planoSelecionado === plano.key;
                    return (
                      <button
                        key={plano.key}
                        type="button"
                        onClick={() => setPlanoSelecionado(plano.key)}
                        className={`w-full text-left rounded-xl p-4 transition-all ${
                          selecionado
                            ? "bg-teal-500/25 border-2 border-teal-400 shadow-lg shadow-teal-500/10"
                            : "bg-slate-800/60 border border-slate-700/50 hover:border-slate-500/70 hover:bg-slate-700/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${selecionado ? "text-teal-300" : "text-white"}`}>
                              {plano.nome}
                            </span>
                            {plano.destaque && (
                              <span className="bg-teal-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-sm ${selecionado ? "text-teal-300" : "text-white"}`}>
                              {plano.preco}{plano.periodo}
                            </span>
                            {selecionado && (
                              <div className="w-4 h-4 rounded-full bg-teal-400 flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 text-slate-900" />
                              </div>
                            )}
                          </div>
                        </div>
                        <p className={`text-xs ${selecionado ? "text-teal-400" : "text-teal-500"}`}>{plano.limite}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-slate-600 text-xs mt-6">Sem cartão de crédito · Pagamento via PIX</p>
              </div>

              {/* Painel direito — formulário */}
              <div className="p-6 sm:p-8 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4 lg:hidden">
                  <Image src="/logo.png" alt="Ágil Docs" width={28} height={28} className="w-7 h-7" />
                  <span className="font-bold text-gray-900 text-sm">Ágil Docs</span>
                </div>
                <div className="mb-4">
                  <h2 className="text-xl font-black text-gray-900">Criar conta grátis</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Leva menos de 2 minutos</p>
                </div>
                <form onSubmit={handleCadastrar} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="nome">Nome completo *</Label>
                    <Input id="nome" placeholder="João Silva" value={nome} onChange={(e) => setNome(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="emailCad">E-mail *</Label>
                    <Input id="emailCad" type="email" placeholder="contador@email.com" value={emailCad} onChange={(e) => setEmailCad(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input id="telefone" type="tel" placeholder="(11) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="crc">CRC <span className="text-gray-400 font-normal">(opcional)</span></Label>
                    <Input id="crc" placeholder="CRC/SP-123456" value={crc} onChange={(e) => setCrc(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cpfCnpj">CPF / CNPJ *</Label>
                    <Input id="cpfCnpj" placeholder="000.000.000-00 ou 00.000.000/0000-00" value={cpfCnpj} onChange={(e) => setCpfCnpj(mascaraCpfCnpj(e.target.value))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="senhaCad">Senha *</Label>
                    <div className="relative">
                      <Input id="senhaCad" type={mostrarSenha ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={senhaCad} onChange={(e) => setSenhaCad(e.target.value)} required minLength={6} className="pr-10" />
                      <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmarSenha">Confirmar senha *</Label>
                    <Input id="confirmarSenha" type={mostrarSenha ? "text" : "password"} placeholder="Repita a senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required minLength={6} />
                    {confirmarSenha && senhaCad !== confirmarSenha && (
                      <p className="text-xs text-orange-500">As senhas não coincidem</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10" disabled={carregando}>
                    {carregando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {planoSelecionado === "free" ? "Criar conta grátis" : `Criar conta · Plano ${planos.find((p) => p.key === planoSelecionado)?.nome}`}
                  </Button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-400">
                  Já tem conta?{" "}
                  <button onClick={() => setModo("entrar")} className="text-teal-600 hover:underline font-medium">
                    Entrar
                  </button>
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
