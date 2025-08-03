<!--
  TerminalWidget - 终端显示组件
  基于Serial Studio的Terminal Widget实现，显示原始串口数据和控制台信息
-->

<template>
  <BaseWidget
    :widget-type="WidgetType.Terminal"
    :title="widgetTitle"
    :datasets="datasets"
    :widget-data="terminalData"
    :widget-config="config"
    :is-loading="isLoading"
    :has-error="hasError"
    :error-message="errorMessage"
    :has-data="hasData"
    :last-update="lastUpdate"
    @refresh="handleRefresh"
    @settings="handleSettings"
    @export="handleExport"
    @resize="handleResize"
    @settings-changed="handleSettingsChanged"
  >
    <!-- 工具栏 -->
    <template #toolbar>
      <el-button-group size="small">
        <!-- 暂停/恢复 -->
        <el-tooltip :content="isPaused ? '恢复更新' : '暂停更新'" placement="bottom">
          <el-button 
            :icon="isPaused ? VideoPlay : VideoPause"
            @click="togglePause"
          />
        </el-tooltip>
        
        <!-- 清空终端 -->
        <el-tooltip content="清空终端" placement="bottom">
          <el-button 
            icon="Delete"
            @click="clearTerminal"
          />
        </el-tooltip>
        
        <!-- 自动滚动 -->
        <el-tooltip content="自动滚动" placement="bottom">
          <el-button 
            :class="{ 'is-active': autoScroll }"
            icon="Bottom"
            @click="toggleAutoScroll"
          />
        </el-tooltip>
        
        <!-- 显示时间戳 -->
        <el-tooltip content="显示时间戳" placement="bottom">
          <el-button 
            :class="{ 'is-active': showTimestamp }"
            icon="Clock"
            @click="toggleTimestamp"
          />
        </el-tooltip>
        
        <!-- 换行模式 -->
        <el-tooltip content="换行模式" placement="bottom">
          <el-dropdown @command="handleWrapModeChange">
            <el-button icon="Document">
              <el-icon><Document /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="none">不换行</el-dropdown-item>
                <el-dropdown-item command="word">按词换行</el-dropdown-item>
                <el-dropdown-item command="char">按字符换行</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        
        <!-- 字体大小 -->
        <el-tooltip content="字体大小" placement="bottom">
          <el-dropdown @command="handleFontSizeChange">
            <el-button icon="Rank">
              <el-icon><Rank /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="12">12px</el-dropdown-item>
                <el-dropdown-item command="14">14px</el-dropdown-item>
                <el-dropdown-item command="16">16px</el-dropdown-item>
                <el-dropdown-item command="18">18px</el-dropdown-item>
                <el-dropdown-item command="20">20px</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
      </el-button-group>
    </template>

    <!-- 主要终端内容 -->
    <div class="terminal-container" ref="terminalContainer">
      <!-- 终端显示区域 -->
      <div 
        class="terminal-display"
        :class="[
          `wrap-${wrapMode}`,
          { 'show-timestamps': showTimestamp }
        ]"
        :style="{ fontSize: `${fontSize}px` }"
        ref="terminalDisplay"
      >
        <!-- 终端行 -->
        <div
          v-for="(line, index) in displayLines"
          :key="`line-${index}`"
          class="terminal-line"
          :class="[
            `level-${line.level}`,
            { 'highlight': line.highlight }
          ]"
        >
          <!-- 时间戳 -->
          <span v-if="showTimestamp" class="line-timestamp">
            {{ formatTimestamp(line.timestamp) }}
          </span>
          
          <!-- 级别标记 -->
          <span v-if="line.level !== 'info'" class="level-badge">
            {{ getLevelBadge(line.level) }}
          </span>
          
          <!-- 内容 -->
          <span class="line-content" v-html="formatLineContent(line.content)"></span>
        </div>
        
        <!-- 光标（可选显示） -->
        <div v-if="showCursor" class="terminal-cursor"></div>
      </div>
      
      <!-- 命令输入区域 -->
      <div v-if="enableInput" class="terminal-input">
        <div class="input-prompt">></div>
        <el-input
          v-model="currentCommand"
          ref="commandInput"
          placeholder="输入命令..."
          @keyup.enter="executeCommandWithEvent"
          @keyup.up="navigateHistory(-1)"
          @keyup.down="navigateHistory(1)"
          class="command-input"
        />
        <el-button 
          type="primary" 
          size="small"
          @click="executeCommandWithEvent"
          :disabled="!currentCommand.trim()"
        >
          发送
        </el-button>
      </div>
      
      <!-- 加载指示器 -->
      <div v-if="isLoading" class="terminal-loading">
        <el-icon class="loading-icon">
          <Loading />
        </el-icon>
        <span>初始化终端...</span>
      </div>
      
      <!-- 状态栏 -->
      <div class="terminal-statusbar">
        <div class="statusbar-left">
          <span class="status-item">
            行数: <strong>{{ totalLines }}</strong>
          </span>
          <span v-if="filteredLines !== totalLines" class="status-item">
            显示: <strong>{{ filteredLines }}</strong>
          </span>
          <span v-if="selectedText" class="status-item">
            已选: <strong>{{ selectedText.length }}</strong> 字符
          </span>
        </div>
        
        <div class="statusbar-right">
          <span class="status-item">
            {{ updateRate }} Hz
          </span>
          <span v-if="autoScroll" class="status-item">
            <el-icon><Bottom /></el-icon>
          </span>
        </div>
      </div>
    </div>

    <!-- 脚注信息 -->
    <template #footer-left>
      <span class="terminal-stats">
        {{ totalLines }} 行 | {{ totalBytes }} 字节
      </span>
    </template>
    
    <template #footer-right>
      <span class="terminal-update">
        {{ updateRate }} Hz
      </span>
    </template>
  </BaseWidget>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed, 
  onMounted, 
  onUnmounted, 
  watch, 
  nextTick 
} from 'vue';
import { 
  VideoPlay, 
  VideoPause, 
  Loading, 
  Document,
  Rank,
  Bottom
} from '@element-plus/icons-vue';

