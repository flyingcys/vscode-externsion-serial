# 多线图组件 (MultiPlot)

## 概述

多线图组件可以在同一图表中显示多条数据曲线，支持实时数据更新、曲线可见性控制、自动缩放等功能。适用于多传感器对比、相关数据分析、系统状态监控等需要同时观察多个数据源的场景。

## 数据格式要求

### 组配置结构

```json
{
    "title": "Multi Sensor Data",
    "widget": "multiplot",
    "datasets": [
        {
            "title": "Sensor 1",
            "units": "V",
            "graph": true,
            "index": 1
        },
        {
            "title": "Sensor 2", 
            "units": "V",
            "graph": true,
            "index": 2
        },
        {
            "title": "Sensor 3",
            "units": "V", 
            "graph": true,
            "index": 3
        }
    ]
}
```

### 核心属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `count` | int | 自动计算 | 曲线数量 |
| `yLabel` | string | 自动生成 | Y轴标签（单位） |
| `labels` | QStringList | 自动生成 | 曲线标签列表 |
| `minX/maxX` | double | 自动计算 | X轴范围 |
| `minY/maxY` | double | 自动计算 | Y轴范围 |
| `colors` | QStringList | 自动生成 | 曲线颜色列表 |
| `visibleCurves` | QList<bool> | 全部可见 | 曲线可见性控制 |

## 数据集要求

多线图组件需要多个数据集，每个数据集对应一条曲线：

- **`graph`**：必须设置为 `true`
- **`index`**：数据帧中的索引位置
- **`title`**：曲线标签名称
- **`units`**：建议所有数据集使用相同单位

## 曲线管理

### 曲线颜色分配

```cpp
// 自动生成曲线颜色
QStringList generateCurveColors(int count) {
    static const QStringList baseColors = {
        "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728",
        "#9467bd", "#8c564b", "#e377c2", "#7f7f7f",
        "#bcbd22", "#17becf", "#aec7e8", "#ffbb78"
    };
    
    QStringList colors;
    for (int i = 0; i < count; ++i) {
        colors << baseColors[i % baseColors.size()];
    }
    return colors;
}
```

### 曲线可见性控制

```cpp
// 控制曲线显示/隐藏
void modifyCurveVisibility(const int index, const bool visible) {
    if (index < 0 || index >= m_visibleCurves.size()) return;
    
    if (m_visibleCurves[index] != visible) {
        m_visibleCurves[index] = visible;
        emit curvesChanged();
        
        // 触发图表重绘
        updateRange();
        emit rangeChanged();
    }
}

// 获取可见曲线数量
int getVisibleCurveCount() const {
    return std::count(m_visibleCurves.begin(), m_visibleCurves.end(), true);
}
```

### 曲线标签管理

```cpp
// 生成曲线标签
QStringList generateCurveLabels() const {
    QStringList labels;
    const auto &frame = JSON::FrameBuilder::instance().frame();
    
    for (const auto &group : frame.groups()) {
        if (group.groupId() != m_index) continue;
        
        for (const auto &dataset : group.datasets()) {
            if (dataset.graph()) {
                labels << dataset.title();
            }
        }
    }
    
    return labels;
}
```

## 测试数据示例

### 三传感器对比

```bash
# 三个传感器的实时数据
$3.2,4.1,2.8;    // 传感器1=3.2V, 传感器2=4.1V, 传感器3=2.8V
$3.3,4.0,2.9;    // 传感器1=3.3V, 传感器2=4.0V, 传感器3=2.9V
$3.1,4.2,2.7;    // 传感器1=3.1V, 传感器2=4.2V, 传感器3=2.7V
```

### 温度监测对比

```bash
# 多点温度监测
$25.6,23.8,27.1;  // 室内=25.6°C, 室外=23.8°C, 机房=27.1°C
$25.8,24.1,27.3;  // 室内=25.8°C, 室外=24.1°C, 机房=27.3°C
$26.0,24.5,27.0;  // 室内=26.0°C, 室外=24.5°C, 机房=27.0°C
```

### 系统性能监控

```bash
# CPU, 内存, 磁盘使用率
$45.2,68.5,23.1;  // CPU=45.2%, Memory=68.5%, Disk=23.1%
$47.8,69.2,23.3;  // CPU=47.8%, Memory=69.2%, Disk=23.3%
$44.1,67.8,22.9;  // CPU=44.1%, Memory=67.8%, Disk=22.9%
```

### 波形对比分析

