# 指南针组件 (Compass)

## 概述

指南针组件用于显示方向角度，提供直观的磁方位角指示。支持360度角度显示和方向文本指示，适用于导航、无人机航向、机器人方向等需要方向指示的应用场景。

## 数据格式要求

### 数据集配置结构

```json
{
    "title": "Heading",
    "units": "°",
    "widget": "compass", 
    "index": 1,
    "graph": false
}
```

### 核心属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `value` | double | 0.0 | 角度值（0-360度） |
| `text` | string | "N" | 方向文本（如"北"、"东北"） |

## 数据集要求

指南针组件需要单个数据集，必须设置以下属性：

- **`widget`**：必须设置为 `"compass"`
- **`index`**：数据帧中的索引位置
- **`units`**：建议设置为 `"°"`

## 角度系统

### 标准方位角定义

```cpp
// 标准指南针方位角系统
// 0° = 北 (North)
// 90° = 东 (East)  
// 180° = 南 (South)
// 270° = 西 (West)

double normalizeAngle(double angle) {
    while (angle < 0) angle += 360.0;
    while (angle >= 360.0) angle -= 360.0;
    return angle;
}
```

### 方向文本映射

```cpp
// 16方位方向文本
QString getDirectionText(double angle) {
    static const QStringList directions = {
        "N",   "NNE", "NE",  "ENE",
        "E",   "ESE", "SE",  "SSE", 
        "S",   "SSW", "SW",  "WSW",
        "W",   "WNW", "NW",  "NNW"
    };
    
    int index = qRound(angle / 22.5) % 16;
    return directions[index];
}
```

### 中文方向文本

```cpp
// 中文方向文本映射
QString getChineseDirectionText(double angle) {
    static const QStringList chineseDirections = {
        "北",     "北北东", "东北",   "东北东",
        "东",     "东南东", "东南",   "南南东",
        "南",     "南南西", "西南",   "西南西", 
        "西",     "西北西", "西北",   "北北西"
    };
    
    int index = qRound(angle / 22.5) % 16;
    return chineseDirections[index];
}
```

## 测试数据示例

### 基本方向测试

```bash
# 四个基本方向
$0.0;      // 正北 (N)
$90.0;     // 正东 (E)
$180.0;    // 正南 (S)
$270.0;    // 正西 (W)
```

### 八方向测试

```bash
# 八个主要方向
$0.0;      // 北 (N)
$45.0;     // 东北 (NE)
$90.0;     // 东 (E)
$135.0;    // 东南 (SE)
$180.0;    // 南 (S)
$225.0;    // 西南 (SW)
$270.0;    // 西 (W)
$315.0;    // 西北 (NW)
```

### 十六方向精确测试

```bash
# 16方向精确角度
$0.0;      // N (北)
$22.5;     // NNE (北北东)
$45.0;     // NE (东北)
$67.5;     // ENE (东北东)
$90.0;     // E (东)
$112.5;    // ESE (东南东)
$135.0;    // SE (东南)
$157.5;    // SSE (南南东)
$180.0;    // S (南)
$202.5;    // SSW (南南西)
$225.0;    // SW (西南)
$247.5;    // WSW (西南西)
$270.0;    // W (西)
$292.5;    // WNW (西北西)
$315.0;    // NW (西北)
$337.5;    // NNW (北北西)
```

### 动态转向测试

```bash
# 顺时针旋转
$0.0;
$30.0;
$60.0;
$90.0;
$120.0;
$150.0;
$180.0;

# 跨越0度边界测试
$350.0;
$355.0;
$0.0;
$5.0;
$10.0;
```

### 随机角度测试

```bash
# 随机角度值
$37.5;     // 介于NE和ENE之间
$128.3;    // 介于SE和ESE之间  
$203.7;    // 介于SSW和S之间
$299.1;    // 介于WNW和W之间
```

## 视觉设计

### 指南针结构

```cpp
// 指南针组成部分
struct CompassComponents {
    QPointF center;         // 圆心
    double radius;          // 半径
    QPolygonF needle;       // 指针（北针）
    QPolygonF southNeedle; // 南针（不同颜色）
    QRectF dialRect;       // 刻度盘
    QFont textFont;        // 文字字体
};
```

### 刻度设计

```cpp
// 主刻度（每30度）
void drawMajorTicks(QPainter &painter) {
    for (int angle = 0; angle < 360; angle += 30) {
        double radians = qDegreesToRadians(angle - 90); // -90调整到北方为0度
        QPointF outer = center + QPointF(cos(radians) * outerRadius,
                                        sin(radians) * outerRadius);
        QPointF inner = center + QPointF(cos(radians) * innerRadius,
                                        sin(radians) * innerRadius);
        painter.drawLine(inner, outer);
    }
}

// 次刻度（每10度）  
void drawMinorTicks(QPainter &painter) {
    for (int angle = 0; angle < 360; angle += 10) {
        if (angle % 30 == 0) continue; // 跳过主刻度
        
        double radians = qDegreesToRadians(angle - 90);
        QPointF outer = center + QPointF(cos(radians) * minorOuterRadius,
                                        sin(radians) * minorOuterRadius);
        QPointF inner = center + QPointF(cos(radians) * minorInnerRadius,
                                        sin(radians) * minorInnerRadius);
        painter.drawLine(inner, outer);
    }
}
```

