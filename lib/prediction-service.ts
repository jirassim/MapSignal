import { MarketEvent, CountryData, Platform, Category } from './types'
import { detectCountry, detectCategory } from './country-mapping'
import { POLYMARKET_COLLATERAL_ASSET } from './polymarket-config'

const CACHE_TTL = 60_000 // 1 minute
let cachedData: { countries: Map<string, CountryData>; events: MarketEvent[]; ts: number } | null = null

// Polymarket: fetch via Gamma API (public, no auth)
async function fetchPolymarketEvents(): Promise<MarketEvent[]> {
  const events: MarketEvent[] = []

  try {
    const res = await fetch('/api/polymarket?endpoint=events&active=true&closed=false&limit=100&order=volume24hr&ascending=false')
    if (!res.ok) return []
    const data = await res.json()

    for (const event of data) {
      if (!event.markets || event.markets.length === 0) continue
      const primary = event.markets[0]

      let probability = 0.5
      try {
        const prices = JSON.parse(primary.outcomePrices || '["0.5","0.5"]')
        probability = parseFloat(prices[0]) || 0.5
      } catch { /* use default */ }

      const totalVolume = event.volume || 0
      const country = detectCountry(event.title)

      events.push({
        id: `poly_${event.id}`,
        platform: 'polymarket',
        title: event.title,
        description: event.description,
        category: detectCategory(event.title),
        imageUrl: event.image,
        url: `https://polymarket.com/event/${event.slug}`,
        probability,
        volume: totalVolume,
        volume24h: event.volume24hr || 0,
        liquidity: event.liquidity || 0,
        collateralAsset: POLYMARKET_COLLATERAL_ASSET,
        endDate: event.endDate,
        country: country?.name,
        countryCode: country?.code,
      })
    }
  } catch (err) {
    console.warn('Polymarket fetch error:', err)
  }

  return events
}

// Kalshi: fetch via public API
async function fetchKalshiEvents(): Promise<MarketEvent[]> {
  const events: MarketEvent[] = []

  try {
    const res = await fetch('/api/kalshi?endpoint=events&status=open&limit=100&with_nested_markets=true')
    if (!res.ok) return []
    const data = await res.json()

    for (const event of data.events || []) {
      const markets = event.markets || []
      if (markets.length === 0) continue

      const primary = markets[0]
      const yesPrice = primary.yes_ask_dollars
        ? parseFloat(primary.yes_ask_dollars)
        : (primary.yes_ask || primary.last_price || 50) / 100

      const totalVolume = markets.reduce((sum: number, m: Record<string, unknown>) =>
        sum + ((m.volume as number) || 0), 0)

      const country = detectCountry(event.title)

      events.push({
        id: `kalshi_${event.event_ticker}`,
        platform: 'kalshi',
        title: event.title + (event.sub_title ? ` - ${event.sub_title}` : ''),
        description: primary.rules_primary,
        category: detectCategory(event.title + ' ' + (event.category || '')),
        url: `https://kalshi.com/markets/${event.event_ticker}`,
        probability: Math.min(Math.max(yesPrice, 0.01), 0.99),
        volume: totalVolume,
        volume24h: markets.reduce((sum: number, m: Record<string, unknown>) =>
          sum + ((m.volume_24h as number) || 0), 0),
        endDate: primary.close_time,
        country: country?.name,
        countryCode: country?.code,
      })
    }
  } catch (err) {
    console.warn('Kalshi fetch error:', err)
  }

  return events
}

