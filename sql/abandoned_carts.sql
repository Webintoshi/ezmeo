-- Sepet Takip Tablosu (Var olan tabloyu güncellemek için)
-- Önce tabloyu kontrol et, yoksa oluştur
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  customer_id UUID REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  items JSONB DEFAULT '[]'::jsonb,
  total DECIMAL(10,2) DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'abandoned',
  recovered BOOLEAN DEFAULT false,
  recovered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eğer tablo varsa ama kolonlar eksikse, kolonları ekle
-- status kolonunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'abandoned_carts' AND column_name = 'status'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN status TEXT DEFAULT 'abandoned';
  END IF;
END $$;

-- recovered kolonunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'abandoned_carts' AND column_name = 'recovered'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN recovered BOOLEAN DEFAULT false;
  END IF;
END $$;

-- recovered_at kolonunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'abandoned_carts' AND column_name = 'recovered_at'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN recovered_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- İndeksler (varsa yeniden oluşturma)
DROP INDEX IF EXISTS idx_abandoned_carts_status;
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_status ON abandoned_carts(status);

DROP INDEX IF EXISTS idx_abandoned_carts_created_at;
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_created_at ON abandoned_carts(created_at);

DROP INDEX IF EXISTS idx_abandoned_carts_email;
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON abandoned_carts(email);

DROP INDEX IF EXISTS idx_abandoned_carts_session_id;
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_session_id ON abandoned_carts(session_id);

-- RLS (Row Level Security) - zaten varsa hata vermez
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Admin erişimi için politika (varsa sil ve yeniden oluştur)
DROP POLICY IF EXISTS "Admin full access to abandoned_carts" ON abandoned_carts;
CREATE POLICY "Admin full access to abandoned_carts" ON abandoned_carts
  FOR ALL TO authenticated
  USING (true);

-- Sepet Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION update_abandoned_cart()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS update_abandoned_cart_trigger ON abandoned_carts;
CREATE TRIGGER update_abandoned_cart_trigger
  BEFORE UPDATE ON abandoned_carts
  FOR EACH ROW
  EXECUTE FUNCTION update_abandoned_cart();
