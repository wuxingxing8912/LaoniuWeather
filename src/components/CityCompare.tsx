import type { City, WeatherResult } from '../types/weather'
import { buildAlerts } from '../utils/alerts'
import { summarizeComparison } from '../utils/compare'
import { describeWeather } from '../utils/weather-code'
import WeatherIcon from './WeatherIcon'

interface Props {
  cities: City[]
  items: WeatherResult[]
  loading: boolean
  error: string
  activeId?: number
  onRemove: (city: City) => void
  onSelect: (city: City) => void
  onClear: () => void
}

const LEVEL_BADGE = {
  danger: 'bg-rose-400/20 text-rose-200',
  warning: 'bg-amber-300/20 text-amber-200',
  info: 'bg-sky-300/20 text-sky-200',
} as const

export default function CityCompare({
  cities,
  items,
  loading,
  error,
  activeId,
  onRemove,
  onSelect,
  onClear,
}: Props) {
  const insights = summarizeComparison(items)

  const ranked = [...items].sort((a, b) => b.current.temperature - a.current.temperature)
  const globalMin = Math.min(...items.map((item) => item.daily.minTemperature))
  const globalMax = Math.max(...items.map((item) => item.daily.maxTemperature))
  const span = globalMax - globalMin || 1
  const hasRange = items.length > 0 && Number.isFinite(globalMin) && Number.isFinite(globalMax)

  return (
    <section className="animate-fade-up rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-white">
          多城市对比
          {cities.length > 0 && (
            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-200">
              {cities.length}
            </span>
          )}
        </h2>
        {cities.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:text-rose-300"
          >
            清空
          </button>
        )}
      </div>

      {error && <p className="animate-fade-in mt-4 text-sm text-rose-300">{error}</p>}

      {!error && loading && items.length === 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="shimmer h-32 rounded-2xl" />
          <div className="shimmer h-32 rounded-2xl" />
        </div>
      )}

      {!error && items.length === 0 && !loading && (
        <p className="mt-4 text-sm text-slate-400">
          还没有对比城市。在天气卡片点击「加入对比」，或从收藏列表添加，最多 6 个。
        </p>
      )}

      {!error && insights && (
        <div className={`mt-4 space-y-4 ${loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}`}>
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            <InsightCard
              label="最热"
              value={`${insights.hottest.city.name} ${Math.round(insights.hottest.current.temperature)}°`}
            />
            <InsightCard
              label="最冷"
              value={`${insights.coldest.city.name} ${Math.round(insights.coldest.current.temperature)}°`}
            />
            <InsightCard
              label="温差最大"
              value={`${insights.biggestRange.city.name} ${Math.round(
                insights.biggestRange.daily.maxTemperature - insights.biggestRange.daily.minTemperature,
              )}°`}
            />
            <InsightCard
              label="降水最多"
              value={
                insights.wettest
                  ? `${insights.wettest.city.name} ${insights.wettest.current.precipitation.toFixed(1)} mm`
                  : '暂无降水'
              }
            />
          </div>

          {hasRange && items.length > 1 && (
            <div className="rounded-2xl bg-black/20 p-4">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>今日气温区间</span>
                <span>
                  {Math.round(globalMin)}° ~ {Math.round(globalMax)}°
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {ranked.map((item, index) => {
                  const left = ((item.daily.minTemperature - globalMin) / span) * 100
                  const width = Math.max(
                    ((item.daily.maxTemperature - item.daily.minTemperature) / span) * 100,
                    2,
                  )
                  return (
                    <li key={item.city.id} className="animate-fade-in flex items-center gap-3">
                      <span className="w-16 truncate text-xs text-slate-300">{item.city.name}</span>
                      <span className="relative h-2.5 flex-1 rounded-full bg-white/5">
                        <span
                          className="animate-fade-in absolute inset-y-0 rounded-full bg-gradient-to-r from-sky-400 to-orange-400 transition-all duration-500"
                          style={{ left: `${left}%`, width: `${width}%`, animationDelay: `${index * 60}ms` }}
                        />
                      </span>
                      <span className="w-14 text-right text-xs text-slate-300">
                        {Math.round(item.daily.minTemperature)}° / {Math.round(item.daily.maxTemperature)}°
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item, index) => {
              const meta = describeWeather(item.current.weatherCode, item.current.isDay)
              const alerts = buildAlerts(item)
              const topLevel = alerts[0]?.level
              return (
                <article
                  key={item.city.id}
                  className={`animate-fade-up cursor-pointer rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:border-white/25 ${
                    item.city.id === activeId
                      ? 'border-sky-400/40 bg-sky-400/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                  style={{ animationDelay: `${index * 60}ms` }}
                  onClick={() => onSelect(item.city)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-medium text-white">{item.city.name}</h3>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {[item.city.admin1, item.city.country].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onRemove(item.city)
                      }}
                      className="rounded-lg px-2 py-1 text-[11px] text-slate-500 transition hover:text-rose-300"
                      aria-label={`从对比中移除 ${item.city.name}`}
                    >
                      移除
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <WeatherIcon
                      kind={meta.icon}
                      className={`size-10 ${item.current.isDay ? 'text-amber-300' : 'text-indigo-300'}`}
                    />
                    <p className="text-2xl font-light text-white">
                      {Math.round(item.current.temperature)}
                      <span className="align-top text-sm text-slate-400">°C</span>
                    </p>
                    <p className="text-xs text-slate-400">{meta.label}</p>
                  </div>

                  <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="rounded-xl bg-white/5 py-1.5">
                      <dt className="text-slate-500">体感</dt>
                      <dd className="text-slate-200">{Math.round(item.current.apparentTemperature)}°</dd>
                    </div>
                    <div className="rounded-xl bg-white/5 py-1.5">
                      <dt className="text-slate-500">湿度</dt>
                      <dd className="text-slate-200">{Math.round(item.current.humidity)}%</dd>
                    </div>
                    <div className="rounded-xl bg-white/5 py-1.5">
                      <dt className="text-slate-500">风速</dt>
                      <dd className="text-slate-200">{Math.round(item.current.windSpeed)}</dd>
                    </div>
                  </dl>

                  {topLevel && (
                    <p
                      className={`animate-fade-in mt-3 inline-block rounded-full px-2 py-0.5 text-[11px] ${LEVEL_BADGE[topLevel]}`}
                    >
                      {alerts[0].title}
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="animate-fade-up rounded-2xl bg-white/5 py-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 text-xs text-white">{value}</p>
    </div>
  )
}
