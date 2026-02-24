-- ============================================
-- Nitelik Değerlerine Görsel URL Kolonu Ekleme
-- ============================================

-- variant_attribute_values tablosuna image_url kolonu ekle
ALTER TABLE variant_attribute_values 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- İndex ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_variant_attr_values_image 
ON variant_attribute_values(image_url) 
WHERE image_url IS NOT NULL;
