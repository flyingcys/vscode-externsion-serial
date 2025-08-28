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

class MPU6050Generator(BaseComponentGenerator):
    """MPU6050传感器数据生成器 - 生成完整的加速度计+陀螺仪+温度数据"""
    
    def _init_state(self):
        """初始化MPU6050状态"""
        self.component_state = {
            'name': 'mpu6050',
            'data_count': 7,  # 3个加速度 + 3个陀螺仪 + 1个温度
            'default_ranges': [
                (-2.0, 2.0),    # accel_x (m/s²)
                (-2.0, 2.0),    # accel_y (m/s²)
                (8.0, 11.0),    # accel_z (m/s²) - 包含重力
                (-180, 180),    # gyro_x (deg/s)
                (-90, 90),      # gyro_y (deg/s)
                (-180, 180),    # gyro_z (deg/s)
                (20.0, 35.0)    # temperature (℃)
            ]
        }
    
    def generate_data(self, config: ComponentConfig) -> str:
        """生成MPU6050数据 - 按照Serial-Studio MPU6050.json格式
        
        数据格式: accel_x,accel_y,accel_z,gyro_x,gyro_y,gyro_z,temperature
        对应索引: 1,2,3,4,5,6,7
        """
        if len(config.data_generation) >= 7:
            # 使用配置的数据生成规则
            accel_x = self.data_generator.generate_value(config.data_generation[0])
            accel_y = self.data_generator.generate_value(config.data_generation[1])
            accel_z = self.data_generator.generate_value(config.data_generation[2])
            gyro_x = self.data_generator.generate_value(config.data_generation[3])
            gyro_y = self.data_generator.generate_value(config.data_generation[4])
            gyro_z = self.data_generator.generate_value(config.data_generation[5])
            temp = self.data_generator.generate_value(config.data_generation[6])
        else:
            # 使用默认的模拟数据
            # 加速度数据 (m/s²) - 模拟真实的MPU6050传感器
            accel_x = random.gauss(0, 0.5)  # X轴加速度，中心为0，标准差0.5
            accel_y = random.gauss(0, 0.5)  # Y轴加速度，中心为0，标准差0.5
            accel_z = random.gauss(9.8, 0.2)  # Z轴加速度，包含重力9.8m/s²，小幅度噪声
            
            # 陀螺仪数据 (deg/s) - 模拟旋转角速度
            gyro_x = random.gauss(0, 5.0)   # X轴角速度
            gyro_y = random.gauss(0, 5.0)   # Y轴角速度  
            gyro_z = random.gauss(0, 10.0)  # Z轴角速度
            
            # 温度数据 (℃) - 模拟芯片温度
            temp = random.uniform(22.0, 28.0)
        
        # 按照Serial-Studio MPU6050示例的精度格式化数据
        return f"{accel_x:.3f},{accel_y:.3f},{accel_z:.3f},{gyro_x:.2f},{gyro_y:.2f},{gyro_z:.2f},{temp:.1f}"