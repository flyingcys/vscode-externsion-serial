# JSON 模块深度分析

## 模块概述

JSON 模块是 Serial-Studio 的数据建模和配置管理核心，负责项目配置的定义、数据帧的解析和构建、以及可视化组件的数据模型管理。该模块采用 JSON 格式作为配置文件标准，提供了灵活的数据结构定义和强大的 JavaScript 解析引擎。

## 架构设计

```
JSON 模块架构
├── ProjectModel (项目模型管理器)
│   ├── 项目文件管理
│   ├── 配置数据验证
│   ├── 用户界面模型
│   └── 编辑器状态管理
├── Frame (数据帧)
│   ├── 帧结构定义
│   ├── 序列化/反序列化
│   └── 结构比较和验证
├── FrameBuilder (帧构建器)
│   ├── 实时数据处理
│   ├── 多模式支持
│   └── JavaScript 解析引擎集成
├── FrameParser (帧解析器)
│   ├── JavaScript 代码编辑器
│   ├── 语法高亮和智能感知
│   └── 安全的脚本执行环境
├── 数据模型层
│   ├── Group (数据组)
│   ├── Dataset (数据集)
│   └── Action (动作)
└── 扩展功能
    ├── 快速绘图模式
    ├── 商业功能集成
    └── 自定义解析脚本
```

## 核心类分析

### 1. JSON::ProjectModel 项目模型管理器

**功能概述**：项目配置的中央管理器，负责JSON项目文件的加载、保存、编辑和模型管理。

**文件位置**：`app/src/JSON/ProjectModel.h`, `app/src/JSON/ProjectModel.cpp`

**设计模式**：单例模式 + 观察者模式

**核心特性**：
- 统一的项目配置管理
- 多种编辑视图支持
- 实时数据模型更新
- 撤销/重做功能
- 配置验证和错误处理

**类定义结构**：

```cpp
class ProjectModel : public QObject
{
  Q_OBJECT
  
  // 核心属性
  Q_PROPERTY(bool modified READ modified NOTIFY modifiedChanged)
  Q_PROPERTY(QString title READ title NOTIFY titleChanged)
  Q_PROPERTY(QString jsonFilePath READ jsonFilePath NOTIFY jsonFileChanged)
  Q_PROPERTY(QString jsonFileName READ jsonFileName NOTIFY jsonFileChanged)
  
  // 数据模型属性
  Q_PROPERTY(CustomModel* groupModel READ groupModel NOTIFY groupModelChanged)
  Q_PROPERTY(CustomModel* actionModel READ actionModel NOTIFY actionModelChanged)
  Q_PROPERTY(CustomModel* projectModel READ projectModel NOTIFY projectModelChanged)
  Q_PROPERTY(CustomModel* datasetModel READ datasetModel NOTIFY datasetModelChanged)
  Q_PROPERTY(CustomModel* treeModel READ treeModel NOTIFY treeModelChanged)
  Q_PROPERTY(QItemSelectionModel* selectionModel READ selectionModel NOTIFY treeModelChanged)
  
  // 视图状态属性
  Q_PROPERTY(CurrentView currentView READ currentView NOTIFY currentViewChanged)
  Q_PROPERTY(QString selectedText READ selectedText NOTIFY currentViewChanged)
  Q_PROPERTY(QString selectedIcon READ selectedIcon NOTIFY currentViewChanged)
  
  // 统计信息属性
  Q_PROPERTY(int groupCount READ groupCount NOTIFY modifiedChanged)
  Q_PROPERTY(int datasetCount READ datasetCount NOTIFY modifiedChanged)
  Q_PROPERTY(bool containsCommercialFeatures READ containsCommercialFeatures NOTIFY modifiedChanged)

public:
  static ProjectModel &instance();
  
  // 视图枚举
  enum CurrentView {
    ProjectView,      // 项目总览视图
    GroupView,        // 数据组编辑视图
    DatasetView,      // 数据集编辑视图
    FrameParserView,  // 帧解析器视图
    ActionView        // 动作编辑视图
  };
  
  // 编辑器部件类型
  enum EditorWidget {
    TextField,        // 文本输入框
    HexTextField,     // 十六进制输入框
    IntField,         // 整数输入框
    FloatField,       // 浮点数输入框
    CheckBox,         // 复选框
    ComboBox,         // 下拉框
    IconPicker        // 图标选择器
  };
  
  // 自定义角色
  enum CustomRoles {
    TreeViewIcon = 0x01,
    TreeViewText = 0x02,
    TreeViewExpanded = 0x03,
    TreeViewFrameIndex = 0x04,
    
    ParameterName = 0x10,
    EditableValue = 0x11,
    ParameterType = 0x12,
    PlaceholderValue = 0x13,
    ParameterDescription = 0x14,
    ParameterIcon = 0x15,
    
    WidgetType = 0x20,
    ComboBoxData = 0x21
  };
  
  // 核心方法
  bool modified() const;
  CurrentView currentView() const;
  QString title() const;
  QString jsonFilePath() const;
  QString jsonFileName() const;
  
  // 模型访问
  CustomModel *treeModel() const;
  CustomModel *groupModel() const;
  CustomModel *actionModel() const;
  CustomModel *projectModel() const;
  CustomModel *datasetModel() const;
  QItemSelectionModel *selectionModel() const;
  
  // 统计信息
  int groupCount() const;
  int datasetCount() const;
  bool containsCommercialFeatures() const;

public slots:
  // 文件操作
  void newJsonFile();
  void openJsonFile();
  void openJsonFile(const QString &path);
  bool saveJsonFile(const bool askPath = false);
  
  // 项目编辑
  void addGroup(const QString &title, const SerialStudio::GroupWidget widget);
  void addDataset(const SerialStudio::DatasetOption options);
  void addAction();
  
  void deleteCurrentGroup();
  void deleteCurrentDataset();
  void deleteCurrentAction();
  
  void duplicateCurrentGroup();
  void duplicateCurrentDataset();
  void duplicateCurrentAction();
  
  // 视图管理
  void displayFrameParserView();
  void buildTreeModel();
  void buildProjectModel();
  void buildGroupModel(const JSON::Group &group);
  void buildActionModel(const JSON::Action &action);
  void buildDatasetModel(const JSON::Dataset &dataset);
};
```

