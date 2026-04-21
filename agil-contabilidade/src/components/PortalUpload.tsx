"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CheckCircle2, Clock, Upload, Loader2, ChevronDown, ChevronUp, FileText, X
} from "lucide-react";

type Categoria = { id: string; nome: string; quantidade: number };

export default function PortalUpload({
  clienteId,
  categorias: catInicial,
}: {
  clienteId: string;
  categorias: Categoria[];
}) {
  const [categorias, setCategorias] = useState(catInicial);
  const [aberta, setAberta] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [arquivosSelecionados, setArquivosSelecionados] = useState<Record<string, File[]>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement>>({});

  function toggleCategoria(id: string) {
    setAberta((prev) => (prev === id ? null : id));
  }

  function handleSelecionarArquivos(catId: string, files: FileList | null) {
    if (!files) return;
    const novos = Array.from(files);
    setArquivosSelecionados((prev) => ({
      ...prev,
      [catId]: [...(prev[catId] ?? []), ...novos],
    }));
  }

  function removerArquivo(catId: string, index: number) {
    setArquivosSelecionados((prev) => {
      const lista = [...(prev[catId] ?? [])];
      lista.splice(index, 1);
      return { ...prev, [catId]: lista };
    });
  }

  async function enviarArquivos(catId: string) {
    const arquivos = arquivosSelecionados[catId] ?? [];
    if (!arquivos.length) {
      toast.warning("Selecione ao menos um arquivo.");
      return;
    }

    const supabase = createClient();
    setEnviando(catId);

    for (const arquivo of arquivos) {
      const ext = arquivo.name.split(".").pop();
      const path = `${clienteId}/${catId}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

      const { error: errUpload } = await supabase.storage
        .from("documentos")
        .upload(path, arquivo);

      if (errUpload) {
        toast.error(`Erro ao enviar ${arquivo.name}`);
        continue;
      }

      const { error: errDB } = await supabase.from("documentos").insert({
        categoria_id: catId,
        cliente_id: clienteId,
        nome_arquivo: arquivo.name,
        storage_path: path,
        tamanho: arquivo.size,
        tipo: arquivo.type,
      });

      if (errDB) {
        toast.error(`Erro ao registrar ${arquivo.name}`);
      }
    }

    setCategorias((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, quantidade: c.quantidade + arquivos.length }
          : c
      )
    );
    setArquivosSelecionados((prev) => ({ ...prev, [catId]: [] }));
    toast.success(`${arquivos.length} arquivo${arquivos.length > 1 ? "s" : ""} enviado${arquivos.length > 1 ? "s" : ""}!`);
    setEnviando(null);
  }

  return (
    <div className="space-y-3">
      {categorias.map((cat) => {
        const temDocs = cat.quantidade > 0;
        const isAberta = aberta === cat.id;
        const estaEnviando = enviando === cat.id;
        const selecionados = arquivosSelecionados[cat.id] ?? [];

        return (
          <Card
            key={cat.id}
            className={`border transition-all ${temDocs ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-white"}`}
          >
            <button
              className="w-full text-left"
              onClick={() => toggleCategoria(cat.id)}
            >
              <CardContent className="py-4 px-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {temDocs ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-300 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{cat.nome}</p>
                    {temDocs && (
                      <p className="text-xs text-green-600">{cat.quantidade} arquivo{cat.quantidade > 1 ? "s" : ""} enviado{cat.quantidade > 1 ? "s" : ""}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!temDocs && (
                    <Badge variant="secondary" className="text-xs hidden sm:flex">Pendente</Badge>
                  )}
                  {isAberta ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </CardContent>
            </button>

            {isAberta && (
              <div className="border-t border-gray-100 px-5 pb-4 pt-3">
                <input
                  ref={(el) => { if (el) inputRefs.current[cat.id] = el; }}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                  onChange={(e) => handleSelecionarArquivos(cat.id, e.target.files)}
                />

                {selecionados.length > 0 && (
                  <ul className="space-y-1.5 mb-3">
                    {selecionados.map((f, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 bg-gray-50 rounded px-3 py-1.5 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate text-gray-700">{f.name}</span>
                        </div>
                        <button onClick={() => removerArquivo(cat.id, i)} className="text-gray-400 hover:text-red-500">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 flex-1"
                    onClick={() => inputRefs.current[cat.id]?.click()}
                    disabled={estaEnviando}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Selecionar arquivos
                  </Button>
                  {selecionados.length > 0 && (
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => enviarArquivos(cat.id)}
                      disabled={estaEnviando}
                    >
                      {estaEnviando ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      Enviar {selecionados.length > 0 && `(${selecionados.length})`}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Aceita: PDF, JPG, PNG, HEIC, DOC, DOCX, XLS, XLSX
                </p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
