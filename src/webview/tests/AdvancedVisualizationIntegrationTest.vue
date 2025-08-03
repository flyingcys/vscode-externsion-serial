<template>
  <div class="advanced-viz-test">
    <h1>高级可视化组件集成测试</h1>
    
    <!-- 测试控制面板 -->
    <div class="test-controls">
      <el-button @click="startAllTests" type="primary">开始全部测试</el-button>
      <el-button @click="runPerformanceTest" type="success">性能基准测试</el-button>
      <el-button @click="clearResults" type="warning">清空结果</el-button>
    </div>

    <!-- 测试结果面板 -->
    <div class="test-results">
      <h3>测试结果</h3>
      <div v-for="result in testResults" :key="result.name" 
           :class="['test-result', result.passed ? 'success' : 'failed']">
        <span>{{ result.name }}</span>
        <span>{{ result.passed ? '✅ 通过' : '❌ 失败' }}</span>
        <span v-if="result.detail">{{ result.detail }}</span>
      </div>
    </div>

    <!-- 性能监控面板 -->
    <div class="performance-monitor">
      <h3>实时性能监控</h3>
      <div class="performance-metrics">
        <div>3D渲染帧率: {{ performance3D.fps }} FPS</div>
        <div>地图响应时间: {{ performanceGPS.responseTime }} ms</div>
        <div>FFT处理速度: {{ performanceFFT.samplesPerSecond }} samples/s</div>
        <div>多图表更新频率: {{ performanceMulti.updateRate }} Hz</div>
      </div>
    </div>

    <!-- 组件测试区域 -->
    <div class="test-area">
      <div class="test-grid">
        <!-- GPS测试 -->
        <div class="test-item">
          <h4>GPS地图组件测试</h4>
          <div class="test-controls-mini">
            <el-button @click="testGPSBasic" size="small">基础功能</el-button>
            <el-button @click="testGPSTrajectory" size="small">轨迹绘制</el-button>
            <el-button @click="testGPSLayers" size="small">图层切换</el-button>
          </div>
          <GPSWidget 
            ref="gpsWidget"
            :dataset="gpsTestData"
            :config="gpsConfig"
            @update="onGPSUpdate"
          />
        </div>

        <!-- 3D可视化测试 -->
        <div class="test-item">
          <h4>3D可视化组件测试</h4>
          <div class="test-controls-mini">
            <el-button @click="test3DBasic" size="small">基础渲染</el-button>
            <el-button @click="test3DCamera" size="small">相机控制</el-button>
            <el-button @click="test3DStereo" size="small">立体显示</el-button>
          </div>
          <Plot3DWidget 
            ref="plot3DWidget"
            :dataset="plot3DTestData"
            :config="plot3DConfig"
            @update="on3DUpdate"
          />
        </div>

        <!-- FFT频谱测试 -->
        <div class="test-item">
          <h4>FFT频谱分析测试</h4>
          <div class="test-controls-mini">
            <el-button @click="testFFTBasic" size="small">基础FFT</el-button>
            <el-button @click="testFFTWindow" size="small">窗函数</el-button>
            <el-button @click="testFFTRealtime" size="small">实时分析</el-button>
          </div>
          <FFTPlotWidget 
            ref="fftWidget"
            :dataset="fftTestData"
            :config="fftConfig"
            @update="onFFTUpdate"
          />
        </div>

        <!-- 多数据图表测试 -->
        <div class="test-item">
          <h4>多数据图表测试</h4>
          <div class="test-controls-mini">
            <el-button @click="testMultiBasic" size="small">多曲线</el-button>
            <el-button @click="testMultiLegend" size="small">图例控制</el-button>
            <el-button @click="testMultiInterpolation" size="small">插值模式</el-button>
          </div>
          <MultiPlotWidget 
            ref="multiPlotWidget"
            :dataset="multiPlotTestData"
            :config="multiPlotConfig"
            @update="onMultiPlotUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import GPSWidget from '@/components/widgets/GPSWidget.vue'
