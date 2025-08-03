# 终端组件 (Terminal)

## 概述

终端组件提供完整的VT-100终端仿真功能，支持ANSI转义序列、文本选择、自动滚动、自定义字体等特性。适用于调试输出、日志显示、命令行交互等场景。

## 数据格式要求

### 组件配置

终端组件不需要特定的数据集配置，它会显示接收到的所有原始数据流：

```json
{
    "title": "Debug Terminal",
    "widget": "terminal"
}
```

### 核心属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `font` | QFont | 系统默认 | 终端字体 |
| `charWidth` | int | 自动计算 | 字符宽度（像素） |
| `charHeight` | int | 自动计算 | 字符高度（像素） |
| `autoscroll` | bool | true | 自动滚动到底部 |
| `vt100emulation` | bool | true | VT-100仿真模式 |
| `scrollOffsetY` | int | 0 | 滚动偏移量 |
| `copyAvailable` | bool | false | 是否有文本可复制 |

## VT-100仿真功能

### 支持的转义序列

| 序列 | 功能 | 示例 |
|------|------|------|
| `\033[2J` | 清屏 | `printf("\033[2J");` |
| `\033[H` | 光标归位 | `printf("\033[H");` |
| `\033[<row>;<col>H` | 光标定位 | `printf("\033[10;20H");` |
| `\033[<n>A` | 光标上移 | `printf("\033[3A");` |
| `\033[<n>B` | 光标下移 | `printf("\033[3B");` |
| `\033[<n>C` | 光标右移 | `printf("\033[3C");` |
| `\033[<n>D` | 光标左移 | `printf("\033[3D");` |
| `\033[0m` | 重置格式 | `printf("\033[0m");` |

### 颜色支持

```bash
# 前景色
\033[30m  # 黑色
\033[31m  # 红色  
\033[32m  # 绿色
\033[33m  # 黄色
\033[34m  # 蓝色
\033[35m  # 洋红
\033[36m  # 青色
\033[37m  # 白色

# 背景色  
\033[40m  # 黑色背景
\033[41m  # 红色背景
\033[42m  # 绿色背景
\033[43m  # 黄色背景
\033[44m  # 蓝色背景
\033[45m  # 洋红背景
\033[46m  # 青色背景
\033[47m  # 白色背景

# 样式
\033[1m   # 加粗
\033[4m   # 下划线
\033[7m   # 反色
```

### 状态机处理

```cpp
enum State {
    Text,        // 普通文本状态
    Escape,      // 转义序列开始
    Format,      // 格式控制序列
    ResetFont    // 字体重置序列
};
```

## 测试数据示例

### 基本文本输出

```bash
# 普通文本
Hello, World!
System initialized successfully.
```

### 彩色文本输出

```bash
# 红色错误信息
\033[31mError: Connection failed\033[0m

# 绿色成功信息  
\033[32mSuccess: Data uploaded\033[0m

# 黄色警告信息
\033[33mWarning: Low battery\033[0m
```

### 格式化输出

```bash
# 表格输出
\033[1mName\033[0m    \033[1mValue\033[0m   \033[1mStatus\033[0m
Temperature  25.6°C   \033[32mOK\033[0m
Humidity     65.2%    \033[32mOK\033[0m  
Pressure     1013hPa  \033[33mWARN\033[0m
```

### 实时日志输出

```bash
[2024-01-15 10:30:15] INFO: System startup
[2024-01-15 10:30:16] INFO: Loading configuration...
[2024-01-15 10:30:17] \033[32mINFO: Configuration loaded\033[0m
[2024-01-15 10:30:18] \033[33mWARN: Temperature high\033[0m
[2024-01-15 10:30:19] \033[31mERROR: Sensor disconnected\033[0m
```

### 动画效果

```python
# Python生成进度条动画
import time

for i in range(101):
    bar = '█' * (i // 2) + '░' * (50 - i // 2)
    print(f'\r\033[36mProgress: [{bar}] {i}%\033[0m', end='', flush=True)
    time.sleep(0.1)
```

## 字体配置

### 推荐字体

```cpp
// 等宽字体推荐
QFont("Consolas", 10);          // Windows
QFont("Monaco", 10);            // macOS  
QFont("Ubuntu Mono", 10);       // Linux
QFont("DejaVu Sans Mono", 10);  // 跨平台
```

