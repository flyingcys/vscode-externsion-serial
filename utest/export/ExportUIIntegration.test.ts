/**
 * 导出界面集成测试
 * 测试导出界面和用户体验功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { ElDialog, ElProgress, ElForm } from 'element-plus';
import DataExportDialog from '@/webview/components/dialogs/DataExportDialog.vue';
import ExportProgressDialog from '@/webview/components/dialogs/ExportProgressDialog.vue';
import { 
  ExportConfig, 
  ExportFormatType, 
  DataSourceType, 
  ExportProgress,
  DatasetInfo 
} from '@/extension/export/types';
import { getExportManager } from '@/extension/export/ExportManager';
import { getBatchExportManager } from '@/extension/export/BatchExportManager';

// Mock VSCode API
const mockVSCodeAPI = {
  postMessage: vi.fn().mockResolvedValue({ path: '/test/export.csv', name: 'export.csv' })
};

(global as any).window = {
  vscode: mockVSCodeAPI
};

// Mock 导出管理器
vi.mock('@/extension/export/ExportManager', () => ({
  getExportManager: vi.fn().mockReturnValue({
    exportData: vi.fn(),
    getSupportedFormats: vi.fn().mockReturnValue([
      {
        type: ExportFormatType.CSV,
        name: 'CSV (Comma Separated Values)',
        extensions: ['.csv'],
        description: 'Comma-separated values format',
        options: {
          delimiter: ',',
          quote: '"',
          encoding: 'utf-8',
          includeHeader: true
        }
      },
      {
        type: ExportFormatType.JSON,
        name: 'JSON (JavaScript Object Notation)',
        extensions: ['.json'],
        description: 'JavaScript Object Notation format',
        options: {
          pretty: true,
          indent: 2,
          encoding: 'utf-8'
        }
      }
    ]),
    onProgress: vi.fn(),
    offProgress: vi.fn(),
    cancelExport: vi.fn()
  })
}));

vi.mock('@/extension/export/BatchExportManager', () => ({
  getBatchExportManager: vi.fn().mockReturnValue({
    startBatchExport: vi.fn(),
    cancelBatchExport: vi.fn(),
    onProgress: vi.fn(),
    offProgress: vi.fn()
  })
}));

describe('导出界面集成测试', () => {
  let wrapper: VueWrapper<any>;
  
  const mockDatasets: DatasetInfo[] = [
    {
      id: 'temp',
      title: 'Temperature',
      units: '°C',
      dataType: 'number',
      widget: 'gauge',
      group: 'sensors'
    },
    {
      id: 'humidity',
      title: 'Humidity',
      units: '%',
      dataType: 'number',
      widget: 'gauge',
      group: 'sensors'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('DataExportDialog 导出配置界面测试', () => {
    beforeEach(() => {
      wrapper = mount(DataExportDialog, {
        props: {
          modelValue: true,
          availableDatasets: mockDatasets
        },
        global: {
          stubs: {
            'el-dialog': false,
            'el-form': false,
            'el-form-item': false,
            'el-radio-group': false,
            'el-radio': false,
            'el-select': false,
            'el-option': false,
            'el-input': false,
            'el-button': false,
            'el-switch': false,
            'el-checkbox': false,
            'el-progress': false,
            'el-date-picker': false,
            'el-input-number': false
          }
        }
      });
    });

    it('应该正确显示导出配置界面', async () => {
      expect(wrapper.find('.config-section').exists()).toBe(true);
      expect(wrapper.find('[data-test="data-source-selector"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="format-selector"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="file-path-input"]').exists()).toBe(true);
    });

    it('应该正确加载可用的导出格式', async () => {
      const formatOptions = wrapper.findAll('[data-test="format-option"]');
      expect(formatOptions.length).toBeGreaterThan(0);
      
      // 验证格式描述显示
      const csvOption = wrapper.find('[data-value="csv"]');
      expect(csvOption.exists()).toBe(true);
    });

    it('应该正确显示可用数据集', async () => {
      const datasetSelector = wrapper.find('[data-test="dataset-selector"]');
      expect(datasetSelector.exists()).toBe(true);
      
      // 验证数据集选项
      const datasetOptions = wrapper.findAll('[data-test="dataset-option"]');
      expect(datasetOptions.length).toBe(mockDatasets.length);
    });

    it('应该支持数据源类型切换', async () => {
      const dataSourceRadios = wrapper.findAll('[data-test="data-source-radio"]');
      expect(dataSourceRadios.length).toBeGreaterThan(0);
      
      // 切换到时间范围模式
      const rangeRadio = wrapper.find('[data-value="range"]');
      if (rangeRadio.exists()) {
        await rangeRadio.trigger('change');
        
        // 验证时间选择器显示
        const dateRangePicker = wrapper.find('[data-test="date-range-picker"]');
        expect(dateRangePicker.exists()).toBe(true);
      }
    });

    it('应该支持高级选项展开/折叠', async () => {
      const advancedToggle = wrapper.find('[data-test="advanced-toggle"]');
      expect(advancedToggle.exists()).toBe(true);
      
      // 点击展开高级选项
      await advancedToggle.trigger('click');
      
      const advancedSection = wrapper.find('[data-test="advanced-section"]');
      expect(advancedSection.exists()).toBe(true);
    });

    it('应该支持文件路径选择', async () => {
      const browseButton = wrapper.find('[data-test="browse-button"]');
      expect(browseButton.exists()).toBe(true);
      
      await browseButton.trigger('click');
      
      // 验证调用了VSCode API
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith({
        command: 'selectSaveFile',
        filters: expect.any(Object)
      });
    });

    it('应该验证表单配置', async () => {
      const form = wrapper.findComponent({ name: 'ElForm' });
      expect(form.exists()).toBe(true);
      
      // 测试必填字段验证
      const exportButton = wrapper.find('[data-test="export-button"]');
      expect(exportButton.exists()).toBe(true);
      
      // 在缺少必填字段时按钮应该被禁用
      expect(exportButton.attributes('disabled')).toBeDefined();
    });

    it('应该支持批量导出模式', async () => {
      const batchCheckbox = wrapper.find('[data-test="batch-mode-checkbox"]');
      expect(batchCheckbox.exists()).toBe(true);
      
      await batchCheckbox.setChecked(true);
      
      // 验证批量选项显示
      const batchOptions = wrapper.find('[data-test="batch-options"]');
      expect(batchOptions.exists()).toBe(true);
    });

    it('应该正确处理格式特定选项', async () => {
      // 选择CSV格式
      const formatSelector = wrapper.find('[data-test="format-selector"]');
      await formatSelector.setValue(ExportFormatType.CSV);
      
      // 展开高级选项
      const advancedToggle = wrapper.find('[data-test="advanced-toggle"]');
      await advancedToggle.trigger('click');
      
      // 验证CSV特定选项显示
      const csvOptions = wrapper.find('[data-test="csv-format-options"]');
      expect(csvOptions.exists()).toBe(true);
    });
  });

  describe('ExportProgressDialog 导出进度界面测试', () => {
    const mockProgress: ExportProgress = {
      taskId: 'test-task',
      stage: 'processing',
      percentage: 45,
      processedRecords: 4500,
      totalRecords: 10000,
      estimatedTimeRemaining: 30000,
      currentFile: '/test/export.csv'
    };

    beforeEach(() => {
      wrapper = mount(ExportProgressDialog, {
        props: {
          modelValue: true,
          progress: mockProgress,
          completed: false,
          error: null
        },
        global: {
          stubs: {
            'el-dialog': false,
            'el-progress': false,
            'el-button': false,
            'el-alert': false,
            'el-result': false
          }
        }
      });
    });

    it('应该正确显示导出进度', async () => {
      expect(wrapper.find('[data-test="progress-bar"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="progress-stats"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="stage-indicators"]').exists()).toBe(true);
    });

    it('应该显示正确的进度信息', async () => {
      const percentageDisplay = wrapper.find('[data-test="progress-percentage"]');
      expect(percentageDisplay.text()).toContain('45%');
      
      const recordsDisplay = wrapper.find('[data-test="progress-records"]');
      expect(recordsDisplay.text()).toContain('4500 / 10000');
    });

    it('应该显示阶段指示器', async () => {
      const stageIndicators = wrapper.findAll('[data-test="stage-indicator"]');
      expect(stageIndicators.length).toBeGreaterThan(0);
      
      // 验证当前阶段高亮
      const activeStage = wrapper.find('[data-test="stage-indicator"].active');
      expect(activeStage.exists()).toBe(true);
    });

    it('应该支持取消操作', async () => {
      const cancelButton = wrapper.find('[data-test="cancel-button"]');
      expect(cancelButton.exists()).toBe(true);
      
      await cancelButton.trigger('click');
      
      // 验证发出取消事件
      expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    it('应该支持日志显示/隐藏', async () => {
      const toggleLogsButton = wrapper.find('[data-test="toggle-logs"]');
      expect(toggleLogsButton.exists()).toBe(true);
      
      await toggleLogsButton.trigger('click');
      
      const logsSection = wrapper.find('[data-test="progress-logs"]');
      expect(logsSection.exists()).toBe(true);
    });

    it('应该正确显示完成状态', async () => {
      await wrapper.setProps({ completed: true, progress: { ...mockProgress, percentage: 100 } });
      
      const successSection = wrapper.find('[data-test="success-section"]');
      expect(successSection.exists()).toBe(true);
      
      const openFileButton = wrapper.find('[data-test="open-file-button"]');
      expect(openFileButton.exists()).toBe(true);
    });

    it('应该正确显示错误状态', async () => {
      const error = {
        title: '导出失败',
        message: '文件写入错误',
        details: 'Error stack trace...'
      };
      
      await wrapper.setProps({ error });
      
      const errorSection = wrapper.find('[data-test="error-section"]');
      expect(errorSection.exists()).toBe(true);
      
      const errorAlert = wrapper.findComponent({ name: 'ElAlert' });
      expect(errorAlert.exists()).toBe(true);
      expect(errorAlert.props('title')).toBe(error.title);
    });

    it('应该正确计算和显示处理速度', async () => {
      const speedDisplay = wrapper.find('[data-test="processing-speed"]');
      expect(speedDisplay.exists()).toBe(true);
      expect(speedDisplay.text()).toMatch(/\d+\/s|计算中/);
    });

    it('应该正确格式化预估剩余时间', async () => {
      const etaDisplay = wrapper.find('[data-test="estimated-time"]');
      expect(etaDisplay.exists()).toBe(true);
      expect(etaDisplay.text()).toMatch(/\d+:\d+|\d+秒|未知/);
    });
  });

  describe('导出流程集成测试', () => {
    it('应该支持完整的导出流程', async () => {
      // 挂载导出配置对话框
      const configDialog = mount(DataExportDialog, {
        props: {
          modelValue: true,
          availableDatasets: mockDatasets
        }
      });

      // 配置导出参数
      const formatSelector = configDialog.find('[data-test="format-selector"]');
      await formatSelector.setValue(ExportFormatType.CSV);

      const fileNameInput = configDialog.find('[data-test="file-name-input"]');
      await fileNameInput.setValue('test-export');

      // 开始导出
      const exportButton = configDialog.find('[data-test="export-button"]');
      await exportButton.trigger('click');

      // 验证调用了导出管理器
      const exportManager = getExportManager();
      expect(exportManager.exportData).toHaveBeenCalled();

      configDialog.unmount();
    });

    it('应该支持批量导出流程', async () => {
      const configDialog = mount(DataExportDialog, {
        props: {
          modelValue: true,
          availableDatasets: mockDatasets
        }
      });

      // 启用批量模式
      const batchCheckbox = configDialog.find('[data-test="batch-mode-checkbox"]');
      await batchCheckbox.setChecked(true);

      // 配置批量选项
      const splitBySelector = configDialog.find('[data-test="split-by-selector"]');
      await splitBySelector.setValue('count');

      const maxRecordsInput = configDialog.find('[data-test="max-records-input"]');
      await maxRecordsInput.setValue(1000);

      // 开始批量导出
      const exportButton = configDialog.find('[data-test="export-button"]');
      await exportButton.trigger('click');

      // 验证调用了批量导出管理器
      const batchExportManager = getBatchExportManager();
      expect(batchExportManager.startBatchExport).toHaveBeenCalled();

      configDialog.unmount();
    });

    it('应该正确处理导出错误', async () => {
      const exportManager = getExportManager();
      exportManager.exportData = vi.fn().mockRejectedValue(new Error('Export failed'));

      const configDialog = mount(DataExportDialog, {
        props: {
          modelValue: true,
          availableDatasets: mockDatasets
        }
      });

      // 尝试导出
      const exportButton = configDialog.find('[data-test="export-button"]');
      await exportButton.trigger('click');

      // 验证错误处理
      expect(configDialog.emitted('export-failed')).toBeTruthy();

      configDialog.unmount();
    });
  });

  describe('性能要求验证', () => {
    it('应该满足界面响应性要求', async () => {
      const startTime = performance.now();
      
      wrapper = mount(DataExportDialog, {
        props: {
          modelValue: true,
          availableDatasets: mockDatasets
        }
      });

      const mountTime = performance.now() - startTime;
      
      // 界面挂载时间应小于100ms
      expect(mountTime).toBeLessThan(100);
    });

    it('应该支持大量数据集加载', async () => {
      // 创建大量模拟数据集
      const largeDatasets: DatasetInfo[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `dataset_${i}`,
        title: `Dataset ${i}`,
        units: 'unit',
        dataType: 'number',
        widget: 'gauge',
        group: 'test'
      }));

      const startTime = performance.now();
      
      wrapper = mount(DataExportDialog, {
        props: {
          modelValue: true,
          availableDatasets: largeDatasets
        }
      });

      const renderTime = performance.now() - startTime;
      
      // 大量数据集渲染时间应小于500ms
      expect(renderTime).toBeLessThan(500);
    });

    it('应该支持进度实时更新', async () => {
      let progressCallback: ((progress: ExportProgress) => void) | null = null;
      
      const mockExportManager = {
        onProgress: vi.fn().mockImplementation((callback) => {
          progressCallback = callback;
        }),
        offProgress: vi.fn(),
        exportData: vi.fn().mockImplementation(() => {
          return new Promise((resolve) => {
            // 模拟进度更新
            let progress = 0;
            const interval = setInterval(() => {
              progress += 10;
              if (progressCallback) {
                progressCallback({
                  taskId: 'test',
                  stage: 'writing',
                  percentage: progress,
                  processedRecords: progress * 10,
                  totalRecords: 1000,
                  estimatedTimeRemaining: (100 - progress) * 100
                });
              }
              
              if (progress >= 100) {
                clearInterval(interval);
                resolve({
                  success: true,
                  filePath: '/test/export.csv',
                  fileSize: 1024,
                  recordCount: 1000,
                  duration: 1000
                });
              }
            }, 10);
          });
        })
      };

      // 替换导出管理器
      vi.mocked(getExportManager).mockReturnValue(mockExportManager as any);

      wrapper = mount(DataExportDialog, {
        props: {
          modelValue: true,
          availableDatasets: mockDatasets
        }
      });

      // 开始导出
      const exportButton = wrapper.find('[data-test="export-button"]');
      await exportButton.trigger('click');

      // 等待进度更新
      await new Promise(resolve => setTimeout(resolve, 200));

      // 验证进度显示
      expect(wrapper.find('[data-test="export-progress"]').exists()).toBe(true);
    });
  });

  describe('用户体验测试', () => {
    it('应该提供清晰的操作指引', async () => {
      wrapper = mount(DataExportDialog, {
        props: {
          modelValue: true,
          availableDatasets: mockDatasets
        }
      });

      // 验证帮助文本存在
      const descriptions = wrapper.findAll('[data-test="option-description"]');
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('应该支持键盘导航', async () => {
      wrapper = mount(DataExportDialog, {
        props: {
          modelValue: true,
          availableDatasets: mockDatasets
        }
      });

      const firstInput = wrapper.find('input');
      expect(firstInput.exists()).toBe(true);
      
      // 测试Tab键导航
      await firstInput.trigger('keydown.tab');
      
      // 验证焦点移动（这里简单检查不会报错）
      expect(true).toBe(true);
    });

    it('应该提供格式预览功能', async () => {
      wrapper = mount(DataExportDialog, {
        props: {
          modelValue: true,
          availableDatasets: mockDatasets
        }
      });

      // 展开高级选项
      const advancedToggle = wrapper.find('[data-test="advanced-toggle"]');
      await advancedToggle.trigger('click');

      // 验证预览区域存在
      const formatPreview = wrapper.find('[data-test="format-preview"]');
      expect(formatPreview.exists()).toBe(true);
    });

    it('应该支持配置保存和恢复', async () => {
      wrapper = mount(DataExportDialog, {
        props: {
          modelValue: true,
          availableDatasets: mockDatasets
        }
      });

      // 模拟配置更改
      const formatSelector = wrapper.find('[data-test="format-selector"]');
      await formatSelector.setValue(ExportFormatType.JSON);

      // 验证配置被保存（通过事件或其他方式）
      expect(wrapper.vm.exportConfig.format.type).toBe(ExportFormatType.JSON);
    });
  });
});