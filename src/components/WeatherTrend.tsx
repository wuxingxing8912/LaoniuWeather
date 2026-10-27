import { useMemo } from 'react'
import type { HistoryDay } from '../types/weather'
import { analyzeTrend, describeDirection } from '../utils/trend'
import { describeWeather } from '../utils/weather-code'

interface Props {
  days: number
  onDaysChange: (days: number) => void
  history: HistoryDay[]
  loading: boolean
  error: string
}

const DAY_OPTIONS = [7, 14, 30]

const WIDTH = 320
const HEIGHT = 150
const PAD = { top: 14, right: 12, bottom: 24, left: 30 }
const INNER_W = WIDTH - PAD.left - PAD.right
const INNER_H = HEIGHT - PAD.top - PAD.bottom

function formatDate(date: string) {
  return date.slice(5)
}

export default function WeatherTrend({ days, onDaysChange, history, loading, error }: Props) {
  const analysis = useMemo(
    () => analyzeTrend(history, (day) => describeWeather(day.weatherCode).label),
    [history],
  )

  const chart = useMemo(() => {
    if (history.length === 0) return null
    const temps = history.flatMap((day) => [day.maxTemperature, day.minTemperature])
    const yMax = Math.max(...temps) + 1.5
    const yMin = Math.min(...temps) - 1.5
    const ySpan = yMax - yMin || 1
    const x = (index: number) =>
      PAD.left + (history.length === 1 ? INNER_W / 2 : (index / (history.length - 1)) * INNER_W)
    const y = (temp: number) => PAD.top + INNER_H - ((temp - yMin) / ySpan) * INNER_H

    const maxLine = history
      .map((day, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(day.maxTemperature).toFixed(1)}`)
      .join(' ')
    const minLine = history
      .map((day, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(day.minTemperature).toFixed(1)}`)
      .join(' ')
    const area = `${maxLine} L${x(history.length - 1).toFixed(1)} ${y(yMin).toFixed(1)} L${x(0).toFixed(1)} ${y(yMin).toFixed(1)} Z`

    const maxPrecip = Math.max(...history.map((day) => day.precipitation), 1)
    const barWidth = Math.max((INNER_W / history.length) * 0.45, 2)

    return {
      x,
      y,
      maxLine,
      minLine,
      area,
      yMax,
      yMin,
      barWidth,
      barHeight: (value: number) => (value / maxPrecip) * INNER_H * 0.45,
    }
  }, [history])

  return (
    <section className="animate-fade-up rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-white">历史天气与趋势</h2>
        <div className="flex gap-1 rounded-full bg-white/5 p-1 text-xs">
          {DAY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onDaysChange(option)}
              className={`rounded-full px-3 py-1 transition duration-200 ${
                option === days ? 'bg-sky-400/20 text-sky-100' : 'text-slate-400 hover:text-white'
              }`}
            >
              {option} 天
            </button>
          ))}
        </div>
      </div>

      {error && <p className="animate-fade-in mt-4 text-sm text-rose-300">{error}</p>}

      {!error && loading && history.length === 0 && (
        <div className="mt-4 space-y-3">
          <div className="shimmer h-24 rounded-2xl" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="shimmer h-14 rounded-2xl" />
            <div className="shimmer h-14 rounded-2xl" />
            <div className="shimmer h-14 rounded-2xl" />
            <div className="shimmer h-14 rounded-2xl" />
          </div>
        </div>
      )}

      {!error && analysis && chart && (
        <div className={`mt-4 space-y-4 ${loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}`}>
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            <SummaryCard
              label="气温趋势"
              value={describeDirection(analysis.direction, analysis.delta)}
            />
            <SummaryCard
              label="平均气温"
              value={`${Math.round(analysis.avgMin)}° / ${Math.round(analysis.avgMax)}°`}
            />
            <SummaryCard
              label="最热 / 最冷"
              value={`${Math.round(analysis.hottest.maxTemperature)}° / ${Math.round(analysis.coldest.minTemperature)}°`}
            />
            <SummaryCard
              label="降水天数"
              value={`${analysis.rainyDays} 天 · ${analysis.totalPrecipitation.toFixed(1)} mm`}
            />
          </div>

          <svg
            className="h-auto w-full"
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="img"
            aria-label="历史气温趋势图"
          >
            <defs>
              <linearGradient id="trend-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(251 146 60)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="rgb(251 146 60)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[chart.yMax, (chart.yMax + chart.yMin) / 2, chart.yMin].map((temp) => (
              <g key={temp}>
                <line
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={chart.y(temp)}
                  y2={chart.y(temp)}
                  stroke="currentColor"
                  strokeWidth={0.4}
                  className="text-white/15"
                />
                <text
                  x={PAD.left - 5}
                  y={chart.y(temp) + 3}
                  textAnchor="end"
                  className="fill-slate-500 text-[8px]"
                >
                  {Math.round(temp)}°
                </text>
              </g>
            ))}

            {history.map((day, index) =>
              day.precipitation > 0 ? (
                <rect
                  key={day.date}
                  className="wx-grow animate-grow fill-sky-400/40"
                  x={chart.x(index) - chart.barWidth / 2}
                  y={PAD.top + INNER_H - chart.barHeight(day.precipitation)}
                  width={chart.barWidth}
                  height={chart.barHeight(day.precipitation)}
                  rx={1}
                  style={{ animationDelay: `${index * 24}ms` }}
                >
                  <title>{`${day.date} 降水 ${day.precipitation.toFixed(1)} mm`}</title>
                </rect>
              ) : null,
            )}

            <path className="wx-draw animate-draw" d={chart.area} fill="url(#trend-area)" stroke="none" />
            <path
              className="wx-draw animate-draw"
              d={chart.maxLine}
              pathLength={1}
              fill="none"
              stroke="rgb(251 146 60)"
              strokeWidth={1.8}
              strokeLinecap="round"
            />
            <path
              className="wx-draw animate-draw [animation-delay:0.2s]"
              d={chart.minLine}
              pathLength={1}
              fill="none"
              stroke="rgb(56 189 248)"
              strokeWidth={1.8}
              strokeLinecap="round"
            />

            {history.length <= 14 &&
              history.map((day, index) => (
                <g key={`point-${day.date}`}>
                  <circle
                    className="animate-fade-in"
                    cx={chart.x(index)}
                    cy={chart.y(day.maxTemperature)}
                    r={1.8}
                    fill="rgb(251 146 60)"
                    style={{ animationDelay: `${0.6 + index * 0.04}s` }}
                  >
                    <title>{`${day.date} 最高 ${Math.round(day.maxTemperature)}℃ / 最低 ${Math.round(day.minTemperature)}℃`}</title>
                  </circle>
                  <circle
                    className="animate-fade-in"
                    cx={chart.x(index)}
                    cy={chart.y(day.minTemperature)}
                    r={1.8}
                    fill="rgb(56 189 248)"
                    style={{ animationDelay: `${0.7 + index * 0.04}s` }}
                  />
                </g>
              ))}

            {[0, Math.floor((history.length - 1) / 2), history.length - 1].map((index) => (
              <text
                key={`label-${index}`}
                x={chart.x(index)}
                y={HEIGHT - 8}
                textAnchor="middle"
                className="fill-slate-500 text-[8px]"
              >
                {formatDate(history[index].date)}
              </text>
            ))}
          </svg>

          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-4 rounded-full bg-orange-400" />
              最高温
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-4 rounded-full bg-sky-400" />
              最低温
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-sky-400/40" />
              降水量
            </span>
            <span>主要天气：{analysis.dominantLabel}</span>
          </div>

          <ul className="max-h-56 divide-y divide-white/5 overflow-y-auto rounded-2xl bg-black/20">
            {[...history].reverse().map((day, index) => (
              <li
                key={day.date}
                className="animate-fade-in flex items-center justify-between gap-3 px-4 py-2 text-xs"
                style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
              >
                <span className="w-14 text-slate-400">{formatDate(day.date)}</span>
                <span className="flex-1 text-slate-300">
                  {describeWeather(day.weatherCode).label}
                </span>
                <span className="text-orange-300">{Math.round(day.maxTemperature)}°</span>
                <span className="text-sky-300">{Math.round(day.minTemperature)}°</span>
                <span className="w-16 text-right text-slate-400">
                  {day.precipitation > 0 ? `${day.precipitation.toFixed(1)} mm` : '—'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="animate-fade-up rounded-2xl bg-white/5 py-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 text-xs text-white">{value}</p>
    </div>
  )
}