**关键实现逻辑**：

1. **项目文件管理**：
   ```cpp
   void ProjectModel::openJsonFile(const QString &path)
   {
     QFile file(path);
     if (file.open(QIODevice::ReadOnly)) {
       QJsonDocument doc = QJsonDocument::fromJson(file.readAll());
       if (!doc.isNull()) {
         // 解析JSON并构建数据模型
         parseJsonProject(doc.object());
         m_filePath = path;
         setModified(false);
         emit jsonFileChanged();
       }
     }
   }
   ```

2. **数据模型构建**：
   ```cpp
   void ProjectModel::buildTreeModel()
   {
     m_treeModel->clear();
     
     // 构建项目根节点
     auto *projectItem = new QStandardItem();
     projectItem->setData(m_title, TreeViewText);
     projectItem->setData(":/icons/project.svg", TreeViewIcon);
     m_treeModel->appendRow(projectItem);
     
     // 构建数据组节点
     for (const auto &group : m_groups) {
       auto *groupItem = new QStandardItem();
       groupItem->setData(group.title(), TreeViewText);
       groupItem->setData(":/icons/group.svg", TreeViewIcon);
       projectItem->appendRow(groupItem);
       
       // 构建数据集子节点
       for (const auto &dataset : group.datasets()) {
         auto *datasetItem = new QStandardItem();
         datasetItem->setData(dataset.title(), TreeViewText);
         datasetItem->setData(":/icons/dataset.svg", TreeViewIcon);
         groupItem->appendRow(datasetItem);
       }
     }
   }
   ```

3. **编辑状态管理**：
   ```cpp
   void ProjectModel::setCurrentView(const CurrentView view)
   {
     if (m_currentView != view) {
       m_currentView = view;
       
       // 根据视图类型构建相应的编辑模型
       switch (view) {
         case ProjectView:
           buildProjectModel();
           break;
         case GroupView:
           buildGroupModel(m_selectedGroup);
           break;
         case DatasetView:
           buildDatasetModel(m_selectedDataset);
           break;
         case ActionView:
           buildActionModel(m_selectedAction);
           break;
         case FrameParserView:
           // 切换到代码编辑器
           break;
       }
       
       emit currentViewChanged();
     }
   }
   ```

