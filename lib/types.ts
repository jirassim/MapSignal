export type Platform = 'polymarket' | 'kalshi' | 'opinion'
export type CollateralAsset = 'pUSD'

export interface MarketEvent {
  id: string
  platform: Platform
  title: string
  description?: string
  category?: string
  imageUrl?: string
  url: string
  probability: number
  volume: number
  volume24h?: number
  liquidity?: number
  collateralAsset?: CollateralAsset
  endDate?: string
  country?: string
  countryCode?: string
}

export interface CountryData {
  code: string
  name: string
  events: MarketEvent[]
  avgProbability: number
  topEvents: MarketEvent[]
  platformBreakdown: {
    polymarket: number
    kalshi: number
    opinion: number
  }
}

export type Category = 'all' | 'politics' | 'economy' | 'geopolitics' | 'sports' | 'crypto' | 'climate' | 'science'

export interface FilterState {
  category: Category
  timeRange: '7d' | '30d' | '90d' | 'all'
  searchQuery: string
}