import BaseWidget from '../base/BaseWidget.vue';
import { WidgetType, Dataset, DataPoint, WidgetConfig } from '../../../shared/types';
import { useThemeStore } from '../../stores/theme';
import { usePerformanceStore } from '../../stores/performance';

// 终端行接口
interface TerminalLine {
  id: string;
  timestamp: number;
  content: string;
  level: 'info' | 'warning' | 'error' | 'success' | 'debug';
  highlight?: boolean;
  raw?: boolean;
}

// Props定义
interface Props {
  datasets?: Dataset[];
  config?: Partial<WidgetConfig>;
  realtime?: boolean;
  updateInterval?: number;
  maxLines?: number;
  enableInput?: boolean;
  showCursor?: boolean;
  autoScroll?: boolean;
  fontSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  datasets: () => [],
  config: () => ({}),
  realtime: true,
  updateInterval: 100,
  maxLines: 1000,
  enableInput: false,
  showCursor: false,
  autoScroll: true,
  fontSize: 14
});

// 事件定义
const emit = defineEmits<{
  'terminal-exported': [content: string];
  'display-mode-changed': [mode: string];
  'command-sent': [command: string];
}>();

// 响应式状态
const terminalContainer = ref<HTMLDivElement>();
const terminalDisplay = ref<HTMLDivElement>();
const commandInput = ref();
const isPaused = ref(false);
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');
const lastUpdate = ref(0);

// 显示选项
const showTimestamp = ref(true);
const autoScroll = ref(props.autoScroll);
const wrapMode = ref<'none' | 'word' | 'char'>('word');
const fontSize = ref(props.fontSize);
const displayMode = ref('text'); // 添加显示模式状态

