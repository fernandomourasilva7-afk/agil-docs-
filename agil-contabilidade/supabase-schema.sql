-- ============================================
-- SCHEMA: Ágil Docs — Repositório para Contadores
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Tabela de clientes
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  contador_id uuid references auth.users(id) on delete cascade not null,
  nome text not null,
  cpf text,
  email text,
  slug text unique not null,
  status text not null default 'link_enviado' check (status in ('link_enviado', 'falta_documentos', 'documentos_enviados', 'fazendo_declaracao', 'ir_finalizado')),
  created_at timestamptz default now()
);

-- Migração: adicionar status em banco existente
-- ALTER TABLE clientes ADD COLUMN status text NOT NULL DEFAULT 'link_enviado'
-- CHECK (status IN ('link_enviado', 'falta_documentos', 'documentos_enviados', 'fazendo_declaracao', 'ir_finalizado'));

-- Tabela de categorias de documentos
create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete cascade not null,
  nome text not null,
  ordem int not null default 0,
  created_at timestamptz default now()
);

-- Tabela de documentos enviados
create table if not exists documentos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid references categorias(id) on delete cascade not null,
  cliente_id uuid references clientes(id) on delete cascade not null,
  nome_arquivo text not null,
  storage_path text not null,
  tamanho int,
  tipo text,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table clientes enable row level security;
alter table categorias enable row level security;
alter table documentos enable row level security;

-- Contador vê/edita apenas seus próprios clientes
create policy "contador_gerencia_clientes" on clientes
  for all using (contador_id = auth.uid());

-- Acesso público para leitura de clientes pelo slug (portal do cliente)
create policy "publico_le_clientes" on clientes
  for select using (true);

-- Contador vê categorias dos seus clientes
create policy "contador_gerencia_categorias" on categorias
  for all using (
    cliente_id in (select id from clientes where contador_id = auth.uid())
  );

-- Acesso público para leitura de categorias (portal do cliente)
create policy "publico_le_categorias" on categorias
  for select using (true);

-- Público pode inserir documentos (portal do cliente, sem login)
create policy "publico_insere_documentos" on documentos
  for insert with check (true);

-- Contador pode ver documentos dos seus clientes
create policy "contador_le_documentos" on documentos
  for select using (
    cliente_id in (select id from clientes where contador_id = auth.uid())
  );

-- ============================================
-- STORAGE: Bucket para os arquivos
-- ============================================
-- 1. Vá em Storage > New Bucket
-- 2. Nome: documentos
-- 3. Marque "Public bucket": NÃO (privado)
-- 4. Adicione as seguintes policies no bucket:

-- Policy de upload público (portal do cliente):
-- INSERT: true (sem autenticação)

-- Policy de leitura para o contador:
-- SELECT: auth.uid() is not null
