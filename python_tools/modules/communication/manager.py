"""
通讯管理器

提供统一的通讯接口，支持多种通讯协议。
"""

import serial
import socket
import struct
from typing import Optional
from ..config.data_types import CommConfig, CommType

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