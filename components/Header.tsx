'use client'

import Image from 'next/image'
import { RefreshCw, Download, Search, Camera } from 'lucide-react'
import { Category } from '@/lib/types'

interface HeaderProps {
  category: Category
  onCategoryChange: (c: Category) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  onRefresh: () => void
  loading: boolean
  lastUpdated: Date | null
  eventCount: number
  countryCount: number
  onExportCSV?: () => void
  onExportPNG?: () => void
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'politics', label: 'Politics' },
  { value: 'economy', label: 'Economy' },
  { value: 'geopolitics', label: 'Geopolitics' },
  { value: 'sports', label: 'Sports' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'climate', label: 'Climate' },
  { value: 'science', label: 'Science' },
]

export default function Header({
  category, onCategoryChange, searchQuery, onSearchChange,
  onRefresh, loading, lastUpdated, eventCount, countryCount,
  onExportCSV, onExportPNG,
}: HeaderProps) {
  return (
    <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-[1500]" role="banner">
      <div className="max-w-[1920px] mx-auto px-4 py-3">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Image
              src="/mapsiglogo.png"
              alt="MapSignal"
              width={36}
              height={36}
              className="rounded-lg"
              priority
            />
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                MapSignal
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Global prediction market heatmap — Polymarket, Kalshi & Opinion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Stats - compact on mobile, full on desktop */}
            <div className="flex items-center gap-2 md:gap-4 text-xs text-gray-400 mr-1 md:mr-2">
              <span><strong className="text-blue-400">{eventCount}</strong> <span className="hidden sm:inline">events</span></span>
              <span><strong className="text-purple-400">{countryCount}</strong> <span className="hidden sm:inline">countries</span></span>
              {lastUpdated && (
                <span className="hidden md:inline text-gray-500">Updated {lastUpdated.toLocaleTimeString()}</span>
              )}
            </div>

            {onExportCSV && (
              <button onClick={onExportCSV}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 cursor-pointer"
                aria-label="Export data as CSV"
                title="Export CSV">
                <Download className="w-4 h-4 text-gray-300" aria-hidden="true" />
              </button>
            )}
            {onExportPNG && (
              <button onClick={onExportPNG}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 cursor-pointer"
                aria-label="Screenshot map as PNG"
                title="Screenshot map">
                <Camera className="w-4 h-4 text-gray-300" aria-hidden="true" />
              </button>
            )}
            <button onClick={onRefresh}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 cursor-pointer"
              aria-label="Refresh prediction data"
              title="Refresh data">
              <RefreshCw className={`w-4 h-4 text-gray-300 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Bottom row: filters */}
        <div className="flex items-center gap-3 flex-col sm:flex-row" role="search">
          {/* Search */}
          <div className="relative w-full sm:flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search events, countries..."
              aria-label="Search events or countries"
              className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-1.5 flex-wrap" role="tablist" aria-label="Category filter">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                role="tab"
                aria-selected={category === cat.value}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  category === cat.value
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 border border-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