// 输入相关
const enableInput = ref(props.enableInput);
const showCursor = ref(props.showCursor);
const currentCommand = ref('');
const commandHistory = ref<string[]>([]);
const historyIndex = ref(-1);

// 数据存储
const terminalData = ref<{ lines: TerminalLine[] }>({ lines: [] });
const terminalLines = ref<TerminalLine[]>([]);
const selectedText = ref('');

// 性能监控
const frameCount = ref(0);
const lastFrameTime = ref(0);

// 依赖注入
const themeStore = useThemeStore();
const performanceStore = usePerformanceStore();

// 计算属性
const widgetTitle = computed(() => {
  return props.config?.title || 
         (props.datasets.length > 0 ? props.datasets[0].title : '终端');
});

const hasData = computed(() => {
  // 如果datasets为null、undefined或空数组，返回false
  if (!props.datasets || props.datasets.length === 0) {
    return false;
  }
  // 有datasets但没有terminalLines时，也返回false
  if (terminalLines.value.length === 0) {
    return false;
  }
  return true;
});

const updateRate = computed(() => {
  if (lastFrameTime.value === 0) return 0;
  const now = Date.now();
  const timeDiff = now - lastFrameTime.value;
  return timeDiff > 0 ? Math.round(1000 / timeDiff) : 0;
});

const totalLines = computed(() => terminalLines.value.length);
const filteredLines = computed(() => displayLines.value.length);

const totalBytes = computed(() => {
  return terminalLines.value.reduce((total, line) => total + line.content.length, 0);
});

const displayLines = computed(() => {
  // 这里可以添加过滤逻辑
  return terminalLines.value;
});

// 方法
const initializeTerminal = async () => {
  try {
    isLoading.value = true;
    
    // 初始化终端
    terminalLines.value = [];
    terminalData.value = { lines: [] };
    
    // 添加欢迎信息
    addLine('终端初始化完成', 'success');
    addLine(`最大行数: ${props.maxLines}`, 'info');
    addLine(`更新间隔: ${props.updateInterval}ms`, 'info');
    
    isLoading.value = false;
    console.log('终端初始化完成');
    
  } catch (error) {
    console.error('初始化终端时出错:', error);
    hasError.value = true;
    errorMessage.value = error instanceof Error ? error.message : '终端初始化失败';
    isLoading.value = false;
  }
};

const addLine = (
  content: string, 
  level: 'info' | 'warning' | 'error' | 'success' | 'debug' = 'info',
  highlight: boolean = false
) => {
  if (isPaused.value) return;
  
  const newLine: TerminalLine = {
    id: generateLineId(),
    timestamp: Date.now(),
    content,
    level,
    highlight
  };
  
  terminalLines.value.push(newLine);
  
  // 限制行数
  if (terminalLines.value.length > props.maxLines) {
    terminalLines.value.shift();
  }
  
  // 更新终端数据
  terminalData.value.lines = [...terminalLines.value];
  
  // 自动滚动
  if (autoScroll.value) {
    scrollToBottom();
  }
  
  lastUpdate.value = Date.now();
  recordFrame();
};

