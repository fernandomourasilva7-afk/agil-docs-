import Link from 'next/link'
import Image from 'next/image'
import {
  Check, MessageCircle, ArrowRight, FileText, Link2,
  CheckCircle2, Clock, TrendingUp, Shield, Zap, Users,
  Star, ChevronDown, AlertCircle, Smartphone, BarChart3,
  FolderOpen, RefreshCw, Award
} from 'lucide-react'

const WHATSAPP = '5583987095584'

const planos = [
  {
    key: 'free',
    nome: 'Free',
    preco: 0,
    limiteTexto: '5 clientes',
    destaque: false,
    badge: null,
    features: [
      'Portal de upload sem login',
      '8 categorias do IR',
      'Link único por cliente',
      'Painel Kanban de status',
      'Cobrança via PIX',
    ],
  },
  {
    key: 'starter',
    nome: 'Starter',
    preco: 36.99,
    limiteTexto: '20 clientes',
    destaque: false,
    badge: null,
    features: [
      'Tudo do Free',
      'Download de documentos',
      'Histórico de envios',
      'Suporte por e-mail',
    ],
  },
  {
    key: 'profissional',
    nome: 'Profissional',
    preco: 65,
    limiteTexto: '50 clientes',
    destaque: true,
    badge: 'Mais popular',
    features: [
      'Tudo do Starter',
      'Relatórios de progresso',
      'Suporte prioritário',
      'Múltiplas temporadas',
      'Personalização de categorias',
    ],
  },
  {
    key: 'escritorio',
    nome: 'Escritório',
    preco: 299,
    limiteTexto: 'Clientes ilimitados',
    destaque: false,
    badge: null,
    features: [
      'Tudo do Profissional',
      'Clientes ilimitados',
      'Configuração assistida',
      'Suporte dedicado',
      'Onboarding personalizado',
    ],
  },
]

const dores = [
  { icon: Smartphone, texto: 'WhatsApp lotado de documentos sem nome e sem ordem' },
  { icon: AlertCircle, texto: 'Clientes que somem e só aparecem na última semana do prazo' },
  { icon: FolderOpen, texto: 'Documentos espalhados em e-mail, Drive, pendrive e papel' },
  { icon: Clock, texto: 'Horas perdidas cobrando o mesmo cliente três vezes' },
  { icon: RefreshCw, texto: 'Declaração atrasada por falta de um único documento' },
  { icon: TrendingUp, texto: 'Crescer sem contratar mais parece impossível' },
]

const beneficios = [
  {
    icon: Link2,
    titulo: 'Link único por cliente',
    desc: 'Cada cliente recebe um portal exclusivo para enviar documentos. Sem login, sem burocracia.',
  },
  {
    icon: BarChart3,
    titulo: 'Kanban em tempo real',
    desc: 'Veja exatamente onde cada cliente está: link enviado, docs recebidos, declaração em andamento ou finalizada.',
  },
  {
    icon: FileText,
    titulo: 'Categorias do IR organizadas',
    desc: '8 categorias prontas baseadas na declaração de IRPF. Nenhum documento vai para o lugar errado.',
  },
  {
    icon: Zap,
    titulo: 'Cobrança via PIX integrada',
    desc: 'Cobre seus clientes pelo serviço diretamente do sistema, sem precisar de outro app.',
  },
  {
    icon: Shield,
    titulo: 'Documentos seguros na nuvem',
    desc: 'Tudo armazenado com segurança. Acesse de qualquer lugar, a qualquer hora.',
  },
  {
    icon: Award,
    titulo: 'Profissionalismo visível',
    desc: 'Seus clientes vão perceber a diferença. Portal com a sua marca, experiência sem atrito.',
  },
]