### 2. JSON::Frame 数据帧

**功能概述**：表示完整数据帧的数据结构，包含项目标题、数据组、数据集和动作的完整信息。

**文件位置**：`app/src/JSON/Frame.h`, `app/src/JSON/Frame.cpp`

**数据处理流程**：
1. 物理设备发送数据
2. I/O驱动接收数据
3. I/O管理器处理数据并分离帧
4. JSON生成器根据帧数据创建JSON文件
5. UI仪表板类接收JSON文件
6. TimerEvents类通知UI更新界面
7. UI仪表板将JSON数据传递给Frame类
8. Frame类创建数据模型
9. UI仪表板使用C++模型更新部件

**类定义**：

```cpp
class Frame
{
public:
  Frame();
  ~Frame();
  
  void clear();
  void buildUniqueIds();
  
  // 验证和比较
  bool isValid() const;
  bool equalsStructure(const JSON::Frame &other) const;
  
  // 序列化
  QJsonObject serialize() const;
  bool read(const QJsonObject &object);
  
  // 访问器
  int groupCount() const;
  bool containsCommercialFeatures() const;
  
  const QString &title() const;
  const QString &checksum() const;
  const QByteArray &frameStart() const;
  const QByteArray &frameEnd() const;
  
  const QVector<Group> &groups() const;
  const QVector<Action> &actions() const;

private:
  QString m_title;              // 项目标题
  QString m_checksum;           // 校验和算法
  QByteArray m_frameStart;      // 帧开始序列
  QByteArray m_frameEnd;        // 帧结束序列
  
  QVector<Group> m_groups;      // 数据组集合
  QVector<Action> m_actions;    // 动作集合
  
  bool m_containsCommercialFeatures;  // 是否包含商业功能
};
```

**关键方法实现**：

1. **结构比较**：
   ```cpp
   bool Frame::equalsStructure(const JSON::Frame &other) const
   {
     // 比较基本信息
     if (m_title != other.m_title || 
         m_groups.size() != other.m_groups.size() ||
         m_actions.size() != other.m_actions.size()) {
       return false;
     }
     
     // 逐个比较数据组结构
     for (int i = 0; i < m_groups.size(); ++i) {
       if (!m_groups[i].equalsStructure(other.m_groups[i])) {
         return false;
       }
     }
     
     return true;
   }
   ```

2. **序列化处理**：
   ```cpp
   QJsonObject Frame::serialize() const
   {
     QJsonObject object;
     object["title"] = m_title;
     object["checksum"] = m_checksum;
     object["frameStart"] = QString::fromUtf8(m_frameStart);
     object["frameEnd"] = QString::fromUtf8(m_frameEnd);
     
     // 序列化数据组
     QJsonArray groupsArray;
     for (const auto &group : m_groups) {
       groupsArray.append(group.serialize());
     }
     object["groups"] = groupsArray;
     
     // 序列化动作
     QJsonArray actionsArray;
     for (const auto &action : m_actions) {
       actionsArray.append(action.serialize());
     }
     object["actions"] = actionsArray;
     
     return object;
   }
   ```

### 3. JSON::FrameBuilder 帧构建器

**功能概述**：接收来自I/O管理器的原始帧数据，生成代表项目的Frame对象，支持多种操作模式。

**文件位置**：`app/src/JSON/FrameBuilder.h`, `app/src/JSON/FrameBuilder.cpp`

**设计模式**：单例模式 + 策略模式

**核心特性**：
- 多操作模式支持（项目模式、快速绘图模式）
- JavaScript解析引擎集成
- 实时数据处理
- 热路径优化

**类定义**：

