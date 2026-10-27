export type IconKind = 'sun' | 'moon' | 'cloud' | 'rain' | 'snow' | 'thunder' | 'fog'

interface WeatherMeta {
  label: string
  icon: IconKind
}

const WEATHER_CODES: Record<number, WeatherMeta> = {
  0: { label: '晴', icon: 'sun' },
  1: { label: '大部晴朗', icon: 'sun' },
  2: { label: '多云', icon: 'cloud' },
  3: { label: '阴', icon: 'cloud' },
  45: { label: '有雾', icon: 'fog' },
  48: { label: '雾凇', icon: 'fog' },
  51: { label: '毛毛雨', icon: 'rain' },
  53: { label: '小雨', icon: 'rain' },
  55: { label: '中雨', icon: 'rain' },
  56: { label: '冻毛毛雨', icon: 'rain' },
  57: { label: '冻雨', icon: 'rain' },
  61: { label: '小雨', icon: 'rain' },
  63: { label: '中雨', icon: 'rain' },
  65: { label: '大雨', icon: 'rain' },
  66: { label: '冻雨', icon: 'rain' },
  67: { label: '强冻雨', icon: 'rain' },
  71: { label: '小雪', icon: 'snow' },
  73: { label: '中雪', icon: 'snow' },
  75: { label: '大雪', icon: 'snow' },
  77: { label: '米雪', icon: 'snow' },
  80: { label: '阵雨', icon: 'rain' },
  81: { label: '强阵雨', icon: 'rain' },
  82: { label: '暴雨', icon: 'rain' },
  85: { label: '阵雪', icon: 'snow' },
  86: { label: '强阵雪', icon: 'snow' },
  95: { label: '雷阵雨', icon: 'thunder' },
  96: { label: '雷阵雨伴冰雹', icon: 'thunder' },
  99: { label: '强雷暴伴冰雹', icon: 'thunder' },
}

export function describeWeather(code: number, isDay = true): WeatherMeta {
  const meta = WEATHER_CODES[code] ?? { label: '未知天气', icon: 'cloud' }
  if (!isDay && meta.icon === 'sun') return { ...meta, icon: 'moon' }
  return meta
}
