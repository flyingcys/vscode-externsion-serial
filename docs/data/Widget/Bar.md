# 条形图组件 (Bar)

## 概述

条形图组件用于以水平或垂直条形的方式显示单个数值，支持最小值、最大值和报警值设置。适用于电池电量、信号强度、进度指示、液位显示等场景。

## 数据格式要求

### 数据集配置结构

```json
{
    "title": "Battery Level",
    "units": "%", 
    "widget": "bar",
    "min": 0,
    "max": 100,
    "alarm": 20,
    "index": 1,
    "graph": false
}
```

### 核心属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `value` | double | 0.0 | 当前数值 |
| `minValue` | double | 0.0 | 最小值（条形起始值） |
| `maxValue` | double | 100.0 | 最大值（条形结束值） |
| `alarmValue` | double | 0.0 | 报警值（超过此值显示告警色） |
| `fractionalValue` | double | 自动计算 | 标准化值（0-1之间） |
| `alarmFractionalValue` | double | 自动计算 | 报警值的标准化值 |
| `units` | string | "" | 单位字符串 |

## 数据集要求

条形图组件需要单个数据集，必须设置以下属性：

- **`widget`**：必须设置为 `"bar"`
- **`min`**：条形图的最小值
- **`max`**：条形图的最大值
- **`alarm`**：报警阈值（可选）

## 计算属性详解

### 标准化值计算

```cpp
// fractionalValue 计算公式
fractionalValue = (value - minValue) / (maxValue - minValue)

// alarmFractionalValue 计算公式  
alarmFractionalValue = (alarmValue - minValue) / (maxValue - minValue)
```

### 数值范围限制

```cpp
// 确保数值在有效范围内
value = qBound(minValue, currentValue, maxValue);
```

## 测试数据示例

### 电池电量监测

```bash
# 满电状态
$100;      // 电池电量100%

# 正常使用
$75;       // 电池电量75%
$50;       // 电池电量50%
$25;       // 电池电量25%

# 低电量警告
$15;       // 电池电量15%（低于报警值20%）
$5;        // 电池电量5%（严重低电量）
```

### 信号强度指示

```bash
# 信号强度范围：-100dBm 到 -30dBm
$-40;      // 强信号 -40dBm
$-60;      // 中信号 -60dBm  
$-80;      // 弱信号 -80dBm
$-95;      // 很弱信号 -95dBm（报警）
```

### 温度监控

```bash
# 温度范围：0°C 到 100°C，报警值：80°C
$25;       // 正常温度 25°C
$45;       // 稍高温度 45°C
$75;       // 高温度 75°C
$85;       // 超过报警值 85°C
```

### 液位监测

```bash
# 液位范围：0% 到 100%，报警值：10%
$90;       // 液位充足 90%
$50;       // 液位中等 50%
$25;       // 液位较低 25%
$8;        // 液位过低 8%（报警）
```

## 显示配置

### 方向设置

```json
{
    "orientation": "horizontal", // "horizontal" 或 "vertical"
    "fillDirection": "left",     // "left", "right", "up", "down"
    "showValue": true,           // 是否显示数值
    "showUnits": true            // 是否显示单位
}
```

### 颜色配置

```json
{
    "normalColor": "#4CAF50",    // 正常状态颜色（绿色）
    "warningColor": "#FF9800",   // 警告状态颜色（橙色）  
    "alarmColor": "#F44336",     // 报警状态颜色（红色）
    "backgroundColor": "#E0E0E0" // 背景颜色（灰色）
}
```

### 刻度配置

```json
{
    "showScale": true,           // 显示刻度
    "majorTicks": 5,             // 主刻度数量
    "minorTicks": 10,            // 次刻度数量
    "scalePosition": "bottom"    // 刻度位置
}
```

## 报警功能

### 报警触发条件

```cpp
// 报警判断逻辑
bool isAlarm() const {
    if (alarmValue > 0) {
        return value >= alarmValue;  // 高值报警
    } else if (alarmValue < 0) {
        return value <= alarmValue;  // 低值报警
    }
    return false;
}
```

### 报警视觉效果

