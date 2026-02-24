-- ============================================
-- Varyant Görselleri Kolonu Ekleme
-- ============================================

-- product_variants tablosuna images kolonu ekle (JSONB array olarak)
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';

-- Veya text array olarak:
-- ALTER TABLE product_variants 
-- ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- İndex ekle
CREATE INDEX IF NOT EXISTS idx_product_variants_images 
ON product_variants USING GIN (images);
