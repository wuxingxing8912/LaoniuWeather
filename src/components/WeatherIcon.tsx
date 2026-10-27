import type { IconKind } from '../utils/weather-code'

interface Props {
  kind: IconKind
  className?: string
}

const CLOUD = 'M17.5 18.5a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 10.7 3.9 3.9 0 0 0 7 18.5h10.5z'
const CLOUD_HIGH = 'M17.5 15.5a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 7.7 3.9 3.9 0 0 0 7 15.5h10.5z'
const CLOUD_FOG = 'M17.5 13.5a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 5.7 3.9 3.9 0 0 0 7 13.5h10.5z'

function renderIcon(kind: IconKind) {
  switch (kind) {
    case 'sun':
      return (
        <>
          <circle cx="12" cy="12" r="7.5" opacity="0.28" strokeDasharray="2 3" />
          <g className="wx-motion animate-spin-slow">
            <path d="M12 1.6v2.6M12 19.8v2.6M3.5 3.5l1.9 1.9M18.6 18.6l1.9 1.9M1.6 12h2.6M19.8 12h2.6M3.5 20.5l1.9-1.9M18.6 5.4l1.9-1.9" />
          </g>
          <circle
            className="wx-motion animate-sun-pulse"
            cx="12"
            cy="12"
            r="4.2"
            fill="currentColor"
            stroke="none"
            opacity="0.85"
          />
        </>
      )
    case 'moon':
      return (
        <>
          <path className="wx-motion animate-float" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          <circle
            className="wx-motion animate-twinkle"
            cx="18.6"
            cy="4.6"
            r="0.9"
            fill="currentColor"
            stroke="none"
          />
          <circle
            className="wx-motion animate-twinkle [animation-delay:0.7s]"
            cx="21.4"
            cy="8.6"
            r="0.6"
            fill="currentColor"
            stroke="none"
          />
        </>
      )
    case 'cloud':
      return (
        <>
          <path
            className="wx-motion animate-drift [animation-delay:0.6s]"
            d={CLOUD_HIGH}
            opacity="0.35"
          />
          <path className="wx-motion animate-float" d={CLOUD} />
        </>
      )
    case 'rain':
      return (
        <>
          <path className="wx-motion animate-float" d={CLOUD_HIGH} />
          <g>
            <path className="wx-motion animate-drip" d="m9 17.2-1.2 3" />
            <path className="wx-motion animate-drip [animation-delay:0.43s]" d="m12.5 17.2-1.2 3" />
            <path className="wx-motion animate-drip [animation-delay:0.86s]" d="m16 17.2-1.2 3" />
          </g>
        </>
      )
    case 'snow':
      return (
        <>
          <path className="wx-motion animate-float" d={CLOUD_HIGH} />
          <g>
            <path className="wx-motion animate-fall" d="M8.6 17.2v2.6M7.3 18.5h2.6" />
            <path
              className="wx-motion animate-fall [animation-delay:0.9s]"
              d="M12.6 17.2v2.6M11.3 18.5h2.6"
            />
            <path
              className="wx-motion animate-fall [animation-delay:1.8s]"
              d="M16.6 17.2v2.6M15.3 18.5h2.6"
            />
          </g>
        </>
      )
    case 'thunder':
      return (
        <>
          <path className="wx-motion animate-float" d={CLOUD_HIGH} />
          <path
            className="wx-motion animate-bolt"
            d="M13.6 14.6 10 18.6h2.6l-1 4.2 3.6-4.4h-2.4l1-3.8z"
            fill="currentColor"
            stroke="none"
          />
        </>
      )
    case 'fog':
      return (
        <>
          <path className="wx-motion animate-float" d={CLOUD_FOG} />
          <g>
            <path className="wx-motion animate-drift" d="M4 16.6h16" />
            <path className="wx-motion animate-drift [animation-delay:0.4s]" d="M6 20.4h12" />
          </g>
        </>
      )
  }
}

export default function WeatherIcon({ kind, className = '' }: Props) {
  return (
    <svg
      className={`overflow-visible ${className}`}
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
