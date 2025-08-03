#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Serial Studio 组件数据验证器

用于验证各种可视化组件的数据格式是否符合Serial-Studio规范。
这个脚本可以快速生成标准测试数据，验证数据格式的正确性。

作者: Claude Code Assistant
版本: 1.0
日期: 2025-01-29
"""

import math
import random
import json
from typing import Dict, List, Tuple, Any
from enum import Enum

class ComponentType(Enum):
    ACCELEROMETER = "accelerometer"
    GYROSCOPE = "gyroscope"
    GPS = "gps"
    GAUGE = "gauge"
    BAR = "bar"
    COMPASS = "compass"
    LED_PANEL = "led_panel"
    PLOT = "plot"
    MULTIPLOT = "multiplot"
    FFT_PLOT = "fft_plot"
    PLOT_3D = "plot3d"
    DATA_GRID = "datagrid"
    TERMINAL = "terminal"

class ComponentDataValidator:
    """组件数据验证器"""
    
    def __init__(self):
        self.validation_rules = self._init_validation_rules()
        self.sample_configs = self._init_sample_configs()
    
    def _init_validation_rules(self) -> Dict[ComponentType, Dict]:
        """初始化验证规则"""
        return {
            ComponentType.ACCELEROMETER: {
                "data_count": 3,
                "format": "X,Y,Z",
                "ranges": [(-20, 20), (-20, 20), (-20, 20)],
                "units": ["m/s²", "m/s²", "m/s²"],
                "typical_values": [(0, 2), (0, 2), (8, 12)]
            },
            ComponentType.GYROSCOPE: {
                "data_count": 3,
                "format": "Roll,Pitch,Yaw",
                "ranges": [(-180, 180), (-90, 90), (-180, 180)],
                "units": ["°", "°", "°"],
                "typical_values": [(-45, 45), (-30, 30), (-180, 180)]
            },
            ComponentType.GPS: {
                "data_count": 3,
                "format": "Latitude,Longitude,Altitude",
                "ranges": [(-90, 90), (-180, 180), (-500, 10000)],
                "units": ["°", "°", "m"],
                "typical_values": [(39.85, 40.05), (116.2, 116.6), (30, 100)]
            },
            ComponentType.GAUGE: {
                "data_count": 1,
                "format": "Value",
                "ranges": [(0, 100)],
                "units": [""],
                "typical_values": [(0, 100)]
            },
            ComponentType.BAR: {
                "data_count": 1,
                "format": "Value",
                "ranges": [(0, 100)],
                "units": [""],
                "typical_values": [(0, 100)]
            },
            ComponentType.COMPASS: {
                "data_count": 1,
                "format": "Angle",
                "ranges": [(0, 360)],
                "units": ["°"],
                "typical_values": [(0, 360)]
            },
            ComponentType.LED_PANEL: {
                "data_count": "variable",
                "format": "State1,State2,State3...",
                "ranges": [(0, 1)],
                "units": ["bool"],
                "typical_values": [(0, 1)]
            },
            ComponentType.PLOT: {
                "data_count": 1,
                "format": "Value",
                "ranges": [(-10, 10)],
                "units": [""],
                "typical_values": [(-2, 2)]
            },
            ComponentType.MULTIPLOT: {
                "data_count": "variable",
                "format": "Ch1,Ch2,Ch3...",
                "ranges": [(-10, 10)],
                "units": [""],
                "typical_values": [(-2, 2)]
            },
            ComponentType.FFT_PLOT: {
                "data_count": 1,
                "format": "TimeSignal",
                "ranges": [(-5, 5)],
                "units": [""],
                "typical_values": [(-2, 2)]
            },
            ComponentType.PLOT_3D: {
                "data_count": 3,
                "format": "X,Y,Z",
                "ranges": [(-10, 10), (-10, 10), (-10, 10)],
                "units": ["", "", ""],
                "typical_values": [(-5, 5), (-5, 5), (-5, 5)]
            },
            ComponentType.DATA_GRID: {
                "data_count": "variable",
                "format": "Field1,Field2,Field3...",
                "ranges": [(0, 100)],
                "units": [""],
                "typical_values": [(0, 100)]
            },
            ComponentType.TERMINAL: {
                "data_count": 1,
                "format": "TextMessage",
                "ranges": [None],
                "units": ["text"],
                "typical_values": [None]
            }
        }
    
    def _init_sample_configs(self) -> Dict[ComponentType, Dict]:
        """初始化示例配置"""
        return {
            ComponentType.ACCELEROMETER: {
                "title": "IMU Accelerometer",
                "widget": "accelerometer",
                "datasets": [
                    {"title": "Accel X", "units": "m/s²", "widget": "x", "index": 1, "graph": True},
                    {"title": "Accel Y", "units": "m/s²", "widget": "y", "index": 2, "graph": True},
                    {"title": "Accel Z", "units": "m/s²", "widget": "z", "index": 3, "graph": True}
                ]
            },
            ComponentType.GYROSCOPE: {
                "title": "IMU Gyroscope",
                "widget": "gyroscope",
                "datasets": [
                    {"title": "Gyro Roll", "units": "°/s", "widget": "x", "index": 1, "graph": True},
                    {"title": "Gyro Pitch", "units": "°/s", "widget": "y", "index": 2, "graph": True},
                    {"title": "Gyro Yaw", "units": "°/s", "widget": "z", "index": 3, "graph": True}
                ]
            },
            ComponentType.GPS: {
                "title": "GPS Tracker",
                "widget": "map",
                "datasets": [
                    {"title": "Latitude", "units": "°", "widget": "lat", "index": 1, "graph": False},
                    {"title": "Longitude", "units": "°", "widget": "lon", "index": 2, "graph": False},
                    {"title": "Altitude", "units": "m", "widget": "alt", "index": 3, "graph": False}
                ]
            },
            ComponentType.GAUGE: {
                "title": "Temperature Gauge",
                "widget": "gauge",
                "datasets": [
                    {"title": "Temperature", "units": "°C", "widget": "gauge", "index": 1, "min": -20, "max": 100, "alarm": 80}
                ]
            },
            ComponentType.BAR: {
                "title": "Battery Level",
                "widget": "bar",
                "datasets": [
                    {"title": "Battery", "units": "%", "widget": "bar", "index": 1, "min": 0, "max": 100, "alarm": 15}
                ]
            },
            ComponentType.COMPASS: {
                "title": "Compass Direction",
                "widget": "compass",
                "datasets": [
                    {"title": "Heading", "units": "°", "widget": "compass", "index": 1}
                ]
            },
            ComponentType.LED_PANEL: {
                "title": "System Status LEDs",
                "datasets": [
                    {"title": "Power", "widget": "led", "led": True, "ledHigh": 1, "index": 1},
                    {"title": "Network", "widget": "led", "led": True, "ledHigh": 1, "index": 2},
                    {"title": "Data", "widget": "led", "led": True, "ledHigh": 1, "index": 3},
                    {"title": "Error", "widget": "led", "led": True, "ledHigh": 1, "index": 4}
                ]
            },
            ComponentType.PLOT: {
                "title": "Signal Plot",
                "datasets": [
                    {"title": "Signal", "units": "V", "widget": "plot", "index": 1, "graph": True}
                ]
            },
            ComponentType.MULTIPLOT: {
                "title": "Multi-Channel Plot",
                "widget": "multiplot",
                "datasets": [
                    {"title": "Channel 1", "units": "V", "index": 1, "graph": True},
                    {"title": "Channel 2", "units": "V", "index": 2, "graph": True},
                    {"title": "Channel 3", "units": "V", "index": 3, "graph": True}
                ]
            },
            ComponentType.FFT_PLOT: {
                "title": "FFT Spectrum",
                "datasets": [
                    {"title": "Signal", "units": "V", "widget": "fft", "fft": True, "index": 1}
                ]
            },
            ComponentType.PLOT_3D: {
                "title": "3D Point Cloud",
                "widget": "plot3d",
                "datasets": [
                    {"title": "X", "units": "", "index": 1},
                    {"title": "Y", "units": "", "index": 2},
                    {"title": "Z", "units": "", "index": 3}
                ]
            },
            ComponentType.DATA_GRID: {
                "title": "Sensor Data Grid",
                "widget": "datagrid",
                "datasets": [
                    {"title": "Temperature", "units": "°C", "index": 1},
                    {"title": "Humidity", "units": "%", "index": 2},
                    {"title": "Pressure", "units": "hPa", "index": 3},
                    {"title": "Voltage", "units": "V", "index": 4}
                ]
            },
            ComponentType.TERMINAL: {
                "title": "System Terminal",
                "widget": "terminal",
                "datasets": [
                    {"title": "Messages", "index": 1}
                ]
            }
        }
    
    def generate_test_data(self, component_type: ComponentType, count: int = 10) -> List[str]:
        """生成测试数据"""
        test_data = []
        rules = self.validation_rules[component_type]
        
        for i in range(count):
            if component_type == ComponentType.ACCELEROMETER:
                data = self._generate_accelerometer_data(i)
            elif component_type == ComponentType.GYROSCOPE:
                data = self._generate_gyroscope_data(i)
            elif component_type == ComponentType.GPS:
                data = self._generate_gps_data(i)
            elif component_type == ComponentType.GAUGE:
                data = self._generate_gauge_data(i)
            elif component_type == ComponentType.BAR:
                data = self._generate_bar_data(i)
            elif component_type == ComponentType.COMPASS:
                data = self._generate_compass_data(i)
            elif component_type == ComponentType.LED_PANEL:
                data = self._generate_led_panel_data(i)
            elif component_type == ComponentType.PLOT:
                data = self._generate_plot_data(i)
            elif component_type == ComponentType.MULTIPLOT:
                data = self._generate_multiplot_data(i)
            elif component_type == ComponentType.FFT_PLOT:
                data = self._generate_fft_plot_data(i)
            elif component_type == ComponentType.PLOT_3D:
                data = self._generate_plot3d_data(i)
            elif component_type == ComponentType.DATA_GRID:
                data = self._generate_datagrid_data(i)
            elif component_type == ComponentType.TERMINAL:
                data = self._generate_terminal_data(i)
            else:
                data = "0"
            
            frame = f"${data};"
            test_data.append(frame)
        
        return test_data
    
    def _generate_accelerometer_data(self, step: int) -> str:
        """生成加速度计测试数据"""
        # 模拟重力+振动
        t = step * 0.1
        x = 0.5 * math.sin(2 * math.pi * 0.5 * t) + random.gauss(0, 0.1)
        y = 0.3 * math.cos(2 * math.pi * 0.3 * t) + random.gauss(0, 0.1)
        z = 9.8 + 0.2 * math.sin(2 * math.pi * 1.0 * t) + random.gauss(0, 0.05)
        return f"{x:.3f},{y:.3f},{z:.3f}"
    
    def _generate_gyroscope_data(self, step: int) -> str:
        """生成陀螺仪测试数据"""
        t = step * 0.1
        roll = 30 * math.sin(2 * math.pi * 0.1 * t) + random.gauss(0, 1)
        pitch = 15 * math.cos(2 * math.pi * 0.15 * t) + random.gauss(0, 1)
        yaw = 90 * math.sin(2 * math.pi * 0.05 * t) + random.gauss(0, 2)
        return f"{roll:.2f},{pitch:.2f},{yaw:.2f}"
    
    def _generate_gps_data(self, step: int) -> str:
        """生成GPS测试数据"""
        # 模拟北京市区移动
        base_lat = 39.9042
        base_lon = 116.4074
        base_alt = 50.0
        
        t = step * 0.01
        lat = base_lat + 0.001 * math.sin(2 * math.pi * 0.1 * t)
        lon = base_lon + 0.001 * math.cos(2 * math.pi * 0.1 * t)
        alt = base_alt + 5 * math.sin(2 * math.pi * 0.05 * t)
        
        return f"{lat:.6f},{lon:.6f},{alt:.1f}"
    
    def _generate_gauge_data(self, step: int) -> str:
        """生成仪表盘测试数据"""
        t = step * 0.1
        # 模拟温度变化
        temp = 25 + 10 * math.sin(2 * math.pi * 0.01 * t) + random.gauss(0, 0.5)
        return f"{temp:.1f}"
    
    def _generate_bar_data(self, step: int) -> str:
        """生成条形图测试数据"""
        # 模拟电池电量下降
        battery = max(0, 100 - step * 0.5 + random.uniform(-2, 2))
        return f"{battery:.1f}"
    
    def _generate_compass_data(self, step: int) -> str:
        """生成指南针测试数据"""
        t = step * 0.1
        angle = (step * 5) % 360 + 10 * math.sin(2 * math.pi * 0.1 * t)
        return f"{angle:.1f}"
    
    def _generate_led_panel_data(self, step: int) -> str:
        """生成LED面板测试数据"""
        # 4个LED的状态模拟
        leds = []
        for i in range(4):
            # 不同的闪烁模式
            if i == 0:  # Power LED - 常亮
                state = 1
            elif i == 1:  # Network LED - 慢闪
                state = 1 if (step // 10) % 2 == 0 else 0
            elif i == 2:  # Data LED - 快闪
                state = 1 if (step // 2) % 2 == 0 else 0
            else:  # Error LED - 随机
                state = 1 if random.random() > 0.8 else 0
            leds.append(str(state))
        
        return ",".join(leds)
    
    def _generate_plot_data(self, step: int) -> str:
        """生成单线图测试数据"""
        t = step * 0.1
        # 复合信号
        signal = (math.sin(2 * math.pi * 1.0 * t) + 
                 0.5 * math.sin(2 * math.pi * 3.0 * t) + 
                 0.2 * random.gauss(0, 1))
        return f"{signal:.4f}"
    
    def _generate_multiplot_data(self, step: int) -> str:
        """生成多线图测试数据"""
        t = step * 0.1
        channels = []
        for i in range(3):
            freq = 1.0 + i * 0.5
            phase = i * math.pi / 3
            signal = math.sin(2 * math.pi * freq * t + phase)
            channels.append(f"{signal:.4f}")
        return ",".join(channels)
    
    def _generate_fft_plot_data(self, step: int) -> str:
        """生成FFT图测试数据"""
        t = step * 0.01  # 更高采样率
        # 多频率混合信号
        freqs = [5, 15, 25]  # Hz
        amps = [1.0, 0.6, 0.3]
        signal = sum(amp * math.sin(2 * math.pi * freq * t) 
                    for freq, amp in zip(freqs, amps))
        signal += 0.1 * random.gauss(0, 1)  # 噪声
        return f"{signal:.4f}"
    
    def _generate_plot3d_data(self, step: int) -> str:
        """生成3D图测试数据"""
        t = step * 0.1
        # 3D螺旋
        x = math.cos(t) * (1 + 0.1 * t)
        y = math.sin(t) * (1 + 0.1 * t)  
        z = 0.1 * t
        return f"{x:.3f},{y:.3f},{z:.3f}"
    
    def _generate_datagrid_data(self, step: int) -> str:
        """生成数据网格测试数据"""
        t = step * 0.1
        # 模拟传感器数据
        temp = 25 + 5 * math.sin(2 * math.pi * 0.01 * t) + random.gauss(0, 0.2)
        humidity = 60 + 10 * math.cos(2 * math.pi * 0.008 * t) + random.gauss(0, 1)
        pressure = 1013 + 5 * math.sin(2 * math.pi * 0.005 * t) + random.gauss(0, 0.5)
        voltage = 3.3 + 0.1 * math.sin(2 * math.pi * 0.1 * t) + random.gauss(0, 0.01)
        
        return f"{temp:.1f},{humidity:.1f},{pressure:.1f},{voltage:.2f}"
    
    def _generate_terminal_data(self, step: int) -> str:
        """生成终端测试数据"""
        messages = [
            "System initialized successfully",
            "Sensors connected and calibrated", 
            "Data logging started",
            "Normal operation mode",
            "Warning: Temperature rising",
            "Network connection established",
            "Data transmission active",
            "All systems operational"
        ]
        
        message = messages[step % len(messages)]
        timestamp = f"{(step * 100) % 86400:05d}"  # 模拟时间戳
        return f"[{timestamp}] {message}"
    
    def validate_data_format(self, component_type: ComponentType, data_frame: str) -> Tuple[bool, str]:
        """验证数据格式"""
        # 检查帧格式
        if not data_frame.startswith('$') or not data_frame.endswith(';'):
            return False, "数据帧格式错误：必须以$开头，;结尾"
        
        # 提取数据内容
        data_content = data_frame[1:-1]  # 去掉$和;
        
        # 对于Terminal组件，数据可能包含文本
        if component_type == ComponentType.TERMINAL:
            return True, "终端数据格式正确"
        
        # 检查数值数据
        try:
            values = data_content.split(',')
            rules = self.validation_rules[component_type]
            
            # 检查数据个数
            if rules["data_count"] != "variable" and len(values) != rules["data_count"]:
                return False, f"数据个数错误：期望{rules['data_count']}个，实际{len(values)}个"
            
            # 检查数值范围
            for i, value_str in enumerate(values):
                try:
                    value = float(value_str)
                    if i < len(rules["ranges"]) and rules["ranges"][i] is not None:
                        min_val, max_val = rules["ranges"][i]
                        if value < min_val or value > max_val:
                            return False, f"数值超出范围：{value} 不在 [{min_val}, {max_val}] 范围内"
                except ValueError:
                    return False, f"无效的数值格式：{value_str}"
            
            return True, "数据格式验证通过"
            
        except Exception as e:
            return False, f"数据验证错误：{str(e)}"
    
    def get_component_info(self, component_type: ComponentType) -> Dict:
        """获取组件信息"""
        rules = self.validation_rules[component_type]
        config = self.sample_configs[component_type]
        
        return {
            "type": component_type.value,
            "data_format": rules["format"],
            "data_count": rules["data_count"],
            "value_ranges": rules["ranges"],
            "units": rules["units"],
            "typical_values": rules["typical_values"],
            "sample_config": config
        }
    
    def print_component_summary(self):
        """打印所有组件的摘要信息"""
        print("Serial-Studio 可视化组件数据格式摘要")
        print("=" * 60)
        
        for component_type in ComponentType:
            info = self.get_component_info(component_type)
            print(f"\n【{component_type.value.upper()}】")
            print(f"  数据格式: {info['data_format']}")
            print(f"  数据个数: {info['data_count']}")
            print(f"  数值范围: {info['value_ranges']}")
            print(f"  单位: {info['units']}")
            
    def run_validation_tests(self):
        """运行所有组件的验证测试"""
        print("运行Serial-Studio组件数据验证测试")
        print("=" * 50)
        
        total_tests = 0
        passed_tests = 0
        
        for component_type in ComponentType:
            print(f"\n测试组件: {component_type.value}")
            print("-" * 30)
            
            # 生成测试数据
            test_data = self.generate_test_data(component_type, 5)
            
            for i, data_frame in enumerate(test_data):
                total_tests += 1
                is_valid, message = self.validate_data_format(component_type, data_frame)
                
                status = "✓" if is_valid else "✗"
                print(f"  测试 {i+1}: {status} {data_frame}")
                if is_valid:
                    passed_tests += 1
                else:
                    print(f"    错误: {message}")
        
        print(f"\n测试结果: {passed_tests}/{total_tests} 通过")
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        print(f"成功率: {success_rate:.1f}%")

def main():
    """主函数"""
    validator = ComponentDataValidator()
    
    print("Serial-Studio 组件数据验证器")
    print("支持的操作:")
    print("1. 显示所有组件摘要信息")
    print("2. 运行验证测试")
    print("3. 生成特定组件的测试数据")
    print("4. 验证自定义数据格式")
    print("5. 导出组件配置JSON")
    
    while True:
        try:
            choice = input("\n请选择操作 (1-5, q退出): ").strip()
            
            if choice == 'q':
                break
            elif choice == '1':
                validator.print_component_summary()
            elif choice == '2':
                validator.run_validation_tests()
            elif choice == '3':
                print("\n可用组件类型:")
                for i, comp_type in enumerate(ComponentType, 1):
                    print(f"  {i}. {comp_type.value}")
                
                try:
                    comp_choice = int(input("选择组件类型 (1-13): ")) - 1
                    component_types = list(ComponentType)
                    if 0 <= comp_choice < len(component_types):
                        selected_type = component_types[comp_choice]
                        count = int(input("生成数据条数 (默认10): ") or "10")
                        
                        test_data = validator.generate_test_data(selected_type, count)
                        print(f"\n{selected_type.value} 测试数据:")
                        for i, data in enumerate(test_data):
                            print(f"  {i+1}: {data}")
                    else:
                        print("无效的选择")
                except ValueError:
                    print("输入格式错误")
                    
            elif choice == '4':
                data_frame = input("输入要验证的数据帧 (格式: $data;): ").strip()
                print("\n可用组件类型:")
                for i, comp_type in enumerate(ComponentType, 1):
                    print(f"  {i}. {comp_type.value}")
                
                try:
                    comp_choice = int(input("选择组件类型 (1-13): ")) - 1
                    component_types = list(ComponentType)
                    if 0 <= comp_choice < len(component_types):
                        selected_type = component_types[comp_choice]
                        is_valid, message = validator.validate_data_format(selected_type, data_frame)
                        status = "✓ 有效" if is_valid else "✗ 无效"
                        print(f"\n验证结果: {status}")
                        print(f"说明: {message}")
                    else:
                        print("无效的选择")
                except ValueError:
                    print("输入格式错误")
                    
            elif choice == '5':
                print("\n可用组件类型:")
                for i, comp_type in enumerate(ComponentType, 1):
                    print(f"  {i}. {comp_type.value}")
                
                try:
                    comp_choice = int(input("选择组件类型 (1-13): ")) - 1
                    component_types = list(ComponentType)
                    if 0 <= comp_choice < len(component_types):
                        selected_type = component_types[comp_choice]
                        info = validator.get_component_info(selected_type)
                        
                        filename = f"{selected_type.value}_config.json"
                        with open(filename, 'w', encoding='utf-8') as f:
                            json.dump(info['sample_config'], f, ensure_ascii=False, indent=4)
                        
                        print(f"\n配置已导出到: {filename}")
                    else:
                        print("无效的选择")
                except ValueError:
                    print("输入格式错误")
            else:
                print("无效的选择，请重新输入")
                
        except KeyboardInterrupt:
            print("\n程序被用户中断")
            break
        except Exception as e:
            print(f"发生错误: {e}")

if __name__ == "__main__":
    main()