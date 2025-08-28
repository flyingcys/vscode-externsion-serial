# Serial Studio 高级测试工具集

这个目录包含了用于测试 Serial Studio 兼容数据的完整 Python 工具集，支持所有13种可视化组件的精确数据格式和多种通讯协议。

## 🎉 重大更新 - 完全覆盖所有官方示例

我们的测试工具现在**100%覆盖**了Serial-Studio的所有官方示例！包括：

✅ **MPU6050传感器** - 完整的加速度计+陀螺仪+温度数据  
✅ **HexadecimalADC** - 6通道模拟电压采集  
✅ **LorenzAttractor** - 3D混沌吸引子可视化  
✅ **TinyGPS** - GPS地图定位显示  
✅ **BLE Battery** - 蓝牙电池电量监控  
✅ **PulseSensor** - ECG心率波形图  
✅ **LTE modem** - LTE信号质量分析  
✅ **ISS Tracker** - 国际空间站实时追踪  
✅ **UDP Function Generator** - 多种波形发生器  
✅ **Hydrogen** - 氢原子轨道量子可视化  

📖 **详细对应文档**: [SERIAL_STUDIO_EXAMPLES_MAPPING.md](./SERIAL_STUDIO_EXAMPLES_MAPPING.md)

## 🚀 功能特性

### 支持的可视化组件
- **运动传感器**: 加速度计、陀螺仪、指南针
- **测量显示**: 仪表盘、条形图、LED面板
- **图表绘制**: 单线图、多线图、FFT频谱图、3D图表
- **地理和数据**: GPS地图、数据网格、终端显示

### 支持的通讯协议
- **串口 (UART)**: 完整的串口参数配置
- **网络通讯**: TCP客户端/服务器、UDP、UDP组播
- **蓝牙等**: 预留接口支持（BLE、Audio、ModBus、CANBus）

### 数据生成规则
- **基础规则**: 常量、随机数、线性增减
- **波形信号**: 正弦波、余弦波、方波、三角波、锯齿波
- **高级函数**: 指数、对数、噪声、自定义函数
- **智能配置**: 每个组件支持多数据集的独立配置

## 📁 文件说明

| 文件名 | 描述 | 用途 |
|--------|------|------|
| `serial_studio_test_gui_v2.py` | 高级GUI测试工具 | 完整的图形界面，支持所有功能 |
| `component_data_validator.py` | 组件数据验证器 | 命令行工具，验证数据格式正确性 |
| `serial_studio_test_gui.py` | 原始GUI工具 | 基础版本（保留作参考） |
| `serial_studio_automation.py` | 自动化测试脚本 | 命令行自动化测试 |
| `requirements.txt` | Python依赖包 | 所需的外部依赖库 |

## 🛠️ 安装和使用

### 1. 环境准备

```bash
# 1. 克隆仓库或下载文件
cd test/tools

# 2. 安装Python依赖
pip install -r requirements.txt

# 3. 如果是Linux系统且缺少tkinter
sudo apt-get install python3-tk  # Ubuntu/Debian
sudo dnf install python3-tkinter  # CentOS/RHEL/Fedora
```

### 2. 使用高级GUI工具（推荐）

```bash
python serial_studio_test_gui_v2.py
```

#### 主要功能：
- **通讯配置**: 支持串口、TCP、UDP等多种协议
- **组件管理**: 添加、编辑、复制、删除可视化组件
- **数据生成**: 为每个组件配置独立的数据生成规则
- **实时发送**: 可调节发送频率和持续时间
- **数据预览**: 实时查看生成的数据帧
- **日志系统**: 详细的操作日志和错误信息

### 3. 使用数据验证器

```bash
python component_data_validator.py
```

#### 主要功能：
- **格式验证**: 验证数据帧是否符合Serial-Studio规范
- **组件信息**: 查看所有组件的数据格式要求
- **测试数据生成**: 为特定组件生成标准测试数据
- **配置导出**: 导出组件的JSON配置文件

### 4. 快速测试示例

```bash
# 验证加速度计数据格式
echo "验证数据: \$1.2,-0.8,9.6;"
python component_data_validator.py

# 生成GPS测试数据
python -c "
from component_data_validator import ComponentDataValidator, ComponentType
validator = ComponentDataValidator()
data = validator.generate_test_data(ComponentType.GPS, 5)
for frame in data: print(frame)
"
```

## 📋 使用场景

