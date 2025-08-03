# 3D图表组件 (Plot3D)

## 概述

3D图表组件提供三维数据点云和曲面的可视化功能，支持立体视觉（红蓝眼镜）、轨道导航、插值渲染等高级特性。该组件适用于科学计算、工程仿真、三维传感器数据可视化等应用场景。

**注意：此组件为商业版功能，需要相应的许可证。**

## 数据格式要求

### 组配置结构

```json
{
    "title": "3D Visualization",
    "widget": "plot3d",
    "datasets": [
        {
            "title": "X Coordinate",
            "units": "mm",
            "widget": "x",
            "index": 1,
            "graph": false
        },
        {
            "title": "Y Coordinate",
            "units": "mm", 
            "widget": "y",
            "index": 2,
            "graph": false
        },
        {
            "title": "Z Coordinate",
            "units": "mm",
            "widget": "z",
            "index": 3,
            "graph": false
        }
    ]
}
```

### 核心属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `worldScale` | double | 1.0 | 世界坐标缩放 |
| `cameraAngleX` | double | 0.0 | 相机X轴角度 |
| `cameraAngleY` | double | 0.0 | 相机Y轴角度 |
| `cameraAngleZ` | double | 0.0 | 相机Z轴角度 |
| `cameraOffsetX` | double | 0.0 | 相机X轴偏移 |
| `cameraOffsetY` | double | 0.0 | 相机Y轴偏移 |
| `cameraOffsetZ` | double | 0.0 | 相机Z轴偏移 |
| `anaglyphEnabled` | bool | false | 立体视觉模式 |
| `orbitNavigation` | bool | true | 轨道导航模式 |
| `interpolationEnabled` | bool | false | 插值渲染 |

## 数据集要求

3D图表组件**必须**包含三个数据集，分别对应X、Y、Z坐标：

1. **X坐标数据集**：`widget` 属性必须设置为 `"x"`
2. **Y坐标数据集**：`widget` 属性必须设置为 `"y"`
3. **Z坐标数据集**：`widget` 属性必须设置为 `"z"`

## 3D渲染配置

### 相机控制

```json
{
    "cameraAngleX": 30.0,      // X轴旋转角度（度）
    "cameraAngleY": 45.0,      // Y轴旋转角度（度）
    "cameraAngleZ": 0.0,       // Z轴旋转角度（度）
    "cameraOffsetX": 0.0,      // X轴偏移量
    "cameraOffsetY": 0.0,      // Y轴偏移量  
    "cameraOffsetZ": -10.0,    // Z轴偏移量（负值后退）
    "worldScale": 2.0          // 世界缩放（>1放大，<1缩小）
}
```

### 立体视觉配置

```json
{
    "anaglyphEnabled": true,    // 启用红蓝立体视觉
    "eyeSeparation": 0.1,       // 眼距分离度
    "invertEyePositions": false // 是否反转左右眼位置
}
```

### 渲染质量配置

```json
{
    "interpolationEnabled": true,  // 启用插值渲染
    "orbitNavigation": true,       // 启用轨道导航
    "idealWorldScale": 1.0         // 理想世界缩放（自动计算）
}
```

## 测试数据示例

### 基本3D点测试

```bash
# 原点
$0.0,0.0,0.0;

# 立方体顶点
$1.0,1.0,1.0;
$-1.0,1.0,1.0;
$1.0,-1.0,1.0;
$1.0,1.0,-1.0;
```

### 螺旋线数据

```python
# Python生成螺旋线测试数据
import math

for t in range(0, 360, 5):
    rad = math.radians(t)
    x = math.cos(rad) * 2
    y = math.sin(rad) * 2  
    z = t / 36.0  # 高度随角度增加
    print(f"${x:.3f},{y:.3f},{z:.3f};")
```

### 球面数据

```python
# Python生成球面测试数据
import math

radius = 5.0
for theta in range(0, 180, 20):
    for phi in range(0, 360, 20):
        theta_rad = math.radians(theta)
        phi_rad = math.radians(phi)
        
        x = radius * math.sin(theta_rad) * math.cos(phi_rad)
        y = radius * math.sin(theta_rad) * math.sin(phi_rad)
        z = radius * math.cos(theta_rad)
        
        print(f"${x:.3f},{y:.3f},{z:.3f};")
```

### 动态轨迹数据

```bash
# 飞行器轨迹示例
$0.0,0.0,0.0;      // 起始点
$1.0,0.5,0.2;      // 上升
$2.0,1.0,0.5;      // 继续上升
$3.0,1.2,0.8;      // 最高点
$4.0,1.0,0.6;      // 下降
$5.0,0.5,0.3;      // 继续下降
$6.0,0.0,0.0;      // 降落
```

## 交互功能

### 鼠标控制

- **左键拖拽**：旋转视角
- **右键拖拽**：平移视图
- **滚轮**：缩放视图
- **双击**：重置视角

### 键盘控制

