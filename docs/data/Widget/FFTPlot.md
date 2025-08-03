# FFT频谱图组件 (FFTPlot)

## 概述

FFT频谱图组件用于显示时域信号的频域特征，通过快速傅里叶变换(FFT)将时域数据转换为频谱数据。适用于信号分析、振动监测、音频处理、频谱分析等应用场景。

## 数据格式要求

### 数据集配置结构

```json
{
    "title": "Signal Spectrum",
    "datasets": [
        {
            "title": "Signal Data",
            "units": "V",
            "fft": true,
            "fftSamples": 1024,
            "fftSamplingRate": 1000,
            "fftWindowFn": "Hanning",
            "index": 1,
            "graph": true
        }
    ]
}
```

### 核心属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `minX` | double | 0 | 频率轴最小值 |
| `maxX` | double | 自动计算 | 频率轴最大值（采样率/2） |
| `minY` | double | 自动计算 | 幅度轴最小值 |
| `maxY` | double | 自动计算 | 幅度轴最大值 |
| `xTickInterval` | double | 自动计算 | 频率轴刻度间隔 |
| `yTickInterval` | double | 自动计算 | 幅度轴刻度间隔 |

## FFT配置参数

### 必需参数

| 参数 | 类型 | 说明 | 推荐值 |
|------|------|------|---------|
| `fft` | bool | 必须设置为true | true |
| `fftSamples` | int | FFT样本数量 | 1024, 2048, 4096 |
| `fftSamplingRate` | int | 采样频率(Hz) | 依据信号带宽 |
| `fftWindowFn` | string | 窗函数类型 | "Hanning" |

### 窗函数类型

| 窗函数 | 特点 | 适用场景 |
|--------|------|----------|
| `"Rectangular"` | 无窗函数，频率分辨率最高 | 周期信号分析 |
| `"Hanning"` | 平滑过渡，旁瓣抑制好 | 通用信号分析 |
| `"Hamming"` | 类似Hanning，主瓣更窄 | 频率分离要求高 |
| `"Blackman"` | 旁瓣抑制最佳 | 弱信号检测 |
| `"Kaiser"` | 可调参数窗函数 | 专业信号处理 |

### 采样定理

```
奈奎斯特频率 = 采样频率 / 2
频率分辨率 = 采样频率 / FFT样本数
```

## 测试数据示例

### 单频正弦波

```python
# Python生成1kHz正弦波测试数据
import numpy as np

fs = 8000  # 采样频率
f = 1000   # 信号频率
t = np.linspace(0, 1, fs)
signal = np.sin(2 * np.pi * f * t)

for sample in signal:
    print(f"${sample:.6f};")
```

### 多频信号

```python
# 生成多频率复合信号
import numpy as np

fs = 8000
t = np.linspace(0, 1, fs)

# 50Hz + 150Hz + 300Hz
signal = (np.sin(2 * np.pi * 50 * t) + 
          0.5 * np.sin(2 * np.pi * 150 * t) + 
          0.25 * np.sin(2 * np.pi * 300 * t))

for sample in signal:
    print(f"${sample:.6f};")
```

### 噪声信号

```python
# 带噪声的信号
import numpy as np

fs = 4000
f = 200   # 信号频率
t = np.linspace(0, 2, fs * 2)

# 信号 + 白噪声
signal = np.sin(2 * np.pi * f * t) + 0.3 * np.random.randn(len(t))

for sample in signal:
    print(f"${sample:.6f};")
```

### 调频信号

```python
# 线性调频(Chirp)信号
import numpy as np

fs = 8000
t = np.linspace(0, 2, fs * 2)
f0, f1 = 100, 1000  # 起始和结束频率

# 频率线性变化
signal = np.sin(2 * np.pi * (f0 + (f1 - f0) * t / 2) * t)

for sample in signal:
    print(f"${sample:.6f};")
```

## FFT计算原理

### 变换过程

```cpp
// FFT变换流程
1. 数据采集 -> 时域信号样本
2. 窗函数处理 -> 减少频谱泄漏
3. FFT计算 -> 复数频谱
4. 幅度计算 -> |FFT[k]| = √(Re² + Im²)
5. 频率映射 -> freq[k] = k * fs / N
```

### QFourierTransformer使用

```cpp
// FFT变换器配置
QFourierTransformer transformer;
transformer.setSize(fftSamples);
transformer.setWindowFunction(windowFunction);

// 执行FFT
QVector<float> input(fftSamples);
QVector<QComplexNumber> output = transformer.forwardTransform(input);

// 计算幅度谱
for (int i = 0; i < output.size() / 2; ++i) {
    double magnitude = output[i].magnitude();
    double frequency = i * samplingRate / fftSamples;
    // 添加到显示数据
}
```

## 频谱分析配置

### 频率范围设置

