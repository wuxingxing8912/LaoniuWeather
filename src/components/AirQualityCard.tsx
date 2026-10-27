import type { AirQuality } from '../types/weather'
import {
  POLLUTANT_LABELS,
  POLLUTANT_UNITS,
  calcChinaAqi,
  describeAqi,
  type PollutantKey,
} from '../utils/aqi'

interface Props {
  air: AirQuality
}

const ORDER: PollutantKey[] = ['pm25', 'pm10', 'o3', 'no2', 'so2', 'co']

const BAR_GRADIENT =
  'linear-gradient(90deg,#34d399 0%,#facc15 20%,#fb923c 40%,#f43f5e 60%,#a855f7 80%,#991b1b 100%)'

export default function AirQualityCard({ air }: Props) {
  const { aqi, primary } = calcChinaAqi(air)
  const meta = describeAqi(aqi)
  const percent = Math.min((aqi / 500) * 100, 100)

  const values: Record<PollutantKey, number> = {
    pm25: air.pm25,
    pm10: air.pm10,
    so2: air.so2,
    no2: air.no2,
    co: air.co,
    o3: air.o3,
  }

  return (
    <section className="animate-fade-up rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-white">空气质量</h2>
        <span className="text-[11px] text-slate-500">
          {air.time ? `${air.time.replace('T', ' ')} 更新` : ''}
        </span>
      </div>

      <div className="mt-4 flex items-end gap-4">
        <p className={`text-5xl leading-none font-light ${meta.text}`}>{aqi}</p>
        <div className="pb-1">
          <span className={`rounded-full px-2 py-0.5 text-xs ${meta.chip}`}>{meta.label}</span>
          <p className="mt-1.5 text-[11px] text-slate-400">
            首要污染物：{primary ? POLLUTANT_LABELS[primary] : '无'}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div
          className="relative h-2 w-full rounded-full"
          style={{ background: BAR_GRADIENT }}
          aria-hidden="true"
        >
          <span
            className="absolute -top-1 h-4 w-1 -translate-x-1/2 rounded-full bg-white shadow transition-all duration-700"
            style={{ left: `${percent}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
          <span>0</span>
          <span>100</span>
          <span>200</span>
          <span>300</span>
          <span>500</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-300">{meta.advice}</p>

      <dl className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {ORDER.map((key, index) => (
          <div
            key={key}
            className="animate-fade-up rounded-2xl bg-white/5 py-2 text-center"
            style={{ animationDelay: `${0.05 + index * 0.05}s` }}
          >
            <dt className="text-[11px] text-slate-400">{POLLUTANT_LABELS[key]}</dt>
            <dd className="mt-1 text-sm text-white">
              {key === 'co' ? values[key].toFixed(1) : Math.round(values[key])}
            </dd>
            <dd className="text-[10px] text-slate-500">{POLLUTANT_UNITS[key]}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-[11px] text-slate-500">
        按中国 HJ 633-2012 标准根据实时污染物浓度估算 · 参考：US AQI {Math.round(air.usAqi)} / 欧洲
        AQI {Math.round(air.europeanAqi)}
      </p>
    </section>
  )
}
