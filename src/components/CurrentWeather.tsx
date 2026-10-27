import type { WeatherResult } from '../types/weather'
import { describeWeather } from '../utils/weather-code'
import WeatherIcon from './WeatherIcon'

interface Props {
  weather: WeatherResult
  isFavorite: boolean
  onToggleFavorite: () => void
}

const DETAILS = [
  { key: 'apparent', label: '体感' },
  { key: 'humidity', label: '湿度' },
  { key: 'wind', label: '风速' },
] as const

export default function CurrentWeather({ weather, isFavorite, onToggleFavorite }: Props) {
  const { city, current } = weather
  const meta = describeWeather(current.weatherCode, current.isDay)

  const details: Record<(typeof DETAILS)[number]['key'], string> = {
    apparent: `${Math.round(current.apparentTemperature)}°`,
    humidity: `${Math.round(current.humidity)}%`,
    wind: `${Math.round(current.windSpeed)} km/h`,
  }

  return (
    <section className="animate-fade-up overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
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
          className={`rounded-full border px-3 py-1.5 text-xs transition duration-200 active:scale-95 ${
            isFavorite
              ? 'border-amber-300/60 bg-amber-300/10 text-amber-200'
              : 'border-white/15 text-slate-300 hover:border-white/30 hover:text-white'
          }`}
        >
          {isFavorite ? '已收藏' : '收藏城市'}
        </button>
      </div>

      <div className="mt-8 flex items-center gap-5">
        <div className="relative">
          <div
            className={`absolute inset-0 -z-10 animate-pulse rounded-full blur-2xl ${
              current.isDay ? 'bg-amber-300/25' : 'bg-indigo-400/25'
            }`}
          />
          <WeatherIcon
            kind={meta.icon}
            className={`size-20 transition-transform duration-300 hover:scale-110 hover:-rotate-6 ${
              current.isDay ? 'text-amber-300' : 'text-indigo-300'
            }`}
          />
        </div>
        <div className="animate-fade-up [animation-delay:0.08s]">
          <p className="text-6xl leading-none font-light text-white">
            {Math.round(current.temperature)}
            <span className="align-top text-2xl text-slate-300">°C</span>
          </p>
          <p className="mt-2 text-sm text-slate-300">{meta.label}</p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-3 text-center">
        {DETAILS.map((item, index) => (
          <div
            key={item.key}
            className="animate-fade-up rounded-2xl bg-white/5 py-3 transition duration-200 hover:-translate-y-0.5 hover:bg-white/10"
            style={{ animationDelay: `${0.14 + index * 0.06}s` }}
          >
            <dt className="text-xs text-slate-400">{item.label}</dt>
            <dd className="mt-1 text-lg text-white">{details[item.key]}</dd>
          </div>
        ))}
      </dl>

      <p className="animate-fade-in mt-5 text-xs text-slate-500 [animation-delay:0.4s]">
        更新时间：{current.time.replace('T', ' ')}
      </p>
    </section>
  )
}
