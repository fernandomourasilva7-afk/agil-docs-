"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { registrarContador } from "@/app/actions/registrar-contador";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FolderOpen, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const router = useRouter();

  // Login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Cadastro
  const [nome, setNome] = useState("");
  const [emailCad, setEmailCad] = useState("");
  const [telefone, setTelefone] = useState("");
  const [crc, setCrc] = useState("");
  const [senhaCad, setSenhaCad] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  async function handleEntrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      toast.error("E-mail ou senha incorretos.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    setCarregando(false);
  }

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();

    if (senhaCad !== confirmarSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (senhaCad.length < 6) {
      toast.error("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (crc.trim().length < 3) {
      toast.error("Informe um CRC válido.");
      return;
    }

    setCarregando(true);
    try {
      await registrarContador({
        nome,
        email: emailCad,
        telefone,
        crc,
        senha: senhaCad,
      });
      toast.success("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
      setModo("entrar");
      setEmail(emailCad);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar conta.");
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
          {modo === "entrar" ? (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Bem-vindo de volta</h2>
              <p className="text-sm text-gray-500 mb-6">Entre para acessar seu painel</p>

              <form onSubmit={handleEntrar} className="space-y-4">
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
                  <div className="relative">
                    <Input
                      id="senha"
                      type={mostrarSenha ? "text" : "password"}
                      placeholder="••••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10 mt-2" disabled={carregando}>
                  {carregando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Entrar
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Criar conta</h2>
              <p className="text-sm text-gray-500 mb-5">Preencha seus dados para se cadastrar</p>

              <form onSubmit={handleCadastrar} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Nome completo *</Label>
                  <Input
                    id="nome"
                    placeholder="João Silva"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="emailCad">E-mail *</Label>
                  <Input
                    id="emailCad"
                    type="email"
                    placeholder="contador@email.com"
                    value={emailCad}
                    onChange={(e) => setEmailCad(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="crc">CRC *</Label>
                  <Input
                    id="crc"
                    placeholder="CRC/SP-123456"
                    value={crc}
                    onChange={(e) => setCrc(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-400">Número do seu registro no Conselho Regional de Contabilidade</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="senhaCad">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="senhaCad"
                      type={mostrarSenha ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={senhaCad}
                      onChange={(e) => setSenhaCad(e.target.value)}
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmarSenha">Confirmar senha *</Label>
                  <Input
                    id="confirmarSenha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                    minLength={6}
                  />
                  {confirmarSenha && senhaCad !== confirmarSenha && (
                    <p className="text-xs text-red-500">As senhas não coincidem</p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10 mt-1" disabled={carregando}>
                  {carregando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Criar conta
                </Button>
              </form>
            </>
          )}

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
