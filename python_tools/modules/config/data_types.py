"""
数据类型定义模块

定义Serial Studio测试工具中使用的所有数据类型和枚举。
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any
from enum import Enum

class ComponentType(Enum):
    """支持的可视化组件类型"""
    ACCELEROMETER = "accelerometer"
    GYROSCOPE = "gyroscope"
    GPS = "gps"
    GAUGE = "gauge"
    BAR = "bar"
    COMPASS = "compass"
    LED_PANEL = "led_panel"
    PLOT = "plot"
    MULTIPLOT = "multiplot"
    FFT_PLOT = "fft_plot"
    PLOT_3D = "plot_3d"
    DATA_GRID = "data_grid"
    TERMINAL = "terminal"

class CommType(Enum):
    """通讯协议类型"""
    SERIAL = "serial"
    TCP_CLIENT = "tcp_client"
    TCP_SERVER = "tcp_server"
    UDP = "udp"
    UDP_MULTICAST = "udp_multicast"
    BLUETOOTH_LE = "bluetooth_le"  # 预留
    AUDIO = "audio"  # 预留
    MODBUS = "modbus"  # 预留
    CANBUS = "canbus"  # 预留

class DataGenRule(Enum):
    """数据生成规则类型"""
    CONSTANT = "constant"
    RANDOM = "random"
    SINE_WAVE = "sine_wave"
    COSINE_WAVE = "cosine_wave"
    SQUARE_WAVE = "square_wave"
    SAWTOOTH_WAVE = "sawtooth_wave"
    TRIANGLE_WAVE = "triangle_wave"
    LINEAR_INCREASE = "linear_increase"
    LINEAR_DECREASE = "linear_decrease"
    EXPONENTIAL = "exponential"
    LOGARITHMIC = "logarithmic"
    NOISE = "noise"
    CUSTOM_FUNCTION = "custom_function"

@dataclass
class DataGenConfig:
    """数据生成配置"""
    rule: DataGenRule = DataGenRule.RANDOM
    min_value: float = 0.0
    max_value: float = 100.0
    amplitude: float = 1.0
    frequency: float = 1.0
    phase: float = 0.0
    noise_level: float = 0.1
    step_size: float = 1.0
    custom_function: str = ""
    duration: float = 0.0  # 0表示无限
    parameters: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ComponentConfig:
    """组件配置"""
    name: str
    component_type: ComponentType
    enabled: bool = True
    frequency: float = 1.0  # Hz
    datasets: List[Dict[str, Any]] = field(default_factory=list)
    widget_config: Dict[str, Any] = field(default_factory=dict)
    data_generation: List[DataGenConfig] = field(default_factory=list)

@dataclass
class CommConfig:
    """通讯配置"""
    comm_type: CommType
    # Serial配置
    port: str = "COM1"
    baudrate: int = 9600
    databits: int = 8
    parity: str = "N"
    stopbits: int = 1
    # Network配置
    host: str = "127.0.0.1"
    tcp_port: int = 8080
    udp_local_port: int = 12345
    udp_remote_port: int = 12346
    # 通用配置
    auto_reconnect: bool = True
    timeout: float = 1.0
    buffer_size: int = 4096