```json
{
    "fftSamplingRate": 8000,    // 8kHz采样率
    "fftSamples": 2048,         // 2048点FFT
    "frequencyRange": {
        "min": 0,               // 直流分量
        "max": 4000             // 奈奎斯特频率
    },
    "frequencyResolution": 3.91 // 8000/2048 ≈ 3.91Hz
}
```

### 幅度范围配置

```json
{
    "amplitudeRange": {
        "min": -80,             // -80dB
        "max": 0,               // 0dB (参考值)
        "unit": "dB"            // 对数刻度
    },
    "autoScale": true           // 自动缩放
}
```

### 显示参数

```json
{
    "displayMode": "magnitude", // "magnitude" 或 "power"
    "logScale": true,          // 对数频率轴
    "dbScale": true,           // dB幅度轴
    "peakHold": false,         // 峰值保持
    "averaging": 1             // 频谱平均次数
}
```

## 性能优化

### FFT尺寸选择

| FFT Size | 频率分辨率 | 计算复杂度 | 适用场景 |
|----------|------------|------------|----------|
| 512 | 较低 | 低 | 实时分析 |
| 1024 | 中等 | 中等 | 常规应用 |
| 2048 | 较高 | 较高 | 精密分析 |
| 4096 | 高 | 高 | 科研应用 |

### 实时性能

```cpp
// 性能优化建议
static const int OPTIMAL_FFT_SIZE = 1024;
static const int MAX_UPDATE_RATE = 30; // 30Hz更新

// 使用环形缓冲区
CircularBuffer<float> sampleBuffer(OPTIMAL_FFT_SIZE);

// 避免频繁内存分配
static QScopedArrayPointer<float> fftBuffer(new float[OPTIMAL_FFT_SIZE]);
```

### 内存管理

```cpp
// 内存优化
~FFTPlot() {
    m_data.clear();
    m_data.squeeze();
    m_fft.reset();
    m_samples.reset();
}
```

## 应用场景

### 振动分析

```json
{
    "title": "Vibration Analysis",
    "fftSamplingRate": 2048,    // 2.048kHz采样
    "fftSamples": 2048,
    "fftWindowFn": "Hanning",
    "frequencyRange": [0, 1024], // 0-1024Hz
    "application": "机械振动监测"
}
```

### 音频分析

```json
{
    "title": "Audio Spectrum",
    "fftSamplingRate": 44100,   // CD质量采样率
    "fftSamples": 4096,
    "fftWindowFn": "Blackman",
    "frequencyRange": [20, 20000], // 人耳听觉范围
    "application": "音频频谱分析"
}
```

### 电力谐波分析

```json
{
    "title": "Power Harmonics",
    "fftSamplingRate": 3200,    // 基频50Hz的64倍
    "fftSamples": 1024,
    "fftWindowFn": "Hanning",
    "frequencyRange": [0, 1600], // 0-1600Hz
    "application": "电力系统谐波分析"
}
```

## 数据集配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `title` | string | 必需 | 数据集标题 |
| `units` | string | "V" | 信号单位 |
| `fft` | bool | false | 必须设置为true |
| `fftSamples` | int | 1024 | FFT样本数 |
| `fftSamplingRate` | int | 1000 | 采样频率 |
| `fftWindowFn` | string | "Hanning" | 窗函数类型 |
| `index` | int | 必需 | 数据帧索引 |
| `graph` | bool | true | 显示在图表中 |

## 使用注意事项

1. **采样定律**：采样频率必须大于信号最高频率的2倍
2. **频谱泄漏**：选择合适的窗函数减少泄漏
3. **频率分辨率**：增加FFT样本数提高频率分辨率
4. **实时性能**：平衡FFT精度与计算性能
5. **数据预处理**：移除直流分量，应用抗混叠滤波
6. **动态范围**：确保信号幅度在合理范围内

## 错误处理

### 常见错误
- FFT样本数不是2的幂次
- 采样率设置不当导致混叠
- 窗函数选择不合适

### 调试建议
- 检查时域信号是否正常
- 验证FFT参数配置
- 监控计算性能指标

## 示例项目配置

### 通用信号分析

```json
{
    "title": "Signal Spectrum Analyzer",
    "datasets": [
        {
            "title": "Input Signal",
            "units": "V",
            "fft": true,
            "fftSamples": 2048,
            "fftSamplingRate": 8000,
            "fftWindowFn": "Hanning",
            "index": 1,
            "graph": true
        }
    ]
}
```

### 高精度频谱分析

```json
{
    "title": "High Resolution FFT",
    "datasets": [
        {
            "title": "Precision Signal",
            "units": "mV", 
            "fft": true,
            "fftSamples": 8192,
            "fftSamplingRate": 48000,
            "fftWindowFn": "Kaiser",
            "index": 1,
            "graph": true
        }
    ]
}
```