// Opinion: fetch macro indicators (public, no key needed)
async function fetchOpinionEvents(): Promise<MarketEvent[]> {
  const events: MarketEvent[] = []

  try {
    // Fetch macro indicators (public endpoint, no key)
    const res = await fetch('/api/opinion?endpoint=indicator&limit=20&page=1&chainId=56')
    if (!res.ok) return []
    const data = await res.json()

    const indicators = data.result?.list || data.list || []

    for (const ind of indicators) {
      const forecast = parseFloat(ind.forecastValue) || 0
      const previous = parseFloat(ind.previousValue) || 0
      const diff = previous > 0 ? (forecast - previous) / previous : 0
      const probability = Math.min(Math.max(0.5 + diff * 2, 0.05), 0.95)

      const country = detectCountry(ind.title + ' ' + (ind.countryCode || ''))

      const period = ind.period || ''
      const unit = ind.unit || ''

      events.push({
        id: `opinion_${ind.id}_${ind.releaseId}`,
        platform: 'opinion',
        title: `${ind.title} (${period}) — Forecast: ${ind.forecastValue}${unit}`,
        description: ind.description || `Previous: ${ind.previousValue}${unit}, Forecast: ${ind.forecastValue}${unit}`,
        category: detectCategory(ind.title),
        url: 'https://app.opinion.trade/macro',
        probability,
        volume: (ind.importance || 1) * 10000,
        endDate: ind.releaseTime ? new Date(ind.releaseTime * 1000).toISOString() : undefined,
        country: country?.name,
        countryCode: country?.code,
      })
    }

    // Also try fetching Opinion markets (authenticated API)
    try {
      const mktRes = await fetch('/api/opinion?endpoint=market&status=activated&sortBy=5&limit=20&page=1')
      if (mktRes.ok) {
        const mktData = await mktRes.json()
        const items = mktData.result?.items || mktData.result || []

        for (const m of items) {
          const country = detectCountry(String(m.marketTitle || ''))

          events.push({
            id: `opinion_mkt_${m.marketId}`,
            platform: 'opinion',
            title: String(m.marketTitle || ''),
            description: String(m.rules || ''),
            category: detectCategory(String(m.marketTitle || '')),
            url: `https://opinion.trade/market/${m.marketId}`,
            probability: 0.5,
            volume: parseFloat(String(m.volume || 0)),
            volume24h: parseFloat(String(m.volume24h || 0)),
            endDate: m.cutoffAt as string,
            country: country?.name,
            countryCode: country?.code,
          })
        }
      }
    } catch { /* markets endpoint may need API key */ }
  } catch (err) {
    console.warn('Opinion fetch error:', err)
  }

  return events
}

export async function fetchAllPredictions(): Promise<{
  countries: Map<string, CountryData>
  events: MarketEvent[]
}> {
  // Check cache
  if (cachedData && Date.now() - cachedData.ts < CACHE_TTL) {
    return cachedData
  }

  const [polyEvents, kalshiEvents, opinionEvents] = await Promise.all([
    fetchPolymarketEvents(),
    fetchKalshiEvents(),
    fetchOpinionEvents(),
  ])

  const allEvents = [...polyEvents, ...kalshiEvents, ...opinionEvents]

  // Group by country
  const countryMap = new Map<string, CountryData>()

  for (const event of allEvents) {
    if (!event.countryCode) continue

    if (!countryMap.has(event.countryCode)) {
      countryMap.set(event.countryCode, {
        code: event.countryCode,
        name: event.country || event.countryCode,
        events: [],
        avgProbability: 0,
        topEvents: [],
        platformBreakdown: { polymarket: 0, kalshi: 0, opinion: 0 },
      })
    }

    const cd = countryMap.get(event.countryCode)!
    cd.events.push(event)
    cd.platformBreakdown[event.platform]++
  }

  // Calculate averages and top events
  for (const cd of countryMap.values()) {
    const probs = cd.events.map(e => e.probability)
    cd.avgProbability = probs.reduce((a, b) => a + b, 0) / probs.length

    cd.topEvents = [...cd.events]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5)
  }

  cachedData = { countries: countryMap, events: allEvents, ts: Date.now() }
  return cachedData
}

export function filterEvents(
  events: MarketEvent[],
  category: Category,
  searchQuery: string
): MarketEvent[] {
  let filtered = events

  if (category !== 'all') {
    filtered = filtered.filter(e => e.category === category)
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(q) ||
      (e.country || '').toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q)
    )
  }

  return filtered
}

export function getCountryColor(probability: number): string {
  if (probability > 0.7) return '#22c55e'  // green
  if (probability > 0.4) return '#eab308'  // yellow
  return '#ef4444'                          // red
}

export function getCountryColorClass(probability: number): string {
  if (probability > 0.7) return 'text-green-500'
  if (probability > 0.4) return 'text-yellow-500'
  return 'text-red-500'
}

export function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(1)}B ${POLYMARKET_COLLATERAL_ASSET}`
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M ${POLYMARKET_COLLATERAL_ASSET}`
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K ${POLYMARKET_COLLATERAL_ASSET}`
  return `${vol.toFixed(0)} ${POLYMARKET_COLLATERAL_ASSET}`
}

export function getPlatformColor(platform: Platform): string {
  switch (platform) {
    case 'polymarket': return '#3B82F6'
    case 'kalshi': return '#A855F7'
    case 'opinion': return '#F59E0B'
  }
}
