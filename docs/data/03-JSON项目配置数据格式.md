# Serial-Studio JSON项目配置数据格式

## 概述

Serial-Studio使用JSON格式的项目文件来定义数据解析规则、可视化组件配置和用户界面布局。本文档详细描述了JSON项目配置文件的完整结构、各字段含义和使用方法。

## 1. 项目文件总体结构

### 1.1 根级别字段

```json
{
    "title": "项目名称",
    "decoder": 0,
    "frameDetection": 1,
    "frameStart": "$",
    "frameEnd": ";",
    "checksum": "",
    "hexadecimalDelimiters": false,
    "frameParser": "JavaScript解析函数",
    "mapTilerApiKey": "",
    "thunderforestApiKey": "",
    "groups": [],
    "actions": []
}
```

### 1.2 字段详细说明

| 字段名称 | 类型 | 必需 | 描述 | 默认值 |
|---------|------|------|------|--------|
| title | string | 是 | 项目标题，显示在标题栏 | - |
| decoder | int | 是 | 数据解码方式 | 0 |
| frameDetection | int | 是 | 帧检测模式 | 1 |
| frameStart | string | 否 | 帧开始分隔符 | "" |
| frameEnd | string | 是 | 帧结束分隔符 | ";" |
| checksum | string | 否 | 校验和算法 | "" |
| hexadecimalDelimiters | bool | 否 | 分隔符是否为十六进制 | false |
| frameParser | string | 是 | JavaScript解析函数代码 | - |
| mapTilerApiKey | string | 否 | MapTiler API密钥（GPS组件） | "" |
| thunderforestApiKey | string | 否 | Thunderforest API密钥（GPS组件） | "" |
| groups | array | 是 | 数据组配置数组 | [] |
| actions | array | 否 | 动作配置数组 | [] |

## 2. 解码器配置 (decoder)

### 2.1 解码器类型枚举

```cpp
enum DecoderMethod {
    PlainText = 0,   // 纯文本（默认）
    Hexadecimal = 1, // 十六进制
    Base64 = 2,      // Base64编码
    Binary = 3       // 二进制
};
```

### 2.2 使用示例

```json
{
    "decoder": 0,  // 纯文本模式
    "frameDetection": 1,
    "frameEnd": "\\n"
}
```

## 3. 帧检测配置 (frameDetection)

### 3.1 帧检测模式枚举

```cpp
enum FrameDetection {
    EndDelimiterOnly = 0,     // 仅结束分隔符
    StartAndEndDelimiter = 1, // 开始和结束分隔符
    NoDelimiters = 2,         // 无分隔符
    StartDelimiterOnly = 3    // 仅开始分隔符
};
```

### 3.2 配置示例

```json
// 模式1：开始和结束分隔符
{
    "frameDetection": 1,
    "frameStart": "$",
    "frameEnd": ";"
}

// 模式0：仅结束分隔符
{
    "frameDetection": 0,
    "frameEnd": "\\n"
}
```

## 4. JavaScript帧解析器 (frameParser)

### 4.1 解析函数规范

帧解析器是一个JavaScript函数，用于将接收到的原始数据帧分解为数据数组。

**基本模板：**
```javascript
/**
 * 将数据帧分解为数组元素
 * @param[in] frame 原始数据帧字符串
 * @return 分解后的字符串数组
 */
function parse(frame) {
    // 解析逻辑
    return dataArray;
}
```

### 4.2 常用解析示例

#### 4.2.1 逗号分隔解析
```javascript
function parse(frame) {
    return frame.split(',');
}

// 输入："25.6,60.2,1013.25"
// 输出：["25.6", "60.2", "1013.25"]
```

#### 4.2.2 键值对解析
```javascript
function parse(frame) {
    var data = [];
    var pairs = frame.split(',');
    
    for (var i = 0; i < pairs.length; i++) {
        var kv = pairs[i].split(':');
        if (kv.length === 2) {
            data.push(kv[1]); // 只取值
        }
    }
    
    return data;
}

// 输入："temp:25.6,hum:60.2,press:1013.25"
// 输出：["25.6", "60.2", "1013.25"]
```

#### 4.2.3 JSON格式解析
```javascript
function parse(frame) {
    try {
        var json = JSON.parse(frame);
        return [
            json.temperature.toString(),
            json.humidity.toString(),
            json.pressure.toString()
        ];
    } catch (e) {
        return ["0", "0", "0"];
    }
}

// 输入：'{"temperature":25.6,"humidity":60.2,"pressure":1013.25}'
// 输出：["25.6", "60.2", "1013.25"]
```

#### 4.2.4 固定位置解析
```javascript
function parse(frame) {
    // 假设数据格式：TTHHPP（温度2位，湿度2位，压力2位）
    if (frame.length >= 6) {
        return [
            frame.substring(0, 2),  // 温度
            frame.substring(2, 4),  // 湿度
            frame.substring(4, 6)   // 压力
        ];
    }
    return ["0", "0", "0"];
}

// 输入："256015"
// 输出：["25", "60", "15"]
```