### 方向标签

```cpp
// 绘制方向标签 (N, E, S, W)
void drawDirectionLabels(QPainter &painter) {
    static const QStringList labels = {"N", "E", "S", "W"};
    static const QList<int> angles = {0, 90, 180, 270};
    
    for (int i = 0; i < 4; ++i) {
        double radians = qDegreesToRadians(angles[i] - 90);
        QPointF labelPos = center + QPointF(cos(radians) * labelRadius,
                                          sin(radians) * labelRadius);
        
        painter.setPen(QPen(Qt::black, 2));
        painter.setFont(QFont("Arial", 14, QFont::Bold));
        painter.drawText(labelPos, labels[i]);
    }
}
```

## 指针动画

### 平滑旋转动画

```cpp
// 指针旋转动画，处理跨0度边界
void animateToAngle(double newAngle) {
    double currentAngle = m_value;
    double targetAngle = newAngle;
    
    // 处理跨0度边界的情况
    double diff = targetAngle - currentAngle;
    if (diff > 180) {
        currentAngle += 360;
    } else if (diff < -180) {
        targetAngle += 360;
    }
    
    QPropertyAnimation *animation = new QPropertyAnimation(this, "value");
    animation->setDuration(800);
    animation->setStartValue(currentAngle);
    animation->setEndValue(targetAngle);
    animation->setEasingCurve(QEasingCurve::OutBack);
    animation->start();
}
```

### 磁偏角补偿

```cpp
// 磁偏角补偿（磁北与真北之间的差异）
class CompassCalibration {
public:
    void setMagneticDeclination(double declination) {
        m_declination = declination;
    }
    
    double getTrueHeading(double magneticHeading) {
        return normalizeAngle(magneticHeading + m_declination);
    }
    
private:
    double m_declination = 0.0; // 磁偏角（度）
};
```

## 精度和校准

### 角度精度

```cpp
// 角度精度设置
static const double ANGLE_PRECISION = 0.1;  // 0.1度精度

bool isAngleChanged(double oldAngle, double newAngle) {
    return qAbs(oldAngle - newAngle) > ANGLE_PRECISION;
}
```

### 校准功能

```json
{
    "calibration": {
        "magneticDeclination": 2.5,    // 当地磁偏角
        "offsetCorrection": 0.0,       // 安装偏移校正
        "smoothingFactor": 0.8         // 平滑系数
    }
}
```

## 数据集配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `title` | string | 必需 | 指南针标题 |
| `units` | string | "°" | 角度单位 |
| `widget` | string | "compass" | 必须设置为"compass" |
| `index` | int | 必需 | 数据帧索引 |
| `graph` | bool | false | 建议设置为false |
| `min` | double | 0 | 最小角度（可选） |
| `max` | double | 360 | 最大角度（可选） |

## 应用场景

### 无人机导航

```json
{
    "title": "UAV Heading",
    "units": "°",
    "widget": "compass",
    "index": 1,
    "graph": false,
    "magneticDeclination": 1.2
}
```

### 船舶导航

```json
{
    "title": "Ship Compass", 
    "units": "°",
    "widget": "compass",
    "index": 2,
    "graph": false,
    "showTrueHeading": true
}
```

### 机器人方向

```json
{
    "title": "Robot Orientation",
    "units": "°", 
    "widget": "compass",
    "index": 3,
    "graph": false,
    "precision": 1.0
}
```

## 使用注意事项

1. **角度范围**：确保角度值在0-360度范围内
2. **边界处理**：正确处理359度到0度的跳变
3. **磁偏角**：根据地理位置设置正确的磁偏角
4. **动画平滑**：避免指针在相近角度间抖动
5. **精度显示**：根据应用精度需求设置合适的显示精度
6. **标签可读性**：确保方向标签在各种尺寸下清晰可读

## 错误处理

### 常见错误
- 角度值超出0-360度范围
- 跨0度边界时的跳跃显示
- 磁偏角设置错误

### 调试建议
- 检查角度数据的有效性
- 验证跨0度边界的处理逻辑
- 测试动画效果的平滑性

## 示例项目配置

### 导航系统

```json
{
    "title": "Navigation Compass",
    "datasets": [
        {
            "title": "Magnetic Heading",
            "units": "°",
            "widget": "compass",
            "index": 1,
            "graph": false
        },
        {
            "title": "GPS Course", 
            "units": "°",
            "widget": "compass",
            "index": 2,
            "graph": false
        }
    ]
}
```

### 多轴方向监控

```json
{
    "title": "Multi-Axis Orientation",
    "datasets": [
        {
            "title": "Yaw (Heading)",
            "units": "°",
            "widget": "compass", 
            "index": 1,
            "graph": false
        },
        {
            "title": "Wind Direction",
            "units": "°",
            "widget": "compass",
            "index": 4,
            "graph": false
        }
    ]
}
```