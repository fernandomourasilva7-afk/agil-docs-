"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FolderOpen, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    const supabase = createClient();

    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) {
        toast.error("E-mail ou senha incorretos.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password: senha });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
        setModo("entrar");
      }
    }
    setCarregando(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-teal-500 text-white rounded-2xl p-3 mb-4 shadow-lg shadow-teal-500/25">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Ágil Docs</h1>
          <p className="text-slate-400 text-sm mt-1">Repositório para Contadores</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            {modo === "entrar" ? "Bem-vindo de volta" : "Criar conta"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {modo === "entrar" ? "Entre para acessar seu painel" : "Crie sua conta de contador"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="contador@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10 mt-2"
              disabled={carregando}
            >
              {carregando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {modo === "entrar" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            {modo === "entrar" ? (
              <>
                Não tem conta?{" "}
                <button onClick={() => setModo("cadastrar")} className="text-teal-600 hover:underline font-medium">
                  Criar conta gratuita
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button onClick={() => setModo("entrar")} className="text-teal-600 hover:underline font-medium">
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
