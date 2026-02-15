import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  
  const bots = [
    'bot', 'crawler', 'spider', 'scrapy',
    'googlebot', 'bingbot', 'yandex', 'duckduckbot',
    'slurp', 'facebot', 'instagram', 'applebot',
    'amazonbot', 'GPTBot', 'ClaudeBot', 'anthropic-ai'
  ]
  
  const isBot = bots.some(bot => userAgent.toLowerCase().includes(bot))
  
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2']
  const isStatic = staticExtensions.some(ext => request.nextUrl.pathname.endsWith(ext))
  
  if (isStatic) {
    return NextResponse.next()
  }
  
  if (isBot) {
    const url = request.nextUrl.pathname
    
    if (url === '/' || url.startsWith('/urun') || url.startsWith('/koleksiyon')) {
      const response = NextResponse.next()
      response.headers.set('X-Robots-Tag', 'noindex')
      return response
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
