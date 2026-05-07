"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User, Building2, Plus, X, Loader2, FileText, FolderOpen, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { ativarRepositorio } from "@/app/actions/repositorio/ativar-repositorio";
import { criarCategoriaRepositorio } from "@/app/actions/repositorio/criar-categoria-repositorio";
import { removerCategoriaRepositorio } from "@/app/actions/repositorio/remover-categoria-repositorio";
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

const TIPO_CONFIG = {
  pf: { label: "Pessoa Física", Icon: User, cor: "teal" },
  pj: { label: "CNPJ", Icon: Building2, cor: "blue" },
} as const;

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

function BlocoRepositorio({
  tipo,
  clienteId,
  repo,
  ativando,
  onToggle,
}: {
  tipo: "pf" | "pj";
  clienteId: string;
  repo: Repositorio | null;
  ativando: boolean;
  onToggle: (ativo: boolean) => void;
}) {
  const { label, Icon } = TIPO_CONFIG[tipo];
  const ativo = repo !== null;

  const [novaCategoria, setNovaCategoria] = useState("");
  const [adicionando, setAdicionando] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaRepositorio[]>(
    repo?.categorias_repositorio ?? []
  );

  // Sync when repo changes (activated externally)
  const repoId = repo?.id ?? null;

  async function adicionarCategoria() {
    if (!novaCategoria.trim() || !repoId) return;
    setAdicionando(true);
    const result = await criarCategoriaRepositorio(repoId, novaCategoria, clienteId);
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
  }

  const totalDocs = categorias.reduce((acc, c) => acc + c.documentos_repositorio.length, 0);

  return (
    <div className={`rounded-2xl border-2 transition-all ${
      ativo ? "border-teal-200 bg-white shadow-sm" : "border-gray-200 bg-gray-50/60"
    }`}>
      {/* Header do bloco */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            ativo ? "bg-teal-100" : "bg-gray-100"
          }`}>
            <Icon className={`w-4 h-4 ${ativo ? "text-teal-600" : "text-gray-400"}`} />
          </div>
          <div>
            <p className={`font-semibold text-sm ${ativo ? "text-gray-800" : "text-gray-400"}`}>{label}</p>
            {ativo && totalDocs > 0 && (
              <p className="text-xs text-teal-600">{totalDocs} documento{totalDocs > 1 ? "s" : ""} enviado{totalDocs > 1 ? "s" : ""}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onToggle(!ativo)}
          disabled={ativando}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            ativo
              ? "bg-teal-100 text-teal-700 hover:bg-red-50 hover:text-red-600"
              : "bg-gray-100 text-gray-500 hover:bg-teal-50 hover:text-teal-600"
          }`}
        >
          {ativando ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : ativo ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : null}
          {ativo ? "Ativo" : "Inativo"}
        </button>
      </div>

      {/* Conteúdo — só se ativo */}
      {ativo && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          {/* Input adicionar categoria */}
          <div className="flex gap-2">
            <Input
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionarCategoria()}
              placeholder={`Nova categoria (ex: ${tipo === "pf" ? "Notas Médicas" : "Notas Fiscais"})`}
              className="text-sm h-8"
              disabled={adicionando}
            />
            <Button
              size="sm"
              onClick={adicionarCategoria}
              disabled={adicionando || !novaCategoria.trim()}
              className="h-8 gap-1 bg-teal-600 hover:bg-teal-700 shrink-0"
            >
              {adicionando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* Lista de categorias */}
          {categorias.length === 0 ? (
            <p className="text-xs text-gray-400 italic">
              Nenhuma categoria ainda. Adicione uma acima.
            </p>
          ) : (
            <div className="space-y-2">
              {categorias.map((cat) => (
                <div key={cat.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5 text-teal-500" />
                      <span className="text-sm font-medium text-gray-700">{cat.nome}</span>
                      {cat.documentos_repositorio.length > 0 && (
                        <Badge className="bg-teal-100 text-teal-700 border-0 text-[10px]">
                          {cat.documentos_repositorio.length} arq.
                        </Badge>
                      )}
                    </div>
                    <button
                      onClick={() => remover(cat.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {cat.documentos_repositorio.length > 0 ? (
                    <ul className="space-y-1">
                      {cat.documentos_repositorio.map((doc) => (
                        <li key={doc.id} className="flex items-center justify-between gap-2 bg-white rounded px-2 py-1.5 border border-gray-100">
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
      )}
    </div>
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

  function getRepo(tipo: "pf" | "pj") {
    return repositorios.find((r) => r.tipo === tipo) ?? null;
  }

  async function toggleTipo(tipo: "pf" | "pj", ativo: boolean) {
    if (!ativo) {
      const temDocs = getRepo(tipo)?.categorias_repositorio.some(
        (c) => c.documentos_repositorio.length > 0
      );
      if (
        temDocs &&
        !confirm(`Isso vai apagar o repositório ${TIPO_CONFIG[tipo].label} e todos os documentos enviados. Confirmar?`)
      ) return;
    }
    setAtivando(tipo);
    const result = await ativarRepositorio(clienteId, tipo, ativo);
    setAtivando(null);
    if (result.error) { toast.error(result.error); return; }
    if (ativo) {
      setRepositorios((prev) => [
        ...prev,
        { id: result.id ?? `temp-${tipo}-${Date.now()}`, tipo, categorias_repositorio: [] },
      ]);
    } else {
      setRepositorios((prev) => prev.filter((r) => r.tipo !== tipo));
    }
    toast.success(
      ativo
        ? `Repositório ${TIPO_CONFIG[tipo].label} ativado!`
        : `Repositório ${TIPO_CONFIG[tipo].label} desativado.`
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {(["pf", "pj"] as const).map((tipo) => (
        <BlocoRepositorio
          key={tipo}
          tipo={tipo}
          clienteId={clienteId}
          repo={getRepo(tipo)}
          ativando={ativando === tipo}
          onToggle={(ativo) => toggleTipo(tipo, ativo)}
        />
      ))}
    </div>
  );
}
