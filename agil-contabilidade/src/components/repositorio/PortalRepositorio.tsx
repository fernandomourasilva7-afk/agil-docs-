"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  User, Building2, FolderOpen,
  CheckCircle2, Upload, Loader2, FileText, X,
} from "lucide-react";

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

const TIPO_LABEL = { pf: "Pessoa Física", pj: "CNPJ" };
const TIPO_ICON = { pf: User, pj: Building2 };
const TIPO_COLOR = {
  pf: {
    header: "bg-teal-600",
    badge: "bg-teal-500",
    btn: "bg-teal-600 hover:bg-teal-700",
  },
  pj: {
    header: "bg-slate-700",
    badge: "bg-slate-600",
    btn: "bg-slate-700 hover:bg-slate-800",
  },
};

function CategoriaUpload({
  cat,
  clienteId,
  repositorioId,
  corBtn,
}: {
  cat: CategoriaRepositorio;
  clienteId: string;
  repositorioId: string;
  corBtn: string;
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
    setSelecionados((prev) => {
      const l = [...prev];
      l.splice(index, 1);
      return l;
    });
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

      if (errUpload) {
        toast.error(`Erro ao enviar ${arquivo.name}`);
        continue;
      }

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

      if (errDB) toast.error(`Erro ao registrar ${arquivo.name}`);
    }

    setQuantidade((prev) => prev + selecionados.length);
    toast.success(
      `${selecionados.length} arquivo${selecionados.length > 1 ? "s" : ""} enviado${selecionados.length > 1 ? "s" : ""}!`
    );
    setSelecionados([]);
    setEnviando(false);
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 space-y-2 shadow-sm">
      <div className="flex items-center gap-2">
        {quantidade > 0 ? (
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        ) : (
          <FolderOpen className="w-4 h-4 text-gray-400 shrink-0" />
        )}
        <span className="text-sm font-medium text-gray-700 flex-1">{cat.nome}</span>
        {quantidade > 0 && (
          <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
            {quantidade} arq.
          </span>
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
            <li
              key={i}
              className="flex items-center justify-between gap-2 bg-gray-50 rounded px-2 py-1 text-xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <FileText className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="truncate text-gray-600">{f.name}</span>
              </div>
              <button
                onClick={() => removerArquivo(i)}
                className="text-gray-400 hover:text-red-500 shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 flex-1 h-7 text-xs"
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
        >
          <FileText className="w-3 h-3" />
          Selecionar
        </Button>
        {selecionados.length > 0 && (
          <Button
            size="sm"
            className={`gap-1.5 h-7 text-xs text-white ${corBtn}`}
            onClick={enviar}
            disabled={enviando}
          >
            {enviando ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Upload className="w-3 h-3" />
            )}
            Enviar ({selecionados.length})
          </Button>
        )}
      </div>
    </div>
  );
}

function CardRepositorio({
  repo,
  clienteId,
}: {
  repo: Repositorio;
  clienteId: string;
}) {
  const cores = TIPO_COLOR[repo.tipo];
  const label = repo.tipo === "pf" ? "CPF" : "CNPJ";
  const totalEnviados = repo.categorias.reduce(
    (acc, c) => acc + (c.quantidade > 0 ? 1 : 0),
    0
  );
  const totalCats = repo.categorias.length;
  const pct = totalCats > 0 ? Math.round((totalEnviados / totalCats) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header estilo mockup */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <div>
          <p className="text-gray-400 text-sm font-medium">declaração</p>
          <p className="text-4xl font-bold text-gray-900 mt-1">{label}</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold mt-1">
          +{pct}%
        </span>
      </div>

      {/* Sub-categorias */}
      <div className="border-t border-gray-100 px-4 pt-3 pb-4 space-y-2">
        {repo.categorias.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-4">
            Nenhuma categoria configurada.
          </p>
        ) : (
          repo.categorias.map((cat) => (
            <CategoriaUpload
              key={cat.id}
              cat={cat}
              clienteId={clienteId}
              repositorioId={repo.id}
              corBtn={cores.btn}
            />
          ))
        )}
        <p className="text-xs text-gray-400 pt-1">
          Aceita: PDF, JPG, PNG, HEIC, DOC, DOCX, XLS, XLSX
        </p>
      </div>
    </div>
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
    <div className="space-y-4 mb-6">
      {repositorios.map((repo) => (
        <CardRepositorio key={repo.id} repo={repo} clienteId={clienteId} />
      ))}
    </div>
  );
}
