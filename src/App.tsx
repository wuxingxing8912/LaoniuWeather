import { useEffect, useState } from 'react'
import CurrentWeather from './components/CurrentWeather'
import FavoriteList from './components/FavoriteList'
import SearchBar from './components/SearchBar'
import { fetchWeather } from './api/weather'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { City, WeatherResult } from './types/weather'

const FAVORITES_KEY = 'laoniu-weather:favorites'

export default function App() {
  const [favorites, setFavorites] = useLocalStorage<City[]>(FAVORITES_KEY, [])
  const [selected, setSelected] = useState<City | null>(() => favorites[0] ?? null)
  const [weather, setWeather] = useState<WeatherResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const activeCityId = weather?.city.id ?? selected?.id

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:py-16">
        <header>
          <p className="text-xs tracking-[0.3em] text-sky-300/80 uppercase">Laoniu Weather</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">老牛天气</h1>
          <p className="mt-1 text-sm text-slate-400">搜索城市，查看实时天气，收藏常用城市</p>
        </header>

        <div className="mt-8">
          <SearchBar onSelect={loadWeather} />
        </div>

        <main className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div>
            {error && (
              <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-6 text-sm text-rose-200">
                {error}
              </div>
            )}

            {!error && loading && !weather && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-sm text-slate-400">
                正在获取天气数据…
              </div>
            )}

            {!error && weather && (
              <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                <CurrentWeather
                  weather={weather}
                  isFavorite={favorites.some((city) => city.id === weather.city.id)}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            )}

            {!error && !loading && !weather && (
              <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-sm text-slate-400">
                搜索并选择一个城市，开始查看天气
              </div>
            )}
          </div>

          <FavoriteList
            cities={favorites}
            activeId={activeCityId}
            onSelect={loadWeather}
            onRemove={removeFavorite}
          />
        </main>

        <footer className="mt-10 text-xs text-slate-500">
          数据来源：Open-Meteo · 收藏城市保存在本地浏览器
        </footer>
      </div>
    </div>
  )
}
