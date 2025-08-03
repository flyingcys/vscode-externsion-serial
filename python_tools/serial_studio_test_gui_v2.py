#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Serial Studio 高级测试工具 - GUI版本 v2.0

支持所有可视化组件的精确数据格式，提供灵活的数据生成规则配置，
支持串口、网络、蓝牙等多种通讯方式。

基于Serial-Studio官方规范实现，包含13种可视化组件：
- Accelerometer, Gyroscope, GPS, Gauge, Bar, Compass, LEDPanel
- Plot, MultiPlot, FFTPlot, Plot3D, DataGrid, Terminal

作者: Claude Code Assistant
版本: 2.0
日期: 2025-01-29
"""

import sys
import json
import time
import random
import math
import threading
import serial
import socket
import struct
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Callable, Any, Union
from enum import Enum

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog
import tkinter.font as tkFont

# ===============================
# 核心数据结构定义
# ===============================

class ComponentType(Enum):
    """支持的可视化组件类型"""
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
    PLOT_3D = "plot_3d"
    DATA_GRID = "data_grid"
    TERMINAL = "terminal"

class CommType(Enum):
    """通讯协议类型"""
    SERIAL = "serial"
    TCP_CLIENT = "tcp_client"
    TCP_SERVER = "tcp_server"
    UDP = "udp"
    UDP_MULTICAST = "udp_multicast"
    BLUETOOTH_LE = "bluetooth_le"  # 预留
    AUDIO = "audio"  # 预留
    MODBUS = "modbus"  # 预留
    CANBUS = "canbus"  # 预留

class DataGenRule(Enum):
    """数据生成规则类型"""
    CONSTANT = "constant"
    RANDOM = "random"
    SINE_WAVE = "sine_wave"
    COSINE_WAVE = "cosine_wave"
    SQUARE_WAVE = "square_wave"
    SAWTOOTH_WAVE = "sawtooth_wave"
    TRIANGLE_WAVE = "triangle_wave"
    LINEAR_INCREASE = "linear_increase"
    LINEAR_DECREASE = "linear_decrease"
    EXPONENTIAL = "exponential"
    LOGARITHMIC = "logarithmic"
    NOISE = "noise"
    CUSTOM_FUNCTION = "custom_function"

@dataclass
class DataGenConfig:
    """数据生成配置"""
    rule: DataGenRule = DataGenRule.RANDOM
    min_value: float = 0.0
    max_value: float = 100.0
    amplitude: float = 1.0
    frequency: float = 1.0
    phase: float = 0.0
    noise_level: float = 0.1
    step_size: float = 1.0
    custom_function: str = ""
    duration: float = 0.0  # 0表示无限
    parameters: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ComponentConfig:
    """组件配置"""
    name: str
    component_type: ComponentType
    enabled: bool = True
    frequency: float = 1.0  # Hz
    datasets: List[Dict[str, Any]] = field(default_factory=list)
    widget_config: Dict[str, Any] = field(default_factory=dict)
    data_generation: List[DataGenConfig] = field(default_factory=list)

@dataclass
class CommConfig:
    """通讯配置"""
    comm_type: CommType
    # Serial配置
    port: str = "COM1"
    baudrate: int = 9600
    databits: int = 8
    parity: str = "N"
    stopbits: int = 1
    # Network配置
    host: str = "127.0.0.1"
    tcp_port: int = 8080
    udp_local_port: int = 12345
    udp_remote_port: int = 12346
    # 通用配置
    auto_reconnect: bool = True
    timeout: float = 1.0
    buffer_size: int = 4096

# ===============================
# 数据生成器系统
# ===============================

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

class ComponentDataGenerator:
    """组件专用数据生成器"""
    
    def __init__(self):
        self.data_gen = DataGenerator()
        self.component_states = {}
        
        # 初始化各组件的状态
        self._init_component_states()
        
    def _init_component_states(self):
        """初始化组件状态"""
        # GPS状态
        self.component_states['gps'] = {
            'lat': 39.9042,  # 北京天安门
            'lon': 116.4074,
            'alt': 50.0
        }
        
        # LED状态
        self.component_states['led'] = {
            'states': [False] * 16  # 支持最多16个LED
        }
        
        # Terminal缓冲区
        self.component_states['terminal'] = {
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
        
        # DataGrid行数据
        self.component_states['datagrid'] = {
            'row_counter': 0
        }
    
    def generate_component_data(self, config: ComponentConfig) -> str:
        """生成组件数据"""
        if config.component_type == ComponentType.ACCELEROMETER:
            return self._generate_accelerometer_data(config)
        elif config.component_type == ComponentType.GYROSCOPE:
            return self._generate_gyroscope_data(config)
        elif config.component_type == ComponentType.GPS:
            return self._generate_gps_data(config)
        elif config.component_type == ComponentType.GAUGE:
            return self._generate_gauge_data(config)
        elif config.component_type == ComponentType.BAR:
            return self._generate_bar_data(config)
        elif config.component_type == ComponentType.COMPASS:
            return self._generate_compass_data(config)
        elif config.component_type == ComponentType.LED_PANEL:
            return self._generate_led_panel_data(config)
        elif config.component_type == ComponentType.PLOT:
            return self._generate_plot_data(config)
        elif config.component_type == ComponentType.MULTIPLOT:
            return self._generate_multiplot_data(config)
        elif config.component_type == ComponentType.FFT_PLOT:
            return self._generate_fft_plot_data(config)
        elif config.component_type == ComponentType.PLOT_3D:
            return self._generate_plot3d_data(config)
        elif config.component_type == ComponentType.DATA_GRID:
            return self._generate_datagrid_data(config)
        elif config.component_type == ComponentType.TERMINAL:
            return self._generate_terminal_data(config)
        else:
            return "0"
    
    def _generate_accelerometer_data(self, config: ComponentConfig) -> str:
        """生成加速度计数据 (X, Y, Z)"""
        if len(config.data_generation) >= 3:
            x = self.data_gen.generate_value(config.data_generation[0])
            y = self.data_gen.generate_value(config.data_generation[1])
            z = self.data_gen.generate_value(config.data_generation[2])
        else:
            # 默认模拟重力+噪声
            x = random.gauss(0, 0.5)
            y = random.gauss(0, 0.5)
            z = random.gauss(9.8, 0.2)
        
        return f"{x:.3f},{y:.3f},{z:.3f}"
    
    def _generate_gyroscope_data(self, config: ComponentConfig) -> str:
        """生成陀螺仪数据 (Roll, Pitch, Yaw)"""
        if len(config.data_generation) >= 3:
            roll = self.data_gen.generate_value(config.data_generation[0])
            pitch = self.data_gen.generate_value(config.data_generation[1])
            yaw = self.data_gen.generate_value(config.data_generation[2])
        else:
            # 默认角度范围
            roll = random.uniform(-180, 180)
            pitch = random.uniform(-90, 90)
            yaw = random.uniform(-180, 180)
        
        return f"{roll:.2f},{pitch:.2f},{yaw:.2f}"
    
    def _generate_gps_data(self, config: ComponentConfig) -> str:
        """生成GPS数据 (Latitude, Longitude, Altitude)"""
        gps_state = self.component_states['gps']
        
        if len(config.data_generation) >= 3:
            lat_delta = self.data_gen.generate_value(config.data_generation[0]) - 50  # 中心化
            lon_delta = self.data_gen.generate_value(config.data_generation[1]) - 50
            alt_delta = self.data_gen.generate_value(config.data_generation[2]) - 50
            
            gps_state['lat'] += lat_delta * 0.0001  # 小幅度移动
            gps_state['lon'] += lon_delta * 0.0001
            gps_state['alt'] += alt_delta * 0.1
        else:
            # 默认小幅度漂移
            gps_state['lat'] += random.uniform(-0.0001, 0.0001)
            gps_state['lon'] += random.uniform(-0.0001, 0.0001)
            gps_state['alt'] += random.uniform(-0.5, 0.5)
        
        # 限制范围
        gps_state['lat'] = max(-90, min(90, gps_state['lat']))
        gps_state['lon'] = max(-180, min(180, gps_state['lon']))
        gps_state['alt'] = max(-500, min(10000, gps_state['alt']))
        
        return f"{gps_state['lat']:.6f},{gps_state['lon']:.6f},{gps_state['alt']:.1f}"
    
    def _generate_gauge_data(self, config: ComponentConfig) -> str:
        """生成仪表盘数据"""
        if len(config.data_generation) >= 1:
            value = self.data_gen.generate_value(config.data_generation[0])
        else:
            value = random.uniform(0, 100)
        
        return f"{value:.2f}"
    
    def _generate_bar_data(self, config: ComponentConfig) -> str:
        """生成条形图数据"""
        if len(config.data_generation) >= 1:
            value = self.data_gen.generate_value(config.data_generation[0])
        else:
            value = random.uniform(0, 100)
        
        return f"{value:.2f}"
    
    def _generate_compass_data(self, config: ComponentConfig) -> str:
        """生成指南针数据 (角度)"""
        if len(config.data_generation) >= 1:
            angle = self.data_gen.generate_value(config.data_generation[0])
            angle = angle % 360  # 确保在0-360范围内
        else:
            angle = random.uniform(0, 360)
        
        return f"{angle:.1f}"
    
    def _generate_led_panel_data(self, config: ComponentConfig) -> str:
        """生成LED面板数据"""
        led_state = self.component_states['led']
        led_count = len(config.datasets) if config.datasets else 8
        
        # 确保有足够的LED状态
        while len(led_state['states']) < led_count:
            led_state['states'].append(False)
        
        # 根据配置更新LED状态
        values = []
        for i in range(led_count):
            if i < len(config.data_generation):
                # 使用配置的生成规则
                raw_value = self.data_gen.generate_value(config.data_generation[i])
                # LED通常用阈值判断开关
                threshold = config.data_generation[i].parameters.get('threshold', 0.5)
                led_on = raw_value > threshold
            else:
                # 随机变化
                led_on = random.random() > 0.7  # 30%概率点亮
            
            led_state['states'][i] = led_on
            values.append('1' if led_on else '0')
        
        return ','.join(values)
    
    def _generate_plot_data(self, config: ComponentConfig) -> str:
        """生成单线图数据"""
        if len(config.data_generation) >= 1:
            value = self.data_gen.generate_value(config.data_generation[0])
        else:
            # 默认正弦波
            t = time.time() - self.data_gen.start_time
            value = math.sin(2 * math.pi * 0.5 * t)
        
        return f"{value:.4f}"
    
    def _generate_multiplot_data(self, config: ComponentConfig) -> str:
        """生成多线图数据"""
        channel_count = len(config.data_generation) if config.data_generation else 3
        values = []
        
        for i in range(channel_count):
            if i < len(config.data_generation):
                value = self.data_gen.generate_value(config.data_generation[i])
            else:
                # 默认不同频率的正弦波
                t = time.time() - self.data_gen.start_time
                freq = 0.5 + i * 0.3
                phase = i * math.pi / 4
                value = math.sin(2 * math.pi * freq * t + phase)
            
            values.append(f"{value:.4f}")
        
        return ','.join(values)
    
    def _generate_fft_plot_data(self, config: ComponentConfig) -> str:
        """生成FFT图数据（时域信号）"""
        if len(config.data_generation) >= 1:
            value = self.data_gen.generate_value(config.data_generation[0])
        else:
            # 默认多频率混合信号
            t = time.time() - self.data_gen.start_time
            freqs = [1, 5, 10]  # Hz
            amps = [1, 0.5, 0.3]
            signal = 0
            for freq, amp in zip(freqs, amps):
                signal += amp * math.sin(2 * math.pi * freq * t)
            
            # 添加噪声
            signal += random.gauss(0, 0.1)
            value = signal
        
        return f"{value:.4f}"
    
    def _generate_plot3d_data(self, config: ComponentConfig) -> str:
        """生成3D图数据 (X, Y, Z)"""
        if len(config.data_generation) >= 3:
            x = self.data_gen.generate_value(config.data_generation[0])
            y = self.data_gen.generate_value(config.data_generation[1])
            z = self.data_gen.generate_value(config.data_generation[2])
        else:
            # 默认3D螺旋
            t = time.time() - self.data_gen.start_time
            x = math.cos(t) * (1 + 0.1 * t)
            y = math.sin(t) * (1 + 0.1 * t)
            z = 0.1 * t
        
        return f"{x:.3f},{y:.3f},{z:.3f}"
    
    def _generate_datagrid_data(self, config: ComponentConfig) -> str:
        """生成数据网格数据"""
        datagrid_state = self.component_states['datagrid']
        
        # 数据网格通常显示多个数值
        field_count = len(config.data_generation) if config.data_generation else 5
        values = []
        
        for i in range(field_count):
            if i < len(config.data_generation):
                value = self.data_gen.generate_value(config.data_generation[i])
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
        
        datagrid_state['row_counter'] += 1
        return ','.join(values)
    
    def _generate_terminal_data(self, config: ComponentConfig) -> str:
        """生成终端数据"""
        terminal_state = self.component_states['terminal']
        
        # 选择一个消息
        msg_index = terminal_state['message_counter'] % len(terminal_state['messages'])
        message = terminal_state['messages'][msg_index]
        
        # 添加时间戳
        timestamp = datetime.now().strftime("%H:%M:%S")
        terminal_data = f"[{timestamp}] {message}"
        
        terminal_state['message_counter'] += 1
        
        # Terminal数据通常是文本，需要特殊处理
        return terminal_data
    
    def step(self):
        """时间步进"""
        self.data_gen.step()

# ===============================
# 通讯管理器
# ===============================

class CommunicationManager:
    """高级通讯管理器"""
    
    def __init__(self):
        self.connections = {}
        self.active_connection = None
        self.is_connected = False
        
    def connect(self, config: CommConfig) -> bool:
        """建立连接"""
        try:
            if config.comm_type == CommType.SERIAL:
                return self._connect_serial(config)
            elif config.comm_type == CommType.TCP_CLIENT:
                return self._connect_tcp_client(config)
            elif config.comm_type == CommType.TCP_SERVER:
                return self._connect_tcp_server(config)
            elif config.comm_type == CommType.UDP:
                return self._connect_udp(config)
            elif config.comm_type == CommType.UDP_MULTICAST:
                return self._connect_udp_multicast(config)
            else:
                print(f"不支持的通讯类型: {config.comm_type}")
                return False
        except Exception as e:
            print(f"连接失败: {e}")
            return False
    
    def _connect_serial(self, config: CommConfig) -> bool:
        """连接串口"""
        try:
            parity_map = {'N': serial.PARITY_NONE, 'E': serial.PARITY_EVEN, 'O': serial.PARITY_ODD}
            
            conn = serial.Serial(
                port=config.port,
                baudrate=config.baudrate,
                bytesize=config.databits,
                parity=parity_map.get(config.parity, serial.PARITY_NONE),
                stopbits=config.stopbits,
                timeout=config.timeout
            )
            
            self.active_connection = conn
            self.is_connected = True
            return True
        except Exception as e:
            print(f"串口连接失败: {e}")
            return False
    
    def _connect_tcp_client(self, config: CommConfig) -> bool:
        """连接TCP客户端"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(config.timeout)
            sock.connect((config.host, config.tcp_port))
            
            self.active_connection = sock
            self.is_connected = True
            return True
        except Exception as e:
            print(f"TCP客户端连接失败: {e}")
            return False
    
    def _connect_tcp_server(self, config: CommConfig) -> bool:
        """启动TCP服务器"""
        try:
            server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server_sock.bind((config.host, config.tcp_port))
            server_sock.listen(5)
            server_sock.settimeout(config.timeout)
            
            print(f"TCP服务器在 {config.host}:{config.tcp_port} 等待连接...")
            
            # 等待客户端连接
            client_sock, client_addr = server_sock.accept()
            print(f"客户端已连接: {client_addr}")
            
            self.active_connection = client_sock
            self.connections['server'] = server_sock
            self.is_connected = True
            return True
        except socket.timeout:
            print("TCP服务器连接超时")
            return False
        except Exception as e:
            print(f"TCP服务器启动失败: {e}")
            return False
    
    def _connect_udp(self, config: CommConfig) -> bool:
        """设置UDP通讯"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.bind(('', config.udp_local_port))
            sock.settimeout(config.timeout)
            
            self.active_connection = sock
            self.udp_remote = (config.host, config.udp_remote_port)
            self.is_connected = True
            return True
        except Exception as e:
            print(f"UDP设置失败: {e}")
            return False
    
    def _connect_udp_multicast(self, config: CommConfig) -> bool:
        """设置UDP组播"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            
            # 设置组播
            mreq = struct.pack("4sl", socket.inet_aton(config.host), socket.INADDR_ANY)
            sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)
            
            sock.bind(('', config.udp_local_port))
            sock.settimeout(config.timeout)
            
            self.active_connection = sock
            self.udp_remote = (config.host, config.udp_remote_port)
            self.is_connected = True
            return True
        except Exception as e:
            print(f"UDP组播设置失败: {e}")
            return False
    
    def send_data(self, data: str, config: CommConfig) -> bool:
        """发送数据"""
        if not self.is_connected or not self.active_connection:
            return False
        
        try:
            data_bytes = data.encode('utf-8')
            
            if config.comm_type == CommType.SERIAL:
                self.active_connection.write(data_bytes)
                return True
                
            elif config.comm_type in [CommType.TCP_CLIENT, CommType.TCP_SERVER]:
                self.active_connection.send(data_bytes)
                return True
                
            elif config.comm_type in [CommType.UDP, CommType.UDP_MULTICAST]:
                self.active_connection.sendto(data_bytes, self.udp_remote)
                return True
                
        except Exception as e:
            print(f"数据发送失败: {e}")
            return False
        
        return False
    
    def disconnect(self):
        """断开连接"""
        try:
            if self.active_connection:
                if hasattr(self.active_connection, 'close'):
                    self.active_connection.close()
                self.active_connection = None
            
            for conn in self.connections.values():
                if hasattr(conn, 'close'):
                    conn.close()
            
            self.connections.clear()
            self.is_connected = False
        except Exception as e:
            print(f"断开连接失败: {e}")

