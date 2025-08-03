<!--
  PerformanceDashboard - 实时性能监控仪表板
  提供CPU、内存、帧率等关键指标的实时可视化
-->

<template>
  <div class="performance-dashboard">
    <!-- 仪表板头部 -->
    <div class="dashboard-header">
      <div class="header-title">
        <el-icon><Monitor /></el-icon>
        <h2>性能监控仪表板</h2>
      </div>
      
      <div class="header-controls">
        <el-button-group size="small">
          <el-tooltip content="暂停/恢复监控" placement="bottom">
            <el-button 
              :icon="isMonitoring ? VideoPause : VideoPlay"
              @click="toggleMonitoring"
            />
          </el-tooltip>
          
          <el-tooltip content="重置数据" placement="bottom">
            <el-button 
              icon="Refresh"
              @click="resetMetrics"
            />
          </el-tooltip>
          
          <el-tooltip content="导出数据" placement="bottom">
            <el-button 
              icon="Download"
              @click="exportData"
            />
          </el-tooltip>
        </el-button-group>

        <el-select 
          v-model="refreshInterval" 
          size="small" 
          style="width: 120px; margin-left: 8px;"
          @change="updateRefreshInterval"
        >
          <el-option label="500ms" :value="500" />
          <el-option label="1秒" :value="1000" />
          <el-option label="2秒" :value="2000" />
          <el-option label="5秒" :value="5000" />
        </el-select>
      </div>
    </div>

    <!-- 主要指标卡片 -->
    <div class="metrics-grid">
      <!-- CPU 使用率 -->
      <div class="metric-card">
        <div class="metric-header">
          <el-icon><CpuFill /></el-icon>
          <span>CPU 使用率</span>
        </div>
        <div class="metric-content">
          <div class="metric-value">
            <span class="value">{{ currentMetrics.cpu.toFixed(1) }}</span>
            <span class="unit">%</span>
          </div>
          <div class="metric-chart">
            <canvas ref="cpuChartRef" width="200" height="60"></canvas>
          </div>
          <div class="metric-details">
            <div class="detail-item">
              <span>平均:</span>
              <span>{{ averageMetrics.cpu.toFixed(1) }}%</span>
            </div>
            <div class="detail-item">
              <span>峰值:</span>
              <span>{{ maxMetrics.cpu.toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 内存使用量 -->
      <div class="metric-card">
        <div class="metric-header">
          <el-icon><Coin /></el-icon>
          <span>内存使用</span>
        </div>
        <div class="metric-content">
          <div class="metric-value">
            <span class="value">{{ currentMetrics.memory.toFixed(0) }}</span>
            <span class="unit">MB</span>
          </div>
          <div class="metric-chart">
            <canvas ref="memoryChartRef" width="200" height="60"></canvas>
          </div>
          <div class="metric-details">
            <div class="detail-item">
              <span>平均:</span>
              <span>{{ averageMetrics.memory.toFixed(0) }}MB</span>
            </div>
            <div class="detail-item">
              <span>峰值:</span>
              <span>{{ maxMetrics.memory.toFixed(0) }}MB</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 帧率 -->
      <div class="metric-card">
        <div class="metric-header">
          <el-icon><VideoCamera /></el-icon>
          <span>渲染帧率</span>
        </div>
        <div class="metric-content">
          <div class="metric-value">
            <span class="value">{{ currentMetrics.fps.toFixed(0) }}</span>
            <span class="unit">FPS</span>
          </div>
          <div class="metric-chart">
            <canvas ref="fpsChartRef" width="200" height="60"></canvas>
          </div>
          <div class="metric-details">
            <div class="detail-item">
              <span>平均:</span>
              <span>{{ averageMetrics.fps.toFixed(0) }}FPS</span>
            </div>
            <div class="detail-item">
              <span>目标:</span>
              <span>60FPS</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 网络吞吐量 -->
      <div class="metric-card">
        <div class="metric-header">
          <el-icon><Connection /></el-icon>
          <span>数据吞吐量</span>
        </div>
        <div class="metric-content">
          <div class="metric-value">
            <span class="value">{{ formatThroughput(currentMetrics.throughput) }}</span>
            <span class="unit">KB/s</span>
          </div>
          <div class="metric-chart">
            <canvas ref="throughputChartRef" width="200" height="60"></canvas>
          </div>
          <div class="metric-details">
            <div class="detail-item">
              <span>平均:</span>
              <span>{{ formatThroughput(averageMetrics.throughput) }}KB/s</span>
            </div>
            <div class="detail-item">
              <span>峰值:</span>
              <span>{{ formatThroughput(maxMetrics.throughput) }}KB/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细图表区域 -->
    <div class="charts-section">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="系统概览" name="overview">
          <div class="chart-container">
            <canvas ref="overviewChartRef" width="800" height="300"></canvas>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="内存分析" name="memory">
          <div class="memory-analysis">
            <div class="memory-breakdown">
              <h4>内存分解</h4>
              <div class="memory-item">
                <span>堆内存使用:</span>
                <span>{{ memoryDetails.heapUsed.toFixed(1) }}MB</span>
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :style="{ width: (memoryDetails.heapUsed / memoryDetails.heapTotal * 100) + '%' }"
                  ></div>
                </div>
              </div>
              <div class="memory-item">
                <span>堆内存总量:</span>
                <span>{{ memoryDetails.heapTotal.toFixed(1) }}MB</span>
              </div>
              <div class="memory-item">
                <span>外部内存:</span>
                <span>{{ memoryDetails.external.toFixed(1) }}MB</span>
              </div>
              <div class="memory-item">
                <span>RSS内存:</span>
                <span>{{ memoryDetails.rss.toFixed(1) }}MB</span>
              </div>
            </div>
            
            <div class="memory-chart">
              <canvas ref="memoryDetailChartRef" width="500" height="300"></canvas>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="性能警告" name="alerts">
          <div class="alerts-section">
            <div v-if="performanceAlerts.length === 0" class="no-alerts">
              <el-icon><CircleCheckFilled /></el-icon>
              <span>当前无性能警告</span>
            </div>
            
            <div v-else class="alerts-list">
              <div 
                v-for="alert in performanceAlerts" 
                :key="alert.id"
                class="alert-item"
                :class="alert.level"
              >
                <div class="alert-icon">
                  <el-icon v-if="alert.level === 'critical'"><WarningFilled /></el-icon>
                  <el-icon v-else><Warning /></el-icon>
                </div>
                <div class="alert-content">
                  <div class="alert-title">{{ alert.message }}</div>
                  <div class="alert-details">
                    <span>当前值: {{ alert.value }}</span>
                    <span>阈值: {{ alert.threshold }}</span>
                    <span>{{ formatTime(alert.timestamp) }}</span>
                  </div>
                </div>
                <div class="alert-actions">
                  <el-button size="small" text @click="dismissAlert(alert.id)">
                    忽略
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <div class="status-item">
        <span>监控状态:</span>
        <el-tag :type="isMonitoring ? 'success' : 'info'" size="small">
          {{ isMonitoring ? '运行中' : '已暂停' }}
        </el-tag>
      </div>
      
      <div class="status-item">
        <span>运行时间:</span>
        <span>{{ formatDuration(monitoringDuration) }}</span>
      </div>
      
      <div class="status-item">
        <span>数据点:</span>
        <span>{{ totalDataPoints }}</span>
      </div>
      
      <div class="status-item">
        <span>更新频率:</span>
        <span>{{ refreshInterval }}ms</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed, 
  onMounted, 
  onUnmounted, 
  nextTick 
} from 'vue';
import {
  Monitor,
  VideoPlay,
  VideoPause,
  Refresh,
  Download,
  CpuFill,
  Coin,
  VideoCamera,
  Connection,
  CircleCheckFilled,
  WarningFilled,
  Warning
} from '@element-plus/icons-vue';

import { usePerformanceStore } from '../../stores/performance';
import { useThemeStore } from '../../stores/theme';

// Props 定义
interface Props {
  autoStart?: boolean;
  defaultRefreshInterval?: number;
}

const props = withDefaults(defineProps<Props>(), {
  autoStart: true,
  defaultRefreshInterval: 1000
});

// 依赖注入
const performanceStore = usePerformanceStore();
const themeStore = useThemeStore();

// 响应式状态
const isMonitoring = ref(false);
const refreshInterval = ref(props.defaultRefreshInterval);
const activeTab = ref('overview');
const monitoringStartTime = ref(0);

// Canvas 引用
const cpuChartRef = ref<HTMLCanvasElement>();
const memoryChartRef = ref<HTMLCanvasElement>();
const fpsChartRef = ref<HTMLCanvasElement>();
const throughputChartRef = ref<HTMLCanvasElement>();
const overviewChartRef = ref<HTMLCanvasElement>();
const memoryDetailChartRef = ref<HTMLCanvasElement>();

// 监控定时器
let monitoringTimer: NodeJS.Timeout | null = null;

// 历史数据存储
const metricsHistory = ref<{
  cpu: number[];
  memory: number[];
  fps: number[];
  throughput: number[];
  timestamps: number[];
}>({
  cpu: [],
  memory: [],
  fps: [],
  throughput: [],
  timestamps: []
});

const maxHistoryLength = 100; // 保留最近100个数据点

// 当前性能指标
const currentMetrics = computed(() => ({
  cpu: performanceStore.cpuUsage,
  memory: performanceStore.memoryUsage,
  fps: performanceStore.fps,
  throughput: 0 // TODO: 从数据源获取吞吐量
}));

// 平均性能指标
const averageMetrics = computed(() => {
  const history = metricsHistory.value;
  
  if (history.cpu.length === 0) {
    return { cpu: 0, memory: 0, fps: 0, throughput: 0 };
  }
  
  return {
    cpu: history.cpu.reduce((a, b) => a + b, 0) / history.cpu.length,
    memory: history.memory.reduce((a, b) => a + b, 0) / history.memory.length,
    fps: history.fps.reduce((a, b) => a + b, 0) / history.fps.length,
    throughput: history.throughput.reduce((a, b) => a + b, 0) / history.throughput.length
  };
});

// 最大性能指标
const maxMetrics = computed(() => {
  const history = metricsHistory.value;
  
  return {
    cpu: Math.max(...history.cpu, 0),
    memory: Math.max(...history.memory, 0),
    fps: Math.max(...history.fps, 0),
    throughput: Math.max(...history.throughput, 0)
  };
});

// 内存详细信息
const memoryDetails = computed(() => {
  // TODO: 从实际的内存监控获取详细信息
  return {
    heapUsed: currentMetrics.value.memory * 0.7,
    heapTotal: currentMetrics.value.memory * 1.2,
    external: currentMetrics.value.memory * 0.1,
    rss: currentMetrics.value.memory * 1.5
  };
});

// 性能警告
const performanceAlerts = computed(() => {
  return performanceStore.activeAlerts;
});

// 监控持续时间
const monitoringDuration = computed(() => {
  if (!isMonitoring.value || monitoringStartTime.value === 0) return 0;
  return Date.now() - monitoringStartTime.value;
});

// 总数据点数
const totalDataPoints = computed(() => {
  return metricsHistory.value.timestamps.length;
});

// 方法
const toggleMonitoring = () => {
  if (isMonitoring.value) {
    stopMonitoring();
  } else {
    startMonitoring();
  }
};

const startMonitoring = () => {
  if (isMonitoring.value) return;
  
  isMonitoring.value = true;
  monitoringStartTime.value = Date.now();
  
  // 启动性能监控
  performanceStore.startMonitoring();
  
  // 启动数据收集
  monitoringTimer = setInterval(() => {
    collectMetrics();
  }, refreshInterval.value);
  
  console.log('性能监控仪表板已启动');
};

const stopMonitoring = () => {
  if (!isMonitoring.value) return;
  
  isMonitoring.value = false;
  
  // 停止性能监控
  performanceStore.stopMonitoring();
  
  // 清理定时器
  if (monitoringTimer) {
    clearInterval(monitoringTimer);
    monitoringTimer = null;
  }
  
  console.log('性能监控仪表板已停止');
};

const collectMetrics = () => {
  const now = Date.now();
  const metrics = currentMetrics.value;
  
  // 添加新数据点
  metricsHistory.value.cpu.push(metrics.cpu);
  metricsHistory.value.memory.push(metrics.memory);
  metricsHistory.value.fps.push(metrics.fps);
  metricsHistory.value.throughput.push(metrics.throughput);
  metricsHistory.value.timestamps.push(now);
  
  // 限制历史数据长度
  if (metricsHistory.value.timestamps.length > maxHistoryLength) {
    metricsHistory.value.cpu.shift();
    metricsHistory.value.memory.shift();
    metricsHistory.value.fps.shift();
    metricsHistory.value.throughput.shift();
    metricsHistory.value.timestamps.shift();
  }
  
  // 更新图表
  updateCharts();
};

const updateCharts = () => {
  nextTick(() => {
    updateMiniChart(cpuChartRef.value, metricsHistory.value.cpu, '#409eff', 100);
    updateMiniChart(memoryChartRef.value, metricsHistory.value.memory, '#67c23a');
    updateMiniChart(fpsChartRef.value, metricsHistory.value.fps, '#e6a23c', 60);
    updateMiniChart(throughputChartRef.value, metricsHistory.value.throughput, '#f56c6c');
    
    updateOverviewChart();
    updateMemoryDetailChart();
  });
};

const updateMiniChart = (
  canvas: HTMLCanvasElement | undefined, 
  data: number[], 
  color: string, 
  maxValue?: number
) => {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const { width, height } = canvas;
  
  // 清空画布
  ctx.clearRect(0, 0, width, height);
  
  if (data.length < 2) return;
  
  // 计算数据范围
  const max = maxValue || Math.max(...data) * 1.1;
  const min = Math.min(...data, 0);
  const range = max - min;
  
  // 绘制背景网格
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
  ctx.lineWidth = 1;
  
  for (let i = 1; i < 4; i++) {
    const y = (height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // 绘制数据线
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for (let i = 0; i < data.length; i++) {
    const x = (width / (data.length - 1)) * i;
    const y = height - ((data[i] - min) / range) * height;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.stroke();
  
  // 填充区域
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = color;
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
};

const updateOverviewChart = () => {
  const canvas = overviewChartRef.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const { width, height } = canvas;
  const data = metricsHistory.value;
  
  // 清空画布
  ctx.clearRect(0, 0, width, height);
  
  if (data.timestamps.length < 2) return;
  
  // 绘制多条线
  const metrics = [
    { data: data.cpu, color: '#409eff', max: 100, label: 'CPU' },
    { data: data.memory, color: '#67c23a', max: Math.max(...data.memory) * 1.2, label: 'Memory' },
    { data: data.fps, color: '#e6a23c', max: 60, label: 'FPS' }
  ];
  
  // 绘制背景网格
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
  ctx.lineWidth = 1;
  
  for (let i = 0; i <= 10; i++) {
    const y = (height / 10) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // 绘制每个指标
  metrics.forEach(metric => {
    ctx.strokeStyle = metric.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < metric.data.length; i++) {
      const x = (width / (metric.data.length - 1)) * i;
      const y = height - (metric.data[i] / metric.max) * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
  });
};

const updateMemoryDetailChart = () => {
  const canvas = memoryDetailChartRef.value;
  if (!canvas) return;
  
  // TODO: 实现详细的内存分析图表
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // 简单的内存使用饼图
  const { width, height } = canvas;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;
  
  ctx.clearRect(0, 0, width, height);
  
  const memData = memoryDetails.value;
  const total = memData.heapTotal;
  const used = memData.heapUsed;
  const free = total - used;
  
  // 绘制饼图
  const usedAngle = (used / total) * 2 * Math.PI;
  
  // 已使用部分
  ctx.fillStyle = '#f56c6c';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, 0, usedAngle);
  ctx.closePath();
  ctx.fill();
  
  // 空闲部分
  ctx.fillStyle = '#67c23a';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, usedAngle, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
  
  // 中心标签
  ctx.fillStyle = '#333';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${(used / total * 100).toFixed(1)}%`, centerX, centerY);
};

const resetMetrics = () => {
  metricsHistory.value = {
    cpu: [],
    memory: [],
    fps: [],
    throughput: [],
    timestamps: []
  };
  
  performanceStore.resetStats();
  
  nextTick(() => {
    updateCharts();
  });
};

const updateRefreshInterval = (newInterval: number) => {
  refreshInterval.value = newInterval;
  
  if (isMonitoring.value) {
    stopMonitoring();
    startMonitoring();
  }
};

const exportData = () => {
  const data = {
    timestamp: Date.now(),
    duration: monitoringDuration.value,
    metrics: metricsHistory.value,
    summary: {
      current: currentMetrics.value,
      average: averageMetrics.value,
      max: maxMetrics.value
    },
    alerts: performanceAlerts.value
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `performance-data-${new Date().toISOString().slice(0, 19)}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
};

const dismissAlert = (alertId: string) => {
  // TODO: 实现警告忽略功能
  console.log('忽略警告:', alertId);
};

// 格式化工具函数
const formatThroughput = (value: number): string => {
  return (value / 1024).toFixed(1);
};

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString();
};

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  } else if (minutes > 0) {
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  } else {
    return `${seconds}s`;
  }
};

// 生命周期
onMounted(() => {
  if (props.autoStart) {
    startMonitoring();
  }
});

onUnmounted(() => {
  stopMonitoring();
});

// 暴露方法
defineExpose({
  startMonitoring,
  stopMonitoring,
  resetMetrics,
  exportData,
  isMonitoring: computed(() => isMonitoring.value),
  currentMetrics,
  averageMetrics,
  maxMetrics
});
</script>

<style scoped>
.performance-dashboard {
  padding: 16px;
  background-color: var(--el-bg-color);
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title h2 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.header-controls {
  display: flex;
  align-items: center;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s ease;
}

.metric-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.metric-value .value {
  font-size: 32px;
  font-weight: bold;
  color: var(--el-color-primary);
}

.metric-value .unit {
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.metric-chart {
  height: 60px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  overflow: hidden;
}

.metric-details {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.charts-section {
  margin-bottom: 24px;
}

.chart-container {
  padding: 16px;
  text-align: center;
}

.memory-analysis {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  padding: 16px;
}

.memory-breakdown h4 {
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
}

.memory-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.progress-bar {
  width: 100px;
  height: 6px;
  background-color: var(--el-border-color-lighter);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--el-color-primary);
  transition: width 0.3s ease;
}

.alerts-section {
  padding: 16px;
}

.no-alerts {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--el-color-success);
  font-size: 16px;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid;
}

.alert-item.warning {
  background-color: var(--el-color-warning-light-9);
  border-left-color: var(--el-color-warning);
}

.alert-item.critical {
  background-color: var(--el-color-danger-light-9);
  border-left-color: var(--el-color-danger);
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.alert-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.alert-actions {
  flex-shrink: 0;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--el-fill-color-extra-light);
  border-radius: 6px;
  font-size: 14px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .memory-analysis {
    grid-template-columns: 1fr;
  }
  
  .status-bar {
    flex-direction: column;
    gap: 8px;
  }
  
  .alert-details {
    flex-direction: column;
    gap: 4px;
  }
}
</style>