```cpp
class FrameBuilder : public QObject
{
  Q_OBJECT
  
  Q_PROPERTY(QString jsonMapFilename READ jsonMapFilename NOTIFY jsonFileMapChanged)
  Q_PROPERTY(QString jsonMapFilepath READ jsonMapFilepath NOTIFY jsonFileMapChanged)
  Q_PROPERTY(SerialStudio::OperationMode operationMode READ operationMode 
             WRITE setOperationMode NOTIFY operationModeChanged)

signals:
  void jsonFileMapChanged();
  void operationModeChanged();
  void frameChanged(const JSON::Frame &frame);

public:
  static FrameBuilder &instance();
  
  QString jsonMapFilepath() const;
  QString jsonMapFilename() const;
  const JSON::Frame &frame() const;
  JSON::FrameParser *frameParser() const;
  SerialStudio::OperationMode operationMode() const;

public slots:
  void setupExternalConnections();
  void loadJsonMap(const QString &path);
  void setFrameParser(JSON::FrameParser *editor);
  void setOperationMode(const SerialStudio::OperationMode mode);
  
  // 热路径 - 高频调用的数据处理方法
  void hotpathRxFrame(const QByteArray &data);

private slots:
  void onConnectedChanged();

private:
  void parseProjectFrame(const QByteArray &data);      // 项目模式解析
  void parseQuickPlotFrame(const QByteArray &data);    // 快速绘图模式解析
  void buildQuickPlotFrame(const QStringList &channels); // 构建快速绘图帧
  void hotpathTxFrame(const JSON::Frame &frame);       // 热路径发送

private:
  QFile m_jsonMap;                              // JSON配置文件
  
  JSON::Frame m_frame;                          // 当前帧
  JSON::Frame m_rawFrame;                       // 原始帧（从配置加载）
  JSON::Frame m_quickPlotFrame;                 // 快速绘图帧
  
  QSettings m_settings;                         // 设置存储
  int m_quickPlotChannels;                      // 快速绘图通道数
  JSON::FrameParser *m_frameParser;             // 帧解析器
  SerialStudio::OperationMode m_opMode;         // 操作模式
};
```

**操作模式处理**：

1. **项目模式处理**：
   ```cpp
   void FrameBuilder::parseProjectFrame(const QByteArray &data)
   {
     // 使用JavaScript解析器处理数据
     if (m_frameParser) {
       QStringList values = m_frameParser->parse(data);
       
       // 将解析结果映射到数据集
       if (values.size() > 0) {
         int valueIndex = 0;
         for (auto &group : m_frame.m_groups) {
           for (auto &dataset : group.m_datasets) {
             if (valueIndex < values.size()) {
               dataset.setValue(values[valueIndex]);
               ++valueIndex;
             }
           }
         }
         
         // 发射帧更新信号
         hotpathTxFrame(m_frame);
       }
     }
   }
   ```

2. **快速绘图模式处理**：
   ```cpp
   void FrameBuilder::parseQuickPlotFrame(const QByteArray &data)
   {
     QString frameStr = QString::fromUtf8(data).trimmed();
     QStringList channels = frameStr.split(',', Qt::SkipEmptyParts);
     
     // 动态调整通道数
     if (channels.size() != m_quickPlotChannels) {
       m_quickPlotChannels = channels.size();
       buildQuickPlotFrame(channels);
     }
     
     // 更新数据值
     for (int i = 0; i < qMin(channels.size(), m_quickPlotFrame.groups().size()); ++i) {
       if (!m_quickPlotFrame.groups()[i].datasets().isEmpty()) {
         auto &dataset = const_cast<Dataset&>(m_quickPlotFrame.groups()[i].datasets()[0]);
         dataset.setValue(channels[i].trimmed());
       }
     }
     
     hotpathTxFrame(m_quickPlotFrame);
   }
   ```

### 4. JSON::FrameParser 帧解析器

**功能概述**：JavaScript代码编辑器和解析引擎，提供安全的脚本执行环境来解析原始数据帧。

**文件位置**：`app/src/JSON/FrameParser.h`, `app/src/JSON/FrameParser.cpp`

**核心特性**：
- 基于QML的代码编辑器
- JavaScript引擎集成
- 语法高亮和智能感知
- 安全的沙箱执行环境

**类定义**：

