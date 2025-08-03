<!--
GPS组件测试页面
用于测试和验证GPS地图组件的功能
-->
<template>
  <div class="gps-test-container">
    <div class="test-header">
      <h2>GPS地图组件测试</h2>
      <div class="test-controls">
        <el-button type="primary" @click="startSimulation">开始GPS模拟</el-button>
        <el-button @click="stopSimulation">停止模拟</el-button>
        <el-button @click="resetPosition">重置位置</el-button>
        <el-button @click="generateRandomPath">生成随机路径</el-button>
      </div>
    </div>

    <div class="test-content">
      <!-- GPS组件 -->
      <div class="widget-container">
        <GPSWidget 
          :datasets="mockDatasets"
          :map-height="500"
          :show-info="true"
          :show-performance="true"
          @position-update="handlePositionUpdate"
          @refresh="handleRefresh"
          @settings="handleSettings"
          @export="handleExport"
        />
      </div>

      <!-- 测试信息面板 -->
      <div class="test-info">
        <h3>测试信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">模拟状态:</span>
            <span class="value" :class="{ active: isSimulating }">
              {{ isSimulating ? '运行中' : '已停止' }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">当前位置:</span>
            <span class="value">
              {{ currentLat.toFixed(6) }}, {{ currentLng.toFixed(6) }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">高度:</span>
            <span class="value">{{ currentAlt.toFixed(1) }} m</span>
          </div>
          <div class="info-item">
            <span class="label">更新次数:</span>
            <span class="value">{{ updateCount }}</span>
          </div>
          <div class="info-item">
            <span class="label">模拟速度:</span>
            <span class="value">{{ simulationSpeed }} Hz</span>
          </div>
        </div>

        <!-- 预设位置按钮 -->
        <div class="preset-locations">
          <h4>预设位置</h4>
          <div class="location-buttons">
            <el-button 
              size="small" 
              v-for="location in presetLocations" 
              :key="location.name"
              @click="jumpToLocation(location)"
            >
              {{ location.name }}
            </el-button>
          </div>
        </div>

        <!-- 路径生成选项 -->
        <div class="path-options">
          <h4>路径类型</h4>
          <el-radio-group v-model="pathType">
            <el-radio-button label="linear">直线</el-radio-button>
            <el-radio-button label="circular">圆形</el-radio-button>
            <el-radio-button label="random">随机游走</el-radio-button>
            <el-radio-button label="figure8">8字形</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElButton, ElRadioGroup, ElRadioButton } from 'element-plus'
import GPSWidget from '../widgets/GPSWidget.vue'
import { GPSPosition, Dataset, Group, WidgetType } from '@/shared/types'

// 响应式状态
const isSimulating = ref(false)
const simulationInterval = ref<NodeJS.Timeout>()
const simulationSpeed = ref(2) // Hz
const updateCount = ref(0)
const pathType = ref<'linear' | 'circular' | 'random' | 'figure8'>('circular')

// GPS位置状态
const currentLat = ref(39.9042) // 北京天安门
const currentLng = ref(116.4074)
const currentAlt = ref(50)

// 路径参数
const pathStep = ref(0)
const pathRadius = ref(0.001) // 约100米
const randomDirection = ref(0)

// 预设位置
const presetLocations = [
  { name: '北京', lat: 39.9042, lng: 116.4074, alt: 50 },
  { name: '上海', lat: 31.2304, lng: 121.4737, alt: 10 },
  { name: '深圳', lat: 22.5431, lng: 114.0579, alt: 5 },
  { name: '成都', lat: 30.5728, lng: 104.0668, alt: 500 },
  { name: '西安', lat: 34.3416, lng: 108.9398, alt: 400 },
  { name: '拉萨', lat: 29.6520, lng: 91.1721, alt: 3650 }
]

// 模拟GPS数据集
const mockDatasets = ref<Dataset[]>([
  {
    id: 'lat',
    title: '纬度',
    value: currentLat.value,
    unit: '°',
    widget: WidgetType.GPS,
    graph: true,
    log: true,
    led: false,
    alarm: false,
    fft: false
  },
  {
    id: 'lng', 
    title: '经度',
    value: currentLng.value,
    unit: '°',
    widget: WidgetType.GPS,
    graph: true,
    log: true,
    led: false,
    alarm: false,
    fft: false
  },
  {
    id: 'alt',
    title: '高度',
    value: currentAlt.value,
    unit: 'm',
    widget: WidgetType.GPS,
    graph: true,
    log: true,
    led: false,
    alarm: false,
    fft: false
  }
])

// 开始GPS模拟
const startSimulation = () => {
  if (isSimulating.value) return

  isSimulating.value = true
  pathStep.value = 0
  updateCount.value = 0

  simulationInterval.value = setInterval(() => {
    updateGPSPosition()
    updateMockDatasets()
    pathStep.value++
    updateCount.value++
  }, 1000 / simulationSpeed.value)
}

// 停止GPS模拟
const stopSimulation = () => {
  isSimulating.value = false
  if (simulationInterval.value) {
    clearInterval(simulationInterval.value)
    simulationInterval.value = undefined
  }
}

// 更新GPS位置（根据路径类型）
const updateGPSPosition = () => {
  const step = pathStep.value
  const time = step * 0.1

  switch (pathType.value) {
    case 'linear':
      // 直线移动（向东北）
      currentLat.value += 0.0001
      currentLng.value += 0.0001
      currentAlt.value += Math.sin(time) * 2
      break

    case 'circular':
      // 圆形路径
      const centerLat = 39.9042
      const centerLng = 116.4074
      currentLat.value = centerLat + pathRadius.value * Math.cos(time)
      currentLng.value = centerLng + pathRadius.value * Math.sin(time)
      currentAlt.value = 50 + Math.sin(time * 2) * 10
      break

    case 'random':
      // 随机游走
      randomDirection.value += (Math.random() - 0.5) * 0.5
      const speed = 0.00005
      currentLat.value += Math.cos(randomDirection.value) * speed
      currentLng.value += Math.sin(randomDirection.value) * speed
      currentAlt.value += (Math.random() - 0.5) * 5
      break

    case 'figure8':
      // 8字形路径
      currentLat.value = 39.9042 + pathRadius.value * Math.sin(time)
      currentLng.value = 116.4074 + pathRadius.value * Math.sin(time * 2)
      currentAlt.value = 50 + Math.sin(time * 3) * 15
      break
  }

  // 限制高度范围
  currentAlt.value = Math.max(-100, Math.min(9000, currentAlt.value))
}

// 更新模拟数据集
const updateMockDatasets = () => {
  mockDatasets.value[0].value = currentLat.value
  mockDatasets.value[1].value = currentLng.value
  mockDatasets.value[2].value = currentAlt.value
}

// 跳转到预设位置
const jumpToLocation = (location: any) => {
  currentLat.value = location.lat
  currentLng.value = location.lng
  currentAlt.value = location.alt
  updateMockDatasets()
  pathStep.value = 0
}

// 重置位置
const resetPosition = () => {
  jumpToLocation(presetLocations[0]) // 重置到北京
}

// 生成随机路径
const generateRandomPath = () => {
  // 在当前位置周围生成随机路径
  const pathTypes: Array<'linear' | 'circular' | 'random' | 'figure8'> = ['linear', 'circular', 'random', 'figure8']
  pathType.value = pathTypes[Math.floor(Math.random() * pathTypes.length)]
  
  // 随机调整路径参数
  pathRadius.value = 0.0005 + Math.random() * 0.002
  simulationSpeed.value = 1 + Math.random() * 4
  
  console.log(`生成${pathType.value}路径，半径：${pathRadius.value.toFixed(6)}，速度：${simulationSpeed.value.toFixed(1)}Hz`)
}

// 事件处理
const handlePositionUpdate = (position: GPSPosition) => {
  console.log('GPS位置更新:', position)
}

const handleRefresh = () => {
  console.log('GPS组件刷新')
  updateCount.value = 0
}

const handleSettings = () => {
  console.log('打开GPS设置')
}

const handleExport = (data: any) => {
  console.log('导出GPS数据:', data)
}

// 生命周期
onMounted(() => {
  updateMockDatasets()
  console.log('GPS测试页面已加载')
})

onUnmounted(() => {
  stopSimulation()
})
</script>

<style scoped>
.gps-test-container {
  padding: 20px;
  max-width: 1400px;
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
  grid-template-columns: 1fr 350px;
  gap: 20px;
}

.widget-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
}

.test-info {
  background: var(--el-bg-color-page);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.test-info h3 {
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
}

.info-grid {
  display: grid;
  gap: 8px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: var(--el-bg-color);
  border-radius: 4px;
  font-size: 14px;
}

.label {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.value {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.value.active {
  color: var(--el-color-success);
}

.preset-locations,
.path-options {
  margin-bottom: 20px;
}

.preset-locations h4,
.path-options h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.location-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .test-content {
    grid-template-columns: 1fr;
  }
  
  .test-info {
    order: -1;
  }
}

@media (max-width: 768px) {
  .gps-test-container {
    padding: 10px;
  }
  
  .test-controls {
    justify-content: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .location-buttons {
    justify-content: center;
  }
}
</style>