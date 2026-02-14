-- Sepet Takip Tablosu - Var olan tabloyu güncellemek için
-- Tüm kolonları kontrol et ve ekle

-- session_id kolonunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'abandoned_carts' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN session_id TEXT;
  END IF;
END $$;

-- customer_id kolonunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'abandoned_carts' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN customer_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- first_name kolonunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'abandoned_carts' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN first_name TEXT;
  END IF;
END $$;

-- last_name kolonunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'abandoned_carts' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN last_name TEXT;
  END IF;
END $$;

-- email kolonunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'abandoned_carts' AND column_name = 'email'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN email TEXT;
  END IF;
END $$;

-- phone kolonunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'abandoned_carts' AND column_name = 'phone'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN phone TEXT;
  END IF;
END $$;

-- is_anonymous kolonunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'abandoned_carts' AND column_name = 'is_anonymous'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN is_anonymous BOOLEAN DEFAULT true;
  END IF;
END $$;

-- items kolonunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'abandoned_carts' AND column_name = 'items'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN items JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- total kolonunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'abandoned_carts' AND column_name = 'total'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN total DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- item_count kolonunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'abandoned_carts' AND column_name = 'item_count'
  ) THEN
    ALTER TABLE abandoned_carts ADD COLUMN item_count INTEGER DEFAULT 0;
  END IF;
END $$;

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

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_status ON abandoned_carts(status);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_created_at ON abandoned_carts(created_at);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON abandoned_carts(email);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_session_id ON abandoned_carts(session_id);

-- RLS
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to abandoned_carts" ON abandoned_carts;
CREATE POLICY "Admin full access to abandoned_carts" ON abandoned_carts
  FOR ALL TO authenticated
  USING (true);

-- Trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_abandoned_cart()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_abandoned_cart_trigger ON abandoned_carts;
CREATE TRIGGER update_abandoned_cart_trigger
  BEFORE UPDATE ON abandoned_carts
  FOR EACH ROW
  EXECUTE FUNCTION update_abandoned_cart();
