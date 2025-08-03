# 单线图组件 (Plot)

## 概述

单线图组件用于实时显示单个数据集的时间序列数据，提供连续的数据趋势可视化。支持自动缩放、实时更新、数据缓存等功能，适用于温度监测、电压监控、传感器数据显示等需要观察单一数据源变化趋势的场景。

## 数据格式要求

### 数据集配置结构

```json
{
    "title": "Temperature",
    "units": "℃",
    "graph": true,
    "index": 1
}
```

### 核心属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `xLabel` | string | "Time" | X轴标签（通常为时间） |
| `yLabel` | string | 数据单位 | Y轴标签（数据单位） |
| `minX/maxX` | double | 自动计算 | X轴范围 |
| `minY/maxY` | double | 自动计算 | Y轴范围 |
| `xTickInterval` | double | 自动计算 | X轴刻度间隔 |
| `yTickInterval` | double | 自动计算 | Y轴刻度间隔 |

## 数据集要求

单线图组件需要单个数据集，必须设置以下属性：

- **`graph`**：必须设置为 `true`
- **`index`**：数据帧中的索引位置
- **`title`**：数据集标题
- **`units`**：数据单位（用于Y轴标签）

## 测试数据示例

### 温度监测

```bash
# 温度随时间变化
$25.6;
$25.8;
$26.1;
$25.9;
$26.3;
$26.0;
$25.7;
```

### 电压监控

```bash
# 电源电压监测
$3.30;
$3.32;
$3.28;
$3.31;
$3.29;
$3.33;
$3.27;
```

### 传感器数据

```bash
# 压力传感器读数
$1013.25;  // 标准大气压
$1013.48;
$1013.12;
$1013.67;
$1013.33;
```

### 周期性信号

```python
# Python生成正弦波测试数据
import numpy as np
import time

# 1Hz正弦波，采样频率10Hz
fs = 10
f = 1
t = 0
dt = 1.0 / fs

while True:
    value = np.sin(2 * np.pi * f * t)
    print(f"${value:.6f};")
    t += dt
    time.sleep(0.1)
```

### 噪声信号

```python
# 带噪声的信号测试
import numpy as np
import random

base_value = 25.0  # 基准值
noise_level = 0.5  # 噪声幅度

for i in range(1000):
    noise = random.uniform(-noise_level, noise_level)
    value = base_value + noise
    print(f"${value:.2f};")
```

## 图表绘制

### 数据点绘制

```cpp
// 绘制数据曲线
void draw(QXYSeries *series) {
    if (!series || m_data.isEmpty()) return;
    
    // 清空现有数据
    series->clear();
    
    // 添加所有数据点
    for (const auto &point : m_data) {
        series->append(point);
    }
}
```

### 实时数据更新

```cpp
// 更新数据点
void updateData() {
    const auto &frame = JSON::FrameBuilder::instance().frame();
    const auto &dataset = getDataset();
    
    if (!dataset || !dataset->graph()) return;
    
    // 获取当前时间戳
    double currentTime = QDateTime::currentMSecsSinceEpoch() / 1000.0;
    
    // 解析数据值
    bool ok;
    double value = dataset->value().toDouble(&ok);
    if (!ok) return;
    
    // 添加新数据点
    QPointF newPoint(currentTime, value);
    m_data.append(newPoint);
    
    // 限制数据点数量
    static const int MAX_POINTS = 10000;
    if (m_data.size() > MAX_POINTS) {
        m_data.removeFirst();
    }
    
    // 更新坐标轴范围
    updateRange();
}
```

## 坐标轴管理

### 自动范围计算

```cpp
// 计算X轴和Y轴的自动范围
void calculateAutoScaleRange() {
    if (m_data.isEmpty()) return;
    
    // 找到X和Y的最值
    bool firstPoint = true;
    for (const auto &point : m_data) {
        if (firstPoint) {
            m_minX = m_maxX = point.x();
            m_minY = m_maxY = point.y();
            firstPoint = false;
        } else {
            m_minX = qMin(m_minX, point.x());
            m_maxX = qMax(m_maxX, point.x());
            m_minY = qMin(m_minY, point.y());
            m_maxY = qMax(m_maxY, point.y());
        }
    }
    
    // 添加边距（5%）
    double xRange = m_maxX - m_minX;
    double yRange = m_maxY - m_minY;
    
    if (xRange > 0) {
        double xMargin = xRange * 0.05;
        m_minX -= xMargin;
        m_maxX += xMargin;
    }
    
    if (yRange > 0) {
        double yMargin = yRange * 0.05;
        m_minY -= yMargin;
        m_maxY += yMargin;
    }
    
    // 避免零范围
    if (xRange == 0) {
        m_minX -= 1;
        m_maxX += 1;
    }
    
    if (yRange == 0) {
        m_minY -= 1;
        m_maxY += 1;
    }
}
```

