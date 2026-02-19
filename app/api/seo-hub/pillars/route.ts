// SEO Hub Pillars API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAllPillarSlugs } from '@/lib/seo-content';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Supabase'dan pillar verilerini al
    const { data: pillars, error } = await supabase
      .from('pillars')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Her pillar için cluster sayısını hesapla
    const pillarsWithStats = await Promise.all(
      (pillars || []).map(async (pillar: any) => {
        // Cluster sayısını al
        const { count: clusterCount } = await supabase
          .from('clusters')
          .select('*', { count: 'exact', head: true })
          .eq('pillar_id', pillar.id);

        // Yayınlanmış cluster sayısı
        const { count: publishedClusters } = await supabase
          .from('clusters')
          .select('*', { count: 'exact', head: true })
          .eq('pillar_id', pillar.id)
          .eq('status', 'published');

        // MDX dosyasını oku (varsa)
        let avgWordCount = 0;
        let lastUpdated = pillar.updated_at;

        try {
          const { frontmatter } = await import(`@/content/seo/${pillar.slug}/index.mdx`);
          avgWordCount = frontmatter.wordCount || 0;
          lastUpdated = frontmatter.updatedAt || pillar.updated_at;
        } catch {
          // MDX dosyası yok, Supabase verisini kullan
        }

        return {
          ...pillar,
          clusterCount: clusterCount || 0,
          publishedClusters: publishedClusters || 0,
          avgWordCount,
          lastUpdated,
        };
      })
    );

    return NextResponse.json({ pillars: pillarsWithStats });
  } catch (error) {
    console.error('Error fetching pillars:', error);
    return NextResponse.json({ error: 'Failed to fetch pillars' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('pillars')
      .insert({
        title: body.title,
        slug: body.slug,
        description: body.description,
        icon: body.icon,
        sort_order: body.sort_order,
        is_active: body.is_active ?? true,
        meta_title: body.meta_title,
        meta_desc: body.meta_desc,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating pillar:', error);
    return NextResponse.json({ error: 'Failed to create pillar' }, { status: 500 });
  }
}
