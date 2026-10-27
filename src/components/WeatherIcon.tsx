import type { IconKind } from '../utils/weather-code'

interface Props {
  kind: IconKind
  className?: string
}

function renderIcon(kind: IconKind) {
  switch (kind) {
    case 'sun':
      return (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      )
    case 'moon':
      return <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    case 'cloud':
      return <path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 11.2 3.9 3.9 0 0 0 7 19h10.5z" />
    case 'rain':
      return (
        <>
          <path d="M17.5 15a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 7.2 3.9 3.9 0 0 0 7 15h10.5z" />
          <path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2" />
        </>
      )
    case 'snow':
      return (
        <>
          <path d="M17.5 15a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 7.2 3.9 3.9 0 0 0 7 15h10.5z" />
          <path d="M8 18v3M12 18v3M16 18v3" />
        </>
      )
    case 'thunder':
      return (
        <>
          <path d="M17.5 15a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 7.2 3.9 3.9 0 0 0 7 15h10.5z" />
          <path d="M12 16l-2 4h3l-2 4" />
        </>
      )
    case 'fog':
      return (
        <>
          <path d="M17.5 13a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 5.2 3.9 3.9 0 0 0 7 13h10.5z" />
          <path d="M4 17h16M6 21h12" />
        </>
      )
  }
}

export default function WeatherIcon({ kind, className = '' }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {renderIcon(kind)}
    </svg>
  )
}
