-- RLS Politikalarını Düzelt
-- Mevcut politikaları sil ve yeniden oluştur

-- Tablo varsa RLS'i kapat ve aç
ALTER TABLE abandoned_carts DISABLE ROW LEVEL SECURITY;

-- Tüm insert/update/delete işlemlerine izin ver (anonim kullanıcılar için)
CREATE POLICY "anon_insert_abandoned_carts" ON abandoned_carts
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select_abandoned_carts" ON abandoned_carts
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_update_abandoned_carts" ON abandoned_carts
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon_delete_abandoned_carts" ON abandoned_carts
  FOR DELETE TO anon
  USING (true);

-- Authenticated kullanıcılar için de tam erişim
CREATE POLICY "auth_insert_abandoned_carts" ON abandoned_carts
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "auth_select_abandoned_carts" ON abandoned_carts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "auth_update_abandoned_carts" ON abandoned_carts
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_delete_abandoned_carts" ON abandoned_carts
  FOR DELETE TO authenticated
  USING (true);

-- Service role için tam erişim (API için gerekli)
CREATE POLICY "service_insert_abandoned_carts" ON abandoned_carts
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "service_select_abandoned_carts" ON abandoned_carts
  FOR SELECT TO service_role
  USING (true);

CREATE POLICY "service_update_abandoned_carts" ON abandoned_carts
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_delete_abandoned_carts" ON abandoned_carts
  FOR DELETE TO service_role
  USING (true);
