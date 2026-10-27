import { useEffect, useState } from 'react'
import { searchCities } from '../api/weather'
import type { City } from '../types/weather'

interface Props {
  onSelect: (city: City) => void
}

export default function SearchBar({ onSelect }: Props) {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<City[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const query = keyword.trim()
    if (!query) {
      setResults([])
      setOpen(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    const timer = setTimeout(async () => {
      try {
        const cities = await searchCities(query)
        if (cancelled) return
        setResults(cities)
        setOpen(true)
      } catch (err) {
        if (cancelled) return
        setResults([])
        setError(err instanceof Error ? err.message : '城市搜索失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [keyword])

  function pick(city: City) {
    onSelect(city)
    setKeyword('')
    setResults([])
    setOpen(false)
  }

  return (
    <div className="relative w-full">
      <form
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur focus-within:border-sky-400/60"
        onSubmit={(event) => {
          event.preventDefault()
          if (results[0]) pick(results[0])
        }}
      >
        <svg
          className="size-5 shrink-0 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          className="w-full bg-transparent text-base text-slate-100 placeholder:text-slate-500 focus:outline-none"
          placeholder="搜索城市，如：北京、Shanghai"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onFocus={() => {
            if (results.length > 0) setOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false)
          }}
          aria-label="搜索城市"
        />
        {loading && (
          <svg
            className="size-4 shrink-0 animate-spin text-sky-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 3a9 9 0 1 0 9 9" />
          </svg>
        )}
      </form>

      {error && <p className="mt-2 px-2 text-sm text-rose-300">{error}</p>}

      {open && results.length > 0 && (
        <ul className="animate-fade-in absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-xl backdrop-blur">
          {results.map((city, index) => (
            <li key={city.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition duration-200 hover:translate-x-1 hover:bg-white/10"
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => pick(city)}
              >
                <span className="text-sm text-slate-100">{city.name}</span>
                <span className="truncate text-xs text-slate-400">
                  {[city.admin1, city.country].filter(Boolean).join(' · ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && results.length === 0 && !error && (
        <p className="mt-2 px-2 text-sm text-slate-400">没有找到相关城市</p>
      )}
    </div>
  )
}
