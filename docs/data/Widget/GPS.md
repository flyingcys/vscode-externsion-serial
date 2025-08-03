# GPS地图组件 (GPS)

## 概述

GPS地图组件提供基于瓦片地图的GPS位置可视化功能，支持多种地图源、实时轨迹绘制、天气图层等高级功能。该组件基于ArcGIS/ESRI瓦片服务，无需外部插件或QtLocation支持。

## 数据格式要求

### 组配置结构

```json
{
    "title": "GPS Location",
    "widget": "map",
    "datasets": [
        {
            "title": "Latitude",
            "units": "°",
            "widget": "lat",
            "index": 1,
            "graph": false,
            "min": -90,
            "max": 90
        },
        {
            "title": "Longitude", 
            "units": "°",
            "widget": "lon",
            "index": 2,
            "graph": false,
            "min": -180,
            "max": 180
        },
        {
            "title": "Altitude",
            "units": "m",
            "widget": "alt",
            "index": 3,
            "graph": false,
            "min": -1000,
            "max": 10000
        }
    ]
}
```

### 核心属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `latitude` | double | 0.0 | 纬度（-90°至+90°） |
| `longitude` | double | 0.0 | 经度（-180°至+180°） |
| `altitude` | double | 0.0 | 海拔高度（米） |
| `mapType` | int | 0 | 地图类型（0-6） |
| `zoomLevel` | int | 10 | 缩放级别（1-18） |
| `autoCenter` | bool | true | 自动居中 |
| `showWeather` | bool | false | 显示天气图层 |
| `showNasaWeather` | bool | false | 显示NASA天气数据 |
| `plotTrajectory` | bool | true | 绘制轨迹 |

## 地图类型配置

### 支持的地图类型

| ID | 类型 | 描述 | 最大缩放 |
|----|------|------|----------|
| 0 | 街道地图 | 标准街道地图 | 18 |
| 1 | 卫星地图 | 卫星影像 | 18 |
| 2 | 地形地图 | 地形等高线 | 16 |
| 3 | 海洋地图 | 海洋专用地图 | 16 |
| 4 | 国家地理 | National Geographic风格 | 16 |
| 5 | 灰度地图 | 灰度街道地图 | 18 |
| 6 | 深色地图 | 深色主题地图 | 18 |

### 地图配置示例

```json
{
    "mapType": 1,           // 卫星地图
    "zoomLevel": 15,        // 缩放级别
    "autoCenter": true,     // 自动居中
    "showWeather": true,    // 显示天气
    "plotTrajectory": true  // 绘制轨迹
}
```

## 数据集要求

GPS组件**必须**包含三个数据集：

1. **纬度数据集**：`widget` 属性必须设置为 `"lat"`
2. **经度数据集**：`widget` 属性必须设置为 `"lon"`
3. **海拔数据集**：`widget` 属性必须设置为 `"alt"`

## 测试数据示例

### 中国主要城市坐标

```bash
# 北京天安门
$39.9042,116.4074,50.5;

# 上海外滩
$31.2304,121.4737,10.2;

# 深圳市中心
$22.5431,114.0579,15.8;

# 成都天府广场
$30.6598,104.0657,500.3;
```

### GPS轨迹测试

```bash
# 移动轨迹示例（每秒更新）
$39.9042,116.4074,50.5;
$39.9045,116.4077,51.2;
$39.9048,116.4080,51.8;
$39.9051,116.4083,52.1;
```

### 海拔变化测试

```bash
# 爬山场景
$40.0000,116.0000,100.0;
$40.0010,116.0010,150.0;
$40.0020,116.0020,200.0;
$40.0030,116.0030,300.0;
```

## 高级功能

### 天气图层

```cpp
// 天气图层配置
showWeather: true,          // 启用天气图层
showNasaWeather: true,      // 启用NASA天气数据
weatherDays: [0, 1, 2]      // 天气预报天数
```

### 轨迹绘制

```cpp
// 轨迹配置
plotTrajectory: true,       // 启用轨迹绘制
lineHeadColor: "#FF0000",   // 轨迹头部颜色
lineTailColor: "#0000FF"    // 轨迹尾部颜色
```

### 交互功能

- **鼠标滚轮**：缩放地图
- **鼠标拖拽**：平移地图
- **自动居中**：跟随GPS位置移动

## 性能优化

### 瓦片缓存

```cpp
// 瓦片缓存配置
QCache<QString, QImage> tileCache;  // 瓦片缓存
precacheWorld();                    // 预缓存世界地图
```

### 网络管理

```cpp
// 网络配置
QNetworkAccessManager network;      // 网络管理器
QHash<QString, QNetworkReply*> pending;  // 待处理请求
```

## 坐标系统

### 支持的坐标系统

- **WGS84**：全球定位系统标准坐标系
- **Web Mercator**：网络地图投影坐标系

### 坐标转换

```cpp
// 坐标转换函数
QPointF latLonToTile(double lat, double lon, int zoom);
QPointF tileToLatLon(const QPointF &tile, int zoom);
```

## 数值范围验证

### 纬度范围
- **最小值**：-90.0°（南极）
- **最大值**：+90.0°（北极）
- **精度**：建议保留6位小数

### 经度范围
- **最小值**：-180.0°（国际日期变更线西侧）
- **最大值**：+180.0°（国际日期变更线东侧）
- **精度**：建议保留6位小数

### 海拔范围
- **最低点**：-500m（死海等）
- **最高点**：10000m（珠穆朗玛峰及航空应用）
- **精度**：建议保留1位小数

## 使用注意事项

1. **网络连接**：需要稳定的网络连接来下载地图瓦片
2. **坐标精度**：GPS坐标建议保留至少6位小数以确保精度
3. **更新频率**：建议GPS数据更新频率不超过10Hz以保证性能
4. **缓存管理**：地图瓦片会自动缓存，长时间使用需注意内存占用
5. **离线使用**：首次访问区域后会缓存瓦片，支持短时间离线使用

## 错误处理

### 常见错误
- GPS坐标超出有效范围
- 网络连接失败导致地图瓦片加载失败
- 缺少纬度、经度或海拔数据集

### 调试建议
- 检查GPS坐标是否在有效范围内
- 验证网络连接是否正常
- 确认数据帧格式正确

## 示例项目配置

```json
{
    "title": "Vehicle GPS Tracker",
    "widget": "map",
    "mapType": 1,
    "zoomLevel": 16,
    "autoCenter": true,
    "showWeather": false,
    "plotTrajectory": true,
    "datasets": [
        {
            "title": "Latitude",
            "units": "°",
            "widget": "lat",
            "index": 1,
            "graph": false,
            "min": -90,
            "max": 90
        },
        {
            "title": "Longitude", 
            "units": "°",
            "widget": "lon",
            "index": 2,
            "graph": false,
            "min": -180,
            "max": 180
        },
        {
            "title": "Altitude",
            "units": "m",
            "widget": "alt",
            "index": 3,
            "graph": false,
            "min": 0,
            "max": 1000
        }
    ]
}
```