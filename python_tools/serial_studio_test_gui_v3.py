#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Serial Studio 高级测试工具 - GUI版本 v3.0 (模块化版本)

使用模块化架构重构的Serial Studio测试工具，代码结构更清晰，更易维护和扩展。

支持所有13种可视化组件的精确数据格式和多种通讯协议。

主要改进：
- 模块化架构，各组件数据生成器独立
- 简化的主GUI文件
- 更好的代码组织和可维护性

作者: Claude Code Assistant
版本: 3.0
日期: 2025-01-29
"""

import sys
import time
import threading
from datetime import datetime
from typing import List, Optional, Callable

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog

# 导入模块化的组件
from modules import (
    ComponentType, CommType, DataGenConfig, ComponentConfig, CommConfig,
    DefaultConfigs, CommunicationManager, ComponentGeneratorFactory
)

class SerialStudioAdvancedTestGUI:
    """Serial Studio 高级测试工具GUI - 模块化版本"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Serial Studio 高级测试工具 v3.0 (模块化版本)")
        self.root.geometry("1400x900")
        
        # 初始化核心组件 - 使用工厂模式
        self.component_factory = ComponentGeneratorFactory()
        self.comm_manager = CommunicationManager()
        
        # 状态变量
        self.is_running = False
        self.send_thread = None
        self.component_configs: List[ComponentConfig] = []
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
        
        # 远程端口
        ttk.Label(frame, text="远程端口:").grid(row=0, column=2, sticky=tk.W)
        self.udp_remote_port_var = tk.StringVar(value=str(self.comm_config.udp_remote_port))
        ttk.Entry(frame, textvariable=self.udp_remote_port_var, width=10).grid(row=0, column=3, sticky=tk.EW, padx=(5, 0))
        
        frame.columnconfigure(1, weight=1)
    
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
            
        elif comm_type in [CommType.TCP_CLIENT, CommType.TCP_SERVER]:
            self.comm_config.host = self.tcp_host_var.get()
            self.comm_config.tcp_port = int(self.tcp_port_var.get())
            
        elif comm_type in [CommType.UDP, CommType.UDP_MULTICAST]:
            self.comm_config.host = self.udp_host_var.get()
            self.comm_config.udp_remote_port = int(self.udp_remote_port_var.get())
    
    def _load_default_configs(self):
        """加载默认配置"""
        # 使用模块化的默认配置
        self.component_configs = DefaultConfigs.get_default_component_configs()
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
        # 简化的组件配置对话框
        self._show_simple_component_dialog()
    
    def _edit_component(self):
        """编辑组件"""
        selected = self.comp_tree.selection()
        if not selected:
            messagebox.showwarning("警告", "请先选择一个组件")
            return
        
        index = int(selected[0])
        config = self.component_configs[index]
        self._show_simple_component_dialog(config, index)
    
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
    
    def _reset_config(self):
        """重置配置"""
        if messagebox.askyesno("确认", "确定要重置为默认配置吗？所有自定义配置将丢失。"):
            self._load_default_configs()
            self._log("已重置为默认配置")
    
    def _show_simple_component_dialog(self, config: Optional[ComponentConfig] = None, edit_index: Optional[int] = None):
        """显示简化的组件配置对话框"""
        dialog = tk.Toplevel(self.root)
        dialog.title("组件配置" if not config else f"编辑组件: {config.name}")
        dialog.geometry("500x400")
        dialog.transient(self.root)
        dialog.grab_set()
        
        # 基本配置
        basic_frame = ttk.LabelFrame(dialog, text="基本配置", padding=10)
        basic_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # 名称
        ttk.Label(basic_frame, text="名称:").grid(row=0, column=0, sticky=tk.W, pady=2)
        name_var = tk.StringVar(value=config.name if config else "新组件")
        ttk.Entry(basic_frame, textvariable=name_var, width=30).grid(row=0, column=1, sticky=tk.EW, padx=(5, 0), pady=2)
        
        # 组件类型
        ttk.Label(basic_frame, text="组件类型:").grid(row=1, column=0, sticky=tk.W, pady=2)
        type_var = tk.StringVar(value=config.component_type.value if config else ComponentType.PLOT.value)
        type_combo = ttk.Combobox(basic_frame, textvariable=type_var, width=27)
        type_combo['values'] = [t.value for t in ComponentType]
        type_combo.state(['readonly'])
        type_combo.grid(row=1, column=1, sticky=tk.EW, padx=(5, 0), pady=2)
        
        # 频率
        ttk.Label(basic_frame, text="频率(Hz):").grid(row=2, column=0, sticky=tk.W, pady=2)
        frequency_var = tk.StringVar(value=str(config.frequency) if config else "1.0")
        ttk.Entry(basic_frame, textvariable=frequency_var, width=30).grid(row=2, column=1, sticky=tk.EW, padx=(5, 0), pady=2)
        
        # 启用
        enabled_var = tk.BooleanVar(value=config.enabled if config else True)
        ttk.Checkbutton(basic_frame, text="启用组件", variable=enabled_var).grid(row=3, column=0, columnspan=2, sticky=tk.W, pady=5)
        
        basic_frame.columnconfigure(1, weight=1)
        
        # 按钮
        btn_frame = ttk.Frame(dialog)
        btn_frame.pack(fill=tk.X, padx=10, pady=10)
        
        def save_config():
            try:
                name = name_var.get().strip()
                if not name:
                    messagebox.showerror("错误", "请输入组件名称")
                    return
                
                component_type = ComponentType(type_var.get())
                frequency = float(frequency_var.get())
                enabled = enabled_var.get()
                
                # 创建新配置（使用原有的数据生成配置或默认配置）
                new_config = ComponentConfig(
                    name=name,
                    component_type=component_type,
                    enabled=enabled,
                    frequency=frequency,
                    datasets=config.datasets.copy() if config and config.datasets else [],
                    widget_config=config.widget_config.copy() if config and config.widget_config else {},
                    data_generation=config.data_generation.copy() if config and config.data_generation else []
                )
                
                # 保存配置
                if edit_index is not None:
                    self.component_configs[edit_index] = new_config
                    self._log(f"已更新组件: {name}")
                else:
                    self.component_configs.append(new_config)
                    self._log(f"已添加组件: {name}")
                
                self._update_component_list()
                dialog.destroy()
                
            except ValueError as e:
                messagebox.showerror("错误", f"输入格式错误: {str(e)}")
            except Exception as e:
                messagebox.showerror("错误", f"保存配置失败: {str(e)}")
        
        ttk.Button(btn_frame, text="确定", command=save_config).pack(side=tk.RIGHT, padx=(5, 0))
        ttk.Button(btn_frame, text="取消", command=dialog.destroy).pack(side=tk.RIGHT)
        
        # 居中显示
        dialog.update_idletasks()
        x = (dialog.winfo_screenwidth() // 2) - (dialog.winfo_width() // 2)
        y = (dialog.winfo_screenheight() // 2) - (dialog.winfo_height() // 2)
        dialog.geometry(f"+{x}+{y}")
    
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
        """数据发送循环 - 使用模块化的组件工厂"""
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
                
                # 生成和发送数据 - 使用组件工厂
                enabled_components = [c for c in self.component_configs if c.enabled]
                
                for config in enabled_components:
                    # 检查组件发送频率
                    if config.frequency > 0:
                        time_since_start = current_time - start_time
                        expected_count = int(time_since_start * config.frequency)
                        actual_count = getattr(config, '_send_count', 0)
                        
                        if expected_count > actual_count:
                            # 使用组件工厂生成数据
                            data = self.component_factory.generate_component_data(config)
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
                
                # 全局时间步进
                self.component_factory.step()
                
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
    
    def run(self):
        """运行GUI"""
        try:
            self.root.mainloop()
        finally:
            self.is_running = False
            self.comm_manager.disconnect()

def main():
    """主函数"""
    print("Serial Studio 高级测试工具 v3.0 (模块化版本)")
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