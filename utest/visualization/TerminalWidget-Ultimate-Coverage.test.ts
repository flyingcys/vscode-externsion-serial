/**
 * TerminalWidget Ultimate Coverage Test Suite
 * 
 * 基于Serial-Studio Terminal Widget的完整测试覆盖
 * 测试终端显示、命令处理、内容格式化、交互控制、性能监控
 * 
 * 目标：95%+ 代码覆盖率
 * 范围：Vue组件、终端逻辑、命令系统、格式化引擎
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import TerminalWidget from '@/webview/components/widgets/TerminalWidget.vue'
import { createPinia, setActivePinia } from 'pinia'
import { WidgetType } from '@/shared/types'

// === Mock Element Plus 组件 ===
const mockElementPlusComponents = {
  ElButton: {
    name: 'ElButton',
    template: '<button @click="$emit(\'click\')" :type="type" :size="size" :disabled="disabled" :class="$attrs.class" :icon="icon" :title="title"><slot /></button>',
    props: ['type', 'size', 'disabled', 'icon', 'title'],
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
    template: '<div class="el-dropdown" @click="$emit(\'command\', \'word\')"><slot /><slot name="dropdown" /></div>',
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
  ElInput: {
    name: 'ElInput',
    template: `
      <input 
        class="el-input" 
        :value="modelValue" 
        @input="$emit('update:modelValue', $event.target.value)"
        @keyup.enter="$emit('keyup.enter')"
        @keyup.up="$emit('keyup.up')"
        @keyup.down="$emit('keyup.down')"
        :placeholder="placeholder"
      />`,
    props: ['modelValue', 'placeholder'],
    emits: ['update:modelValue', 'keyup.enter', 'keyup.up', 'keyup.down']
  }
}

// Mock Element Plus Icons
const mockIcons = {
  VideoPlay: { name: 'VideoPlay', template: '<svg><path d="video-play-icon"/></svg>' },
  VideoPause: { name: 'VideoPause', template: '<svg><path d="video-pause-icon"/></svg>' },
  Loading: { name: 'Loading', template: '<svg><path d="loading-icon"/></svg>' },
  Document: { name: 'Document', template: '<svg><path d="document-icon"/></svg>' },
  Rank: { name: 'Rank', template: '<svg><path d="rank-icon"/></svg>' },
  Bottom: { name: 'Bottom', template: '<svg><path d="bottom-icon"/></svg>' }
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

// Mock setInterval and clearInterval
global.setInterval = vi.fn().mockImplementation((callback, delay) => {
  const id = setTimeout(callback, delay)
  return id
})

global.clearInterval = vi.fn().mockImplementation((id) => {
  clearTimeout(id)
})

// Mock scrollTop and scrollHeight
Object.defineProperty(HTMLDivElement.prototype, 'scrollTop', {
  get: vi.fn(() => 0),
  set: vi.fn(),
  configurable: true
})

Object.defineProperty(HTMLDivElement.prototype, 'scrollHeight', {
  get: vi.fn(() => 1000),
  configurable: true
})

describe('TerminalWidget Ultimate Coverage Tests', () => {
  let wrapper: VueWrapper<any>
  let pinia: any

  const createComponent = (props: any = {}) => {
    return mount(TerminalWidget, {
      props: {
        datasets: [],
        config: {},
        realtime: false, // 禁用实时更新以避免测试中的定时器问题
        updateInterval: 100,
        maxLines: 1000,
        enableInput: false,
        showCursor: false,
        autoScroll: true,
        fontSize: 14,
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
    it('应该正确初始化TerminalWidget组件', async () => {
      wrapper = createComponent()
      await nextTick()

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'BaseWidget' }).exists()).toBe(true)
      expect(wrapper.find('.terminal-container').exists()).toBe(true)
    })

    it('应该正确设置默认props', () => {
      wrapper = createComponent()
      const vm = wrapper.vm

      expect(vm.realtime).toBe(false)
      expect(vm.updateInterval).toBe(100)
      expect(vm.maxLines).toBe(1000)
      expect(vm.enableInput).toBe(false)
      expect(vm.showCursor).toBe(false)
      expect(vm.autoScroll).toBe(true)
      expect(vm.fontSize).toBe(14)
    })

    it('应该在挂载时初始化终端', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation()
      wrapper = createComponent()
      await nextTick()

      const vm = wrapper.vm
      expect(vm.isLoading).toBe(false)
      expect(vm.terminalLines.length).toBeGreaterThan(0) // 应该有初始化消息
      expect(consoleSpy).toHaveBeenCalledWith('终端初始化完成')

      consoleSpy.mockRestore()
    })

    it('应该处理初始化错误', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation()
      
      // Mock nextTick to throw error
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

    it('应该监听datasets变化并重新初始化', async () => {
      wrapper = createComponent()
      await nextTick()

      const vm = wrapper.vm
      const initialLinesCount = vm.terminalLines.length

      // 更改datasets触发重新初始化
      await wrapper.setProps({
        datasets: [{ id: '1', title: '新数据', value: 'test' }]
      })

      expect(vm.terminalLines.length).toBeGreaterThanOrEqual(initialLinesCount)
    })
  })

  // ==================== 2. 终端行管理和数据处理 ====================
  describe('2. Terminal Line Management and Data Processing', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该添加终端行', () => {
      const vm = wrapper.vm
      const initialCount = vm.terminalLines.length

      vm.addLine('测试消息', 'info')

      expect(vm.terminalLines.length).toBe(initialCount + 1)
      const lastLine = vm.terminalLines[vm.terminalLines.length - 1]
      expect(lastLine.content).toBe('测试消息')
      expect(lastLine.level).toBe('info')
      expect(lastLine.timestamp).toBeGreaterThan(0)
      expect(lastLine.id).toMatch(/^line_\d+_[a-z0-9]+$/)
    })

    it('应该支持不同级别的消息', () => {
      const vm = wrapper.vm
      const levels = ['info', 'warning', 'error', 'success', 'debug'] as const

      levels.forEach(level => {
        vm.addLine(`${level} 消息`, level)
      })

      const recentLines = vm.terminalLines.slice(-levels.length)
      levels.forEach((level, index) => {
        expect(recentLines[index].level).toBe(level)
        expect(recentLines[index].content).toBe(`${level} 消息`)
      })
    })

    it('应该支持高亮行', () => {
      const vm = wrapper.vm

      vm.addLine('高亮消息', 'info', true)

      const lastLine = vm.terminalLines[vm.terminalLines.length - 1]
      expect(lastLine.highlight).toBe(true)
    })

    it('应该限制最大行数', () => {
      wrapper = createComponent({ maxLines: 5 })
      const vm = wrapper.vm
      
      // 清空初始行
      vm.terminalLines = []
      
      // 添加超过最大行数的内容
      for (let i = 0; i < 10; i++) {
        vm.addLine(`消息 ${i}`, 'info')
      }

      expect(vm.terminalLines.length).toBe(5)
      // 应该保留最新的5行
      expect(vm.terminalLines[0].content).toBe('消息 5')
      expect(vm.terminalLines[4].content).toBe('消息 9')
    })

    it('应该在暂停时不添加行', () => {
      const vm = wrapper.vm
      vm.isPaused = true
      
      const initialCount = vm.terminalLines.length
      vm.addLine('暂停时的消息', 'info')

      expect(vm.terminalLines.length).toBe(initialCount)
    })

    it('应该更新终端数据和自动滚动', () => {
      const vm = wrapper.vm
      const scrollToBottomSpy = vi.spyOn(vm, 'scrollToBottom')
      
      vm.addLine('新消息', 'info')

      expect(vm.terminalData.lines).toEqual(vm.terminalLines)
      expect(scrollToBottomSpy).toHaveBeenCalled()
    })

    it('应该生成唯一的行ID', () => {
      const vm = wrapper.vm
      const ids = new Set()
      
      for (let i = 0; i < 100; i++) {
        const id = vm.generateLineId()
        expect(ids.has(id)).toBe(false) // 确保ID唯一
        ids.add(id)
        expect(id).toMatch(/^line_\d+_[a-z0-9]+$/)
      }
    })
  })

  // ==================== 3. 内容格式化和高亮 ====================
  describe('3. Content Formatting and Highlighting', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该转义HTML字符', () => {
      const vm = wrapper.vm
      const content = '<script>alert("test")</script> & "quotes"'
      
      const formatted = vm.formatLineContent(content)
      
      expect(formatted).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt; &amp; &quot;quotes&quot;')
    })

    it('应该高亮关键词', () => {
      const vm = wrapper.vm
      
      const testCases = [
        { input: 'ERROR occurred', expected: '<span class="keyword error">ERROR</span> occurred' },
        { input: 'Warning message', expected: '<span class="keyword warning">Warning</span> message' },
        { input: 'SUCCESS completed', expected: '<span class="keyword success">SUCCESS</span> completed' },
        { input: 'INFO data', expected: '<span class="keyword info">INFO</span> data' }
      ]

      testCases.forEach(({ input, expected }) => {
        const formatted = vm.formatLineContent(input)
        expect(formatted).toContain(expected)
      })
    })

    it('应该高亮数字', () => {
      const vm = wrapper.vm
      
      const testCases = [
        'Temperature: 25.5 degrees',
        'Count: 100',
        'Value: -123.456'
      ]

      testCases.forEach(input => {
        const formatted = vm.formatLineContent(input)
        expect(formatted).toContain('<span class="number">')
      })
    })

    it('应该高亮IP地址', () => {
      const vm = wrapper.vm
      const content = 'Connected to 192.168.1.1 and 10.0.0.1'
      
      const formatted = vm.formatLineContent(content)
      
      expect(formatted).toContain('<span class="ip">192.168.1.1</span>')
      expect(formatted).toContain('<span class="ip">10.0.0.1</span>')
    })

    it('应该正确组合多种高亮', () => {
      const vm = wrapper.vm
      const content = 'ERROR: Connection to 192.168.1.1:8080 failed after 5.5 seconds'
      
      const formatted = vm.formatLineContent(content)
      
      expect(formatted).toContain('<span class="keyword error">ERROR</span>')
      expect(formatted).toContain('<span class="ip">192.168.1.1</span>')
      expect(formatted).toContain('<span class="number">8080</span>')
      expect(formatted).toContain('<span class="number">5.5</span>')
    })

    it('应该返回正确的级别徽章', () => {
      const vm = wrapper.vm
      
      const badges = {
        error: '❌',
        warning: '⚠️',
        success: '✅',
        debug: '🐛',
        info: 'ℹ️'
      }

      Object.entries(badges).forEach(([level, expected]) => {
        expect(vm.getLevelBadge(level)).toBe(expected)
      })

      expect(vm.getLevelBadge('unknown')).toBe('')
    })

    it('应该格式化时间戳', () => {
      const vm = wrapper.vm
      const timestamp = new Date('2024-01-01T12:34:56.789Z').getTime()
      
      const formatted = vm.formatTimestamp(timestamp)
      
      expect(formatted).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/)
    })
  })

  // ==================== 4. 命令系统和历史记录 ====================
  describe('4. Command System and History', () => {
    beforeEach(async () => {
      wrapper = createComponent({ enableInput: true })
      await nextTick()
    })

    it('应该处理内置clear命令', () => {
      const vm = wrapper.vm
      const initialCount = vm.terminalLines.length
      
      vm.processCommand('clear')
      
      expect(vm.terminalLines.length).toBeLessThan(initialCount)
      expect(vm.terminalLines[vm.terminalLines.length - 1].content).toBe('终端已清空')
    })

    it('应该处理内置help命令', () => {
      const vm = wrapper.vm
      const initialCount = vm.terminalLines.length
      
      vm.processCommand('help')
      
      expect(vm.terminalLines.length).toBeGreaterThan(initialCount)
      expect(vm.terminalLines.some(line => line.content.includes('可用命令'))).toBe(true)
    })

    it('应该处理内置status命令', () => {
      const vm = wrapper.vm
      const initialCount = vm.terminalLines.length
      
      vm.processCommand('status')
      
      expect(vm.terminalLines.length).toBeGreaterThan(initialCount)
      expect(vm.terminalLines.some(line => line.content.includes('终端状态'))).toBe(true)
    })

    it('应该处理内置test命令', () => {
      const vm = wrapper.vm
      const initialCount = vm.terminalLines.length
      
      vm.processCommand('test')
      
      expect(vm.terminalLines.length).toBeGreaterThan(initialCount)
      expect(vm.terminalLines.some(line => line.content.includes('开始测试'))).toBe(true)
      
      // 测试异步消息
      vi.advanceTimersByTime(2000)
      expect(vm.terminalLines.some(line => line.content.includes('测试成功'))).toBe(true)
      expect(vm.terminalLines.some(line => line.content.includes('测试警告'))).toBe(true)
      expect(vm.terminalLines.some(line => line.content.includes('测试错误'))).toBe(true)
    })

    it('应该处理未知命令', () => {
      const vm = wrapper.vm
      
      vm.processCommand('unknown_command')
      
      const lastLines = vm.terminalLines.slice(-2)
      expect(lastLines[0].content).toBe('未知命令: unknown_command')
      expect(lastLines[1].content).toBe('输入 "help" 查看可用命令')
    })

    it('应该执行命令并添加到历史', () => {
      const vm = wrapper.vm
      vm.currentCommand = 'test command'
      
      vm.executeCommandWithEvent()
      
      expect(vm.commandHistory[0]).toBe('test command')
      expect(vm.currentCommand).toBe('')
      expect(vm.historyIndex).toBe(-1)
      expect(wrapper.emitted('command-sent')).toEqual([['test command']])
    })

    it('应该限制命令历史数量', () => {
      const vm = wrapper.vm
      
      // 添加超过50个命令
      for (let i = 0; i < 55; i++) {
        vm.currentCommand = `command ${i}`
        vm.executeCommandWithEvent()
      }
      
      expect(vm.commandHistory.length).toBe(50)
      expect(vm.commandHistory[0]).toBe('command 54') // 最新命令
    })

    it('应该正确导航命令历史', () => {
      const vm = wrapper.vm
      vm.commandHistory = ['cmd1', 'cmd2', 'cmd3']
      vm.historyIndex = -1
      
      // 向上导航
      vm.navigateHistory(-1)
      expect(vm.historyIndex).toBe(0)
      expect(vm.currentCommand).toBe('cmd1')
      
      vm.navigateHistory(-1)
      expect(vm.historyIndex).toBe(1)
      expect(vm.currentCommand).toBe('cmd2')
      
      // 到达末尾时循环
      vm.historyIndex = 2
      vm.navigateHistory(-1)
      expect(vm.historyIndex).toBe(2) // 应该保持在最后一个
      
      // 向下导航
      vm.navigateHistory(1)
      expect(vm.historyIndex).toBe(-1)
      expect(vm.currentCommand).toBe('')
    })

    it('应该处理空命令历史的导航', () => {
      const vm = wrapper.vm
      vm.commandHistory = []
      
      expect(() => {
        vm.navigateHistory(-1)
        vm.navigateHistory(1)
      }).not.toThrow()
      
      expect(vm.currentCommand).toBe('')
    })

    it('应该通过暴露的方法执行命令', () => {
      const vm = wrapper.vm
      
      vm.executeCommand('status')
      
      expect(vm.terminalLines.some(line => line.content.includes('> status'))).toBe(true)
      expect(vm.terminalLines.some(line => line.content.includes('终端状态'))).toBe(true)
    })
  })

  // ==================== 5. 工具栏交互和显示控制 ====================
  describe('5. Toolbar Interactions and Display Controls', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该切换暂停状态', () => {
      const vm = wrapper.vm
      const initialPaused = vm.isPaused
      
      vm.togglePause()
      
      expect(vm.isPaused).toBe(!initialPaused)
      const lastLine = vm.terminalLines[vm.terminalLines.length - 1]
      expect(lastLine.content).toContain(initialPaused ? '已恢复' : '已暂停')
    })

    it('应该清空终端', () => {
      const vm = wrapper.vm
      
      // 添加一些内容
      vm.addLine('测试内容1', 'info')
      vm.addLine('测试内容2', 'info')
      
      vm.clearTerminal()
      
      expect(vm.terminalLines).toHaveLength(1) // 只有清空消息
      expect(vm.terminalLines[0].content).toBe('终端已清空')
      expect(vm.terminalData.lines).toEqual([])
    })

    it('应该切换自动滚动', () => {
      const vm = wrapper.vm
      const initialAutoScroll = vm.autoScroll
      
      vm.toggleAutoScroll()
      
      expect(vm.autoScroll).toBe(!initialAutoScroll)
      const lastLine = vm.terminalLines[vm.terminalLines.length - 1]
      expect(lastLine.content).toContain(initialAutoScroll ? '已关闭' : '已开启')
    })

    it('应该切换时间戳显示', () => {
      const vm = wrapper.vm
      const initialShowTimestamp = vm.showTimestamp
      
      vm.toggleTimestamp()
      
      expect(vm.showTimestamp).toBe(!initialShowTimestamp)
    })

    it('应该处理换行模式变化', () => {
      const vm = wrapper.vm
      
      vm.handleWrapModeChange('char')
      
      expect(vm.wrapMode).toBe('char')
      const lastLine = vm.terminalLines[vm.terminalLines.length - 1]
      expect(lastLine.content).toBe('换行模式已设置为: char')
    })

    it('应该处理字体大小变化', () => {
      const vm = wrapper.vm
      
      vm.handleFontSizeChange('18')
      
      expect(vm.fontSize).toBe(18)
      const lastLine = vm.terminalLines[vm.terminalLines.length - 1]
      expect(lastLine.content).toBe('字体大小已设置为: 18px')
    })

    it('应该执行滚动到底部', async () => {
      const vm = wrapper.vm
      vm.terminalDisplay = {
        scrollTop: 0,
        scrollHeight: 1000
      }
      
      vm.scrollToBottom()
      
      await nextTick()
      expect(vm.terminalDisplay.scrollTop).toBe(1000)
    })

    it('应该在没有终端显示元素时安全处理滚动', async () => {
      const vm = wrapper.vm
      vm.terminalDisplay = null
      
      expect(() => {
        vm.scrollToBottom()
      }).not.toThrow()
    })
  })

  // ==================== 6. 计算属性和状态管理 ====================
  describe('6. Computed Properties and State Management', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该计算组件标题', async () => {
      // 默认标题
      let wrapper1 = createComponent()
      await nextTick()
      expect(wrapper1.vm.widgetTitle).toBe('终端')

      // 配置标题
      wrapper1.unmount()
      let wrapper2 = createComponent({ config: { title: '自定义终端' } })
      await nextTick()
      expect(wrapper2.vm.widgetTitle).toBe('自定义终端')

      // 数据集标题
      wrapper2.unmount()
      let wrapper3 = createComponent({ datasets: [{ id: '1', title: '数据集终端', value: 'test' }] })
      await nextTick()
      expect(wrapper3.vm.widgetTitle).toBe('数据集终端')

      wrapper3.unmount()
    })

    it('应该检测数据可用性', async () => {
      // 没有datasets且没有终端行
      let wrapper1 = createComponent({ datasets: [] })
      const vm1 = wrapper1.vm
      vm1.terminalLines = []
      expect(vm1.hasData).toBe(false)

      // 有datasets但没有终端行
      await wrapper1.setProps({ datasets: [{ id: '1', title: '测试', value: 'test' }] })
      vm1.terminalLines = []
      expect(vm1.hasData).toBe(false)

      // 有datasets且有终端行
      vm1.addLine('测试行', 'info')
      expect(vm1.hasData).toBe(true)

      wrapper1.unmount()
    })

    it('应该计算更新率', () => {
      const vm = wrapper.vm
      let mockTime = 1000
      
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(mockTime - 100) // lastFrameTime
        .mockReturnValueOnce(mockTime) // current time

      vm.lastFrameTime = mockTime - 100

      expect(vm.updateRate).toBe(10) // 1000ms / 100ms = 10Hz
    })

    it('应该在零时间差时返回0更新率', () => {
      const vm = wrapper.vm
      const mockNow = Date.now()
      
      vi.spyOn(Date, 'now').mockReturnValue(mockNow)
      vm.lastFrameTime = mockNow

      expect(vm.updateRate).toBe(0)
    })

    it('应该计算总行数和字节数', () => {
      const vm = wrapper.vm
      vm.terminalLines = []
      
      vm.addLine('第一行', 'info')
      vm.addLine('第二行内容更长', 'info')
      
      expect(vm.totalLines).toBe(2)
      expect(vm.totalBytes).toBe('第一行'.length + '第二行内容更长'.length)
    })

    it('应该计算过滤后的行数', () => {
      const vm = wrapper.vm
      vm.terminalLines = []
      
      vm.addLine('行1', 'info')
      vm.addLine('行2', 'error')
      vm.addLine('行3', 'warning')
      
      expect(vm.filteredLines).toBe(3) // 当前没有过滤逻辑，应该等于总行数
    })

    it('应该返回显示行', () => {
      const vm = wrapper.vm
      vm.terminalLines = []
      
      vm.addLine('显示行1', 'info')
      vm.addLine('显示行2', 'error')
      
      const displayLines = vm.displayLines
      expect(displayLines).toHaveLength(2)
      expect(displayLines[0].content).toBe('显示行1')
      expect(displayLines[1].content).toBe('显示行2')
    })
  })

  // ==================== 7. 性能监控和帧记录 ====================
  describe('7. Performance Monitoring and Frame Recording', () => {
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

    it('应该在添加行时记录帧', () => {
      const vm = wrapper.vm
      const recordFrameSpy = vi.spyOn(vm, 'recordFrame')

      vm.addLine('测试行', 'info')

      expect(recordFrameSpy).toHaveBeenCalled()
    })

    it('应该更新最后更新时间', () => {
      const vm = wrapper.vm
      const initialUpdateTime = vm.lastUpdate

      vm.addLine('测试行', 'info')

      expect(vm.lastUpdate).toBeGreaterThan(initialUpdateTime)
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
      const initSpy = vi.spyOn(vm, 'initializeTerminal')

      vm.handleRefresh()

      expect(initSpy).toHaveBeenCalled()
    })

    it('应该处理设置事件', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation()
      const vm = wrapper.vm

      vm.handleSettings()

      expect(consoleSpy).toHaveBeenCalledWith('打开终端设置对话框')
      consoleSpy.mockRestore()
    })

    it('应该处理导出事件', async () => {
      const vm = wrapper.vm
      vm.terminalLines = []
      vm.addLine('导出行1', 'info')
      vm.addLine('导出行2', 'error')
      vm.showTimestamp = true

      vm.handleExport()

      const emittedExport = wrapper.emitted('terminal-exported')
      expect(emittedExport).toBeTruthy()
      
      const exportContent = emittedExport![0][0] as string
      expect(exportContent).toContain('导出行1')
      expect(exportContent).toContain('[ERROR] 导出行2')
      expect(exportContent).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/) // 时间戳格式
    })

    it('应该处理不显示时间戳的导出', async () => {
      const vm = wrapper.vm
      vm.terminalLines = []
      vm.showTimestamp = false
      vm.addLine('导出行1', 'info')

      vm.handleExport()

      const emittedExport = wrapper.emitted('terminal-exported')
      const exportContent = emittedExport![0][0] as string
      expect(exportContent).toBe('导出行1')
    })

    it('应该处理尺寸调整事件', async () => {
      const vm = wrapper.vm

      expect(() => {
        vm.handleResize({ width: 800, height: 600 })
      }).not.toThrow()
    })

    it('应该处理设置变更事件', async () => {
      const vm = wrapper.vm
      const initSpy = vi.spyOn(vm, 'initializeTerminal')
      const newConfig = { title: '新终端', maxLines: 500 }

      vm.handleSettingsChanged(newConfig)

      expect(initSpy).toHaveBeenCalled()
    })

    it('应该发射显示模式变化事件', async () => {
      const vm = wrapper.vm

      vm.handleDisplayModeChange('raw')

      expect(vm.displayMode).toBe('raw')
      expect(wrapper.emitted('display-mode-changed')).toEqual([['raw']])
    })
  })

  // ==================== 9. 输入控制和键盘事件 ====================
  describe('9. Input Controls and Keyboard Events', () => {
    beforeEach(async () => {
      wrapper = createComponent({ enableInput: true })
      await nextTick()
    })

    it('应该显示命令输入区域', () => {
      expect(wrapper.find('.terminal-input').exists()).toBe(true)
      expect(wrapper.find('.input-prompt').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'ElInput' }).exists()).toBe(true)
    })

    it('应该隐藏命令输入区域', async () => {
      wrapper = createComponent({ enableInput: false })
      await nextTick()

      expect(wrapper.find('.terminal-input').exists()).toBe(false)
    })

    it('应该处理命令输入变化', async () => {
      const vm = wrapper.vm
      const input = wrapper.findComponent({ name: 'ElInput' })

      await input.setValue('test command')

      expect(vm.currentCommand).toBe('test command')
    })

    it('应该在回车时执行命令', async () => {
      const vm = wrapper.vm
      const input = wrapper.findComponent({ name: 'ElInput' })
      vm.currentCommand = 'status'

      await input.trigger('keyup.enter')

      expect(vm.terminalLines.some(line => line.content === '> status')).toBe(true)
      expect(vm.currentCommand).toBe('')
    })

    it('应该在上箭头时导航历史', async () => {
      const vm = wrapper.vm
      vm.commandHistory = ['cmd1', 'cmd2']
      const input = wrapper.findComponent({ name: 'ElInput' })

      await input.trigger('keyup.up')

      expect(vm.currentCommand).toBe('cmd1')
    })

    it('应该在下箭头时导航历史', async () => {
      const vm = wrapper.vm
      vm.commandHistory = ['cmd1', 'cmd2']
      vm.historyIndex = 0
      vm.currentCommand = 'cmd1'
      const input = wrapper.findComponent({ name: 'ElInput' })

      await input.trigger('keyup.down')

      expect(vm.currentCommand).toBe('cmd2')
    })

    it('应该在发送按钮点击时执行命令', async () => {
      const vm = wrapper.vm
      vm.currentCommand = 'help'
      const sendButton = wrapper.find('.terminal-input button')

      await sendButton.trigger('click')

      expect(vm.terminalLines.some(line => line.content === '> help')).toBe(true)
    })

    it('应该在空命令时禁用发送按钮', async () => {
      const vm = wrapper.vm
      vm.currentCommand = ''
      await nextTick()

      const sendButton = wrapper.find('.terminal-input button')
      expect(sendButton.attributes('disabled')).toBeDefined()
    })
  })

  // ==================== 10. 显示和样式测试 ====================
  describe('10. Display and Styling', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该应用正确的换行模式样式', async () => {
      const vm = wrapper.vm
      
      vm.wrapMode = 'none'
      await nextTick()
      expect(wrapper.find('.terminal-display').classes()).toContain('wrap-none')

      vm.wrapMode = 'word'
      await nextTick()
      expect(wrapper.find('.terminal-display').classes()).toContain('wrap-word')

      vm.wrapMode = 'char'
      await nextTick()
      expect(wrapper.find('.terminal-display').classes()).toContain('wrap-char')
    })

    it('应该应用字体大小样式', async () => {
      const vm = wrapper.vm
      vm.fontSize = 16
      await nextTick()

      const terminalDisplay = wrapper.find('.terminal-display')
      expect(terminalDisplay.attributes('style')).toContain('font-size: 16px')
    })

    it('应该显示时间戳', async () => {
      const vm = wrapper.vm
      vm.showTimestamp = true
      vm.terminalLines = []
      vm.addLine('带时间戳的消息', 'info')
      await nextTick()

      expect(wrapper.find('.line-timestamp').exists()).toBe(true)
    })

    it('应该隐藏时间戳', async () => {
      const vm = wrapper.vm
      vm.showTimestamp = false
      await nextTick()

      expect(wrapper.find('.line-timestamp').exists()).toBe(false)
    })

    it('应该显示级别徽章', async () => {
      const vm = wrapper.vm
      vm.terminalLines = []
      vm.addLine('错误消息', 'error')
      await nextTick()

      expect(wrapper.find('.level-badge').exists()).toBe(true)
    })

    it('应该应用高亮样式', async () => {
      const vm = wrapper.vm
      vm.terminalLines = []
      vm.addLine('高亮消息', 'info', true)
      await nextTick()

      expect(wrapper.find('.terminal-line.highlight').exists()).toBe(true)
    })

    it('应该显示光标', async () => {
      wrapper = createComponent({ showCursor: true })
      await nextTick()

      expect(wrapper.find('.terminal-cursor').exists()).toBe(true)
    })

    it('应该显示加载指示器', async () => {
      const vm = wrapper.vm
      vm.isLoading = true
      await nextTick()

      expect(wrapper.find('.terminal-loading').exists()).toBe(true)
      expect(wrapper.find('.loading-icon').exists()).toBe(true)
    })

    it('应该显示状态栏信息', async () => {
      const vm = wrapper.vm
      vm.terminalLines = []
      vm.addLine('行1', 'info')
      vm.addLine('行2', 'error')
      await nextTick()

      const statusbar = wrapper.find('.terminal-statusbar')
      expect(statusbar.exists()).toBe(true)
      expect(statusbar.text()).toContain('行数: 2')
    })

    it('应该在脚注显示统计信息', async () => {
      const vm = wrapper.vm
      vm.terminalLines = []
      vm.addLine('测试行', 'info')
      await nextTick()

      const stats = wrapper.find('.terminal-stats')
      const update = wrapper.find('.terminal-update')

      expect(stats.text()).toContain('1 行')
      expect(stats.text()).toContain('字节')
      expect(update.text()).toContain('Hz')
    })
  })

  // ==================== 11. 错误处理和边界情况 ====================
  describe('11. Error Handling and Edge Cases', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该处理空内容的格式化', () => {
      const vm = wrapper.vm

      expect(vm.formatLineContent('')).toBe('')
      expect(vm.formatLineContent(' ')).toBe(' ')
    })

    it('应该处理特殊字符的格式化', () => {
      const vm = wrapper.vm
      const content = '\n\t\r'

      expect(() => {
        vm.formatLineContent(content)
      }).not.toThrow()
    })

    it('应该处理空命令的执行', () => {
      const vm = wrapper.vm
      vm.currentCommand = ''
      const initialLines = vm.terminalLines.length

      vm.executeCommandWithEvent()

      expect(vm.terminalLines.length).toBe(initialLines) // 不应该添加新行
    })

    it('应该处理仅空格的命令', () => {
      const vm = wrapper.vm
      vm.currentCommand = '   '
      const initialLines = vm.terminalLines.length

      vm.executeCommandWithEvent()

      expect(vm.terminalLines.length).toBe(initialLines)
    })

    it('应该处理无效的字体大小', () => {
      const vm = wrapper.vm

      expect(() => {
        vm.handleFontSizeChange('invalid')
      }).not.toThrow()

      expect(isNaN(vm.fontSize)).toBe(true)
    })

    it('应该处理无效的时间戳', () => {
      const vm = wrapper.vm

      expect(() => {
        vm.formatTimestamp(NaN)
      }).not.toThrow()

      expect(() => {
        vm.formatTimestamp(-1)
      }).not.toThrow()
    })

    it('应该处理极大的行数', () => {
      wrapper = createComponent({ maxLines: 10 })
      const vm = wrapper.vm
      vm.terminalLines = []

      // 添加大量行
      for (let i = 0; i < 100; i++) {
        vm.addLine(`行 ${i}`, 'info')
      }

      expect(vm.terminalLines.length).toBe(10)
    })

    it('应该处理未定义的终端显示元素', () => {
      const vm = wrapper.vm
      vm.terminalDisplay = undefined

      expect(() => {
        vm.scrollToBottom()
      }).not.toThrow()
    })
  })

  // ==================== 12. 组件暴露的方法 ====================
  describe('12. Component Exposed Methods', () => {
    beforeEach(async () => {
      wrapper = createComponent()
      await nextTick()
    })

    it('应该暴露addLine方法', () => {
      const vm = wrapper.vm
      expect(typeof vm.addLine).toBe('function')

      const initialLines = vm.terminalLines.length
      vm.addLine('暴露的方法测试', 'info')
      expect(vm.terminalLines.length).toBe(initialLines + 1)
    })

    it('应该暴露clearTerminal方法', () => {
      const vm = wrapper.vm
      expect(typeof vm.clearTerminal).toBe('function')

      vm.addLine('将被清除的行', 'info')
      vm.clearTerminal()
      expect(vm.terminalLines.some(line => line.content === '终端已清空')).toBe(true)
    })

    it('应该暴露togglePause方法', () => {
      const vm = wrapper.vm
      expect(typeof vm.togglePause).toBe('function')

      const initialPaused = vm.isPaused
      vm.togglePause()
      expect(vm.isPaused).toBe(!initialPaused)
    })

    it('应该暴露toggleAutoScroll方法', () => {
      const vm = wrapper.vm
      expect(typeof vm.toggleAutoScroll).toBe('function')

      const initialAutoScroll = vm.autoScroll
      vm.toggleAutoScroll()
      expect(vm.autoScroll).toBe(!initialAutoScroll)
    })

    it('应该暴露scrollToBottom方法', () => {
      const vm = wrapper.vm
      expect(typeof vm.scrollToBottom).toBe('function')

      expect(() => {
        vm.scrollToBottom()
      }).not.toThrow()
    })

    it('应该暴露executeCommand方法', () => {
      const vm = wrapper.vm
      expect(typeof vm.executeCommand).toBe('function')

      vm.executeCommand('help')
      expect(vm.terminalLines.some(line => line.content.includes('可用命令'))).toBe(true)
    })

    it('应该暴露getAllLines方法', () => {
      const vm = wrapper.vm
      expect(typeof vm.getAllLines).toBe('function')

      const lines = vm.getAllLines()
      expect(Array.isArray(lines)).toBe(true)
      expect(lines).toBe(vm.terminalLines)
    })

    it('应该暴露计算属性', () => {
      const vm = wrapper.vm
      
      expect(typeof vm.totalLines).toBe('number')
      expect(typeof vm.receivedBytes).toBe('number')
      expect(typeof vm.sentBytes).toBe('number')
      expect(typeof vm.hasData).toBe('boolean')
      expect(typeof vm.displayMode).toBe('string')
      expect(typeof vm.autoScroll).toBe('boolean')
      expect(Array.isArray(vm.terminalLines)).toBe(true)
    })

    it('应该暴露handleExport方法', () => {
      const vm = wrapper.vm
      expect(typeof vm.handleExport).toBe('function')

      vm.handleExport()
      expect(wrapper.emitted('terminal-exported')).toBeTruthy()
    })

    it('应该暴露handleDisplayModeChange方法', () => {
      const vm = wrapper.vm
      expect(typeof vm.handleDisplayModeChange).toBe('function')

      vm.handleDisplayModeChange('hex')
      expect(vm.displayMode).toBe('hex')
      expect(wrapper.emitted('display-mode-changed')).toEqual([['hex']])
    })
  })
})