### 字体大小计算

```cpp
// 字符尺寸计算
QFontMetrics metrics(font);
int charWidth = metrics.horizontalAdvance('M');
int charHeight = metrics.height();
int lineSpacing = metrics.lineSpacing();
```

### 自定义字体

```json
{
    "font": {
        "family": "Fira Code",
        "size": 12,
        "weight": "normal",
        "italic": false
    }
}
```

## 交互功能

### 文本选择

- **鼠标拖拽**：选择文本
- **双击**：选择单词
- **三击**：选择整行
- **Ctrl+A**：全选

### 滚动控制

```cpp
// 滚动参数
int scrollOffsetY() const;              // 当前滚动位置
void setScrollOffsetY(const int offset); // 设置滚动位置

// 自动滚动
bool autoscroll() const;
void setAutoscroll(const bool enabled);
```

### 复制功能

```cpp
// 复制到剪贴板
void copy();                  // 复制选中文本
bool copyAvailable() const;   // 是否有文本可复制
```

## 性能优化

### 缓冲区管理

```cpp
// 行缓冲区
QStringList m_data;
static const int MAX_LINES = 10000;

// 缓冲区清理
if (m_data.size() > MAX_LINES) {
    m_data.removeFirst();
}
```

### 渲染优化

```cpp
// 只渲染可见区域
int visibleLines = height() / charHeight;
int startLine = scrollOffsetY / charHeight;
int endLine = qMin(startLine + visibleLines + 1, m_data.size());
```

### 更新频率限制

```cpp
// 限制更新频率
static QElapsedTimer updateTimer;
if (updateTimer.elapsed() < 16) return;  // 最大60FPS
updateTimer.restart();
```

## 主题配置

### 调色板设置

```cpp
// 默认调色板
QPalette darkPalette;
darkPalette.setColor(QPalette::Base, QColor(30, 30, 30));
darkPalette.setColor(QPalette::Text, QColor(220, 220, 220));

QPalette lightPalette;  
lightPalette.setColor(QPalette::Base, QColor(255, 255, 255));
lightPalette.setColor(QPalette::Text, QColor(30, 30, 30));
```

### 自定义主题

```json
{
    "theme": {
        "background": "#1e1e1e",
        "foreground": "#d4d4d4", 
        "selection": "#264f78",
        "cursor": "#ffffff"
    }
}
```

## 数据处理

### 编码支持

```cpp
// 支持的文本编码
QTextCodec::setCodecForLocale(QTextCodec::codecForName("UTF-8"));

// 处理不同编码
QByteArray rawData = ...;
QString text = QString::fromUtf8(rawData);
```

### 行结束符处理

```cpp
// 处理不同平台的行结束符
text.replace("\r\n", "\n");  // Windows
text.replace("\r", "\n");    // macOS Classic
// Unix/Linux 使用 \n
```

## 使用注意事项

1. **编码一致性**：确保数据编码与终端编码一致
2. **缓冲区大小**：合理设置最大行数避免内存溢出
3. **更新频率**：避免过高的文本更新频率影响性能
4. **VT-100兼容性**：确保转义序列符合VT-100标准
5. **字体选择**：使用等宽字体保证对齐效果
6. **滚动性能**：大量文本时注意滚动性能

## 错误处理

### 常见错误
- 非UTF-8编码数据导致乱码
- VT-100转义序列格式错误
- 文本更新频率过高导致界面卡顿

### 调试建议
- 检查文本编码格式
- 验证转义序列的正确性
- 监控文本更新频率和缓冲区大小

## 示例项目配置

### 调试终端

```json
{
    "title": "Debug Console",
    "widget": "terminal",
    "font": {
        "family": "Consolas",
        "size": 10
    },
    "autoscroll": true,
    "vt100emulation": true,
    "maxLines": 5000
}
```

### 日志显示器

```json
{
    "title": "System Log Viewer", 
    "widget": "terminal",
    "font": {
        "family": "Ubuntu Mono",
        "size": 9
    },
    "autoscroll": true,
    "vt100emulation": false,
    "maxLines": 10000
}
```

### 彩色输出终端

```json
{
    "title": "Colorized Output",
    "widget": "terminal",
    "font": {
        "family": "Fira Code",
        "size": 11
    },
    "autoscroll": true,
    "vt100emulation": true,
    "theme": "dark"
}
```