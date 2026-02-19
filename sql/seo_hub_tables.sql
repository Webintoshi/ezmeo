-- SEO Hub Tabloları
-- Bu migration'ı Supabase'de çalıştırarak SEO Hub özelliğini tam olarak etkinleştirebilirsiniz

-- Pillar tablosu (Ana kategoriler)
CREATE TABLE IF NOT EXISTS pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📄',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_desc TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Cluster tablosu (Alt içerikler)
CREATE TABLE IF NOT EXISTS clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_id UUID REFERENCES pillars(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  word_count INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_desc TEXT,
  primary_keyword TEXT,
  secondary_keywords TEXT[],
  faq JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(pillar_id, slug)
);

-- İçerik linkleme tablosu (İç linkleme için)
CREATE TABLE IF NOT EXISTS content_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_cluster_id UUID REFERENCES clusters(id) ON DELETE CASCADE,
  target_cluster_id UUID REFERENCES clusters(id) ON DELETE CASCADE,
  anchor_text TEXT NOT NULL,
  link_type TEXT DEFAULT 'internal' CHECK (link_type IN ('internal', 'external', 'pillar')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(source_cluster_id, target_cluster_id, anchor_text)
);

-- updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_pillars_updated_at ON pillars;
CREATE TRIGGER update_pillars_updated_at
  BEFORE UPDATE ON pillars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clusters_updated_at ON clusters;
CREATE TRIGGER update_clusters_updated_at
  BEFORE UPDATE ON clusters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Politikaları
ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_links ENABLE ROW LEVEL SECURITY;

-- Public read access (published/active content)
CREATE POLICY "Allow public read access to active pillars" ON pillars
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to published clusters" ON clusters
  FOR SELECT USING (status = 'published');

-- Admin full access (authenticated users)
CREATE POLICY "Allow admin full access to pillars" ON pillars
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to clusters" ON clusters
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to content_links" ON content_links
  FOR ALL USING (auth.role() = 'authenticated');

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_pillars_slug ON pillars(slug);
CREATE INDEX IF NOT EXISTS idx_pillars_status ON pillars(status);
CREATE INDEX IF NOT EXISTS idx_pillars_sort_order ON pillars(sort_order);

CREATE INDEX IF NOT EXISTS idx_clusters_pillar_id ON clusters(pillar_id);
CREATE INDEX IF NOT EXISTS idx_clusters_slug ON clusters(slug);
CREATE INDEX IF NOT EXISTS idx_clusters_status ON clusters(status);

CREATE INDEX IF NOT EXISTS idx_content_links_source ON content_links(source_cluster_id);
CREATE INDEX IF NOT EXISTS idx_content_links_target ON content_links(target_cluster_id);

-- Mevcut MDX dosyalarından pillar'ları içe aktarma (opsiyonel)
-- Bu sorguyu MDX dosyalarınızdan pillarları otomatik içe aktarmak için kullanabilirsiniz
-- Not: Aşağıdaki örnek veridir, kendi pillarlarınıza göre düzenleyin

-- Örnek pillar verisi (opsiyonel)
-- INSERT INTO pillars (slug, title, description, icon, sort_order, is_active, status) VALUES
-- ('teknik-seo', 'Teknik SEO', 'Site hızı, taranabilirlik ve teknik optimizasyonlar', '⚙️', 1, true, 'active'),
-- ('sayfa-ici-seo', 'Sayfa İçi SEO', 'Meta etiketler, başlıklar ve içerik optimizasyonu', '📄', 2, true, 'active'),
-- ('sayfa-disi-seo', 'Sayfa Dışı SEO', 'Backlink ve otorite oluşturma stratejileri', '🔗', 3, true, 'active'),
-- ('icerik-seo', 'İçerik SEO', 'İçerik stratejisi ve optimizasyon', '📝', 4, true, 'active'),
-- ('yerel-seo', 'Yerel SEO', 'Yerel arama optimizasyonu', '📍', 5, true, 'active'),
-- ('eticaret-seo', 'E-ticaret SEO', 'Online mağaza optimizasyonu', '🛒', 6, true, 'active'),
-- ('uluslararasi-seo', 'Uluslararası SEO', 'Çok dilli ve global SEO', '🌍', 7, true, 'active'),
-- ('kurumsal-seo', 'Kurumsal SEO', 'Büyük ölçekli SEO stratejileri', '🏢', 8, true, 'active'),
-- ('ai-seo', 'AI SEO', 'Yapay zeka ve LLM optimizasyonu', '🤖', 9, true, 'active'),
-- ('analitik', 'SEO Analitik', 'Veri analizi ve raporlama', '📊', 10, true, 'active')
-- ON CONFLICT (slug) DO NOTHING;
