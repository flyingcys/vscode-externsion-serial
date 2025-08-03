# 仪表盘组件 (Gauge)

## 概述

仪表盘组件用于以圆形仪表的方式显示单个数值，提供直观的模拟仪表显示效果。支持最小值、最大值和报警值设置，适用于速度、压力、温度、转速等需要模拟仪表显示的场景。

## 数据格式要求

### 数据集配置结构

```json
{
    "title": "Temperature",
    "units": "℃",
    "widget": "gauge",
    "min": -20,
    "max": 100,
    "alarm": 80,
    "index": 1,
    "graph": false
}
```

### 核心属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `value` | double | 0.0 | 当前数值 |
| `minValue` | double | 0.0 | 最小值（仪表起始刻度） |
| `maxValue` | double | 100.0 | 最大值（仪表结束刻度） |
| `alarmValue` | double | 0.0 | 报警值（超过此值显示告警色） |
| `units` | string | "" | 单位字符串 |

## 数据集要求

仪表盘组件需要单个数据集，必须设置以下属性：

- **`widget`**：必须设置为 `"gauge"`
- **`min`**：仪表盘的最小值（刻度起点）
- **`max`**：仪表盘的最大值（刻度终点）
- **`alarm`**：报警阈值（可选）

## 仪表显示特性

### 角度范围

```cpp
// 标准仪表盘角度范围
static const double START_ANGLE = 225.0;   // 起始角度（左下）
static const double END_ANGLE = -45.0;     // 结束角度（右下）
static const double TOTAL_ANGLE = 270.0;   // 总角度范围

// 指针角度计算
double needleAngle = START_ANGLE + (value - minValue) / 
                    (maxValue - minValue) * TOTAL_ANGLE;
```

### 刻度设计

```cpp
// 主刻度数量（通常5-10个）
int majorTicks = 10;
double majorTickInterval = (maxValue - minValue) / majorTicks;

// 次刻度数量（主刻度间的细分）
int minorTicksPerMajor = 5;
```

## 测试数据示例

### 温度监测

```bash
# 温度范围：-20°C 到 100°C，报警值：80°C
$25.6;     // 室温25.6°C
$45.8;     // 稍高温度45.8°C
$75.2;     // 高温度75.2°C
$85.4;     // 超过报警值85.4°C
$-5.3;     // 低温-5.3°C
```

### 压力监测

```bash
# 压力范围：0 到 10 bar，报警值：8.5 bar
$2.5;      // 正常压力2.5 bar
$5.8;      // 中等压力5.8 bar
$7.9;      // 较高压力7.9 bar
$9.2;      // 超过报警值9.2 bar
```

### 转速监测

```bash
# 转速范围：0 到 8000 RPM，报警值：7000 RPM
$1500;     // 怠速转速1500 RPM
$3000;     // 正常转速3000 RPM
$5500;     // 高转速5500 RPM
$7500;     // 超过报警值7500 RPM
```

### 速度监测

```bash
# 速度范围：0 到 120 km/h，报警值：100 km/h
$35;       // 市区速度35 km/h
$80;       // 高速公路速度80 km/h
$95;       // 接近限速95 km/h
$110;      // 超速110 km/h（报警）
```

## 视觉设计

### 仪表盘结构

```cpp
// 仪表盘组成部分
struct GaugeComponents {
    QRectF faceRect;        // 仪表盘面
    QRectF scaleRect;       // 刻度区域
    QPointF center;         // 中心点
    double radius;          // 半径
    QPolygonF needle;       // 指针
    QRectF hubRect;         // 中心轴
};
```

### 颜色配置

```json
{
    "faceColor": "#F5F5F5",      // 表盘背景色
    "needleColor": "#D32F2F",    // 指针颜色（红色）
    "scaleColor": "#424242",     // 刻度颜色（深灰）
    "textColor": "#212121",      // 文字颜色（黑色）
    "alarmColor": "#FF5722",     // 报警区域颜色（橙红色）
    "hubColor": "#616161"        // 中心轴颜色（灰色）
}
```

### 渐变效果

```cpp
// 表盘背景渐变
QRadialGradient faceGradient(center, radius);
faceGradient.setColorAt(0.0, QColor(255, 255, 255));
faceGradient.setColorAt(1.0, QColor(240, 240, 240));

// 指针渐变效果
QLinearGradient needleGradient;
needleGradient.setColorAt(0.0, QColor(211, 47, 47));
needleGradient.setColorAt(1.0, QColor(183, 28, 28));
```

## 动画效果

### 指针动画

```cpp
// 指针平滑转动
QPropertyAnimation *needleAnimation = new QPropertyAnimation(this, "needleAngle");
needleAnimation->setDuration(800);
needleAnimation->setStartValue(currentAngle);
needleAnimation->setEndValue(targetAngle);
needleAnimation->setEasingCurve(QEasingCurve::OutElastic);
needleAnimation->start();
```

### 数值变化动画

```cpp
// 数字显示动画
QPropertyAnimation *valueAnimation = new QPropertyAnimation(this, "displayValue");
valueAnimation->setDuration(500);
valueAnimation->setStartValue(oldValue);  
valueAnimation->setEndValue(newValue);
valueAnimation->setEasingCurve(QEasingCurve::OutCubic);
```

## 刻度系统

### 主刻度设计