```cpp
class FrameParser : public QQuickPaintedItem
{
  Q_OBJECT
  
  Q_PROPERTY(QString text READ text NOTIFY textChanged)
  Q_PROPERTY(bool isModified READ isModified NOTIFY modifiedChanged)
  Q_PROPERTY(bool undoAvailable READ undoAvailable NOTIFY modifiedChanged)
  Q_PROPERTY(bool redoAvailable READ redoAvailable NOTIFY modifiedChanged)

signals:
  void textChanged();
  void modifiedChanged();

public:
  FrameParser(QQuickItem *parent = 0);
  
  static const QString &defaultCode();  // 获取默认解析代码
  
  QString text() const;
  bool isModified() const;
  bool undoAvailable() const;
  bool redoAvailable() const;
  
  // 核心解析方法
  QStringList parse(const QString &frame);
  QStringList parse(const QByteArray &frame);
  
  // 脚本管理
  bool save(const bool silent = false);
  bool loadScript(const QString &script);

public slots:
  // 编辑器操作
  void cut();
  void undo();
  void redo();
  void copy();
  void paste();
  void apply();
  void reload();
  void import();
  void selectAll();
  void help();

private:
  void paint(QPainter *painter) override;
  
  // 事件处理
  void keyPressEvent(QKeyEvent *event) override;
  void keyReleaseEvent(QKeyEvent *event) override;
  void inputMethodEvent(QInputMethodEvent *event) override;
  void focusInEvent(QFocusEvent *event) override;
  void focusOutEvent(QFocusEvent *event) override;
  void mousePressEvent(QMouseEvent *event) override;
  void mouseMoveEvent(QMouseEvent *event) override;
  void mouseReleaseEvent(QMouseEvent *event) override;
  void mouseDoubleClickEvent(QMouseEvent *event) override;
  void wheelEvent(QWheelEvent *event) override;
  void dragEnterEvent(QDragEnterEvent *event) override;
  void dragMoveEvent(QDragMoveEvent *event) override;
  void dragLeaveEvent(QDragLeaveEvent *event) override;
  void dropEvent(QDropEvent *event) override;

private:
  QPixmap m_pixmap;              // 渲染缓存
  QJSEngine m_engine;            // JavaScript引擎
  QSyntaxStyle m_style;          // 语法样式
  QCodeEditor m_widget;          // 代码编辑器
  QJSValue m_parseFunction;      // 解析函数对象
};
```

**默认解析脚本**：

```javascript
// 默认的帧解析脚本模板
function parse(frame) {
    // 移除帧开始和结束标记
    var data = frame.replace("/*", "").replace("*/", "");
    
    // 按逗号分割数据
    var values = data.split(",");
    
    // 清理数据并返回
    var result = [];
    for (var i = 0; i < values.length; i++) {
        result.push(values[i].trim());
    }
    
    return result;
}
```

**解析执行过程**：

```cpp
QStringList FrameParser::parse(const QByteArray &frame)
{
  if (m_parseFunction.isCallable()) {
    // 在安全的JavaScript环境中执行解析脚本
    QJSValue result = m_parseFunction.call(QJSValueList() << QString::fromUtf8(frame));
    
    if (result.isArray()) {
      QStringList values;
      int length = result.property("length").toInt();
      
      for (int i = 0; i < length; ++i) {
        values.append(result.property(i).toString());
      }
      
      return values;
    }
  }
  
  return QStringList();
}
```

### 5. JSON::Group 数据组

**功能概述**：表示相关数据集的集合，用于创建复合可视化组件（如加速度计、陀螺仪等）。

**文件位置**：`app/src/JSON/Group.h`, `app/src/JSON/Group.cpp`

**设计目的**：
- 组织相关的数据集
- 支持复合可视化组件
- 提供逻辑分组功能

**类定义**：

```cpp
class Group
{
public:
  Group(const int groupId = -1);
  ~Group();
  
  // 序列化
  QJsonObject serialize() const;
  bool read(const QJsonObject &object);
  
  // 访问器
  int groupId() const;
  int datasetCount() const;
  const QString &title() const;
  const QString &widget() const;
  const QVector<JSON::Dataset> &datasets() const;
  const JSON::Dataset &getDataset(const int index) const;

private:
  int m_groupId;                      // 组ID
  QString m_title;                    // 组标题
  QString m_widget;                   // 组件类型
  QVector<JSON::Dataset> m_datasets;  // 数据集集合
};
```

