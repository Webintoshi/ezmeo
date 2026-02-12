-- =====================================================
-- CATEGORIES TABLE - Dinamik Kategori Sistemi
-- =====================================================

-- Kategoriler tablosu
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    icon TEXT DEFAULT '📦',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- RLS Enable
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Public can view active categories" ON categories;
DROP POLICY IF EXISTS "Service role can manage categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;

-- Herkes aktif kategorileri görebilir
CREATE POLICY "Public can view active categories" 
ON categories FOR SELECT 
USING (is_active = true);

-- Service role tam yetki
CREATE POLICY "Service role can manage categories" 
ON categories FOR ALL 
USING (auth.role() = 'service_role');

-- Admin kullanıcılar tam yetki
CREATE POLICY "Authenticated users can manage categories" 
ON categories FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'manager')
    )
);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_categories_updated_at();

-- =====================================================
-- ÖRNEK KATEGORİLER (İsteğe bağlı - başlangıç verisi)
-- Bunları manuel ekleyebilir veya silebilirsiniz
-- =====================================================

-- Örnek kategoriler (varsayılan olarak yorumlu - isteğe bağlı)
-- INSERT INTO categories (name, slug, description, image, icon, sort_order) VALUES
-- ('Fıstık Ezmeleri', 'fistik-ezmesi', 'Akdeniz ve Ege bölgelerinden en kaliteli yer fıstıklarından üretilen doğal ezmeler', '/fistik_ezmesi_kategori_gorsel.webp', '🥜', 1),
-- ('Fındık Ezmeleri', 'findik-ezmesi', 'Karadeniz bölgesinin en iyi fındıklarından üretilen ezmeler', '/Findik_Ezmeleri_Kategorisi.webp', '🌰', 2),
-- ('Kuruyemişler', 'kuruyemis', 'Doğal ve taze kuruyemiş çeşitleri', '/KURUYEMIS_KATEGORISI_BANNER.svg', '🥜', 3)
-- ON CONFLICT (slug) DO NOTHING;
