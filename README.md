# 老牛天气 LaoniuWeather

基于 React + TypeScript + Vite + Tailwind CSS 的简易天气应用。

## 功能

- 城市搜索（Open-Meteo Geocoding API，支持中英文）
- 当前天气展示：温度、体感、湿度、风速、天气状况
- 天气预警：雷暴、暴雨、大雪、大风、极端高低温、紫外线、雾、昼夜温差等，按严重/注意/提示分级提醒，出现严重预警时页面标题同步提示
- 历史天气与趋势：查询近 7/14/30 天逐日天气，绘制气温折线图与降水柱状图，给出升降温趋势、平均气温、极端日期、降水统计
- 空气质量：按中国 HJ 633-2012 标准由六项污染物实时浓度计算 AQI，含等级、首要污染物、健康建议，并联动生成污染预警
- 多城市对比：最多 6 个城市横向比较，含洞察（最热/最冷/温差最大/降水最多）、今日气温区间条与逐城天气卡
- 收藏城市，使用 LocalStorage 持久化
- 移动端适配

## 开发

```bash
npm install
npm run dev      # 本地开发
npm run build    # 类型检查 + 构建
npm run preview  # 预览构建产物
```

## 目录结构

```
src/
  api/          天气与城市搜索接口封装
  components/   SearchBar / CurrentWeather / FavoriteList / WeatherIcon
  hooks/        useLocalStorage
  types/        类型定义
  utils/        天气码映射
  App.tsx       页面组装与状态管理
  main.tsx      入口
```

天气数据来自 [Open-Meteo](https://open-meteo.com/)，无需 API Key。
