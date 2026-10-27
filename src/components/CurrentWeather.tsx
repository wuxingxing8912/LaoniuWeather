import type { WeatherResult } from '../types/weather'
import { describeWeather } from '../utils/weather-code'
import WeatherIcon from './WeatherIcon'

interface Props {
  weather: WeatherResult
  isFavorite: boolean
  onToggleFavorite: () => void
}

export default function CurrentWeather({ weather, isFavorite, onToggleFavorite }: Props) {
  const { city, current } = weather
  const meta = describeWeather(current.weatherCode, current.isDay)

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{city.name}</h2>
          <p className="mt-1 text-xs text-slate-400">
            {[city.admin1, city.country].filter(Boolean).join(' · ')}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`rounded-full border px-3 py-1.5 text-xs transition ${
            isFavorite
              ? 'border-amber-300/60 bg-amber-300/10 text-amber-200'
              : 'border-white/15 text-slate-300 hover:border-white/30 hover:text-white'
          }`}
        >
          {isFavorite ? '已收藏' : '收藏城市'}
        </button>
      </div>

      <div className="mt-8 flex items-center gap-5">
        <WeatherIcon kind={meta.icon} className="size-20 text-sky-300" />
        <div>
          <p className="text-6xl leading-none font-light text-white">
            {Math.round(current.temperature)}
            <span className="align-top text-2xl text-slate-300">°C</span>
          </p>
          <p className="mt-2 text-sm text-slate-300">{meta.label}</p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-white/5 py-3">
          <dt className="text-xs text-slate-400">体感</dt>
          <dd className="mt-1 text-lg text-white">{Math.round(current.apparentTemperature)}°</dd>
        </div>
        <div className="rounded-2xl bg-white/5 py-3">
          <dt className="text-xs text-slate-400">湿度</dt>
          <dd className="mt-1 text-lg text-white">{Math.round(current.humidity)}%</dd>
        </div>
        <div className="rounded-2xl bg-white/5 py-3">
          <dt className="text-xs text-slate-400">风速</dt>
          <dd className="mt-1 text-lg text-white">{Math.round(current.windSpeed)} km/h</dd>
        </div>
      </dl>

      <p className="mt-5 text-xs text-slate-500">更新时间：{current.time.replace('T', ' ')}</p>
    </section>
  )
}
