import { NextRequest, NextResponse } from 'next/server'

const GAMMA_API = 'https://gamma-api.polymarket.com'
const CLOB_API = 'https://clob.polymarket.com'

const ALLOWED = ['events', 'markets', 'prices-history', 'book']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint') || 'events'

  if (endpoint.includes('..') || !ALLOWED.some(e => endpoint === e || endpoint.startsWith(e + '/'))) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  }

  const params = new URLSearchParams()
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') params.set(key, value)
  })

  const baseUrl = (endpoint.startsWith('prices-history') || endpoint.startsWith('book'))
    ? CLOB_API : GAMMA_API

  try {
    const res = await fetch(`${baseUrl}/${endpoint}?${params}`, {
      next: { revalidate: 60 },
    })
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
