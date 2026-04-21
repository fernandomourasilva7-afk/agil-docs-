"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 text-white rounded-xl p-2">
          <FolderOpen className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ágil Docs</h1>
          <p className="text-sm text-gray-500">Repositório para Contadores</p>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>{modo === "entrar" ? "Entrar na conta" : "Criar conta"}</CardTitle>
          <CardDescription>
            {modo === "entrar"
              ? "Acesse seu painel de clientes"
              : "Crie sua conta de contador"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
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
            <div className="space-y-1">
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
            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {modo === "entrar" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            {modo === "entrar" ? (
              <>
                Não tem conta?{" "}
                <button
                  onClick={() => setModo("cadastrar")}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Criar conta gratuita
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  onClick={() => setModo("entrar")}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Entrar
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
