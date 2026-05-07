"use client";

import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { gerarUrlRepositorio } from "@/app/actions/repositorio/gerar-url-repositorio";

const OFFICE_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.ms-excel",
];

const EXT_TO_TIPO: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  heic: "image/heic",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

function resolverTipo(tipo: string, nomeArquivo: string): string {
  if (tipo) return tipo.toLowerCase();
  const ext = nomeArquivo.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_TIPO[ext] ?? "";
}

export default function VisualizarDocumentoRepositorio({
  storagePath, nomeArquivo, tipo,
}: {
  storagePath: string;
  nomeArquivo: string;
  tipo: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  async function visualizar() {
    setCarregando(true);
    const result = await gerarUrlRepositorio(storagePath);
    setCarregando(false);
    if (result.error || !result.url) { toast.error("Erro ao carregar visualização."); return; }
    setUrl(result.url);
    setAberto(true);
  }

  function renderPrevia() {
    if (!url) return null;
    const t = resolverTipo(tipo, nomeArquivo);
    if (t === "application/pdf")
      return <iframe src={url} className="w-full h-[70vh] rounded border-0" title={nomeArquivo} />;
    if (t.startsWith("image/") && t !== "image/heic")
      return (
        <div className="flex items-center justify-center bg-gray-50 rounded p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={nomeArquivo} className="max-w-full max-h-[70vh] object-contain rounded" />
        </div>
      );
    if (OFFICE_TYPES.includes(t))
      return <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`} className="w-full h-[70vh] rounded border-0" title={nomeArquivo} />;
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-gray-500">
        <p className="text-sm text-center">
          {t === "image/heic" ? "Arquivos HEIC não são suportados pelo navegador. Baixe o arquivo para visualizar." : "Este formato não suporta prévia no navegador."}
        </p>
        <a href={url} download={nomeArquivo}><Button variant="outline" size="sm">Baixar arquivo</Button></a>
      </div>
    );
  }

  return (
    <>
      <Button size="sm" variant="ghost" onClick={visualizar} disabled={carregando}
        className="gap-1 text-gray-500 hover:text-teal-600 shrink-0 h-6 px-1.5">
        {carregando ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
        <span className="text-[10px]">Ver</span>
      </Button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="truncate pr-8 text-sm font-medium text-gray-700">{nomeArquivo}</DialogTitle>
          </DialogHeader>
          {renderPrevia()}
        </DialogContent>
      </Dialog>
    </>
  );
}
