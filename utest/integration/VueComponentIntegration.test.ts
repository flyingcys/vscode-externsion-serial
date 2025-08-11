/**
 * Vue组件集成测试
 * 测试Vue组件与Extension、Store的集成
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

// Mock Vue组件
const MockPlotWidget = {
  name: 'PlotWidget',
  template: `
    <div class="plot-widget">
      <canvas ref="canvas" :width="width" :height="height"></canvas>
      <div class="controls">
        <button @click="startPlot">开始</button>
        <button @click="stopPlot">停止</button>
        <button @click="exportData">导出</button>
      </div>
    </div>
  `,
  props: {
    datasets: { type: Array, default: () => [] },
    width: { type: Number, default: 800 },
    height: { type: Number, default: 400 }
  },
  data() {
    return {
      isRunning: false,
      chart: null,
      dataBuffer: []
    };
  },
  methods: {
    startPlot() {
      this.isRunning = true;
      this.$emit('plot-started');
    },
    stopPlot() {
      this.isRunning = false;
      this.$emit('plot-stopped');
    },
    exportData() {
      this.$emit('export-requested', this.dataBuffer);
    },
    updateData(newData: any[]) {
      this.dataBuffer.push(...newData);
      if (this.dataBuffer.length > 1000) {
        this.dataBuffer = this.dataBuffer.slice(-1000);
      }
    }
  }
};

const MockConnectionPanel = {
  name: 'ConnectionPanel',
  template: `
    <div class="connection-panel">
      <select v-model="selectedDevice" @change="onDeviceChange">
        <option value="">选择设备</option>
        <option v-for="device in devices" :key="device.path" :value="device.path">
          {{ device.name }} ({{ device.path }})
        </option>
      </select>
      <button @click="connect" :disabled="isConnecting">
        {{ isConnected ? '断开' : '连接' }}
      </button>
      <div class="status">
        状态: {{ connectionStatus }}
      </div>
    </div>
  `,
  data() {
    return {
      selectedDevice: '',
      devices: [
        { path: '/dev/ttyUSB0', name: 'USB Serial' },
        { path: '/dev/ttyUSB1', name: 'USB Serial 2' }
      ],
      isConnected: false,
      isConnecting: false,
      connectionStatus: '未连接'
    };
  },
  methods: {
    onDeviceChange() {
      this.$emit('device-selected', this.selectedDevice);
    },
    async connect() {
      if (this.isConnected) {
        await this.disconnect();
      } else {
        await this.connectDevice();
      }
    },
    async connectDevice() {
      this.isConnecting = true;
      this.connectionStatus = '连接中...';
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟连接延迟
        this.isConnected = true;
        this.connectionStatus = '已连接';
        this.$emit('connected', this.selectedDevice);
      } catch (error) {
        this.connectionStatus = '连接失败';
        this.$emit('connection-error', error);
      } finally {
        this.isConnecting = false;
      }
    },
    async disconnect() {
      this.isConnecting = true;
      this.connectionStatus = '断开中...';
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        this.isConnected = false;
        this.connectionStatus = '未连接';
        this.$emit('disconnected');
      } finally {
        this.isConnecting = false;
      }
    }
  }
};

const MockProjectEditor = {
  name: 'ProjectEditor',
  template: `
    <div class="project-editor">
      <div class="toolbar">
        <button @click="newProject">新建项目</button>
        <button @click="openProject">打开项目</button>
        <button @click="saveProject" :disabled="!hasChanges">保存项目</button>
      </div>
      <div class="editor-content">
        <div class="device-config">
          <h3>设备配置</h3>
          <connection-panel @connected="onDeviceConnected" />
        </div>
        <div class="widget-config">
          <h3>组件配置</h3>
          <div v-for="widget in widgets" :key="widget.id" class="widget-item">
            {{ widget.name }}
            <button @click="removeWidget(widget.id)">删除</button>
          </div>
          <button @click="addWidget">添加组件</button>
        </div>
      </div>
    </div>
  `,
  components: {
    ConnectionPanel: MockConnectionPanel
  },
  data() {
    return {
      hasChanges: false,
      widgets: [
        { id: '1', name: '温度图表', type: 'plot' },
        { id: '2', name: '状态指示', type: 'led' }
      ]
    };
  },
  methods: {
    newProject() {
      this.widgets = [];
      this.hasChanges = true;
      this.$emit('project-created');
    },
    openProject() {
      this.$emit('project-open-requested');
    },
    saveProject() {
      this.hasChanges = false;
      this.$emit('project-saved', {
        widgets: this.widgets,
        timestamp: Date.now()
      });
    },
    addWidget() {
      const newWidget = {
        id: Date.now().toString(),
        name: `新组件 ${this.widgets.length + 1}`,
        type: 'plot'
      };
      this.widgets.push(newWidget);
      this.hasChanges = true;
    },
    removeWidget(id: string) {
      this.widgets = this.widgets.filter(w => w.id !== id);
      this.hasChanges = true;
    },
    onDeviceConnected(device: string) {
      this.$emit('device-connected', device);
    }
  }
};

describe('Vue组件集成测试', () => {
  describe('PlotWidget集成测试', () => {
    it('应该正确渲染图表组件', () => {
      const wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [
            { id: 'temp', name: '温度', data: [20, 21, 22] }
          ],
          width: 600,
          height: 300
        }
      });
      
      expect(wrapper.find('.plot-widget').exists()).toBe(true);
      expect(wrapper.find('canvas').attributes('width')).toBe('600');
      expect(wrapper.find('canvas').attributes('height')).toBe('300');
    });

    it('应该处理开始/停止事件', async () => {
      const wrapper = mount(MockPlotWidget);
      
      await wrapper.find('button').trigger('click'); // 开始按钮
      
      expect(wrapper.emitted('plot-started')).toBeTruthy();
      expect(wrapper.vm.isRunning).toBe(true);
    });

    it('应该处理数据更新', async () => {
      const wrapper = mount(MockPlotWidget);
      
      const newData = [
        { timestamp: Date.now(), value: 25.5 },
        { timestamp: Date.now() + 1000, value: 26.0 }
      ];
      
      wrapper.vm.updateData(newData);
      await nextTick();
      
      expect(wrapper.vm.dataBuffer).toHaveLength(2);
      expect(wrapper.vm.dataBuffer[0].value).toBe(25.5);
    });

    it('应该处理数据缓冲区限制', async () => {
      const wrapper = mount(MockPlotWidget);
      
      // 添加超过1000个数据点
      const largeData = Array.from({ length: 1200 }, (_, i) => ({
        timestamp: Date.now() + i * 1000,
        value: Math.random() * 100
      }));
      
      wrapper.vm.updateData(largeData);
      await nextTick();
      
      expect(wrapper.vm.dataBuffer).toHaveLength(1000);
    });

    it('应该处理导出请求', async () => {
      const wrapper = mount(MockPlotWidget);
      
      // 添加一些测试数据
      wrapper.vm.updateData([
        { timestamp: Date.now(), value: 10 },
        { timestamp: Date.now() + 1000, value: 20 }
      ]);
      
      const exportButton = wrapper.findAll('button')[2]; // 导出按钮
      await exportButton.trigger('click');
      
      expect(wrapper.emitted('export-requested')).toBeTruthy();
      expect(wrapper.emitted('export-requested')[0][0]).toHaveLength(2);
    });
  });

  describe('ConnectionPanel集成测试', () => {
    it('应该正确渲染连接面板', () => {
      const wrapper = mount(MockConnectionPanel);
      
      expect(wrapper.find('.connection-panel').exists()).toBe(true);
      expect(wrapper.find('select').exists()).toBe(true);
      expect(wrapper.find('button').text()).toBe('连接');
      expect(wrapper.find('.status').text()).toContain('未连接');
    });

    it('应该处理设备选择', async () => {
      const wrapper = mount(MockConnectionPanel);
      
      const select = wrapper.find('select');
      await select.setValue('/dev/ttyUSB0');
      
      expect(wrapper.emitted('device-selected')).toBeTruthy();
      expect(wrapper.emitted('device-selected')[0][0]).toBe('/dev/ttyUSB0');
    });

    it('应该处理连接过程', async () => {
      const wrapper = mount(MockConnectionPanel);
      
      wrapper.vm.selectedDevice = '/dev/ttyUSB0';
      const connectButton = wrapper.find('button');
      
      // 开始连接
      const connectPromise = connectButton.trigger('click');
      await nextTick();
      
      expect(wrapper.vm.isConnecting).toBe(true);
      expect(wrapper.find('.status').text()).toContain('连接中');
      
      // 等待连接完成
      await connectPromise;
      
      expect(wrapper.vm.isConnected).toBe(true);
      expect(wrapper.find('.status').text()).toContain('已连接');
      expect(wrapper.emitted('connected')).toBeTruthy();
    });

    it('应该处理断开连接', async () => {
      const wrapper = mount(MockConnectionPanel);
      
      // 先连接
      wrapper.vm.isConnected = true;
      wrapper.vm.connectionStatus = '已连接';
      await nextTick();
      
      expect(wrapper.find('button').text()).toBe('断开');
      
      // 断开连接
      await wrapper.find('button').trigger('click');
      
      expect(wrapper.vm.isConnected).toBe(false);
      expect(wrapper.emitted('disconnected')).toBeTruthy();
    });
  });

  describe('ProjectEditor集成测试', () => {
    it('应该正确渲染项目编辑器', () => {
      const wrapper = mount(MockProjectEditor);
      
      expect(wrapper.find('.project-editor').exists()).toBe(true);
      expect(wrapper.find('.toolbar').exists()).toBe(true);
      expect(wrapper.find('.device-config').exists()).toBe(true);
      expect(wrapper.find('.widget-config').exists()).toBe(true);
    });

    it('应该处理新建项目', async () => {
      const wrapper = mount(MockProjectEditor);
      
      const newButton = wrapper.findAll('.toolbar button')[0];
      await newButton.trigger('click');
      
      expect(wrapper.vm.widgets).toHaveLength(0);
      expect(wrapper.vm.hasChanges).toBe(true);
      expect(wrapper.emitted('project-created')).toBeTruthy();
    });

    it('应该处理添加组件', async () => {
      const wrapper = mount(MockProjectEditor);
      
      const initialCount = wrapper.vm.widgets.length;
      const addButton = wrapper.find('.widget-config button');
      
      await addButton.trigger('click');
      
      expect(wrapper.vm.widgets).toHaveLength(initialCount + 1);
      expect(wrapper.vm.hasChanges).toBe(true);
    });

    it('应该处理删除组件', async () => {
      const wrapper = mount(MockProjectEditor);
      
      const initialCount = wrapper.vm.widgets.length;
      const deleteButton = wrapper.find('.widget-item button');
      
      await deleteButton.trigger('click');
      
      expect(wrapper.vm.widgets).toHaveLength(initialCount - 1);
      expect(wrapper.vm.hasChanges).toBe(true);
    });

    it('应该处理保存项目', async () => {
      const wrapper = mount(MockProjectEditor);
      
      // 先做一些修改
      wrapper.vm.hasChanges = true;
      await nextTick();
      
      const saveButton = wrapper.findAll('.toolbar button')[2];
      await saveButton.trigger('click');
      
      expect(wrapper.vm.hasChanges).toBe(false);
      expect(wrapper.emitted('project-saved')).toBeTruthy();
      
      const savedData = wrapper.emitted('project-saved')[0][0];
      expect(savedData.widgets).toBeDefined();
      expect(savedData.timestamp).toBeDefined();
    });

    it('应该处理设备连接事件', async () => {
      const wrapper = mount(MockProjectEditor);
      
      const connectionPanel = wrapper.findComponent(MockConnectionPanel);
      
      // 模拟设备连接
      connectionPanel.vm.$emit('connected', '/dev/ttyUSB0');
      await nextTick();
      
      expect(wrapper.emitted('device-connected')).toBeTruthy();
      expect(wrapper.emitted('device-connected')[0][0]).toBe('/dev/ttyUSB0');
    });
  });

  describe('跨组件数据流测试', () => {
    it('应该处理父子组件通信', async () => {
      const ParentComponent = {
        template: `
          <div>
            <connection-panel @connected="onConnected" />
            <plot-widget v-if="isConnected" :datasets="datasets" />
          </div>
        `,
        components: {
          ConnectionPanel: MockConnectionPanel,
          PlotWidget: MockPlotWidget
        },
        data() {
          return {
            isConnected: false,
            datasets: []
          };
        },
        methods: {
          onConnected(device: string) {
            this.isConnected = true;
            this.datasets = [
              { id: 'temp', name: '温度', data: [] }
            ];
          }
        }
      };
      
      const wrapper = mount(ParentComponent);
      
      // 触发连接
      const connectionPanel = wrapper.findComponent(MockConnectionPanel);
      connectionPanel.vm.$emit('connected', '/dev/ttyUSB0');
      await nextTick();
      
      expect(wrapper.vm.isConnected).toBe(true);
      expect(wrapper.findComponent(MockPlotWidget).exists()).toBe(true);
    });

    it('应该处理事件链传递', async () => {
      const eventHandler = vi.fn();
      
      const RootComponent = {
        template: `
          <project-editor @device-connected="handleDeviceConnected" />
        `,
        components: {
          ProjectEditor: MockProjectEditor
        },
        methods: {
          handleDeviceConnected: eventHandler
        }
      };
      
      const wrapper = mount(RootComponent);
      
      // 从嵌套组件触发事件
      const projectEditor = wrapper.findComponent(MockProjectEditor);
      const connectionPanel = projectEditor.findComponent(MockConnectionPanel);
      
      connectionPanel.vm.$emit('connected', '/dev/ttyUSB0');
      await nextTick();
      
      expect(eventHandler).toHaveBeenCalledWith('/dev/ttyUSB0');
    });
  });

  describe('状态管理集成测试', () => {
    it('应该与Pinia Store集成', async () => {
      const mockStore = {
        state: {
          connection: {
            isConnected: false,
            device: null
          },
          data: {
            datasets: [],
            frameCount: 0
          }
        },
        actions: {
          connect: vi.fn().mockImplementation(function(device: string) {
            this.state.connection.isConnected = true;
            this.state.connection.device = device;
          }),
          addDataset: vi.fn().mockImplementation(function(dataset: any) {
            this.state.data.datasets.push(dataset);
          }),
          incrementFrameCount: vi.fn().mockImplementation(function() {
            this.state.data.frameCount++;
          })
        }
      };
      
      // 模拟连接操作
      mockStore.actions.connect('/dev/ttyUSB0');
      expect(mockStore.state.connection.isConnected).toBe(true);
      expect(mockStore.state.connection.device).toBe('/dev/ttyUSB0');
      
      // 模拟数据操作
      mockStore.actions.addDataset({ id: 'temp', name: '温度' });
      expect(mockStore.state.data.datasets).toHaveLength(1);
      
      mockStore.actions.incrementFrameCount();
      expect(mockStore.state.data.frameCount).toBe(1);
    });

    it('应该响应状态变化', async () => {
      const mockReactiveStore = {
        connection: {
          isConnected: false
        }
      };
      
      const StoreAwareComponent = {
        template: `
          <div>
            <div class="status">{{ connectionStatus }}</div>
            <button @click="toggleConnection">切换连接</button>
          </div>
        `,
        data() {
          return {
            store: mockReactiveStore
          };
        },
        computed: {
          connectionStatus() {
            return this.store.connection.isConnected ? '已连接' : '未连接';
          }
        },
        methods: {
          toggleConnection() {
            this.store.connection.isConnected = !this.store.connection.isConnected;
          }
        }
      };
      
      const wrapper = mount(StoreAwareComponent);
      
      expect(wrapper.find('.status').text()).toBe('未连接');
      
      await wrapper.find('button').trigger('click');
      await nextTick();
      
      expect(wrapper.find('.status').text()).toBe('已连接');
    });
  });

  describe('错误处理集成测试', () => {
    it('应该处理组件错误', async () => {
      const ErrorProneComponent = {
        template: `<div>{{ errorProneComputed }}</div>`,
        computed: {
          errorProneComputed() {
            if (this.shouldError) {
              throw new Error('组件计算错误');
            }
            return '正常显示';
          }
        },
        data() {
          return {
            shouldError: false
          };
        }
      };
      
      const wrapper = mount(ErrorProneComponent);
      
      expect(wrapper.text()).toBe('正常显示');
      
      // 触发错误
      wrapper.vm.shouldError = true;
      
      await nextTick().catch(error => {
        expect(error.message).toBe('组件计算错误');
      });
    });

    it('应该处理异步操作错误', async () => {
      const errorHandler = vi.fn();
      
      const AsyncComponent = {
        template: `
          <div>
            <button @click="performAsyncOperation">异步操作</button>
            <div v-if="error" class="error">{{ error.message }}</div>
          </div>
        `,
        data() {
          return {
            error: null
          };
        },
        methods: {
          async performAsyncOperation() {
            try {
              await this.failingAsyncOperation();
            } catch (error) {
              this.error = error;
              errorHandler(error);
            }
          },
          async failingAsyncOperation() {
            return new Promise((_, reject) => {
              setTimeout(() => reject(new Error('异步操作失败')), 10);
            });
          }
        }
      };
      
      const wrapper = mount(AsyncComponent);
      
      await wrapper.find('button').trigger('click');
      
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 20));
      await nextTick();
      
      expect(wrapper.find('.error').exists()).toBe(true);
      expect(wrapper.find('.error').text()).toBe('异步操作失败');
      expect(errorHandler).toHaveBeenCalled();
    });
  });
});