### 4.3 高级解析技巧

#### 4.3.1 全局变量使用
```javascript
// 全局变量（在parse函数外定义）
var frameCounter = 0;
var lastTemperature = 0;

function parse(frame) {
    frameCounter++;
    
    var values = frame.split(',');
    var temp = parseFloat(values[0]);
    
    // 异常值检测
    if (Math.abs(temp - lastTemperature) > 10) {
        temp = lastTemperature; // 使用上次值
    }
    
    lastTemperature = temp;
    
    return [
        temp.toString(),
        values[1] || "0",
        frameCounter.toString()
    ];
}
```

#### 4.3.2 数据验证和清理
```javascript
function parse(frame) {
    var values = frame.split(',');
    var result = [];
    
    for (var i = 0; i < values.length; i++) {
        var val = values[i].trim();
        
        // 检查是否为有效数字
        if (!isNaN(val) && val !== '') {
            result.push(val);
        } else {
            result.push('0'); // 无效值用0替代
        }
    }
    
    return result;
}
```

## 5. 数据组配置 (groups)

### 5.1 组结构定义

```json
{
    "title": "组名称",
    "widget": "组件类型",
    "datasets": [
        // 数据集配置数组
    ]
}
```

### 5.2 组件类型 (widget)

| 组件类型 | 字符串值 | 描述 |
|---------|----------|------|
| 数据网格 | "" 或 "datagrid" | 表格显示所有数据 |
| 加速度计 | "accelerometer" | 三轴加速度显示 |
| 陀螺仪 | "gyro" | 三轴角速度显示 |
| GPS地图 | "map" | 地理位置显示 |
| 多线图 | "multiplot" | 多条曲线图表 |
| 3D图表 | "plot3d" | 三维数据可视化（商业版）|

### 5.3 数据集配置 (datasets)

#### 5.3.1 基本字段结构

```json
{
    "title": "数据标题",
    "units": "单位",
    "value": "默认值",
    "widget": "组件标识",
    "index": 1,
    "graph": true,
    "min": 0,
    "max": 100,
    "alarm": 80,
    "fft": false,
    "fftSamples": 1024,
    "fftSamplingRate": 1000,
    "fftWindowFn": "Hanning",
    "led": false,
    "ledHigh": 1,
    "log": false,
    "overviewDisplay": true,
    "xAxis": 0
}
```

#### 5.3.2 字段详细说明

| 字段名称 | 类型 | 必需 | 描述 | 默认值 |
|---------|------|------|------|--------|
| title | string | 是 | 数据集显示名称 | - |
| units | string | 否 | 数据单位 | "" |
| value | string | 否 | 默认显示值 | "--.--" |
| widget | string | 否 | 组件内数据标识 | "" |
| index | int | 是 | 数据在解析数组中的索引（从1开始）| - |
| graph | bool | 否 | 是否在图表中显示 | false |
| min | number | 否 | 最小值（用于仪表盘/条形图）| 0 |
| max | number | 否 | 最大值（用于仪表盘/条形图）| 0 |
| alarm | number | 否 | 报警阈值 | 0 |
| fft | bool | 否 | 是否进行FFT变换 | false |
| fftSamples | int | 否 | FFT样本数量 | 1024 |
| fftSamplingRate | int | 否 | 采样频率(Hz) | 1000 |
| fftWindowFn | string | 否 | FFT窗函数 | "Hanning" |
| led | bool | 否 | 是否为LED指示器 | false |
| ledHigh | number | 否 | LED点亮阈值 | 1 |
| log | bool | 否 | 是否记录到CSV | false |
| overviewDisplay | bool | 否 | 是否在概览中显示 | false |
| xAxis | int | 否 | X轴数据索引（用于XY图）| 0 |

## 6. 组件特定配置

### 6.1 加速度计组件

```json
{
    "title": "Accelerometer",
    "widget": "accelerometer",
    "datasets": [
        {
            "title": "Accelerometer X",
            "units": "m/s²",
            "widget": "x",
            "index": 1,
            "graph": true
        },
        {
            "title": "Accelerometer Y",
            "units": "m/s²",
            "widget": "y", 
            "index": 2,
            "graph": true
        },
        {
            "title": "Accelerometer Z",
            "units": "m/s²",
            "widget": "z",
            "index": 3,
            "graph": true
        }
    ]
}
```

### 6.2 GPS地图组件

```json
{
    "title": "GPS Map",
    "widget": "map",
    "datasets": [
        {
            "title": "Latitude",
            "units": "°",
            "widget": "lat",
            "index": 1,
            "graph": false
        },
        {
            "title": "Longitude",
            "units": "°", 
            "widget": "lon",
            "index": 2,
            "graph": false
        },
        {
            "title": "Altitude",
            "units": "m",
            "widget": "alt",
            "index": 3,
            "graph": false
        }
    ]
}
```

### 6.3 FFT频谱组件

