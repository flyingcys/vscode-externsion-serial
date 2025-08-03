#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Serial Studio 自动化测试脚本

这个脚本提供了自动化测试Serial-Studio各种功能的能力，
包括数据生成、发送、验证和性能测试。

作者: Claude Code Assistant  
版本: 1.0
日期: 2025-01-29
"""

import sys
import json
import time
import random
import math
import threading
import argparse
import signal
from datetime import datetime, timedelta 
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path

import serial
import socket

@dataclass
class TestConfig:
    """测试配置类"""
    name: str
    description: str
    duration: int  # 测试持续时间（秒）
    interval: float  # 发送间隔（秒）
    data_format: str  # 数据格式模板
    expected_components: List[str]  # 期望的组件类型
    validation_rules: Dict  # 验证规则
    
@dataclass 
class TestResult:
    """测试结果类"""
    test_name: str
    start_time: datetime
    end_time: datetime
    duration: float
    packets_sent: int
    packets_failed: int
    success_rate: float
    average_latency: float
    errors: List[str]
    passed: bool

class SerialStudioAutomation:
    """Serial Studio 自动化测试类"""
    
    def __init__(self):
        self.is_running = False
        self.test_results = []
        self.current_test = None
        self.comm_connection = None
        
        # 预定义测试配置
        self.test_configs = self._load_test_configs()
        
        # 信号处理
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """信号处理器"""
        print(f"\n收到信号 {signum}，正在停止测试...")
        self.is_running = False
    
    def _load_test_configs(self) -> Dict[str, TestConfig]:
        """加载测试配置"""
        configs = {}
        
        # 加速度计测试
        configs['accelerometer'] = TestConfig(
            name="加速度计测试",
            description="测试三轴加速度计数据的生成和显示",
            duration=60,
            interval=0.1,  # 10Hz
            data_format="$%ACC_X%,%ACC_Y%,%ACC_Z%;",
            expected_components=["accelerometer"],
            validation_rules={
                'data_count': 3,
                'value_range': (-20.0, 20.0),
                'data_types': ['float', 'float', 'float']
            }
        )
        
        # 陀螺仪测试
        configs['gyroscope'] = TestConfig(
            name="陀螺仪测试", 
            description="测试三轴陀螺仪数据的生成和显示",
            duration=60,
            interval=0.1,  # 10Hz
            data_format="$%GYRO_X%,%GYRO_Y%,%GYRO_Z%;",
            expected_components=["gyroscope"],
            validation_rules={
                'data_count': 3,
                'value_range': (-2000.0, 2000.0),
                'data_types': ['float', 'float', 'float']
            }
        )
        
        # GPS测试
        configs['gps'] = TestConfig(
            name="GPS测试",
            description="测试GPS地理位置数据的生成和显示",
            duration=30,
            interval=1.0,  # 1Hz
            data_format="$%GPS_LAT%,%GPS_LON%,%GPS_ALT%;",
            expected_components=["gps"],
            validation_rules={
                'data_count': 3,
                'lat_range': (-90.0, 90.0),
                'lon_range': (-180.0, 180.0),
                'alt_range': (-1000.0, 10000.0),
                'data_types': ['float', 'float', 'float']
            }
        )
        
        # 混合传感器测试
        configs['mixed_sensors'] = TestConfig(
            name="混合传感器测试",
            description="测试多种传感器数据同时发送",
            duration=120,
            interval=0.05,  # 20Hz
            data_format="$%ACC_X%,%ACC_Y%,%ACC_Z%,%GYRO_X%,%GYRO_Y%,%GYRO_Z%,%TEMP%,%HUM%;",
            expected_components=["accelerometer", "gyroscope", "gauge", "bar"],
            validation_rules={
                'data_count': 8,
                'acc_range': (-20.0, 20.0),
                'gyro_range': (-2000.0, 2000.0),
                'temp_range': (-40.0, 85.0),
                'hum_range': (0.0, 100.0)
            }
        )
        
        # 高频数据测试
        configs['high_frequency'] = TestConfig(
            name="高频数据测试",
            description="测试高频率数据发送的性能",
            duration=30,
            interval=0.01,  # 100Hz
            data_format="$%SIGNAL%;",
            expected_components=["plot"],
            validation_rules={
                'data_count': 1,
                'value_range': (-5.0, 5.0),
                'min_frequency': 50.0  # 最小50Hz
            }
        )
        
        # LED面板测试
        configs['led_panel'] = TestConfig(
            name="LED面板测试",
            description="测试LED状态指示器",
            duration=60,
            interval=0.5,  # 2Hz
            data_format="$%LED1%,%LED2%,%LED3%,%LED4%,%LED5%,%LED6%,%LED7%,%LED8%;",
            expected_components=["led"],
            validation_rules={
                'data_count': 8,
                'value_range': (0, 1),
                'data_types': ['int'] * 8
            }
        )
        
        # FFT信号测试
        configs['fft_signal'] = TestConfig(
            name="FFT信号测试",
            description="测试FFT频谱分析功能",
            duration=60,
            interval=0.01,  # 100Hz采样率
            data_format="$%FFT_SIGNAL%;",
            expected_components=["fft"],
            validation_rules={
                'data_count': 1,
                'value_range': (-3.0, 3.0),
                'sampling_rate': 100.0
            }
        )
        
        return configs
    
    def run_test_suite(self, comm_type: str, **conn_params) -> List[TestResult]:
        """运行测试套件"""
        print("="*60)
        print("Serial Studio 自动化测试套件")
        print("="*60)
        print(f"开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"通讯方式: {comm_type.upper()}")
        print(f"连接参数: {conn_params}")
        print("="*60)
        
        # 建立连接
        if not self._connect(comm_type, **conn_params):
            print("连接失败，测试终止")
            return []
        
        # 运行所有测试
        results = []
        for test_name, config in self.test_configs.items():
            if not self.is_running:
                break
                
            print(f"\n开始测试: {config.name}")
            print(f"描述: {config.description}")
            print(f"持续时间: {config.duration}s")
            print(f"发送间隔: {config.interval}s")
            print("-"*40)
            
            result = self._run_single_test(config)
            results.append(result)
            
            self._print_test_result(result)
            
            # 测试间隔
            if self.is_running:
                time.sleep(2)
        
        # 断开连接
        self._disconnect()
        
        # 打印总结
        self._print_test_summary(results)
        
        return results
    
    def run_single_test(self, test_name: str, comm_type: str, **conn_params) -> Optional[TestResult]:
        """运行单个测试"""
        if test_name not in self.test_configs:
            print(f"未找到测试配置: {test_name}")
            return None
        
        config = self.test_configs[test_name]
        
        print(f"运行测试: {config.name}")
        print(f"描述: {config.description}")
        
        # 建立连接
        if not self._connect(comm_type, **conn_params):
            print("连接失败，测试终止")
            return None
        
        # 运行测试
        result = self._run_single_test(config)
        
        # 断开连接
        self._disconnect()
        
        # 打印结果
        self._print_test_result(result)
        
        return result
    
    def _connect(self, comm_type: str, **params) -> bool:
        """建立连接"""
        try:
            if comm_type.lower() == 'serial':
                port = params.get('port', 'COM1')
                baudrate = params.get('baudrate', 9600)
                self.comm_connection = serial.Serial(port, baudrate, timeout=1)
                print(f"串口连接成功: {port}@{baudrate}")
                
            elif comm_type.lower() == 'tcp':
                host = params.get('host', '127.0.0.1')
                port = params.get('port', 8080)
                self.comm_connection = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self.comm_connection.connect((host, port))
                print(f"TCP连接成功: {host}:{port}")
                
            elif comm_type.lower() == 'udp':
                host = params.get('host', '127.0.0.1')
                port = params.get('port', 12345)
                local_port = params.get('local_port', 0)
                self.comm_connection = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                self.comm_connection.bind(('', local_port))
                self.udp_target = (host, port)
                print(f"UDP设置成功: {host}:{port}")
                
            else:
                print(f"不支持的通讯类型: {comm_type}")
                return False
                
            return True
            
        except Exception as e:
            print(f"连接失败: {str(e)}")
            return False
    
    def _disconnect(self):
        """断开连接"""
        try:
            if self.comm_connection:
                self.comm_connection.close()
                self.comm_connection = None
                print("连接已断开")
        except Exception as e:
            print(f"断开连接失败: {str(e)}")
    
    def _run_single_test(self, config: TestConfig) -> TestResult:
        """运行单个测试"""
        start_time = datetime.now()
        packets_sent = 0
        packets_failed = 0 
        errors = []
        latencies = []
        
        self.is_running = True
        end_time = start_time + timedelta(seconds=config.duration)
        
        print(f"测试开始: {start_time.strftime('%H:%M:%S')}")
        
        try:
            while datetime.now() < end_time and self.is_running:
                # 生成测试数据
                data = self._generate_test_data(config)
                
                # 记录发送开始时间
                send_start = time.time()
                
                # 发送数据
                if self._send_data(data):
                    packets_sent += 1
                    latency = (time.time() - send_start) * 1000  # ms
                    latencies.append(latency)
                    
                    # 打印进度
                    if packets_sent % 50 == 0:
                        elapsed = (datetime.now() - start_time).total_seconds()
                        rate = packets_sent / elapsed if elapsed > 0 else 0
                        print(f"已发送: {packets_sent} 包, 速率: {rate:.1f} pps")
                        
                else:
                    packets_failed += 1
                    errors.append(f"数据发送失败: {data}")
                
                # 等待间隔
                time.sleep(config.interval)
                
        except KeyboardInterrupt:
            print("\n测试被用户中断")
            self.is_running = False
        except Exception as e:
            error_msg = f"测试异常: {str(e)}"
            print(error_msg)
            errors.append(error_msg)
        
        actual_end_time = datetime.now()
        duration = (actual_end_time - start_time).total_seconds()
        
        # 计算统计信息
        success_rate = (packets_sent / (packets_sent + packets_failed) * 100) if (packets_sent + packets_failed) > 0 else 0
        avg_latency = sum(latencies) / len(latencies) if latencies else 0
        
        # 验证测试结果
        passed = self._validate_test_results(config, packets_sent, duration, errors)
        
        return TestResult(
            test_name=config.name,
            start_time=start_time,
            end_time=actual_end_time,
            duration=duration,
            packets_sent=packets_sent,
            packets_failed=packets_failed,
            success_rate=success_rate,
            average_latency=avg_latency,
            errors=errors,
            passed=passed
        )
    
    def _generate_test_data(self, config: TestConfig) -> str:
        """生成测试数据"""
        data_format = config.data_format
        
        # 替换数据占位符
        replacements = {
            '%ACC_X%': f"{random.uniform(-2, 2):.3f}",
            '%ACC_Y%': f"{random.uniform(-2, 2):.3f}",
            '%ACC_Z%': f"{9.8 + random.uniform(-1, 1):.3f}",
            '%GYRO_X%': f"{random.uniform(-180, 180):.2f}",
            '%GYRO_Y%': f"{random.uniform(-90, 90):.2f}",
            '%GYRO_Z%': f"{random.uniform(-180, 180):.2f}",
            '%GPS_LAT%': f"{39.9 + random.uniform(-0.1, 0.1):.6f}",
            '%GPS_LON%': f"{116.4 + random.uniform(-0.1, 0.1):.6f}",
            '%GPS_ALT%': f"{50 + random.uniform(-10, 10):.1f}",
            '%TEMP%': f"{25 + random.uniform(-5, 15):.1f}",
            '%HUM%': f"{random.uniform(30, 80):.1f}",
            '%SIGNAL%': f"{math.sin(time.time() * 2 * math.pi):.4f}",
            '%FFT_SIGNAL%': f"{self._generate_fft_signal():.4f}",
        }
        
        # LED占位符
        for i in range(1, 9):
            replacements[f'%LED{i}%'] = str(random.randint(0, 1))
        
        # 执行替换
        result = data_format
        for placeholder, value in replacements.items():
            result = result.replace(placeholder, value)
        
        return result
    
    def _generate_fft_signal(self) -> float:
        """生成FFT测试信号"""
        t = time.time()
        # 混合多个频率的信号
        signal = (
            1.0 * math.sin(2 * math.pi * 1 * t) +  # 1Hz
            0.5 * math.sin(2 * math.pi * 5 * t) +  # 5Hz
            0.3 * math.sin(2 * math.pi * 10 * t) + # 10Hz
            0.1 * random.gauss(0, 1)                # 噪声
        )
        return signal
    
    def _send_data(self, data: str) -> bool:
        """发送数据"""
        try:
            data_bytes = data.encode('utf-8')
            
            if isinstance(self.comm_connection, serial.Serial):
                self.comm_connection.write(data_bytes)
            elif hasattr(self.comm_connection, 'send'):  # TCP
                self.comm_connection.send(data_bytes)
            elif hasattr(self.comm_connection, 'sendto'):  # UDP
                self.comm_connection.sendto(data_bytes, self.udp_target)
            else:
                return False
                
            return True
            
        except Exception as e:
            print(f"发送失败: {str(e)}")
            return False
    
    def _validate_test_results(self, config: TestConfig, packets_sent: int, 
                             duration: float, errors: List[str]) -> bool:
        """验证测试结果"""
        # 基本验证规则
        if len(errors) > packets_sent * 0.1:  # 错误率超过10%
            return False
        
        if duration > 0:
            actual_rate = packets_sent / duration
            expected_rate = 1.0 / config.interval
            
            # 允许20%的误差
            if actual_rate < expected_rate * 0.8:
                return False
        
        # 特定测试的验证规则
        rules = config.validation_rules
        
        if 'min_frequency' in rules:
            if duration > 0 and (packets_sent / duration) < rules['min_frequency']:
                return False
        
        return True
    
    def _print_test_result(self, result: TestResult):
        """打印测试结果"""
        print(f"\n测试结果: {result.test_name}")
        print(f"开始时间: {result.start_time.strftime('%H:%M:%S')}")
        print(f"结束时间: {result.end_time.strftime('%H:%M:%S')}")
        print(f"持续时间: {result.duration:.1f}s")
        print(f"发送成功: {result.packets_sent}")
        print(f"发送失败: {result.packets_failed}")
        print(f"成功率: {result.success_rate:.1f}%")
        print(f"平均延迟: {result.average_latency:.2f}ms")
        print(f"测试状态: {'通过' if result.passed else '失败'}")
        
        if result.errors:
            print(f"错误信息: {len(result.errors)} 个错误")
            for error in result.errors[:5]:  # 只显示前5个错误
                print(f"  - {error}")
            if len(result.errors) > 5:
                print(f"  ... 还有 {len(result.errors) - 5} 个错误")
        
        print("-"*40)
    
    def _print_test_summary(self, results: List[TestResult]):
        """打印测试总结"""
        if not results:
            return
        
        print("\n" + "="*60)
        print("测试总结")
        print("="*60)
        
        total_tests = len(results)
        passed_tests = sum(1 for r in results if r.passed)
        total_packets = sum(r.packets_sent for r in results)
        total_failed = sum(r.packets_failed for r in results)
        total_duration = sum(r.duration for r in results)
        
        print(f"总测试数: {total_tests}")
        print(f"通过测试: {passed_tests}")
        print(f"失败测试: {total_tests - passed_tests}")
        print(f"通过率: {passed_tests / total_tests * 100:.1f}%")
        print(f"总发送包数: {total_packets}")
        print(f"总失败包数: {total_failed}")
        print(f"总体成功率: {total_packets / (total_packets + total_failed) * 100:.1f}%" if (total_packets + total_failed) > 0 else "0.0%")
        print(f"总测试时间: {total_duration:.1f}s")
        print(f"平均发送速率: {total_packets / total_duration:.1f} pps" if total_duration > 0 else "0.0 pps")
        
        print("\n各测试详情:")
        print(f"{'测试名称':<20} {'状态':<6} {'发送':<8} {'成功率':<8} {'延迟':<8}")
        print("-"*50)
        for result in results:
            status = "通过" if result.passed else "失败"
            print(f"{result.test_name:<20} {status:<6} {result.packets_sent:<8} {result.success_rate:<7.1f}% {result.average_latency:<7.1f}ms")
    
    def save_results(self, results: List[TestResult], filename: str):
        """保存测试结果"""
        try:
            data = {
                'test_summary': {
                    'timestamp': datetime.now().isoformat(),
                    'total_tests': len(results),
                    'passed_tests': sum(1 for r in results if r.passed),
                    'total_packets': sum(r.packets_sent for r in results),
                    'total_duration': sum(r.duration for r in results)
                },
                'test_results': []
            }
            
            for result in results:
                result_dict = asdict(result)
                # 转换datetime对象为字符串
                result_dict['start_time'] = result.start_time.isoformat()
                result_dict['end_time'] = result.end_time.isoformat()
                data['test_results'].append(result_dict)
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"测试结果已保存到: {filename}")
            
        except Exception as e:
            print(f"保存结果失败: {str(e)}")
    
    def generate_report(self, results: List[TestResult], filename: str):
        """生成测试报告"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("# Serial Studio 自动化测试报告\n\n")
                f.write(f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                
                if not results:
                    f.write("没有测试结果\n")
                    return
                
                # 总结信息
                total_tests = len(results)
                passed_tests = sum(1 for r in results if r.passed)
                total_packets = sum(r.packets_sent for r in results)
                total_failed = sum(r.packets_failed for r in results)
                
                f.write("## 测试总结\n\n")
                f.write(f"- **总测试数**: {total_tests}\n")
                f.write(f"- **通过测试**: {passed_tests}\n")
                f.write(f"- **失败测试**: {total_tests - passed_tests}\n")
                f.write(f"- **通过率**: {passed_tests / total_tests * 100:.1f}%\n")
                f.write(f"- **总发送包数**: {total_packets}\n")
                f.write(f"- **总失败包数**: {total_failed}\n")
                f.write(f"- **总体成功率**: {total_packets / (total_packets + total_failed) * 100:.1f}%\n\n" if (total_packets + total_failed) > 0 else "- **总体成功率**: 0.0%\n\n")
                
                # 详细结果
                f.write("## 详细测试结果\n\n")
                for result in results:
                    f.write(f"### {result.test_name}\n\n")
                    f.write(f"- **状态**: {'✅ 通过' if result.passed else '❌ 失败'}\n")
                    f.write(f"- **开始时间**: {result.start_time.strftime('%H:%M:%S')}\n")
                    f.write(f"- **结束时间**: {result.end_time.strftime('%H:%M:%S')}\n")
                    f.write(f"- **持续时间**: {result.duration:.1f}s\n")
                    f.write(f"- **发送成功**: {result.packets_sent}\n")
                    f.write(f"- **发送失败**: {result.packets_failed}\n")
                    f.write(f"- **成功率**: {result.success_rate:.1f}%\n")
                    f.write(f"- **平均延迟**: {result.average_latency:.2f}ms\n")
                    
                    if result.errors:
                        f.write(f"- **错误信息**: {len(result.errors)} 个错误\n")
                        for error in result.errors[:3]:
                            f.write(f"  - {error}\n")
                        if len(result.errors) > 3:
                            f.write(f"  - ... 还有 {len(result.errors) - 3} 个错误\n")
                    
                    f.write("\n")
            
            print(f"测试报告已生成: {filename}")
            
        except Exception as e:
            print(f"生成报告失败: {str(e)}")

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='Serial Studio 自动化测试工具')
    
    # 基本参数
    parser.add_argument('--comm', '-c', choices=['serial', 'tcp', 'udp'], 
                       default='serial', help='通讯类型')
    parser.add_argument('--test', '-t', help='指定单个测试名称')
    parser.add_argument('--list', '-l', action='store_true', help='列出所有可用测试')
    
    # 串口参数
    parser.add_argument('--port', '-p', default='COM1', help='串口端口')
    parser.add_argument('--baudrate', '-b', type=int, default=9600, help='串口波特率')
    
    # 网络参数
    parser.add_argument('--host', default='127.0.0.1', help='网络主机地址')
    parser.add_argument('--netport', type=int, default=8080, help='网络端口')
    parser.add_argument('--localport', type=int, default=0, help='UDP本地端口')
    
    # 输出参数
    parser.add_argument('--output', '-o', help='保存结果的JSON文件路径')
    parser.add_argument('--report', '-r', help='生成报告的Markdown文件路径')
    
    args = parser.parse_args()
    
    # 创建自动化测试实例
    automation = SerialStudioAutomation()
    
    # 列出可用测试
    if args.list:
        print("可用的测试:")
        for name, config in automation.test_configs.items():
            print(f"  {name}: {config.description}")
        return
    
    # 准备连接参数
    conn_params = {}
    if args.comm == 'serial':
        conn_params = {'port': args.port, 'baudrate': args.baudrate}
    elif args.comm == 'tcp':
        conn_params = {'host': args.host, 'port': args.netport}
    elif args.comm == 'udp':
        conn_params = {'host': args.host, 'port': args.netport, 'local_port': args.localport}
    
    # 运行测试
    results = []
    if args.test:
        # 运行单个测试
        result = automation.run_single_test(args.test, args.comm, **conn_params)
        if result:
            results = [result]
    else:
        # 运行测试套件
        results = automation.run_test_suite(args.comm, **conn_params)
    
    # 保存结果
    if args.output and results:
        automation.save_results(results, args.output)
    
    # 生成报告
    if args.report and results:
        automation.generate_report(results, args.report)
    
    # 返回退出码
    if results:
        failed_tests = sum(1 for r in results if not r.passed)
        sys.exit(0 if failed_tests == 0 else 1)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()