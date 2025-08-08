/**
 * GyroscopeWidget Ultimate Coverage Test Suite
 * 
 * 基于Serial-Studio Gyroscope Widget的完整测试覆盖
 * 测试陀螺仪数据处理、SVG人工地平线、角速度显示、校准算法、数学积分
 * 
 * 目标：95%+ 代码覆盖率
 * 范围：Vue组件、SVG渲染、陀螺仪算法、性能监控、校准机制
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import GyroscopeWidget from '@/webview/components/widgets/GyroscopeWidget.vue'
import { createPinia, setActivePinia } from 'pinia'
import { WidgetType } from '@/shared/types'

// === Mock Element Plus 组件 ===
const mockElementPlusComponents = {
  ElButton: {
    name: 'ElButton',
    template: '<button @click="$emit(\'click\')" :class="{ \'is-active\': $attrs.class?.includes(\'is-active\') }"><slot /></button>',
    props: ['icon', 'size', 'type', 'disabled'],
    emits: ['click']
  },
  ElButtonGroup: {
    name: 'ElButtonGroup',
    template: '<div class="el-button-group"><slot /></div>',
    props: ['size']
  },
  ElTooltip: {
    name: 'ElTooltip',
    template: '<div class="el-tooltip" :title="content"><slot /></div>',
    props: ['content', 'placement']
  },
  ElDropdown: {
    name: 'ElDropdown',
    template: '<div class="el-dropdown" @click="$emit(\'command\', \'attitude\')"><slot /><slot name="dropdown" /></div>',
    props: ['trigger'],
    emits: ['command']
  },
  ElDropdownMenu: {
    name: 'ElDropdownMenu',
    template: '<div class="el-dropdown-menu"><slot /></div>'
  },
  ElDropdownItem: {
    name: 'ElDropdownItem',
    template: '<div class="el-dropdown-item" @click="$emit(\'click\')" :data-command="command"><slot /></div>',
    props: ['command'],
    emits: ['click']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon" :class="$attrs.class"><slot /></i>',
    props: ['size']
  },
  ElProgress: {
    name: 'ElProgress',
    template: '<div class="el-progress" :data-percentage="percentage"><div class="progress-bar" :style="`width: ${percentage}%`"></div></div>',
    props: ['percentage', 'showText']
  }
}

// Mock Element Plus Icons
const mockIcons = {
  VideoPlay: { name: 'VideoPlay', template: '<svg><path d="video-play-icon"/></svg>' },
  VideoPause: { name: 'VideoPause', template: '<svg><path d="video-pause-icon"/></svg>' },
  Loading: { name: 'Loading', template: '<svg><path d="loading-icon"/></svg>' },
  Operation: { name: 'Operation', template: '<svg><path d="operation-icon"/></svg>' }
}

// === Mock BaseWidget ===
const mockBaseWidget = {
  name: 'BaseWidget',
  template: `
    <div class="base-widget" :class="'widget-' + widgetType">
      <div class="widget-header">
        <div class="widget-title">{{ title }}</div>
        <div class="widget-toolbar"><slot name="toolbar" /></div>
      </div>
      <div class="widget-content"><slot /></div>
      <div class="widget-footer">
        <div class="footer-left"><slot name="footer-left" /></div>
        <div class="footer-right"><slot name="footer-right" /></div>
      </div>
    </div>
  `,
  props: [
    'widgetType', 'title', 'datasets', 'widgetData', 'widgetConfig',
    'isLoading', 'hasError', 'errorMessage', 'hasData', 'lastUpdate'
  ],
  emits: ['refresh', 'settings', 'export', 'resize', 'settings-changed']
}

// === Mock stores ===
const mockThemeStore = {
  isDark: false,
  primaryColor: '#409EFF'
}

const mockPerformanceStore = {
  recordFrame: vi.fn(),
  getAverageFrameTime: vi.fn().mockReturnValue(16.7),
  getFrameRate: vi.fn().mockReturnValue(60)
}

vi.mock('@/stores/theme', () => ({
  useThemeStore: () => mockThemeStore
}))

vi.mock('@/stores/performance', () => ({
  usePerformanceStore: () => mockPerformanceStore
}))

// === 全局Mock配置 ===
global.performance = {
  now: vi.fn(() => Date.now())
}

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

global.requestAnimationFrame = vi.fn((callback) => setTimeout(callback, 16))
global.cancelAnimationFrame = vi.fn()

// Mock数学函数确保精度
Math.sin = vi.fn().mockImplementation((x) => {
  const originalSin = Math.sin
  return originalSin.call(Math, x)
})

Math.cos = vi.fn().mockImplementation((x) => {
  const originalCos = Math.cos
  return originalCos.call(Math, x)
})

// Mock setInterval and clearInterval for calibration
global.setInterval = vi.fn().mockImplementation((callback, delay) => {
  const id = setTimeout(callback, delay)
  return id
})

global.clearInterval = vi.fn().mockImplementation((id) => {
  clearTimeout(id)
})

describe('GyroscopeWidget Ultimate Coverage Tests', () => {
  let wrapper: VueWrapper<any>
  let pinia: any

  const createComponent = (props: any = {}) => {
    return mount(GyroscopeWidget, {
      props: {
        datasets: [],
        config: {},
        realtime: false, // 禁用实时更新以避免测试中的定时器问题
        updateInterval: 20,
        maxAngularRate: 500,
        enableIntegration: true,
        size: 200,
        ...props
      },
      global: {
        plugins: [pinia],
        components: {
          ...mockElementPlusComponents,
          ...mockIcons,
          BaseWidget: mockBaseWidget
        },
        stubs: {
          BaseWidget: mockBaseWidget
        }
      }
    })
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.useRealTimers()
  })

  // ==================== 1. 组件初始化和生命周期 ====================
  describe('1. Component Initialization and Lifecycle', () => {
    it('应该正确初始化GyroscopeWidget组件', async () => {
      wrapper = createComponent()
      await nextTick()

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'BaseWidget' }).exists()).toBe(true)
      expect(wrapper.find('.gyroscope-container').exists()).toBe(true)
    })

    it('应该正确设置默认props', () => {
      wrapper = createComponent()
      const vm = wrapper.vm

      expect(vm.realtime).toBe(false)
      expect(vm.updateInterval).toBe(20)
      expect(vm.maxAngularRate).toBe(500)
      expect(vm.enableIntegration).toBe(true)
      expect(vm.size).toBe(200)
    })

    it('应该在挂载时初始化陀螺仪', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation()
      wrapper = createComponent()
      await nextTick()

      const vm = wrapper.vm
      expect(vm.isLoading).toBe(false)
      expect(vm.gyroscopeData).toEqual({ roll: 0, pitch: 0, yaw: 0 })
      expect(vm.attitudes).toEqual({ roll: 0, pitch: 0, yaw: 0 })
      expect(consoleSpy).toHaveBeenCalledWith('陀螺仪初始化完成')

      consoleSpy.mockRestore()
    })

    it('应该在卸载时停止校准', async () => {
      wrapper = createComponent()
      await nextTick()
      
      const vm = wrapper.vm
      vm.isCalibrating = true

      wrapper.unmount()

      expect(vm.isCalibrating).toBe(false)
    })

    it('应该处理初始化错误', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation()
      
      // Mock an initialization error
      const originalNextTick = nextTick
      vi.mocked(nextTick).mockRejectedValue(new Error('初始化失败'))

      wrapper = createComponent()
      
      // 等待错误处理
      await new Promise(resolve => setTimeout(resolve, 100))

      const vm = wrapper.vm
      expect(vm.hasError).toBe(true)
      expect(vm.errorMessage).toBe('初始化失败')
      expect(vm.isLoading).toBe(false)

      // 恢复 nextTick
      vi.mocked(nextTick).mockImplementation(originalNextTick)
      consoleError.mockRestore()
    })
  })

  // ==================== 2. 陀螺仪数据处理和角度积分 ====================
  describe('2. Gyroscope Data Processing and Angle Integration', () => {
    beforeEach(async () => {
      wrapper = createComponent({ enableIntegration: true })
      await nextTick()
    })

    it('应该更新角速度数据', async () => {
      const vm = wrapper.vm
      
      vm.updateAngularRates(10, 20, 30)

      expect(vm.gyroscopeData.roll).toBe(10)
      expect(vm.gyroscopeData.pitch).toBe(20)
      expect(vm.gyroscopeData.yaw).toBe(30)
      expect(vm.lastUpdate).toBeGreaterThan(0)
    })

    it('应该应用校准偏移', async () => {
      const vm = wrapper.vm
      vm.calibrationOffset = { roll: 5, pitch: 3, yaw: 2 }
      
      vm.updateAngularRates(15, 13, 12)

      expect(vm.gyroscopeData.roll).toBe(10) // 15 - 5
      expect(vm.gyroscopeData.pitch).toBe(10) // 13 - 3
      expect(vm.gyroscopeData.yaw).toBe(10) // 12 - 2
    })

    it('应该积分计算姿态角度', async () => {
      const vm = wrapper.vm
      const initialTime = Date.now()
      vm.lastUpdateTime = initialTime

      // Mock performance.now to simulate time passage
      vi.mocked(global.performance.now)
        .mockReturnValueOnce(initialTime)
        .mockReturnValueOnce(initialTime + 100) // 0.1秒后

      vm.updateAngularRates(100, 200, 300) // 角速度 °/s

      // 预期: 角度 = 角速度 * 时间
      // 0.1秒 * 100°/s = 10°
      expect(vm.attitudes.roll).toBe(10)
      expect(vm.attitudes.pitch).toBe(20)
      expect(vm.attitudes.yaw).toBe(30)
    })

    it('应该正确归一化角度', async () => {
      const vm = wrapper.vm

      expect(vm.normalizeAngle(190)).toBe(-170) // 190 - 360 = -170
      expect(vm.normalizeAngle(-190)).toBe(170) // -190 + 360 = 170
      expect(vm.normalizeAngle(90)).toBe(90) // 正常范围内
      expect(vm.normalizeAngle(0)).toBe(0)
      expect(vm.normalizeAngle(180)).toBe(180)
      expect(vm.normalizeAngle(-180)).toBe(-180)
    })

    it('应该限制俯仰角范围', async () => {
      const vm = wrapper.vm
      const initialTime = Date.now()
      vm.lastUpdateTime = initialTime

      vi.mocked(global.performance.now)
        .mockReturnValueOnce(initialTime)
        .mockReturnValueOnce(initialTime + 1000) // 1秒

      vm.updateAngularRates(0, 1000, 0) // 极大的俯仰角速度

      expect(vm.attitudes.pitch).toBeLessThanOrEqual(90)
      expect(vm.attitudes.pitch).toBeGreaterThanOrEqual(-90)
    })

    it('应该防止异常大的时间间隔', async () => {
      const vm = wrapper.vm
      const initialTime = Date.now()
      vm.lastUpdateTime = initialTime

      vi.mocked(global.performance.now)
        .mockReturnValueOnce(initialTime)
        .mockReturnValueOnce(initialTime + 200000) // 200秒，异常大的间隔

      const initialAttitude = { ...vm.attitudes }
      vm.updateAngularRates(100, 200, 300)

      // 姿态不应该发生巨大变化
      expect(vm.attitudes).toEqual(initialAttitude)
    })

    it('应该在暂停时不更新数据', async () => {
      const vm = wrapper.vm
      vm.isPaused = true
      
      const initialData = { ...vm.gyroscopeData }
      vm.updateAngularRates(50, 60, 70)

      expect(vm.gyroscopeData).toEqual(initialData)
    })
  })

  // ==================== 3. 校准功能测试 ====================
  describe('3. Calibration Functionality', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该开始校准过程', async () => {
      const vm = wrapper.vm
      
      vm.startCalibration()

      expect(vm.isCalibrating).toBe(true)
      expect(vm.calibrationProgress).toBe(0)
      expect(setInterval).toHaveBeenCalled()
    })

    it('应该停止校准过程', async () => {
      const vm = wrapper.vm
      vm.isCalibrating = true
      vm.calibrationProgress = 50
      
      vm.stopCalibration()

      expect(vm.isCalibrating).toBe(false)
      expect(vm.calibrationProgress).toBe(0)
    })

    it('应该切换校准状态', async () => {
      const vm = wrapper.vm
      const initialCalibrating = vm.isCalibrating
      
      vm.toggleCalibration()

      expect(vm.isCalibrating).toBe(!initialCalibrating)
    })

    it('应该计算校准偏移值', async () => {
      const vm = wrapper.vm
      
      // 设置模拟的陀螺仪数据
      vm.gyroscopeData = { roll: 5, pitch: 3, yaw: 2 }
      
      // 模拟校准定时器回调
      const calibrationCallback = vi.mocked(setInterval).mock.calls[0]?.[0]
      
      if (calibrationCallback) {
        vm.startCalibration()
        
        // 模拟多次采样
        for (let i = 0; i < 60; i++) { // 3秒 / 50ms = 60次采样
          vi.advanceTimersByTime(50)
          if (typeof calibrationCallback === 'function') {
            calibrationCallback()
          }
        }

        expect(vm.calibrationOffset.roll).toBe(5)
        expect(vm.calibrationOffset.pitch).toBe(3)
        expect(vm.calibrationOffset.yaw).toBe(2)
        expect(vm.isCalibrating).toBe(false)
      }
    })

    it('应该更新校准进度', async () => {
      const vm = wrapper.vm
      vm.startCalibration()
      
      const calibrationCallback = vi.mocked(setInterval).mock.calls[0]?.[0]
      
      if (typeof calibrationCallback === 'function') {
        // 模拟校准进度
        for (let i = 1; i <= 30; i++) {
          calibrationCallback()
          const expectedProgress = (i / 60) * 100 // 60 total samples
          expect(vm.calibrationProgress).toBe(expectedProgress)
        }
      }
    })

    it('应该在校准完成时记录日志', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation()
      const vm = wrapper.vm
      
      vm.startCalibration()
      
      const calibrationCallback = vi.mocked(setInterval).mock.calls[0]?.[0]
      
      if (typeof calibrationCallback === 'function') {
        // 完成所有采样
        for (let i = 0; i < 60; i++) {
          calibrationCallback()
        }

        expect(consoleSpy).toHaveBeenCalledWith(
          '陀螺仪校准完成:',
          expect.objectContaining({
            roll: expect.any(Number),
            pitch: expect.any(Number),
            yaw: expect.any(Number)
          })
        )
      }

      consoleSpy.mockRestore()
    })
  })

  // ==================== 4. 显示模式和UI交互 ====================
  describe('4. Display Modes and UI Interactions', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该切换显示模式', async () => {
      const vm = wrapper.vm
      
      vm.handleModeChange('attitude')
      expect(vm.displayMode).toBe('attitude')
      
      vm.handleModeChange('rates')
      expect(vm.displayMode).toBe('rates')
      
      vm.handleModeChange('combined')
      expect(vm.displayMode).toBe('combined')
    })

    it('应该切换暂停状态', async () => {
      const vm = wrapper.vm
      const initialPaused = vm.isPaused
      
      vm.togglePause()
      expect(vm.isPaused).toBe(!initialPaused)
    })

    it('应该重置陀螺仪数据', async () => {
      const vm = wrapper.vm
      
      // 设置一些数据
      vm.gyroscopeData = { roll: 10, pitch: 20, yaw: 30 }
      vm.attitudes = { roll: 45, pitch: 30, yaw: 90 }
      
      vm.resetGyroscope()
      
      expect(vm.gyroscopeData).toEqual({ roll: 0, pitch: 0, yaw: 0 })
      expect(vm.attitudes).toEqual({ roll: 0, pitch: 0, yaw: 0 })
      expect(vm.lastUpdateTime).toBeGreaterThan(0)
    })

    it('应该在attitude模式下显示姿态视图', async () => {
      wrapper = createComponent()
      await nextTick()
      
      const vm = wrapper.vm
      vm.displayMode = 'attitude'
      await nextTick()

      expect(wrapper.find('.gyroscope-attitude').exists()).toBe(true)
      expect(wrapper.find('.attitude-svg').exists()).toBe(true)
    })

    it('应该在rates模式下显示角速度视图', async () => {
      wrapper = createComponent()
      await nextTick()
      
      const vm = wrapper.vm
      vm.displayMode = 'rates'
      await nextTick()

      expect(wrapper.find('.gyroscope-rates').exists()).toBe(true)
      expect(wrapper.find('.rate-indicators').exists()).toBe(true)
    })

    it('应该在combined模式下显示两种视图', async () => {
      wrapper = createComponent()
      await nextTick()
      
      const vm = wrapper.vm
      vm.displayMode = 'combined'
      await nextTick()

      expect(wrapper.find('.gyroscope-attitude').exists()).toBe(true)
      expect(wrapper.find('.gyroscope-rates').exists()).toBe(true)
    })

    it('应该在加载时显示加载指示器', async () => {
      wrapper = createComponent()
      const vm = wrapper.vm
      vm.isLoading = true
      await nextTick()

      expect(wrapper.find('.gyroscope-loading').exists()).toBe(true)
      expect(wrapper.find('.loading-icon').exists()).toBe(true)
    })

    it('应该在校准时显示校准覆盖层', async () => {
      wrapper = createComponent()
      const vm = wrapper.vm
      vm.isCalibrating = true
      vm.calibrationProgress = 50
      await nextTick()

      expect(wrapper.find('.calibration-overlay').exists()).toBe(true)
      expect(wrapper.find('.calibration-message').exists()).toBe(true)
      
      const progressBar = wrapper.findComponent({ name: 'ElProgress' })
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.props('percentage')).toBe(50)
    })
  })

  // ==================== 5. SVG渲染和人工地平线 ====================
  describe('5. SVG Rendering and Artificial Horizon', () => {
    beforeEach(async () => {
      wrapper = createComponent({ size: 200 })
      await nextTick()
    })

    it('应该计算正确的姿态显示尺寸', () => {
      const vm = wrapper.vm

      expect(vm.attitudeSize).toBe(200)
      expect(vm.attitudeCenter).toBe(100)
      expect(vm.attitudeRadius).toBe(70) // size/2 - 30
    })

    it('应该限制最小姿态尺寸', async () => {
      wrapper = createComponent({ size: 300 })
      await nextTick()
      
      const vm = wrapper.vm
      expect(vm.attitudeSize).toBe(200) // 应该被限制在200
    })

    it('应该生成俯仰角刻度线', () => {
      const vm = wrapper.vm
      const marks = vm.pitchMarks

      expect(marks).toHaveLength(13) // -60 to 60, step 10
      
      const mark20 = marks.find(m => m.angle === 20)
      expect(mark20).toBeDefined()
      expect(mark20?.major).toBe(true)
      expect(mark20?.length).toBe(20)
      expect(mark20?.offset).toBe(40) // angle * 2

      const mark10 = marks.find(m => m.angle === 10)
      expect(mark10).toBeDefined()
      expect(mark10?.major).toBe(false)
      expect(mark10?.length).toBe(10)
    })

    it('应该正确渲染SVG姿态指示器', async () => {
      const vm = wrapper.vm
      vm.displayMode = 'attitude'
      vm.attitudes = { roll: 30, pitch: 15, yaw: 45 }
      await nextTick()

      const svg = wrapper.find('.attitude-svg')
      expect(svg.exists()).toBe(true)
      expect(svg.attributes('width')).toBe('200')
      expect(svg.attributes('height')).toBe('200')
      expect(svg.attributes('viewBox')).toBe('0 0 200 200')
    })

    it('应该正确应用横滚角旋转', async () => {
      const vm = wrapper.vm
      vm.displayMode = 'attitude'
      vm.attitudes = { roll: 45, pitch: 0, yaw: 0 }
      await nextTick()

      // 检查地平线组的transform属性
      const horizonGroup = wrapper.find('g[transform*="rotate"]')
      if (horizonGroup.exists()) {
        expect(horizonGroup.attributes('transform')).toContain('rotate(-45)')
      }
    })

    it('应该显示偏航角指示器', async () => {
      const vm = wrapper.vm
      vm.displayMode = 'attitude'
      vm.attitudes = { roll: 0, pitch: 0, yaw: 120 }
      await nextTick()

      const yawText = wrapper.find('.yaw-text')
      expect(yawText.exists()).toBe(true)
      expect(yawText.text()).toBe('120°')
    })

    it('应该渲染飞机标记', async () => {
      const vm = wrapper.vm
      vm.displayMode = 'attitude'
      await nextTick()

      expect(wrapper.find('.aircraft-wing').exists()).toBe(true)
      expect(wrapper.find('.aircraft-body').exists()).toBe(true)
      expect(wrapper.find('.aircraft-center').exists()).toBe(true)
    })
  })

  // ==================== 6. 角速度进度指示器 ====================
  describe('6. Angular Rate Progress Indicators', () => {
    beforeEach(async () => {
      wrapper = createComponent({ maxAngularRate: 500 })
      await nextTick()
    })

    it('应该计算横滚角速度进度偏移', () => {
      const vm = wrapper.vm
      vm.gyroscopeData.roll = 250 // 50% of maxAngularRate

      const circumference = 2 * Math.PI * 35
      const expectedOffset = circumference * 0.5 // 1 - 0.5

      expect(vm.rollProgressOffset).toBe(expectedOffset)
    })

    it('应该计算俯仰角速度进度偏移', () => {
      const vm = wrapper.vm
      vm.gyroscopeData.pitch = 100 // 20% of maxAngularRate

      const circumference = 2 * Math.PI * 35
      const expectedOffset = circumference * 0.8 // 1 - 0.2

      expect(vm.pitchProgressOffset).toBe(expectedOffset)
    })

    it('应该计算偏航角速度进度偏移', () => {
      const vm = wrapper.vm
      vm.gyroscopeData.yaw = 500 // 100% of maxAngularRate

      const circumference = 2 * Math.PI * 35
      const expectedOffset = 0 // 1 - 1

      expect(vm.yawProgressOffset).toBe(expectedOffset)
    })

    it('应该限制进度不超过100%', () => {
      const vm = wrapper.vm
      vm.gyroscopeData.roll = 1000 // 200% of maxAngularRate

      expect(vm.rollProgressOffset).toBe(0) // 应该被限制在0（100%）
    })

    it('应该处理负值角速度', () => {
      const vm = wrapper.vm
      vm.gyroscopeData.roll = -250 // -50% of maxAngularRate

      const circumference = 2 * Math.PI * 35
      const expectedOffset = circumference * 0.5 // Math.abs(-250) / 500 = 0.5

      expect(vm.rollProgressOffset).toBe(expectedOffset)
    })

    it('应该显示角速度数值', async () => {
      wrapper = createComponent()
      const vm = wrapper.vm
      vm.displayMode = 'rates'
      vm.gyroscopeData = { roll: 123.456, pitch: 78.901, yaw: 234.567 }
      await nextTick()

      const rateValues = wrapper.findAll('.rate-value')
      expect(rateValues[0]?.text()).toBe('123.5') // roll, 保留1位小数
      expect(rateValues[1]?.text()).toBe('78.9')  // pitch
      expect(rateValues[2]?.text()).toBe('234.6') // yaw
    })
  })

  // ==================== 7. 性能监控和帧率统计 ====================
  describe('7. Performance Monitoring and Frame Rate Statistics', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该记录帧数据', () => {
      const vm = wrapper.vm
      const initialFrameCount = vm.frameCount

      vm.recordFrame()

      expect(vm.frameCount).toBe(initialFrameCount + 1)
      expect(vm.lastFrameTime).toBeGreaterThan(0)
      expect(mockPerformanceStore.recordFrame).toHaveBeenCalled()
    })

    it('应该计算更新率', () => {
      const vm = wrapper.vm
      const mockNow = Date.now()
      
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(mockNow - 100) // lastFrameTime
        .mockReturnValueOnce(mockNow) // current time

      vm.lastFrameTime = mockNow - 100

      expect(vm.updateRate).toBe(10) // 1000ms / 100ms = 10Hz
    })

    it('应该处理零时间差的情况', () => {
      const vm = wrapper.vm
      const mockNow = Date.now()
      
      vi.spyOn(Date, 'now').mockReturnValue(mockNow)
      vm.lastFrameTime = mockNow

      expect(vm.updateRate).toBe(0)
    })

    it('应该在没有帧时间时返回0', () => {
      const vm = wrapper.vm
      vm.lastFrameTime = 0

      expect(vm.updateRate).toBe(0)
    })

    it('应该在数据更新时记录帧', () => {
      const vm = wrapper.vm
      const recordFrameSpy = vi.spyOn(vm, 'recordFrame')

      vm.updateAngularRates(10, 20, 30)

      expect(recordFrameSpy).toHaveBeenCalled()
    })
  })

  // ==================== 8. Widget事件处理 ====================
  describe('8. Widget Event Handling', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该处理刷新事件', async () => {
      const vm = wrapper.vm
      const initSpy = vi.spyOn(vm, 'initializeGyroscope')

      vm.handleRefresh()

      expect(initSpy).toHaveBeenCalled()
    })

    it('应该处理设置事件', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation()
      const vm = wrapper.vm

      vm.handleSettings()

      expect(consoleSpy).toHaveBeenCalledWith('打开陀螺仪设置对话框')
      consoleSpy.mockRestore()
    })

    it('应该处理导出事件', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation()
      const vm = wrapper.vm

      vm.handleExport()

      expect(consoleSpy).toHaveBeenCalledWith('导出陀螺仪数据')
      consoleSpy.mockRestore()
    })

    it('应该处理尺寸调整事件', async () => {
      const vm = wrapper.vm

      expect(() => {
        vm.handleResize({ width: 300, height: 250 })
      }).not.toThrow()
    })

    it('应该处理设置变更事件', async () => {
      const vm = wrapper.vm
      const initSpy = vi.spyOn(vm, 'initializeGyroscope')
      const newConfig = { title: '新陀螺仪', maxRate: 1000 }

      vm.handleSettingsChanged(newConfig)

      expect(initSpy).toHaveBeenCalled()
    })
  })

  // ==================== 9. 计算属性测试 ====================
  describe('9. Computed Properties', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该计算组件标题', async () => {
      // 默认标题
      let wrapper1 = createComponent()
      await nextTick()
      expect(wrapper1.vm.widgetTitle).toBe('陀螺仪')

      // 配置标题
      wrapper1.unmount()
      let wrapper2 = createComponent({ config: { title: '自定义陀螺仪' } })
      await nextTick()
      expect(wrapper2.vm.widgetTitle).toBe('自定义陀螺仪')

      // 数据集标题
      wrapper2.unmount()
      let wrapper3 = createComponent({ datasets: [{ title: '数据集陀螺仪', value: 0 }] })
      await nextTick()
      expect(wrapper3.vm.widgetTitle).toBe('数据集陀螺仪')

      wrapper3.unmount()
    })

    it('应该检测数据可用性', () => {
      const vm = wrapper.vm

      // 无数据
      vm.gyroscopeData = { roll: undefined, pitch: undefined, yaw: undefined }
      expect(vm.hasData).toBe(false)

      // 有部分数据
      vm.gyroscopeData = { roll: 10, pitch: undefined, yaw: undefined }
      expect(vm.hasData).toBe(true)

      // 有完整数据
      vm.gyroscopeData = { roll: 10, pitch: 20, yaw: 30 }
      expect(vm.hasData).toBe(true)
    })
  })

  // ==================== 10. 数据信息面板 ====================
  describe('10. Data Information Panel', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该显示角速度信息', async () => {
      const vm = wrapper.vm
      vm.gyroscopeData = { roll: 12.345, pitch: 23.456, yaw: 34.567 }
      await nextTick()

      const rollValue = wrapper.find('.roll-value')
      const pitchValue = wrapper.find('.pitch-value')
      const yawValue = wrapper.find('.yaw-value')

      expect(rollValue.text()).toBe('12.35')
      expect(pitchValue.text()).toBe('23.46')
      expect(yawValue.text()).toBe('34.57')
    })

    it('应该显示积分角度信息', async () => {
      const vm = wrapper.vm
      vm.attitudes = { roll: 45.6, pitch: 30.3, yaw: 120.9 }
      await nextTick()

      const infoItems = wrapper.findAll('.info-value')
      // 找到积分角度部分的值
      expect(infoItems.some(item => item.text() === '45.6')).toBe(true)
      expect(infoItems.some(item => item.text() === '30.3')).toBe(true)
      expect(infoItems.some(item => item.text() === '120.9')).toBe(true)
    })

    it('应该在脚注显示RPY和更新率', async () => {
      const vm = wrapper.vm
      vm.attitudes = { roll: 10, pitch: 20, yaw: 30 }
      vm.lastFrameTime = Date.now() - 50 // 50ms前
      await nextTick()

      const stats = wrapper.find('.gyroscope-stats')
      const update = wrapper.find('.gyroscope-update')

      expect(stats.text()).toBe('RPY: 10.0° 20.0° 30.0°')
      expect(update.text()).toContain('Hz')
    })

    it('应该处理未定义的数据值', async () => {
      const vm = wrapper.vm
      vm.gyroscopeData = { roll: undefined, pitch: undefined, yaw: undefined }
      await nextTick()

      const rateValues = wrapper.findAll('.rate-value')
      rateValues.forEach(value => {
        expect(value.text()).toBe('0.0') // 默认值
      })
    })
  })

  // ==================== 11. 工具栏按钮交互 ====================
  describe('11. Toolbar Button Interactions', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该渲染所有工具栏按钮', () => {
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(4) // 暂停、重置、模式、校准
    })

    it('应该处理暂停/恢复按钮点击', async () => {
      const vm = wrapper.vm
      const pauseButton = wrapper.findAll('button')[0] // 第一个按钮是暂停按钮
      const initialPaused = vm.isPaused

      await pauseButton.trigger('click')

      expect(vm.isPaused).toBe(!initialPaused)
    })

    it('应该处理重置按钮点击', async () => {
      const vm = wrapper.vm
      vm.gyroscopeData = { roll: 10, pitch: 20, yaw: 30 }
      
      const resetButton = wrapper.findAll('button')[1] // 第二个按钮是重置按钮
      await resetButton.trigger('click')

      expect(vm.gyroscopeData).toEqual({ roll: 0, pitch: 0, yaw: 0 })
    })

    it('应该处理校准按钮点击', async () => {
      const vm = wrapper.vm
      const calibrateButton = wrapper.findAll('button')[3] // 第四个按钮是校准按钮
      const initialCalibrating = vm.isCalibrating

      await calibrateButton.trigger('click')

      expect(vm.isCalibrating).toBe(!initialCalibrating)
    })

    it('应该显示校准按钮活动状态', async () => {
      const vm = wrapper.vm
      vm.isCalibrating = true
      await nextTick()

      const calibrateButton = wrapper.findAll('button')[3]
      expect(calibrateButton.classes()).toContain('is-active')
    })
  })

  // ==================== 12. 错误处理和边界情况 ====================
  describe('12. Error Handling and Edge Cases', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该处理NaN值', async () => {
      const vm = wrapper.vm

      expect(() => {
        vm.updateAngularRates(NaN, NaN, NaN)
      }).not.toThrow()

      // 应该保持数据稳定
      expect(isNaN(vm.gyroscopeData.roll)).toBe(true)
    })

    it('应该处理极大的角速度值', async () => {
      const vm = wrapper.vm

      vm.updateAngularRates(1000000, -1000000, 500000)

      expect(vm.gyroscopeData.roll).toBe(1000000)
      expect(vm.gyroscopeData.pitch).toBe(-1000000)
      expect(vm.gyroscopeData.yaw).toBe(500000)
    })

    it('应该处理零时间间隔的积分', async () => {
      const vm = wrapper.vm
      const now = Date.now()
      vm.lastUpdateTime = now

      vi.spyOn(Date, 'now').mockReturnValue(now) // 相同时间

      const initialAttitudes = { ...vm.attitudes }
      vm.updateAngularRates(100, 200, 300)

      expect(vm.attitudes).toEqual(initialAttitudes) // 不应该改变
    })

    it('应该处理禁用积分的情况', async () => {
      wrapper = createComponent({ enableIntegration: false })
      await nextTick()

      const vm = wrapper.vm
      const initialAttitudes = { ...vm.attitudes }
      vm.updateAngularRates(100, 200, 300)

      expect(vm.attitudes).toEqual(initialAttitudes) // 不应该积分
    })

    it('应该处理组件销毁时的清理', async () => {
      const vm = wrapper.vm
      vm.isCalibrating = true

      // 模拟组件销毁
      wrapper.unmount()

      expect(vm.isCalibrating).toBe(false)
    })

    it('应该处理数据集变化', async () => {
      const vm = wrapper.vm
      const initSpy = vi.spyOn(vm, 'initializeGyroscope')
      
      // 触发数据集变化监听器
      await wrapper.setProps({ 
        datasets: [{ title: '新陀螺仪', value: 0 }] 
      })

      expect(initSpy).toHaveBeenCalled()
    })
  })

  // ==================== 13. 组件暴露的方法 ====================
  describe('13. Component Exposed Methods', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该暴露updateAngularRates方法', () => {
      const vm = wrapper.vm
      expect(typeof vm.updateAngularRates).toBe('function')

      vm.updateAngularRates(10, 20, 30)
      expect(vm.gyroscopeData.roll).toBe(10)
    })

    it('应该暴露resetGyroscope方法', () => {
      const vm = wrapper.vm
      expect(typeof vm.resetGyroscope).toBe('function')

      vm.gyroscopeData = { roll: 10, pitch: 20, yaw: 30 }
      vm.resetGyroscope()
      expect(vm.gyroscopeData).toEqual({ roll: 0, pitch: 0, yaw: 0 })
    })

    it('应该暴露togglePause方法', () => {
      const vm = wrapper.vm
      expect(typeof vm.togglePause).toBe('function')

      const initialPaused = vm.isPaused
      vm.togglePause()
      expect(vm.isPaused).toBe(!initialPaused)
    })

    it('应该暴露startCalibration方法', () => {
      const vm = wrapper.vm
      expect(typeof vm.startCalibration).toBe('function')

      vm.startCalibration()
      expect(vm.isCalibrating).toBe(true)
    })

    it('应该暴露getAngularRates方法', () => {
      const vm = wrapper.vm
      expect(typeof vm.getAngularRates).toBe('function')

      vm.gyroscopeData = { roll: 10, pitch: 20, yaw: 30 }
      expect(vm.getAngularRates()).toEqual({ roll: 10, pitch: 20, yaw: 30 })
    })

    it('应该暴露getAttitudes方法', () => {
      const vm = wrapper.vm
      expect(typeof vm.getAttitudes).toBe('function')

      vm.attitudes = { roll: 45, pitch: 30, yaw: 90 }
      expect(vm.getAttitudes()).toEqual({ roll: 45, pitch: 30, yaw: 90 })
    })
  })
})