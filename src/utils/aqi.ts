import type { AirQuality } from '../types/weather'

export type PollutantKey = 'pm25' | 'pm10' | 'so2' | 'no2' | 'co' | 'o3'

export type AqiLevel = 'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'severe' | 'hazardous'

export interface AqiMeta {
  level: AqiLevel
  label: string
  text: string
  chip: string
  advice: string
}

const IAQI_SCALE = [0, 50, 100, 150, 200, 300, 400, 500]

// 中国《环境空气质量指数(AQI)技术规定》HJ 633-2012 浓度限值
const BREAKPOINTS: Record<PollutantKey, number[]> = {
  pm25: [0, 35, 75, 115, 150, 250, 350, 500],
  pm10: [0, 50, 150, 250, 350, 420, 500, 600],
  so2: [0, 50, 150, 475, 800, 1600, 2100, 2620],
  no2: [0, 40, 80, 180, 280, 565, 750, 940],
  co: [0, 2, 4, 14, 24, 36, 48, 60],
  o3: [0, 160, 200, 300, 400, 800, 1000, 1200],
}

export const POLLUTANT_LABELS: Record<PollutantKey, string> = {
  pm25: 'PM2.5',
  pm10: 'PM10',
  so2: 'SO₂',
  no2: 'NO₂',
  co: 'CO',
  o3: 'O₃',
}

export const POLLUTANT_UNITS: Record<PollutantKey, string> = {
  pm25: 'μg/m³',
  pm10: 'μg/m³',
  so2: 'μg/m³',
  no2: 'μg/m³',
  co: 'mg/m³',
  o3: 'μg/m³',
}

function interpolate(value: number, table: number[]) {
  if (!Number.isFinite(value) || value <= 0) return 0
  for (let i = 1; i < table.length; i += 1) {
    if (value <= table[i]) {
      const [cLow, cHigh] = [table[i - 1], table[i]]
      const [iLow, iHigh] = [IAQI_SCALE[i - 1], IAQI_SCALE[i]]
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (value - cLow) + iLow)
    }
  }
  return 500
}

export function calcChinaAqi(air: AirQuality) {
  const values: Record<PollutantKey, number> = {
    pm25: air.pm25,
    pm10: air.pm10,
    so2: air.so2,
    no2: air.no2,
    co: air.co,
    o3: air.o3,
  }

  let aqi = 0
  let primary: PollutantKey | null = null
  for (const key of Object.keys(values) as PollutantKey[]) {
    const iaqi = interpolate(values[key], BREAKPOINTS[key])
    if (iaqi > aqi) {
      aqi = iaqi
      primary = key
    }
  }

  return { aqi, primary }
}

export function describeAqi(aqi: number): AqiMeta {
  if (aqi <= 50)
    return {
      level: 'good',
      label: '优',
      text: 'text-emerald-300',
      chip: 'bg-emerald-400/15 text-emerald-200',
      advice: '空气质量令人满意，可放心进行户外活动。',
    }
  if (aqi <= 100)
    return {
      level: 'moderate',
      label: '良',
      text: 'text-yellow-300',
      chip: 'bg-yellow-400/15 text-yellow-200',
      advice: '空气质量可接受，极少数敏感人群应减少户外活动。',
    }
  if (aqi <= 150)
    return {
      level: 'sensitive',
      label: '轻度污染',
      text: 'text-orange-300',
      chip: 'bg-orange-400/15 text-orange-200',
      advice: '儿童、老年人及心肺疾病患者应减少长时间高强度户外锻炼。',
    }
  if (aqi <= 200)
    return {
      level: 'unhealthy',
      label: '中度污染',
      text: 'text-rose-300',
      chip: 'bg-rose-400/15 text-rose-200',
      advice: '敏感人群避免户外活动，一般人群适量减少户外运动。',
    }
  if (aqi <= 300)
    return {
      level: 'severe',
      label: '重度污染',
      text: 'text-purple-300',
      chip: 'bg-purple-400/15 text-purple-200',
      advice: '建议停止户外运动，外出佩戴口罩并关闭门窗。',
    }
  return {
    level: 'hazardous',
    label: '严重污染',
    text: 'text-red-400',
    chip: 'bg-red-500/15 text-red-200',
    advice: '尽量留在室内，避免户外暴露，必要时开启空气净化器。',
  }
}
