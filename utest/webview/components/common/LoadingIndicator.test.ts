/**
 * LoadingIndicator.vue 测试
 * 目标：100% 覆盖率，完整测试加载指示器功能
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { ElIcon, ElProgress, ElSkeleton, ElSkeletonItem, ElButton } from 'element-plus';
import LoadingIndicator from '../../../../src/webview/components/common/LoadingIndicator.vue';
import { LoadingType, LoadingStatus, globalLoadingManager } from '../../../../src/shared/LoadingStateManager';

// Mock useI18n composable
vi.mock('../../../../src/webview/composables/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'loading.cancel': '取消',
        'loading.viewHistory': '查看历史',
        'loading.subProgress': '子进度'
      };
      return translations[key] || key;
    }
  })
}));

// Mock LoadingStateManager
vi.mock('../../../../src/shared/LoadingStateManager', () => {
  const mockLoadingManager = {
    getTask: vi.fn(),
    cancelTask: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  };

  return {
    LoadingType: {
      SPINNER: 'spinner',
      PROGRESS: 'progress',
      SKELETON: 'skeleton',
      DOTS: 'dots',
      PULSE: 'pulse',
      WAVE: 'wave'
    },
    LoadingStatus: {
      LOADING: 'loading',
      COMPLETED: 'completed',
      FAILED: 'failed',
      CANCELLED: 'cancelled'
    },
    globalLoadingManager: mockLoadingManager
  };
});

describe('LoadingIndicator 测试', () => {
  let wrapper: VueWrapper<any>;

  const defaultProps = {
    type: LoadingType.SPINNER,
    title: 'Loading...',
    showText: true
  };

  const createWrapper = (props = {}) => {
    return mount(LoadingIndicator, {
      props: { ...defaultProps, ...props },
      global: {
        components: {
          ElIcon,
          ElProgress,
          ElSkeleton,
          ElSkeletonItem,
          ElButton
        },
        stubs: {
          'el-icon': { template: '<i class="el-icon"><slot /></i>' },
          'el-progress': { 
            template: '<div class="el-progress" :percentage="percentage"></div>',
            props: ['percentage', 'strokeWidth', 'showText', 'color']
          },
          'el-skeleton': { 
            template: '<div class="el-skeleton"><slot name="template" /></div>',
            props: ['loading', 'rows', 'animated']
          },
          'el-skeleton-item': { 
            template: '<div class="el-skeleton-item"></div>',
            props: ['variant', 'style']
          },
          'el-button': { 
            template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
            props: ['type', 'size']
          }
        }
      }
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    test('应该正确渲染基本结构', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.loading-indicator').exists()).toBe(true);
      expect(wrapper.classes()).toContain('loading-indicator--spinner');
      expect(wrapper.classes()).toContain('loading-indicator--medium');
      expect(wrapper.classes()).toContain('loading-indicator--auto');
    });

    test('应该应用正确的CSS类', () => {
      wrapper = createWrapper({
        type: LoadingType.PROGRESS,
        size: 'large',
        theme: 'dark',
        overlay: true,
        fullscreen: true,
        cancellable: true
      });
      
      const classes = wrapper.classes();
      expect(classes).toContain('loading-indicator--progress');
      expect(classes).toContain('loading-indicator--large');
      expect(classes).toContain('loading-indicator--dark');
      expect(classes).toContain('loading-indicator--overlay');
      expect(classes).toContain('loading-indicator--fullscreen');
      expect(classes).toContain('loading-indicator--cancellable');
    });

    test('应该根据文本内容添加相应类', () => {
      wrapper = createWrapper({
        showText: true,
        title: 'Loading...'
      });
      
      expect(wrapper.classes()).toContain('loading-indicator--with-text');
    });
  });

  describe('旋转加载器', () => {
    test('应该渲染旋转加载器', () => {
      wrapper = createWrapper({
        type: LoadingType.SPINNER,
        title: 'Loading...',
        description: 'Please wait'
      });
      
      expect(wrapper.find('.loading-spinner').exists()).toBe(true);
      expect(wrapper.find('.spinner-icon').exists()).toBe(true);
      expect(wrapper.find('.loading-title').text()).toBe('Loading...');
      expect(wrapper.find('.loading-description').text()).toBe('Please wait');
    });

    test('应该使用正确的图标尺寸', () => {
      const testCases = [
        { size: 'small', expectedSize: 20 },
        { size: 'medium', expectedSize: 32 },
        { size: 'large', expectedSize: 48 }
      ];

      testCases.forEach(({ size, expectedSize }) => {
        wrapper = createWrapper({
          type: LoadingType.SPINNER,
          size: size as any
        });
        
        expect(wrapper.vm.iconSize).toBe(expectedSize);
      });
    });

    test('应该使用自定义颜色', () => {
      wrapper = createWrapper({
        type: LoadingType.SPINNER,
        customColor: '#ff0000'
      });
      
      expect(wrapper.vm.themeColor).toBe('#ff0000');
    });

    test('应该使用默认颜色', () => {
      wrapper = createWrapper({
        type: LoadingType.SPINNER
      });
      
      expect(wrapper.vm.themeColor).toBe('var(--el-color-primary)');
    });
  });

  describe('进度条', () => {
    test('应该渲染进度条', () => {
      wrapper = createWrapper({
        type: LoadingType.PROGRESS,
        title: 'Downloading',
        progress: 65,
        description: '正在下载文件...'
      });
      
      expect(wrapper.find('.loading-progress').exists()).toBe(true);
      expect(wrapper.find('.progress-header').exists()).toBe(true);
      expect(wrapper.find('.progress-title').text()).toBe('Downloading');
      expect(wrapper.find('.progress-percentage').text()).toBe('65%');
      expect(wrapper.find('.progress-description').text()).toBe('正在下载文件...');
    });

    test('应该显示子进度', () => {
      wrapper = createWrapper({
        type: LoadingType.PROGRESS,
        subProgress: {
          current: 3,
          total: 10,
          label: 'Processing files'
        }
      });
      
      expect(wrapper.find('.sub-progress').exists()).toBe(true);
      expect(wrapper.find('.sub-progress-text').text()).toContain('Processing files');
      expect(wrapper.find('.sub-progress-text').text()).toContain('3/10');
    });

    test('应该使用默认子进度标签', () => {
      wrapper = createWrapper({
        type: LoadingType.PROGRESS,
        subProgress: {
          current: 5,
          total: 20
        }
      });
      
      expect(wrapper.find('.sub-progress-text').text()).toContain('子进度');
    });

    test('应该计算正确的百分比', () => {
      wrapper = createWrapper({
        type: LoadingType.PROGRESS,
        progress: 73.456
      });
      
      expect(wrapper.find('.progress-percentage').text()).toBe('73%');
    });

    test('应该使用自定义进度条颜色', () => {
      wrapper = createWrapper({
        type: LoadingType.PROGRESS,
        customColor: '#00ff00'
      });
      
      expect(wrapper.vm.progressColors).toBe('#00ff00');
    });

    test('应该使用默认进度条颜色', () => {
      wrapper = createWrapper({
        type: LoadingType.PROGRESS
      });
      
      const colors = wrapper.vm.progressColors;
      expect(Array.isArray(colors)).toBe(true);
      expect(colors).toHaveLength(5);
    });
  });

  describe('骨架屏', () => {
    test('应该渲染骨架屏', () => {
      wrapper = createWrapper({
        type: LoadingType.SKELETON,
        skeletonRows: 5,
        skeletonAvatar: true
      });
      
      expect(wrapper.find('.loading-skeleton').exists()).toBe(true);
      expect(wrapper.find('.el-skeleton').exists()).toBe(true);
    });

    test('应该生成不同宽度的骨架线条', () => {
      wrapper = createWrapper({
        type: LoadingType.SKELETON
      });
      
      const widths = ['90%', '75%', '85%', '60%', '80%'];
      
      widths.forEach((width, index) => {
        const result = wrapper.vm.getSkeletonLineWidth(index + 1);
        expect(result).toBe(width);
      });
      
      // 测试循环
      expect(wrapper.vm.getSkeletonLineWidth(6)).toBe('90%');
    });
  });

  describe('点动画', () => {
    test('应该渲染点动画', () => {
      wrapper = createWrapper({
        type: LoadingType.DOTS,
        title: 'Processing...',
        description: 'Please wait'
      });
      
      expect(wrapper.find('.loading-dots').exists()).toBe(true);
      expect(wrapper.find('.dots-container').exists()).toBe(true);
      expect(wrapper.findAll('.dot')).toHaveLength(3);
      expect(wrapper.find('.loading-title').text()).toBe('Processing...');
      expect(wrapper.find('.loading-description').text()).toBe('Please wait');
    });
  });

  describe('脉冲效果', () => {
    test('应该渲染脉冲效果', () => {
      wrapper = createWrapper({
        type: LoadingType.PULSE,
        title: 'Connecting...'
      });
      
      expect(wrapper.find('.loading-pulse').exists()).toBe(true);
      expect(wrapper.find('.pulse-container').exists()).toBe(true);
      expect(wrapper.find('.pulse-circle').exists()).toBe(true);
      expect(wrapper.find('.pulse-circle-inner').exists()).toBe(true);
      expect(wrapper.find('.loading-title').text()).toBe('Connecting...');
    });
  });

  describe('波浪效果', () => {
    test('应该渲染波浪效果', () => {
      wrapper = createWrapper({
        type: LoadingType.WAVE,
        title: 'Analyzing...'
      });
      
      expect(wrapper.find('.loading-wave').exists()).toBe(true);
      expect(wrapper.find('.wave-container').exists()).toBe(true);
      expect(wrapper.findAll('.wave-bar')).toHaveLength(5);
      expect(wrapper.find('.loading-title').text()).toBe('Analyzing...');
    });
  });

  describe('取消功能', () => {
    test('应该显示取消按钮', () => {
      wrapper = createWrapper({
        cancellable: true
      });
      
      expect(wrapper.find('.loading-actions').exists()).toBe(true);
      expect(wrapper.find('.el-button').text()).toBe('取消');
    });

    test('应该触发取消事件', async () => {
      wrapper = createWrapper({
        cancellable: true,
        taskId: 'test-task'
      });
      
      await wrapper.vm.handleCancel();
      
      expect(globalLoadingManager.cancelTask).toHaveBeenCalledWith('test-task');
      expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    test('应该在没有任务ID时仅触发事件', async () => {
      wrapper = createWrapper({
        cancellable: true
      });
      
      await wrapper.vm.handleCancel();
      
      expect(globalLoadingManager.cancelTask).not.toHaveBeenCalled();
      expect(wrapper.emitted('cancel')).toBeTruthy();
    });
  });

  describe('历史功能', () => {
    test('应该显示历史按钮', () => {
      wrapper = createWrapper({
        showHistory: true
      });
      
      const buttons = wrapper.findAll('.el-button');
      expect(buttons.some(btn => btn.text().includes('查看历史'))).toBe(true);
    });

    test('应该触发历史事件', async () => {
      wrapper = createWrapper({
        showHistory: true
      });
      
      await wrapper.vm.showLoadingHistory();
      
      expect(wrapper.emitted('showHistory')).toBeTruthy();
    });
  });

  describe('任务监听', () => {
    test('应该设置任务监听器', () => {
      const mockTask = {
        id: 'test-task',
        status: LoadingStatus.LOADING,
        progress: 50
      };
      
      globalLoadingManager.getTask.mockReturnValue(mockTask);
      
      wrapper = createWrapper({
        taskId: 'test-task'
      });
      
      expect(globalLoadingManager.getTask).toHaveBeenCalledWith('test-task');
      expect(globalLoadingManager.on).toHaveBeenCalledWith('task:progress', expect.any(Function));
      expect(globalLoadingManager.on).toHaveBeenCalledWith('task:completed', expect.any(Function));
      expect(globalLoadingManager.on).toHaveBeenCalledWith('task:failed', expect.any(Function));
      expect(globalLoadingManager.on).toHaveBeenCalledWith('task:cancelled', expect.any(Function));
    });

    test('应该在任务ID变化时重新设置监听器', async () => {
      wrapper = createWrapper({
        taskId: 'task-1'
      });
      
      await wrapper.setProps({ taskId: 'task-2' });
      
      expect(globalLoadingManager.off).toHaveBeenCalled();
      expect(globalLoadingManager.getTask).toHaveBeenCalledWith('task-2');
    });

    test('应该在卸载时清理监听器', () => {
      wrapper = createWrapper({
        taskId: 'test-task'
      });
      
      wrapper.unmount();
      
      expect(globalLoadingManager.off).toHaveBeenCalled();
    });
  });

  describe('样式变体', () => {
    test('应该应用小尺寸样式', () => {
      wrapper = createWrapper({
        size: 'small'
      });
      
      expect(wrapper.classes()).toContain('loading-indicator--small');
    });

    test('应该应用大尺寸样式', () => {
      wrapper = createWrapper({
        size: 'large'
      });
      
      expect(wrapper.classes()).toContain('loading-indicator--large');
    });

    test('应该应用深色主题样式', () => {
      wrapper = createWrapper({
        theme: 'dark'
      });
      
      expect(wrapper.classes()).toContain('loading-indicator--dark');
    });

    test('应该应用覆盖层样式', () => {
      wrapper = createWrapper({
        overlay: true
      });
      
      expect(wrapper.classes()).toContain('loading-indicator--overlay');
    });

    test('应该应用全屏样式', () => {
      wrapper = createWrapper({
        fullscreen: true
      });
      
      expect(wrapper.classes()).toContain('loading-indicator--fullscreen');
    });
  });

  describe('响应式属性', () => {
    test('应该暴露当前任务', () => {
      const mockTask = {
        id: 'test-task',
        status: LoadingStatus.LOADING
      };
      
      wrapper = createWrapper({
        taskId: 'test-task'
      });
      
      wrapper.vm.currentTask = mockTask;
      
      // 通过 defineExpose 暴露的属性
      expect(wrapper.vm.currentTask).toEqual(mockTask);
    });

    test('应该暴露加载状态', () => {
      const mockTask = {
        id: 'test-task',
        status: LoadingStatus.LOADING
      };
      
      wrapper = createWrapper({
        taskId: 'test-task'
      });
      
      wrapper.vm.currentTask = mockTask;
      
      expect(wrapper.vm.isLoading).toBe(true);
    });

    test('应该暴露可取消状态', () => {
      const mockTask = {
        id: 'test-task',
        cancellable: true
      };
      
      wrapper = createWrapper({
        taskId: 'test-task',
        cancellable: false
      });
      
      wrapper.vm.currentTask = mockTask;
      
      expect(wrapper.vm.canCancel).toBe(true);
    });

    test('应该使用组件的可取消属性', () => {
      wrapper = createWrapper({
        cancellable: true
      });
      
      wrapper.vm.currentTask = null;
      
      expect(wrapper.vm.canCancel).toBe(true);
    });
  });

  describe('文本显示控制', () => {
    test('应该隐藏文本', () => {
      wrapper = createWrapper({
        type: LoadingType.SPINNER,
        showText: false,
        title: 'Loading...'
      });
      
      expect(wrapper.find('.loading-text').exists()).toBe(false);
    });

    test('应该显示文本但没有标题时不显示', () => {
      wrapper = createWrapper({
        type: LoadingType.SPINNER,
        showText: true,
        title: '',
        description: ''
      });
      
      expect(wrapper.find('.loading-text').exists()).toBe(false);
    });

    test('应该显示仅描述文本', () => {
      wrapper = createWrapper({
        type: LoadingType.SPINNER,
        showText: true,
        title: '',
        description: 'Only description'
      });
      
      expect(wrapper.find('.loading-text').exists()).toBe(true);
      expect(wrapper.find('.loading-description').text()).toBe('Only description');
    });
  });

  describe('默认值', () => {
    test('应该使用默认属性值', () => {
      wrapper = mount(LoadingIndicator, {
        global: {
          stubs: {
            'el-icon': { template: '<i><slot /></i>' }
          }
        }
      });
      
      expect(wrapper.vm.type).toBe(LoadingType.SPINNER);
      expect(wrapper.vm.size).toBe('medium');
      expect(wrapper.vm.theme).toBe('auto');
      expect(wrapper.vm.showText).toBe(true);
      expect(wrapper.vm.cancellable).toBe(false);
      expect(wrapper.vm.showHistory).toBe(false);
      expect(wrapper.vm.overlay).toBe(false);
      expect(wrapper.vm.fullscreen).toBe(false);
      expect(wrapper.vm.skeletonRows).toBe(3);
      expect(wrapper.vm.skeletonAvatar).toBe(false);
      expect(wrapper.vm.strokeWidth).toBe(8);
    });
  });

  describe('边界条件', () => {
    test('应该处理负进度值', () => {
      wrapper = createWrapper({
        type: LoadingType.PROGRESS,
        progress: -10
      });
      
      expect(wrapper.find('.progress-percentage').text()).toBe('-10%');
    });

    test('应该处理超过100的进度值', () => {
      wrapper = createWrapper({
        type: LoadingType.PROGRESS,
        progress: 150
      });
      
      expect(wrapper.find('.progress-percentage').text()).toBe('150%');
    });

    test('应该处理 undefined 进度值', () => {
      wrapper = createWrapper({
        type: LoadingType.PROGRESS,
        progress: undefined
      });
      
      expect(wrapper.find('.progress-percentage').text()).toBe('0%');
    });

    test('应该处理空的子进度', () => {
      wrapper = createWrapper({
        type: LoadingType.PROGRESS,
        subProgress: {
          current: 0,
          total: 0
        }
      });
      
      expect(wrapper.find('.sub-progress-text').text()).toContain('0/0');
    });

    test('应该处理没有任务ID的情况', () => {
      wrapper = createWrapper();
      
      expect(globalLoadingManager.getTask).not.toHaveBeenCalled();
    });
  });
});