const generateLineId = () => {
  return `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (terminalDisplay.value) {
      terminalDisplay.value.scrollTop = terminalDisplay.value.scrollHeight;
    }
  });
};

const clearTerminal = () => {
  terminalLines.value = [];
  terminalData.value.lines = [];
  addLine('终端已清空', 'info');
};

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });
};

const formatLineContent = (content: string) => {
  // 转义HTML并处理特殊字符
  let escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // 高亮关键词
  escaped = escaped
    .replace(/\b(ERROR|FAIL|FAILED)\b/gi, '<span class="keyword error">$1</span>')
    .replace(/\b(WARNING|WARN)\b/gi, '<span class="keyword warning">$1</span>')
    .replace(/\b(SUCCESS|OK|PASS|PASSED)\b/gi, '<span class="keyword success">$1</span>')
    .replace(/\b(INFO|DEBUG)\b/gi, '<span class="keyword info">$1</span>');
  
  // 高亮数字
  escaped = escaped.replace(/\b\d+(\.\d+)?\b/g, '<span class="number">$&</span>');
  
  // 高亮IP地址
  escaped = escaped.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '<span class="ip">$&</span>');
  
  return escaped;
};

const getLevelBadge = (level: string) => {
  const badges: { [key: string]: string } = {
    error: '❌',
    warning: '⚠️',
    success: '✅',
    debug: '🐛',
    info: 'ℹ️'
  };
  return badges[level] || '';
};

const executeCommand = () => {
  if (!currentCommand.value.trim()) return;
  
  const command = currentCommand.value.trim();
  
  // 添加命令到历史
  commandHistory.value.unshift(command);
  if (commandHistory.value.length > 50) {
    commandHistory.value.pop();
  }
  historyIndex.value = -1;
  
  // 显示用户输入的命令
  addLine(`> ${command}`, 'info', true);
  
  // 处理内置命令
  processCommand(command);
  
  // 清空输入
  currentCommand.value = '';
};

const processCommand = (command: string) => {
  const cmd = command.toLowerCase().trim();
  
  switch (cmd) {
    case 'clear':
      clearTerminal();
      break;
    case 'help':
      addLine('可用命令:', 'info');
      addLine('  clear  - 清空终端', 'info');
      addLine('  help   - 显示帮助', 'info');
      addLine('  status - 显示状态', 'info');
      addLine('  test   - 运行测试', 'info');
      break;
    case 'status':
      addLine(`终端状态: ${isPaused.value ? '暂停' : '运行中'}`, 'info');
      addLine(`总行数: ${totalLines.value}`, 'info');
      addLine(`更新率: ${updateRate.value} Hz`, 'info');
      break;
    case 'test':
      addLine('开始测试...', 'info');
      setTimeout(() => addLine('测试成功完成', 'success'), 500);
      setTimeout(() => addLine('警告: 这是一个测试警告', 'warning'), 1000);
      setTimeout(() => addLine('错误: 这是一个测试错误', 'error'), 1500);
      break;
    default:
      addLine(`未知命令: ${command}`, 'error');
      addLine('输入 "help" 查看可用命令', 'info');
  }
};

const navigateHistory = (direction: number) => {
  if (commandHistory.value.length === 0) return;
  
  historyIndex.value += direction;
  
  if (historyIndex.value < -1) {
    historyIndex.value = commandHistory.value.length - 1;
  } else if (historyIndex.value >= commandHistory.value.length) {
    historyIndex.value = -1;
  }
  
  currentCommand.value = historyIndex.value === -1 ? '' : commandHistory.value[historyIndex.value];
};

const recordFrame = () => {
  frameCount.value++;
  const now = Date.now();
  
  if (lastFrameTime.value > 0) {
    const timeDiff = now - lastFrameTime.value;
    if (timeDiff > 0) {
      performanceStore.recordFrame();
    }
  }
  
  lastFrameTime.value = now;
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
  addLine(`终端${isPaused.value ? '已暂停' : '已恢复'}`, 'info');
};

const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value;
  addLine(`自动滚动${autoScroll.value ? '已开启' : '已关闭'}`, 'info');
};

const toggleTimestamp = () => {
  showTimestamp.value = !showTimestamp.value;
};

const handleWrapModeChange = (command: string) => {
  wrapMode.value = command as 'none' | 'word' | 'char';
  addLine(`换行模式已设置为: ${command}`, 'info');
};

const handleFontSizeChange = (command: string) => {
  fontSize.value = parseInt(command);
  addLine(`字体大小已设置为: ${command}px`, 'info');
};

const handleRefresh = () => {
  initializeTerminal();
};

const handleSettings = () => {
  console.log('打开终端设置对话框');
};

const handleExport = () => {
  console.log('导出终端数据');
  // 导出终端内容
  const exportContent = terminalLines.value.map(line => {
    const timestamp = showTimestamp.value ? formatTimestamp(line.timestamp) : '';
    const level = line.level !== 'info' ? `[${line.level.toUpperCase()}] ` : '';
    return `${timestamp} ${level}${line.content}`.trim();
  }).join('\n');
  
  // 发射导出事件
  emit('terminal-exported', exportContent);
};

const handleResize = (size: { width: number; height: number }) => {
  // 终端会根据容器大小自动调整
};

const handleSettingsChanged = (config: WidgetConfig) => {
  Object.assign(props.config, config);
  initializeTerminal();
};

// 模拟数据更新（用于演示）
const simulateDataUpdate = () => {
  const messages = [
    'System initialized successfully',
    'Connecting to sensor...',
    'Data stream started',
    'Received data packet: 42.5°C, 68% humidity',
    'Warning: Temperature threshold exceeded',
    'Sensor calibration complete',
    'Network connection established',
    'Debug: Memory usage 45MB',
    'Error: Communication timeout',
    'Recovery sequence initiated'
  ];
  
  const levels: Array<'info' | 'warning' | 'error' | 'success' | 'debug'> = 
    ['info', 'warning', 'error', 'success', 'debug'];
  
  setInterval(() => {
    if (!isPaused.value && props.realtime) {
      const message = messages[Math.floor(Math.random() * messages.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      addLine(message, level);
    }
  }, props.updateInterval);
};

// 生命周期
onMounted(async () => {
  await nextTick();
  await initializeTerminal();
  
  // 开始模拟数据更新（演示用）
  if (props.realtime) {
    simulateDataUpdate();
  }
});

onUnmounted(() => {
  // 清理资源
});

// 监听器
watch(() => props.datasets, () => {
  initializeTerminal();
}, { deep: true });

// 处理显示模式变化
const handleDisplayModeChange = (mode: string) => {
  displayMode.value = mode;
  emit('display-mode-changed', mode);
};

// 修改executeCommand方法以发射事件
const executeCommandWithEvent = () => {
  if (!currentCommand.value.trim()) return;
  
  const command = currentCommand.value.trim();
  
  // 发射命令发送事件
  emit('command-sent', command);
  
  // 添加命令到历史
  commandHistory.value.unshift(command);
  if (commandHistory.value.length > 50) {
    commandHistory.value.pop();
  }
  historyIndex.value = -1;
  
  // 显示用户输入的命令
  addLine(`> ${command}`, 'info', true);
  
  // 处理内置命令
  processCommand(command);
  
  // 清空输入
  currentCommand.value = '';
};

// 暴露组件方法
defineExpose({
  addLine,
  clearTerminal,
  togglePause,
  toggleAutoScroll,
  scrollToBottom,
  handleExport,
  autoScroll,
  hasData,
  displayMode,
  handleDisplayModeChange,
  totalLines: computed(() => terminalLines.value.length),
  receivedBytes: computed(() => totalBytes.value),
  sentBytes: computed(() => 0), // 简化处理
  terminalLines,
  executeCommand: (cmd: string) => {
    currentCommand.value = cmd;
    executeCommandWithEvent();
  },
  getAllLines: () => terminalLines.value
});
</script>

<style scoped>
.terminal-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 4px;
  overflow: hidden;
}

.terminal-display {
  flex: 1;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  line-height: 1.4;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.terminal-display.wrap-none {
  white-space: pre;
  word-break: normal;
}

.terminal-display.wrap-word {
  white-space: pre-wrap;
  word-break: break-word;
}

.terminal-display.wrap-char {
  white-space: pre-wrap;
  word-break: break-all;
}

.terminal-line {
  display: flex;
  align-items: flex-start;
  margin-bottom: 2px;
  min-height: 1.4em;
}

.terminal-line.highlight {
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 4px;
  border-radius: 2px;
}

.line-timestamp {
  color: #666;
  margin-right: 8px;
  font-size: 0.9em;
  flex-shrink: 0;
}

.level-badge {
  margin-right: 4px;
  flex-shrink: 0;
}

.line-content {
  flex: 1;
}

/* 级别样式 */
.terminal-line.level-error .line-content {
  color: #f85149;
}

.terminal-line.level-warning .line-content {
  color: #f0883e;
}

.terminal-line.level-success .line-content {
  color: #56d364;
}

.terminal-line.level-debug .line-content {
  color: #7c3aed;
}

.terminal-line.level-info .line-content {
  color: #58a6ff;
}

/* 内容高亮 */
:deep(.keyword) {
  font-weight: bold;
  padding: 1px 3px;
  border-radius: 2px;
}

:deep(.keyword.error) {
  background: rgba(248, 81, 73, 0.2);
  color: #f85149;
}

:deep(.keyword.warning) {
  background: rgba(240, 136, 62, 0.2);
  color: #f0883e;
}

:deep(.keyword.success) {
  background: rgba(86, 211, 100, 0.2);
  color: #56d364;
}

:deep(.keyword.info) {
  background: rgba(88, 166, 255, 0.2);
  color: #58a6ff;
}

:deep(.number) {
  color: #79c0ff;
  font-weight: 500;
}

:deep(.ip) {
  color: #7c3aed;
  font-weight: 500;
}

.terminal-cursor {
  width: 8px;
  height: 1.4em;
  background: #d4d4d4;
  animation: blink 1s infinite;
}

.terminal-input {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #2d2d2d;
  border-top: 1px solid #3c3c3c;
  gap: 8px;
}

.input-prompt {
  color: #56d364;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-weight: bold;
}

.command-input {
  flex: 1;
}

:deep(.command-input .el-input__wrapper) {
  background: #1e1e1e;
  border: 1px solid #3c3c3c;
  color: #d4d4d4;
}

:deep(.command-input .el-input__inner) {
  color: #d4d4d4;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}

.terminal-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #666;
}

.loading-icon {
  font-size: 24px;
  animation: spin 1s linear infinite;
}

.terminal-statusbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  background: #2d2d2d;
  border-top: 1px solid #3c3c3c;
  font-size: 11px;
  color: #666;
}

.statusbar-left,
.statusbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.terminal-stats {
  font-size: 12px;
  color: #666;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.terminal-update {
  font-size: 12px;
  color: #56d364;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 滚动条样式 */
.terminal-display::-webkit-scrollbar {
  width: 8px;
}

.terminal-display::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.terminal-display::-webkit-scrollbar-thumb {
  background: #4c4c4c;
  border-radius: 4px;
}

.terminal-display::-webkit-scrollbar-thumb:hover {
  background: #6c6c6c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .terminal-container {
    min-height: 250px;
  }
  
  .terminal-display {
    padding: 8px;
    font-size: 12px;
  }
  
  .terminal-input {
    padding: 6px 8px;
    gap: 6px;
  }
  
  .terminal-statusbar {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
    padding: 6px 8px;
  }
  
  .statusbar-left,
  .statusbar-right {
    gap: 8px;
  }
  
  .line-timestamp {
    font-size: 0.8em;
  }
}

@media (max-width: 576px) {
  .terminal-container {
    min-height: 200px;
  }
  
  .terminal-display {
    padding: 6px;
    font-size: 11px;
  }
  
  .terminal-input {
    padding: 4px 6px;
  }
  
  .terminal-statusbar {
    font-size: 10px;
    padding: 4px 6px;
  }
  
  .line-timestamp {
    display: none;
  }
  
  .show-timestamps .line-timestamp {
    display: inline;
    font-size: 0.7em;
  }
}
</style>