import Plot3DWidget from '@/components/widgets/Plot3DWidget.vue'
import FFTPlotWidget from '@/components/widgets/FFTPlotWidget.vue'
import MultiPlotWidget from '@/components/widgets/MultiPlotWidget.vue'
import type { Dataset, GPSPosition, Point3D, PlotData3D } from '@/shared/types'

// 组件引用
const gpsWidget = ref()
const plot3DWidget = ref()
const fftWidget = ref()
const multiPlotWidget = ref()

// 测试结果
interface TestResult {
  name: string
  passed: boolean
  detail?: string
  timestamp: number
}

const testResults = ref<TestResult[]>([])

// 性能监控数据
const performance3D = reactive({
  fps: 0,
  frameCount: 0,
  startTime: 0
})

const performanceGPS = reactive({
  responseTime: 0,
  operationStart: 0
})

const performanceFFT = reactive({
  samplesPerSecond: 0,
  processedSamples: 0,
  startTime: 0
})

const performanceMulti = reactive({
  updateRate: 0,
  updateCount: 0,
  startTime: 0
})

// 测试数据
const gpsTestData = ref<Dataset>({
  id: 'gps-test',
  title: 'GPS测试数据',
  active: true,
  groups: [],
  value: {
    lat: 39.9042,
    lng: 116.4074,
    alt: 50,
    speed: 0,
    course: 0
  } as GPSPosition
})

const plot3DTestData = ref<Dataset>({
  id: '3d-test',
  title: '3D测试数据',
  active: true,
  groups: [],
  value: [] as Point3D[]
})

const fftTestData = ref<Dataset>({
  id: 'fft-test',
  title: 'FFT测试数据',
  active: true,
  groups: [],
  value: new Array(1024).fill(0).map((_, i) => 
    Math.sin(2 * Math.PI * 50 * i / 1024) + // 50Hz信号
    0.5 * Math.sin(2 * Math.PI * 120 * i / 1024) + // 120Hz信号
    0.1 * Math.random() // 噪声
  )
})

const multiPlotTestData = ref<Dataset>({
  id: 'multi-test',
  title: '多图表测试数据',
  active: true,
  groups: [],
  value: {
    series: [
      { id: 'series1', label: '传感器1', data: [], color: '#ff0000' },
      { id: 'series2', label: '传感器2', data: [], color: '#00ff00' },
      { id: 'series3', label: '传感器3', data: [], color: '#0000ff' }
    ]
  }
})

// 组件配置
const gpsConfig = reactive({
  autoCenter: true,
  showTrajectory: true,
  mapType: 'satellite',
  weatherLayer: false
})

const plot3DConfig = reactive({
  cameraType: 'perspective',
  enableStereo: false,
  interpolationMode: 'linear',
  showGrid: true
})

const fftConfig = reactive({
  windowFunction: 'hanning',
  fftSize: 1024,
  showCrosshairs: true,
  logScale: false
})

const multiPlotConfig = reactive({
  showLegend: true,
  interpolationMode: 'linear',
  maxDataPoints: 1000,
  autoScale: true
})

// 性能监控定时器
let performanceTimer: NodeJS.Timeout | null = null

// 测试函数
const addTestResult = (name: string, passed: boolean, detail?: string) => {
  testResults.value.push({
    name,
    passed,
    detail,
    timestamp: Date.now()
  })
}

// GPS组件测试
const testGPSBasic = async () => {
  try {
    performanceGPS.operationStart = performance.now()
    
    // 测试地图初始化
    if (!gpsWidget.value?.isMapInitialized()) {
      throw new Error('地图未正确初始化')
    }
    
    // 测试GPS数据更新
    const newPosition: GPSPosition = {
      lat: 40.0000,
      lng: 116.5000,
      alt: 100,
      speed: 30,
      course: 45
    }
    
    await gpsWidget.value.updatePosition(newPosition)
    
    performanceGPS.responseTime = performance.now() - performanceGPS.operationStart
    addTestResult('GPS基础功能', true, `响应时间: ${performanceGPS.responseTime.toFixed(2)}ms`)
    
  } catch (error) {
    addTestResult('GPS基础功能', false, error.message)
  }
}

