export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname !== '/paperclip/wiki' && !url.pathname.startsWith('/paperclip/wiki/')) return fetch(request)
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } })
    if (url.pathname === '/paperclip/wiki' || url.pathname === '/paperclip/wiki/index.html') {
      url.pathname = '/paperclip/wiki/'
      return Response.redirect(url.toString(), 308)
    }
    const relative = url.pathname.slice('/paperclip/wiki/'.length)
    if (!['', 'coverage.json', 'release.json'].includes(relative)) return new Response('Not found', { status: 404 })
    url.pathname = relative ? `/${relative}` : '/index.html'; url.search = ''
    try {
      const asset = await env.ASSETS.fetch(new Request(url, { method: request.method }))
      const response = new Response(asset.body, asset)
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
      response.headers.set('X-Paperclip-Wiki-Release', 'W01')
      if (!relative && response.ok) {
        response.headers.set('Link', '<https://friskydev.com/paperclip/wiki/>; rel="canonical"')
        response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; object-src 'none'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests")
      }
      return response
    } catch {
      console.error(JSON.stringify({ event: 'wiki_asset_unavailable' }))
      return new Response('Wiki temporarily unavailable', { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '30' } })
    }
  },
} satisfies ExportedHandler<Env>
