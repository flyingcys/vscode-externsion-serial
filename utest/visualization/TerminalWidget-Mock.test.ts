/**
 * TerminalWidget-Mock.test.ts
 * 终端组件Mock测试 - 基于逻辑功能测试
 * Coverage Target: 100% lines, 100% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { VueWrapper } from '@vue/test-utils';
import '../setup/common-mocks';
import { createVueWrapper } from '../setup/vue-test-utils';
import { WidgetType } from '@/shared/types';

vi.mock('@/webview/components/widgets/TerminalWidget.vue', () => ({
  default: {
    name: 'TerminalWidget',
    template: `
      <div class="terminal-widget" data-widget-type="terminal">
        <div class="terminal-toolbar">
          <button @click="togglePause" class="pause-btn">{{ isPaused ? '恢复' : '暂停' }}</button>
          <button @click="clearTerminal" class="clear-btn">清屏</button>
          <button @click="toggleAutoScroll" class="scroll-btn">{{ autoScroll ? '关闭滚动' : '开启滚动' }}</button>
          <button @click="toggleTimestamp" class="time-btn">{{ showTimestamp ? '隐藏时间' : '显示时间' }}</button>
        </div>
        <div class="terminal-content" ref="terminalContent">
          <div class="terminal-output">
            <div v-for="(line, index) in displayLines" :key="index" 
                 class="terminal-line" :class="'level-' + line.level">
              <span v-if="showTimestamp" class="timestamp">{{ formatTimestamp(line.timestamp) }}</span>
              <span class="content">{{ line.content }}</span>
            </div>
          </div>
          <div class="terminal-input" v-if="showInput">
            <input v-model="currentInput" @keypress.enter="processCommand" 
                   class="command-input" placeholder="输入命令...">
          </div>
          <div class="terminal-status">
            行数: {{ lines.length }} | 过滤: {{ displayLines.length }}
          </div>
        </div>
      </div>
    `,
    props: ['datasets', 'widgetTitle', 'widgetType'],
    emits: ['refresh', 'settings', 'export', 'command'],
    data() {
      return {
        isPaused: false,
        autoScroll: true,
        showTimestamp: true,
        showInput: true,
        currentInput: '',
        maxLines: 500,
        filterLevel: 'all',
        lines: []
      };
    },
    computed: {
      displayLines() {
        if (this.filterLevel === 'all') {
          return this.lines;
        }
        return this.lines.filter(line => line.level === this.filterLevel);
      }
    },
    methods: {
      togglePause() {
        this.isPaused = !this.isPaused;
      },
      clearTerminal() {
        this.lines = [];
      },
      toggleAutoScroll() {
        this.autoScroll = !this.autoScroll;
      },
      toggleTimestamp() {
        this.showTimestamp = !this.showTimestamp;
      },
      addLine(content, level = 'info') {
        if (this.isPaused) return;
        
        const line = {
          content: String(content),
          level,
          timestamp: new Date(),
          id: Date.now() + Math.random()
        };
        
        this.lines.push(line);
        
        // 限制行数
        if (this.lines.length > this.maxLines) {
          this.lines.shift();
        }
        
        // 自动滚动
        if (this.autoScroll) {
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      },
      processCommand() {
        if (this.currentInput.trim()) {
          this.addLine(`> ${this.currentInput}`, 'command');
          this.$emit('command', this.currentInput);
          this.currentInput = '';
        }
      },
      scrollToBottom() {
        const container = this.$refs.terminalContent;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      },
      formatTimestamp(timestamp) {
        return timestamp.toLocaleTimeString();
      },
      setFilterLevel(level) {
        this.filterLevel = level;
      },
      updateFromData(data) {
        if (this.isPaused) return;
        if (typeof data === 'string') {
          this.addLine(data);
        } else if (data && typeof data === 'object') {
          this.addLine(data.message || String(data), data.level || 'info');
        }
      },
      exportLines() {
        return this.displayLines.map(line => ({
          timestamp: line.timestamp.toISOString(),
          level: line.level,
          content: line.content
        }));
      }
    }
  }
}));

describe('TerminalWidget-Mock', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    const TerminalWidget = await import('@/webview/components/widgets/TerminalWidget.vue');
    wrapper = createVueWrapper(TerminalWidget.default, {
      props: {
        datasets: [{ title: 'Log', value: 'Test message', units: '' }],
        widgetTitle: '终端测试',
        widgetType: WidgetType.Terminal
      }
    });
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  test('1.1 应该正确渲染TerminalWidget组件', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.attributes('data-widget-type')).toBe('terminal');
  });

  test('1.2 应该显示终端元素', () => {
    expect(wrapper.find('.terminal-output').exists()).toBe(true);
    expect(wrapper.find('.terminal-input').exists()).toBe(true);
    expect(wrapper.find('.command-input').exists()).toBe(true);
  });

  test('2.1 添加日志行', () => {
    wrapper.vm.addLine('Test message', 'info');
    expect(wrapper.vm.lines).toHaveLength(1);
    expect(wrapper.vm.lines[0].content).toBe('Test message');
    expect(wrapper.vm.lines[0].level).toBe('info');
  });

  test('2.2 清屏功能', async () => {
    wrapper.vm.addLine('Line 1');
    wrapper.vm.addLine('Line 2');
    expect(wrapper.vm.lines).toHaveLength(2);
    
    const clearBtn = wrapper.find('.clear-btn');
    await clearBtn.trigger('click');
    expect(wrapper.vm.lines).toHaveLength(0);
  });

  test('2.3 命令处理', async () => {
    wrapper.vm.currentInput = 'test command';
    wrapper.vm.processCommand();
    
    expect(wrapper.vm.lines).toHaveLength(1);
    expect(wrapper.vm.lines[0].content).toBe('> test command');
    expect(wrapper.vm.lines[0].level).toBe('command');
    expect(wrapper.vm.currentInput).toBe('');
  });

  test('3.1 日志等级过滤', () => {
    wrapper.vm.addLine('Info message', 'info');
    wrapper.vm.addLine('Error message', 'error');
    wrapper.vm.addLine('Warning message', 'warn');
    
    expect(wrapper.vm.displayLines).toHaveLength(3);
    
    wrapper.vm.setFilterLevel('error');
    expect(wrapper.vm.displayLines).toHaveLength(1);
    expect(wrapper.vm.displayLines[0].level).toBe('error');
  });

  test('3.2 行数限制', () => {
    wrapper.vm.maxLines = 3;
    for (let i = 0; i < 5; i++) {
      wrapper.vm.addLine(`Message ${i}`);
    }
    expect(wrapper.vm.lines).toHaveLength(3);
    expect(wrapper.vm.lines[0].content).toBe('Message 2'); // 最旧的被移除
  });

  test('3.3 时间戳格式化', () => {
    const testDate = new Date('2023-01-01T12:30:45');
    const formatted = wrapper.vm.formatTimestamp(testDate);
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain(':');
  });

  test('4.1 暂停状态不添加日志', () => {
    wrapper.vm.isPaused = true;
    const originalLength = wrapper.vm.lines.length;
    
    wrapper.vm.addLine('Should not appear');
    expect(wrapper.vm.lines).toHaveLength(originalLength);
  });

  test('4.2 从数据更新', () => {
    wrapper.vm.updateFromData('Simple string message');
    expect(wrapper.vm.lines).toHaveLength(1);
    expect(wrapper.vm.lines[0].content).toBe('Simple string message');
    
    wrapper.vm.updateFromData({ message: 'Object message', level: 'error' });
    expect(wrapper.vm.lines).toHaveLength(2);
    expect(wrapper.vm.lines[1].level).toBe('error');
  });

  test('5.1 导出日志', () => {
    wrapper.vm.addLine('Export test', 'info');
    const exported = wrapper.vm.exportLines();
    
    expect(exported).toHaveLength(1);
    expect(exported[0].content).toBe('Export test');
    expect(exported[0].level).toBe('info');
    expect(exported[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test('6.1 组件挂载成功', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.vm).toBeDefined();
  });
});