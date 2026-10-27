import type { WeatherResult } from '../types/weather'

export interface ComparisonInsights {
  hottest: WeatherResult
  coldest: WeatherResult
  wettest: WeatherResult | null
  biggestRange: WeatherResult
  avgTemperature: number
  temperatureGap: number
}

export function summarizeComparison(items: WeatherResult[]): ComparisonInsights | null {
  if (items.length === 0) return null

  const hottest = items.reduce((max, item) =>
    item.current.temperature > max.current.temperature ? item : max,
  )
  const coldest = items.reduce((min, item) =>
    item.current.temperature < min.current.temperature ? item : min,
  )
  const biggestRange = items.reduce((max, item) => {
    const range = item.daily.maxTemperature - item.daily.minTemperature
    const current = max.daily.maxTemperature - max.daily.minTemperature
    return range > current ? item : max
  })
  const wettest = items.reduce<WeatherResult | null>(
    (max, item) => (!max || item.current.precipitation > max.current.precipitation ? item : max),
    null,
  )

  const avgTemperature =
    items.reduce((sum, item) => sum + item.current.temperature, 0) / items.length

  return {
    hottest,
    coldest,
    wettest: wettest && wettest.current.precipitation > 0 ? wettest : null,
    biggestRange,
    avgTemperature,
    temperatureGap: hottest.current.temperature - coldest.current.temperature,
  }
}
