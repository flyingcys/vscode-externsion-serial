<!--
Plot3D组件 - 基于Serial-Studio Plot3D.qml和Plot3D.cpp实现
使用Three.js实现3D数据可视化，支持轨道控制、立体显示等功能
-->
<template>
  <BaseWidget 
    :widget-type="WidgetType.Plot3D"
    :title="widgetTitle"
    :datasets="datasets"
    @refresh="handleRefresh"
    @settings="handleSettings"
    @export="handleExport"
  >
    <!-- 3D可视化工具栏 -->
    <template #toolbar>
      <div class="plot3d-toolbar">
        <!-- 插值开关 -->
        <el-button
          size="small"
          :type="interpolationEnabled ? 'primary' : 'default'"
          @click="toggleInterpolation"
          title="启用插值"
        >
          <el-icon><Grid /></el-icon>
        </el-button>

        <el-divider direction="vertical" />

        <!-- 导航模式切换 -->
        <el-button-group size="small">
          <el-button
            :type="orbitNavigation ? 'primary' : 'default'"
            @click="setOrbitNavigation(true)"
            title="轨道导航"
          >
            <el-icon><Compass /></el-icon>
          </el-button>
          <el-button
            :type="!orbitNavigation ? 'primary' : 'default'"
            @click="setOrbitNavigation(false)"
            title="平移导航"
          >
            <el-icon><Rank /></el-icon>
          </el-button>
        </el-button-group>

        <el-divider direction="vertical" />

        <!-- 预设视角 -->
        <el-button-group size="small">
          <el-button @click="setViewAngle('orthogonal')" title="正交视图">
            <el-icon><View /></el-icon>
          </el-button>
          <el-button @click="setViewAngle('top')" title="顶视图">
            <el-icon><Top /></el-icon>
          </el-button>
          <el-button @click="setViewAngle('left')" title="左视图">
            <el-icon><Back /></el-icon>
          </el-button>
          <el-button @click="setViewAngle('front')" title="前视图">
            <el-icon><Right /></el-icon>
          </el-button>
        </el-button-group>

        <el-divider direction="vertical" />

        <!-- 立体显示控制 -->
        <el-button
          size="small"
          :type="anaglyphEnabled ? 'primary' : 'default'"
          @click="toggleAnaglyph"
          title="立体显示（红青）"
        >
          <el-icon><View /></el-icon>
        </el-button>

        <!-- 立体设置 -->
        <template v-if="anaglyphEnabled">
          <el-button
            size="small"
            :type="invertEyePositions ? 'primary' : 'default'"
            @click="toggleInvertEyes"
            title="反转眼位"
          >
            <el-icon><RefreshLeft /></el-icon>
          </el-button>

          <el-slider
            v-model="eyeSeparation"
            :min="30"
            :max="100"
            :step="1"
            style="width: 100px; margin: 0 8px;"
            @change="updateEyeSeparation"
          />
        </template>

        <div class="toolbar-spacer" />

        <!-- 性能信息 -->
        <div v-if="showPerformance" class="performance-info">
          <span>{{ currentFPS.toFixed(1) }} FPS</span>
          <span>{{ pointCount }} 点</span>
        </div>
      </div>
    </template>

    <!-- 3D渲染容器 -->
    <div class="plot3d-container">
      <div 
        ref="containerRef" 
        class="plot3d-canvas"
        :style="{ height: canvasHeight + 'px' }"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
        @contextmenu.prevent
      />

      <!-- 坐标轴信息面板 -->
      <div v-if="showAxisInfo" class="axis-info-panel">
        <div class="axis-item">
          <span class="axis-label" style="color: #ff0000;">X轴:</span>
          <span class="axis-range">{{ formatRange(dataRange.x) }}</span>
        </div>
        <div class="axis-item">
          <span class="axis-label" style="color: #00ff00;">Y轴:</span>
          <span class="axis-range">{{ formatRange(dataRange.y) }}</span>
        </div>
        <div class="axis-item">
          <span class="axis-label" style="color: #0000ff;">Z轴:</span>
          <span class="axis-range">{{ formatRange(dataRange.z) }}</span>
        </div>
      </div>

      <!-- 相机控制信息 -->
      <div v-if="showCameraInfo" class="camera-info">
        <div>缩放: {{ worldScale.toFixed(2) }}</div>
        <div>角度: {{ formatAngle(cameraAngles) }}</div>
        <div>偏移: {{ formatOffset(cameraOffset) }}</div>
      </div>
    </div>
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { 
  ElButton, 
  ElButtonGroup, 
  ElSlider, 
  ElIcon, 
  ElDivider 
} from 'element-plus'
import { 
  Grid, 
  Compass, 
  Rank, 
  View, 
  Top, 
  Back, 
  Right, 
  RefreshLeft 
} from '@element-plus/icons-vue'
import * as THREE from 'three'

