# LED面板组件 (LEDPanel)

## 概述

LED面板组件用于显示多个布尔状态指示器，支持自定义颜色、报警闪烁、标题显示等功能。适用于系统状态监控、设备指示、报警显示等场景。

## 数据格式要求

### 数据集配置结构

```json
{
    "title": "System Status LEDs",
    "datasets": [
        {
            "title": "Power LED",
            "widget": "led",
            "led": true,
            "ledHigh": 1,
            "index": 1,
            "graph": false
        },
        {
            "title": "Network LED",
            "widget": "led", 
            "led": true,
            "ledHigh": 1,
            "index": 2,
            "graph": false
        },
        {
            "title": "Error LED",
            "widget": "led",
            "led": true,
            "ledHigh": 1,
            "index": 3,
            "graph": false
        }
    ]
}
```

### 核心属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `count` | int | - | LED数量（自动计算） |
| `titles` | QStringList | - | LED标题列表 |
| `states` | QList<bool> | - | LED状态列表（开/关） |
| `alarms` | QList<bool> | - | 报警状态列表 |
| `colors` | QStringList | - | LED颜色列表 |

## 数据集要求

LED面板中的每个LED对应一个数据集，必须设置以下属性：

- **`widget`**：必须设置为 `"led"`
- **`led`**：必须设置为 `true`
- **`ledHigh`**：定义LED点亮的数值（通常为1）
- **`index`**：数据帧中的索引位置

## LED状态定义

### 基本状态

| 数值 | 状态 | 显示效果 |
|------|------|----------|
| 0 | 关闭 | 灰色/暗色 |
| 1 | 点亮 | 明亮颜色 |
| >1 | 点亮 | 明亮颜色 |

### 报警状态

当LED数值超过正常范围或满足报警条件时，LED会进入报警状态：
- **闪烁效果**：LED在亮/暗之间快速切换
- **报警颜色**：通常显示为红色
- **定时器控制**：使用内部定时器控制闪烁频率

## 测试数据示例

### 单个LED测试

```bash
# LED关闭
$0;

# LED点亮  
$1;

# LED报警（数值过高）
$2;
```

### 多LED面板测试

```bash
# 4个LED：开,关,开,开
$1,0,1,1;

# 4个LED：关,开,关,开
$0,1,0,1;

# 系统正常状态
$1,1,1,0;    // 电源开，网络开，数据开，错误关

# 系统报警状态  
$1,0,1,1;    // 电源开，网络断，数据开，错误开
```

### 动态状态变化

```bash
# 系统启动序列
$0,0,0,0;    // 全部关闭
$1,0,0,0;    // 电源启动
$1,1,0,0;    // 网络连接
$1,1,1,0;    // 数据传输开始
$1,1,1,0;    // 系统正常运行
```

## 颜色配置

### 默认颜色方案

```cpp
// 明亮主题
QStringList lightColors = {
    "#4CAF50",  // 绿色 - 正常状态
    "#2196F3",  // 蓝色 - 信息状态  
    "#FF9800",  // 橙色 - 警告状态
    "#F44336"   // 红色 - 错误状态
};

// 深色主题
QStringList darkColors = {
    "#81C784",  // 浅绿色
    "#64B5F6",  // 浅蓝色
    "#FFB74D",  // 浅橙色
    "#E57373"   // 浅红色
};
```

### 自定义颜色

```json
{
    "title": "Custom LED",
    "color": "#00FF00",     // 自定义颜色（十六进制）
    "alarmColor": "#FF0000", // 报警颜色
    "widget": "led",
    "led": true,
    "ledHigh": 1
}
```

## 报警功能

### 报警触发条件

1. **数值超过阈值**：当LED数值超过预设范围时
2. **通信中断**：长时间未收到数据更新时
3. **自定义条件**：根据业务logic自定义报警条件

### 报警配置

```cpp
// 报警定时器配置
QTimer alarmTimer;
alarmTimer.setInterval(500);  // 500ms闪烁频率
alarmTimer.timeout.connect(this, &LEDPanel::onAlarmTimeout);
```

