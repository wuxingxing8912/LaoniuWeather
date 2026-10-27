export interface City {
  id: number
  name: string
  country: string
  admin1?: string
  latitude: number
  longitude: number
}

export interface CurrentWeather {
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: number
  windGust: number
  precipitation: number
  uvIndex: number
  weatherCode: number
  isDay: boolean
  time: string
}

export interface DailyWeather {
  weatherCode: number
  maxTemperature: number
  minTemperature: number
  precipitationProbability: number
  maxWindSpeed: number
  maxUvIndex: number
}

export interface HistoryDay {
  date: string
  maxTemperature: number
  minTemperature: number
  precipitation: number
  maxWindSpeed: number
  weatherCode: number
}

export interface WeatherResult {
  city: City
  current: CurrentWeather
  daily: DailyWeather
}

export type AlertLevel = 'danger' | 'warning' | 'info'

export interface WeatherAlert {
  id: string
  level: AlertLevel
  title: string
  description: string
  icon: 'thunder' | 'rain' | 'snow' | 'fog' | 'sun' | 'moon' | 'cloud'
}
