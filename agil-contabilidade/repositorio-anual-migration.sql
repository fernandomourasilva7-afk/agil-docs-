-- ============================================================
-- Repositório Anual — Migration
-- Execute no Supabase: SQL Editor → cole tudo e clique em Run
-- ============================================================

-- 1. Tabela: repositorios (PF ou PJ por cliente)
CREATE TABLE IF NOT EXISTS repositorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('pf', 'pj')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cliente_id, tipo)
);

-- 2. Tabela: categorias dentro de cada repositório
CREATE TABLE IF NOT EXISTS categorias_repositorio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repositorio_id UUID NOT NULL REFERENCES repositorios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela: documentos enviados pelo cliente
CREATE TABLE IF NOT EXISTS documentos_repositorio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID NOT NULL REFERENCES categorias_repositorio(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  tamanho INT,
  tipo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RLS
ALTER TABLE repositorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_repositorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_repositorio ENABLE ROW LEVEL SECURITY;

-- repositorios: contador gerencia os próprios
CREATE POLICY "contador_gerencia_repositorios" ON repositorios
  USING (EXISTS (
    SELECT 1 FROM clientes
    WHERE clientes.id = repositorios.cliente_id
    AND clientes.contador_id = auth.uid()
  ));

-- repositorios: portal lê sem autenticação
CREATE POLICY "publico_le_repositorios" ON repositorios
  FOR SELECT USING (true);

-- categorias_repositorio: contador gerencia
CREATE POLICY "contador_gerencia_cat_repositorio" ON categorias_repositorio
  USING (EXISTS (
    SELECT 1 FROM repositorios
    JOIN clientes ON clientes.id = repositorios.cliente_id
    WHERE repositorios.id = categorias_repositorio.repositorio_id
    AND clientes.contador_id = auth.uid()
  ));

-- categorias_repositorio: portal lê sem autenticação
CREATE POLICY "publico_le_cat_repositorio" ON categorias_repositorio
  FOR SELECT USING (true);

-- documentos_repositorio: cliente insere sem autenticação (portal público)
CREATE POLICY "publico_insere_docs_repositorio" ON documentos_repositorio
  FOR INSERT WITH CHECK (true);

-- documentos_repositorio: contador lê os próprios clientes
CREATE POLICY "contador_le_docs_repositorio" ON documentos_repositorio
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM clientes
    WHERE clientes.id = documentos_repositorio.cliente_id
    AND clientes.contador_id = auth.uid()
  ));

-- ============================================================
-- Depois de rodar este SQL:
-- Crie o bucket "repositorio" no Supabase Storage:
--   Storage → New Bucket → nome: repositorio → Public: OFF
-- Depois adicione as políticas do bucket:
--   INSERT: true (público)
--   SELECT: (auth.uid() is not null)
-- ============================================================