import BaseWidget from '../base/BaseWidget.vue'
import { WidgetType, Point3D, Dataset } from '@/shared/types'
import { useDataStore } from '@/webview/stores/data'
import { useThemeStore } from '@/webview/stores/theme'

// Props定义
interface Props {
  datasets: Dataset[]
  widgetTitle?: string
  canvasHeight?: number
  showAxisInfo?: boolean
  showCameraInfo?: boolean
  showPerformance?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  widgetTitle: '3D数据图表',
  canvasHeight: 400,
  showAxisInfo: true,
  showCameraInfo: false,
  showPerformance: false
})

// Emits定义
const emit = defineEmits<{
  refresh: []
  settings: []
  export: [data: any]
  cameraChange: [angles: THREE.Vector3, offset: THREE.Vector3, scale: number]
}>()

// 存储引用
const dataStore = useDataStore()
const themeStore = useThemeStore()

// DOM引用
const containerRef = ref<HTMLDivElement>()

// Three.js核心对象
const scene = ref<THREE.Scene>()
const renderer = ref<THREE.WebGLRenderer>()
const camera = ref<THREE.PerspectiveCamera>()
const controls = ref<any>() // OrbitControls

// 渲染状态
const isInitialized = ref(false)
const animationId = ref<number>()
const lastFrameTime = ref(0)
const frameCount = ref(0)
const currentFPS = ref(60)

// 相机和控制状态
const worldScale = ref(0.05)
const cameraAngles = ref(new THREE.Vector3(300, 0, 225))
const cameraOffset = ref(new THREE.Vector3(0, 0, -10))
const orbitNavigation = ref(true)
const interpolationEnabled = ref(true)

// 立体显示状态
const anaglyphEnabled = ref(false)
const invertEyePositions = ref(false)
const eyeSeparation = ref(69) // 0.069 * 1000

// 鼠标交互状态
const isMouseDown = ref(false)
const lastMousePos = ref({ x: 0, y: 0 })

// 3D对象引用
const gridGroup = ref<THREE.Group>()
const axesGroup = ref<THREE.Group>()
const dataGroup = ref<THREE.Group>()
const cameraIndicator = ref<THREE.Group>()

// 数据状态
const dataPoints = ref<Point3D[]>([])
const dataRange = ref({
  x: { min: 0, max: 0 },
  y: { min: 0, max: 0 },
  z: { min: 0, max: 0 }
})

// 计算属性
const widgetTitle = computed(() => props.widgetTitle || '3D数据图表')
const pointCount = computed(() => dataPoints.value.length)