```python
# Python生成多波形测试数据
import numpy as np
import math

fs = 100  # 采样频率
t = np.linspace(0, 2, fs * 2)

# 三个不同频率的正弦波
f1, f2, f3 = 1, 2, 3  # 1Hz, 2Hz, 3Hz
signal1 = np.sin(2 * np.pi * f1 * t)
signal2 = np.sin(2 * np.pi * f2 * t) * 0.8
signal3 = np.sin(2 * np.pi * f3 * t) * 0.6

for i in range(len(t)):
    print(f"${signal1[i]:.3f},{signal2[i]:.3f},{signal3[i]:.3f};")
```

## 图表绘制

### 多曲线绘制

```cpp
// 绘制指定曲线
void draw(QXYSeries *series, const int index) {
    if (index < 0 || index >= m_data.size()) return;
    if (!m_visibleCurves[index]) return;  // 跳过隐藏曲线
    
    const auto &curveData = m_data[index];
    
    // 清空现有数据
    series->clear();
    
    // 添加数据点
    for (const auto &point : curveData) {
        series->append(point);
    }
}

// 绘制所有可见曲线
void drawAllCurves(QList<QXYSeries*> seriesList) {
    for (int i = 0; i < seriesList.size() && i < m_data.size(); ++i) {
        if (m_visibleCurves[i]) {
            draw(seriesList[i], i);
        }
    }
}
```

### 自动范围计算

```cpp
// 计算所有可见曲线的数据范围
void calculateAutoScaleRange() {
    if (m_data.isEmpty()) return;
    
    bool firstPoint = true;
    
    for (int curveIndex = 0; curveIndex < m_data.size(); ++curveIndex) {
        if (!m_visibleCurves[curveIndex]) continue;  // 跳过隐藏曲线
        
        const auto &curveData = m_data[curveIndex];
        for (const auto &point : curveData) {
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
    }
    
    // 添加边距
    double xMargin = (m_maxX - m_minX) * 0.05;
    double yMargin = (m_maxY - m_minY) * 0.05;
    
    m_minX -= xMargin;
    m_maxX += xMargin;
    m_minY -= yMargin;
    m_maxY += yMargin;
}
```

## 数据管理

### 数据存储结构

```cpp
// 多曲线数据存储
class MultiPlotData {
private:
    QVector<QVector<QPointF>> m_data;      // 多条曲线的数据点
    QList<int> m_drawOrders;               // 绘制顺序
    QList<bool> m_visibleCurves;           // 可见性控制
    static const int MAX_POINTS_PER_CURVE = 10000;  // 每条曲线最大点数
    
public:
    void addDataPoint(int curveIndex, const QPointF &point) {
        if (curveIndex >= m_data.size()) {
            m_data.resize(curveIndex + 1);
            m_visibleCurves.resize(curveIndex + 1, true);
        }
        
        auto &curveData = m_data[curveIndex];
        curveData.append(point);
        
        // 限制数据点数量
        if (curveData.size() > MAX_POINTS_PER_CURVE) {
            curveData.removeFirst();
        }
    }
};
```

### 数据更新

```cpp
// 更新多曲线数据
void updateData() {
    const auto &frame = JSON::FrameBuilder::instance().frame();
    double currentTime = QDateTime::currentMSecsSinceEpoch() / 1000.0;
    
    // 清空当前数据（如果需要）
    if (needsClear()) {
        for (auto &curve : m_data) {
            curve.clear();
        }
    }
    
    // 添加新数据点
    int curveIndex = 0;
    for (const auto &group : frame.groups()) {
        if (group.groupId() != m_index) continue;
        
        for (const auto &dataset : group.datasets()) {
            if (!dataset.graph()) continue;
            
            bool ok;
            double value = dataset.value().toDouble(&ok);
            if (ok) {
                QPointF newPoint(currentTime, value);
                addDataPoint(curveIndex, newPoint);
            }
            
            curveIndex++;
        }
    }
    
    // 更新范围和标签
    updateRange();
    updateLabels();
}
```

## 图例和标签

### 动态图例

```cpp
// 生成图例信息
struct LegendInfo {
    QString label;
    QColor color;
    bool visible;
    int curveIndex;
};

QList<LegendInfo> generateLegend() const {
    QList<LegendInfo> legend;
    
    for (int i = 0; i < m_labels.size() && i < m_colors.size(); ++i) {
        LegendInfo info;
        info.label = m_labels[i];
        info.color = QColor(m_colors[i]);
        info.visible = m_visibleCurves[i];
        info.curveIndex = i;
        legend << info;
    }
    
    return legend;
}
```

### Y轴标签生成