```cpp
// 键盘快捷键
Qt::Key_R: resetCamera();        // 重置相机
Qt::Key_A: toggleAnaglyph();     // 切换立体视觉
Qt::Key_I: toggleInterpolation(); // 切换插值
Qt::Key_O: toggleOrbitMode();    // 切换轨道模式
```

## 渲染优化

### 网格配置

```cpp
// 网格参数
double gridStep(const double scale) const {
    if (scale < 0) scale = m_worldScale;
    return pow(10, floor(log10(scale))) / scale;
}
```

### 投影变换

```cpp
// 屏幕投影
std::vector<QPointF> screenProjection(
    const PlotData3D &points,
    const QMatrix4x4 &matrix
);

// 3D到2D变换矩阵
QMatrix4x4 viewMatrix;
viewMatrix.perspective(45.0f, aspect, 0.1f, 1000.0f);
```

### 立体渲染

```cpp
// 双眼投影矩阵
QPair<QMatrix4x4, QMatrix4x4> eyeTransformations(
    const QMatrix4x4 &matrix
) {
    QMatrix4x4 leftEye = matrix;
    QMatrix4x4 rightEye = matrix;
    
    // 添加眼间距偏移
    leftEye.translate(-m_eyeSeparation, 0, 0);
    rightEye.translate(m_eyeSeparation, 0, 0);
    
    return qMakePair(leftEye, rightEye);
}
```

## 性能配置

### 数据量限制

| 应用场景 | 推荐点数 | 更新频率 |
|----------|----------|----------|
| 实时监控 | <1000 | 10-30 Hz |
| 科学可视化 | <10000 | 1-10 Hz |
| 离线分析 | <100000 | 按需更新 |

### 内存管理

```cpp
// 数据缓存管理
static const int MAX_DATA_POINTS = 50000;
if (m_data.size() > MAX_DATA_POINTS) {
    m_data.removeFirst();
}
```

### 渲染缓存

```cpp
// 渲染缓存
QImage m_bgImg[2];           // 背景缓存
QImage m_plotImg[2];         // 数据缓存  
QImage m_gridImg[2];         // 网格缓存
QImage m_cameraIndicatorImg[2]; // 相机指示器缓存
```

## 数据范围配置

### 自动范围计算

```cpp
// 理想世界缩放计算
double idealWorldScale() const {
    double maxRange = qMax({
        m_maxX - m_minX,
        m_maxY - m_minY, 
        m_maxZ - m_minZ
    });
    return 10.0 / maxRange;  // 标准化到10个单位
}
```

### 手动范围设置

```json
{
    "dataRange": {
        "minX": -10.0, "maxX": 10.0,
        "minY": -10.0, "maxY": 10.0,
        "minZ": -10.0, "maxZ": 10.0
    }
}
```

## 使用注意事项

1. **性能考虑**：3D渲染消耗较大，注意数据点数量和更新频率
2. **坐标系一致性**：确保X、Y、Z坐标系定义一致
3. **立体视觉**：使用红蓝眼镜观看立体效果
4. **数据范围**：合理设置数据范围以获得最佳视觉效果
5. **相机控制**：熟悉交互操作以获得最佳观察角度
6. **商业许可**：确保拥有Plot3D功能的商业许可证

## 错误处理

### 常见错误
- 缺少X、Y、Z中任一坐标数据集
- 数据范围过大导致渲染性能问题
- 立体视觉参数设置不当

### 调试建议
- 检查3D数据点的坐标范围
- 验证相机参数设置
- 监控渲染性能指标

## 示例项目配置

### 3D轨迹可视化

```json
{
    "title": "3D Trajectory Viewer",
    "widget": "plot3d",
    "worldScale": 2.0,
    "cameraAngleX": 30.0,
    "cameraAngleY": 45.0, 
    "cameraAngleZ": 0.0,
    "anaglyphEnabled": false,
    "interpolationEnabled": true,
    "datasets": [
        {
            "title": "X Position",
            "units": "m",
            "widget": "x",
            "index": 1,
            "graph": false
        },
        {
            "title": "Y Position", 
            "units": "m",
            "widget": "y",
            "index": 2,
            "graph": false
        },
        {
            "title": "Z Position",
            "units": "m",
            "widget": "z",
            "index": 3,
            "graph": false
        }
    ]
}
```

### 立体视觉科学可视化

```json
{
    "title": "3D Scientific Visualization",
    "widget": "plot3d",
    "worldScale": 1.5,
    "anaglyphEnabled": true,
    "eyeSeparation": 0.1,
    "invertEyePositions": false,
    "orbitNavigation": true,
    "interpolationEnabled": true,
    "datasets": [
        {
            "title": "X Coordinate",
            "units": "μm",
            "widget": "x", 
            "index": 1,
            "graph": false
        },
        {
            "title": "Y Coordinate",
            "units": "μm",
            "widget": "y",
            "index": 2,
            "graph": false
        },
        {
            "title": "Z Coordinate", 
            "units": "μm",
            "widget": "z",
            "index": 3,
            "graph": false
        }
    ]
}
```