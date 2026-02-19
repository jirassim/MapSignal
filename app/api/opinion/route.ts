import { NextRequest, NextResponse } from 'next/server'

const OPINION_PUBLIC = 'https://proxy.opinion.trade:8443/api/bsc/api/v2'
const OPINION_OPENAPI = 'https://proxy.opinion.trade:8443/openapi'

const PUBLIC_ENDPOINTS = ['topic', 'label', 'indicator', 'currency', 'activity']
const AUTH_ENDPOINTS = ['market', 'orderbook', 'trade', 'token']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint') || 'indicator'

  if (endpoint.includes('..')) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  }

  const isPublic = PUBLIC_ENDPOINTS.some(e => endpoint === e || endpoint.startsWith(e + '/'))
  const isAuth = AUTH_ENDPOINTS.some(e => endpoint === e || endpoint.startsWith(e + '/'))

  if (!isPublic && !isAuth) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  }

  const params = new URLSearchParams()
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint' && key !== 'apiKey') params.set(key, value)
  })

  try {
    const headers: Record<string, string> = {}
    let url: string

    if (isPublic) {
      const qs = params.toString()
      url = `${OPINION_PUBLIC}/${endpoint}${qs ? `?${qs}` : ''}`
    } else {
      const apiKey = request.headers.get('x-opinion-api-key') ||
        searchParams.get('apiKey') ||
        process.env.OPINION_API_KEY || ''
      if (!apiKey) {
        return NextResponse.json({ error: 'Opinion API key required' }, { status: 401 })
      }
      headers.apikey = apiKey
      const qs = params.toString()
      url = `${OPINION_OPENAPI}/${endpoint}${qs ? `?${qs}` : ''}`
    }

    const res = await fetch(url, { headers, next: { revalidate: 60 } })
    if (!res.ok) {
      return NextResponse.json({ error: `Upstream: ${res.status}` }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
