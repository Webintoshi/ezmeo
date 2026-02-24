-- ============================================
-- KDV Oranı Constraint Düzeltmesi
-- %0 değerini de kabul etmesi için
-- ============================================

-- Mevcut constraint'i kaldır
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_tax_rate_check;

-- Yeni constraint ekle (%0, %1, %8, %10, %20 değerlerini kabul et)
ALTER TABLE products ADD CONSTRAINT products_tax_rate_check 
CHECK (tax_rate IN (0, 1, 8, 10, 20));

-- Alternatif: Sadece pozitif veya sıfır değerleri kabul et
-- ALTER TABLE products ADD CONSTRAINT products_tax_rate_check 
-- CHECK (tax_rate >= 0 AND tax_rate <= 100);
