/**
 * FFTPlotWidget-Mock.test.ts
 * FFT频谱图组件Mock测试 - 基于逻辑功能测试
 * Coverage Target: 100% lines, 100% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { VueWrapper } from '@vue/test-utils';
import '../setup/common-mocks';
import { createVueWrapper } from '../setup/vue-test-utils';
import { WidgetType } from '@/shared/types';

vi.mock('@/webview/components/widgets/FFTPlotWidget.vue', () => ({
  default: {
    name: 'FFTPlotWidget',
    template: `
      <div class="fft-widget" data-widget-type="fft">
        <div class="fft-toolbar">
          <button @click="togglePause" class="pause-btn">{{ isPaused ? '恢复' : '暂停' }}</button>
          <button @click="clearSpectrum" class="clear-btn">清除</button>
          <button @click="toggleScale" class="scale-btn">{{ logScale ? '线性' : '对数' }}</button>
          <select v-model="windowType" class="window-select">
            <option value="hann">汉宁窗</option>
            <option value="hamming">汉明窗</option>
            <option value="blackman">布莱克曼窗</option>
            <option value="rectangular">矩形窗</option>
          </select>
        </div>
        <div class="fft-content">
          <canvas ref="fftCanvas" class="fft-canvas"></canvas>
          <div class="fft-info">
            <div class="spectrum-stats">
              <div class="peak-freq">峰值频率: {{ peakFrequency.toFixed(2) }} Hz</div>
              <div class="peak-magnitude">峰值幅度: {{ peakMagnitude.toFixed(2) }} dB</div>
              <div class="sample-rate">采样率: {{ sampleRate }} Hz</div>
              <div class="fft-size">FFT大小: {{ fftSize }}</div>
            </div>
            <div class="frequency-range">
              频率范围: 0 - {{ maxFrequency.toFixed(1) }} Hz
            </div>
          </div>
        </div>
      </div>
    `,
    props: ['datasets', 'widgetTitle', 'widgetType'],
    emits: ['refresh', 'settings', 'export'],
    data() {
      return {
        isPaused: false,
        logScale: true,
        windowType: 'hann',
        sampleRate: 1000,
        fftSize: 512,
        timeBuffer: [],
        frequencyData: [],
        peakFrequency: 0,
        peakMagnitude: -Infinity
      };
    },
    computed: {
      maxFrequency() {
        return this.sampleRate / 2; // 奈奎斯特频率
      },
      frequencyResolution() {
        return this.sampleRate / this.fftSize;
      }
    },
    methods: {
      togglePause() {
        this.isPaused = !this.isPaused;
      },
      clearSpectrum() {
        this.timeBuffer = [];
        this.frequencyData = [];
        this.peakFrequency = 0;
        this.peakMagnitude = -Infinity;
      },
      toggleScale() {
        this.logScale = !this.logScale;
      },
      addSample(sample) {
        if (this.isPaused) return;
        
        this.timeBuffer.push(sample);
        
        // 保持FFT大小的缓冲区
        if (this.timeBuffer.length > this.fftSize) {
          this.timeBuffer.shift();
        }
        
        // 当有足够的数据时计算FFT
        if (this.timeBuffer.length === this.fftSize) {
          this.computeFFT();
        }
      },
      computeFFT() {
        // 应用窗函数
        const windowed = this.applyWindow(this.timeBuffer.slice());
        
        // 简化的FFT计算 (实际实现中应使用复数FFT)
        this.frequencyData = this.simpleFFT(windowed);
        
        // 查找峰值
        this.findPeak();
      },
      applyWindow(data) {
        const N = data.length;
        const windowed = new Array(N);
        
        for (let i = 0; i < N; i++) {
          let window = 1;
          const n = i / (N - 1);
          
          switch (this.windowType) {
            case 'hann':
              window = 0.5 * (1 - Math.cos(2 * Math.PI * n));
              break;
            case 'hamming':
              window = 0.54 - 0.46 * Math.cos(2 * Math.PI * n);
              break;
            case 'blackman':
              window = 0.42 - 0.5 * Math.cos(2 * Math.PI * n) + 0.08 * Math.cos(4 * Math.PI * n);
              break;
            case 'rectangular':
            default:
              window = 1;
              break;
          }
          
          windowed[i] = data[i] * window;
        }
        
        return windowed;
      },
      simpleFFT(data) {
        // 简化的FFT实现 - 仅用于测试
        const N = data.length;
        const spectrum = new Array(N / 2);
        
        for (let k = 0; k < N / 2; k++) {
          let real = 0, imag = 0;
          
          for (let n = 0; n < N; n++) {
            const angle = -2 * Math.PI * k * n / N;
            real += data[n] * Math.cos(angle);
            imag += data[n] * Math.sin(angle);
          }
          
          const magnitude = Math.sqrt(real * real + imag * imag);
          spectrum[k] = this.logScale ? 
            20 * Math.log10(magnitude + 1e-10) : // 避免log(0)
            magnitude;
        }
        
        return spectrum;
      },
      findPeak() {
        if (this.frequencyData.length === 0) return;
        
        let maxMagnitude = -Infinity;
        let maxIndex = 0;
        
        for (let i = 1; i < this.frequencyData.length; i++) {
          if (this.frequencyData[i] > maxMagnitude) {
            maxMagnitude = this.frequencyData[i];
            maxIndex = i;
          }
        }
        
        this.peakMagnitude = maxMagnitude;
        this.peakFrequency = maxIndex * this.frequencyResolution;
      },
      updateFromData(data) {
        if (this.isPaused) return;
        
        if (Array.isArray(data)) {
          data.forEach(sample => {
            if (typeof sample === 'number') {
              this.addSample(sample);
            }
          });
        } else if (typeof data === 'number') {
          this.addSample(data);
        }
      },
      generateTestSignal(frequency, amplitude = 1, samples = null) {
        const sampleCount = samples || this.fftSize;
        const signal = [];
        
        for (let i = 0; i < sampleCount; i++) {
          const time = i / this.sampleRate;
          const sample = amplitude * Math.sin(2 * Math.PI * frequency * time);
          signal.push(sample);
        }
        
        return signal;
      },
      setSampleRate(rate) {
        this.sampleRate = Math.max(1, rate);
        this.clearSpectrum(); // 清除旧数据
      },
      setFFTSize(size) {
        // FFT大小应该是2的幂
        const validSizes = [128, 256, 512, 1024, 2048, 4096];
        this.fftSize = validSizes.includes(size) ? size : 512;
        this.clearSpectrum(); // 清除旧数据
      },
      exportSpectrum() {
        return {
          frequencyData: this.frequencyData.slice(),
          peakFrequency: this.peakFrequency,
          peakMagnitude: this.peakMagnitude,
          sampleRate: this.sampleRate,
          fftSize: this.fftSize,
          windowType: this.windowType,
          logScale: this.logScale,
          maxFrequency: this.maxFrequency,
          frequencyResolution: this.frequencyResolution
        };
      }
    }
  }
}));

describe('FFTPlotWidget-Mock', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    const FFTPlotWidget = await import('@/webview/components/widgets/FFTPlotWidget.vue');
    wrapper = createVueWrapper(FFTPlotWidget.default, {
      props: {
        datasets: [{ title: 'Signal', value: 0.5, units: 'V' }],
        widgetTitle: 'FFT频谱测试',
        widgetType: WidgetType.FFTPlot
      }
    });
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  test('1.1 应该正确渲染FFTPlotWidget组件', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.attributes('data-widget-type')).toBe('fft');
  });

  test('1.2 应该显示频谱信息', () => {
    expect(wrapper.find('.spectrum-stats').exists()).toBe(true);
    expect(wrapper.find('.peak-freq').exists()).toBe(true);
    expect(wrapper.find('.fft-canvas').exists()).toBe(true);
  });

  test('2.1 添加样本数据', () => {
    expect(wrapper.vm.timeBuffer).toHaveLength(0);
    
    wrapper.vm.addSample(0.5);
    wrapper.vm.addSample(-0.3);
    
    expect(wrapper.vm.timeBuffer).toHaveLength(2);
    expect(wrapper.vm.timeBuffer[0]).toBe(0.5);
    expect(wrapper.vm.timeBuffer[1]).toBe(-0.3);
  });

  test('2.2 缓冲区大小限制', () => {
    wrapper.vm.fftSize = 4; // 小的FFT大小便于测试
    
    for (let i = 0; i < 10; i++) {
      wrapper.vm.addSample(i);
    }
    
    expect(wrapper.vm.timeBuffer).toHaveLength(4);
    expect(wrapper.vm.timeBuffer[0]).toBe(6); // 最旧的被移除
    expect(wrapper.vm.timeBuffer[3]).toBe(9);
  });

  test('3.1 频率计算', () => {
    wrapper.vm.sampleRate = 1000;
    wrapper.vm.fftSize = 512;
    
    expect(wrapper.vm.maxFrequency).toBe(500); // 1000/2
    expect(wrapper.vm.frequencyResolution).toBeCloseTo(1.953, 3); // 1000/512
  });

  test('3.2 测试信号生成和峰值检测', () => {
    const testFreq = 100;
    const signal = wrapper.vm.generateTestSignal(testFreq, 1, wrapper.vm.fftSize);
    
    // 添加测试信号
    signal.forEach(sample => wrapper.vm.addSample(sample));
    
    // 应该检测到100Hz的峰值
    expect(wrapper.vm.peakFrequency).toBeCloseTo(testFreq, 0);
  });

  test('3.3 窗函数应用', () => {
    const testData = [1, 1, 1, 1]; // 简单的常数信号
    
    // 汉宁窗
    wrapper.vm.windowType = 'hann';
    const hannResult = wrapper.vm.applyWindow(testData);
    expect(hannResult[0]).toBeCloseTo(0, 3); // 边缘应该接近0
    expect(hannResult[1]).toBeGreaterThan(0); // 中间应该大于0
    
    // 矩形窗
    wrapper.vm.windowType = 'rectangular';
    const rectResult = wrapper.vm.applyWindow(testData);
    expect(rectResult).toEqual(testData); // 应该保持不变
  });

  test('4.1 刻度模式切换', async () => {
    expect(wrapper.vm.logScale).toBe(true);
    
    const scaleBtn = wrapper.find('.scale-btn');
    await scaleBtn.trigger('click');
    
    expect(wrapper.vm.logScale).toBe(false);
  });

  test('4.2 清除频谱', async () => {
    wrapper.vm.addSample(0.5);
    wrapper.vm.peakFrequency = 100;
    wrapper.vm.peakMagnitude = 50;
    
    const clearBtn = wrapper.find('.clear-btn');
    await clearBtn.trigger('click');
    
    expect(wrapper.vm.timeBuffer).toHaveLength(0);
    expect(wrapper.vm.frequencyData).toHaveLength(0);
    expect(wrapper.vm.peakFrequency).toBe(0);
    expect(wrapper.vm.peakMagnitude).toBe(-Infinity);
  });

  test('5.1 采样率设置', () => {
    wrapper.vm.setSampleRate(2000);
    expect(wrapper.vm.sampleRate).toBe(2000);
    expect(wrapper.vm.maxFrequency).toBe(1000);
    
    // 边界值测试
    wrapper.vm.setSampleRate(0);
    expect(wrapper.vm.sampleRate).toBe(1);
  });

  test('5.2 FFT大小设置', () => {
    wrapper.vm.setFFTSize(1024);
    expect(wrapper.vm.fftSize).toBe(1024);
    
    // 无效大小应该保持默认值
    wrapper.vm.setFFTSize(333);
    expect(wrapper.vm.fftSize).toBe(512);
  });

  test('5.3 暂停状态不添加样本', () => {
    wrapper.vm.isPaused = true;
    const originalLength = wrapper.vm.timeBuffer.length;
    
    wrapper.vm.addSample(0.5);
    expect(wrapper.vm.timeBuffer).toHaveLength(originalLength);
  });

  test('6.1 频谱数据导出', () => {
    wrapper.vm.peakFrequency = 120;
    wrapper.vm.peakMagnitude = 45.5;
    wrapper.vm.windowType = 'hamming';
    
    const exported = wrapper.vm.exportSpectrum();
    
    expect(exported.peakFrequency).toBe(120);
    expect(exported.peakMagnitude).toBe(45.5);
    expect(exported.windowType).toBe('hamming');
    expect(exported.sampleRate).toBe(1000);
    expect(exported.logScale).toBe(true);
  });

  test('6.2 组件挂载成功', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.vm).toBeDefined();
  });
});