// 初始化3D场景
const initializeScene = async () => {
  if (!containerRef.value || isInitialized.value) return

  try {
    // 创建场景
    scene.value = new THREE.Scene()
    scene.value.background = new THREE.Color(0x1a1a1a)

    // 创建相机
    const aspect = containerRef.value.clientWidth / containerRef.value.clientHeight
    camera.value = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
    camera.value.position.set(5, 5, 5)
    camera.value.lookAt(0, 0, 0)

    // 创建渲染器
    renderer.value = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true 
    })
    
    renderer.value.setSize(
      containerRef.value.clientWidth, 
      containerRef.value.clientHeight
    )
    renderer.value.setPixelRatio(window.devicePixelRatio || 1)
    renderer.value.setClearColor(0x1a1a1a, 1)
    
    containerRef.value.appendChild(renderer.value.domElement)

    // 创建基础场景对象
    createGrid()
    createAxes()
    createDataGroup()
    createCameraIndicator()

    // 初始化控制器（这里简化实现，不使用OrbitControls库）
    setupCameraControls()

    // 设置默认视角
    setViewAngle('orthogonal')

    // 开始渲染循环
    startRenderLoop()

    isInitialized.value = true
    console.log('3D场景初始化完成')

  } catch (error) {
    console.error('3D场景初始化失败:', error)
  }
}

// 创建网格
const createGrid = () => {
  if (!scene.value) return

  gridGroup.value = new THREE.Group()
  
  // 创建网格平面
  const size = 10
  const divisions = 20
  
  const gridHelper = new THREE.GridHelper(size, divisions, 0x444444, 0x222222)
  gridGroup.value.add(gridHelper)
  
  // 添加XZ平面网格
  const gridXZ = new THREE.GridHelper(size, divisions, 0x444444, 0x222222)
  gridXZ.rotation.x = 0
  gridGroup.value.add(gridXZ)
  
  // 添加YZ平面网格
  const gridYZ = new THREE.GridHelper(size, divisions, 0x444444, 0x222222)
  gridYZ.rotation.z = Math.PI / 2
  gridGroup.value.add(gridYZ)
  
  // 添加XY平面网格
  const gridXY = new THREE.GridHelper(size, divisions, 0x444444, 0x222222)
  gridXY.rotation.x = Math.PI / 2
  gridGroup.value.add(gridXY)
  
  scene.value.add(gridGroup.value)
}

// 创建坐标轴
const createAxes = () => {
  if (!scene.value) return

  axesGroup.value = new THREE.Group()
  
  // 创建坐标轴
  const axesHelper = new THREE.AxesHelper(5)
  
  // 自定义坐标轴颜色
  const axesColors = axesHelper.material as THREE.LineBasicMaterial[]
  if (Array.isArray(axesColors)) {
    axesColors[0].color.setHex(0xff0000) // X轴红色
    axesColors[1].color.setHex(0x00ff00) // Y轴绿色  
    axesColors[2].color.setHex(0x0000ff) // Z轴蓝色
  }
  
  axesGroup.value.add(axesHelper)
  scene.value.add(axesGroup.value)
}

// 创建数据组
const createDataGroup = () => {
  if (!scene.value) return

  dataGroup.value = new THREE.Group()
  scene.value.add(dataGroup.value)
}

// 创建相机指示器
const createCameraIndicator = () => {
  if (!scene.value) return

  cameraIndicator.value = new THREE.Group()
  
  // 创建相机图标（简单的线框）
  const geometry = new THREE.BufferGeometry()
  const vertices = new Float32Array([
    -0.1, -0.1, 0, 0.1, -0.1, 0,
    0.1, -0.1, 0, 0.1, 0.1, 0,
    0.1, 0.1, 0, -0.1, 0.1, 0,
    -0.1, 0.1, 0, -0.1, -0.1, 0,
    0, 0, 0, 0, 0, 0.2
  ])
  
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  
  const material = new THREE.LineBasicMaterial({ color: 0xffffff })
  const indicator = new THREE.Line(geometry, material)
  
  cameraIndicator.value.add(indicator)
  scene.value.add(cameraIndicator.value)
}

// 设置相机控制
const setupCameraControls = () => {
  // 简化的相机控制实现
  // 实际项目中建议使用Three.js的OrbitControls
}

