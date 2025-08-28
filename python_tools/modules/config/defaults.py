"""
默认配置模块

提供各种组件的默认配置。
"""

import math
from .data_types import ComponentConfig, ComponentType, DataGenConfig, DataGenRule

class DefaultConfigs:
    """默认配置管理器"""
    
    @staticmethod
    def get_default_component_configs():
        """获取默认组件配置列表"""
        return [
            ComponentConfig(
                name="MPU6050传感器",
                component_type=ComponentType.MPU6050,
                enabled=True,
                frequency=20.0,
                data_generation=[
                    # 加速度数据 (m/s²)
                    DataGenConfig(DataGenRule.NOISE, -2.0, 2.0, noise_level=0.5),    # accel_x
                    DataGenConfig(DataGenRule.NOISE, -2.0, 2.0, noise_level=0.5),    # accel_y  
                    DataGenConfig(DataGenRule.NOISE, 8.0, 11.0, noise_level=0.2),    # accel_z (含重力)
                    # 陀螺仪数据 (deg/s) - 使用更合理的MPU6050范围和较小的噪声
                    DataGenConfig(DataGenRule.RANDOM, -50, 50),                        # gyro_x
                    DataGenConfig(DataGenRule.RANDOM, -50, 50),                        # gyro_y
                    DataGenConfig(DataGenRule.RANDOM, -50, 50),                        # gyro_z
                    # 温度数据 (℃)
                    DataGenConfig(DataGenRule.SINE_WAVE, 22.0, 28.0, frequency=0.01)  # temperature
                ]
            ),
            ComponentConfig(
                name="陀螺仪传感器",
                component_type=ComponentType.GYROSCOPE,
                enabled=True,
                frequency=20.0,
                data_generation=[
                    DataGenConfig(DataGenRule.SINE_WAVE, -180, 180, frequency=0.1),
                    DataGenConfig(DataGenRule.COSINE_WAVE, -90, 90, frequency=0.15),
                    DataGenConfig(DataGenRule.SINE_WAVE, -180, 180, frequency=0.08, phase=math.pi/4)
                ]
            ),
            ComponentConfig(
                name="GPS定位",
                component_type=ComponentType.GPS,
                enabled=True,
                frequency=1.0,
                data_generation=[
                    DataGenConfig(DataGenRule.NOISE, 39.9, 39.91, noise_level=0.001),
                    DataGenConfig(DataGenRule.NOISE, 116.4, 116.41, noise_level=0.001),
                    DataGenConfig(DataGenRule.LINEAR_INCREASE, 45, 55, step_size=0.1)
                ]
            ),
            ComponentConfig(
                name="温度仪表",
                component_type=ComponentType.GAUGE,
                enabled=True,
                frequency=2.0,
                data_generation=[
                    DataGenConfig(DataGenRule.SINE_WAVE, 20, 35, frequency=0.01, amplitude=5)
                ]
            ),
            ComponentConfig(
                name="电池电量",
                component_type=ComponentType.BAR,
                enabled=True,
                frequency=0.5,
                data_generation=[
                    DataGenConfig(DataGenRule.LINEAR_DECREASE, 100, 0, step_size=0.1)
                ]
            ),
            ComponentConfig(
                name="方向指南针",
                component_type=ComponentType.COMPASS,
                enabled=True,
                frequency=5.0,
                data_generation=[
                    DataGenConfig(DataGenRule.LINEAR_INCREASE, 0, 360, step_size=1.0)
                ]
            ),
            ComponentConfig(
                name="状态LED面板",
                component_type=ComponentType.LED_PANEL,
                enabled=True,
                frequency=2.0,
                datasets=[
                    {"title": "Power", "widget": "led", "led": True, "ledHigh": 1, "index": 1},
                    {"title": "Network", "widget": "led", "led": True, "ledHigh": 1, "index": 2},
                    {"title": "Data", "widget": "led", "led": True, "ledHigh": 1, "index": 3},
                    {"title": "Error", "widget": "led", "led": True, "ledHigh": 1, "index": 4}
                ],
                data_generation=[
                    DataGenConfig(DataGenRule.RANDOM, 0, 1, parameters={'threshold': 0.2}),
                    DataGenConfig(DataGenRule.RANDOM, 0, 1, parameters={'threshold': 0.3}),
                    DataGenConfig(DataGenRule.RANDOM, 0, 1, parameters={'threshold': 0.1}),
                    DataGenConfig(DataGenRule.RANDOM, 0, 1, parameters={'threshold': 0.8})
                ]
            ),
            ComponentConfig(
                name="实时波形图",
                component_type=ComponentType.PLOT,
                enabled=True,
                frequency=50.0,
                data_generation=[
                    DataGenConfig(DataGenRule.SINE_WAVE, -1, 1, frequency=2.0, amplitude=0.8)
                ]
            ),
            ComponentConfig(
                name="多通道图表",
                component_type=ComponentType.MULTIPLOT,
                enabled=True,
                frequency=25.0,
                data_generation=[
                    DataGenConfig(DataGenRule.SINE_WAVE, -1, 1, frequency=1.0),
                    DataGenConfig(DataGenRule.COSINE_WAVE, -1, 1, frequency=1.5),
                    DataGenConfig(DataGenRule.SQUARE_WAVE, -1, 1, frequency=0.5)
                ]
            ),
            ComponentConfig(
                name="频谱分析",
                component_type=ComponentType.FFT_PLOT,
                enabled=True,
                frequency=100.0,
                data_generation=[
                    DataGenConfig(DataGenRule.CUSTOM_FUNCTION, -2, 2, 
                                custom_function="sin(2*pi*5*t) + 0.5*sin(2*pi*15*t) + 0.2*sin(2*pi*30*t)")
                ]
            ),
            
            # === Serial-Studio 示例配置 ===
            
            ComponentConfig(
                name="多通道ADC (HexadecimalADC示例)",
                component_type=ComponentType.MULTIPLOT,
                enabled=False,
                frequency=200.0,
                data_generation=[
                    # 6通道ADC数据，0-5V范围
                    DataGenConfig(DataGenRule.SINE_WAVE, 0, 5, frequency=1.0, amplitude=2.5),     # ADC0
                    DataGenConfig(DataGenRule.SINE_WAVE, 0, 5, frequency=2.0, amplitude=2.5),     # ADC1
                    DataGenConfig(DataGenRule.SINE_WAVE, 0, 5, frequency=3.0, amplitude=2.5),     # ADC2
                    DataGenConfig(DataGenRule.SQUARE_WAVE, 0, 5, frequency=0.5),                   # ADC3
                    DataGenConfig(DataGenRule.TRIANGLE_WAVE, 0, 5, frequency=1.5),                 # ADC4
                    DataGenConfig(DataGenRule.NOISE, 0, 5, noise_level=0.5)                        # ADC5
                ]
            ),
            ComponentConfig(
                name="洛伦兹吸引子 (LorenzAttractor示例)",
                component_type=ComponentType.PLOT_3D,
                enabled=False,
                frequency=50.0,
                data_generation=[
                    # 洛伦兹吸引子的X,Y,Z坐标
                    DataGenConfig(DataGenRule.SINE_WAVE, -20, 20, frequency=0.1, amplitude=15),    # X
                    DataGenConfig(DataGenRule.COSINE_WAVE, -30, 30, frequency=0.12, amplitude=20), # Y
                    DataGenConfig(DataGenRule.SINE_WAVE, 0, 50, frequency=0.08, amplitude=25)      # Z
                ]
            ),
            ComponentConfig(
                name="心率传感器 (PulseSensor示例)",
                component_type=ComponentType.PLOT,
                enabled=False,
                frequency=100.0,
                data_generation=[
                    # 心率波形数据，模拟ECG信号
                    DataGenConfig(DataGenRule.CUSTOM_FUNCTION, -1, 3, 
                                custom_function="abs(sin(2*pi*1.2*t)) * (1 + 0.3*sin(2*pi*0.2*t))")
                ]
            ),
            ComponentConfig(
                name="LTE信号质量 (LTE modem示例)",
                component_type=ComponentType.DATA_GRID,
                enabled=False,
                frequency=2.0,
                data_generation=[
                    # LTE信号质量参数
                    DataGenConfig(DataGenRule.RANDOM, 100000, 999999),     # Cell ID
                    DataGenConfig(DataGenRule.NOISE, -15, -5, noise_level=2),      # RSRQ (dB)
                    DataGenConfig(DataGenRule.NOISE, -90, -70, noise_level=5),     # RSRP (dBm)
                    DataGenConfig(DataGenRule.NOISE, -80, -50, noise_level=3),     # RSSI (dBm)
                    DataGenConfig(DataGenRule.NOISE, -10, 25, noise_level=5)       # SINR (dB)
                ]
            ),
            ComponentConfig(
                name="函数发生器 (UDP Function Generator示例)",
                component_type=ComponentType.MULTIPLOT,
                enabled=False,
                frequency=1000.0,
                data_generation=[
                    # 多种波形
                    DataGenConfig(DataGenRule.SINE_WAVE, -1, 1, frequency=5.0),        # 正弦波
                    DataGenConfig(DataGenRule.TRIANGLE_WAVE, -1, 1, frequency=3.0),    # 三角波
                    DataGenConfig(DataGenRule.SAWTOOTH_WAVE, -1, 1, frequency=2.0),    # 锯齿波
                    DataGenConfig(DataGenRule.SQUARE_WAVE, -1, 1, frequency=1.5)       # 方波
                ]
            ),
            ComponentConfig(
                name="蓝牙电池电量 (BLE Battery示例)",
                component_type=ComponentType.GAUGE,
                enabled=False,
                frequency=0.5,
                data_generation=[
                    # 电池电量百分比，模拟放电过程
                    DataGenConfig(DataGenRule.LINEAR_DECREASE, 100, 20, step_size=0.2)
                ]
            ),
            ComponentConfig(
                name="氢原子轨道 (Hydrogen示例)",
                component_type=ComponentType.MULTIPLOT,
                enabled=False,
                frequency=100.0,
                data_generation=[
                    # 氢原子1s轨道的X,Y,Z坐标和概率密度（4个字段）
                    DataGenConfig(DataGenRule.NOISE, -5, 5, noise_level=2.0),         # X (a₀)
                    DataGenConfig(DataGenRule.NOISE, -5, 5, noise_level=2.0),         # Y (a₀)
                    DataGenConfig(DataGenRule.NOISE, -5, 5, noise_level=2.0),         # Z (a₀)
                    DataGenConfig(DataGenRule.EXPONENTIAL, 0, 0.4)                    # ψ² 概率密度
                ]
            )
        ]