```cpp
// 主刻度绘制
void drawMajorTicks(QPainter &painter) {
    for (int i = 0; i <= majorTicks; ++i) {
        double value = minValue + i * majorTickInterval;
        double angle = valueToAngle(value);
        
        // 刻度线
        QPointF tickStart = calculateTickPoint(angle, innerRadius);
        QPointF tickEnd = calculateTickPoint(angle, outerRadius);
        painter.drawLine(tickStart, tickEnd);
        
        // 数值标签
        QString label = QString::number(value, 'f', 1);
        QPointF labelPos = calculateLabelPoint(angle, labelRadius);
        painter.drawText(labelPos, label);
    }
}
```

### 次刻度设计

```cpp
// 次刻度绘制（较短、较细）
void drawMinorTicks(QPainter &painter) {
    double minorTickInterval = majorTickInterval / minorTicksPerMajor;
    
    for (double value = minValue; value <= maxValue; value += minorTickInterval) {
        if (isOnMajorTick(value)) continue;  // 跳过主刻度位置
        
        double angle = valueToAngle(value);
        QPointF tickStart = calculateTickPoint(angle, minorInnerRadius);
        QPointF tickEnd = calculateTickPoint(angle, minorOuterRadius);
        
        QPen minorPen(Qt::gray, 1);
        painter.setPen(minorPen);
        painter.drawLine(tickStart, tickEnd);
    }
}
```

## 报警区域

### 报警扇形区域

```cpp
// 绘制报警区域扇形
void drawAlarmZone(QPainter &painter) {
    if (alarmValue <= minValue || alarmValue >= maxValue) return;
    
    double alarmAngle = valueToAngle(alarmValue);
    double spanAngle = END_ANGLE - alarmAngle;
    
    QPainterPath alarmPath;
    alarmPath.arcTo(faceRect, alarmAngle, spanAngle);
    
    QBrush alarmBrush(QColor(255, 87, 34, 100));  // 半透明橙红色
    painter.fillPath(alarmPath, alarmBrush);
}
```

### 报警指示

```cpp
// 报警状态检查
bool isInAlarmState() const {
    return (alarmValue > 0 && value >= alarmValue) ||
           (alarmValue < 0 && value <= alarmValue);
}

// 报警视觉效果
if (isInAlarmState()) {
    // 指针颜色变红
    needleColor = QColor(244, 67, 54);
    // 数值显示闪烁
    startBlinkingEffect();
}
```

## 性能优化

### 缓存绘制

```cpp
// 静态元素缓存
static QPixmap cachedFace;
static QPixmap cachedScale;

if (cachedFace.isNull() || sizeChanged) {
    cachedFace = QPixmap(size());
    QPainter facePainter(&cachedFace);
    drawFace(facePainter);
    drawScale(facePainter);
}
```

### 重绘优化

```cpp
// 只在数值变化时重绘指针
void updateValue(double newValue) {
    if (qAbs(m_value - newValue) < 0.01) return;
    
    double oldAngle = valueToAngle(m_value);
    m_value = newValue;
    double newAngle = valueToAngle(m_value);
    
    // 只更新指针区域
    QRectF needleRect = calculateNeedleRect(oldAngle, newAngle);
    update(needleRect.toRect());
}
```

## 数据集配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `title` | string | 必需 | 仪表盘标题 |
| `units` | string | "" | 数据单位 |
| `widget` | string | "gauge" | 必须设置为"gauge" |
| `min` | double | 0 | 最小值（刻度起点） |
| `max` | double | 100 | 最大值（刻度终点） |
| `alarm` | double | 0 | 报警值（可选） |
| `index` | int | 必需 | 数据帧索引 |
| `graph` | bool | false | 建议设置为false |

## 应用场景

### 汽车仪表

```json
{
    "title": "Engine RPM",
    "units": "RPM",
    "widget": "gauge",
    "min": 0,
    "max": 8000,
    "alarm": 7000,
    "index": 1,
    "graph": false
}
```

### 工业监测

```json
{
    "title": "Boiler Pressure",
    "units": "bar",
    "widget": "gauge",
    "min": 0,
    "max": 15,
    "alarm": 12,
    "index": 2,
    "graph": false
}
```

### 环境监控

```json
{
    "title": "Wind Speed",
    "units": "km/h",
    "widget": "gauge",
    "min": 0,
    "max": 150,
    "alarm": 100,
    "index": 3,
    "graph": false
}
```

## 使用注意事项

1. **刻度范围**：确保min < max，并选择合适的刻度间隔
2. **单位显示**：在仪表盘上清晰显示单位信息
3. **报警设置**：合理设置报警值和报警区域
4. **动画效果**：避免过于频繁的指针抖动
5. **可读性**：确保数值和刻度在各种尺寸下都清晰可读
6. **颜色对比**：保证足够的对比度便于观察

## 错误处理

### 常见错误
- 最小值大于或等于最大值
- 数据值远超刻度范围
- 报警值设置在刻度范围外

### 调试建议
- 检查刻度范围设置是否合理
- 验证数据值是否在预期范围内
- 测试报警功能的触发条件

## 示例项目配置

### 多参数监控仪表盘

```json
{
    "title": "Vehicle Dashboard",
    "datasets": [
        {
            "title": "Speed",
            "units": "km/h",
            "widget": "gauge",
            "min": 0,
            "max": 200,
            "alarm": 120,
            "index": 1,
            "graph": false
        },
        {
            "title": "Engine Temp",
            "units": "°C",
            "widget": "gauge", 
            "min": 40,
            "max": 120,
            "alarm": 100,
            "index": 2,
            "graph": false
        },
        {
            "title": "Fuel Level",
            "units": "%",
            "widget": "gauge",
            "min": 0,
            "max": 100,
            "alarm": 15,
            "index": 3,
            "graph": false
        }
    ]
}
```