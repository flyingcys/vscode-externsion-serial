"""
测量显示组件数据生成器

包含仪表盘、条形图和LED面板的数据生成器。
"""

import random
from ..config.data_types import ComponentConfig
from .base import BaseComponentGenerator

class GaugeGenerator(BaseComponentGenerator):
    """仪表盘数据生成器"""
    
    def _init_state(self):
        """初始化仪表盘状态"""
        self.component_state = {
            'name': 'gauge',
            'data_count': 1,
            'default_ranges': [(0, 100)]
        }
    
    def generate_data(self, config: ComponentConfig) -> str:
        """生成仪表盘数据"""
        if len(config.data_generation) >= 1:
            value = self.data_generator.generate_value(config.data_generation[0])
        else:
            value = random.uniform(0, 100)
        
        return f"{value:.2f}"

class BarGenerator(BaseComponentGenerator):
    """条形图数据生成器"""
    
    def _init_state(self):
        """初始化条形图状态"""
        self.component_state = {
            'name': 'bar',
            'data_count': 1,
            'default_ranges': [(0, 100)]
        }
    
    def generate_data(self, config: ComponentConfig) -> str:
        """生成条形图数据"""
        if len(config.data_generation) >= 1:
            value = self.data_generator.generate_value(config.data_generation[0])
        else:
            value = random.uniform(0, 100)
        
        return f"{value:.2f}"

class LEDPanelGenerator(BaseComponentGenerator):
    """LED面板数据生成器"""
    
    def _init_state(self):
        """初始化LED面板状态"""
        self.component_state = {
            'name': 'led_panel',
            'data_count': 'variable',
            'led_states': [False] * 16,  # 支持最多16个LED
            'default_ranges': [(0, 1)]
        }
    
    def generate_data(self, config: ComponentConfig) -> str:
        """生成LED面板数据"""
        led_count = len(config.datasets) if config.datasets else 8
        
        # 确保有足够的LED状态
        while len(self.component_state['led_states']) < led_count:
            self.component_state['led_states'].append(False)
        
        # 根据配置更新LED状态
        values = []
        for i in range(led_count):
            if i < len(config.data_generation):
                # 使用配置的生成规则
                raw_value = self.data_generator.generate_value(config.data_generation[i])
                # LED通常用阈值判断开关
                threshold = config.data_generation[i].parameters.get('threshold', 0.5)
                led_on = raw_value > threshold
            else:
                # 随机变化
                led_on = random.random() > 0.7  # 30%概率点亮
            
            self.component_state['led_states'][i] = led_on
            values.append('1' if led_on else '0')
        
        return ','.join(values)