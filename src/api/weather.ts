import type { City, CurrentWeather, WeatherResult } from '../types/weather'

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

interface ForecastResponse {
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    wind_speed_10m: number
    weather_code: number
    is_day: number
  }
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
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
    timezone: 'auto',
  })
  const res = await fetch(`${FORECAST_API}?${params}`)
  if (!res.ok) throw new Error('天气数据获取失败，请稍后重试')

  const data = (await res.json()) as ForecastResponse
  const current: CurrentWeather = {
    temperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day === 1,
    time: data.current.time,
  }

  return { city, current }
}
