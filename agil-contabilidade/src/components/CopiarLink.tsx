"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function CopiarLink({ slug }: { slug: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    const url = `${window.location.origin}/portal/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={copiar}
      className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-100 shrink-0"
    >
      {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copiado ? "Copiado!" : "Copiar"}
    </Button>
  );
}