### 报警重置

```cpp
// 报警状态重置
void resetAlarms() {
    for (auto &alarm : m_alarms) {
        alarm = false;
    }
    emit updated();
}
```

## 高级功能

### 动画效果

```cpp
// LED渐变效果
QPropertyAnimation *animation = new QPropertyAnimation(led, "opacity");
animation->setDuration(300);
animation->setStartValue(0.3);
animation->setEndValue(1.0);
animation->start();
```

### 主题适配

```cpp
// 主题变化处理
void onThemeChanged() {
    updateColors();
    emit themeChanged();
}
```

### 状态持久化

```cpp
// 保存LED状态
QSettings settings;
settings.setValue("ledStates", QVariant::fromValue(m_states));

// 恢复LED状态
QList<bool> states = settings.value("ledStates").value<QList<bool>>();
```

## 性能优化

### 更新频率控制

```cpp
// 限制更新频率避免闪烁
static QElapsedTimer updateTimer;
if (updateTimer.elapsed() < 50) return;  // 最大20Hz更新
updateTimer.restart();
```

### 内存管理

```cpp
// 预分配LED数组
m_states.reserve(maxLedCount);
m_alarms.reserve(maxLedCount);
m_titles.reserve(maxLedCount);
```

## 数据集配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `title` | string | 必需 | LED标题 |
| `widget` | string | "led" | 必须设置为"led" |
| `led` | bool | true | 必须设置为true |
| `ledHigh` | double | 1 | LED点亮阈值 |
| `index` | int | 必需 | 数据帧索引 |
| `graph` | bool | false | 建议设置为false |
| `color` | string | 自动 | 自定义颜色（可选） |

## 使用注意事项

1. **数据同步**：多个LED的数据应该是同一时刻的状态
2. **更新频率**：避免过高的更新频率造成视觉疲劳
3. **颜色一致性**：保持LED颜色的语义一致性（绿色=正常，红色=错误）
4. **报警管理**：合理设置报警条件，避免误报
5. **性能考虑**：大量LED时注意更新性能
6. **可访问性**：考虑色盲用户，提供形状或文字辅助

## 错误处理

### 常见错误
- 数据集未设置`led: true`属性
- `ledHigh`阈值设置不合理
- LED数量与数据帧长度不匹配

### 调试建议
- 检查LED状态数据是否正确解析
- 验证报警触发条件
- 监控LED更新频率

## 示例项目配置

### 系统状态监控

```json
{
    "title": "System Status Panel",
    "datasets": [
        {
            "title": "Power",
            "widget": "led",
            "led": true,
            "ledHigh": 1,
            "index": 1,
            "graph": false
        },
        {
            "title": "Network",
            "widget": "led",
            "led": true, 
            "ledHigh": 1,
            "index": 2,
            "graph": false
        },
        {
            "title": "Data Link",
            "widget": "led",
            "led": true,
            "ledHigh": 1,
            "index": 3,
            "graph": false
        },
        {
            "title": "Error",
            "widget": "led",
            "led": true,
            "ledHigh": 1,
            "index": 4,
            "graph": false
        }
    ]
}
```

### 设备连接状态

```json
{
    "title": "Device Connection Status",
    "datasets": [
        {
            "title": "Sensor 1",
            "widget": "led",
            "led": true,
            "ledHigh": 1,
            "index": 1,
            "graph": false
        },
        {
            "title": "Sensor 2",
            "widget": "led",
            "led": true,
            "ledHigh": 1,
            "index": 2, 
            "graph": false
        },
        {
            "title": "Actuator 1",
            "widget": "led",
            "led": true,
            "ledHigh": 1,
            "index": 3,
            "graph": false
        },
        {
            "title": "Communication",
            "widget": "led",
            "led": true,
            "ledHigh": 1,
            "index": 4,
            "graph": false
        }
    ]
}
```