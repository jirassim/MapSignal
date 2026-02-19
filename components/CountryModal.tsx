'use client'

import { useRef, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { X, ExternalLink, TrendingUp, BarChart3, Globe } from 'lucide-react'
import { CountryData, MarketEvent, Platform } from '@/lib/types'
import { formatVolume, getPlatformColor, getCountryColor } from '@/lib/prediction-service'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

interface CountryModalProps {
  country: CountryData
  onClose: () => void
}

export default function CountryModal({ country, onClose }: CountryModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Group events by platform for comparison chart
  const platformEvents = {
    polymarket: country.events.filter(e => e.platform === 'polymarket'),
    kalshi: country.events.filter(e => e.platform === 'kalshi'),
    opinion: country.events.filter(e => e.platform === 'opinion'),
  }

  const platformAvg = (events: MarketEvent[]) =>
    events.length ? events.reduce((s, e) => s + e.probability, 0) / events.length : 0

  // Platform comparison bar chart data
  const comparisonData = {
    labels: ['Polymarket', 'Kalshi', 'Opinion'],
    datasets: [{
      label: 'Average Probability (%)',
      data: [
        platformAvg(platformEvents.polymarket) * 100,
        platformAvg(platformEvents.kalshi) * 100,
        platformAvg(platformEvents.opinion) * 100,
      ],
      backgroundColor: ['#3B82F6', '#A855F7', '#F59E0B'],
      borderColor: ['#2563EB', '#9333EA', '#D97706'],
      borderWidth: 1,
      borderRadius: 6,
    }],
  }

  // Volume doughnut
  const volumeData = {
    labels: ['Polymarket', 'Kalshi', 'Opinion'],
    datasets: [{
      data: [
        platformEvents.polymarket.reduce((s, e) => s + e.volume, 0),
        platformEvents.kalshi.reduce((s, e) => s + e.volume, 0),
        platformEvents.opinion.reduce((s, e) => s + e.volume, 0),
      ],
      backgroundColor: ['#3B82F6', '#A855F7', '#F59E0B'],
      borderColor: '#111827',
      borderWidth: 2,
    }],
  }

  // Gap analysis
  const avgByPlatform = {
    polymarket: platformAvg(platformEvents.polymarket),
    kalshi: platformAvg(platformEvents.kalshi),
    opinion: platformAvg(platformEvents.opinion),
  }

  const activePlatforms = Object.entries(avgByPlatform)
    .filter(([, avg]) => avg > 0)
  const maxGap = activePlatforms.length > 1
    ? Math.max(...activePlatforms.map(([, v]) => v)) - Math.min(...activePlatforms.map(([, v]) => v))
    : 0

  // Per-event comparison chart (top 5 events that appear on multiple platforms)
  const topEvents = country.topEvents.slice(0, 8)

  const perEventData = {
    labels: topEvents.map(e => e.title.length > 35 ? e.title.slice(0, 35) + '...' : e.title),
    datasets: [{
      label: 'Probability (%)',
      data: topEvents.map(e => (e.probability * 100)),
      backgroundColor: topEvents.map(e => getPlatformColor(e.platform)),
      borderRadius: 4,
    }],
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div ref={modalRef}
        className="bg-gray-900 border border-gray-700 rounded-none sm:rounded-2xl w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Mobile drag indicator */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-400" aria-hidden="true" />
            <div>
              <h2 id="modal-title" className="text-xl font-bold text-white">{country.name}</h2>
              <p className="text-sm text-gray-400">
                {country.events.length} events &bull;
                Avg: <span style={{ color: getCountryColor(country.avgProbability) }}>
                  {(country.avgProbability * 100).toFixed(1)}%
                </span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal" autoFocus>
            <X className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Avg Probability"
              value={`${(country.avgProbability * 100).toFixed(1)}%`}
              color={getCountryColor(country.avgProbability)}
            />
            <StatCard
              label="Total Events"
              value={String(country.events.length)}
              color="#60a5fa"
            />
            <StatCard
              label="Total Volume"
              value={formatVolume(country.events.reduce((s, e) => s + e.volume, 0))}
              color="#a78bfa"
            />
            <StatCard
              label="Platform Gap"
              value={`${(maxGap * 100).toFixed(1)}%`}
              color={maxGap > 0.1 ? '#ef4444' : '#22c55e'}
            />
          </div>

          {/* Charts row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Platform comparison */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Platform Comparison
              </h3>
              <Bar data={comparisonData} options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `${(ctx.parsed.y ?? 0).toFixed(1)}%`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: '#374151' },
                    ticks: { color: '#9ca3af', callback: (v) => `${v}%` },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af' },
                  }
                }
              }} />
            </div>

            {/* Volume distribution */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Volume Distribution
              </h3>
              <div className="max-w-[220px] mx-auto">
                <Doughnut data={volumeData} options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#9ca3af', padding: 12, usePointStyle: true, pointStyleWidth: 8 },
                    },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `${ctx.label}: ${formatVolume(ctx.raw as number)}`
                      }
                    }
                  },
                  cutout: '60%',
                }} />
              </div>
            </div>
          </div>

          {/* Per-event chart */}
          {topEvents.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Top Events Probability</h3>
              <Bar data={perEventData} options={{
                indexAxis: 'y',
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `${(ctx.parsed.x ?? 0).toFixed(1)}%`
                    }
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: '#374151' },
                    ticks: { color: '#9ca3af', callback: (v) => `${v}%` },
                  },
                  y: {
                    grid: { display: false },
                    ticks: { color: '#d1d5db', font: { size: 11 } },
                  }
                }
              }} />
            </div>
          )}

          {/* Gap analysis */}
          {activePlatforms.length > 1 && maxGap > 0.02 && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Gap Analysis</h3>
              <p className="text-sm text-gray-400 mb-3">
                Cross-platform probability gap: <span className={maxGap > 0.1 ? 'text-red-400 font-semibold' : 'text-green-400'}>
                  {(maxGap * 100).toFixed(1)}%
                </span>
                {maxGap > 0.1
                  ? ' — Significant disagreement between platforms'
                  : ' — Platforms largely agree'}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(['polymarket', 'kalshi', 'opinion'] as Platform[]).map(p => (
                  <div key={p} className="bg-gray-900/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 capitalize mb-1">{p}</div>
                    <div className="text-lg font-bold" style={{ color: getPlatformColor(p) }}>
                      {avgByPlatform[p] > 0 ? `${(avgByPlatform[p] * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {country.platformBreakdown[p]} events
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events list */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">All Events ({country.events.length})</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {country.events
                .sort((a, b) => b.volume - a.volume)
                .map(event => (
                  <div key={event.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: getPlatformColor(event.platform) + '20', color: getPlatformColor(event.platform) }}>
                            {event.platform}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">{event.category}</span>
                        </div>
                        <p className="text-sm text-gray-200 line-clamp-2">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{event.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold" style={{ color: getCountryColor(event.probability) }}>
                          {(event.probability * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">{formatVolume(event.volume)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {event.endDate && (
                        <span className="text-xs text-gray-500">
                          Ends: {new Date(event.endDate).toLocaleDateString()}
                        </span>
                      )}
                      <a href={event.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 ml-auto">
                        View on {event.platform} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
    </div>
  )
}