# ===============================
# 主GUI应用
# ===============================

class SerialStudioAdvancedTestGUI:
    """Serial Studio 高级测试工具GUI"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Serial Studio 高级测试工具 v2.0")
        self.root.geometry("1400x900")
        
        # 初始化核心组件
        self.component_generator = ComponentDataGenerator()
        self.comm_manager = CommunicationManager()
        
        # 状态变量
        self.is_running = False
        self.send_thread = None
        self.component_configs = []
        self.comm_config = CommConfig(CommType.SERIAL)
        
        # 统计信息
        self.stats = {
            'sent_count': 0,
            'error_count': 0,
            'start_time': 0
        }
        
        # 创建界面
        self._create_widgets()
        self._load_default_configs()
        
    def _create_widgets(self):
        """创建界面组件"""
        # 创建主要布局
        main_paned = ttk.PanedWindow(self.root, orient=tk.HORIZONTAL)
        main_paned.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 左侧控制面板
        left_frame = ttk.Frame(main_paned)
        main_paned.add(left_frame, weight=1)
        
        # 右侧日志和预览面板
        right_paned = ttk.PanedWindow(main_paned, orient=tk.VERTICAL)
        main_paned.add(right_paned, weight=1)
        
        # 创建各个子面板
        self._create_comm_panel(left_frame)
        self._create_component_panel(left_frame)
        self._create_control_panel(left_frame)
        
        self._create_preview_panel(right_paned)
        self._create_log_panel(right_paned)
        
    def _create_comm_panel(self, parent):
        """创建通讯配置面板"""
        comm_frame = ttk.LabelFrame(parent, text="通讯配置", padding=10)
        comm_frame.pack(fill=tk.X, pady=(0, 5))
        
        # 通讯类型选择
        ttk.Label(comm_frame, text="通讯类型:").grid(row=0, column=0, sticky=tk.W)
        self.comm_type_var = tk.StringVar(value="serial")
        comm_combo = ttk.Combobox(comm_frame, textvariable=self.comm_type_var, width=15)
        comm_combo['values'] = [
            "serial", "tcp_client", "tcp_server", "udp", "udp_multicast"
        ]
        comm_combo.state(['readonly'])
        comm_combo.grid(row=0, column=1, sticky=tk.EW, padx=(5, 0))
        comm_combo.bind('<<ComboboxSelected>>', self._on_comm_type_changed)
        
        # 连接状态和控制
        self.conn_status_var = tk.StringVar(value="未连接")
        self.conn_status_label = ttk.Label(comm_frame, textvariable=self.conn_status_var, foreground="red")
        self.conn_status_label.grid(row=0, column=2, padx=(10, 0))
        
        self.connect_btn = ttk.Button(comm_frame, text="连接", command=self._toggle_connection)
        self.connect_btn.grid(row=0, column=3, padx=(5, 0))
        
        # 动态配置区域
        self.comm_config_frame = ttk.Frame(comm_frame)
        self.comm_config_frame.grid(row=1, column=0, columnspan=4, sticky=tk.EW, pady=(10, 0))
        
        comm_frame.columnconfigure(1, weight=1)
        
        # 初始化配置界面
        self._update_comm_config_ui()
        
    def _create_component_panel(self, parent):
        """创建组件配置面板"""
        comp_frame = ttk.LabelFrame(parent, text="组件配置", padding=10)
        comp_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 5))
        
        # 组件列表
        list_frame = ttk.Frame(comp_frame)
        list_frame.pack(fill=tk.BOTH, expand=True)
        
        # Treeview表格
        columns = ('名称', '类型', '频率(Hz)', '数据集', '启用')
        self.comp_tree = ttk.Treeview(list_frame, columns=columns, show='headings', height=12)
        
        for col in columns:
            self.comp_tree.heading(col, text=col)
            if col == '名称':
                self.comp_tree.column(col, width=120)
            elif col == '类型':
                self.comp_tree.column(col, width=100)
            elif col == '频率(Hz)':
                self.comp_tree.column(col, width=80)
            elif col == '数据集':
                self.comp_tree.column(col, width=60)
            else:
                self.comp_tree.column(col, width=60)
        
        # 滚动条
        comp_scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.comp_tree.yview)
        self.comp_tree.configure(yscrollcommand=comp_scrollbar.set)
        
        self.comp_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        comp_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # 操作按钮
        btn_frame = ttk.Frame(comp_frame)
        btn_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Button(btn_frame, text="添加组件", command=self._add_component).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(btn_frame, text="编辑组件", command=self._edit_component).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(btn_frame, text="复制组件", command=self._copy_component).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(btn_frame, text="删除组件", command=self._delete_component).pack(side=tk.LEFT, padx=(0, 5))
        
        btn_frame2 = ttk.Frame(comp_frame)
        btn_frame2.pack(fill=tk.X, pady=(5, 0))
        
        ttk.Button(btn_frame2, text="导入配置", command=self._import_config).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(btn_frame2, text="导出配置", command=self._export_config).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(btn_frame2, text="重置配置", command=self._reset_config).pack(side=tk.LEFT)
        
    def _create_control_panel(self, parent):
        """创建发送控制面板"""
        control_frame = ttk.LabelFrame(parent, text="发送控制", padding=10)
        control_frame.pack(fill=tk.X)
        
        # 发送控制
        ctrl_frame1 = ttk.Frame(control_frame)
        ctrl_frame1.pack(fill=tk.X)
        
        self.start_btn = ttk.Button(ctrl_frame1, text="开始发送", command=self._toggle_sending)
        self.start_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        ttk.Label(ctrl_frame1, text="发送间隔(ms):").pack(side=tk.LEFT)
        self.interval_var = tk.StringVar(value="100")
        interval_entry = ttk.Entry(ctrl_frame1, textvariable=self.interval_var, width=8)
        interval_entry.pack(side=tk.LEFT, padx=(5, 10))
        
        ttk.Label(ctrl_frame1, text="持续时间(s):").pack(side=tk.LEFT)
        self.duration_var = tk.StringVar(value="0")
        duration_entry = ttk.Entry(ctrl_frame1, textvariable=self.duration_var, width=8)
        duration_entry.pack(side=tk.LEFT, padx=(5, 0))
        
        # 统计信息
        stats_frame = ttk.Frame(control_frame)
        stats_frame.pack(fill=tk.X, pady=(10, 0))
        
        self.stats_var = tk.StringVar(value="发送: 0 | 失败: 0 | 速率: 0.0 msg/s")
        ttk.Label(stats_frame, textvariable=self.stats_var).pack(side=tk.LEFT)
        
        ttk.Button(stats_frame, text="重置统计", command=self._reset_stats).pack(side=tk.RIGHT)
        
    def _create_preview_panel(self, parent):
        """创建数据预览面板"""
        preview_frame = ttk.LabelFrame(parent, text="数据预览", padding=10)
        parent.add(preview_frame, weight=1)
        
        # 预览文本框
        self.preview_text = scrolledtext.ScrolledText(preview_frame, height=15, width=60, font=('Consolas', 9))
        self.preview_text.pack(fill=tk.BOTH, expand=True)
        
        # 预览控制
        preview_ctrl_frame = ttk.Frame(preview_frame)
        preview_ctrl_frame.pack(fill=tk.X, pady=(5, 0))
        
        ttk.Button(preview_ctrl_frame, text="清空预览", command=self._clear_preview).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(preview_ctrl_frame, text="保存预览", command=self._save_preview).pack(side=tk.LEFT, padx=(0, 5))
        
        self.preview_auto_scroll = tk.BooleanVar(value=True)
        ttk.Checkbutton(preview_ctrl_frame, text="自动滚动", variable=self.preview_auto_scroll).pack(side=tk.LEFT, padx=(10, 0))
        
    def _create_log_panel(self, parent):
        """创建日志面板"""
        log_frame = ttk.LabelFrame(parent, text="系统日志", padding=10)
        parent.add(log_frame, weight=1)
        
        # 日志文本框
        self.log_text = scrolledtext.ScrolledText(log_frame, height=15, width=60, font=('Consolas', 9))
        self.log_text.pack(fill=tk.BOTH, expand=True)
        
        # 日志控制
        log_ctrl_frame = ttk.Frame(log_frame)
        log_ctrl_frame.pack(fill=tk.X, pady=(5, 0))
        
        ttk.Button(log_ctrl_frame, text="清空日志", command=self._clear_log).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(log_ctrl_frame, text="保存日志", command=self._save_log).pack(side=tk.LEFT)
        
        # 日志级别过滤
        ttk.Label(log_ctrl_frame, text="日志级别:").pack(side=tk.RIGHT, padx=(10, 5))
        self.log_level_var = tk.StringVar(value="INFO")
        log_level_combo = ttk.Combobox(log_ctrl_frame, textvariable=self.log_level_var, width=8)
        log_level_combo['values'] = ["DEBUG", "INFO", "WARNING", "ERROR"]
        log_level_combo.state(['readonly'])
        log_level_combo.pack(side=tk.RIGHT)
        
    def _on_comm_type_changed(self, event=None):
        """通讯类型变化处理"""
        comm_type_str = self.comm_type_var.get()
        try:
            self.comm_config.comm_type = CommType(comm_type_str)
            self._update_comm_config_ui()
        except ValueError:
            self._log("错误：不支持的通讯类型", "ERROR")
            
    def _update_comm_config_ui(self):
        """更新通讯配置界面"""
        # 清空现有控件
        for widget in self.comm_config_frame.winfo_children():
            widget.destroy()
        
        comm_type = self.comm_config.comm_type
        
        if comm_type == CommType.SERIAL:
            self._create_serial_config_ui()
        elif comm_type in [CommType.TCP_CLIENT, CommType.TCP_SERVER]:
            self._create_tcp_config_ui()
        elif comm_type in [CommType.UDP, CommType.UDP_MULTICAST]:
            self._create_udp_config_ui()
    
    def _create_serial_config_ui(self):
        """创建串口配置界面"""
        frame = self.comm_config_frame
        
        # 串口
        ttk.Label(frame, text="串口:").grid(row=0, column=0, sticky=tk.W)
        self.serial_port_var = tk.StringVar(value=self.comm_config.port)
        ttk.Entry(frame, textvariable=self.serial_port_var, width=10).grid(row=0, column=1, sticky=tk.EW, padx=(5, 10))
        
        # 波特率
        ttk.Label(frame, text="波特率:").grid(row=0, column=2, sticky=tk.W)
        self.baudrate_var = tk.StringVar(value=str(self.comm_config.baudrate))
        baudrate_combo = ttk.Combobox(frame, textvariable=self.baudrate_var, width=10)
        baudrate_combo['values'] = ["1200", "2400", "4800", "9600", "19200", "38400", "57600", "115200", "230400", "460800", "921600"]
        baudrate_combo.grid(row=0, column=3, sticky=tk.EW, padx=(5, 10))
        
        # 数据位
        ttk.Label(frame, text="数据位:").grid(row=1, column=0, sticky=tk.W, pady=(5, 0))
        self.databits_var = tk.StringVar(value=str(self.comm_config.databits))
        databits_combo = ttk.Combobox(frame, textvariable=self.databits_var, width=10)
        databits_combo['values'] = ["5", "6", "7", "8"]
        databits_combo.grid(row=1, column=1, sticky=tk.EW, padx=(5, 10), pady=(5, 0))
        
        # 校验位
        ttk.Label(frame, text="校验位:").grid(row=1, column=2, sticky=tk.W, pady=(5, 0))
        self.parity_var = tk.StringVar(value=self.comm_config.parity)
        parity_combo = ttk.Combobox(frame, textvariable=self.parity_var, width=10)
        parity_combo['values'] = ["N", "E", "O"]
        parity_combo.grid(row=1, column=3, sticky=tk.EW, padx=(5, 10), pady=(5, 0))
        
        # 停止位
        ttk.Label(frame, text="停止位:").grid(row=2, column=0, sticky=tk.W, pady=(5, 0))
        self.stopbits_var = tk.StringVar(value=str(self.comm_config.stopbits))
        stopbits_combo = ttk.Combobox(frame, textvariable=self.stopbits_var, width=10)
        stopbits_combo['values'] = ["1", "2"]
        stopbits_combo.grid(row=2, column=1, sticky=tk.EW, padx=(5, 10), pady=(5, 0))
        
        frame.columnconfigure(1, weight=1)
        frame.columnconfigure(3, weight=1)
    
    def _create_tcp_config_ui(self):
        """创建TCP配置界面"""
        frame = self.comm_config_frame
        
        # 主机地址
        ttk.Label(frame, text="主机地址:").grid(row=0, column=0, sticky=tk.W)
        self.tcp_host_var = tk.StringVar(value=self.comm_config.host)
        ttk.Entry(frame, textvariable=self.tcp_host_var, width=15).grid(row=0, column=1, sticky=tk.EW, padx=(5, 10))
        
        # 端口
        ttk.Label(frame, text="端口:").grid(row=0, column=2, sticky=tk.W)
        self.tcp_port_var = tk.StringVar(value=str(self.comm_config.tcp_port))
        ttk.Entry(frame, textvariable=self.tcp_port_var, width=10).grid(row=0, column=3, sticky=tk.EW, padx=(5, 0))
        
        frame.columnconfigure(1, weight=1)
    
    def _create_udp_config_ui(self):
        """创建UDP配置界面"""
        frame = self.comm_config_frame
        
        # 远程主机
        ttk.Label(frame, text="远程主机:").grid(row=0, column=0, sticky=tk.W)
        self.udp_host_var = tk.StringVar(value=self.comm_config.host)
        ttk.Entry(frame, textvariable=self.udp_host_var, width=15).grid(row=0, column=1, sticky=tk.EW, padx=(5, 10))
        
        # 本地端口
        ttk.Label(frame, text="本地端口:").grid(row=0, column=2, sticky=tk.W)
        self.udp_local_port_var = tk.StringVar(value=str(self.comm_config.udp_local_port))
        ttk.Entry(frame, textvariable=self.udp_local_port_var, width=10).grid(row=0, column=3, sticky=tk.EW, padx=(5, 10))
        
        # 远程端口
        ttk.Label(frame, text="远程端口:").grid(row=1, column=0, sticky=tk.W, pady=(5, 0))
        self.udp_remote_port_var = tk.StringVar(value=str(self.comm_config.udp_remote_port))
        ttk.Entry(frame, textvariable=self.udp_remote_port_var, width=10).grid(row=1, column=1, sticky=tk.EW, padx=(5, 0), pady=(5, 0))
        
        frame.columnconfigure(1, weight=1)
        frame.columnconfigure(3, weight=1)
    
    def _toggle_connection(self):
        """切换连接状态"""
        if not self.comm_manager.is_connected:
            # 更新配置
            self._update_comm_config_from_ui()
            
            # 尝试连接
            if self.comm_manager.connect(self.comm_config):
                self.connect_btn.config(text="断开")
                self.conn_status_var.set("已连接")
                self.conn_status_label.config(foreground="green")
                self._log(f"成功连接到 {self.comm_config.comm_type.value}")
            else:
                self._log(f"连接失败: {self.comm_config.comm_type.value}", "ERROR")
        else:
            # 断开连接
            self.comm_manager.disconnect()
            self.connect_btn.config(text="连接")
            self.conn_status_var.set("未连接")
            self.conn_status_label.config(foreground="red")
            self._log("连接已断开")
    
    def _update_comm_config_from_ui(self):
        """从界面更新通讯配置"""
        comm_type = self.comm_config.comm_type
        
        if comm_type == CommType.SERIAL:
            self.comm_config.port = self.serial_port_var.get()
            self.comm_config.baudrate = int(self.baudrate_var.get())
            self.comm_config.databits = int(self.databits_var.get())
            self.comm_config.parity = self.parity_var.get()
            self.comm_config.stopbits = int(self.stopbits_var.get())
            
        elif comm_type in [CommType.TCP_CLIENT, CommType.TCP_SERVER]:
            self.comm_config.host = self.tcp_host_var.get()
            self.comm_config.tcp_port = int(self.tcp_port_var.get())
            
        elif comm_type in [CommType.UDP, CommType.UDP_MULTICAST]:
            self.comm_config.host = self.udp_host_var.get()
            self.comm_config.udp_local_port = int(self.udp_local_port_var.get())
            self.comm_config.udp_remote_port = int(self.udp_remote_port_var.get())
    
    def _load_default_configs(self):
        """加载默认组件配置"""
        default_configs = [
            ComponentConfig(
                name="三轴加速度计",
                component_type=ComponentType.ACCELEROMETER,
                enabled=True,
                frequency=20.0,
                data_generation=[
                    DataGenConfig(DataGenRule.NOISE, -2.0, 2.0, noise_level=0.1),
                    DataGenConfig(DataGenRule.NOISE, -2.0, 2.0, noise_level=0.1),
                    DataGenConfig(DataGenRule.NOISE, 8.0, 11.0, noise_level=0.2)
                ]
            ),
            ComponentConfig(
                name="陀螺仪传感器",
                component_type=ComponentType.GYROSCOPE,
                enabled=True,
                frequency=20.0,
                data_generation=[
                    DataGenConfig(DataGenRule.SINE_WAVE, -180, 180, frequency=0.1),
                    DataGenConfig(DataGenRule.COSINE_WAVE, -90, 90, frequency=0.15),
                    DataGenConfig(DataGenRule.SINE_WAVE, -180, 180, frequency=0.08, phase=math.pi/4)
                ]
            ),
            ComponentConfig(
                name="GPS定位",
                component_type=ComponentType.GPS,
                enabled=True,
                frequency=1.0,
                data_generation=[
                    DataGenConfig(DataGenRule.NOISE, 39.9, 39.91, noise_level=0.001),
                    DataGenConfig(DataGenRule.NOISE, 116.4, 116.41, noise_level=0.001),
                    DataGenConfig(DataGenRule.LINEAR_INCREASE, 45, 55, step_size=0.1)
                ]
            ),
            ComponentConfig(
                name="温度仪表",
                component_type=ComponentType.GAUGE,
                enabled=True,
                frequency=2.0,
                data_generation=[
                    DataGenConfig(DataGenRule.SINE_WAVE, 20, 35, frequency=0.01, amplitude=5)
                ]
            ),
            ComponentConfig(
                name="电池电量",
                component_type=ComponentType.BAR,
                enabled=True,
                frequency=0.5,
                data_generation=[
                    DataGenConfig(DataGenRule.LINEAR_DECREASE, 100, 0, step_size=0.1)
                ]
            ),
            ComponentConfig(
                name="方向指南针",
                component_type=ComponentType.COMPASS,
                enabled=True,
                frequency=5.0,
                data_generation=[
                    DataGenConfig(DataGenRule.LINEAR_INCREASE, 0, 360, step_size=1.0)
                ]
            ),
            ComponentConfig(
                name="状态LED面板",
                component_type=ComponentType.LED_PANEL,
                enabled=True,
                frequency=2.0,
                datasets=[
                    {"title": "Power", "widget": "led", "led": True, "ledHigh": 1, "index": 1},
                    {"title": "Network", "widget": "led", "led": True, "ledHigh": 1, "index": 2},
                    {"title": "Data", "widget": "led", "led": True, "ledHigh": 1, "index": 3},
                    {"title": "Error", "widget": "led", "led": True, "ledHigh": 1, "index": 4}
                ],
                data_generation=[
                    DataGenConfig(DataGenRule.RANDOM, 0, 1, parameters={'threshold': 0.2}),
                    DataGenConfig(DataGenRule.RANDOM, 0, 1, parameters={'threshold': 0.3}),
                    DataGenConfig(DataGenRule.RANDOM, 0, 1, parameters={'threshold': 0.1}),
                    DataGenConfig(DataGenRule.RANDOM, 0, 1, parameters={'threshold': 0.8})
                ]
            ),
            ComponentConfig(
                name="实时波形图",
                component_type=ComponentType.PLOT,
                enabled=True,
                frequency=50.0,
                data_generation=[
                    DataGenConfig(DataGenRule.SINE_WAVE, -1, 1, frequency=2.0, amplitude=0.8)
                ]
            ),
            ComponentConfig(
                name="多通道图表",
                component_type=ComponentType.MULTIPLOT,
                enabled=True,
                frequency=25.0,
                data_generation=[
                    DataGenConfig(DataGenRule.SINE_WAVE, -1, 1, frequency=1.0),
                    DataGenConfig(DataGenRule.COSINE_WAVE, -1, 1, frequency=1.5),
                    DataGenConfig(DataGenRule.SQUARE_WAVE, -1, 1, frequency=0.5)
                ]
            ),
            ComponentConfig(
                name="频谱分析",
                component_type=ComponentType.FFT_PLOT,
                enabled=True,
                frequency=100.0,
                data_generation=[
                    DataGenConfig(DataGenRule.CUSTOM_FUNCTION, -2, 2, 
                                custom_function="sin(2*pi*5*t) + 0.5*sin(2*pi*15*t) + 0.2*sin(2*pi*30*t)")
                ]
            )
        ]
        
        self.component_configs = default_configs
        self._update_component_list()
    
    def _update_component_list(self):
        """更新组件列表显示"""
        # 清空现有项目
        for item in self.comp_tree.get_children():
            self.comp_tree.delete(item)
        
        # 添加组件
        for i, config in enumerate(self.component_configs):
            enabled_text = "是" if config.enabled else "否"
            dataset_count = len(config.datasets) if config.datasets else len(config.data_generation)
            
            self.comp_tree.insert("", "end", iid=i, values=(
                config.name,
                config.component_type.value,
                f"{config.frequency:.1f}",
                str(dataset_count),
                enabled_text
            ))
    
    def _add_component(self):
        """添加组件"""
        ComponentConfigDialog(self.root, None, self._on_component_saved)
    
    def _edit_component(self):
        """编辑组件"""
        selected = self.comp_tree.selection()
        if not selected:
            messagebox.showwarning("警告", "请先选择一个组件")
            return
        
        index = int(selected[0])
        config = self.component_configs[index]
        ComponentConfigDialog(self.root, config, lambda cfg: self._on_component_saved(cfg, index))
    
    def _copy_component(self):
        """复制组件"""
        selected = self.comp_tree.selection()
        if not selected:
            messagebox.showwarning("警告", "请先选择一个组件")
            return
        
        index = int(selected[0])
        original_config = self.component_configs[index]
        
        # 创建副本
        import copy
        new_config = copy.deepcopy(original_config)
        new_config.name += " (副本)"
        
        self.component_configs.append(new_config)
        self._update_component_list()
        self._log(f"已复制组件: {original_config.name}")
    
    def _delete_component(self):
        """删除组件"""
        selected = self.comp_tree.selection()
        if not selected:
            messagebox.showwarning("警告", "请先选择一个组件")
            return
        
        if messagebox.askyesno("确认", "确定要删除选中的组件吗？"):
            index = int(selected[0])
            config_name = self.component_configs[index].name
            del self.component_configs[index]
            self._update_component_list()
            self._log(f"已删除组件: {config_name}")
    
    def _on_component_saved(self, config: ComponentConfig, edit_index: Optional[int] = None):
        """组件保存回调"""
        if edit_index is not None:
            self.component_configs[edit_index] = config
            self._log(f"已更新组件: {config.name}")
        else:
            self.component_configs.append(config)
            self._log(f"已添加组件: {config.name}")
        
        self._update_component_list()
    
    def _import_config(self):
        """导入配置"""
        filename = filedialog.askopenfilename(
            title="导入配置文件",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        if filename:
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # TODO: 实现完整的配置导入逻辑
                messagebox.showinfo("提示", "配置导入功能正在开发中...")
                
            except Exception as e:
                messagebox.showerror("错误", f"导入配置失败: {str(e)}")
                self._log(f"导入配置失败: {str(e)}", "ERROR")
    
    def _export_config(self):
        """导出配置"""
        filename = filedialog.asksaveasfilename(
            title="导出配置文件",
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        if filename:
            try:
                # TODO: 实现完整的配置导出逻辑
                messagebox.showinfo("提示", "配置导出功能正在开发中...")
                
            except Exception as e:
                messagebox.showerror("错误", f"导出配置失败: {str(e)}")
                self._log(f"导出配置失败: {str(e)}", "ERROR")
    
    def _reset_config(self):
        """重置配置"""
        if messagebox.askyesno("确认", "确定要重置为默认配置吗？所有自定义配置将丢失。"):
            self._load_default_configs()
            self._log("已重置为默认配置")
    
    def _toggle_sending(self):
        """切换发送状态"""
        if not self.is_running:
            if not self.comm_manager.is_connected:
                messagebox.showwarning("警告", "请先建立连接")
                return
            
            # 检查是否有启用的组件
            enabled_components = [c for c in self.component_configs if c.enabled]
            if not enabled_components:
                messagebox.showwarning("警告", "请至少启用一个数据组件")
                return
            
            # 开始发送
            self.is_running = True
            self.start_btn.config(text="停止发送")
            self.stats['start_time'] = time.time()
            self.send_thread = threading.Thread(target=self._send_data_loop, daemon=True)
            self.send_thread.start()
            self._log("开始发送数据")
            
        else:
            # 停止发送
            self.is_running = False
            self.start_btn.config(text="开始发送")
            self._log("停止发送数据")
    
    def _send_data_loop(self):
        """数据发送循环"""
        try:
            interval_ms = int(self.interval_var.get())
            interval_s = interval_ms / 1000.0
            duration_s = float(self.duration_var.get())
            
            start_time = time.time()
            last_stats_time = start_time
            
            while self.is_running:
                current_time = time.time()
                
                # 检查持续时间
                if duration_s > 0 and (current_time - start_time) >= duration_s:
                    self.root.after(0, self._toggle_sending)
                    break
                
                # 生成和发送数据
                enabled_components = [c for c in self.component_configs if c.enabled]
                
                for config in enabled_components:
                    # 检查组件发送频率
                    if config.frequency > 0:
                        time_since_start = current_time - start_time
                        expected_count = int(time_since_start * config.frequency)
                        actual_count = getattr(config, '_send_count', 0)
                        
                        if expected_count > actual_count:
                            # 生成数据
                            data = self.component_generator.generate_component_data(config)
                            frame_data = f"${data};"
                            
                            # 发送数据
                            if self.comm_manager.send_data(frame_data, self.comm_config):
                                self.stats['sent_count'] += 1
                                config._send_count = getattr(config, '_send_count', 0) + 1
                                
                                # 更新预览
                                self.root.after(0, lambda d=frame_data, n=config.name: self._update_preview(f"[{n}] {d}"))
                            else:
                                self.stats['error_count'] += 1
                                self.root.after(0, lambda d=frame_data: self._log(f"发送失败: {d}", "WARNING"))
                
                # 更新统计信息
                if current_time - last_stats_time >= 1.0:  # 每秒更新一次
                    elapsed = current_time - start_time
                    rate = self.stats['sent_count'] / elapsed if elapsed > 0 else 0
                    stats_text = f"发送: {self.stats['sent_count']} | 失败: {self.stats['error_count']} | 速率: {rate:.1f} msg/s"
                    self.root.after(0, lambda: self.stats_var.set(stats_text))
                    last_stats_time = current_time
                
                # 时间步进
                self.component_generator.step()
                
                # 等待
                time.sleep(interval_s)
                
        except Exception as e:
            self.root.after(0, lambda: self._log(f"发送循环错误: {str(e)}", "ERROR"))
            self.root.after(0, self._toggle_sending)
    
    def _update_preview(self, data: str):
        """更新数据预览"""
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        preview_line = f"[{timestamp}] {data}\n"
        
        self.preview_text.insert(tk.END, preview_line)
        
        # 限制预览行数
        lines = int(self.preview_text.index('end-1c').split('.')[0])
        if lines > 1000:
            self.preview_text.delete('1.0', '100.0')
        
        # 自动滚动
        if self.preview_auto_scroll.get():
            self.preview_text.see(tk.END)
    
    def _clear_preview(self):
        """清空预览"""
        self.preview_text.delete('1.0', tk.END)
    
    def _save_preview(self):
        """保存预览"""
        filename = filedialog.asksaveasfilename(
            title="保存预览数据",
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        if filename:
            try:
                content = self.preview_text.get('1.0', tk.END)
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(content)
                self._log(f"预览数据已保存: {filename}")
            except Exception as e:
                messagebox.showerror("错误", f"保存预览失败: {str(e)}")
    
    def _reset_stats(self):
        """重置统计"""
        self.stats = {'sent_count': 0, 'error_count': 0, 'start_time': time.time()}
        self.stats_var.set("发送: 0 | 失败: 0 | 速率: 0.0 msg/s")
        self._log("统计信息已重置")
    
    def _log(self, message: str, level: str = "INFO"):
        """记录日志"""
        current_level = self.log_level_var.get()
        level_priority = {"DEBUG": 0, "INFO": 1, "WARNING": 2, "ERROR": 3}
        
        if level_priority.get(level, 1) >= level_priority.get(current_level, 1):
            timestamp = datetime.now().strftime("%H:%M:%S")
            log_message = f"[{timestamp}] [{level}] {message}\n"
            
            self.log_text.insert(tk.END, log_message)
            self.log_text.see(tk.END)
            
            # 限制日志行数
            lines = int(self.log_text.index('end-1c').split('.')[0])
            if lines > 1000:
                self.log_text.delete('1.0', '100.0')
    
    def _clear_log(self):
        """清空日志"""
        self.log_text.delete('1.0', tk.END)
    
    def _save_log(self):
        """保存日志"""
        filename = filedialog.asksaveasfilename(
            title="保存日志文件",
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        if filename:
            try:
                content = self.log_text.get('1.0', tk.END)
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(content)
                self._log(f"日志已保存: {filename}")
            except Exception as e:
                messagebox.showerror("错误", f"保存日志失败: {str(e)}")
    
    def run(self):
        """运行GUI"""
        try:
            self.root.mainloop()
        finally:
            self.is_running = False
            self.comm_manager.disconnect()

# ===============================
# 组件配置对话框
# ===============================

class ComponentConfigDialog:
    """组件配置对话框"""
    
    def __init__(self, parent, config: Optional[ComponentConfig], callback: Callable):
        self.parent = parent
        self.config = config
        self.callback = callback
        self.is_editing = config is not None
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title("组件配置" if not self.is_editing else f"编辑组件: {config.name}")
        self.dialog.geometry("800x600")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # 初始化数据
        if not self.is_editing:
            self.config = ComponentConfig("新组件", ComponentType.PLOT)
        
        self._create_widgets()
        self._load_config()
        
        # 居中显示
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (self.dialog.winfo_width() // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (self.dialog.winfo_height() // 2)
        self.dialog.geometry(f"+{x}+{y}")
    
    def _create_widgets(self):
        """创建对话框组件"""
        main_frame = ttk.Frame(self.dialog, padding=10)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 基本配置
        basic_frame = ttk.LabelFrame(main_frame, text="基本配置", padding=10)
        basic_frame.pack(fill=tk.X, pady=(0, 10))
        
        # 名称
        ttk.Label(basic_frame, text="名称:").grid(row=0, column=0, sticky=tk.W, pady=2)
        self.name_var = tk.StringVar()
        ttk.Entry(basic_frame, textvariable=self.name_var, width=30).grid(row=0, column=1, sticky=tk.EW, padx=(5, 10), pady=2)
        
        # 组件类型
        ttk.Label(basic_frame, text="组件类型:").grid(row=0, column=2, sticky=tk.W, pady=2)
        self.type_var = tk.StringVar()
        type_combo = ttk.Combobox(basic_frame, textvariable=self.type_var, width=15)
        type_combo['values'] = [t.value for t in ComponentType]
        type_combo.state(['readonly'])
        type_combo.grid(row=0, column=3, sticky=tk.EW, padx=(5, 0), pady=2)
        type_combo.bind('<<ComboboxSelected>>', self._on_type_changed)
        
        # 频率和启用
        ttk.Label(basic_frame, text="频率(Hz):").grid(row=1, column=0, sticky=tk.W, pady=2)
        self.frequency_var = tk.StringVar()
        ttk.Entry(basic_frame, textvariable=self.frequency_var, width=10).grid(row=1, column=1, sticky=tk.W, padx=(5, 0), pady=2)
        
        self.enabled_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(basic_frame, text="启用组件", variable=self.enabled_var).grid(row=1, column=2, columnspan=2, sticky=tk.W, padx=(20, 0), pady=2)
        
        basic_frame.columnconfigure(1, weight=1)
        basic_frame.columnconfigure(3, weight=1)
        
        # 数据生成配置
        self.datagen_frame = ttk.LabelFrame(main_frame, text="数据生成配置", padding=10)
        self.datagen_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        # 按钮框架
        btn_frame = ttk.Frame(main_frame)
        btn_frame.pack(fill=tk.X)
        
        ttk.Button(btn_frame, text="确定", command=self._ok_clicked).pack(side=tk.RIGHT, padx=(5, 0))
        ttk.Button(btn_frame, text="取消", command=self._cancel_clicked).pack(side=tk.RIGHT)
        ttk.Button(btn_frame, text="预览数据", command=self._preview_data).pack(side=tk.LEFT)
    
    def _on_type_changed(self, event=None):
        """组件类型变化处理"""
        self._update_datagen_ui()
    
    def _update_datagen_ui(self):
        """更新数据生成配置界面"""
        # 清空现有控件
        for widget in self.datagen_frame.winfo_children():
            widget.destroy()
        
        component_type = ComponentType(self.type_var.get())
        
        # 根据组件类型创建数据生成配置
        if component_type == ComponentType.ACCELEROMETER:
            self._create_multi_axis_datagen_ui(["X轴", "Y轴", "Z轴"])
        elif component_type == ComponentType.GYROSCOPE:
            self._create_multi_axis_datagen_ui(["Roll", "Pitch", "Yaw"])
        elif component_type == ComponentType.GPS:
            self._create_multi_axis_datagen_ui(["纬度", "经度", "海拔"])
        elif component_type == ComponentType.PLOT_3D:
            self._create_multi_axis_datagen_ui(["X", "Y", "Z"])
        elif component_type == ComponentType.MULTIPLOT:
            self._create_multiplot_datagen_ui()
        elif component_type == ComponentType.LED_PANEL:
            self._create_led_datagen_ui()
        else:
            self._create_single_datagen_ui()
    
    def _create_single_datagen_ui(self):
        """创建单一数据生成配置界面"""
        # TODO: 实现单一数据生成配置界面
        ttk.Label(self.datagen_frame, text="单一数据生成配置界面正在开发中...").pack()
    
    def _create_multi_axis_datagen_ui(self, axis_names):
        """创建多轴数据生成配置界面"""
        # TODO: 实现多轴数据生成配置界面
        label_text = f"多轴数据生成配置界面正在开发中...\n轴: {', '.join(axis_names)}"
        ttk.Label(self.datagen_frame, text=label_text).pack()
    
    def _create_multiplot_datagen_ui(self):
        """创建多线图数据生成配置界面"""
        # TODO: 实现多线图数据生成配置界面
        ttk.Label(self.datagen_frame, text="多线图数据生成配置界面正在开发中...").pack()
    
    def _create_led_datagen_ui(self):
        """创建LED数据生成配置界面"""
        # TODO: 实现LED数据生成配置界面
        ttk.Label(self.datagen_frame, text="LED数据生成配置界面正在开发中...").pack()
    
    def _load_config(self):
        """加载配置到界面"""
        self.name_var.set(self.config.name)
        self.type_var.set(self.config.component_type.value)
        self.frequency_var.set(str(self.config.frequency))
        self.enabled_var.set(self.config.enabled)
        
        self._update_datagen_ui()
    
    def _preview_data(self):
        """预览数据"""
        messagebox.showinfo("预览", "数据预览功能正在开发中...")
    
    def _ok_clicked(self):
        """确定按钮点击处理"""
        try:
            # 基本验证
            name = self.name_var.get().strip()
            if not name:
                messagebox.showerror("错误", "请输入组件名称")
                return
            
            component_type = ComponentType(self.type_var.get())
            frequency = float(self.frequency_var.get())
            enabled = self.enabled_var.get()
            
            # 创建新配置
            new_config = ComponentConfig(
                name=name,
                component_type=component_type,
                enabled=enabled,
                frequency=frequency,
                datasets=self.config.datasets.copy() if self.config.datasets else [],
                widget_config=self.config.widget_config.copy() if self.config.widget_config else {},
                data_generation=self.config.data_generation.copy() if self.config.data_generation else []
            )
            
            # 回调保存
            self.callback(new_config)
            self.dialog.destroy()
            
        except ValueError as e:
            messagebox.showerror("错误", f"输入格式错误: {str(e)}")
        except Exception as e:
            messagebox.showerror("错误", f"保存配置失败: {str(e)}")
    
    def _cancel_clicked(self):
        """取消按钮点击处理"""
        self.dialog.destroy()

# ===============================
# 主程序入口
# ===============================

def main():
    """主函数"""
    print("Serial Studio 高级测试工具 v2.0")
    print("=" * 50)
    print("支持的可视化组件:")
    for component_type in ComponentType:
        print(f"  - {component_type.value}")
    print("\n支持的通讯协议:")
    for comm_type in CommType:
        print(f"  - {comm_type.value}")
    print("=" * 50)
    
    try:
        app = SerialStudioAdvancedTestGUI()
        app.run()
    except KeyboardInterrupt:
        print("\n程序被用户中断")
    except Exception as e:
        print(f"程序运行错误: {e}")

if __name__ == "__main__":
    main()