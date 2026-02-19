'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CountryData, MarketEvent } from '@/lib/types'
import { getCountryColor, getPlatformColor } from '@/lib/prediction-service'
import { CODE_TO_GEOJSON_NAME, geoNameToCode } from '@/lib/country-names'

interface WorldMapProps {
  countries: Map<string, CountryData>
  onCountryClick: (country: CountryData) => void
  selectedCategory: string
}

function findCountryData(
  geoName: string,
  countries: Map<string, CountryData>
): CountryData | undefined {
  // Direct code lookup
  const code = geoNameToCode(geoName)
  if (code && countries.has(code)) return countries.get(code)

  // Try matching by our code -> geoJSON name mapping
  for (const [cCode, cd] of countries) {
    const expectedName = CODE_TO_GEOJSON_NAME[cCode]
    if (expectedName && expectedName.toLowerCase() === geoName.toLowerCase()) {
      return cd
    }
    // Fuzzy: check if geoJSON name contains our country name or vice versa
    if (cd.name.toLowerCase() === geoName.toLowerCase()) return cd
    if (geoName.toLowerCase().includes(cd.name.toLowerCase())) return cd
    if (cd.name.toLowerCase().includes(geoName.toLowerCase()) && geoName.length > 3) return cd
  }

  return undefined
}

export default function WorldMap({ countries, onCountryClick }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const geoLayerRef = useRef<L.GeoJSON | null>(null)
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch GeoJSON from local public folder
  useEffect(() => {
    fetch('/countries.geo.json')
      .then(r => r.json())
      .then(data => {
        setGeoData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load GeoJSON:', err)
        setLoading(false)
      })
  }, [])

  const getStyle = useCallback((feature?: GeoJSON.Feature): L.PathOptions => {
    if (!feature?.properties) return { fillColor: '#1e293b', weight: 0.8, color: '#334155', fillOpacity: 0.5 }

    const geoName = feature.properties.name || ''
    const cd = findCountryData(geoName, countries)

    if (!cd || cd.events.length === 0) {
      return {
        fillColor: '#1e293b',
        weight: 0.8,
        color: '#334155',
        fillOpacity: 0.5,
      }
    }

    return {
      fillColor: getCountryColor(cd.avgProbability),
      weight: 1.5,
      color: '#0f172a',
      fillOpacity: 0.75,
    }
  }, [countries])

  const onEachFeature = useCallback((feature: GeoJSON.Feature, layer: L.Layer) => {
    if (!feature.properties) return

    const geoName = feature.properties.name || ''
    const cd = findCountryData(geoName, countries)

    if (cd && cd.events.length > 0) {
      const topEvents = cd.topEvents.slice(0, 3)
      const tooltipHtml = `
        <div style="font-family:system-ui;min-width:240px;padding:4px 2px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:#f9fafb;">${cd.name}</div>
          <div style="font-size:11px;color:#9ca3af;margin-bottom:6px;">
            Avg Probability: <span style="color:${getCountryColor(cd.avgProbability)};font-weight:600;">
              ${(cd.avgProbability * 100).toFixed(1)}%
            </span>
            &nbsp;|&nbsp; ${cd.events.length} events
          </div>
          <div style="border-top:1px solid #374151;padding-top:4px;">
            ${topEvents.map((e: MarketEvent) => `
              <div style="font-size:11px;margin:3px 0;display:flex;justify-content:space-between;gap:8px;">
                <span style="color:#d1d5db;max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.title.slice(0, 45)}${e.title.length > 45 ? '...' : ''}</span>
                <span style="color:${getPlatformColor(e.platform)};font-weight:600;flex-shrink:0;">${(e.probability * 100).toFixed(0)}%</span>
              </div>
            `).join('')}
          </div>
          <div style="font-size:10px;color:#6b7280;margin-top:4px;">
            <span style="color:#3B82F6;">P:${cd.platformBreakdown.polymarket}</span>
            <span style="color:#A855F7;margin-left:6px;">K:${cd.platformBreakdown.kalshi}</span>
            <span style="color:#F59E0B;margin-left:6px;">O:${cd.platformBreakdown.opinion}</span>
          </div>
        </div>
      `
      ;(layer as L.Path).bindTooltip(tooltipHtml, {
        sticky: true,
        className: 'custom-tooltip',
        direction: 'auto',
      })
    } else {
      ;(layer as L.Path).bindTooltip(
        `<div style="font-family:system-ui;padding:2px 4px;">
          <span style="color:#9ca3af;font-size:12px;">${geoName}</span>
          <span style="color:#4b5563;font-size:10px;"> — No data</span>
        </div>`,
        { sticky: true, className: 'custom-tooltip', direction: 'auto' }
      )
    }

    ;(layer as L.Path).on('click', () => {
      if (cd && cd.events.length > 0) {
        onCountryClick(cd)
      }
    })

    ;(layer as L.Path).on('mouseover', (e) => {
      const target = e.target as L.Path
      target.setStyle({
        weight: 2.5,
        color: cd ? '#60a5fa' : '#475569',
        fillOpacity: cd ? 0.9 : 0.65,
      })
      target.bringToFront()
    })

    ;(layer as L.Path).on('mouseout', (e) => {
      if (geoLayerRef.current) {
        geoLayerRef.current.resetStyle(e.target)
      }
    })
  }, [countries, onCountryClick])

  // Initialize map - depend on loading so it re-runs after GeoJSON loads
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || loading) return

    const map = L.map(mapRef.current, {
      center: [25, 10],
      zoom: 2.5,
      minZoom: 2,
      maxZoom: 7,
      zoomControl: true,
      attributionControl: false,
      maxBounds: [[-85, -200], [85, 200]],
      maxBoundsViscosity: 1.0,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [loading])

  // Update GeoJSON layer
  useEffect(() => {
    if (!mapInstanceRef.current || !geoData) return

    if (geoLayerRef.current) {
      geoLayerRef.current.remove()
    }

    geoLayerRef.current = L.geoJSON(geoData, {
      style: getStyle,
      onEachFeature,
    }).addTo(mapInstanceRef.current)
  }, [geoData, countries, getStyle, onEachFeature])

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-gray-950">
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading world map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-3 z-[1000] border border-gray-700/50">
        <div className="text-xs font-semibold text-gray-300 mb-2">Probability Scale</div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span className="text-gray-400">&gt;70%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-yellow-500" />
            <span className="text-gray-400">40-70%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span className="text-gray-400">&lt;40%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-slate-700" />
            <span className="text-gray-400">No data</span>
          </div>
        </div>
      </div>
      {/* Platform legend */}
      <div className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-3 z-[1000] border border-gray-700/50 mr-80">
        <div className="text-xs font-semibold text-gray-300 mb-2">Data Sources</div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-gray-400">Polymarket</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-gray-400">Kalshi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-gray-400">Opinion</span>
          </div>
        </div>
      </div>
    </div>
  )
}
