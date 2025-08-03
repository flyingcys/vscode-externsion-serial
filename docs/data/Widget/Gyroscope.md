# 陀螺仪组件 (Gyroscope)

## 概述

陀螺仪组件用于显示三轴角速度数据的姿态指示器，支持角速度积分为角度显示。该组件提供直观的飞行姿态指示，适用于无人机、航空器、机器人等需要姿态显示的应用场景。

## 数据格式要求

### 组配置结构

```json
{
    "title": "Gyroscope",
    "widget": "gyro", 
    "datasets": [
        {
            "title": "Gyro X (Roll)",
            "units": "deg/s",
            "widget": "x",
            "index": 1,
            "graph": true
        },
        {
            "title": "Gyro Y (Pitch)",
            "units": "deg/s", 
            "widget": "y",
            "index": 2,
            "graph": true
        },
        {
            "title": "Gyro Z (Yaw)",
            "units": "deg/s",
            "widget": "z", 
            "index": 3,
            "graph": true
        }
    ]
}
```

### 核心属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `yaw` | double | 0.0 | 偏航角/角速度（绕Z轴） |
| `pitch` | double | 0.0 | 俯仰角/角速度（绕Y轴） |
| `roll` | double | 0.0 | 滚转角/角速度（绕X轴） |
| `integrateValues` | bool | false | 是否积分角速度得到角度 |

## 数据集要求

陀螺仪组件**必须**包含三个数据集，分别对应X、Y、Z轴：

1. **X轴数据集**：`widget` 属性必须设置为 `"x"`（滚转角速度/Roll）
2. **Y轴数据集**：`widget` 属性必须设置为 `"y"`（俯仰角速度/Pitch）  
3. **Z轴数据集**：`widget` 属性必须设置为 `"z"`（偏航角速度/Yaw）

## 积分功能详解

### 角速度积分为角度

当 `integrateValues` 设置为 `true` 时，组件会对角速度进行时间积分，计算得到实际的角度值：

```cpp
// 积分计算公式
angle = previous_angle + (angular_velocity * delta_time)
```

### 配置示例

```json
{
    "title": "Attitude Indicator",
    "widget": "gyro",
    "integrateValues": true,  // 启用积分功能
    "datasets": [
        {
            "title": "Roll Rate",
            "units": "deg/s",      // 角速度单位
            "widget": "x",
            "index": 1,
            "graph": true
        }
        // ... 其他轴配置
    ]
}
```

## 坐标系统

### 标准航空坐标系

- **Roll (X轴)**：绕机体X轴（纵轴）的滚转运动
- **Pitch (Y轴)**：绕机体Y轴（横轴）的俯仰运动  
- **Yaw (Z轴)**：绕机体Z轴（垂直轴）的偏航运动

### 角度范围

| 轴向 | 角度范围 | 说明 |
|------|----------|------|
| Roll | -180° ~ +180° | 左滚转为负，右滚转为正 |
| Pitch | -90° ~ +90° | 下俯为负，上仰为正 |
| Yaw | -180° ~ +180° | 左偏航为负，右偏航为正 |

## 测试数据示例

### 角速度模式（integrateValues = false）

```bash
# 静止状态
$0.0,0.0,0.0;

# 右滚转
$10.0,0.0,0.0;    // Roll: 10 deg/s

# 上俯仰
$0.0,5.0,0.0;     // Pitch: 5 deg/s

# 右偏航
$0.0,0.0,15.0;    // Yaw: 15 deg/s

# 复合运动
$5.0,-3.0,8.0;    // Roll: 5, Pitch: -3, Yaw: 8 deg/s
```

### 角度模式（integrateValues = true）

```bash
# 水平姿态
$0.0,0.0,0.0;

# 右倾斜30度
$30.0,0.0,0.0;

# 上抬15度
$0.0,15.0,0.0;

# 右转45度
$0.0,0.0,45.0;

# 复合姿态
$-10.0,5.0,90.0;  // 左倾10度，上抬5度，右转90度
```