**组件类型示例**：
- **accelerometer**: 加速度计（需要X、Y、Z三个数据集）
- **gyroscope**: 陀螺仪（需要X、Y、Z三个数据集）
- **gps**: GPS地图（需要纬度、经度数据集）
- **compass**: 指南针（需要角度数据集）

### 6. JSON::Dataset 数据集

**功能概述**：表示单个数据单元的属性和值，是数据可视化的基本单位。

**文件位置**：`app/src/JSON/Dataset.h`, `app/src/JSON/Dataset.cpp`

**数据字段说明**：
- **value**: 当前传感器读数/值（必需）
- **title**: 数据集描述（必需）
- **units**: 测量单位
- **widget**: 可视化组件类型
- **graph**: 是否实时绘图
- **min/max**: 最小/最大值（用于仪表盘和条形图）
- **alarm**: 告警阈值
- **fft**: FFT分析相关配置

**类定义**：

```cpp
class Dataset
{
public:
  Dataset(const int groupId = -1, const int datasetId = -1);
  
  // 唯一标识
  quint32 uniqueId() const;
  
  // 功能标志
  bool fft() const;           // FFT分析
  bool led() const;           // LED指示
  bool log() const;           // 数据记录
  bool graph() const;         // 实时绘图
  bool displayInOverview() const; // 在总览中显示
  
  // 数值属性
  double min() const;         // 最小值
  double max() const;         // 最大值
  double alarm() const;       // 告警值
  double ledHigh() const;     // LED高电平阈值
  
  // FFT相关
  int fftSamples() const;     // FFT采样数
  int fftSamplingRate() const; // 采样率
  const QString &fftWindowFn() const; // 窗函数
  
  // 标识符
  int index() const;          // 索引
  int groupId() const;        // 所属组ID
  int datasetId() const;      // 数据集ID
  int xAxisId() const;        // X轴数据源ID
  
  // 文本属性
  const QString &title() const;  // 标题
  const QString &units() const;  // 单位
  const QString &value() const;  // 当前值
  const QString &widget() const; // 组件类型
  
  // 数据访问
  const QJsonObject &jsonData() const;
  
  // 序列化
  QJsonObject serialize() const;
  bool read(const QJsonObject &object);
  
  // 修改器
  void setMin(double min);
  void setMax(double max);
  void setUniqueId(const quint32 id);
  void setTitle(const QString &title);
  void setValue(const QString &value);

private:
  quint32 m_uniqueId;         // 唯一ID
  
  // 功能标志
  bool m_fft;                 // FFT分析
  bool m_led;                 // LED显示
  bool m_log;                 // 数据记录
  bool m_graph;               // 图表显示
  bool m_displayInOverview;   // 总览显示
  
  // 文本属性
  QString m_title;            // 标题
  QString m_units;            // 单位
  QString m_widget;           // 组件类型
  QString m_value;            // 当前值
  QString m_fftWindowFn;      // FFT窗函数
  QJsonObject m_jsonData;     // 原始JSON数据
  
  // 数值属性
  int m_index;                // 索引
  double m_max;               // 最大值
  double m_min;               // 最小值
  double m_alarm;             // 告警值
  double m_ledHigh;           // LED高电平阈值
  int m_fftSamples;           // FFT采样数
  int m_fftSamplingRate;      // FFT采样率
  
  // 关联ID
  int m_groupId;              // 组ID
  int m_xAxisId;              // X轴数据源ID
  int m_datasetId;            // 数据集ID
};
```

**支持的组件类型**：
- **plot**: 实时数据图表
- **multiplot**: 多数据图表
- **gauge**: 仪表盘
- **bar**: 条形图
- **compass**: 指南针
- **accelerometer**: 加速度计
- **gyroscope**: 陀螺仪
- **gps**: GPS地图
- **led**: LED面板
- **datagrid**: 数据网格
- **terminal**: 终端显示
- **fft**: 频谱分析

