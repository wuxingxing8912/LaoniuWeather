import type { AlertLevel, WeatherAlert } from '../types/weather'
import WeatherIcon from './WeatherIcon'

interface Props {
  alerts: WeatherAlert[]
}

const LEVEL_STYLE: Record<AlertLevel, { item: string; icon: string; label: string }> = {
  danger: {
    item: 'border-rose-400/30 bg-rose-500/10 text-rose-50',
    icon: 'text-rose-300',
    label: '严重',
  },
  warning: {
    item: 'border-amber-300/30 bg-amber-300/10 text-amber-50',
    icon: 'text-amber-300',
    label: '注意',
  },
  info: {
    item: 'border-sky-300/25 bg-sky-300/10 text-sky-50',
    icon: 'text-sky-300',
    label: '提示',
  },
}

export default function WeatherAlerts({ alerts }: Props) {
  if (alerts.length === 0) return null

  const hasDanger = alerts.some((alert) => alert.level === 'danger')
  const hasWarning = alerts.some((alert) => alert.level === 'warning')
  const headline = hasDanger ? '恶劣天气预警' : hasWarning ? '天气提醒' : '天气提示'

  return (
    <section
      className={`animate-fade-up rounded-3xl border p-5 backdrop-blur ${
        hasDanger ? 'border-rose-400/40 bg-rose-500/10' : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <WeatherIcon
          kind="thunder"
          className={`size-6 ${hasDanger ? 'animate-pulse text-rose-300' : 'text-slate-300'}`}
        />
        <h2 className="text-sm font-semibold tracking-wide text-white">{headline}</h2>
        <span
          className={`animate-fade-in rounded-full px-2 py-0.5 text-xs ${
            hasDanger ? 'bg-rose-400/25 text-rose-100' : 'bg-white/10 text-slate-200'
          }`}
        >
          {alerts.length} 条
        </span>
      </div>

      <ul className="mt-3 space-y-2">
        {alerts.map((alert, index) => {
          const style = LEVEL_STYLE[alert.level]
          return (
            <li
              key={alert.id}
              className={`animate-fade-up flex gap-3 rounded-2xl border p-3 ${style.item}`}
              style={{ animationDelay: `${0.05 + index * 0.05}s` }}
            >
              <WeatherIcon
                kind={alert.icon}
                className={`mt-0.5 size-5 shrink-0 ${style.icon} ${
                  alert.level === 'danger' ? 'animate-pulse' : ''
                }`}
              />
              <div>
                <p className="text-sm font-medium">
                  <span className="mr-2 rounded bg-black/20 px-1.5 py-0.5 text-[11px] font-normal">
                    {style.label}
                  </span>
                  {alert.title}
                </p>
                <p className="mt-1 text-xs text-white/70">{alert.description}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
