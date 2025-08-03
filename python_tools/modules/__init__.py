"""
Serial Studio 测试工具模块包

提供模块化的组件数据生成器、通讯管理和配置管理功能。
"""

from .config.data_types import (
    ComponentType,
    CommType, 
    DataGenRule,
    DataGenConfig,
    ComponentConfig,
    CommConfig
)

from .config.defaults import DefaultConfigs
from .communication.manager import CommunicationManager
from .components.base import BaseComponentGenerator
from .components.factory import ComponentGeneratorFactory

__version__ = "2.1.0"
__author__ = "Claude Code Assistant"

__all__ = [
    'ComponentType',
    'CommType',
    'DataGenRule', 
    'DataGenConfig',
    'ComponentConfig',
    'CommConfig',
    'DefaultConfigs',
    'CommunicationManager',
    'BaseComponentGenerator',
    'ComponentGeneratorFactory'
]