const testGPSTrajectory = async () => {
  try {
    // 模拟轨迹数据
    const trajectory: GPSPosition[] = [
      { lat: 39.9042, lng: 116.4074, alt: 50, speed: 10, course: 0 },
      { lat: 39.9142, lng: 116.4174, alt: 55, speed: 15, course: 45 },
      { lat: 39.9242, lng: 116.4274, alt: 60, speed: 20, course: 90 }
    ]
    
    for (const pos of trajectory) {
      await gpsWidget.value.updatePosition(pos)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // 验证轨迹是否正确绘制
    const trajectoryLength = gpsWidget.value.getTrajectoryLength()
    if (trajectoryLength !== trajectory.length) {
      throw new Error(`轨迹点数不匹配: 期望${trajectory.length}, 实际${trajectoryLength}`)
    }
    
    addTestResult('GPS轨迹绘制', true, `轨迹点数: ${trajectoryLength}`)
    
  } catch (error) {
    addTestResult('GPS轨迹绘制', false, error.message)
  }
}

const testGPSLayers = async () => {
  try {
    const layers = ['satellite', 'street', 'terrain']
    
    for (const layer of layers) {
      gpsConfig.mapType = layer
      await new Promise(resolve => setTimeout(resolve, 200))
      
      if (gpsWidget.value.getCurrentMapType() !== layer) {
        throw new Error(`图层切换失败: ${layer}`)
      }
    }
    
    // 测试天气图层
    gpsConfig.weatherLayer = true
    await new Promise(resolve => setTimeout(resolve, 300))
    
    addTestResult('GPS图层切换', true, '所有图层切换正常')
    
  } catch (error) {
    addTestResult('GPS图层切换', false, error.message)
  }
}

// 3D组件测试
const test3DBasic = async () => {
  try {
    performance3D.startTime = performance.now()
    performance3D.frameCount = 0
    
    // 生成测试3D数据
    const testPoints: Point3D[] = []
    for (let i = 0; i < 100; i++) {
      testPoints.push({
        x: Math.random() * 10 - 5,
        y: Math.random() * 10 - 5,
        z: Math.random() * 10 - 5,
        value: Math.random()
      })
    }
    
    plot3DTestData.value.value = testPoints
    
    // 验证渲染
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (!plot3DWidget.value?.isRendering()) {
      throw new Error('3D场景未正确渲染')
    }
    
    const renderInfo = plot3DWidget.value.getRenderInfo()
    addTestResult('3D基础渲染', true, `顶点数: ${renderInfo.vertices}, 面数: ${renderInfo.faces}`)
    
  } catch (error) {
    addTestResult('3D基础渲染', false, error.message)
  }
}

const test3DCamera = async () => {
  try {
    // 测试相机控制
    const camera = plot3DWidget.value.getCamera()
    const originalPosition = { ...camera.position }
    
    // 旋转相机
    await plot3DWidget.value.rotateCamera(45, 30)
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 缩放相机
    await plot3DWidget.value.zoomCamera(1.5)
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 重置相机
    await plot3DWidget.value.resetCamera()
    await new Promise(resolve => setTimeout(resolve, 200))
    
    addTestResult('3D相机控制', true, '相机操作正常')
    
  } catch (error) {
    addTestResult('3D相机控制', false, error.message)
  }
}

const test3DStereo = async () => {
  try {
    // 启用立体显示
    plot3DConfig.enableStereo = true
    await new Promise(resolve => setTimeout(resolve, 300))
    
    if (!plot3DWidget.value.isStereoEnabled()) {
      throw new Error('立体显示未启用')
    }
    
    // 测试不同立体模式
    const stereoModes = ['anaglyph', 'parallel', 'crosseyed']
    for (const mode of stereoModes) {
      await plot3DWidget.value.setStereoMode(mode)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    addTestResult('3D立体显示', true, '立体模式切换正常')
    
  } catch (error) {
    addTestResult('3D立体显示', false, error.message)
  }
}

// FFT组件测试
const testFFTBasic = async () => {
  try {
    performanceFFT.startTime = performance.now()
    performanceFFT.processedSamples = 0
    
    // 生成测试信号（已在初始化中完成）
    const result = await fftWidget.value.performFFT(fftTestData.value.value)
    
    // 验证FFT结果
    if (!result || result.length === 0) {
      throw new Error('FFT计算结果为空')
    }
    
    // 检查主要频率峰值
    const frequencies = result.map((_, i) => i * 1024 / result.length)
    const magnitudes = result.map(complex => Math.sqrt(complex.real ** 2 + complex.imag ** 2))
    
    // 寻找50Hz和120Hz峰值
    const peak50 = findFrequencyPeak(frequencies, magnitudes, 50, 5)
    const peak120 = findFrequencyPeak(frequencies, magnitudes, 120, 10)
    
    if (!peak50 || !peak120) {
      throw new Error('未找到预期的频率峰值')
    }
    
    performanceFFT.processedSamples += fftTestData.value.value.length
    const elapsed = (performance.now() - performanceFFT.startTime) / 1000
    performanceFFT.samplesPerSecond = performanceFFT.processedSamples / elapsed
    
    addTestResult('FFT基础计算', true, `处理速度: ${performanceFFT.samplesPerSecond.toFixed(0)} samples/s`)
    
  } catch (error) {
    addTestResult('FFT基础计算', false, error.message)
  }
}

const testFFTWindow = async () => {
  try {
    const windowFunctions = ['rectangular', 'hanning', 'hamming', 'blackman']
    
    for (const windowFunc of windowFunctions) {
      fftConfig.windowFunction = windowFunc
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const result = await fftWidget.value.performFFT(fftTestData.value.value)
      if (!result || result.length === 0) {
        throw new Error(`窗函数 ${windowFunc} 计算失败`)
      }
    }
    
    addTestResult('FFT窗函数', true, '所有窗函数正常工作')
    
  } catch (error) {
    addTestResult('FFT窗函数', false, error.message)
  }
}

const testFFTRealtime = async () => {
  try {
    // 模拟实时数据流
    const sampleCount = 10
    let processedCount = 0
    
    const processRealTimeData = async () => {
      // 生成实时信号
      const realtimeData = new Array(512).fill(0).map((_, i) => 
        Math.sin(2 * Math.PI * (50 + Math.random() * 10) * i / 512) + 
        0.1 * Math.random()
      )
      
      const result = await fftWidget.value.performFFT(realtimeData)
      if (result && result.length > 0) {
        processedCount++
      }
    }
    
    // 连续处理多次
    for (let i = 0; i < sampleCount; i++) {
      await processRealTimeData()
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    if (processedCount !== sampleCount) {
      throw new Error(`实时处理失败: ${processedCount}/${sampleCount}`)
    }
    
    addTestResult('FFT实时分析', true, `成功处理: ${processedCount}次`)
    
  } catch (error) {
    addTestResult('FFT实时分析', false, error.message)
  }
}

// 多数据图表测试
const testMultiBasic = async () => {
  try {
    performanceMulti.startTime = performance.now()
    performanceMulti.updateCount = 0
    
    // 生成多条曲线数据
    const timeStamps = Array.from({length: 100}, (_, i) => i)
    
    multiPlotTestData.value.value.series.forEach((series, index) => {
      series.data = timeStamps.map(t => ({
        x: t,
        y: Math.sin(2 * Math.PI * (0.1 + index * 0.05) * t) + 0.1 * Math.random()
      }))
    })
    
    await multiPlotWidget.value.updateChart()
    performanceMulti.updateCount++
    
    // 验证曲线渲染
    const chartInfo = multiPlotWidget.value.getChartInfo()
    if (chartInfo.seriesCount !== 3) {
      throw new Error(`曲线数量不匹配: 期望3, 实际${chartInfo.seriesCount}`)
    }
    
    addTestResult('多曲线显示', true, `曲线数: ${chartInfo.seriesCount}`)
    
  } catch (error) {
    addTestResult('多曲线显示', false, error.message)
  }
}

const testMultiLegend = async () => {
  try {
    // 测试图例控制
    await multiPlotWidget.value.toggleSeries('series2', false)
    await new Promise(resolve => setTimeout(resolve, 100))
    
    let visibleCount = multiPlotWidget.value.getVisibleSeriesCount()
    if (visibleCount !== 2) {
      throw new Error(`隐藏曲线后可见数量错误: ${visibleCount}`)
    }
    
    // 重新显示
    await multiPlotWidget.value.toggleSeries('series2', true)
    await new Promise(resolve => setTimeout(resolve, 100))
    
    visibleCount = multiPlotWidget.value.getVisibleSeriesCount()
    if (visibleCount !== 3) {
      throw new Error(`显示曲线后可见数量错误: ${visibleCount}`)
    }
    
    addTestResult('图例控制', true, '图例显示/隐藏正常')
    
  } catch (error) {
    addTestResult('图例控制', false, error.message)
  }
}

const testMultiInterpolation = async () => {
  try {
    const interpolationModes = ['linear', 'cubic', 'step']
    
    for (const mode of interpolationModes) {
      multiPlotConfig.interpolationMode = mode
      await multiPlotWidget.value.updateChart()
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const currentMode = multiPlotWidget.value.getInterpolationMode()
      if (currentMode !== mode) {
        throw new Error(`插值模式设置失败: ${mode}`)
      }
    }
    
    addTestResult('插值模式', true, '所有插值模式正常')
    
  } catch (error) {
    addTestResult('插值模式', false, error.message)
  }
}

// 综合测试
const startAllTests = async () => {
  clearResults()
  
  console.log('开始高级可视化组件集成测试...')
  
  // GPS组件测试
  await testGPSBasic()
  await testGPSTrajectory()
  await testGPSLayers()
  
  // 3D组件测试
  await test3DBasic()
  await test3DCamera()
  await test3DStereo()
  
  // FFT组件测试
  await testFFTBasic()
  await testFFTWindow()
  await testFFTRealtime()
  
  // 多图表组件测试
  await testMultiBasic()
  await testMultiLegend()
  await testMultiInterpolation()
  
  console.log('所有测试完成!')
}

// 性能基准测试
const runPerformanceTest = async () => {
  console.log('开始性能基准测试...')
  
  // 重置性能计数器
  performance3D.fps = 0
  performance3D.frameCount = 0
  performance3D.startTime = performance.now()
  
  performanceGPS.responseTime = 0
  performanceFFT.samplesPerSecond = 0
  performanceMulti.updateRate = 0
  
  // 启动性能监控
  startPerformanceMonitoring()
  
  // 运行高强度测试
  await runStressTest()
  
  // 验证性能指标
  validatePerformanceTargets()
}

const runStressTest = async () => {
  // 3D高频渲染测试
  const render3DLoop = async () => {
    for (let i = 0; i < 60; i++) { // 1秒60帧
      await plot3DWidget.value?.render()
      performance3D.frameCount++
      await new Promise(resolve => setTimeout(resolve, 16)) // ~60fps
    }
  }
  
  // GPS高频更新测试
  const gpsUpdateLoop = async () => {
    for (let i = 0; i < 20; i++) { // 20次更新
      const start = performance.now()
      await gpsWidget.value?.updatePosition({
        lat: 39.9042 + Math.random() * 0.01,
        lng: 116.4074 + Math.random() * 0.01,
        alt: 50 + Math.random() * 10,
        speed: Math.random() * 50,
        course: Math.random() * 360
      })
      const responseTime = performance.now() - start
      performanceGPS.responseTime = Math.max(performanceGPS.responseTime, responseTime)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
  
  // FFT高速处理测试
  const fftProcessLoop = async () => {
    const startTime = performance.now()
    let sampleCount = 0
    
    for (let i = 0; i < 100; i++) { // 100次FFT计算
      const testData = new Array(1024).fill(0).map(() => Math.random())
      await fftWidget.value?.performFFT(testData)
      sampleCount += testData.length
    }
    
    const elapsed = (performance.now() - startTime) / 1000
    performanceFFT.samplesPerSecond = sampleCount / elapsed
  }
  
  // 多图表高频更新测试
  const multiPlotUpdateLoop = async () => {
    const startTime = performance.now()
    let updateCount = 0
    
    for (let i = 0; i < 50; i++) { // 50次更新
      // 模拟数据更新
      multiPlotTestData.value.value.series.forEach(series => {
        series.data.push({
          x: series.data.length,
          y: Math.random()
        })
        if (series.data.length > 1000) {
          series.data.shift()
        }
      })
      
      await multiPlotWidget.value?.updateChart()
      updateCount++
      await new Promise(resolve => setTimeout(resolve, 20))
    }
    
    const elapsed = (performance.now() - startTime) / 1000
    performanceMulti.updateRate = updateCount / elapsed
  }
  
  // 并行执行所有压力测试
  await Promise.all([
    render3DLoop(),
    gpsUpdateLoop(),
    fftProcessLoop(),
    multiPlotUpdateLoop()
  ])
}

const validatePerformanceTargets = () => {
  // 计算3D帧率
  const elapsed3D = (performance.now() - performance3D.startTime) / 1000
  performance3D.fps = performance3D.frameCount / elapsed3D
  
  // 验证性能目标
  const targets = {
    '3D渲染帧率': { actual: performance3D.fps, target: 30, unit: 'FPS' },
    '地图响应时间': { actual: performanceGPS.responseTime, target: 100, unit: 'ms', reverse: true },
    'FFT处理速度': { actual: performanceFFT.samplesPerSecond, target: 1000, unit: 'samples/s' },
    '多图表更新频率': { actual: performanceMulti.updateRate, target: 10, unit: 'Hz' }
  }
  
  Object.entries(targets).forEach(([name, { actual, target, unit, reverse }]) => {
    const passed = reverse ? actual <= target : actual >= target
    const detail = `${actual.toFixed(2)} ${unit} (目标: ${reverse ? '≤' : '≥'} ${target} ${unit})`
    addTestResult(`性能-${name}`, passed, detail)
  })
}

// 辅助函数
const findFrequencyPeak = (frequencies: number[], magnitudes: number[], targetFreq: number, tolerance: number) => {
  for (let i = 0; i < frequencies.length; i++) {
    if (Math.abs(frequencies[i] - targetFreq) <= tolerance) {
      // 检查是否为局部最大值
      const leftOk = i === 0 || magnitudes[i] >= magnitudes[i - 1]
      const rightOk = i === magnitudes.length - 1 || magnitudes[i] >= magnitudes[i + 1]
      if (leftOk && rightOk && magnitudes[i] > 0.1) { // 阈值检查
        return { frequency: frequencies[i], magnitude: magnitudes[i] }
      }
    }
  }
  return null
}

const startPerformanceMonitoring = () => {
  if (performanceTimer) {
    clearInterval(performanceTimer)
  }
  
  performanceTimer = setInterval(() => {
    // 实时更新性能指标显示
    // 这里的值已经在各个测试函数中更新
  }, 100)
}

const clearResults = () => {
  testResults.value = []
}

// 事件处理
const onGPSUpdate = (data: any) => {
  // GPS更新处理
}

const on3DUpdate = (data: any) => {
  // 3D更新处理
}

const onFFTUpdate = (data: any) => {
  // FFT更新处理
}

const onMultiPlotUpdate = (data: any) => {
  // 多图表更新处理
}

// 生命周期
onMounted(() => {
  console.log('高级可视化组件集成测试页面已加载')
  
  // 初始化测试数据
  setTimeout(() => {
    // 延迟初始化确保组件完全加载
  }, 1000)
})

onUnmounted(() => {
  if (performanceTimer) {
    clearInterval(performanceTimer)
  }
})
</script>

<style scoped>
.advanced-viz-test {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.test-controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.test-results {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 5px;
}

.test-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 3px;
}

.test-result.success {
  background: #e8f5e8;
  border-left: 4px solid #4caf50;
}

.test-result.failed {
  background: #ffeaea;
  border-left: 4px solid #f44336;
}

.performance-monitor {
  margin-bottom: 20px;
  padding: 15px;
  background: #f0f8ff;
  border-radius: 5px;
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.test-area {
  margin-top: 20px;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
  gap: 20px;
}

.test-item {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background: white;
}

.test-item h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.test-controls-mini {
  margin-bottom: 15px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 确保组件有合适的大小 */
.test-item > div:last-child {
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>