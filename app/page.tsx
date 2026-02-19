'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import StatsPanel from '@/components/StatsPanel'
import CountryModal from '@/components/CountryModal'
import { CountryData, MarketEvent, Category } from '@/lib/types'
import { fetchAllPredictions, filterEvents } from '@/lib/prediction-service'

const WorldMap = dynamic(() => import('@/components/WorldMap'), { ssr: false })

export default function Home() {
  const [allCountries, setAllCountries] = useState<Map<string, CountryData>>(new Map())
  const [allEvents, setAllEvents] = useState<MarketEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null)
  const [category, setCategory] = useState<Category>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { countries, events } = await fetchAllPredictions()
      setAllCountries(countries)
      setAllEvents(events)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to load predictions:', err)
      setError('Failed to fetch data. Retrying...')
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 60_000)
    return () => clearInterval(interval)
  }, [loadData])

  const filteredEvents = useMemo(() =>
    filterEvents(allEvents, category, searchQuery),
    [allEvents, category, searchQuery]
  )

  const exportCSV = useCallback(() => {
    if (filteredEvents.length === 0) return
    const headers = ['Title', 'Platform', 'Category', 'Country', 'Probability', 'Volume', 'URL', 'End Date']
    const rows = filteredEvents.map(e => [
      `"${e.title.replace(/"/g, '""')}"`,
      e.platform,
      e.category || '',
      e.country || '',
      (e.probability * 100).toFixed(1) + '%',
      e.volume.toString(),
      e.url,
      e.endDate || '',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prediction-data-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filteredEvents])

  const exportPNG = useCallback(async () => {
    const el = document.querySelector('.leaflet-container') as HTMLElement
    if (!el) return
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(el, { backgroundColor: '#030712', scale: 2 })
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `prediction-map-${new Date().toISOString().slice(0, 10)}.png`
    a.click()
  }, [])

  const filteredCountries = useMemo(() => {
    const map = new Map<string, CountryData>()
    for (const event of filteredEvents) {
      if (!event.countryCode) continue
      if (!map.has(event.countryCode)) {
        map.set(event.countryCode, {
          code: event.countryCode,
          name: event.country || event.countryCode,
          events: [],
          avgProbability: 0,
          topEvents: [],
          platformBreakdown: { polymarket: 0, kalshi: 0, opinion: 0 },
        })
      }
      const cd = map.get(event.countryCode)!
      cd.events.push(event)
      cd.platformBreakdown[event.platform]++
    }
    for (const cd of map.values()) {
      const probs = cd.events.map(e => e.probability)
      cd.avgProbability = probs.reduce((a, b) => a + b, 0) / probs.length
      cd.topEvents = [...cd.events].sort((a, b) => b.volume - a.volume).slice(0, 5)
    }
    return map
  }, [filteredEvents])

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        category={category}
        onCategoryChange={setCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={loadData}
        loading={loading}
        lastUpdated={lastUpdated}
        eventCount={filteredEvents.length}
        countryCount={filteredCountries.size}
        onExportCSV={exportCSV}
        onExportPNG={exportPNG}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          {loading && allEvents.length === 0 ? (
            <div className="w-full h-full bg-gray-950 relative overflow-hidden">
              {/* Skeleton map */}
              <div className="absolute inset-0 p-8">
                <div className="w-full h-full flex gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="h-2/5 flex gap-3">
                      <div className="w-1/4 bg-gray-800/60 rounded-xl animate-pulse" />
                      <div className="w-2/4 bg-gray-800/40 rounded-xl animate-pulse delay-75" />
                      <div className="w-1/4 bg-gray-800/50 rounded-xl animate-pulse delay-150" />
                    </div>
                    <div className="h-1/4 flex gap-3">
                      <div className="w-1/3 bg-gray-800/50 rounded-xl animate-pulse delay-100" />
                      <div className="w-1/3 bg-gray-800/30 rounded-xl animate-pulse delay-200" />
                      <div className="w-1/3 bg-gray-800/60 rounded-xl animate-pulse" />
                    </div>
                    <div className="h-1/5 flex gap-3">
                      <div className="w-1/2 bg-gray-800/40 rounded-xl animate-pulse delay-150" />
                      <div className="w-1/2 bg-gray-800/30 rounded-xl animate-pulse delay-75" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-gray-900/80 backdrop-blur-sm rounded-2xl px-8 py-6 border border-gray-800">
                  <div className="animate-spin w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-gray-300 font-medium">Loading prediction markets...</p>
                  <p className="text-xs text-gray-500 mt-1">Fetching from Polymarket, Kalshi & Opinion</p>
                </div>
              </div>
            </div>
          ) : (
            <WorldMap
              countries={filteredCountries}
              onCountryClick={setSelectedCountry}
              selectedCategory={category}
            />
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden absolute top-4 right-4 z-[1100] px-3 py-2 bg-gray-800/90 border border-gray-700 rounded-lg text-xs text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
            aria-label={sidebarOpen ? 'Hide stats panel' : 'Show stats panel'}
          >
            {sidebarOpen ? 'Hide Panel' : 'Show Panel'}
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-[1200] bg-black/50" onClick={() => setSidebarOpen(false)} />
        )}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          md:translate-x-0 md:w-80
          fixed md:relative right-0 top-0 h-full w-80 z-[1300] md:z-auto
          transition-transform duration-300 ease-out
          border-l border-gray-800 bg-gray-900 md:bg-gray-900/50
        `}>
          <div className="w-80 h-full p-3 pt-16 md:pt-3 overflow-y-auto">
            <StatsPanel
              countries={filteredCountries}
              events={filteredEvents}
              onCountryClick={setSelectedCountry}
            />
          </div>
        </div>
      </div>

      {selectedCountry && (
        <CountryModal
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
        />
      )}

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[3000] bg-red-900/90 backdrop-blur-sm text-red-200 text-sm px-4 py-2.5 rounded-lg border border-red-700 shadow-lg flex items-center gap-2"
          role="alert">
          <span>{error}</span>
          <button onClick={loadData} className="text-red-300 hover:text-white underline text-xs cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Refreshing indicator (non-blocking) */}
      {loading && allEvents.length > 0 && (
        <div className="fixed top-1 left-1/2 -translate-x-1/2 z-[3000] bg-blue-900/80 backdrop-blur-sm text-blue-200 text-xs px-3 py-1 rounded-full border border-blue-700/50">
          Refreshing...
        </div>
      )}
    </div>
  )
}
