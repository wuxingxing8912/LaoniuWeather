import type { City } from '../types/weather'

interface Props {
  cities: City[]
  activeId?: number
  compareIds: number[]
  onSelect: (city: City) => void
  onRemove: (city: City) => void
  onToggleCompare: (city: City) => void
}

export default function FavoriteList({
  cities,
  activeId,
  compareIds,
  onSelect,
  onRemove,
  onToggleCompare,
}: Props) {
  return (
    <section className="animate-fade-up rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="animate-fade-up flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-wide text-slate-300">收藏城市</h2>
        <span className="text-xs text-slate-500">{cities.length}</span>
      </div>

      {cities.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">还没有收藏城市，先搜索并添加一个吧。</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {cities.map((city, index) => {
            const inCompare = compareIds.includes(city.id)
            return (
              <li
                key={city.id}
                className="animate-fade-up flex items-center gap-1"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(city)}
                  className={`flex-1 rounded-xl px-3 py-2 text-left text-sm transition duration-200 hover:translate-x-1 ${
                    city.id === activeId
                      ? 'bg-sky-400/15 text-sky-100'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {city.name}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleCompare(city)}
                  className={`rounded-lg px-2 py-1 text-xs transition duration-200 hover:scale-105 ${
                    inCompare ? 'text-sky-300' : 'text-slate-500 hover:text-sky-300'
                  }`}
                  aria-label={`${inCompare ? '从对比移除' : '加入对比'} ${city.name}`}
                  title={inCompare ? '从对比移除' : '加入对比'}
                >
                  {inCompare ? '对比中' : '对比'}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(city)}
                  className="rounded-lg px-2 py-1 text-xs text-slate-500 transition duration-200 hover:scale-105 hover:text-rose-300"
                  aria-label={`移除 ${city.name}`}
                >
                  移除
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
