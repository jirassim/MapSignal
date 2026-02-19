'use client'

import { CountryData, MarketEvent } from '@/lib/types'
import { formatVolume, getCountryColor, getPlatformColor } from '@/lib/prediction-service'
import { TrendingUp, MapPin, Activity, ChevronRight } from 'lucide-react'

interface StatsPanelProps {
  countries: Map<string, CountryData>
  events: MarketEvent[]
  onCountryClick: (country: CountryData) => void
}

export default function StatsPanel({ countries, events, onCountryClick }: StatsPanelProps) {
  const sortedCountries = [...countries.values()]
    .sort((a, b) => b.events.length - a.events.length)
    .slice(0, 15)

  const totalVolume = events.reduce((s, e) => s + e.volume, 0)
  const polyCount = events.filter(e => e.platform === 'polymarket').length
  const kalshiCount = events.filter(e => e.platform === 'kalshi').length
  const opinionCount = events.filter(e => e.platform === 'opinion').length

  // Hot events (highest volume)
  const hotEvents = [...events].sort((a, b) => b.volume - a.volume).slice(0, 5)

  return (
    <div className="h-full overflow-y-auto space-y-4 pr-1">
      {/* Summary */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          Overview
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="Total Events" value={String(events.length)} />
          <MiniStat label="Countries" value={String(countries.size)} />
          <MiniStat label="Total Volume" value={formatVolume(totalVolume)} />
          <MiniStat label="Platforms" value="3" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <PlatformBadge name="Polymarket" count={polyCount} color="#3B82F6" />
          <PlatformBadge name="Kalshi" count={kalshiCount} color="#A855F7" />
          <PlatformBadge name="Opinion" count={opinionCount} color="#F59E0B" />
        </div>
      </div>

      {/* Hot events */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-400" />
          Hot Events
        </h3>
        <div className="space-y-2">
          {hotEvents.length === 0 && (
            <p className="text-xs text-gray-500 italic py-2">No events match current filter</p>
          )}
          {hotEvents.map(event => (
            <div key={event.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-700/50 transition">
              <div className="w-1 h-8 rounded-full flex-shrink-0 mt-0.5"
                style={{ backgroundColor: getPlatformColor(event.platform) }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-200 truncate">{event.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold" style={{ color: getCountryColor(event.probability) }}>
                    {(event.probability * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs text-gray-500">{formatVolume(event.volume)}</span>
                  {event.country && <span className="text-xs text-gray-600">{event.country}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top countries */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-400" />
          Top Countries
        </h3>
        <div className="space-y-1">
          {sortedCountries.map(cd => (
            <button
              key={cd.code}
              onClick={() => onCountryClick(cd)}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700/50 transition text-left group"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-200">{cd.name}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{cd.events.length} events</span>
                  <span style={{ color: getCountryColor(cd.avgProbability) }}>
                    {(cd.avgProbability * 100).toFixed(0)}% avg
                  </span>
                </div>
              </div>
              {/* Platform dots */}
              <div className="flex items-center gap-0.5">
                {cd.platformBreakdown.polymarket > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                {cd.platformBreakdown.kalshi > 0 && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                {cd.platformBreakdown.opinion > 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-bold text-gray-200">{value}</div>
    </div>
  )
}

function PlatformBadge({ name, count, color }: { name: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-gray-400">{name}: <strong className="text-gray-300">{count}</strong></span>
    </div>
  )
}
