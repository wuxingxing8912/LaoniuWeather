import { useEffect, useMemo, useState } from 'react'
import CityCompare from './components/CityCompare'
import CurrentWeather from './components/CurrentWeather'
import FavoriteList from './components/FavoriteList'
import SearchBar from './components/SearchBar'
import WeatherAlerts from './components/WeatherAlerts'
import WeatherIcon from './components/WeatherIcon'
import WeatherTrend from './components/WeatherTrend'
import { fetchHistory, fetchWeather } from './api/weather'
import { useLocalStorage } from './hooks/useLocalStorage'
import { buildAlerts } from './utils/alerts'
import type { City, HistoryDay, WeatherResult } from './types/weather'

const FAVORITES_KEY = 'laoniu-weather:favorites'
const COMPARE_KEY = 'laoniu-weather:comparison'
const MAX_COMPARE = 6

export default function App() {
  const [favorites, setFavorites] = useLocalStorage<City[]>(FAVORITES_KEY, [])
  const [compareCities, setCompareCities] = useLocalStorage<City[]>(COMPARE_KEY, [])
  const [selected, setSelected] = useState<City | null>(() => favorites[0] ?? null)
  const [weather, setWeather] = useState<WeatherResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [historyDays, setHistoryDays] = useState(7)
  const [history, setHistory] = useState<HistoryDay[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [compareItems, setCompareItems] = useState<WeatherResult[]>([])
  const [compareLoading, setCompareLoading] = useState(false)
  const [compareError, setCompareError] = useState('')

  async function loadWeather(city: City) {
    setSelected(city)
    setLoading(true)
    setError('')
    try {
      const result = await fetchWeather(city)
      setWeather(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '天气数据加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selected) void loadWeather(selected)
    // 仅首屏自动加载一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleFavorite() {
    if (!selected) return
    const exists = favorites.some((city) => city.id === selected.id)
    setFavorites(
      exists ? favorites.filter((city) => city.id !== selected.id) : [...favorites, selected],
    )
  }

  function removeFavorite(city: City) {
    setFavorites(favorites.filter((item) => item.id !== city.id))
  }

  function toggleCompare(city: City) {
    const exists = compareCities.some((item) => item.id === city.id)
    if (exists) {
      setCompareCities(compareCities.filter((item) => item.id !== city.id))
      return
    }
    if (compareCities.length >= MAX_COMPARE) return
    setCompareCities([...compareCities, city])
  }

  function clearCompare() {
    setCompareCities([])
  }

  const activeCityId = weather?.city.id ?? selected?.id
  const alerts = useMemo(() => (weather ? buildAlerts(weather) : []), [weather])

  useEffect(() => {
    const hasDanger = alerts.some((alert) => alert.level === 'danger')
    document.title = hasDanger ? '恶劣天气预警 · 老牛天气' : '老牛天气'
  }, [alerts])

  useEffect(() => {
    if (!selected) return
    let cancelled = false
    setHistoryLoading(true)
    setHistoryError('')
    setHistory([])

    fetchHistory(selected, historyDays)
      .then((days) => {
        if (!cancelled) setHistory(days)
      })
      .catch((err) => {
        if (!cancelled) setHistoryError(err instanceof Error ? err.message : '历史天气加载失败')
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selected, historyDays])

  useEffect(() => {
    if (compareCities.length === 0) {
      setCompareItems([])
      setCompareError('')
      setCompareLoading(false)
      return
    }

    let cancelled = false
    setCompareLoading(true)
    setCompareError('')

    Promise.all(compareCities.map((city) => fetchWeather(city)))
      .then((results) => {
        if (!cancelled) setCompareItems(results)
      })
      .catch((err) => {
        if (!cancelled) setCompareError(err instanceof Error ? err.message : '对比数据加载失败')
      })
      .finally(() => {
        if (!cancelled) setCompareLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [compareCities])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-glow absolute -top-24 -left-24 size-72 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="animate-glow absolute top-1/3 -right-20 size-80 rounded-full bg-indigo-500/20 blur-3xl [animation-delay:4s]" />
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:py-16">
        <header className="animate-fade-up">
          <p className="text-xs tracking-[0.3em] text-sky-300/80 uppercase">Laoniu Weather</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">老牛天气</h1>
          <p className="mt-1 text-sm text-slate-400">搜索城市，查看实时天气，收藏常用城市</p>
        </header>

        <div className="animate-fade-up mt-8 [animation-delay:0.06s]">
          <SearchBar onSelect={loadWeather} />
        </div>

        <main className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div>
            {error && (
              <div className="animate-fade-in rounded-3xl border border-rose-400/30 bg-rose-500/10 p-6 text-sm text-rose-200">
                {error}
              </div>
            )}

            {!error && loading && !weather && <WeatherSkeleton />}

            {!error && weather && (
              <div
                key={weather.city.id}
                className={`space-y-4 transition-opacity duration-300 ${
                  loading ? 'opacity-60' : 'opacity-100'
                }`}
              >
                <WeatherAlerts alerts={alerts} />
                <CurrentWeather
                  weather={weather}
                  isFavorite={favorites.some((city) => city.id === weather.city.id)}
                  onToggleFavorite={toggleFavorite}
                  inCompare={compareCities.some((city) => city.id === weather.city.id)}
                  compareFull={compareCities.length >= MAX_COMPARE}
                  onToggleCompare={() => toggleCompare(weather.city)}
                />
              </div>
            )}

            {!error && !loading && !weather && (
              <div className="animate-fade-up flex flex-col items-center gap-4 rounded-3xl border border-dashed border-white/15 p-10 text-center">
                <WeatherIcon kind="cloud" className="size-16 text-sky-300/70" />
                <p className="text-sm text-slate-400">搜索并选择一个城市，开始查看天气</p>
              </div>
            )}

            {!error && selected && (
              <div className="mt-4">
                <WeatherTrend
                  days={historyDays}
                  onDaysChange={setHistoryDays}
                  history={history}
                  loading={historyLoading}
                  error={historyError}
                />
              </div>
            )}

            <div className="mt-4">
              <CityCompare
                cities={compareCities}
                items={compareItems}
                loading={compareLoading}
                error={compareError}
                activeId={activeCityId}
                onRemove={toggleCompare}
                onSelect={loadWeather}
                onClear={clearCompare}
              />
            </div>
          </div>

          <FavoriteList
            cities={favorites}
            activeId={activeCityId}
            compareIds={compareCities.map((city) => city.id)}
            onSelect={loadWeather}
            onRemove={removeFavorite}
            onToggleCompare={toggleCompare}
          />
        </main>

        <footer className="animate-fade-in mt-10 text-xs text-slate-500 [animation-delay:0.5s]">
          数据来源：Open-Meteo · 收藏城市保存在本地浏览器
        </footer>
      </div>
    </div>
  )
}

function WeatherSkeleton() {
  return (
    <div className="animate-fade-in rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="shimmer h-5 w-24 rounded" />
          <div className="shimmer h-3 w-32 rounded" />
        </div>
        <div className="shimmer h-7 w-20 rounded-full" />
      </div>
      <div className="mt-8 flex items-center gap-5">
        <div className="shimmer size-20 rounded-full" />
        <div className="shimmer h-16 w-32 rounded-2xl" />
      </div>
      <div className="mt-8 grid grid-cols-3 gap-3">
        <div className="shimmer h-16 rounded-2xl" />
        <div className="shimmer h-16 rounded-2xl" />
        <div className="shimmer h-16 rounded-2xl" />
      </div>
    </div>
  )
}