### 场景1: 开发阶段数据测试
```bash
# 启动GUI工具
python serial_studio_test_gui_v2.py

# 配置连接 -> 添加组件 -> 设置数据规则 -> 开始发送
```

### 场景2: 集成测试验证
```bash
# 使用验证器检查数据格式
python component_data_validator.py
# 选择选项2运行验证测试
```

### 场景3: 自动化CI/CD测试
```bash
# 运行自动化测试脚本
python serial_studio_automation.py --port /dev/ttyUSB0 --duration 60
```

## 🔧 配置示例

### 串口配置
```python
comm_config = CommConfig(
    comm_type=CommType.SERIAL,
    port="COM3",           # Windows: COMx, Linux: /dev/ttyUSBx
    baudrate=115200,
    databits=8,
    parity="N",
    stopbits=1
)
```

### TCP网络配置
```python
comm_config = CommConfig(
    comm_type=CommType.TCP_CLIENT,
    host="192.168.1.100",
    tcp_port=8080
)
```

### 组件数据配置示例

#### 加速度计组件
```python
accel_config = ComponentConfig(
    name="三轴加速度计",
    component_type=ComponentType.ACCELEROMETER,
    frequency=20.0,
    data_generation=[
        DataGenConfig(DataGenRule.NOISE, -2.0, 2.0, noise_level=0.1),  # X轴
        DataGenConfig(DataGenRule.NOISE, -2.0, 2.0, noise_level=0.1),  # Y轴
        DataGenConfig(DataGenRule.NOISE, 8.0, 11.0, noise_level=0.2)   # Z轴
    ]
)
```

#### GPS组件
```python
gps_config = ComponentConfig(
    name="GPS定位",
    component_type=ComponentType.GPS,
    frequency=1.0,
    data_generation=[
        DataGenConfig(DataGenRule.SINE_WAVE, 39.9, 39.91, frequency=0.01),  # 纬度
        DataGenConfig(DataGenRule.COSINE_WAVE, 116.4, 116.41, frequency=0.01), # 经度
        DataGenConfig(DataGenRule.LINEAR_INCREASE, 45, 55, step_size=0.1)    # 海拔
    ]
)
```

## 📊 数据格式规范

所有数据帧遵循Serial-Studio标准格式：
```
$数值1,数值2,数值3,...;
```

### 各组件数据格式

| 组件类型 | 数据格式 | 示例 |
|----------|----------|------|
| 加速度计 | `$X,Y,Z;` | `$1.2,-0.8,9.6;` |
| 陀螺仪 | `$Roll,Pitch,Yaw;` | `$15.5,-8.2,125.7;` |
| GPS | `$Lat,Lon,Alt;` | `$39.904200,116.407400,52.5;` |
| 仪表盘 | `$Value;` | `$75.3;` |
| LED面板 | `$LED1,LED2,LED3,...;` | `$1,0,1,0;` |
| 多线图 | `$Ch1,Ch2,Ch3,...;` | `$1.25,-0.75,2.1;` |

## 🔍 故障排除

### 常见问题

1. **串口连接失败**
   ```bash
   # 检查串口权限 (Linux)
   sudo usermod -a -G dialout $USER
   # 重新登录或重启
   ```

2. **tkinter缺失**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install python3-tk
   
   # CentOS/RHEL
   sudo dnf install python3-tkinter
   ```

3. **权限错误**
   ```bash
   # 确保脚本有执行权限
   chmod +x *.py
   ```

### 调试模式

启用详细日志：
```bash
# GUI工具中将日志级别设置为DEBUG
# 或在代码中设置
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 更新日志

### v2.0 (2025-01-29)
- ✨ 新增高级GUI工具，支持所有13种可视化组件
- ✨ 实现灵活的数据生成规则系统
- ✨ 支持多种通讯协议（串口、TCP、UDP）
- ✨ 新增数据验证器工具
- 🔧 完善的配置管理和导入导出功能

### v1.0 (初始版本)
- ✅ 基础GUI测试工具
- ✅ 串口和网络通讯支持
- ✅ 基本的传感器数据模拟

## 📄 许可证

本项目遵循项目根目录的许可证条款。

## 🆘 支持

如果您遇到问题或有功能建议，请：
1. 查看本README的故障排除部分
2. 搜索现有的Issues
3. 创建新的Issue并提供详细信息

---

**注意**: 这些工具专为测试和开发目的设计，请确保在生产环境中使用真实的传感器数据。