### 7. JSON::Action 动作

**功能概述**：表示可以向连接设备发送数据的动作，支持定时器和自动执行功能。

**文件位置**：`app/src/JSON/Action.h`, `app/src/JSON/Action.cpp`

**核心特性**：
- 可配置的发送数据
- 多种定时器模式
- 自动执行支持
- 二进制数据处理

**类定义**：

```cpp
class Action
{
public:
  enum class TimerMode {
    Off,                // 无定时器
    AutoStart,          // 自动启动（如连接时）
    StartOnTrigger,     // 触发时启动
    ToggleOnTrigger     // 触发时切换状态
  };
  
  Action(const int actionId = -1);
  
  // 访问器
  int actionId() const;
  bool binaryData() const;            // 是否为二进制数据
  QByteArray txByteArray() const;     // 获取发送的字节数组
  
  const QString &icon() const;         // 图标
  const QString &title() const;       // 标题
  const QString &txData() const;      // 发送数据
  const QString &eolSequence() const; // 行结束序列
  
  TimerMode timerMode() const;        // 定时器模式
  int timerIntervalMs() const;        // 定时器间隔（毫秒）
  bool autoExecuteOnConnect() const;  // 连接时自动执行
  
  // 序列化
  QJsonObject serialize() const;
  bool read(const QJsonObject &object);

private:
  int m_actionId;                     // 动作ID
  bool m_binaryData;                  // 二进制数据标志
  
  QString m_icon;                     // 图标路径
  QString m_title;                    // 动作标题
  QString m_txData;                   // 发送数据
  QString m_eolSequence;              // 行结束序列
  
  int m_timerIntervalMs;              // 定时器间隔
  TimerMode m_timerMode;              // 定时器模式
  bool m_autoExecuteOnConnect;        // 自动执行标志
};
```

**定时器模式说明**：

1. **Off**: 不使用定时器，仅手动触发
2. **AutoStart**: 设备连接时自动启动定时器
3. **StartOnTrigger**: 手动触发时启动定时器
4. **ToggleOnTrigger**: 每次触发时切换定时器状态

**数据处理**：

```cpp
QByteArray Action::txByteArray() const
{
  QByteArray data;
  
  if (m_binaryData) {
    // 解析十六进制字符串为二进制数据
    QString hex = m_txData;
    hex.remove(QRegularExpression("[^0-9A-Fa-f]")); // 移除非十六进制字符
    
    for (int i = 0; i < hex.length(); i += 2) {
      bool ok;
      quint8 byte = hex.mid(i, 2).toUInt(&ok, 16);
      if (ok) {
        data.append(byte);
      }
    }
  } else {
    // 直接使用文本数据
    data = m_txData.toUtf8();
  }
  
  // 添加行结束序列
  if (!m_eolSequence.isEmpty()) {
    data.append(m_eolSequence.toUtf8());
  }
  
  return data;
}
```

## 配置文件格式

### JSON项目文件结构

```json
{
  "title": "项目标题",
  "frameStart": "/*",
  "frameEnd": "*/",
  "checksum": "none",
  "decoder": "normal",
  "frameDetection": "end-delimiter",
  "frameParser": "JavaScript解析代码",
  "groups": [
    {
      "title": "传感器数据",
      "widget": "group",
      "datasets": [
        {
          "title": "温度",
          "units": "°C",
          "widget": "gauge",
          "graph": true,
          "min": -20,
          "max": 100,
          "alarm": 80,
          "value": "25.6"
        },
        {
          "title": "湿度",
          "units": "%",
          "widget": "bar",
          "graph": true,
          "min": 0,
          "max": 100,
          "value": "65.2"
        }
      ]
    }
  ],
  "actions": [
    {
      "title": "获取状态",
      "icon": ":/icons/status.svg",
      "txData": "GET_STATUS",
      "eolSequence": "\r\n",
      "autoExecuteOnConnect": false,
      "timerMode": "off",
      "timerIntervalMs": 1000
    }
  ]
}
```

### 解析脚本示例

