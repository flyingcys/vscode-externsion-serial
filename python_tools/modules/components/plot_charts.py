"""
图表绘制组件数据生成器

包含单线图、多线图、FFT频谱图和3D图表的数据生成器。
"""

import time
import math
import random
from ..config.data_types import ComponentConfig
from .base import BaseComponentGenerator

class PlotGenerator(BaseComponentGenerator):
    """单线图数据生成器"""
    
    def _init_state(self):
        """初始化单线图状态"""
        self.component_state = {
            'name': 'plot',
            'data_count': 1,
            'default_ranges': [(-2, 2)]
        }
    
    def generate_data(self, config: ComponentConfig) -> str:
        """生成单线图数据"""
        if len(config.data_generation) >= 1:
            value = self.data_generator.generate_value(config.data_generation[0])
        else:
            # 默认正弦波
            t = time.time() - self.data_generator.start_time
            value = math.sin(2 * math.pi * 0.5 * t)
        
        return f"{value:.4f}"

class MultiPlotGenerator(BaseComponentGenerator):
    """多线图数据生成器"""
    
    def _init_state(self):
        """初始化多线图状态"""
        self.component_state = {
            'name': 'multiplot',
            'data_count': 'variable',
            'default_ranges': [(-2, 2)]
        }
    
    def generate_data(self, config: ComponentConfig) -> str:
        """生成多线图数据"""
        channel_count = len(config.data_generation) if config.data_generation else 3
        values = []
        
        for i in range(channel_count):
            if i < len(config.data_generation):
                value = self.data_generator.generate_value(config.data_generation[i])
            else:
                # 默认不同频率的正弦波
                t = time.time() - self.data_generator.start_time
                freq = 0.5 + i * 0.3
                phase = i * math.pi / 4
                value = math.sin(2 * math.pi * freq * t + phase)
            
            values.append(f"{value:.4f}")
        
        return ','.join(values)

class FFTPlotGenerator(BaseComponentGenerator):
    """FFT频谱图数据生成器"""
    
    def _init_state(self):
        """初始化FFT频谱图状态"""
        self.component_state = {
            'name': 'fft_plot',
            'data_count': 1,
            'default_ranges': [(-2, 2)]
        }
    
    def generate_data(self, config: ComponentConfig) -> str:
        """生成FFT图数据（时域信号）"""
        if len(config.data_generation) >= 1:
            value = self.data_generator.generate_value(config.data_generation[0])
        else:
            # 默认多频率混合信号
            t = time.time() - self.data_generator.start_time
            freqs = [1, 5, 10]  # Hz
            amps = [1, 0.5, 0.3]
            signal = 0
            for freq, amp in zip(freqs, amps):
                signal += amp * math.sin(2 * math.pi * freq * t)
            
            # 添加噪声
            signal += random.gauss(0, 0.1)
            value = signal
        
        return f"{value:.4f}"

class Plot3DGenerator(BaseComponentGenerator):
    """3D图表数据生成器"""
    
    def _init_state(self):
        """初始化3D图表状态"""
        self.component_state = {
            'name': 'plot_3d',
            'data_count': 3,
            'default_ranges': [(-5, 5), (-5, 5), (-5, 5)]
        }
    
    def generate_data(self, config: ComponentConfig) -> str:
        """生成3D图数据 (X, Y, Z)"""
        if len(config.data_generation) >= 3:
            x = self.data_generator.generate_value(config.data_generation[0])
            y = self.data_generator.generate_value(config.data_generation[1])
            z = self.data_generator.generate_value(config.data_generation[2])
        else:
            # 默认3D螺旋
            t = time.time() - self.data_generator.start_time
            x = math.cos(t) * (1 + 0.1 * t)
            y = math.sin(t) * (1 + 0.1 * t)
            z = 0.1 * t
        
        return f"{x:.3f},{y:.3f},{z:.3f}"