const depoimentos = [
  {
    nome: 'Carla Mendonça',
    cargo: 'Contadora autônoma — Recife, PE',
    foto: 'CM',
    texto: 'Antes eu vivia no WhatsApp pedindo documento. Hoje envio o link e aguardo. Minha produtividade triplicou na temporada do IR.',
    estrelas: 5,
  },
  {
    nome: 'Roberto Alves',
    cargo: 'Sócio — Alves Contabilidade',
    foto: 'RA',
    texto: 'O painel Kanban me deu visão total do escritório. Sei exatamente quem está em dia e quem precisa de atenção. Nunca mais perdi prazo.',
    estrelas: 5,
  },
  {
    nome: 'Fernanda Souza',
    cargo: 'Contadora — Escritório FS',
    foto: 'FS',
    texto: 'Meus clientes adoram o portal. Eles mesmos enviam tudo pelo celular. Parece que eu contratei um assistente, mas foi só o Ágil Docs.',
    estrelas: 5,
  },
]

const faqs = [
  {
    q: 'Meu cliente precisa criar uma conta para enviar os documentos?',
    a: 'Não. O portal do cliente é 100% sem login. Basta acessar o link gerado e enviar os arquivos. Simples como mandar foto no WhatsApp.',
  },
  {
    q: 'Posso personalizar as categorias de documentos?',
    a: 'Sim. Você escolhe quais categorias ativar para cada cliente na hora do cadastro. Não precisa usar todas as 8 categorias padrão.',
  },
  {
    q: 'Os dados e documentos dos meus clientes ficam seguros?',
    a: 'Sim. Os documentos são armazenados com criptografia no Supabase (infraestrutura AWS). Seus clientes estão protegidos.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim, sem fidelidade e sem multa. Você cancela a qualquer momento. O plano Free é para sempre, sem cartão de crédito.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: 'Você paga via PIX mensalmente. O acesso é liberado em minutos após a confirmação do pagamento.',
  },
  {
    q: 'Funciona para escritório com vários contadores?',
    a: 'O plano Escritório é ideal para isso. Com clientes ilimitados e suporte dedicado, seu escritório escala sem dor de cabeça.',
  },
]

