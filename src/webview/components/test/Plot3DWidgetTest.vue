<!--
Plot3D组件测试页面
用于测试和验证3D数据可视化组件的功能
-->
<template>
  <div class="plot3d-test-container">
    <div class="test-header">
      <h2>3D数据图表组件测试</h2>
      <div class="test-controls">
        <el-button type="primary" @click="startSimulation">开始3D数据模拟</el-button>
        <el-button @click="stopSimulation">停止模拟</el-button>
        <el-button @click="clearData">清除数据</el-button>
        <el-button @click="generateTestData">生成测试数据</el-button>
      </div>
    </div>

    <div class="test-content">
      <!-- 3D组件 -->
      <div class="widget-container">
        <Plot3DWidget 
          :datasets="mockDatasets"
          :canvas-height="600"
          :show-axis-info="true"
          :show-camera-info="true"
          :show-performance="true"
          @camera-change="handleCameraChange"
          @refresh="handleRefresh"
          @settings="handleSettings"
          @export="handleExport"
        />
      </div>

      <!-- 测试控制面板 -->
      <div class="test-controls-panel">
        <h3>测试控制</h3>
        
        <!-- 模拟参数 -->
        <div class="control-section">
          <h4>模拟参数</h4>
          <div class="control-group">
            <label>数据类型:</label>
            <el-select v-model="dataType" @change="changeDataType">
              <el-option label="螺旋线" value="helix" />
              <el-option label="正弦波" value="sine" />
              <el-option label="随机游走" value="random" />
              <el-option label="洛伦兹吸引子" value="lorenz" />
              <el-option label="圆形轨道" value="circle" />
              <el-option label="8字形" value="figure8" />
            </el-select>
          </div>
          
          <div class="control-group">
            <label>生成速度:</label>
            <el-slider
              v-model="simulationSpeed"
              :min="1"
              :max="20"
              :step="1"
              style="width: 150px;"
              @change="updateSimulationSpeed"
            />
            <span class="value-display">{{ simulationSpeed }} Hz</span>
          </div>
          
          <div class="control-group">
            <label>数据点数量:</label>
            <el-slider
              v-model="maxDataPoints"
              :min="100"
              :max="2000"
              :step="100"
              style="width: 150px;"
            />
            <span class="value-display">{{ maxDataPoints }}</span>
          </div>
        </div>

        <!-- 3D参数控制 -->
        <div class="control-section">
          <h4>3D参数</h4>
          <div class="control-group">
            <label>X轴范围:</label>
            <el-input-number v-model="paramX.amplitude" :step="0.1" :min="0.1" :max="10" size="small" />
            <el-input-number v-model="paramX.frequency" :step="0.1" :min="0.1" :max="5" size="small" />
          </div>
          
          <div class="control-group">
            <label>Y轴范围:</label>
            <el-input-number v-model="paramY.amplitude" :step="0.1" :min="0.1" :max="10" size="small" />
            <el-input-number v-model="paramY.frequency" :step="0.1" :min="0.1" :max="5" size="small" />
          </div>
          
          <div class="control-group">  
            <label>Z轴范围:</label>
            <el-input-number v-model="paramZ.amplitude" :step="0.1" :min="0.1" :max="10" size="small" />
            <el-input-number v-model="paramZ.frequency" :step="0.1" :min="0.1" :max="5" size="small" />
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="control-section">
          <h4>统计信息</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="label">模拟状态:</span>
              <span class="value" :class="{ active: isSimulating }">
                {{ isSimulating ? '运行中' : '已停止' }}
              </span>
            </div>
            <div class="stat-item">
              <span class="label">数据点数:</span>  
              <span class="value">{{ currentDataPoints }}</span>
            </div>
            <div class="stat-item">
              <span class="label">生成次数:</span>
              <span class="value">{{ generationCount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">当前坐标:</span>
              <span class="value">{{ formatCurrentPosition() }}</span>
            </div>
          </div>
        </div>

        <!-- 预设数据 -->
        <div class="control-section">
          <h4>预设数据</h4>
          <div class="preset-buttons">
            <el-button size="small" @click="loadPresetData('cube')">立方体</el-button>
            <el-button size="small" @click="loadPresetData('sphere')">球体</el-button>
            <el-button size="small" @click="loadPresetData('torus')">环形</el-button>
            <el-button size="small" @click="loadPresetData('dna')">DNA螺旋</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  ElButton, 
  ElSelect, 
  ElOption, 
  ElSlider,
  ElInputNumber 
} from 'element-plus'
import Plot3DWidget from '../widgets/Plot3DWidget.vue'
import { Point3D, Dataset, WidgetType } from '@/shared/types'

// 响应式状态
const isSimulating = ref(false)
const simulationInterval = ref<NodeJS.Timeout>()
const simulationSpeed = ref(5) // Hz
const generationCount = ref(0)
const maxDataPoints = ref(500)
const dataType = ref<'helix' | 'sine' | 'random' | 'lorenz' | 'circle' | 'figure8'>('helix')

// 3D参数
const paramX = ref({ amplitude: 2, frequency: 1 })
const paramY = ref({ amplitude: 2, frequency: 1 })
const paramZ = ref({ amplitude: 1, frequency: 0.5 })

// 当前3D数据
const currentX = ref(0)
const currentY = ref(0)
const currentZ = ref(0)
const currentDataPoints = ref(0)

// 时间步长
const timeStep = ref(0)

// 洛伦兹吸引子参数
const lorenzParams = ref({
  sigma: 10,
  rho: 28,
  beta: 8/3,
  dt: 0.01,
  x: 1, y: 1, z: 1
})

// 模拟数据集
const mockDatasets = ref<Dataset[]>([
  {
    id: 'x3d',
    title: 'X坐标',
    value: currentX.value,
    unit: '',
    widget: WidgetType.Plot3D,
    graph: true,
    log: true,
    led: false,
    alarm: false,
    fft: false
  },
  {
    id: 'y3d',
    title: 'Y坐标',
    value: currentY.value,
    unit: '',
    widget: WidgetType.Plot3D,
    graph: true,
    log: true,
    led: false,
    alarm: false,
    fft: false
  },
  {
    id: 'z3d',
    title: 'Z坐标',
    value: currentZ.value,
    unit: '',
    widget: WidgetType.Plot3D,
    graph: true,
    log: true,
    led: false,
    alarm: false,
    fft: false
  }
])

// 开始数据模拟
const startSimulation = () => {
  if (isSimulating.value) return

  isSimulating.value = true
  timeStep.value = 0
  generationCount.value = 0

  simulationInterval.value = setInterval(() => {
    generate3DPoint()
    updateMockDatasets()
    timeStep.value += 1 / simulationSpeed.value
    generationCount.value++
  }, 1000 / simulationSpeed.value)
}

// 停止数据模拟
const stopSimulation = () => {
  isSimulating.value = false
  if (simulationInterval.value) {
    clearInterval(simulationInterval.value)
    simulationInterval.value = undefined
  }
}

// 生成3D数据点
const generate3DPoint = () => {
  const t = timeStep.value

  switch (dataType.value) {
    case 'helix':
      // 螺旋线
      currentX.value = paramX.amplitude * Math.cos(t * paramX.frequency)
      currentY.value = paramY.amplitude * Math.sin(t * paramY.frequency)
      currentZ.value = paramZ.amplitude * t * paramZ.frequency
      break

    case 'sine':
      // 三维正弦波
      currentX.value = paramX.amplitude * Math.sin(t * paramX.frequency)
      currentY.value = paramY.amplitude * Math.sin(t * paramY.frequency + Math.PI/3)
      currentZ.value = paramZ.amplitude * Math.sin(t * paramZ.frequency + Math.PI*2/3)
      break

    case 'random':
      // 随机游走
      currentX.value += (Math.random() - 0.5) * 0.2
      currentY.value += (Math.random() - 0.5) * 0.2
      currentZ.value += (Math.random() - 0.5) * 0.1
      break

    case 'lorenz':
      // 洛伦兹吸引子
      const { sigma, rho, beta, dt } = lorenzParams.value
      const dx = sigma * (lorenzParams.value.y - lorenzParams.value.x) * dt
      const dy = (lorenzParams.value.x * (rho - lorenzParams.value.z) - lorenzParams.value.y) * dt
      const dz = (lorenzParams.value.x * lorenzParams.value.y - beta * lorenzParams.value.z) * dt
      
      lorenzParams.value.x += dx
      lorenzParams.value.y += dy
      lorenzParams.value.z += dz
      
      currentX.value = lorenzParams.value.x * 0.1
      currentY.value = lorenzParams.value.y * 0.1
      currentZ.value = lorenzParams.value.z * 0.1
      break

    case 'circle':
      // 圆形轨道
      currentX.value = paramX.amplitude * Math.cos(t * paramX.frequency)
      currentY.value = paramY.amplitude * Math.sin(t * paramY.frequency)
      currentZ.value = paramZ.amplitude * Math.sin(t * paramZ.frequency * 0.5)
      break

    case 'figure8':
      // 8字形
      currentX.value = paramX.amplitude * Math.sin(t * paramX.frequency)
      currentY.value = paramY.amplitude * Math.sin(t * paramY.frequency * 2)
      currentZ.value = paramZ.amplitude * Math.cos(t * paramZ.frequency)
      break
  }
}

// 更新模拟数据集
const updateMockDatasets = () => {
  mockDatasets.value[0].value = currentX.value
  mockDatasets.value[1].value = currentY.value
  mockDatasets.value[2].value = currentZ.value
  currentDataPoints.value++
}

// 清除数据
const clearData = () => {
  stopSimulation()
  timeStep.value = 0
  generationCount.value = 0
  currentDataPoints.value = 0
  currentX.value = 0
  currentY.value = 0
  currentZ.value = 0
  updateMockDatasets()
}

// 生成测试数据
const generateTestData = () => {
  const testDataCount = 200
  
  for (let i = 0; i < testDataCount; i++) {
    timeStep.value = i * 0.1
    generate3DPoint()
    updateMockDatasets()
    
    // 模拟延迟以观察生成过程
    if (i % 10 === 0) {
      setTimeout(() => {}, 10)
    }
  }
  
  generationCount.value += testDataCount
  currentDataPoints.value += testDataCount
}

// 加载预设数据
const loadPresetData = (presetType: string) => {
  clearData()
  
  const points: Point3D[] = []
  const count = 100
  
  switch (presetType) {
    case 'cube':
      // 立方体边框
      for (let i = 0; i < count; i++) {
        const t = i / count * 8 * Math.PI
        if (i < count / 8) {
          points.push({ x: Math.cos(t), y: -1, z: Math.sin(t) })
        } else if (i < count / 4) {
          points.push({ x: 1, y: Math.cos(t), z: Math.sin(t) })
        } else if (i < 3 * count / 8) {
          points.push({ x: Math.cos(t), y: 1, z: Math.sin(t) })
        } else {
          points.push({ x: -1, y: Math.cos(t), z: Math.sin(t) })
        }
      }
      break
      
    case 'sphere':
      // 球面
      for (let i = 0; i < count; i++) {
        const phi = Math.acos(1 - 2 * i / count)
        const theta = Math.PI * (1 + Math.sqrt(5)) * i
        points.push({
          x: Math.sin(phi) * Math.cos(theta),
          y: Math.sin(phi) * Math.sin(theta),
          z: Math.cos(phi)
        })
      }
      break
      
    case 'torus':
      // 环形
      for (let i = 0; i < count; i++) {
        const u = (i / count) * 2 * Math.PI
        const v = ((i * 7) % count / count) * 2 * Math.PI
        const R = 2, r = 0.5
        points.push({
          x: (R + r * Math.cos(v)) * Math.cos(u),
          y: (R + r * Math.cos(v)) * Math.sin(u),
          z: r * Math.sin(v)
        })
      }
      break
      
    case 'dna':
      // DNA双螺旋
      for (let i = 0; i < count; i++) {
        const t = i / count * 10 * Math.PI
        const radius = 1
        points.push({
          x: radius * Math.cos(t),
          y: radius * Math.sin(t),
          z: t * 0.2
        })
      }
      break
  }
  
  // 模拟逐点生成
  let index = 0
  const addPoint = () => {
    if (index < points.length) {
      const point = points[index]
      currentX.value = point.x
      currentY.value = point.y
      currentZ.value = point.z
      updateMockDatasets()
      index++
      currentDataPoints.value++
      setTimeout(addPoint, 50)
    }
  }
  
  addPoint()
}

// 改变数据类型
const changeDataType = (newType: string) => {
  dataType.value = newType as any
  
  // 重置洛伦兹吸引子参数
  if (dataType.value === 'lorenz') {
    lorenzParams.value = {
      sigma: 10, rho: 28, beta: 8/3, dt: 0.01,
      x: 1, y: 1, z: 1
    }
  }
}

// 更新模拟速度
const updateSimulationSpeed = (speed: number) => {
  simulationSpeed.value = speed
  
  if (isSimulating.value) {
    stopSimulation()
    startSimulation()
  }
}

// 事件处理
const handleCameraChange = (angles: any, offset: any, scale: number) => {
  console.log('相机变化:', { angles, offset, scale })
}

const handleRefresh = () => {
  console.log('3D组件刷新')
  clearData()
}

const handleSettings = () => {
  console.log('打开3D设置')
}

const handleExport = (data: any) => {
  console.log('导出3D数据:', data)
}

// 工具函数
const formatCurrentPosition = () => {
  return `(${currentX.value.toFixed(2)}, ${currentY.value.toFixed(2)}, ${currentZ.value.toFixed(2)})`
}

// 生命周期
onMounted(() => {
  updateMockDatasets()
  console.log('3D测试页面已加载')
})

onUnmounted(() => {
  stopSimulation()
})
</script>

<style scoped>
.plot3d-test-container {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.test-header {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.test-header h2 {
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
}

.test-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.test-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
}

.widget-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
}

.test-controls-panel {
  background: var(--el-bg-color-page);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  height: fit-content;
}

.test-controls-panel h3 {
  margin: 0 0 20px 0;
  color: var(--el-text-color-primary);
}

.control-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.control-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.control-section h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
}

.control-group {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-group label {
  min-width: 80px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.value-display {
  min-width: 40px;
  font-size: 12px;
  font-family: monospace;
  color: var(--el-text-color-primary);
}

.stats-grid {
  display: grid;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: var(--el-bg-color);
  border-radius: 4px;
  font-size: 13px;
}

.stat-item .label {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.stat-item .value {
  font-family: monospace;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.stat-item .value.active {
  color: var(--el-color-success);
}

.preset-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .test-content {
    grid-template-columns: 1fr;
  }
  
  .test-controls-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .plot3d-test-container {
    padding: 10px;
  }
  
  .test-controls {
    justify-content: center;
  }
  
  .control-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .control-group label {
    min-width: auto;
  }
  
  .preset-buttons {
    grid-template-columns: 1fr;
  }
}
</style>