```cpp
// 自动生成Y轴标签
QString generateYLabel() const {
    QSet<QString> uniqueUnits;
    const auto &frame = JSON::FrameBuilder::instance().frame();
    
    for (const auto &group : frame.groups()) {
        if (group.groupId() != m_index) continue;
        
        for (const auto &dataset : group.datasets()) {
            if (dataset.graph() && !dataset.units().isEmpty()) {
                uniqueUnits.insert(dataset.units());
            }
        }
    }
    
    if (uniqueUnits.size() == 1) {
        return uniqueUnits.values().first();
    } else if (uniqueUnits.size() > 1) {
        return "Mixed Units";
    }
    
    return "Value";
}
```

## 性能优化

### 数据点限制

```cpp
// 动态调整数据点数量
void optimizeDataPoints() {
    static const int TARGET_POINTS = 5000;  // 目标点数
    
    for (auto &curveData : m_data) {
        if (curveData.size() > TARGET_POINTS) {
            // 使用降采样减少数据点
            auto downsampled = downsample(curveData, TARGET_POINTS);
            curveData = downsampled;
        }
    }
}

// 降采样算法
QVector<QPointF> downsample(const QVector<QPointF> &data, int targetPoints) {
    if (data.size() <= targetPoints) return data;
    
    QVector<QPointF> result;
    double step = double(data.size()) / targetPoints;
    
    for (int i = 0; i < targetPoints; ++i) {
        int index = qRound(i * step);
        if (index < data.size()) {
            result.append(data[index]);
        }
    }
    
    return result;
}
```

### 渲染优化

```cpp
// 只更新变化的曲线
void updateChangedCurves(const QVector<bool> &changedFlags) {
    for (int i = 0; i < changedFlags.size() && i < m_data.size(); ++i) {
        if (changedFlags[i] && m_visibleCurves[i]) {
            // 只重绘变化的曲线
            updateCurve(i);
        }
    }
}
```

## 交互功能

### 曲线选择

```cpp
// 曲线点击选择
void onCurveClicked(int curveIndex) {
    // 高亮选中曲线
    highlightCurve(curveIndex);
    
    // 显示曲线详细信息
    showCurveInfo(curveIndex);
    
    // 发送选择信号
    emit curveSelected(curveIndex);
}

// 曲线高亮显示
void highlightCurve(int curveIndex) {
    for (int i = 0; i < m_colors.size(); ++i) {
        if (i == curveIndex) {
            // 选中曲线加粗显示
            setCurveLineWidth(i, 3);
        } else {
            // 其他曲线半透明
            setCurveOpacity(i, 0.5);
        }
    }
}
```

## 数据集配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `title` | string | 必需 | 曲线标签 |
| `units` | string | "" | 数据单位 |
| `graph` | bool | true | 必须设置为true |
| `index` | int | 必需 | 数据帧索引 |
| `color` | string | 自动分配 | 曲线颜色（可选） |
| `lineWidth` | int | 2 | 线条宽度（可选） |

## 使用注意事项

1. **单位一致性**：所有曲线最好使用相同单位以便比较
2. **曲线数量**：避免同时显示过多曲线影响可读性
3. **颜色选择**：使用足够对比度的颜色区分不同曲线
4. **性能考虑**：大数据量时启用数据点限制和降采样
5. **可见性控制**：提供用户友好的曲线显示/隐藏功能
6. **范围自适应**：根据可见曲线动态调整坐标轴范围

## 错误处理

### 常见错误
- 数据集单位不一致导致比较困难
- 曲线过多导致颜色区分困难
- 数据更新频率不一致导致曲线不同步

### 调试建议
- 检查数据集配置的一致性
- 验证曲线可见性控制功能
- 监控数据更新的同步性

## 示例项目配置

### 传感器对比分析

```json
{
    "title": "Sensor Comparison",
    "widget": "multiplot",
    "datasets": [
        {
            "title": "Temperature Sensor 1",
            "units": "°C",
            "graph": true,
            "index": 1,
            "color": "#FF6B6B"
        },
        {
            "title": "Temperature Sensor 2", 
            "units": "°C",
            "graph": true,
            "index": 2,
            "color": "#4ECDC4"
        },
        {
            "title": "Temperature Sensor 3",
            "units": "°C",
            "graph": true,
            "index": 3,
            "color": "#45B7D1"
        }
    ]
}
```

### 系统性能监控

```json
{
    "title": "System Performance",
    "widget": "multiplot",
    "datasets": [
        {
            "title": "CPU Usage",
            "units": "%",
            "graph": true,
            "index": 1
        },
        {
            "title": "Memory Usage",
            "units": "%", 
            "graph": true,
            "index": 2
        },
        {
            "title": "Disk Usage",
            "units": "%",
            "graph": true,
            "index": 3
        }
    ]
}
```