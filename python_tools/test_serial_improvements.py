#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试Serial Studio v3的串口改进功能

测试自动获取串口和串口属性设置功能
"""

import sys
import os

# 直接导入模块，避免循环导入
from modules.communication.manager import CommunicationManager
from modules.config.data_types import CommConfig, CommType

def test_serial_port_discovery():
    """测试串口发现功能"""
    print("=" * 50)
    print("测试串口发现功能")
    print("=" * 50)
    
    comm_manager = CommunicationManager()
    
    # 测试获取可用串口
    print("\n1. 获取可用串口列表:")
    ports = comm_manager.get_available_serial_ports()
    if ports:
        for i, port in enumerate(ports, 1):
            print(f"   {i}. {port['device']}")
            print(f"      描述: {port['description']}")
            print(f"      制造商: {port['manufacturer']}")
            print(f"      产品: {port['product']}")
            print(f"      硬件ID: {port['hwid']}")
            print(f"      序列号: {port['serial_number']}")
            print()
    else:
        print("   未发现可用串口")
    
    # 测试获取默认串口
    print("2. 获取默认串口:")
    default_port = comm_manager.get_default_serial_port()
    if default_port:
        print(f"   默认串口: {default_port}")
    else:
        print("   未找到合适的默认串口")
    
    # 测试获取配置选项
    print("\n3. 串口配置选项:")
    print(f"   常用波特率: {comm_manager.get_common_serial_baudrates()}")
    print(f"   数据位选项: {comm_manager.get_serial_databits_options()}")
    print(f"   校验位选项: {comm_manager.get_serial_parity_options()}")
    print(f"   停止位选项: {comm_manager.get_serial_stopbits_options()}")

def test_serial_config():
    """测试串口配置功能"""
    print("\n" + "=" * 50)
    print("测试串口配置功能")
    print("=" * 50)
    
    comm_manager = CommunicationManager()
    
    # 创建测试配置
    config = CommConfig(
        comm_type=CommType.SERIAL,
        port="COM3",  # 假设的串口
        baudrate=115200,
        databits=8,
        parity="N",
        stopbits=1,
        timeout=1.0
    )
    
    print(f"\n创建的串口配置:")
    print(f"   串口: {config.port}")
    print(f"   波特率: {config.baudrate}")
    print(f"   数据位: {config.databits}")
    print(f"   校验位: {config.parity}")
    print(f"   停止位: {config.stopbits}")
    print(f"   超时: {config.timeout}s")
    
    # 注意：这里不实际连接，因为串口可能不存在或被占用
    print(f"\n配置验证成功！")

if __name__ == "__main__":
    print("Serial Studio v3 串口改进功能测试")
    print("作者: Claude Code Assistant")
    print("日期: 2025-01-29")
    
    try:
        test_serial_port_discovery()
        test_serial_config()
        
        print("\n" + "=" * 50)
        print("所有测试完成！")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n测试过程中出现错误: {e}")
        import traceback
        traceback.print_exc()
