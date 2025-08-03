# 数据网格组件 (DataGrid)

## 概述

数据网格组件以表格形式显示所有数据集的当前值，提供数据概览和详细信息查看功能。支持暂停更新、数据排序、实时状态显示等功能，适用于系统监控、数据记录、状态总览等场景。

## 数据格式要求

### 组件配置

数据网格组件会自动包含组内所有数据集，无需特殊配置：

```json
{
    "title": "System Status Overview",
    "widget": "datagrid"
}
```

### 核心属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `paused` | bool | false | 是否暂停数据更新 |

## 表格结构

### 标准列定义

数据网格包含以下标准列：

| 列名 | 内容 | 说明 |
|------|------|------|
| Dataset | 数据集标题 | 显示数据集的标题 |
| Value | 当前值 | 显示数据集的当前数值 |
| Units | 单位 | 显示数据的单位 |
| Timestamp | 时间戳 | 最后更新时间 |

### 扩展列（可选）

```cpp
// 可选的扩展列
enum ExtendedColumns {
    Status,      // 状态（正常/报警/离线）
    MinValue,    // 最小值
    MaxValue,    // 最大值
    Average,     // 平均值
    Trend        // 趋势（上升/下降/稳定）
};
```

## 数据行生成

### 标准数据行

```cpp
// 为每个数据集生成表格行
QStringList getRow(const JSON::Dataset &dataset) {
    QStringList row;
    
    // 数据集标题
    row << dataset.title();
    
    // 当前值（格式化显示）
    QString valueStr = formatValue(dataset.value(), dataset.units());
    row << valueStr;
    
    // 单位
    row << dataset.units();
    
    // 时间戳
    row << QDateTime::currentDateTime().toString("hh:mm:ss");
    
    return row;
}
```

### 数值格式化

```cpp
// 数值格式化函数
QString formatValue(const QString &value, const QString &units) {
    bool ok;
    double numValue = value.toDouble(&ok);
    
    if (ok) {
        // 根据数值大小选择精度
        if (qAbs(numValue) >= 1000) {
            return QString::number(numValue, 'f', 1);
        } else if (qAbs(numValue) >= 1) {
            return QString::number(numValue, 'f', 2);
        } else {
            return QString::number(numValue, 'f', 3);
        }
    }
    
    return value; // 原样返回非数值
}
```

## 状态指示

### 数据状态

```cpp
enum DataStatus {
    Normal,      // 正常状态（绿色）
    Warning,     // 警告状态（黄色）
    Alarm,       // 报警状态（红色）
    Offline,     // 离线状态（灰色）
    Unknown      // 未知状态
};

DataStatus getDatasetStatus(const JSON::Dataset &dataset) {
    // 检查是否超过报警值
    if (dataset.alarm() > 0) {
        double value = dataset.value().toDouble();
        if (value >= dataset.alarm()) {
            return Alarm;
        } else if (value >= dataset.alarm() * 0.8) {
            return Warning;
        }
    }
    
    // 检查数据时效性
    if (isDataStale(dataset)) {
        return Offline;
    }
    
    return Normal;
}
```

### 视觉指示

```cpp
// 根据状态设置行颜色
void applyRowStyling(QTableWidgetItem *item, DataStatus status) {
    switch (status) {
    case Normal:
        item->setBackground(QColor(232, 245, 233)); // 浅绿色
        break;
    case Warning: 
        item->setBackground(QColor(255, 248, 225)); // 浅黄色
        break;
    case Alarm:
        item->setBackground(QColor(255, 235, 238)); // 浅红色
        break;
    case Offline:
        item->setBackground(QColor(245, 245, 245)); // 浅灰色
        item->setForeground(QColor(158, 158, 158)); // 灰色文字
        break;
    }
}
```

## 暂停功能

### 暂停控制

```cpp
// 暂停/恢复数据更新
void setPaused(const bool paused) {
    if (m_paused == paused) return;
    
    m_paused = paused;
    emit pausedChanged();
    
    if (paused) {
        // 暂停时显示暂停指示
        showPauseIndicator();
    } else {
        // 恢复时立即更新数据
        updateData();
        hidePauseIndicator();
    }
}
```

### 暂停指示器

```cpp
// 显示暂停状态
void showPauseIndicator() {
    // 在表格标题栏显示暂停图标
    QLabel *pauseIcon = new QLabel("⏸");
    pauseIcon->setStyleSheet("color: orange; font-size: 16px;");
    
    // 或者改变表格背景色
    setStyleSheet("QTableWidget { background-color: #FFF3E0; }");
}
```

## 数据更新

### 实时更新

```cpp
// 数据更新处理
void updateData() {
    if (m_paused) return; // 暂停时不更新
    
    const auto &frame = JSON::FrameBuilder::instance().frame();
    
    // 清空现有数据
    clearContents();
    setRowCount(0);
    
    // 遍历所有组和数据集
    for (const auto &group : frame.groups()) {
        for (const auto &dataset : group.datasets()) {
            addDatasetRow(dataset);
        }
    }
    
    // 调整列宽
    resizeColumnsToContents();
    
    // 更新时间戳
    updateTimestamp();
}
```

### 增量更新

```cpp
// 增量更新（仅更新变化的数据）
void incrementalUpdate() {
    if (m_paused) return;
    
    const auto &frame = JSON::FrameBuilder::instance().frame();
    
    for (int row = 0; row < rowCount(); ++row) {
        auto *titleItem = item(row, 0);
        if (!titleItem) continue;
        
        QString datasetTitle = titleItem->text();
        const auto &dataset = findDatasetByTitle(datasetTitle);
        
        if (dataset) {
            updateDatasetRow(row, dataset);
        }
    }
}
```

