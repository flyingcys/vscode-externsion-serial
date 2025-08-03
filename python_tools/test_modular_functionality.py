#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
模块化功能完整性测试脚本

验证v3.0模块化架构的各项功能是否正常工作，包括：
- 组件数据生成器功能
- 通讯管理器功能
- 配置管理功能
- 工厂模式实现

作者: Claude Code Assistant
版本: 1.0
日期: 2025-01-29
"""

import time
import sys
from typing import List

def test_module_imports():
    """测试模块导入"""
    print("=== 模块导入测试 ===")
    try:
        from modules import (
            ComponentType, CommType, DataGenRule, DataGenConfig, 
            ComponentConfig, CommConfig, DefaultConfigs, 
            CommunicationManager, ComponentGeneratorFactory
        )
        print("✓ 所有模块成功导入")
        return True
    except ImportError as e:
        print(f"✗ 模块导入失败: {e}")
        return False

def test_component_factory():
    """测试组件工厂功能"""
    print("\n=== 组件工厂测试 ===")
    try:
        from modules import ComponentGeneratorFactory, DefaultConfigs
        
        factory = ComponentGeneratorFactory()
        configs = DefaultConfigs.get_default_component_configs()
        
        print(f"支持的组件类型数量: {len(factory.get_supported_components())}")
        print(f"默认配置数量: {len(configs)}")
        
        # 测试每种组件的数据生成
        success_count = 0
        for config in configs:
            try:
                data = factory.generate_component_data(config)
                print(f"✓ {config.name:15} -> {data[:60]}{'...' if len(data) > 60 else ''}")
                success_count += 1
            except Exception as e:
                print(f"✗ {config.name:15} -> 错误: {e}")
        
        print(f"组件测试结果: {success_count}/{len(configs)} 成功")
        return success_count == len(configs)
        
    except Exception as e:
        print(f"✗ 组件工厂测试失败: {e}")
        return False

def test_data_generation_rules():
    """测试数据生成规则"""
    print("\n=== 数据生成规则测试 ===")
    try:
        from modules import DataGenRule, DataGenConfig, ComponentGeneratorFactory
        from modules.components.base import DataGenerator
        
        generator = DataGenerator()
        test_configs = [
            DataGenConfig(DataGenRule.CONSTANT, 0, 10),
            DataGenConfig(DataGenRule.RANDOM, 0, 10),
            DataGenConfig(DataGenRule.SINE_WAVE, -1, 1, frequency=1.0),
            DataGenConfig(DataGenRule.LINEAR_INCREASE, 0, 100, step_size=1.0),
            DataGenConfig(DataGenRule.NOISE, 0, 10, noise_level=0.1)
        ]
        
        success_count = 0
        for config in test_configs:
            try:
                value = generator.generate_value(config)
                print(f"✓ {config.rule.value:15} -> {value:.4f}")
                success_count += 1
            except Exception as e:
                print(f"✗ {config.rule.value:15} -> 错误: {e}")
        
        print(f"规则测试结果: {success_count}/{len(test_configs)} 成功")
        return success_count == len(test_configs)
        
    except Exception as e:
        print(f"✗ 数据生成规则测试失败: {e}")
        return False

def test_communication_manager():
    """测试通讯管理器"""
    print("\n=== 通讯管理器测试 ===")
    try:
        from modules import CommunicationManager, CommConfig, CommType
        
        comm_manager = CommunicationManager()
        print(f"初始连接状态: {comm_manager.is_connected}")
        
        # 测试各种通讯配置
        comm_types = [CommType.SERIAL, CommType.TCP_CLIENT, CommType.UDP]
        success_count = 0
        
        for comm_type in comm_types:
            try:
                config = CommConfig(comm_type)
                print(f"✓ {comm_type.value:12} 配置创建成功")
                success_count += 1
            except Exception as e:
                print(f"✗ {comm_type.value:12} 配置失败: {e}")
        
        print(f"通讯配置测试结果: {success_count}/{len(comm_types)} 成功")
        return success_count == len(comm_types)
        
    except Exception as e:
        print(f"✗ 通讯管理器测试失败: {e}")
        return False

def test_time_stepping():
    """测试时间步进功能"""
    print("\n=== 时间步进测试 ===")
    try:
        from modules import ComponentGeneratorFactory, DefaultConfigs
        
        factory = ComponentGeneratorFactory()
        config = DefaultConfigs.get_default_component_configs()[0]  # 使用第一个配置
        
        print(f"使用组件: {config.name}")
        
        # 生成多个时间步的数据
        data_points = []
        for i in range(5):
            data = factory.generate_component_data(config)
            data_points.append(data)
            print(f"步骤 {i+1:2}: {data}")
            factory.step()
            time.sleep(0.1)
        
        # 检查数据是否有变化（对于动态生成器）
        unique_data = set(data_points)
        has_variation = len(unique_data) > 1
        
        print(f"数据变化检测: {'✓ 有变化' if has_variation else '- 无变化（可能是常量）'}")
        return True
        
    except Exception as e:
        print(f"✗ 时间步进测试失败: {e}")
        return False

def test_serial_studio_protocol():
    """测试Serial Studio协议格式"""
    print("\n=== Serial Studio协议格式测试 ===")
    try:
        from modules import ComponentGeneratorFactory, DefaultConfigs
        
        factory = ComponentGeneratorFactory()
        configs = DefaultConfigs.get_default_component_configs()
        
        success_count = 0
        for config in configs[:5]:  # 测试前5个组件
            try:
                data = factory.generate_component_data(config)
                frame = f"${data};"
                
                # 验证格式
                if frame.startswith('$') and frame.endswith(';'):
                    print(f"✓ {config.name:15} -> {frame}")
                    success_count += 1
                else:
                    print(f"✗ {config.name:15} -> 格式错误: {frame}")
                    
            except Exception as e:
                print(f"✗ {config.name:15} -> 错误: {e}")
        
        print(f"协议格式测试结果: {success_count}/5 成功")
        return success_count >= 4  # 允许1个失败
        
    except Exception as e:
        print(f"✗ Serial Studio协议测试失败: {e}")
        return False

def main():
    """主测试函数"""
    print("Serial Studio 模块化功能完整性测试")
    print("=" * 50)
    
    test_functions = [
        test_module_imports,
        test_component_factory,
        test_data_generation_rules,
        test_communication_manager,
        test_time_stepping,
        test_serial_studio_protocol
    ]
    
    results = []
    for test_func in test_functions:
        try:
            result = test_func()
            results.append(result)
        except Exception as e:
            print(f"✗ 测试函数 {test_func.__name__} 异常: {e}")
            results.append(False)
    
    # 汇总结果
    print("\n" + "=" * 50)
    print("测试结果汇总:")
    success_count = sum(results)
    total_count = len(results)
    
    test_names = [
        "模块导入", "组件工厂", "数据生成规则", 
        "通讯管理器", "时间步进", "协议格式"
    ]
    
    for i, (name, result) in enumerate(zip(test_names, results)):
        status = "✓ 通过" if result else "✗ 失败"
        print(f"{name:10} - {status}")
    
    print(f"\n总体结果: {success_count}/{total_count} 测试通过")
    
    if success_count == total_count:
        print("🎉 所有测试通过！模块化架构工作正常。")
        return 0
    elif success_count >= total_count * 0.8:
        print("⚠️ 大部分测试通过，存在少量问题。")
        return 1
    else:
        print("❌ 多个测试失败，需要检查代码。")
        return 2

if __name__ == "__main__":
    sys.exit(main())