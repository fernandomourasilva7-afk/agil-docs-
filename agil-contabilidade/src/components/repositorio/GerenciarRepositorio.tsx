"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User, Building2, Plus, X, Loader2, FileText, FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { ativarRepositorio } from "@/app/actions/repositorio/ativar-repositorio";
import { criarCategoriaRepositorio } from "@/app/actions/repositorio/criar-categoria-repositorio";
import { removerCategoriaRepositorio } from "@/app/actions/repositorio/remover-categoria-repositorio";
import BaixarDocumento from "@/components/BaixarDocumento";
import VisualizarDocumentoRepositorio from "@/components/repositorio/VisualizarDocumentoRepositorio";

type DocRepositorio = {
  id: string;
  nome_arquivo: string;
  storage_path: string;
  tipo: string;
};

type CategoriaRepositorio = {
  id: string;
  nome: string;
  ordem: number;
  documentos_repositorio: DocRepositorio[];
};

type Repositorio = {
  id: string;
  tipo: "pf" | "pj";
  categorias_repositorio: CategoriaRepositorio[];
};

const TIPO_LABEL = { pf: "Pessoa Física", pj: "Pessoa Jurídica" };
const TIPO_ICON = { pf: User, pj: Building2 };

function SecaoRepositorio({
  repo,
  clienteId,
  onRemoverCategoria,
}: {
  repo: Repositorio;
  clienteId: string;
  onRemoverCategoria: (catId: string) => void;
}) {
  const Icon = TIPO_ICON[repo.tipo];
  const [novaCategoria, setNovaCategoria] = useState("");
  const [adicionando, setAdicionando] = useState(false);
  const [categorias, setCategorias] = useState(repo.categorias_repositorio);

  async function adicionarCategoria() {
    if (!novaCategoria.trim()) return;
    setAdicionando(true);
    const result = await criarCategoriaRepositorio(repo.id, novaCategoria, clienteId);
    setAdicionando(false);
    if (result.error) { toast.error(result.error); return; }
    setCategorias((prev) => [
      ...prev,
      { id: result.id!, nome: novaCategoria.trim(), ordem: prev.length, documentos_repositorio: [] },
    ]);
    setNovaCategoria("");
    toast.success("Categoria adicionada!");
  }

  async function remover(catId: string) {
    const result = await removerCategoriaRepositorio(catId, clienteId);
    if (result.error) { toast.error(result.error); return; }
    setCategorias((prev) => prev.filter((c) => c.id !== catId));
    onRemoverCategoria(catId);
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-teal-600" />
        <span className="font-semibold text-gray-700 text-sm">{TIPO_LABEL[repo.tipo]}</span>
        <Badge variant="secondary" className="text-xs">{categorias.length} categorias</Badge>
      </div>

      <div className="flex gap-2 mb-3">
        <Input
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionarCategoria()}
          placeholder="Nome da categoria (ex: Notas Médicas)"
          className="text-sm h-8"
          disabled={adicionando}
        />
        <Button size="sm" onClick={adicionarCategoria} disabled={adicionando || !novaCategoria.trim()} className="h-8 gap-1 bg-teal-600 hover:bg-teal-700">
          {adicionando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        </Button>
      </div>

      {categorias.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Nenhuma categoria ainda. Adicione acima.</p>
      ) : (
        <div className="space-y-3">
          {categorias.map((cat) => (
            <div key={cat.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-teal-500" />
                  <span className="text-sm font-medium text-gray-700">{cat.nome}</span>
                  {cat.documentos_repositorio.length > 0 && (
                    <Badge className="bg-teal-100 text-teal-700 border-0 text-[10px]">
                      {cat.documentos_repositorio.length} arquivo{cat.documentos_repositorio.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
                <button onClick={() => remover(cat.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {cat.documentos_repositorio.length > 0 ? (
                <ul className="space-y-1.5">
                  {cat.documentos_repositorio.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between gap-2 text-sm bg-white rounded px-2 py-1.5 border border-gray-100">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate text-gray-700 text-xs">{doc.nome_arquivo}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <VisualizarDocumentoRepositorio
                          storagePath={doc.storage_path}
                          nomeArquivo={doc.nome_arquivo}
                          tipo={doc.tipo ?? ""}
                        />
                        <BaixarDocumentoRepositorio
                          storagePath={doc.storage_path}
                          nomeArquivo={doc.nome_arquivo}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">Nenhum documento enviado ainda.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline download component for repositorio bucket
function BaixarDocumentoRepositorio({ storagePath, nomeArquivo }: { storagePath: string; nomeArquivo: string }) {
  const [baixando, setBaixando] = useState(false);

  async function baixar() {
    const { createClient } = await import("@/lib/supabase/client");
    setBaixando(true);
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("repositorio").download(storagePath);
    setBaixando(false);
    if (error || !data) { toast.error("Erro ao baixar arquivo."); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = nomeArquivo; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button size="sm" variant="ghost" onClick={baixar} disabled={baixando}
      className="gap-1 text-gray-500 hover:text-blue-600 shrink-0 h-6 px-1.5">
      {baixando ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className="text-[10px]">Baixar</span>}
    </Button>
  );
}

export default function GerenciarRepositorio({
  clienteId,
  repositoriosIniciais,
}: {
  clienteId: string;
  repositoriosIniciais: Repositorio[];
}) {
  const [repositorios, setRepositorios] = useState(repositoriosIniciais);
  const [ativando, setAtivando] = useState<string | null>(null);

  const temPf = repositorios.some((r) => r.tipo === "pf");
  const temPj = repositorios.some((r) => r.tipo === "pj");

  async function toggleTipo(tipo: "pf" | "pj", ativo: boolean) {
    if (!ativo) {
      const temDocs = repositorios
        .find((r) => r.tipo === tipo)
        ?.categorias_repositorio.some((c) => c.documentos_repositorio.length > 0);
      if (temDocs && !confirm(`Isso vai apagar o repositório ${tipo.toUpperCase()} e todos os documentos enviados. Confirmar?`)) return;
    }
    setAtivando(tipo);
    const result = await ativarRepositorio(clienteId, tipo, ativo);
    setAtivando(null);
    if (result.error) { toast.error(result.error); return; }
    if (ativo) {
      setRepositorios((prev) => [...prev, { id: `temp-${tipo}`, tipo, categorias_repositorio: [] }]);
    } else {
      setRepositorios((prev) => prev.filter((r) => r.tipo !== tipo));
    }
    toast.success(ativo ? `Repositório ${tipo.toUpperCase()} ativado!` : `Repositório ${tipo.toUpperCase()} desativado.`);
  }

  return (
    <Card className="border-teal-200">
      <CardHeader className="py-4 px-5 pb-0">
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-teal-600" />
          Repositório Anual de Documentos
        </CardTitle>
        <p className="text-xs text-gray-500 mt-1">
          Ative PF e/ou PJ para que o cliente possa enviar documentos ao longo do ano.
        </p>
      </CardHeader>

      <CardContent className="pt-4 px-5 pb-5">
        <div className="flex gap-3 flex-wrap">
          {(["pf", "pj"] as const).map((tipo) => {
            const ativo = tipo === "pf" ? temPf : temPj;
            const Icon = TIPO_ICON[tipo];
            const carregando = ativando === tipo;
            return (
              <button
                key={tipo}
                onClick={() => toggleTipo(tipo, !ativo)}
                disabled={carregando}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                  ativo
                    ? "border-teal-400 bg-teal-50 text-teal-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                {carregando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                {TIPO_LABEL[tipo]}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${ativo ? "bg-teal-200 text-teal-800" : "bg-gray-100 text-gray-400"}`}>
                  {ativo ? "Ativo" : "Inativo"}
                </span>
              </button>
            );
          })}
        </div>

        {repositorios.map((repo) => (
          <SecaoRepositorio
            key={repo.tipo}
            repo={repo}
            clienteId={clienteId}
            onRemoverCategoria={() => {}}
          />
        ))}

        {repositorios.length === 0 && (
          <p className="text-sm text-gray-400 italic mt-4">
            Ative Pessoa Física e/ou Pessoa Jurídica para começar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
