"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  User, Building2, ChevronDown, ChevronUp, FolderOpen,
  CheckCircle2, Upload, Loader2, FileText, X,
} from "lucide-react";

type DocRepositorio = { id: string; nome_arquivo: string };

type CategoriaRepositorio = {
  id: string;
  nome: string;
  quantidade: number;
};

type Repositorio = {
  id: string;
  tipo: "pf" | "pj";
  categorias: CategoriaRepositorio[];
};

const TIPO_LABEL = { pf: "Pessoa Física", pj: "Pessoa Jurídica" };
const TIPO_ICON = { pf: User, pj: Building2 };

function CategoriaUpload({
  cat,
  clienteId,
  repositorioId,
}: {
  cat: CategoriaRepositorio;
  clienteId: string;
  repositorioId: string;
}) {
  const [quantidade, setQuantidade] = useState(cat.quantidade);
  const [enviando, setEnviando] = useState(false);
  const [selecionados, setSelecionados] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSelecionarArquivos(files: FileList | null) {
    if (!files) return;
    setSelecionados((prev) => [...prev, ...Array.from(files)]);
  }

  function removerArquivo(index: number) {
    setSelecionados((prev) => { const l = [...prev]; l.splice(index, 1); return l; });
  }

  async function enviar() {
    if (!selecionados.length) return;
    setEnviando(true);
    const supabase = createClient();

    for (const arquivo of selecionados) {
      const ext = arquivo.name.split(".").pop();
      const path = `${clienteId}/${repositorioId}/${cat.id}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

      const { error: errUpload } = await supabase.storage
        .from("repositorio")
        .upload(path, arquivo);

      if (errUpload) { toast.error(`Erro ao enviar ${arquivo.name}`); continue; }

      const { error: errDB } = await supabase
        .from("documentos_repositorio")
        .insert({
          categoria_id: cat.id,
          cliente_id: clienteId,
          nome_arquivo: arquivo.name,
          storage_path: path,
          tamanho: arquivo.size,
          tipo: arquivo.type,
        });

      if (errDB) { toast.error(`Erro ao registrar ${arquivo.name}`); }
    }

    setQuantidade((prev) => prev + selecionados.length);
    toast.success(`${selecionados.length} arquivo${selecionados.length > 1 ? "s" : ""} enviado${selecionados.length > 1 ? "s" : ""}!`);
    setSelecionados([]);
    setEnviando(false);
  }

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-2">
      <div className="flex items-center gap-2">
        {quantidade > 0 ? (
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        ) : (
          <FolderOpen className="w-4 h-4 text-gray-400 shrink-0" />
        )}
        <span className="text-sm font-medium text-gray-700">{cat.nome}</span>
        {quantidade > 0 && (
          <span className="text-xs text-green-600">{quantidade} arquivo{quantidade > 1 ? "s" : ""}</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx,.xls,.xlsx"
        className="hidden"
        onChange={(e) => handleSelecionarArquivos(e.target.files)}
      />

      {selecionados.length > 0 && (
        <ul className="space-y-1">
          {selecionados.map((f, i) => (
            <li key={i} className="flex items-center justify-between gap-2 bg-white rounded px-2 py-1 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <FileText className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="truncate text-gray-600">{f.name}</span>
              </div>
              <button onClick={() => removerArquivo(i)} className="text-gray-400 hover:text-red-500 shrink-0">
                <X className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 flex-1 h-7 text-xs"
          onClick={() => inputRef.current?.click()} disabled={enviando}>
          <FileText className="w-3 h-3" />
          Selecionar
        </Button>
        {selecionados.length > 0 && (
          <Button size="sm" className="gap-1.5 h-7 text-xs bg-teal-600 hover:bg-teal-700"
            onClick={enviar} disabled={enviando}>
            {enviando ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            Enviar ({selecionados.length})
          </Button>
        )}
      </div>
    </div>
  );
}

function CardRepositorio({ repo, clienteId }: { repo: Repositorio; clienteId: string }) {
  const [aberto, setAberto] = useState(false);
  const Icon = TIPO_ICON[repo.tipo];
  const totalEnviados = repo.categorias.filter((c) => c.quantidade > 0).length;

  return (
    <Card className="border-gray-200">
      <button className="w-full text-left" onClick={() => setAberto((p) => !p)}>
        <CardContent className="py-4 px-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <Icon className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{TIPO_LABEL[repo.tipo]}</p>
              <p className="text-xs text-gray-500">
                {totalEnviados}/{repo.categorias.length} categorias com documentos
              </p>
            </div>
          </div>
          {aberto ? (
            <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          )}
        </CardContent>
      </button>

      {aberto && (
        <div className="border-t border-gray-100 px-5 pb-4 pt-3 space-y-2">
          {repo.categorias.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Nenhuma categoria configurada ainda.</p>
          ) : (
            repo.categorias.map((cat) => (
              <CategoriaUpload key={cat.id} cat={cat} clienteId={clienteId} repositorioId={repo.id} />
            ))
          )}
          <p className="text-xs text-gray-400 pt-1">
            Aceita: PDF, JPG, PNG, HEIC, DOC, DOCX, XLS, XLSX
          </p>
        </div>
      )}
    </Card>
  );
}

export default function PortalRepositorio({
  clienteId,
  repositorios,
}: {
  clienteId: string;
  repositorios: Repositorio[];
}) {
  if (repositorios.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-900">Repositório Anual de Documentos</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Envie seus documentos ao longo do ano para facilitar sua declaração.
        </p>
      </div>
      <div className="space-y-3">
        {repositorios.map((repo) => (
          <CardRepositorio key={repo.id} repo={repo} clienteId={clienteId} />
        ))}
      </div>
    </div>
  );
}
