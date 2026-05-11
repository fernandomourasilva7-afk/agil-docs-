"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Trash2, Loader2 } from "lucide-react"
import { deletarCliente } from "@/app/actions/deletar-cliente"

export default function DeletarCliente({
  clienteId,
  clienteNome,
}: {
  clienteId: string
  clienteNome: string
}) {
  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function confirmar() {
    setCarregando(true)
    const r = await deletarCliente(clienteId)
    if (r?.error) {
      toast.error(r.error)
      setCarregando(false)
      setAberto(false)
    }
    // Se sucesso: o redirect() dentro da action redireciona para /dashboard
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setAberto(true)}
        className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
      >
        <Trash2 className="w-4 h-4" />
        Excluir cliente
      </Button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir cliente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir{" "}
              <span className="font-semibold text-foreground">{clienteNome}</span>?
              Todos os documentos, categorias e arquivos serão apagados
              permanentemente. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={carregando}
              onClick={() => setAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmar}
              disabled={carregando}
              className="gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              {carregando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Sim, excluir tudo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
