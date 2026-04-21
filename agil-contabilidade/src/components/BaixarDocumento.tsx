"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function BaixarDocumento({
  storagePath,
  nomeArquivo,
}: {
  storagePath: string;
  nomeArquivo: string;
}) {
  async function baixar() {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("documentos")
      .download(storagePath);

    if (error || !data) {
      toast.error("Erro ao baixar arquivo.");
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={baixar}
      className="gap-1 text-gray-500 hover:text-blue-600 shrink-0 h-7 px-2"
    >
      <Download className="w-3.5 h-3.5" />
      <span className="text-xs">Baixar</span>
    </Button>
  );
}