### 动态飞行场景

```bash
# 起飞爬升
$0.0,15.0,0.0;
$0.0,20.0,0.0;
$0.0,18.0,0.0;
$0.0,12.0,0.0;

# 转弯飞行
$15.0,5.0,30.0;
$25.0,5.0,45.0;
$20.0,5.0,40.0;
$10.0,5.0,25.0;
```

## 性能配置

### 角速度范围

| 应用场景 | 推荐范围 | 说明 |
|----------|----------|------|
| 慢速运动 | ±50 deg/s | 人体运动、缓慢机械 |
| 常规应用 | ±500 deg/s | 无人机、车辆 |
| 高速应用 | ±2000 deg/s | 高速旋转机械 |
| 极限应用 | ±4000 deg/s | 特殊工业应用 |

### 采样频率建议

- **低频应用**：10-50 Hz
- **控制应用**：100-500 Hz  
- **高精度应用**：1000+ Hz

## 积分误差处理

### 零点漂移校正

```json
{
    "zeroPointCalibration": true,   // 启用零点校正
    "driftCompensation": true,      // 启用漂移补偿
    "calibrationTime": 10           // 校正时间（秒）
}
```

### 积分重置

```cpp
// 定期重置积分值防止累积误差
if (abs(angular_velocity) < threshold) {
    reset_integration_drift();
}
```

## 数据集配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `title` | string | 必需 | 数据集标题 |
| `units` | string | "deg/s" | 角速度单位或"deg"（角度） |
| `widget` | string | 必需 | 轴标识（"x"/"y"/"z"） |
| `index` | int | 必需 | 数据帧中的索引位置 |
| `graph` | bool | true | 是否在图表中显示 |
| `min` | double | -180 | 最小值（角度模式） |
| `max` | double | 180 | 最大值（角度模式） |

## 使用注意事项

1. **坐标系一致性**：确保X、Y、Z轴定义与硬件坐标系一致
2. **单位统一**：所有轴数据必须使用相同的单位
3. **积分模式选择**：根据应用需求选择角速度或角度模式
4. **零点校准**：使用前应进行静态零点校准
5. **温度补偿**：高精度应用需考虑温度对陀螺仪的影响
6. **积分重置**：长时间运行时需定期重置积分累积误差

## 错误处理

### 常见错误
- 缺少X、Y、Z中任一轴的数据集
- widget属性设置错误（非"x"/"y"/"z"）
- 角速度数据超出传感器量程

### 调试建议
- 检查静态状态下的零点输出
- 验证各轴旋转方向的正负性
- 监控积分模式下的漂移情况

## 示例项目配置

### 角速度显示模式

```json
{
    "title": "Angular Velocity",
    "widget": "gyro",
    "integrateValues": false,
    "datasets": [
        {
            "title": "Roll Rate",
            "units": "deg/s",
            "widget": "x",
            "index": 1,
            "graph": true,
            "min": -500,
            "max": 500
        },
        {
            "title": "Pitch Rate",
            "units": "deg/s", 
            "widget": "y",
            "index": 2,
            "graph": true,
            "min": -500,
            "max": 500
        },
        {
            "title": "Yaw Rate",
            "units": "deg/s",
            "widget": "z",
            "index": 3,
            "graph": true,
            "min": -500,
            "max": 500
        }
    ]
}
```

### 姿态角显示模式

```json
{
    "title": "Attitude Indicator",
    "widget": "gyro",
    "integrateValues": true,
    "datasets": [
        {
            "title": "Roll Angle",
            "units": "deg",
            "widget": "x",
            "index": 1,
            "graph": true,
            "min": -180,
            "max": 180
        },
        {
            "title": "Pitch Angle",
            "units": "deg", 
            "widget": "y",
            "index": 2,
            "graph": true,
            "min": -90,
            "max": 90
        },
        {
            "title": "Yaw Angle",
            "units": "deg",
            "widget": "z",
            "index": 3,
            "graph": true,
            "min": -180,
            "max": 180
        }
    ]
}
```