"""
通讯管理器

提供统一的通讯接口，支持多种通讯协议。
"""

import serial
import serial.tools.list_ports
import socket
import struct
import platform
from typing import Optional, List, Dict
from ..config.data_types import CommConfig, CommType

class CommunicationManager:
    """高级通讯管理器"""
    
    def __init__(self):
        self.connections = {}
        self.active_connection = None
        self.is_connected = False
    
    @staticmethod
    def get_available_serial_ports() -> List[Dict[str, str]]:
        """获取可用的串口列表（跨平台）"""
        ports = []
        try:
            available_ports = serial.tools.list_ports.comports()
            for port in available_ports:
                port_info = {
                    'device': port.device,
                    'description': port.description or '未知设备',
                    'hwid': port.hwid or '',
                    'manufacturer': getattr(port, 'manufacturer', '') or '',
                    'product': getattr(port, 'product', '') or '',
                    'serial_number': getattr(port, 'serial_number', '') or ''
                }
                ports.append(port_info)
        except Exception as e:
            print(f"获取串口列表失败: {e}")
        
        return ports
    
    @staticmethod
    def get_default_serial_port() -> Optional[str]:
        """获取默认串口（跨平台）"""
        try:
            available_ports = serial.tools.list_ports.comports()
            if not available_ports:
                return None
                
            # 按照优先级选择串口
            system = platform.system().lower()
            
            for port in available_ports:
                device = port.device.lower()
                description = (port.description or '').lower()
                
                # Windows: 优先选择USB串口
                if system == 'windows':
                    if 'usb' in description or 'ch340' in description or 'cp210' in description or 'ftdi' in description:
                        return port.device
                
                # Linux: 优先选择USB串口
                elif system == 'linux':
                    if device.startswith('/dev/ttyusb') or device.startswith('/dev/ttyacm'):
                        return port.device
                
                # macOS: 优先选择USB串口
                elif system == 'darwin':
                    if 'usb' in device or device.startswith('/dev/cu.usb'):
                        return port.device
            
            # 如果没有找到USB串口，返回第一个可用串口
            return available_ports[0].device
            
        except Exception as e:
            print(f"获取默认串口失败: {e}")
            return None
    
    @staticmethod
    def get_common_serial_baudrates() -> List[int]:
        """获取常用波特率列表"""
        return [
            300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 28800,
            38400, 57600, 115200, 230400, 460800, 921600
        ]
    
    @staticmethod 
    def get_serial_databits_options() -> List[int]:
        """获取数据位选项"""
        return [5, 6, 7, 8]
    
    @staticmethod
    def get_serial_parity_options() -> Dict[str, str]:
        """获取校验位选项"""
        return {
            'N': '无校验',
            'E': '偶校验', 
            'O': '奇校验',
            'M': 'Mark校验',
            'S': 'Space校验'
        }
    
    @staticmethod
    def get_serial_stopbits_options() -> List[float]:
        """获取停止位选项"""
        return [1, 1.5, 2]
        
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
            # 验证串口是否存在
            available_ports = [p.device for p in serial.tools.list_ports.comports()]
            if config.port not in available_ports:
                print(f"串口 {config.port} 不存在。可用串口: {available_ports}")
                return False
            
            # 校验位映射
            parity_map = {
                'N': serial.PARITY_NONE, 
                'E': serial.PARITY_EVEN, 
                'O': serial.PARITY_ODD,
                'M': serial.PARITY_MARK,
                'S': serial.PARITY_SPACE
            }
            
            # 停止位映射
            stopbits_map = {
                1: serial.STOPBITS_ONE,
                1.5: serial.STOPBITS_ONE_POINT_FIVE,
                2: serial.STOPBITS_TWO
            }
            
            conn = serial.Serial(
                port=config.port,
                baudrate=config.baudrate,
                bytesize=config.databits,
                parity=parity_map.get(config.parity, serial.PARITY_NONE),
                stopbits=stopbits_map.get(config.stopbits, serial.STOPBITS_ONE),
                timeout=config.timeout,
                write_timeout=config.timeout
            )
            
            # 测试连接
            if conn.is_open:
                self.active_connection = conn
                self.is_connected = True
                print(f"串口连接成功: {config.port} @ {config.baudrate}bps")
                return True
            else:
                print(f"串口 {config.port} 打开失败")
                return False
                
        except serial.SerialException as e:
            print(f"串口连接失败: {e}")
            return False
        except Exception as e:
            print(f"串口连接异常: {e}")
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