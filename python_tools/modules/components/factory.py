"""
组件数据生成器工厂

提供统一的组件生成器创建和管理接口。
"""

from typing import Dict, Type
from ..config.data_types import ComponentType, ComponentConfig
from .base import BaseComponentGenerator, DataGenerator
from .motion_sensors import AccelerometerGenerator, GyroscopeGenerator, CompassGenerator
from .measurement_displays import GaugeGenerator, BarGenerator, LEDPanelGenerator
from .plot_charts import PlotGenerator, MultiPlotGenerator, FFTPlotGenerator, Plot3DGenerator
from .geo_data import GPSGenerator, DataGridGenerator, TerminalGenerator

class ComponentGeneratorFactory:
    """组件数据生成器工厂"""
    
    def __init__(self):
        self.data_generator = DataGenerator()
        self.generators: Dict[ComponentType, BaseComponentGenerator] = {}
        self._generator_classes: Dict[ComponentType, Type[BaseComponentGenerator]] = {
            ComponentType.ACCELEROMETER: AccelerometerGenerator,
            ComponentType.GYROSCOPE: GyroscopeGenerator,
            ComponentType.COMPASS: CompassGenerator,
            ComponentType.GAUGE: GaugeGenerator,
            ComponentType.BAR: BarGenerator,
            ComponentType.LED_PANEL: LEDPanelGenerator,
            ComponentType.PLOT: PlotGenerator,
            ComponentType.MULTIPLOT: MultiPlotGenerator,
            ComponentType.FFT_PLOT: FFTPlotGenerator,
            ComponentType.PLOT_3D: Plot3DGenerator,
            ComponentType.GPS: GPSGenerator,
            ComponentType.DATA_GRID: DataGridGenerator,
            ComponentType.TERMINAL: TerminalGenerator
        }
        
        self._init_generators()
    
    def _init_generators(self):
        """初始化所有生成器实例"""
        for component_type, generator_class in self._generator_classes.items():
            self.generators[component_type] = generator_class(self.data_generator)
    
    def get_generator(self, component_type: ComponentType) -> BaseComponentGenerator:
        """获取指定类型的组件生成器"""
        if component_type not in self.generators:
            raise ValueError(f"不支持的组件类型: {component_type}")
        return self.generators[component_type]
    
    def generate_component_data(self, config: ComponentConfig) -> str:
        """生成指定组件的数据"""
        generator = self.get_generator(config.component_type)
        return generator.generate_data(config)
    
    def step(self):
        """全局时间步进"""
        self.data_generator.step()
        for generator in self.generators.values():
            generator.step()
    
    def get_supported_components(self) -> list:
        """获取支持的组件类型列表"""
        return list(self._generator_classes.keys())
    
    def get_component_info(self, component_type: ComponentType) -> dict:
        """获取组件信息"""
        generator = self.get_generator(component_type)
        return {
            'name': generator.component_state.get('name', component_type.value),
            'data_count': generator.component_state.get('data_count', 1),
            'default_ranges': generator.component_state.get('default_ranges', [(0, 100)]),
            'component_type': component_type
        }