### 刻度间隔计算

```cpp
// 计算合适的刻度间隔
double calculateTickInterval(double range) {
    if (range <= 0) return 1.0;
    
    // 目标刻度数量
    static const int TARGET_TICKS = 8;
    
    double rawStep = range / TARGET_TICKS;
    double magnitude = std::pow(10, std::floor(std::log10(rawStep)));
    double normalizedStep = rawStep / magnitude;
    
    // 选择合适的步长
    double step;
    if (normalizedStep <= 1.0) {
        step = 1.0;
    } else if (normalizedStep <= 2.0) {
        step = 2.0;
    } else if (normalizedStep <= 5.0) {
        step = 5.0;
    } else {
        step = 10.0;
    }
    
    return step * magnitude;
}
```

### 时间轴处理

```cpp
// 时间轴标签格式化
QString formatTimeLabel(double timestamp) {
    QDateTime dateTime = QDateTime::fromMSecsSinceEpoch(timestamp * 1000);
    
    // 根据时间跨度选择格式
    double timeSpan = m_maxX - m_minX;
    
    if (timeSpan < 60) {
        // 小于1分钟，显示秒
        return dateTime.toString("ss.zzz");
    } else if (timeSpan < 3600) {
        // 小于1小时，显示分:秒
        return dateTime.toString("mm:ss");
    } else if (timeSpan < 86400) {
        // 小于1天，显示时:分
        return dateTime.toString("hh:mm");
    } else {
        // 超过1天，显示日期
        return dateTime.toString("MM-dd hh:mm");
    }
}
```

## 数据处理

### 数据过滤

```cpp
// 数据平滑滤波
class DataFilter {
public:
    // 移动平均滤波
    static QVector<QPointF> movingAverage(const QVector<QPointF> &data, int windowSize) {
        if (windowSize <= 1 || data.size() < windowSize) return data;
        
        QVector<QPointF> filtered;
        
        for (int i = 0; i < data.size(); ++i) {
            double sum = 0.0;
            int count = 0;
            
            int start = qMax(0, i - windowSize / 2);
            int end = qMin(data.size() - 1, i + windowSize / 2);
            
            for (int j = start; j <= end; ++j) {
                sum += data[j].y();
                count++;
            }
            
            double avgY = sum / count;
            filtered.append(QPointF(data[i].x(), avgY));
        }
        
        return filtered;
    }
    
    // 低通滤波
    static QVector<QPointF> lowPassFilter(const QVector<QPointF> &data, double alpha) {
        if (data.isEmpty() || alpha <= 0 || alpha >= 1) return data;
        
        QVector<QPointF> filtered;
        filtered.reserve(data.size());
        
        double filteredY = data.first().y();
        for (const auto &point : data) {
            filteredY = alpha * point.y() + (1 - alpha) * filteredY;
            filtered.append(QPointF(point.x(), filteredY));
        }
        
        return filtered;
    }
};
```

### 数据统计

```cpp
// 数据统计信息
struct DataStatistics {
    double min, max, mean, stddev;
    int count;
    
    static DataStatistics calculate(const QVector<QPointF> &data) {
        DataStatistics stats = {0, 0, 0, 0, 0};
        
        if (data.isEmpty()) return stats;
        
        stats.count = data.size();
        stats.min = stats.max = data.first().y();
        
        // 计算最值和均值
        double sum = 0.0;
        for (const auto &point : data) {
            double y = point.y();
            stats.min = qMin(stats.min, y);
            stats.max = qMax(stats.max, y);
            sum += y;
        }
        stats.mean = sum / stats.count;
        
        // 计算标准差
        double variance = 0.0;
        for (const auto &point : data) {
            double diff = point.y() - stats.mean;
            variance += diff * diff;
        }
        stats.stddev = std::sqrt(variance / stats.count);
        
        return stats;
    }
};
```

## 性能优化

### 数据点限制

```cpp
// 智能数据点管理
class DataPointManager {
private:
    static const int SOFT_LIMIT = 5000;   // 软限制
    static const int HARD_LIMIT = 10000;  // 硬限制
    
public:
    void addPoint(QVector<QPointF> &data, const QPointF &newPoint) {
        data.append(newPoint);
        
        if (data.size() > HARD_LIMIT) {
            // 超过硬限制，删除一半旧数据
            int removeCount = data.size() - SOFT_LIMIT;
            data.remove(0, removeCount);
        }
    }
    
    // 降采样
    void downsample(QVector<QPointF> &data, int targetSize) {
        if (data.size() <= targetSize) return;
        
        QVector<QPointF> downsampled;
        downsampled.reserve(targetSize);
        
        double step = double(data.size() - 1) / (targetSize - 1);
        
        for (int i = 0; i < targetSize; ++i) {
            int index = qRound(i * step);
            downsampled.append(data[index]);
        }
        
        data = downsampled;
    }
};
```