// 开始渲染循环
const startRenderLoop = () => {
  const animate = (time: number) => {
    animationId.value = requestAnimationFrame(animate)
    
    // 计算FPS
    if (time - lastFrameTime.value >= 1000) {
      currentFPS.value = frameCount.value
      frameCount.value = 0
      lastFrameTime.value = time
    }
    frameCount.value++
    
    // 渲染场景
    render()
  }
  
  animate(0)
}

// 渲染场景
const render = () => {
  if (!renderer.value || !scene.value || !camera.value) return

  if (anaglyphEnabled.value) {
    renderAnaglyph()
  } else {
    renderer.value.render(scene.value, camera.value)
  }
}

// 渲染立体（红青）模式
const renderAnaglyph = () => {
  if (!renderer.value || !scene.value || !camera.value) return

  // 保存原始相机位置
  const originalPosition = camera.value.position.clone()
  
  // 计算眼距
  const eyeDistance = eyeSeparation.value / 1000
  const halfDistance = eyeDistance / 2
  
  // 设置左右眼位置
  const leftEyePos = originalPosition.clone()
  const rightEyePos = originalPosition.clone()
  
  if (invertEyePositions.value) {
    leftEyePos.x += halfDistance
    rightEyePos.x -= halfDistance
  } else {
    leftEyePos.x -= halfDistance
    rightEyePos.x += halfDistance
  }
  
  // 创建渲染目标
  const renderTarget = new THREE.WebGLRenderTarget(
    renderer.value.domElement.width,
    renderer.value.domElement.height
  )
  
  // 渲染左眼（红色通道）
  camera.value.position.copy(leftEyePos)
  renderer.value.setRenderTarget(renderTarget)
  renderer.value.render(scene.value, camera.value)
  
  // 渲染右眼（青色通道）
  camera.value.position.copy(rightEyePos)
  renderer.value.setRenderTarget(null)
  renderer.value.render(scene.value, camera.value)
  
  // 恢复原始位置
  camera.value.position.copy(originalPosition)
}

// 更新3D数据
const updateDataVisualization = () => {
  if (!dataGroup.value || dataPoints.value.length === 0) return

  // 清除现有数据
  dataGroup.value.clear()
  
  // 创建线条几何体
  const geometry = new THREE.BufferGeometry()
  const vertices: number[] = []
  const colors: number[] = []
  
  for (let i = 0; i < dataPoints.value.length; i++) {
    const point = dataPoints.value[i]
    vertices.push(point.x, point.y, point.z)
    
    // 插值颜色
    if (interpolationEnabled.value && dataPoints.value.length > 1) {
      const t = i / (dataPoints.value.length - 1)
      const r = 0.2 + t * 0.8  // 从深红到亮红
      const g = 0.1 + t * 0.4  // 从暗到稍亮
      const b = 0.8 - t * 0.6  // 从亮蓝到暗蓝
      colors.push(r, g, b)
    } else {
      colors.push(0.6, 0.3, 0.9) // 默认紫色
    }
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  
  // 创建线条材质
  const material = new THREE.LineBasicMaterial({ 
    vertexColors: true,
    linewidth: 2
  })
  
  // 创建线条对象
  const line = new THREE.Line(geometry, material)
  dataGroup.value.add(line)
  
  // 添加数据点
  if (dataPoints.value.length > 0) {
    const pointGeometry = new THREE.SphereGeometry(0.02, 8, 6)
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    
    dataPoints.value.forEach((point, index) => {
      const sphere = new THREE.Mesh(pointGeometry, pointMaterial)
      sphere.position.set(point.x, point.y, point.z)
      dataGroup.value!.add(sphere)
    })
  }
}

// 计算数据范围
const calculateDataRange = () => {
  if (dataPoints.value.length === 0) return
  
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity  
  let minZ = Infinity, maxZ = -Infinity
  
  dataPoints.value.forEach(point => {
    minX = Math.min(minX, point.x)
    maxX = Math.max(maxX, point.x)
    minY = Math.min(minY, point.y)
    maxY = Math.max(maxY, point.y)
    minZ = Math.min(minZ, point.z)
    maxZ = Math.max(maxZ, point.z)
  })
  
  dataRange.value = {
    x: { min: minX, max: maxX },
    y: { min: minY, max: maxY },
    z: { min: minZ, max: maxZ }
  }
}

// 工具栏事件处理
const toggleInterpolation = () => {
  interpolationEnabled.value = !interpolationEnabled.value
  updateDataVisualization()
}

const setOrbitNavigation = (enabled: boolean) => {
  orbitNavigation.value = enabled
}

const setViewAngle = (viewType: string) => {
  if (!camera.value) return
  
  const distance = 8
  
  switch (viewType) {
    case 'orthogonal':
      camera.value.position.set(distance, distance, distance)
      break
    case 'top':
      camera.value.position.set(0, distance, 0)
      break
    case 'left':
      camera.value.position.set(-distance, 0, 0)
      break
    case 'front':
      camera.value.position.set(0, 0, distance)
      break
  }
  
  camera.value.lookAt(0, 0, 0)
  
  // 更新相机角度记录
  const spherical = new THREE.Spherical()
  spherical.setFromVector3(camera.value.position)
  cameraAngles.value.set(
    spherical.phi * 180 / Math.PI,
    spherical.theta * 180 / Math.PI,
    0
  )
}

const toggleAnaglyph = () => {
  anaglyphEnabled.value = !anaglyphEnabled.value
}

const toggleInvertEyes = () => {
  invertEyePositions.value = !invertEyePositions.value
}

const updateEyeSeparation = (value: number) => {
  eyeSeparation.value = value
}

// 鼠标事件处理
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  
  if (!camera.value) return
  
  const zoomSpeed = 0.1
  const delta = event.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed
  
  camera.value.position.multiplyScalar(delta)
  worldScale.value *= delta
}

