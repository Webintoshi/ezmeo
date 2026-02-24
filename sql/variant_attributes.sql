-- ============================================
-- Dinamik Varyant Nitelikleri (Attributes) Sistemi
-- ============================================

-- 1. Nitelik Grupları (Renk, Beden, Gramaj, vb.)
CREATE TABLE IF NOT EXISTS variant_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,              -- "Renk", "Beden", "Gramaj"
    slug VARCHAR(100) NOT NULL UNIQUE,       -- "renk", "beden", "gramaj"
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Nitelik Değerleri (Kırmızı, S, 450g, vb.)
CREATE TABLE IF NOT EXISTS variant_attribute_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_id UUID NOT NULL REFERENCES variant_attributes(id) ON DELETE CASCADE,
    value VARCHAR(100) NOT NULL,             -- "Kırmızı", "S", "450g"
    color_code VARCHAR(7),                   -- Opsiyonel: #FF0000 (renk için)
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(attribute_id, value)
);

-- 3. Ürün Varyantı - Nitelik Değeri İlişkisi
CREATE TABLE IF NOT EXISTS product_variant_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    attribute_value_id UUID NOT NULL REFERENCES variant_attribute_values(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_variant_id, attribute_value_id)
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_variant_attributes_slug ON variant_attributes(slug);
CREATE INDEX IF NOT EXISTS idx_variant_attributes_active ON variant_attributes(is_active);
CREATE INDEX IF NOT EXISTS idx_variant_attr_values_attribute ON variant_attribute_values(attribute_id);
CREATE INDEX IF NOT EXISTS idx_variant_attr_values_active ON variant_attribute_values(is_active);
CREATE INDEX IF NOT EXISTS idx_product_variant_attrs_variant ON product_variant_attributes(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_product_variant_attrs_value ON product_variant_attributes(attribute_value_id);

-- ============================================
-- RLS (Row Level Security) Policies
-- ============================================

ALTER TABLE variant_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_attributes ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları için tüm yetkiler
CREATE POLICY "Allow admin full access on variant_attributes" 
    ON variant_attributes 
    FOR ALL 
    TO authenticated 
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access on variant_attribute_values" 
    ON variant_attribute_values 
    FOR ALL 
    TO authenticated 
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access on product_variant_attributes" 
    ON product_variant_attributes 
    FOR ALL 
    TO authenticated 
    USING (auth.jwt() ->> 'role' = 'admin');

-- Herkes için okuma yetkisi (ürün detay sayfaları için)
CREATE POLICY "Allow public read on variant_attributes" 
    ON variant_attributes 
    FOR SELECT 
    TO anon, authenticated 
    USING (is_active = true);

CREATE POLICY "Allow public read on variant_attribute_values" 
    ON variant_attribute_values 
    FOR SELECT 
    TO anon, authenticated 
    USING (is_active = true);

CREATE POLICY "Allow public read on product_variant_attributes" 
    ON product_variant_attributes 
    FOR SELECT 
    TO anon, authenticated 
    USING (true);
