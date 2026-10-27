import type { AirQuality, AlertLevel, WeatherAlert, WeatherResult } from '../types/weather'
import { calcChinaAqi } from './aqi'

const THUNDER_CODES = [95, 96, 99]
const HEAVY_RAIN_CODES = [65, 67, 81, 82]
const RAIN_CODES = [51, 53, 55, 56, 57, 61, 63, 80]
const HEAVY_SNOW_CODES = [75, 86]
const SNOW_CODES = [71, 73, 77, 85]
const FOG_CODES = [45, 48]

const LEVEL_ORDER: Record<AlertLevel, number> = { danger: 0, warning: 1, info: 2 }

export function buildAlerts(weather: WeatherResult, air?: AirQuality | null): WeatherAlert[] {
  const { current, daily } = weather
  const alerts: WeatherAlert[] = []

  const add = (
    level: AlertLevel,
    id: string,
    title: string,
    description: string,
    icon: WeatherAlert['icon'],
  ) => alerts.push({ level, id, title, description, icon })

  // 雷暴
  if (THUNDER_CODES.includes(current.weatherCode)) {
    add(
      'danger',
      'thunder-now',
      '雷暴预警',
      '当前正在发生雷阵雨，请留在室内，远离高处、树木与金属设施。',
      'thunder',
    )
  } else if (THUNDER_CODES.includes(daily.weatherCode)) {
    add(
      'warning',
      'thunder-today',
      '今日有雷阵雨',
      '今日预报有雷雨，外出请携带雨具并留意天气变化。',
      'thunder',
    )
  }

  // 强降水
  if (HEAVY_RAIN_CODES.includes(current.weatherCode) || current.precipitation >= 7.6) {
    add(
      'danger',
      'rain-heavy',
      '暴雨预警',
      '当前降水强度大，注意城市内涝与道路积水，尽量避免驾车涉水。',
      'rain',
    )
  } else if (RAIN_CODES.includes(current.weatherCode) || current.precipitation > 0) {
    add('warning', 'rain-now', '降雨提醒', '当前有降水，出行请携带雨具并注意路面湿滑。', 'rain')
  } else if (daily.precipitationProbability >= 70) {
    add(
      'info',
      'rain-today',
      '今日降水概率高',
      `今日降水概率约 ${Math.round(daily.precipitationProbability)}%，建议随身携带雨具。`,
      'rain',
    )
  }

  // 降雪
  if (HEAVY_SNOW_CODES.includes(current.weatherCode)) {
    add(
      'danger',
      'snow-heavy',
      '大雪预警',
      '当前降雪强度大，能见度与路况较差，注意防滑和保暖。',
      'snow',
    )
  } else if (SNOW_CODES.includes(current.weatherCode)) {
    add('warning', 'snow-now', '降雪提醒', '当前有降雪，出行注意道路结冰与保暖。', 'snow')
  }

  // 大风
  if (current.windGust >= 75) {
    add(
      'danger',
      'wind-extreme',
      '狂风预警',
      `阵风达 ${Math.round(current.windGust)} km/h，请远离临时搭建物、广告牌与高空作业区。`,
      'cloud',
    )
  } else if (current.windGust >= 50) {
    add(
      'warning',
      'wind-strong',
      '大风提醒',
      `阵风约 ${Math.round(current.windGust)} km/h，注意高空坠物，谨慎骑行。`,
      'cloud',
    )
  } else if (daily.maxWindSpeed >= 40) {
    add(
      'info',
      'wind-today',
      '今日风力较大',
      `今日最大风速约 ${Math.round(daily.maxWindSpeed)} km/h，注意防风。`,
      'cloud',
    )
  }

  // 高温与低温
  if (current.temperature >= 40) {
    add('danger', 'heat-extreme', '极端高温预警', '气温已达 40℃ 以上，避免户外作业，及时补水降温。', 'sun')
  } else if (current.temperature >= 35) {
    add('warning', 'heat', '高温提醒', '气温较高，减少午后户外活动，注意防暑补水。', 'sun')
  }

  if (current.temperature <= -10) {
    add('danger', 'cold-extreme', '极端低温预警', '气温低于 -10℃，注意防冻保暖，防范管道结冰。', 'snow')
  } else if (current.temperature <= 0) {
    add('warning', 'cold', '低温结冰提醒', '气温在 0℃ 以下，路面可能结冰，注意保暖与防滑。', 'snow')
  }

  // 体感差异
  const feelsGap = current.apparentTemperature - current.temperature
  if (feelsGap >= 3 && current.temperature >= 28) {
    add('info', 'feels-hot', '体感闷热', `体感温度约 ${Math.round(current.apparentTemperature)}℃，高于实测气温，注意防暑。`, 'sun')
  }
  if (feelsGap <= -3 && current.temperature <= 5) {
    add('info', 'feels-cold', '风寒效应明显', `体感温度约 ${Math.round(current.apparentTemperature)}℃，低于实测气温，注意添衣。`, 'cloud')
  }

  // 紫外线
  if (daily.maxUvIndex >= 11) {
    add('danger', 'uv-extreme', '紫外线极强', `今日紫外线指数达 ${Math.round(daily.maxUvIndex)}，尽量避免正午外出，做好防晒。`, 'sun')
  } else if (daily.maxUvIndex >= 8) {
    add('warning', 'uv-high', '紫外线很强', `今日紫外线指数约 ${Math.round(daily.maxUvIndex)}，外出请涂抹防晒并佩戴墨镜。`, 'sun')
  }

  // 低能见度
  if (FOG_CODES.includes(current.weatherCode)) {
    add('warning', 'fog', '能见度低', '当前有雾，驾车请减速并开启雾灯，保持安全车距。', 'fog')
  }

  // 空气质量
  if (air) {
    const { aqi } = calcChinaAqi(air)
    if (aqi > 300) {
      add('danger', 'air-hazard', '严重污染', `AQI 达 ${aqi}，请留在室内并关闭门窗，避免户外暴露。`, 'fog')
    } else if (aqi > 200) {
      add('danger', 'air-severe', '重度污染', `AQI 达 ${aqi}，建议停止户外运动，外出佩戴口罩。`, 'fog')
    } else if (aqi > 150) {
      add('warning', 'air-unhealthy', '中度污染', `AQI ${aqi}，敏感人群应避免户外活动。`, 'fog')
    } else if (aqi > 100) {
      add('info', 'air-sensitive', '轻度污染', `AQI ${aqi}，易感人群请减少长时间户外锻炼。`, 'fog')
    }
  }

  // 昼夜温差
  const dayRange = daily.maxTemperature - daily.minTemperature
  if (dayRange >= 12) {
    add(
      'info',
      'temp-range',
      '昼夜温差大',
      `今日温差约 ${Math.round(dayRange)}℃，早晚注意增减衣物。`,
      current.isDay ? 'sun' : 'moon',
    )
  }

  return alerts.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level])
}
