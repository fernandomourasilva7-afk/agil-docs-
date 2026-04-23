'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'

type StatusData = { nome: string; total: number; cor: string }
type MesData = { mes: string; clientes: number }
type ReceitaMesData = { mes: string; confirmada: number; pendente: number }

type Props = {
  statusData: StatusData[]
  mesesData: MesData[]
  receitaMesData: ReceitaMesData[]
  temHonorario: boolean
}

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#f1f5f9',
  fontSize: '13px',
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function PipelineChart({ data }: { data: StatusData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
        <YAxis
          dataKey="nome"
          type="category"
          width={110}
          tick={{ fontSize: 12, fill: '#64748b' }}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: '#f8fafc' }}
          formatter={(v) => [v, 'Clientes']}
        />
        <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.cor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function StatusDonut({ data }: { data: StatusData[] }) {
  const total = data.reduce((s, d) => s + d.total, 0)
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <PieChart width={180} height={180}>
          <Pie
            data={data}
            cx={90}
            cy={90}
            innerRadius={54}
            outerRadius={80}
            dataKey="total"
            paddingAngle={2}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.cor} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, _, props) => [v, (props.payload as { nome?: string })?.nome ?? '']}
          />
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-gray-900">{total}</span>
          <span className="text-xs text-gray-400">clientes</span>
        </div>
      </div>
      <div className="w-full space-y-1.5">
        {data.map((d) => (
          <div key={d.nome} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.cor }} />
              <span className="text-gray-600">{d.nome}</span>
            </div>
            <span className="font-semibold text-gray-800">{d.total}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ClientesMesChart({ data }: { data: MesData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="gradClientes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} width={28} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v) => [v, 'Novos clientes']}
        />
        <Area
          type="monotone"
          dataKey="clientes"
          stroke="#14b8a6"
          strokeWidth={2.5}
          fill="url(#gradClientes)"
          dot={{ fill: '#14b8a6', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function ReceitaMesChart({ data }: { data: ReceitaMesData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} width={48} tickFormatter={(v) => `R$${v}`} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v, key) => [
            formatBRL(Number(v)),
            key === 'confirmada' ? 'Recebido' : 'A receber',
          ]}
        />
        <Bar dataKey="confirmada" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={32} name="Recebido" />
        <Bar dataKey="pendente" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={32} name="A receber" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function MetricasCharts({ statusData, mesesData, receitaMesData, temHonorario }: Props) {
  return (
    <div className="space-y-6">
      {/* Pipeline + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Pipeline de clientes</h3>
          <p className="text-sm text-gray-400 mb-5">Quantidade por etapa do processo</p>
          <PipelineChart data={statusData} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Distribuição</h3>
          <p className="text-sm text-gray-400 mb-5">Visão geral dos status</p>
          <StatusDonut data={statusData} />
        </div>
      </div>

      {/* Clientes por mês + Receita por mês */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Novos clientes</h3>
          <p className="text-sm text-gray-400 mb-5">Últimos 6 meses</p>
          <ClientesMesChart data={mesesData} />
        </div>

        {temHonorario ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-1">Receita mensal</h3>
            <p className="text-sm text-gray-400 mb-5">Recebido vs. a receber — últimos 6 meses</p>
            <ReceitaMesChart data={receitaMesData} />
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-slate-500 text-lg">💰</span>
            </div>
            <div>
              <p className="font-semibold text-slate-600 text-sm">Receita indisponível</p>
              <p className="text-xs text-slate-400 mt-1">
                Cadastre o valor do honorário nos clientes para ativar este gráfico.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
