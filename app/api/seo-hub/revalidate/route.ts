// SEO Hub Revalidate API
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = body;

    // Tüm SEO sayfalarını revalidate et
    if (path === 'all' || !path) {
      // Ana SEO hub sayfası
      revalidatePath('/seo');
      // Tüm pillar sayfaları
      revalidatePath('/seo/[pillar]');
      // Tüm cluster sayfaları
      revalidatePath('/seo/[pillar]/[cluster]');

      return NextResponse.json({
        revalidated: true,
        now: Date.now(),
        message: 'Tüm SEO sayfaları yenilendi',
      });
    }

    // Spesifik path revalidate
    revalidatePath(path);

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      path,
    });
  } catch (error) {
    console.error('Revalidate error:', error);
    return NextResponse.json({ error: 'Revalidate failed' }, { status: 500 });
  }
}
