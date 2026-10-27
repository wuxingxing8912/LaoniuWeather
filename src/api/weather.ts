import type {
  City,
  CurrentWeather,
  DailyWeather,
  HistoryDay,
  WeatherResult,
} from '../types/weather'

const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_API = 'https://api.open-meteo.com/v1/forecast'

interface GeocodingResponse {
  results?: Array<{
    id: number
    name: string
    country: string
    admin1?: string
    latitude: number
    longitude: number
  }>
}

interface DailyResponse {
  time?: string[]
  weather_code?: number[]
  temperature_2m_max?: number[]
  temperature_2m_min?: number[]
  precipitation_probability_max?: number[]
  wind_speed_10m_max?: number[]
  uv_index_max?: number[]
  precipitation_sum?: number[]
}

interface ForecastResponse {
  current: Partial<{
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    wind_speed_10m: number
    wind_gusts_10m: number
    precipitation: number
    uv_index: number
    weather_code: number
    is_day: number
  }>
  daily: DailyResponse
}

export async function searchCities(keyword: string): Promise<City[]> {
  const query = keyword.trim()
  if (!query) return []

  const params = new URLSearchParams({
    name: query,
    count: '8',
    language: 'zh',
    format: 'json',
  })
  const res = await fetch(`${GEOCODING_API}?${params}`)
  if (!res.ok) throw new Error('城市搜索失败，请稍后重试')

  const data = (await res.json()) as GeocodingResponse
  return (data.results ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    country: item.country,
    admin1: item.admin1,
    latitude: item.latitude,
    longitude: item.longitude,
  }))
}

export async function fetchWeather(city: City): Promise<WeatherResult> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'wind_gusts_10m',
      'precipitation',
      'uv_index',
      'weather_code',
      'is_day',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'uv_index_max',
    ].join(','),
    timezone: 'auto',
    forecast_days: '1',
  })
  const res = await fetch(`${FORECAST_API}?${params}`)
  if (!res.ok) throw new Error('天气数据获取失败，请稍后重试')

  const data = (await res.json()) as ForecastResponse
  const rawCurrent = data.current ?? {}
  const rawDaily = data.daily ?? {}

  const current: CurrentWeather = {
    temperature: rawCurrent.temperature_2m ?? 0,
    apparentTemperature: rawCurrent.apparent_temperature ?? rawCurrent.temperature_2m ?? 0,
    humidity: rawCurrent.relative_humidity_2m ?? 0,
    windSpeed: rawCurrent.wind_speed_10m ?? 0,
    windGust: rawCurrent.wind_gusts_10m ?? rawCurrent.wind_speed_10m ?? 0,
    precipitation: rawCurrent.precipitation ?? 0,
    uvIndex: rawCurrent.uv_index ?? 0,
    weatherCode: rawCurrent.weather_code ?? 0,
    isDay: rawCurrent.is_day === 1,
    time: rawCurrent.time ?? '',
  }

  const daily: DailyWeather = {
    weatherCode: rawDaily.weather_code?.[0] ?? current.weatherCode,
    maxTemperature: rawDaily.temperature_2m_max?.[0] ?? current.temperature,
    minTemperature: rawDaily.temperature_2m_min?.[0] ?? current.temperature,
    precipitationProbability: rawDaily.precipitation_probability_max?.[0] ?? 0,
    maxWindSpeed: rawDaily.wind_speed_10m_max?.[0] ?? current.windSpeed,
    maxUvIndex: rawDaily.uv_index_max?.[0] ?? current.uvIndex,
  }

  return { city, current, daily }
}

export async function fetchHistory(city: City, days: number): Promise<HistoryDay[]> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'wind_speed_10m_max',
      'weather_code',
    ].join(','),
    past_days: String(days),
    forecast_days: '1',
    timezone: 'auto',
  })
  const res = await fetch(`${FORECAST_API}?${params}`)
  if (!res.ok) throw new Error('历史天气获取失败，请稍后重试')

  const data = (await res.json()) as { daily?: DailyResponse }
  const daily = data.daily ?? {}
  const times = daily.time ?? []
  const maxList = daily.temperature_2m_max ?? []
  const minList = daily.temperature_2m_min ?? []

  const history: HistoryDay[] = times
    .map((date, index) => ({
      date,
      maxTemperature: maxList[index] ?? 0,
      minTemperature: minList[index] ?? 0,
      precipitation: daily.precipitation_sum?.[index] ?? 0,
      maxWindSpeed: daily.wind_speed_10m_max?.[index] ?? 0,
      weatherCode: daily.weather_code?.[index] ?? 0,
    }))
    .filter((_, index) => maxList[index] != null && minList[index] != null)

  if (history.length === 0) throw new Error('暂无该城市的历史天气数据')
  return history
}
