"""
基础组件数据生成器

提供数据生成的基础功能和抽象接口。
"""

import time
import random
import math
from abc import ABC, abstractmethod
from typing import Any, Dict

from ..config.data_types import DataGenConfig, DataGenRule, ComponentConfig

class DataGenerator:
    """通用数据生成器"""
    
    def __init__(self):
        self.time_counter = 0
        self.start_time = time.time()
        
    def generate_value(self, config: DataGenConfig) -> float:
        """根据配置生成单个数值"""
        current_time = time.time() - self.start_time
        
        if config.rule == DataGenRule.CONSTANT:
            return config.min_value
            
        elif config.rule == DataGenRule.RANDOM:
            return random.uniform(config.min_value, config.max_value)
            
        elif config.rule == DataGenRule.SINE_WAVE:
            base = config.amplitude * math.sin(
                2 * math.pi * config.frequency * current_time + config.phase
            )
            return base + config.min_value + (config.max_value - config.min_value) / 2
            
        elif config.rule == DataGenRule.COSINE_WAVE:
            base = config.amplitude * math.cos(
                2 * math.pi * config.frequency * current_time + config.phase
            )
            return base + config.min_value + (config.max_value - config.min_value) / 2
            
        elif config.rule == DataGenRule.SQUARE_WAVE:
            sin_val = math.sin(2 * math.pi * config.frequency * current_time + config.phase)
            base = config.amplitude if sin_val > 0 else -config.amplitude
            return base + config.min_value + (config.max_value - config.min_value) / 2
            
        elif config.rule == DataGenRule.SAWTOOTH_WAVE:
            t = (config.frequency * current_time + config.phase / (2 * math.pi)) % 1
            base = config.amplitude * (2 * t - 1)
            return base + config.min_value + (config.max_value - config.min_value) / 2
            
        elif config.rule == DataGenRule.TRIANGLE_WAVE:
            t = (config.frequency * current_time + config.phase / (2 * math.pi)) % 1
            if t < 0.5:
                base = config.amplitude * (4 * t - 1)
            else:
                base = config.amplitude * (3 - 4 * t)
            return base + config.min_value + (config.max_value - config.min_value) / 2
            
        elif config.rule == DataGenRule.LINEAR_INCREASE:
            base = config.step_size * current_time
            return min(config.max_value, config.min_value + base)
            
        elif config.rule == DataGenRule.LINEAR_DECREASE:
            base = config.step_size * current_time
            return max(config.min_value, config.max_value - base)
            
        elif config.rule == DataGenRule.EXPONENTIAL:
            try:
                base = math.exp(config.frequency * current_time)
                normalized = base / (1 + base)  # 归一化到[0,1]
                return config.min_value + normalized * (config.max_value - config.min_value)
            except OverflowError:
                return config.max_value
                
        elif config.rule == DataGenRule.LOGARITHMIC:
            base = math.log(1 + config.frequency * current_time)
            max_log = math.log(1 + config.frequency * 100)  # 假设100秒的最大值
            normalized = min(1.0, base / max_log)
            return config.min_value + normalized * (config.max_value - config.min_value)
            
        elif config.rule == DataGenRule.NOISE:
            return random.gauss(
                (config.min_value + config.max_value) / 2,
                config.noise_level * (config.max_value - config.min_value) / 6
            )
            
        elif config.rule == DataGenRule.CUSTOM_FUNCTION:
            if config.custom_function:
                try:
                    # 安全执行自定义函数
                    safe_globals = {
                        'math': math,
                        'random': random,
                        'time': current_time,
                        't': current_time,
                        'sin': math.sin,
                        'cos': math.cos,
                        'tan': math.tan,
                        'exp': math.exp,
                        'log': math.log,
                        'sqrt': math.sqrt,
                        'pi': math.pi,
                        'e': math.e
                    }
                    result = eval(config.custom_function, safe_globals, {})
                    return float(result)
                except:
                    return config.min_value
            return config.min_value
            
        else:
            return config.min_value
    
    def step(self):
        """时间步进"""
        self.time_counter += 1

class BaseComponentGenerator(ABC):
    """基础组件数据生成器抽象类"""
    
    def __init__(self, data_generator: DataGenerator):
        self.data_generator = data_generator
        self.component_state = {}
        self._init_state()
    
    @abstractmethod
    def _init_state(self):
        """初始化组件状态"""
        pass
    
    @abstractmethod
    def generate_data(self, config: ComponentConfig) -> str:
        """生成组件数据"""
        pass
    
    def step(self):
        """时间步进"""
        self.data_generator.step()