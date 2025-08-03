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
                name="三轴加速度计",
                component_type=ComponentType.ACCELEROMETER,
                enabled=True,
                frequency=20.0,
                data_generation=[
                    DataGenConfig(DataGenRule.NOISE, -2.0, 2.0, noise_level=0.1),
                    DataGenConfig(DataGenRule.NOISE, -2.0, 2.0, noise_level=0.1),
                    DataGenConfig(DataGenRule.NOISE, 8.0, 11.0, noise_level=0.2)
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
            )
        ]