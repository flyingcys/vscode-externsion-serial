"""
地理和数据组件数据生成器

包含GPS地图、数据网格和终端显示的数据生成器。
"""

import time
import random
from datetime import datetime
from ..config.data_types import ComponentConfig
from .base import BaseComponentGenerator

class GPSGenerator(BaseComponentGenerator):
    """GPS地图数据生成器"""
    
    def _init_state(self):
        """初始化GPS状态"""
        self.component_state = {
            'name': 'gps',
            'data_count': 3,
            'lat': 39.9042,  # 北京天安门
            'lon': 116.4074,
            'alt': 50.0,
            'default_ranges': [(39.85, 40.05), (116.2, 116.6), (30, 100)]
        }
    
    def generate_data(self, config: ComponentConfig) -> str:
        """生成GPS数据 (Latitude, Longitude, Altitude)"""
        if len(config.data_generation) >= 3:
            lat_delta = self.data_generator.generate_value(config.data_generation[0]) - 50  # 中心化
            lon_delta = self.data_generator.generate_value(config.data_generation[1]) - 50
            alt_delta = self.data_generator.generate_value(config.data_generation[2]) - 50
            
            self.component_state['lat'] += lat_delta * 0.0001  # 小幅度移动
            self.component_state['lon'] += lon_delta * 0.0001
            self.component_state['alt'] += alt_delta * 0.1
        else:
            # 默认小幅度漂移
            self.component_state['lat'] += random.uniform(-0.0001, 0.0001)
            self.component_state['lon'] += random.uniform(-0.0001, 0.0001)
            self.component_state['alt'] += random.uniform(-0.5, 0.5)
        
        # 限制范围
        self.component_state['lat'] = max(-90, min(90, self.component_state['lat']))
        self.component_state['lon'] = max(-180, min(180, self.component_state['lon']))
        self.component_state['alt'] = max(-500, min(10000, self.component_state['alt']))
        
        return f"{self.component_state['lat']:.6f},{self.component_state['lon']:.6f},{self.component_state['alt']:.1f}"

class DataGridGenerator(BaseComponentGenerator):
    """数据网格数据生成器"""
    
    def _init_state(self):
        """初始化数据网格状态"""
        self.component_state = {
            'name': 'data_grid',
            'data_count': 'variable',
            'row_counter': 0,
            'default_ranges': [(0, 100)]
        }
    
    def generate_data(self, config: ComponentConfig) -> str:
        """生成数据网格数据"""
        # 数据网格通常显示多个数值
        field_count = len(config.data_generation) if config.data_generation else 5
        values = []
        
        for i in range(field_count):
            if i < len(config.data_generation):
                value = self.data_generator.generate_value(config.data_generation[i])
            else:
                # 默认模拟不同类型的传感器数据
                if i == 0:  # 温度
                    value = random.uniform(20, 35)
                elif i == 1:  # 湿度
                    value = random.uniform(40, 80)
                elif i == 2:  # 压力
                    value = random.uniform(990, 1020)
                elif i == 3:  # 电压
                    value = random.uniform(3.0, 5.0)
                else:  # 通用数值
                    value = random.uniform(0, 100)
            
            values.append(f"{value:.2f}")
        
        self.component_state['row_counter'] += 1
        return ','.join(values)

class TerminalGenerator(BaseComponentGenerator):
    """终端显示数据生成器"""
    
    def _init_state(self):
        """初始化终端状态"""
        self.component_state = {
            'name': 'terminal',
            'data_count': 1,
            'message_counter': 0,
            'messages': [
                "System initialized",
                "Sensors connected", 
                "Data transmission started",
                "Normal operation",
                "Warning: High temperature",
                "Error: Connection lost",
                "Reconnecting...",
                "Connection restored"
            ]
        }
    
    def generate_data(self, config: ComponentConfig) -> str:
        """生成终端数据"""
        # 选择一个消息
        msg_index = self.component_state['message_counter'] % len(self.component_state['messages'])
        message = self.component_state['messages'][msg_index]
        
        # 添加时间戳
        timestamp = datetime.now().strftime("%H:%M:%S")
        terminal_data = f"[{timestamp}] {message}"
        
        self.component_state['message_counter'] += 1
        
        # Terminal数据通常是文本，需要特殊处理
        return terminal_data