```json
{
    "title": "Audio Signal",
    "units": "V",
    "fft": true,
    "fftSamples": 2048,
    "fftSamplingRate": 44100,
    "fftWindowFn": "Hanning",
    "index": 1,
    "graph": true
}
```

### 6.4 多线图组件

```json
{
    "title": "Multi Sensor Data",
    "widget": "multiplot",
    "datasets": [
        {
            "title": "Sensor 1",
            "units": "V",
            "index": 1,
            "graph": true
        },
        {
            "title": "Sensor 2",
            "units": "V",
            "index": 2, 
            "graph": true
        }
    ]
}
```

## 7. 动作配置 (actions)

### 7.1 动作结构

```json
{
    "title": "动作名称",
    "icon": "图标名称",
    "txData": "发送数据"
}
```

### 7.2 动作示例

```json
{
    "actions": [
        {
            "title": "LED On",
            "icon": "led",
            "txData": "LED_ON\\n"
        },
        {
            "title": "LED Off", 
            "icon": "led",
            "txData": "LED_OFF\\n"
        },
        {
            "title": "Reset Device",
            "icon": "restart",
            "txData": "RESET\\n"
        }
    ]
}
```

## 8. 完整配置示例

### 8.1 环境监测项目

```json
{
    "title": "Environment Monitor",
    "decoder": 0,
    "frameDetection": 1,
    "frameStart": "$",
    "frameEnd": ";",
    "checksum": "",
    "hexadecimalDelimiters": false,
    "frameParser": "function parse(frame) { return frame.split(','); }",
    "mapTilerApiKey": "",
    "thunderforestApiKey": "",
    "groups": [
        {
            "title": "Temperature & Humidity",
            "widget": "multiplot",
            "datasets": [
                {
                    "title": "Temperature",
                    "units": "℃",
                    "index": 1,
                    "graph": true,
                    "min": -10,
                    "max": 50,
                    "alarm": 40,
                    "log": true
                },
                {
                    "title": "Humidity",
                    "units": "%",
                    "index": 2,
                    "graph": true,
                    "min": 0,
                    "max": 100,
                    "alarm": 80,
                    "log": true
                }
            ]
        },
        {
            "title": "Pressure",
            "widget": "",
            "datasets": [
                {
                    "title": "Atmospheric Pressure",
                    "units": "hPa",
                    "widget": "gauge",
                    "index": 3,
                    "graph": true,
                    "min": 950,
                    "max": 1050,
                    "log": true
                }
            ]
        }
    ],
    "actions": [
        {
            "title": "Calibrate",
            "icon": "calibrate", 
            "txData": "CAL\\n"
        }
    ]
}
```

### 8.2 运动传感器项目

```json
{
    "title": "Motion Sensor",
    "decoder": 0,
    "frameDetection": 1, 
    "frameStart": "$",
    "frameEnd": ";",
    "frameParser": "function parse(frame) { return frame.split(','); }",
    "groups": [
        {
            "title": "Accelerometer",
            "widget": "accelerometer",
            "datasets": [
                {
                    "title": "Accel X",
                    "units": "m/s²",
                    "widget": "x",
                    "index": 1,
                    "graph": true
                },
                {
                    "title": "Accel Y", 
                    "units": "m/s²",
                    "widget": "y",
                    "index": 2,
                    "graph": true
                },
                {
                    "title": "Accel Z",
                    "units": "m/s²",
                    "widget": "z", 
                    "index": 3,
                    "graph": true
                }
            ]
        },
        {
            "title": "Gyroscope",
            "widget": "gyro",
            "datasets": [
                {
                    "title": "Gyro X",
                    "units": "deg/s",
                    "widget": "x",
                    "index": 4,
                    "graph": true
                },
                {
                    "title": "Gyro Y",
                    "units": "deg/s", 
                    "widget": "y",
                    "index": 5,
                    "graph": true
                },
                {
                    "title": "Gyro Z",
                    "units": "deg/s",
                    "widget": "z",
                    "index": 6,
                    "graph": true
                }
            ]
        }
    ]
}
```

## 9. 配置验证和调试

### 9.1 常见配置错误

1. **索引错误**: `index`字段从1开始，不是0
2. **解析函数错误**: JavaScript语法错误导致解析失败
3. **组件类型错误**: `widget`字段拼写错误
4. **数据类型错误**: 数值字段使用了字符串类型

### 9.2 调试建议

1. **使用JSON验证器**: 确保JSON格式正确
2. **测试解析函数**: 在浏览器控制台中测试JavaScript代码
3. **检查数据索引**: 确保`index`与解析数组对应
4. **验证帧分隔符**: 确保与实际数据格式匹配

### 9.3 配置文件生成工具

可以使用Serial-Studio内置的项目编辑器来可视化创建和编辑配置文件，避免手动编写JSON时出现语法错误。

---

*注意：修改配置文件后需要重新加载项目才能生效。建议在开发过程中频繁保存和测试配置。*