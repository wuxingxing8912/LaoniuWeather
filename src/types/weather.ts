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
  weatherCode: number
  isDay: boolean
  time: string
}

export interface WeatherResult {
  city: City
  current: CurrentWeather
}
