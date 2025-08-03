"""
运动传感器组件数据生成器

包含加速度计、陀螺仪和指南针的数据生成器。
"""

import random
from ..config.data_types import ComponentConfig
from .base import BaseComponentGenerator

class AccelerometerGenerator(BaseComponentGenerator):
    """加速度计数据生成器"""
    
    def _init_state(self):
        """初始化加速度计状态"""
        self.component_state = {
            'name': 'accelerometer',
            'data_count': 3,
            'default_ranges': [(-2.0, 2.0), (-2.0, 2.0), (8.0, 11.0)]
        }
    
    def generate_data(self, config: ComponentConfig) -> str:
        """生成加速度计数据 (X, Y, Z)"""
        if len(config.data_generation) >= 3:
            x = self.data_generator.generate_value(config.data_generation[0])
            y = self.data_generator.generate_value(config.data_generation[1])
            z = self.data_generator.generate_value(config.data_generation[2])
        else:
            # 默认模拟重力+噪声
            x = random.gauss(0, 0.5)
            y = random.gauss(0, 0.5)
            z = random.gauss(9.8, 0.2)
        
        return f"{x:.3f},{y:.3f},{z:.3f}"

class GyroscopeGenerator(BaseComponentGenerator):
    """陀螺仪数据生成器"""
    
    def _init_state(self):
        """初始化陀螺仪状态"""
        self.component_state = {
            'name': 'gyroscope',
            'data_count': 3,
            'default_ranges': [(-180, 180), (-90, 90), (-180, 180)]
        }
    
    def generate_data(self, config: ComponentConfig) -> str:
        """生成陀螺仪数据 (Roll, Pitch, Yaw)"""
        if len(config.data_generation) >= 3:
            roll = self.data_generator.generate_value(config.data_generation[0])
            pitch = self.data_generator.generate_value(config.data_generation[1])
            yaw = self.data_generator.generate_value(config.data_generation[2])
        else:
            # 默认角度范围
            roll = random.uniform(-180, 180)
            pitch = random.uniform(-90, 90)
            yaw = random.uniform(-180, 180)
        
        return f"{roll:.2f},{pitch:.2f},{yaw:.2f}"

class CompassGenerator(BaseComponentGenerator):
    """指南针数据生成器"""
    
    def _init_state(self):
        """初始化指南针状态"""
        self.component_state = {
            'name': 'compass',
            'data_count': 1,
            'default_ranges': [(0, 360)]
        }
    
    def generate_data(self, config: ComponentConfig) -> str:
        """生成指南针数据 (角度)"""
        if len(config.data_generation) >= 1:
            angle = self.data_generator.generate_value(config.data_generation[0])
            angle = angle % 360  # 确保在0-360范围内
        else:
            angle = random.uniform(0, 360)
        
        return f"{angle:.1f}"