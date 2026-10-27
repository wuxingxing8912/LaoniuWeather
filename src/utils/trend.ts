import type { HistoryDay } from '../types/weather'

export type TrendDirection = 'warming' | 'cooling' | 'stable'

export interface TrendSummary {
  avgMax: number
  avgMin: number
  delta: number
  direction: TrendDirection
  hottest: HistoryDay
  coldest: HistoryDay
  rainyDays: number
  totalPrecipitation: number
  wettestDay: HistoryDay | null
  dominantLabel: string
}

const WARM_THRESHOLD = 1.5

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function analyzeTrend(history: HistoryDay[], labelOf: (day: HistoryDay) => string) {
  if (history.length === 0) return null

  const window = Math.min(3, history.length)
  const head = average(history.slice(0, window).map((day) => day.maxTemperature))
  const tail = average(history.slice(-window).map((day) => day.maxTemperature))
  const delta = tail - head

  const direction: TrendDirection =
    delta >= WARM_THRESHOLD ? 'warming' : delta <= -WARM_THRESHOLD ? 'cooling' : 'stable'

  const hottest = history.reduce((max, day) =>
    day.maxTemperature > max.maxTemperature ? day : max,
  )
  const coldest = history.reduce((min, day) =>
    day.minTemperature < min.minTemperature ? day : min,
  )
  const wettestDay = history.reduce<HistoryDay | null>(
    (max, day) => (!max || day.precipitation > max.precipitation ? day : max),
    null,
  )

  const counter = new Map<number, number>()
  for (const day of history) {
    counter.set(day.weatherCode, (counter.get(day.weatherCode) ?? 0) + 1)
  }
  const dominantCode = [...counter.entries()].sort((a, b) => b[1] - a[1])[0][0]

  const summary: Omit<TrendSummary, 'dominantLabel'> = {
    avgMax: average(history.map((day) => day.maxTemperature)),
    avgMin: average(history.map((day) => day.minTemperature)),
    delta,
    direction,
    hottest,
    coldest,
    rainyDays: history.filter((day) => day.precipitation > 0.1).length,
    totalPrecipitation: history.reduce((sum, day) => sum + day.precipitation, 0),
    wettestDay: wettestDay && wettestDay.precipitation > 0 ? wettestDay : null,
  }

  return { ...summary, dominantLabel: labelOf({ ...history[0], weatherCode: dominantCode }) }
}

export function describeDirection(direction: TrendDirection, delta: number) {
  const value = `${Math.abs(delta).toFixed(1)}℃`
  if (direction === 'warming') return `升温趋势，较前期上升约 ${value}`
  if (direction === 'cooling') return `降温趋势，较前期下降约 ${value}`
  return '气温平稳，无显著升降'
}