## 排序和过滤

### 列排序

```cpp
// 启用列排序
setSortingEnabled(true);

// 自定义排序比较
class NumericTableWidgetItem : public QTableWidgetItem {
public:
    bool operator<(const QTableWidgetItem &other) const override {
        bool thisOk, otherOk;
        double thisValue = text().toDouble(&thisOk);
        double otherValue = other.text().toDouble(&otherOk);
        
        if (thisOk && otherOk) {
            return thisValue < otherValue;
        }
        
        return QTableWidgetItem::operator<(other);
    }
};
```

### 数据过滤

```cpp
// 按状态过滤
enum FilterMode {
    ShowAll,
    ShowAlarms,
    ShowWarnings,
    ShowNormal,
    ShowOffline
};

void applyFilter(FilterMode mode) {
    for (int row = 0; row < rowCount(); ++row) {
        bool showRow = true;
        
        switch (mode) {
        case ShowAlarms:
            showRow = (getRowStatus(row) == Alarm);
            break;
        case ShowWarnings:
            showRow = (getRowStatus(row) == Warning);
            break;
        // ... 其他过滤条件
        }
        
        setRowHidden(row, !showRow);
    }
}
```

## 导出功能

### CSV导出

```cpp
// 导出为CSV格式
void exportToCSV(const QString &filename) {
    QFile file(filename);
    if (!file.open(QIODevice::WriteOnly | QIODevice::Text)) {
        return;
    }
    
    QTextStream out(&file);
    
    // 写入表头
    QStringList headers;
    for (int col = 0; col < columnCount(); ++col) {
        headers << horizontalHeaderItem(col)->text();
    }
    out << headers.join(",") << "\n";
    
    // 写入数据行
    for (int row = 0; row < rowCount(); ++row) {
        QStringList rowData;
        for (int col = 0; col < columnCount(); ++col) {
            QString cellText = item(row, col) ? item(row, col)->text() : "";
            // 处理包含逗号的字段
            if (cellText.contains(",")) {
                cellText = "\"" + cellText + "\"";
            }
            rowData << cellText;
        }
        out << rowData.join(",") << "\n";
    }
}
```

### Excel导出

```cpp
// 导出为Excel格式（需要第三方库）
void exportToExcel(const QString &filename) {
    // 使用xlsx库或COM接口
    // 这里仅示例基本结构
    
    auto workbook = createWorkbook();
    auto worksheet = workbook->addWorksheet("Data");
    
    // 写入数据
    for (int row = 0; row < rowCount(); ++row) {
        for (int col = 0; col < columnCount(); ++col) {
            QString cellText = item(row, col) ? item(row, col)->text() : "";
            worksheet->write(row + 1, col, cellText);
        }
    }
    
    workbook->save(filename);
}
```

## 性能优化

### 大数据量处理

```cpp
// 虚拟滚动（对于大数据量）
class VirtualTableWidget : public QTableWidget {
public:
    void setVirtualMode(bool enabled) {
        m_virtualMode = enabled;
        if (enabled) {
            // 只显示可见区域的数据
            connect(verticalScrollBar(), &QScrollBar::valueChanged,
                    this, &VirtualTableWidget::updateVisibleRows);
        }
    }
    
private:
    void updateVisibleRows() {
        if (!m_virtualMode) return;
        
        int topRow = verticalScrollBar()->value();
        int visibleRows = viewport()->height() / rowHeight(0);
        
        // 只更新可见行的数据
        for (int i = topRow; i < topRow + visibleRows && i < m_totalRows; ++i) {
            updateRow(i);
        }
    }
    
    bool m_virtualMode = false;
    int m_totalRows = 0;
};
```

### 更新频率控制

```cpp
// 限制更新频率
class ThrottledDataGrid : public DataGrid {
public:
    ThrottledDataGrid() {
        m_updateTimer.setSingleShot(true);
        m_updateTimer.setInterval(100); // 100ms最小更新间隔
        connect(&m_updateTimer, &QTimer::timeout,
                this, &ThrottledDataGrid::performUpdate);
    }
    
    void requestUpdate() {
        m_updatePending = true;
        if (!m_updateTimer.isActive()) {
            m_updateTimer.start();
        }
    }
    
private slots:
    void performUpdate() {
        if (m_updatePending) {
            updateData();
            m_updatePending = false;
        }
    }
    
private:
    QTimer m_updateTimer;
    bool m_updatePending = false;
};
```

## 使用注意事项

1. **数据量控制**：大量数据集时考虑分页或虚拟滚动
2. **更新频率**：避免过于频繁的全表更新影响性能
3. **暂停功能**：提供用户友好的暂停/恢复控制
4. **状态指示**：清晰的视觉状态指示便于快速识别问题
5. **导出功能**：根据需要提供数据导出功能
6. **响应式设计**：确保在不同屏幕尺寸下的可用性

## 错误处理

### 常见错误
- 数据更新过于频繁导致界面卡顿
- 大数据量时内存占用过高
- 暂停状态下数据不一致

### 调试建议
- 监控更新频率和性能指标
- 检查数据格式化的正确性
- 验证暂停/恢复功能的可靠性

## 示例项目配置

### 系统监控数据网格

```json
{
    "title": "System Monitor Grid",
    "widget": "datagrid",
    "columns": ["Dataset", "Value", "Units", "Status", "Timestamp"],
    "refreshInterval": 1000,
    "enablePause": true,
    "enableExport": true
}
```

### 传感器数据总览

```json
{
    "title": "Sensor Data Overview", 
    "widget": "datagrid",
    "showStatus": true,
    "enableSorting": true,
    "enableFiltering": true,
    "maxRows": 1000
}
```