- **颜色变化**：条形图变为报警颜色
- **闪烁效果**：可选的闪烁提醒
- **边框高亮**：报警状态边框加粗

## 动画效果

### 数值变化动画

```cpp
// 平滑数值过渡
QPropertyAnimation *animation = new QPropertyAnimation(this, "value");
animation->setDuration(300);
animation->setStartValue(oldValue);
animation->setEndValue(newValue);
animation->setEasingCurve(QEasingCurve::OutCubic);
animation->start();
```

### 填充动画

```cpp
// 条形填充动画
QPropertyAnimation *fillAnimation = new QPropertyAnimation(this, "fillLevel");
fillAnimation->setDuration(500);
fillAnimation->setStartValue(0.0);
fillAnimation->setEndValue(fractionalValue);
```

## 性能优化

### 更新频率控制

```cpp
// 避免过于频繁的更新
static QElapsedTimer updateTimer;
if (updateTimer.elapsed() < 50) return;  // 最大20Hz更新
updateTimer.restart();
```

### 重绘优化

```cpp
// 只在数值变化时重绘
void setValue(double newValue) {
    if (qAbs(m_value - newValue) < 0.01) return;
    m_value = newValue;
    update();
    emit updated();
}
```

## 数据集配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `title` | string | 必需 | 条形图标题 |
| `units` | string | "" | 数据单位 |
| `widget` | string | "bar" | 必须设置为"bar" |
| `min` | double | 0 | 最小值 |
| `max` | double | 100 | 最大值 |
| `alarm` | double | 0 | 报警值（可选） |
| `index` | int | 必需 | 数据帧索引 |
| `graph` | bool | false | 建议设置为false |

## 应用场景

### 系统监控

```json
{
    "title": "CPU Usage",
    "units": "%",
    "widget": "bar",
    "min": 0,
    "max": 100,
    "alarm": 90,
    "index": 1,
    "graph": false
}
```

### 传感器监测

```json
{
    "title": "Soil Moisture",
    "units": "%",
    "widget": "bar", 
    "min": 0,
    "max": 100,
    "alarm": 15,        // 低湿度报警
    "index": 2,
    "graph": false
}
```

### 设备状态

```json
{
    "title": "Fuel Level",
    "units": "L",
    "widget": "bar",
    "min": 0,
    "max": 60,
    "alarm": 5,         // 低油量报警
    "index": 3,
    "graph": false
}
```

## 使用注意事项

1. **数值范围**：确保min < max，并且数据值在此范围内
2. **报警设置**：合理设置报警值，避免误报或漏报
3. **单位一致性**：保持数据值与单位的一致性
4. **更新频率**：避免过高的更新频率影响视觉效果
5. **颜色选择**：使用直观的颜色（绿色=正常，红色=报警）
6. **可访问性**：考虑色盲用户，提供文字或形状辅助

## 错误处理

### 常见错误
- min值大于或等于max值
- 数据值超出min-max范围
- 报警值设置在min-max范围外

### 调试建议
- 检查数值范围设置是否合理
- 验证数据值是否在预期范围内
- 监控数值变化趋势

## 示例项目配置

### 电池监控系统

```json
{
    "title": "Battery Monitor",
    "datasets": [
        {
            "title": "Main Battery",
            "units": "%",
            "widget": "bar",
            "min": 0,
            "max": 100,
            "alarm": 20,
            "index": 1,
            "graph": false
        },
        {
            "title": "Backup Battery", 
            "units": "%",
            "widget": "bar",
            "min": 0,
            "max": 100,
            "alarm": 15,
            "index": 2,
            "graph": false
        }
    ]
}
```

### 环境监测

```json
{
    "title": "Environmental Monitor",
    "datasets": [
        {
            "title": "Temperature",
            "units": "°C",
            "widget": "bar",
            "min": -10,
            "max": 50,
            "alarm": 40,
            "index": 1,
            "graph": false
        },
        {
            "title": "Humidity",
            "units": "%RH", 
            "widget": "bar",
            "min": 0,
            "max": 100,
            "alarm": 80,
            "index": 2,
            "graph": false
        }
    ]
}
```