```javascript
/**
 * 帧解析函数
 * @param {string} frame - 原始帧数据
 * @returns {Array<string>} - 解析后的数值数组
 */
function parse(frame) {
    // 移除帧标记
    var data = frame.replace("/*", "").replace("*/", "");
    
    // 处理JSON格式数据
    try {
        var json = JSON.parse(data);
        return [
            json.temperature.toString(),
            json.humidity.toString(),
            json.pressure.toString()
        ];
    } catch (e) {
        // 处理CSV格式数据
        return data.split(",").map(function(val) {
            return val.trim();
        });
    }
}
```

## 使用示例

### 基本项目配置

```cpp
// 获取项目模型实例
auto &model = JSON::ProjectModel::instance();

// 创建新项目
model.newJsonFile();

// 添加数据组
model.addGroup("传感器数据", SerialStudio::GroupWidget::Group);

// 添加数据集
model.addDataset(SerialStudio::DatasetOption::Graph |
                 SerialStudio::DatasetOption::Widget);

// 保存项目
model.saveJsonFile();
```

### 实时数据处理

```cpp
// 获取帧构建器实例
auto &builder = JSON::FrameBuilder::instance();

// 设置操作模式
builder.setOperationMode(SerialStudio::OperationMode::Project);

// 连接帧更新信号
connect(&builder, &JSON::FrameBuilder::frameChanged,
        this, &MyClass::onFrameReceived);

// 处理接收到的数据
void MyClass::onFrameReceived(const JSON::Frame &frame)
{
    // 遍历所有数据组
    for (const auto &group : frame.groups()) {
        qDebug() << "Group:" << group.title();
        
        // 遍历数据集
        for (const auto &dataset : group.datasets()) {
            qDebug() << "  Dataset:" << dataset.title() 
                     << "Value:" << dataset.value()
                     << "Units:" << dataset.units();
        }
    }
}
```

### 自定义解析脚本

```cpp
// 获取帧解析器
auto *parser = builder.frameParser();

// 加载自定义解析脚本
QString script = R"(
function parse(frame) {
    // 自定义解析逻辑
    var lines = frame.split('\n');
    var values = [];
    
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('DATA:')) {
            values.push(lines[i].substring(5));
        }
    }
    
    return values;
}
)";

parser->loadScript(script);
```

## 扩展指导

### 实现自定义数据组件

1. **定义组件类型**：
   ```cpp
   enum class CustomWidget {
       CustomGauge,
       CustomChart,
       CustomDisplay
   };
   ```

2. **扩展解析逻辑**：
   ```cpp
   // 在FrameBuilder中添加自定义处理
   void processCustomData(const QByteArray &data) {
       // 自定义数据处理逻辑
       CustomDataProcessor processor;
       auto result = processor.parse(data);
       
       // 更新帧数据
       updateFrameWithCustomData(result);
   }
   ```

3. **集成到项目模型**：
   ```cpp
   // 在ProjectModel中添加自定义组件支持
   void addCustomWidget(const QString &type) {
       m_customWidgets[type] = CustomWidgetInfo{
           .name = type,
           .icon = ":/icons/custom.svg",
           .description = "自定义组件"
       };
   }
   ```

### 性能优化建议

1. **数据处理优化**：
   - 使用热路径函数减少信号开销
   - 实现增量更新机制
   - 合理使用数据缓存

2. **内存管理**：
   - 及时清理不需要的帧数据
   - 使用对象池管理临时对象
   - 避免不必要的深拷贝

3. **JavaScript优化**：
   - 预编译解析函数
   - 避免频繁的字符串操作
   - 使用高效的数据结构

## 总结

JSON模块是Serial-Studio的数据核心，提供了完整的配置管理和数据处理能力：

- **配置管理**：ProjectModel提供完整的项目配置管理
- **数据建模**：Frame、Group、Dataset提供清晰的数据结构
- **实时处理**：FrameBuilder实现高效的实时数据处理
- **脚本支持**：FrameParser提供灵活的JavaScript解析能力
- **扩展性**：模块化设计便于添加新功能

该模块的设计对VSCode插件开发具有重要参考价值，特别是在数据模型设计、配置管理和实时数据处理方面。