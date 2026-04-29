export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { QrCodePix } from "qrcode-pix";
import { CheckCircle2, Download, Clock } from "lucide-react";
import Image from "next/image";
import BotaoCopiar from "@/components/BotaoCopiar";

type Props = { params: Promise<{ slug: string }> };

export default async function PagamentoPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: raw } = await supabase
    .from("clientes")
    .select("id, nome, pix_chave, pix_nome, pix_cidade, pix_valor, pagamento_confirmado")
    .eq("slug", slug)
    .single();

  if (!raw) notFound();

  const cliente = raw as {
    id: string;
    nome: string;
    pix_chave: string | null;
    pix_nome: string | null;
    pix_cidade: string | null;
    pix_valor: number | null;
    pagamento_confirmado: boolean | null;
  };

  if (!cliente.pix_chave || !cliente.pix_valor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-sm w-full text-center shadow-sm">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="font-bold text-gray-700 mb-2">Link ainda não disponível</h2>
          <p className="text-sm text-gray-400">
            Seu contador ainda está preparando sua declaração. Tente novamente em breve.
          </p>
        </div>
      </div>
    );
  }

  const pagamentoConfirmado = cliente.pagamento_confirmado ?? false;
  const valor = Number(cliente.pix_valor);

  let qrBase64: string | null = null;
  let pixPayload: string | null = null;
  let downloadUrls: { nome: string; url: string }[] = [];

  function limparTexto(str: string, maxLen: number): string {
    return str
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^\x20-\x7E]/g, "")
      .trim()
      .slice(0, maxLen);
  }

  if (!pagamentoConfirmado) {
    const nomeLimpo   = limparTexto(cliente.pix_nome   ?? "Contador",  25);
    const cidadeLimpa = limparTexto(cliente.pix_cidade ?? "SAO PAULO", 15).toUpperCase();
    const mensagem    = limparTexto(`IR ${cliente.nome}`,              40);
    const txId = `AGIL${slug}`.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 25);

    const qr = QrCodePix({
      version: "01",
      key: cliente.pix_chave,
      name: nomeLimpo,
      city: cidadeLimpa,
      transactionId: txId,
      message: mensagem,
      value: valor,
    });

    pixPayload = qr.payload();
    qrBase64 = await qr.base64();
  } else {
    const admin = createAdminClient();
    const { data: docs } = await admin
      .from("documentos_finais")
      .select("nome_arquivo, storage_path")
      .eq("cliente_id", cliente.id);

    for (const doc of docs ?? []) {
      const { data: urlData } = await admin.storage
        .from("ir-finalizado")
        .createSignedUrl(doc.storage_path, 3600);

      if (urlData?.signedUrl) {
        downloadUrls.push({ nome: doc.nome_arquivo, url: urlData.signedUrl });
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 border-b border-slate-700/60">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Image src="/logo.png" alt="Ágil Docs" width={32} height={32} className="w-8 h-8" />
          <span className="font-bold text-white">Ágil Docs</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Olá, {cliente.nome}!</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {pagamentoConfirmado
              ? "Pagamento confirmado! Seus documentos estão disponíveis abaixo."
              : "Sua declaração de IR está pronta. Realize o pagamento para acessar os documentos."}
          </p>
        </div>

        {pagamentoConfirmado ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Pagamento confirmado!</p>
                <p className="text-sm text-green-600">
                  Baixe seus documentos abaixo. Os links ficam disponíveis por 1 hora.
                </p>
              </div>
            </div>

            {downloadUrls.length > 0 ? (
              <div className="space-y-2">
                {downloadUrls.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-teal-300 hover:bg-teal-50 transition-all"
                  >
                    <Download className="w-5 h-5 text-teal-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-800 truncate flex-1">{doc.nome}</span>
                    <span className="text-xs text-teal-600 shrink-0 font-medium">Baixar</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                Nenhum documento disponível ainda. Entre em contato com seu contador.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Valor do serviço</p>
              <p className="text-4xl font-bold text-gray-900 mb-6">
                R${" "}
                {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>

              {qrBase64 && (
                <div className="flex justify-center mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrBase64}
                    alt="QR Code PIX"
                    width={220}
                    height={220}
                    className="rounded-xl border border-gray-100"
                  />
                </div>
              )}

              <p className="text-sm text-gray-500 mb-2">ou use o código Pix Copia e Cola:</p>
              <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-600 break-all mb-4 text-left border border-gray-100">
                {pixPayload}
              </div>

              {pixPayload && <BotaoCopiar texto={pixPayload} />}
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-teal-800 mb-2">Como pagar:</p>
              <ol className="text-sm text-teal-700 space-y-1 list-decimal list-inside">
                <li>Abra o app do seu banco</li>
                <li>Acesse a área PIX</li>
                <li>Escaneie o QR code ou cole o código acima</li>
                <li>Confirme o valor e finalize o pagamento</li>
                <li>Aguarde seu contador confirmar o recebimento</li>
              </ol>
            </div>

            <p className="text-center text-xs text-gray-400">
              Após o pagamento, seu contador irá liberar os documentos nesta página.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
