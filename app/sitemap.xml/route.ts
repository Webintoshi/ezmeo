export async function GET() {
    const baseUrl = 'https://ezmeo.com';

    const sitemaps = [
        `${baseUrl}/sitemap-pages.xml`,
        `${baseUrl}/sitemap-products.xml`,
        `${baseUrl}/sitemap-collections.xml`,
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps
            .map(
                (url) => `
  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
            )
            .join('')}
</sitemapindex>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
