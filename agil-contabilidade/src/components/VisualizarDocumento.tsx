"use client";

import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { gerarUrlVisualizacao } from "@/app/actions/gerar-url-visualizacao";

const OFFICE_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.ms-excel",
];

export default function VisualizarDocumento({
  storagePath,
  nomeArquivo,
  tipo,
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
    const result = await gerarUrlVisualizacao(storagePath);
    setCarregando(false);

    if (result.error || !result.url) {
      toast.error("Erro ao carregar visualização.");
      return;
    }

    setUrl(result.url);
    setAberto(true);
  }

  function renderPrevia() {
    if (!url) return null;

    const tipoLower = tipo.toLowerCase();

    if (tipoLower === "application/pdf") {
      return (
        <iframe
          src={url}
          className="w-full h-[70vh] rounded border-0"
          title={nomeArquivo}
        />
      );
    }

    if (tipoLower.startsWith("image/") && tipoLower !== "image/heic") {
      return (
        <div className="flex items-center justify-center bg-gray-50 rounded p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={nomeArquivo}
            className="max-w-full max-h-[70vh] object-contain rounded"
          />
        </div>
      );
    }

    if (OFFICE_TYPES.includes(tipoLower)) {
      const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
      return (
        <iframe
          src={viewerUrl}
          className="w-full h-[70vh] rounded border-0"
          title={nomeArquivo}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-gray-500">
        <p className="text-sm text-center">
          Este formato não suporta prévia no navegador.
        </p>
        <a href={url} download={nomeArquivo}>
          <Button variant="outline" size="sm">
            Baixar arquivo
          </Button>
        </a>
      </div>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={visualizar}
        disabled={carregando}
        className="gap-1 text-gray-500 hover:text-teal-600 shrink-0 h-7 px-2"
      >
        {carregando ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        )}
        <span className="text-xs">Ver</span>
      </Button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="truncate pr-8 text-sm font-medium text-gray-700">
              {nomeArquivo}
            </DialogTitle>
          </DialogHeader>
          {renderPrevia()}
        </DialogContent>
      </Dialog>
    </>
  );
}
