// SEO Hub Pillars API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAllPillarSlugs } from '@/lib/seo-content';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Content root directory
const CONTENT_DIR = path.join(process.cwd(), 'content', 'seo');

/**
 * MDX dosyalarından pillar verilerini oku (fallback)
 */
async function getPillarsFromFiles(): Promise<any[]> {
  try {
    if (!fs.existsSync(CONTENT_DIR)) {
      return [];
    }

    const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
    const pillarDirs = entries.filter((entry) => entry.isDirectory() && entry.name !== '_shared');

    const pillars = await Promise.all(
      pillarDirs.map(async (dir, index) => {
        const slug = dir.name;
        const indexPath = path.join(CONTENT_DIR, slug, 'index.mdx');
        
        let title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        let description = '';
        let icon = '📄';
        let lastUpdated = new Date().toISOString();
        let wordCount = 0;

        // MDX dosyasından oku
        if (fs.existsSync(indexPath)) {
          try {
            const fileContents = fs.readFileSync(indexPath, 'utf8');
            const { data } = matter(fileContents);
            title = data.title || title;
            description = data.description || '';
            icon = data.icon || icon;
            lastUpdated = data.updatedAt || data.publishedAt || lastUpdated;
            wordCount = data.wordCount || 0;
          } catch {
            // MDX okuma hatası - varsayılanları kullan
          }
        }

        // Cluster dosyalarını say
        const pillarDir = path.join(CONTENT_DIR, slug);
        let clusterCount = 0;
        let publishedClusters = 0;
        
        try {
          const files = fs.readdirSync(pillarDir);
          clusterCount = files.filter(f => f.endsWith('.mdx') && f !== 'index.mdx').length;
          publishedClusters = clusterCount; // MDX dosyaları yayında kabul edilir
        } catch {
          // Dizin okuma hatası
        }

        return {
          id: slug,
          slug,
          title,
          description,
          icon,
          clusterCount,
          publishedClusters,
          avgWordCount: wordCount,
          lastUpdated,
          status: 'active',
          sort_order: index,
          is_active: true,
          created_at: lastUpdated,
          updated_at: lastUpdated,
        };
      })
    );

    return pillars.sort((a, b) => a.sort_order - b.sort_order);
  } catch (error) {
    console.error('Error reading pillars from files:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    // Önce Supabase'den veri çekmeyi dene
    let pillars: any[] = [];
    let useSupabase = false;

    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: dbPillars, error } = await supabase
        .from('pillars')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && dbPillars && dbPillars.length > 0) {
        useSupabase = true;
        
        // Her pillar için cluster sayısını hesapla
        pillars = await Promise.all(
          dbPillars.map(async (pillar: any) => {
            const { count: clusterCount } = await supabase
              .from('clusters')
              .select('*', { count: 'exact', head: true })
              .eq('pillar_id', pillar.id);

            const { count: publishedClusters } = await supabase
              .from('clusters')
              .select('*', { count: 'exact', head: true })
              .eq('pillar_id', pillar.id)
              .eq('status', 'published');

            // MDX dosyasından oku (varsa)
            let avgWordCount = 0;
            let lastUpdated = pillar.updated_at;

            try {
              const mdxPath = path.join(process.cwd(), 'content', 'seo', pillar.slug, 'index.mdx');
              if (fs.existsSync(mdxPath)) {
                const fileContents = fs.readFileSync(mdxPath, 'utf8');
                const { data } = matter(fileContents);
                avgWordCount = data.wordCount || 0;
                lastUpdated = data.updatedAt || pillar.updated_at;
              }
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
      }
    } catch (supabaseError) {
      console.log('Supabase connection failed, using file-based fallback');
    }

    // Supabase'den veri gelmezse MDX dosyalarından oku
    if (!useSupabase || pillars.length === 0) {
      pillars = await getPillarsFromFiles();
    }

    return NextResponse.json({ pillars });
  } catch (error) {
    console.error('Error fetching pillars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pillars', pillars: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Supabase'e pillar ekle
    try {
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
    } catch (supabaseError) {
      return NextResponse.json(
        { error: 'Database connection failed. Please check your Supabase configuration.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating pillar:', error);
    return NextResponse.json({ error: 'Failed to create pillar' }, { status: 500 });
  }
}