### 渲染优化

```cpp
// 视窗剪裁优化
QVector<QPointF> getVisiblePoints(const QRectF &viewport) const {
    QVector<QPointF> visiblePoints;
    
    for (const auto &point : m_data) {
        // 只返回视窗范围内的点
        if (point.x() >= viewport.left() && point.x() <= viewport.right()) {
            visiblePoints.append(point);
        }
    }
    
    return visiblePoints;
}

// 更新频率控制
void throttledUpdate() {
    static QElapsedTimer lastUpdate;
    static const int MIN_UPDATE_INTERVAL = 50; // 50ms = 20Hz
    
    if (lastUpdate.elapsed() < MIN_UPDATE_INTERVAL) {
        return;
    }
    
    updateData();
    lastUpdate.restart();
}
```

## 交互功能

### 缩放和平移

```cpp
// 图表缩放
void zoomIn(const QPointF &center, double factor = 1.5) {
    double xRange = m_maxX - m_minX;
    double yRange = m_maxY - m_minY;
    
    double newXRange = xRange / factor;
    double newYRange = yRange / factor;
    
    m_minX = center.x() - newXRange / 2;
    m_maxX = center.x() + newXRange / 2;
    m_minY = center.y() - newYRange / 2;
    m_maxY = center.y() + newYRange / 2;
    
    emit rangeChanged();
}

// 图表平移
void pan(double deltaX, double deltaY) {
    m_minX += deltaX;
    m_maxX += deltaX;
    m_minY += deltaY;
    m_maxY += deltaY;
    
    emit rangeChanged();
}
```

### 数据点查询

```cpp
// 查找最近的数据点
QPointF findNearestPoint(const QPointF &target) const {
    if (m_data.isEmpty()) return QPointF();
    
    QPointF nearest = m_data.first();
    double minDistance = std::numeric_limits<double>::max();
    
    for (const auto &point : m_data) {
        double distance = std::sqrt(std::pow(point.x() - target.x(), 2) +
                                  std::pow(point.y() - target.y(), 2));
        if (distance < minDistance) {
            minDistance = distance;
            nearest = point;
        }
    }
    
    return nearest;
}
```

## 数据导出

### CSV导出

```cpp
// 导出数据为CSV格式
void exportToCSV(const QString &filename) const {
    QFile file(filename);
    if (!file.open(QIODevice::WriteOnly | QIODevice::Text)) {
        return;
    }
    
    QTextStream out(&file);
    
    // 写入表头
    out << "Timestamp,Value\n";
    
    // 写入数据点
    for (const auto &point : m_data) {
        QDateTime dateTime = QDateTime::fromMSecsSinceEpoch(point.x() * 1000);
        out << dateTime.toString(Qt::ISODate) << "," << point.y() << "\n";
    }
}
```

## 数据集配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `title` | string | 必需 | 数据集标题 |
| `units` | string | "" | 数据单位（Y轴标签） |
| `graph` | bool | true | 必须设置为true |
| `index` | int | 必需 | 数据帧索引 |
| `color` | string | 自动分配 | 曲线颜色（可选） |
| `lineWidth` | int | 2 | 线条宽度（可选） |

## 使用注意事项

1. **数据连续性**：确保数据更新的连续性和时间同步
2. **性能考虑**：大数据量时启用数据点限制和降采样
3. **范围自适应**：合理设置自动缩放范围避免显示异常
4. **时间轴格式**：根据时间跨度选择合适的时间显示格式
5. **数据过滤**：对噪声数据进行适当的滤波处理
6. **交互体验**：提供缩放、平移等交互功能增强用户体验

## 错误处理

### 常见错误
- 数据更新频率过高导致界面卡顿
- 非数值数据导致绘制异常
- 时间轴显示格式混乱

### 调试建议
- 检查数据值的有效性和连续性
- 监控数据更新频率和性能指标
- 验证坐标轴范围计算的正确性

## 示例项目配置

### 温度监控

```json
{
    "title": "Temperature Monitor",
    "datasets": [
        {
            "title": "Room Temperature",
            "units": "°C",
            "graph": true,
            "index": 1,
            "color": "#FF6B6B",
            "min": 15,
            "max": 35
        }
    ]
}
```

### 电压监测

```json
{
    "title": "Power Supply Voltage",
    "datasets": [
        {
            "title": "3.3V Rail",
            "units": "V",
            "graph": true,
            "index": 2,
            "color": "#4ECDC4",
            "min": 3.0,
            "max": 3.6
        }
    ]
}
```

### 传感器数据

```json
{
    "title": "Pressure Sensor",
    "datasets": [
        {
            "title": "Atmospheric Pressure",
            "units": "hPa",
            "graph": true,
            "index": 3,
            "color": "#45B7D1",
            "precision": 2
        }
    ]
}
```