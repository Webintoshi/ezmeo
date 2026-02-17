-- =====================================================
-- LUCKY WHEEL - Database Schema
-- Şans Çarkı Sistemi için Database Tabloları
-- =====================================================

-- 1. Lucky Wheel Config - Genel Ayarlar
CREATE TABLE IF NOT EXISTS lucky_wheel_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'Varsayılan Şans Çarkı',
    is_active BOOLEAN DEFAULT false,
    
    -- Tarih kısıtlamaları
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    
    -- Spin limitleri
    max_total_spins INTEGER DEFAULT 1000,
    max_spins_per_user INTEGER DEFAULT 1,
    cooldown_hours INTEGER DEFAULT 24,
    
    -- Olasılık modu: 'percentage' veya 'weight'
    probability_mode TEXT DEFAULT 'percentage' CHECK (probability_mode IN ('percentage', 'weight')),
    
    -- Kimler çevirebilir
    require_membership BOOLEAN DEFAULT false,
    require_email_verified BOOLEAN DEFAULT false,
    
    -- Görsel ayarlar
    wheel_segments INTEGER DEFAULT 12,
    primary_color TEXT DEFAULT '#FF6B35',
    secondary_color TEXT DEFAULT '#FFE66D',
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Lucky Wheel Prizes - Ödüller
CREATE TABLE IF NOT EXISTS lucky_wheel_prizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES lucky_wheel_configs(id) ON DELETE CASCADE,
    
    -- Ödül bilgileri
    name TEXT NOT NULL,
    description TEXT,
    prize_type TEXT NOT NULL CHECK (prize_type IN ('coupon', 'product', 'discount', 'none')),
    
    -- Değerler
    coupon_code TEXT,
    coupon_discount_percent INTEGER,
    coupon_discount_amount DECIMAL(10, 2),
    product_id UUID REFERENCES products(id),
    discount_value DECIMAL(10, 2),
    
    -- Olasılık ve stok
    probability_value DECIMAL(5, 2) DEFAULT 0,
    stock_total INTEGER DEFAULT 0,
    stock_remaining INTEGER DEFAULT 0,
    is_unlimited_stock BOOLEAN DEFAULT false,
    
    -- Görsel
    color_hex TEXT DEFAULT '#FFFFFF',
    icon_emoji TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    
    -- Durum
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Lucky Wheel Spins - Spin Kayıtları
CREATE TABLE IF NOT EXISTS lucky_wheel_spins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES lucky_wheel_configs(id) ON DELETE SET NULL,
    prize_id UUID REFERENCES lucky_wheel_prizes(id) ON DELETE SET NULL,
    
    -- Kullanıcı bilgileri
    user_email TEXT,
    user_phone TEXT,
    user_name TEXT,
    customer_id UUID REFERENCES customers(id),
    
    -- Kimlik doğrulama
    fingerprint_hash TEXT,
    ip_address TEXT,
    user_agent TEXT,
    
    -- Sonuç
    is_winner BOOLEAN DEFAULT false,
    prize_name TEXT,
    coupon_code TEXT,
    
    -- İşlem
    spin_number INTEGER,
    spin_result JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEX'LER
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_lucky_wheel_configs_active ON lucky_wheel_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_lucky_wheel_prizes_config ON lucky_wheel_prizes(config_id);
CREATE INDEX IF NOT EXISTS idx_lucky_wheel_prizes_order ON lucky_wheel_prizes(config_id, display_order);
CREATE INDEX IF NOT EXISTS idx_lucky_wheel_spins_config ON lucky_wheel_spins(config_id);
CREATE INDEX IF NOT EXISTS idx_lucky_wheel_spins_email ON lucky_wheel_spins(user_email);
CREATE INDEX IF NOT EXISTS idx_lucky_wheel_spins_phone ON lucky_wheel_spins(user_phone);
CREATE INDEX IF NOT EXISTS idx_lucky_wheel_spins_fingerprint ON lucky_wheel_spins(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_lucky_wheel_spins_ip ON lucky_wheel_spins(ip_address);
CREATE INDEX IF NOT EXISTS idx_lucky_wheel_spins_created ON lucky_wheel_spins(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE lucky_wheel_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lucky_wheel_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lucky_wheel_spins ENABLE ROW LEVEL SECURITY;

-- Public read access for active config and prizes
CREATE POLICY "Active lucky wheel config is public" ON lucky_wheel_configs 
FOR SELECT USING (is_active = true);

CREATE POLICY "Active prizes are public" ON lucky_wheel_prizes 
FOR SELECT USING (is_active = true);

-- Service role has full access
CREATE POLICY "Service role has full access to lucky_wheel_configs" ON lucky_wheel_configs 
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to lucky_wheel_prizes" ON lucky_wheel_prizes 
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to lucky_wheel_spins" ON lucky_wheel_spins 
FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- TRIGGER - Auto-update updated_at
-- =====================================================

CREATE TRIGGER update_lucky_wheel_configs_updated_at 
BEFORE UPDATE ON lucky_wheel_configs 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lucky_wheel_prizes_updated_at 
BEFORE UPDATE ON lucky_wheel_prizes 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- İLK VERİLER - Örnek Config ve Prizes
-- =====================================================

-- Örnek config
INSERT INTO lucky_wheel_configs (
    id,
    name,
    is_active,
    start_date,
    end_date,
    max_total_spins,
    max_spins_per_user,
    cooldown_hours,
    probability_mode,
    require_membership,
    require_email_verified,
    wheel_segments,
    primary_color,
    secondary_color
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Ezmeo Şans Çarkı',
    false,
    '2026-02-18 00:00:00+03',
    '2026-12-31 23:59:59+03',
    1000,
    1,
    24,
    'percentage',
    false,
    false,
    12,
    '#FF6B35',
    '#FFE66D'
) ON CONFLICT (id) DO NOTHING;

-- Örnek ödüller (12 segment)
INSERT INTO lucky_wheel_prizes (config_id, name, description, prize_type, probability_value, stock_total, stock_remaining, color_hex, icon_emoji, display_order, is_active) VALUES
('00000000-0000-0000-0000-000000000001', '%50 İndirim', '50% indirim kuponu', 'coupon', 5, 10, 10, '#FF6B6B', '🎉', 1, true),
('00000000-0000-0000-0000-000000000001', '%25 İndirim', '25% indirim kuponu', 'coupon', 15, 50, 50, '#4ECDC4', '🏆', 2, true),
('00000000-0000-0000-0000-000000000001', '%10 İndirim', '10% indirim kuponu', 'coupon', 25, 100, 100, '#45B7D1', '⭐', 3, true),
('00000000-0000-0000-0000-000000000001', 'Bedava Kargo', 'Bedava kargo kuponu', 'coupon', 15, 50, 50, '#96CEB4', '🚚', 4, true),
('00000000-0000-0000-0000-000000000001', '50 TL İndirim', '50 TL sabit indirim', 'discount', 10, 20, 20, '#FFEAA7', '💰', 5, true),
('00000000-0000-0000-0000-000000000001', '25 TL İndirim', '25 TL sabit indirim', 'discount', 15, 30, 30, '#DDA0DD', '✨', 6, true),
('00000000-0000-0000-0000-000000000001', 'Şansını Dene', 'Bir sonraki sefere', 'none', 10, 0, 0, '#C0C0C0', '🔄', 7, true),
('00000000-0000-0000-0000-000000000001', '%15 İndirim', '15% indirim kuponu', 'coupon', 5, 25, 25, '#98D8C8', '🌟', 8, true)
ON CONFLICT DO NOTHING;