function BrowserMockup({ children, url }: { children: React.ReactNode; url: string }) {
  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 px-3 py-2 flex items-center gap-1.5 border-b border-gray-200">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <div className="flex-1 bg-white rounded-md h-5 mx-2 text-[9px] text-gray-400 flex items-center px-2 border border-gray-200">
          {url}
        </div>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

function KanbanMockup() {
  const cols = [
    { label: 'Link Enviado', dot: 'bg-blue-400', badge: 'bg-blue-100 text-blue-700', cards: [{ nome: 'João Silva', pct: 20, dot: 'bg-red-400', bar: 'bg-orange-400' }, { nome: 'Ana Costa', pct: 30, dot: 'bg-orange-400', bar: 'bg-orange-400' }] },
    { label: 'Docs Enviados', dot: 'bg-violet-400', badge: 'bg-violet-100 text-violet-700', cards: [{ nome: 'Maria Lima', pct: 65, dot: 'bg-amber-400', bar: 'bg-amber-400' }, { nome: 'Carlos R.', pct: 50, dot: 'bg-amber-400', bar: 'bg-amber-400' }] },
    { label: 'IR Finalizado', dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700', cards: [{ nome: 'Lúcia M.', pct: 100, dot: 'bg-emerald-400', bar: 'from-emerald-400 to-teal-500' }, { nome: 'Rafael S.', pct: 100, dot: 'bg-emerald-400', bar: 'from-emerald-400 to-teal-500' }] },
  ]
  return (
    <div className="flex gap-2 overflow-hidden">
      {cols.map((col) => (
        <div key={col.label} className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${col.dot}`} />
            <span className="text-[9px] font-bold text-gray-600 truncate">{col.label}</span>
            <span className={`ml-auto text-[9px] px-1 rounded-full font-bold shrink-0 ${col.badge}`}>{col.cards.length}</span>
          </div>
          <div className="space-y-1.5">
            {col.cards.map((card) => (
              <div key={card.nome} className={`rounded-lg p-2 border ${card.pct === 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-1 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${card.dot}`} />
                  <span className="text-[9px] font-semibold text-gray-700 truncate">{card.nome}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                  <div className={`h-1 rounded-full ${card.pct === 100 ? `bg-gradient-to-r ${card.bar}` : card.bar}`} style={{ width: `${card.pct}%` }} />
                </div>
                <span className={`text-[8px] font-bold ${card.pct === 100 ? 'text-emerald-600' : 'text-gray-400'}`}>{card.pct}%{card.pct === 100 ? ' ✓' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PortalMockup() {
  const cats = [
    { nome: 'Informe de Rendimentos', ok: true },
    { nome: 'Comprovante de Renda', ok: true },
    { nome: 'Plano de Saúde', ok: false },
    { nome: 'Previdência Privada', ok: false },
  ]
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        <div className="w-5 h-5 bg-teal-600 rounded-md flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">A</span>
        </div>
        <div>
          <p className="text-[9px] font-bold text-gray-800">Olá, João Silva</p>
          <p className="text-[8px] text-gray-400">Envie seus documentos abaixo</p>
        </div>
      </div>
      {cats.map((cat) => (
        <div key={cat.nome} className={`flex items-center gap-2 p-2 rounded-lg border ${cat.ok ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-200'}`}>
          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${cat.ok ? 'bg-teal-500' : 'bg-gray-200'}`}>
            {cat.ok ? <span className="text-white text-[8px]">✓</span> : <span className="text-gray-400 text-[8px]">+</span>}
          </div>
          <span className="text-[9px] text-gray-700 flex-1 truncate">{cat.nome}</span>
          {!cat.ok && <span className="text-[8px] text-teal-600 font-bold shrink-0">Enviar</span>}
        </div>
      ))}
      <div className="mt-2 bg-gray-50 rounded-lg p-2 border border-dashed border-gray-300 text-center">
        <span className="text-[8px] text-gray-400">Progresso: 2/4 documentos</span>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
          <div className="h-1 rounded-full bg-teal-500" style={{ width: '50%' }} />
        </div>
      </div>
    </div>
  )
}

function CadastroMockup() {
  return (
    <div className="space-y-2">
      <div className="mb-3">
        <p className="text-[9px] font-bold text-gray-700 mb-1">Nome do cliente</p>
        <div className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5">
          <span className="text-[9px] text-gray-600">João Silva</span>
        </div>
      </div>
      <p className="text-[9px] font-bold text-gray-700 mb-1">Categorias de documentos</p>
      {['Informe de Rendimentos', 'Comprovante de Renda', 'Plano de Saúde', 'Previdência Privada'].map((cat) => (
        <div key={cat} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-teal-500 flex items-center justify-center shrink-0">
            <span className="text-white text-[7px]">✓</span>
          </div>
          <span className="text-[9px] text-gray-600">{cat}</span>
        </div>
      ))}
      <div className="mt-3 bg-teal-600 rounded-lg py-1.5 text-center">
        <span className="text-[9px] text-white font-bold">Gerar link do cliente →</span>
      </div>
      <div className="bg-teal-50 border border-teal-200 rounded-md px-2 py-1">
        <span className="text-[8px] text-teal-600">agil-docs.vercel.app/portal/joao-silva</span>
      </div>
    </div>
  )
}

export default function PlanosPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Ágil Docs" width={32} height={32} className="w-8 h-8" />
            <span className="text-white font-bold text-lg">Ágil Docs</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-300 hover:text-white text-sm transition-colors hidden sm:block">
              Entrar
            </Link>
            <Link
              href="/"
              className="bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 rounded-full px-3 py-1 text-teal-300 text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                O sistema dos contadores de alto desempenho
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5">
                Chega de documento{' '}
                <span className="text-teal-400">perdido</span>{' '}
                no WhatsApp.
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                Ágil Docs centraliza toda a coleta de documentos do IR dos seus clientes em um único painel.
                Você envia um link, eles enviam os documentos. Simples assim.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-teal-900/50"
                >
                  Começar grátis agora
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-colors border border-white/20"
                >
                  Ver como funciona
                  <ChevronDown className="w-4 h-4" />
                </a>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-400" />Sem cartão de crédito</span>
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-400" />Acesso imediato</span>
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-400" />Cancele quando quiser</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <BrowserMockup url="agil-docs.vercel.app/dashboard">
                <KanbanMockup />
              </BrowserMockup>
            </div>
          </div>
        </div>
      </section>

      {/* ── NÚMEROS ── */}
      <section className="bg-teal-600 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[
            { num: '< 2 min', label: 'para cadastrar um cliente' },
            { num: '100%', label: 'sem login para o cliente' },
            { num: '8', label: 'categorias do IR prontas' },
            { num: '0 reais', label: 'para começar' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-3xl font-black mb-1">{item.num}</p>
              <p className="text-teal-100 text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOR ── */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-teal-600 font-bold text-sm uppercase tracking-wider mb-3">Você se identifica com isso?</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Trabalhar sem sistema é trabalhar para a bagunça dos seus clientes.
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Profissionais de alto desempenho não dependem de sorte — eles têm processo.
              Se você ainda depende de WhatsApp para coletar documentos, o problema não é o cliente.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dores.map((dor) => {
              const Icon = dor.icon
              return (
                <div key={dor.texto} className="bg-white rounded-xl p-5 border border-gray-200 flex items-start gap-3 shadow-sm">
                  <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{dor.texto}</p>
                </div>
              )
            })}
          </div>
          <div className="mt-10 bg-slate-900 rounded-2xl p-6 text-center">
            <p className="text-white text-lg font-bold mb-1">
              "Cada documento perdido é uma declaração atrasada e um cliente insatisfeito."
            </p>
            <p className="text-slate-400 text-sm">Com Ágil Docs, isso não acontece mais.</p>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" className="bg-white py-20 px-4 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-teal-600 font-bold text-sm uppercase tracking-wider mb-3">Em 3 passos simples</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Do cadastro à declaração entregue.
            </h2>
            <p className="text-gray-500 text-lg">
              Seu novo fluxo de trabalho — sem WhatsApp, sem planilha, sem retrabalho.
            </p>
          </div>

          <div className="space-y-16">
            {/* Passo 1 */}
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white font-black text-lg mb-5">1</div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Cadastre o cliente em menos de 2 minutos</h3>
                <p className="text-gray-500 leading-relaxed mb-5">
                  Informe o nome do cliente e escolha as categorias de documentos que você precisa.
                  O sistema gera automaticamente um link exclusivo — pronto para enviar pelo WhatsApp, e-mail ou onde preferir.
                </p>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                  <span>Link personalizado por cliente, gerado em segundos</span>
                </div>
              </div>
              <BrowserMockup url="agil-docs.vercel.app/clientes/novo">
                <CadastroMockup />
              </BrowserMockup>
            </div>

            {/* Passo 2 */}
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="order-2 lg:order-1">
                <BrowserMockup url="agil-docs.vercel.app/portal/joao-silva">
                  <PortalMockup />
                </BrowserMockup>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white font-black text-lg mb-5">2</div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">O cliente envia pelo celular — sem criar conta</h3>
                <p className="text-gray-500 leading-relaxed mb-5">
                  O cliente acessa o portal pelo link, vê exatamente quais documentos faltam e envia direto do celular.
                  Zero atrito, zero desculpa. Você para de ficar cobrando.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                    <span>Sem login, sem app, sem burocracia para o cliente</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                    <span>Progresso visível: o cliente sabe o que ainda falta enviar</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white font-black text-lg mb-5">3</div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Acompanhe tudo no painel Kanban</h3>
                <p className="text-gray-500 leading-relaxed mb-5">
                  Em uma tela só, você vê o status de todos os seus clientes: quem está com documentos completos,
                  quem está faltando e quem já teve a declaração entregue. Sem planilha, sem surpresa.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                    <span>Arraste o cliente de coluna em coluna conforme avança</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                    <span>Barra de progresso por cliente — nunca mais esqueça ninguém</span>
                  </div>
                </div>
              </div>
              <BrowserMockup url="agil-docs.vercel.app/dashboard">
                <KanbanMockup />
              </BrowserMockup>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFÍCIOS ── */}
      <section className="bg-slate-900 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-teal-400 font-bold text-sm uppercase tracking-wider mb-3">Tudo que você precisa</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Organização que representa sua marca.
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Cada funcionalidade foi pensada para a realidade do contador brasileiro na temporada do IR.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {beneficios.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.titulo} className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-teal-500/50 transition-colors group">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-500/30 transition-colors">
                    <Icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <h3 className="text-white font-bold mb-2">{b.titulo}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{b.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PARA QUEM É ── */}
      <section className="bg-teal-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Para quem é o Ágil Docs?</h2>
          <p className="text-gray-500 mb-10 text-lg">
            Se você declara IR para outras pessoas, o Ágil Docs é para você.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { titulo: 'Contador autônomo', desc: 'Que atende de 5 a 50 clientes e quer crescer sem virar escravo do WhatsApp.', icon: Users },
              { titulo: 'Escritório pequeno', desc: 'Com 2 a 5 contadores que precisam de visão centralizada de todos os clientes.', icon: TrendingUp },
              { titulo: 'Qualquer contador', desc: 'Que quer entregar mais com menos esforço e parecer mais profissional para os clientes.', icon: Award },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.titulo} className="bg-white rounded-xl p-6 border border-teal-100 shadow-sm text-left">
                  <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.titulo}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-teal-600 font-bold text-sm uppercase tracking-wider mb-3">Quem já usa</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              Contadores que pararam de perder tempo.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {depoimentos.map((d) => (
              <div key={d.nome} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: d.estrelas }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">"{d.texto}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {d.foto}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{d.nome}</p>
                    <p className="text-xs text-gray-400">{d.cargo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="bg-gray-50 py-20 px-4 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-teal-600 font-bold text-sm uppercase tracking-wider mb-3">Investimento</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Comece grátis. Cresça com o Ágil Docs.
            </h2>
            <p className="text-gray-500 text-lg">
              Sem fidelidade. Sem surpresa. Cancele quando quiser.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {planos.map((plano) => (
              <div
                key={plano.key}
                className={`relative bg-white rounded-2xl p-6 shadow-sm flex flex-col border transition-all hover:shadow-md ${
                  plano.destaque
                    ? 'border-teal-500 ring-2 ring-teal-500 ring-offset-2 scale-105'
                    : 'border-gray-200'
                }`}
              >
                {plano.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-md">
                      {plano.badge}
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{plano.nome}</h3>
                  {plano.preco === 0 ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-gray-900">Grátis</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-gray-400 self-start mt-1.5">R$</span>
                      <span className="text-4xl font-black text-gray-900">
                        {Number.isInteger(plano.preco) ? plano.preco : plano.preco.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-sm text-gray-400">/mês</span>
                    </div>
                  )}
                  <p className="text-teal-600 font-semibold text-sm mt-1.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {plano.limiteTexto}
                  </p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plano.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {plano.preco === 0 ? (
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold h-11 rounded-xl transition-colors"
                  >
                    Começar grátis
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <a
                    href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Quero contratar o plano ${plano.nome} do Ágil Docs. Pode me ajudar?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 w-full text-white text-sm font-bold h-11 rounded-xl transition-all hover:scale-[1.02] ${
                      plano.destaque
                        ? 'bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-200'
                        : 'bg-slate-900 hover:bg-slate-700'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contratar via WhatsApp
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center space-y-2">
            <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-teal-500" />
              Pagamento via PIX · Acesso liberado em minutos · Sem fidelidade
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Perguntas frequentes</h2>
            <p className="text-gray-500">Ficou com dúvida? A resposta provavelmente está aqui.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-5">
                  <p className="font-bold text-gray-900 mb-2">{faq.q}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 py-20 px-4 text-center text-white">
        <div className="max-w-2xl mx-auto">
          <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-7 h-7 text-teal-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-5">
            Você pode continuar perdendo documento no WhatsApp.
            <span className="text-teal-400"> Ou pode mudar agora.</span>
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Profissionais de alto desempenho não esperam o problema crescer para agir.
            Comece grátis, sem cartão de crédito, e veja a diferença na primeira semana.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-black text-lg px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-xl shadow-teal-900/50"
          >
            Criar minha conta grátis
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-slate-500 text-sm mt-4">
            Sem cartão · Sem compromisso · Ative em 2 minutos
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-950 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Image src="/logo.png" alt="Ágil Docs" width={24} height={24} className="w-6 h-6 opacity-70" />
          <span className="text-slate-400 text-sm font-medium">Ágil Docs</span>
        </div>
        <p className="text-slate-600 text-xs">
          © {new Date().getFullYear()} Ágil Docs · Todos os direitos reservados
        </p>
      </footer>

    </div>
  )
}
