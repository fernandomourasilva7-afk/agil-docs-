# Setup — Ágil Docs MVP

## 1. Criar projeto no Supabase

1. Acesse https://supabase.com e crie um projeto
2. Aguarde o projeto ficar pronto (~2 min)

## 2. Configurar variáveis de ambiente

Edite o arquivo `.env.local` com suas credenciais:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Você encontra esses valores em: **Supabase > Project Settings > API**

## 3. Criar as tabelas (banco de dados)

1. No Supabase, vá em **SQL Editor**
2. Cole e execute o conteúdo do arquivo `supabase-schema.sql`

## 4. Criar o bucket de armazenamento

1. No Supabase, vá em **Storage > New bucket**
2. Nome: `documentos`
3. **Public bucket: NÃO** (deixe privado)
4. Clique em "Create bucket"

### Policies do bucket

Ainda em Storage, clique no bucket `documentos` > **Policies** > **New policy**:

**Policy 1 — Upload público (portal do cliente):**
- Policy name: `upload_publico`
- Allowed operation: INSERT
- Target roles: (deixe vazio = anon)
- Policy definition: `true`

**Policy 2 — Leitura para o contador:**
- Policy name: `leitura_autenticado`
- Allowed operation: SELECT
- Target roles: `authenticated`
- Policy definition: `true`

## 5. Rodar o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## 6. Fluxo de uso

1. **Contador** cria conta em `/` (cadastrar)
2. Confirma e-mail (verifique a caixa de entrada)
3. Entra no painel → cria um cliente
4. Copia o link gerado (ex: `/portal/joao-silva-abc1`)
5. Envia o link para o cliente pelo WhatsApp ou e-mail
6. **Cliente** acessa o link, faz upload dos documentos por categoria
7. **Contador** vê tudo organizado no painel

## Estrutura do projeto

```
src/
  app/
    page.tsx              → Login/cadastro do contador
    dashboard/page.tsx    → Painel com lista de clientes
    clientes/
      novo/page.tsx       → Criar novo cliente
      [id]/page.tsx       → Detalhes do cliente + documentos
    portal/[slug]/page.tsx → Portal público do cliente (sem login)
    auth/callback/route.ts → Callback de autenticação
  components/
    LogoutButton.tsx      → Botão de sair
    CopiarLink.tsx        → Copiar link do cliente
    BaixarDocumento.tsx   → Download de arquivo
    PortalUpload.tsx      → Interface de upload do cliente
  lib/supabase/
    client.ts             → Supabase browser client
    server.ts             → Supabase server client
```