const handleMouseDown = (event: MouseEvent) => {
  isMouseDown.value = true
  lastMousePos.value = { x: event.clientX, y: event.clientY }
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isMouseDown.value || !camera.value) return
  
  const deltaX = event.clientX - lastMousePos.value.x
  const deltaY = event.clientY - lastMousePos.value.y
  
  if (orbitNavigation.value) {
    // 轨道导航模式
    const spherical = new THREE.Spherical()
    spherical.setFromVector3(camera.value.position)
    
    spherical.theta -= deltaX * 0.01
    spherical.phi += deltaY * 0.01
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi))
    
    camera.value.position.setFromSpherical(spherical)
    camera.value.lookAt(0, 0, 0)
  } else {
    // 平移导航模式
    const right = new THREE.Vector3()
    const up = new THREE.Vector3()
    
    camera.value.getWorldDirection(right)
    right.cross(camera.value.up).normalize()
    up.copy(camera.value.up)
    
    const moveSpeed = 0.01
    camera.value.position.add(right.multiplyScalar(-deltaX * moveSpeed))
    camera.value.position.add(up.multiplyScalar(deltaY * moveSpeed))
  }
  
  lastMousePos.value = { x: event.clientX, y: event.clientY }
}

const handleMouseUp = () => {
  isMouseDown.value = false
}

const handleMouseLeave = () => {
  isMouseDown.value = false
}

// Widget事件处理
const handleRefresh = () => {
  dataPoints.value = []
  updateDataVisualization()
  emit('refresh')
}

const handleSettings = () => {
  emit('settings')
}

const handleExport = () => {
  const exportData = {
    dataPoints: dataPoints.value,
    dataRange: dataRange.value,
    cameraSettings: {
      angles: cameraAngles.value,
      offset: cameraOffset.value,
      scale: worldScale.value
    },
    renderSettings: {
      interpolationEnabled: interpolationEnabled.value,
      anaglyphEnabled: anaglyphEnabled.value,
      orbitNavigation: orbitNavigation.value
    }
  }
  
  emit('export', exportData)
}

// 工具函数
const formatRange = (range: { min: number; max: number }) => {
  return `${range.min.toFixed(2)} ~ ${range.max.toFixed(2)}`
}

const formatAngle = (angles: THREE.Vector3) => {
  return `${angles.x.toFixed(1)}°, ${angles.y.toFixed(1)}°, ${angles.z.toFixed(1)}°`
}

const formatOffset = (offset: THREE.Vector3) => {
  return `${offset.x.toFixed(2)}, ${offset.y.toFixed(2)}, ${offset.z.toFixed(2)}`
}

// 监听数据变化
watch(
  () => dataStore.currentFrame,
  (newFrame) => {
    if (newFrame?.groups) {
      // 查找3D数据组
      const plot3dGroup = newFrame.groups.find(group => 
        group.widget === 'plot3d' || group.title.toLowerCase().includes('3d')
      )

      if (plot3dGroup?.datasets && plot3dGroup.datasets.length >= 3) {
        const xDataset = plot3dGroup.datasets.find(ds => 
          ds.title.toLowerCase().includes('x') || ds.id.includes('x')
        )
        const yDataset = plot3dGroup.datasets.find(ds => 
          ds.title.toLowerCase().includes('y') || ds.id.includes('y')
        )
        const zDataset = plot3dGroup.datasets.find(ds => 
          ds.title.toLowerCase().includes('z') || ds.id.includes('z')
        )

        if (xDataset?.value !== undefined && 
            yDataset?.value !== undefined && 
            zDataset?.value !== undefined) {
          
          const newPoint: Point3D = {
            x: parseFloat(xDataset.value.toString()),
            y: parseFloat(yDataset.value.toString()),  
            z: parseFloat(zDataset.value.toString())
          }

          // 验证数据有效性
          if (!isNaN(newPoint.x) && !isNaN(newPoint.y) && !isNaN(newPoint.z)) {
            dataPoints.value.push(newPoint)
            
            // 限制数据点数量（保留最近1000个点）
            if (dataPoints.value.length > 1000) {
              dataPoints.value = dataPoints.value.slice(-1000)
            }
            
            calculateDataRange()
            updateDataVisualization()
          }
        }
      }
    }
  },
  { immediate: true }
)

// 窗口大小变化处理
const handleResize = () => {
  if (!containerRef.value || !renderer.value || !camera.value) return
  
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  
  camera.value.aspect = width / height
  camera.value.updateProjectionMatrix()
  
  renderer.value.setSize(width, height)
}

// 生命周期
onMounted(async () => {
  await nextTick()
  await initializeScene()
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
  
  if (renderer.value) {
    renderer.value.dispose()
  }
  
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.plot3d-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-light);
  flex-wrap: wrap;
}

.toolbar-spacer {
  flex: 1;
}

.performance-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
  font-family: monospace;
  color: var(--el-text-color-regular);
}

.plot3d-container {
  position: relative;
  height: 100%;
  background: #1a1a1a;
  overflow: hidden;
}

.plot3d-canvas {
  width: 100%;
  cursor: grab;
  user-select: none;
}

.plot3d-canvas:active {
  cursor: grabbing;
}

.axis-info-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  font-family: monospace;
  backdrop-filter: blur(4px);
  min-width: 140px;
}

.axis-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.axis-item:last-child {
  margin-bottom: 0;
}

.axis-label {
  font-weight: bold;
  margin-right: 8px;
}

.axis-range {
  color: #cccccc;
}

.camera-info {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  font-family: monospace;
  backdrop-filter: blur(4px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .plot3d-toolbar {
    gap: 4px;
    padding: 6px;
  }
  
  .axis-info-panel {
    position: static;
    margin: 8px;
    width: auto;
  }
  
  .performance-info {
    font-size: 11px;
  }
}

/* Three.js 渲染器样式 */
:deep(.plot3d-canvas canvas) {
  display: block;
  border-radius: 4px;
}
</style>