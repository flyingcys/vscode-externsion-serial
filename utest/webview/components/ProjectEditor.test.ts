/**
 * ProjectEditor.vue 测试
 * 目标：100% 覆盖率，完整测试项目编辑器功能
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { ElButton, ElButtonGroup, ElDialog } from 'element-plus';
import ProjectEditor from '../../../src/webview/components/ProjectEditor.vue';
import { ProjectViewType } from '../../../src/extension/types/ProjectTypes';

// Mock the project store
const mockProjectStore = {
  title: 'Test Project',
  fileName: 'test.json',
  modified: false,
  groupCount: 2,
  datasetCount: 5,
  currentProject: {
    groups: [
      {
        title: 'Group 1',
        datasets: [
          { title: 'Dataset 1' },
          { title: 'Dataset 2' }
        ]
      },
      {
        title: 'Group 2',
        datasets: [
          { title: 'Dataset 3' }
        ]
      }
    ],
    actions: [
      { title: 'Action 1' },
      { title: 'Action 2' }
    ],
    frameParser: 'function parseFrame(data) { return data; }'
  },
  createNewProject: vi.fn().mockResolvedValue(undefined),
  openProject: vi.fn().mockResolvedValue(undefined),
  saveProject: vi.fn().mockResolvedValue(undefined),
  validateProject: vi.fn().mockResolvedValue({
    valid: true,
    errors: []
  }),
  updateProject: vi.fn(),
  updateGroup: vi.fn(),
  updateDataset: vi.fn(),
  updateAction: vi.fn(),
  updateFrameParser: vi.fn(),
  addGroup: vi.fn(),
  deleteGroup: vi.fn(),
  addDataset: vi.fn(),
  deleteDataset: vi.fn(),
  addAction: vi.fn(),
  deleteAction: vi.fn(),
  initialize: vi.fn()
};

vi.mock('../../../src/webview/stores/projectStore', () => ({
  useProjectStore: () => mockProjectStore
}));

// Mock Element Plus MessageBox
const mockMessageBox = {
  prompt: vi.fn().mockResolvedValue({
    action: 'confirm',
    value: 'Test Title'
  }),
  confirm: vi.fn().mockResolvedValue('confirm')
};

// Make ElMessageBox available globally
global.ElMessageBox = mockMessageBox as any;

// Mock child components
const mockComponents = {
  ProjectStructureTree: {
    name: 'ProjectStructureTree',
    template: '<div class="project-structure-tree"></div>',
    props: ['project', 'currentView'],
    emits: [
      'select-project', 'select-group', 'select-dataset', 'select-action', 'select-frame-parser',
      'add-group', 'delete-group', 'add-dataset', 'delete-dataset', 'add-action', 'delete-action'
    ]
  },
  ProjectView: {
    name: 'ProjectView',
    template: '<div class="project-view"></div>',
    props: ['project'],
    emits: ['update-project']
  },
  GroupView: {
    name: 'GroupView',
    template: '<div class="group-view"></div>',
    props: ['group', 'groupIndex'],
    emits: ['update-group']
  },
  DatasetView: {
    name: 'DatasetView',
    template: '<div class="dataset-view"></div>',
    props: ['dataset', 'groupIndex', 'datasetIndex'],
    emits: ['update-dataset']
  },
  ActionView: {
    name: 'ActionView',
    template: '<div class="action-view"></div>',
    props: ['action', 'actionIndex'],
    emits: ['update-action']
  },
  FrameParserView: {
    name: 'FrameParserView',
    template: '<div class="frame-parser-view"></div>',
    props: ['frameParser'],
    emits: ['update-frame-parser']
  },
  WelcomeView: {
    name: 'WelcomeView',
    template: '<div class="welcome-view"></div>'
  },
  ProjectHelp: {
    name: 'ProjectHelp',
    template: '<div class="project-help"></div>'
  },
  ValidationResults: {
    name: 'ValidationResults',
    template: '<div class="validation-results"></div>',
    props: ['result']
  }
};

describe('ProjectEditor 测试', () => {
  let wrapper: VueWrapper<any>;

  const createWrapper = (props = {}) => {
    return mount(ProjectEditor, {
      props: { ...props },
      global: {
        components: {
          ElButton,
          ElButtonGroup,
          ElDialog,
          ...mockComponents
        },
        stubs: {
          'el-button': { 
            template: '<button class="el-button" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['disabled', 'icon', 'type']
          },
          'el-button-group': { template: '<div class="el-button-group"><slot /></div>' },
          'el-dialog': { 
            template: '<div class="el-dialog" v-if="modelValue"><slot /></div>',
            props: ['modelValue', 'title', 'width'],
            emits: ['update:modelValue']
          }
        }
      }
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset project store state
    mockProjectStore.modified = false;
    mockProjectStore.title = 'Test Project';
    mockProjectStore.fileName = 'test.json';
  });

  describe('基础渲染', () => {
    test('应该正确渲染基本结构', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.project-editor').exists()).toBe(true);
      expect(wrapper.find('.editor-toolbar').exists()).toBe(true);
      expect(wrapper.find('.editor-main').exists()).toBe(true);
      expect(wrapper.find('.editor-statusbar').exists()).toBe(true);
    });

    test('应该渲染所有工具栏按钮', () => {
      wrapper = createWrapper();
      
      const buttons = wrapper.findAll('.el-button');
      expect(buttons.length).toBeGreaterThanOrEqual(6); // New, Open, Save, Save As, Validate, Help
      
      const buttonTexts = buttons.map(btn => btn.text());
      expect(buttonTexts).toContain('New');
      expect(buttonTexts).toContain('Open');
      expect(buttonTexts).toContain('Save');
      expect(buttonTexts).toContain('Save As');
      expect(buttonTexts).toContain('Validate');
      expect(buttonTexts).toContain('Help');
    });

    test('应该显示项目信息', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.project-title').text()).toBe('Test Project');
      expect(wrapper.find('.project-file').text()).toBe('test.json');
    });

    test('应该显示修改指示器', async () => {
      mockProjectStore.modified = true;
      wrapper = createWrapper();
      
      expect(wrapper.find('.modified-indicator').exists()).toBe(true);
      expect(wrapper.find('.modified-indicator').text()).toBe('*');
    });

    test('应该渲染项目结构树和编辑面板', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.project-structure').exists()).toBe(true);
      expect(wrapper.find('.editor-panel').exists()).toBe(true);
      expect(wrapper.find('.project-structure-tree').exists()).toBe(true);
    });
  });

  describe('状态栏', () => {
    test('应该显示项目统计信息', () => {
      wrapper = createWrapper();
      
      const statusItems = wrapper.findAll('.status-item');
      const statusTexts = statusItems.map(item => item.text());
      
      expect(statusTexts.some(text => text.includes('Groups: 2'))).toBe(true);
      expect(statusTexts.some(text => text.includes('Datasets: 5'))).toBe(true);
      expect(statusTexts.some(text => text.includes('Actions: 2'))).toBe(true);
    });

    test('应该显示验证结果', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleValidateProject();
      await nextTick();
      
      expect(wrapper.find('.status-item').exists()).toBe(true);
    });
  });

  describe('项目文件操作', () => {
    test('应该创建新项目', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleNewProject();
      
      expect(mockProjectStore.createNewProject).toHaveBeenCalled();
      expect(wrapper.vm.currentView).toBe('project');
      expect(wrapper.vm.selectedGroupIndex).toBe(-1);
    });

    test('应该打开项目', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleOpenProject();
      
      expect(mockProjectStore.openProject).toHaveBeenCalled();
      expect(wrapper.vm.currentView).toBe('project');
    });

    test('应该保存项目', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleSaveProject();
      
      expect(mockProjectStore.saveProject).toHaveBeenCalledWith(false);
    });

    test('应该另存为项目', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleSaveAsProject();
      
      expect(mockProjectStore.saveProject).toHaveBeenCalledWith(true);
    });

    test('应该验证项目', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleValidateProject();
      
      expect(mockProjectStore.validateProject).toHaveBeenCalled();
      expect(wrapper.vm.validationResult).toBeDefined();
      expect(wrapper.vm.showValidation).toBe(true);
    });

    test('应该禁用保存按钮当项目未修改时', () => {
      mockProjectStore.modified = false;
      wrapper = createWrapper();
      
      const saveButton = wrapper.findAll('.el-button').find(btn => btn.text() === 'Save');
      expect(saveButton?.attributes('disabled')).toBeDefined();
    });

    test('应该启用保存按钮当项目已修改时', () => {
      mockProjectStore.modified = true;
      wrapper = createWrapper();
      
      const saveButton = wrapper.findAll('.el-button').find(btn => btn.text() === 'Save');
      expect(saveButton?.attributes('disabled')).toBeUndefined();
    });
  });

  describe('视图选择', () => {
    test('应该选择项目视图', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleSelectProject();
      
      expect(wrapper.vm.currentView).toBe('project');
      expect(wrapper.find('.project-view').exists()).toBe(true);
    });

    test('应该选择组群视图', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleSelectGroup(0);
      
      expect(wrapper.vm.currentView).toBe('group');
      expect(wrapper.vm.selectedGroupIndex).toBe(0);
      expect(wrapper.find('.group-view').exists()).toBe(true);
    });

    test('应该选择数据集视图', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleSelectDataset(0, 1);
      
      expect(wrapper.vm.currentView).toBe('dataset');
      expect(wrapper.vm.selectedGroupIndex).toBe(0);
      expect(wrapper.vm.selectedDatasetIndex).toBe(1);
      expect(wrapper.find('.dataset-view').exists()).toBe(true);
    });

    test('应该选择动作视图', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleSelectAction(0);
      
      expect(wrapper.vm.currentView).toBe('action');
      expect(wrapper.vm.selectedActionIndex).toBe(0);
      expect(wrapper.find('.action-view').exists()).toBe(true);
    });

    test('应该选择帧解析器视图', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleSelectFrameParser();
      
      expect(wrapper.vm.currentView).toBe('frameParser');
      expect(wrapper.find('.frame-parser-view').exists()).toBe(true);
    });

    test('应该显示欢迎视图', () => {
      wrapper = createWrapper();
      wrapper.vm.currentView = 'welcome';
      
      expect(wrapper.find('.welcome-view').exists()).toBe(true);
    });
  });

  describe('计算属性', () => {
    test('应该计算选中的组群', () => {
      wrapper = createWrapper();
      wrapper.vm.selectedGroupIndex = 0;
      
      expect(wrapper.vm.selectedGroup).toEqual(mockProjectStore.currentProject.groups[0]);
    });

    test('应该返回 null 当没有选中组群时', () => {
      wrapper = createWrapper();
      wrapper.vm.selectedGroupIndex = -1;
      
      expect(wrapper.vm.selectedGroup).toBeNull();
    });

    test('应该计算选中的数据集', () => {
      wrapper = createWrapper();
      wrapper.vm.selectedGroupIndex = 0;
      wrapper.vm.selectedDatasetIndex = 1;
      
      expect(wrapper.vm.selectedDataset).toEqual(
        mockProjectStore.currentProject.groups[0].datasets[1]
      );
    });

    test('应该计算选中的动作', () => {
      wrapper = createWrapper();
      wrapper.vm.selectedActionIndex = 0;
      
      expect(wrapper.vm.selectedAction).toEqual(mockProjectStore.currentProject.actions[0]);
    });

    test('应该计算验证状态类', () => {
      wrapper = createWrapper();
      
      wrapper.vm.validationResult = { valid: true, errors: [] };
      expect(wrapper.vm.validationStatusClass).toBe('status-success');
      
      wrapper.vm.validationResult = { valid: false, errors: ['Error'] };
      expect(wrapper.vm.validationStatusClass).toBe('status-error');
      
      wrapper.vm.validationResult = null;
      expect(wrapper.vm.validationStatusClass).toBe('');
    });
  });

  describe('数据更新操作', () => {
    test('应该更新项目数据', async () => {
      wrapper = createWrapper();
      
      const data = { title: 'Updated Project' };
      await wrapper.vm.handleUpdateProject(data);
      
      expect(mockProjectStore.updateProject).toHaveBeenCalledWith(data);
    });

    test('应该更新组群数据', async () => {
      wrapper = createWrapper();
      wrapper.vm.selectedGroupIndex = 0;
      
      const data = { title: 'Updated Group' };
      await wrapper.vm.handleUpdateGroup(data);
      
      expect(mockProjectStore.updateGroup).toHaveBeenCalledWith(0, data);
    });

    test('应该更新数据集数据', async () => {
      wrapper = createWrapper();
      wrapper.vm.selectedGroupIndex = 0;
      wrapper.vm.selectedDatasetIndex = 1;
      
      const data = { title: 'Updated Dataset' };
      await wrapper.vm.handleUpdateDataset(data);
      
      expect(mockProjectStore.updateDataset).toHaveBeenCalledWith(0, 1, data);
    });

    test('应该更新动作数据', async () => {
      wrapper = createWrapper();
      wrapper.vm.selectedActionIndex = 0;
      
      const data = { title: 'Updated Action' };
      await wrapper.vm.handleUpdateAction(data);
      
      expect(mockProjectStore.updateAction).toHaveBeenCalledWith(0, data);
    });

    test('应该更新帧解析器', async () => {
      wrapper = createWrapper();
      
      const code = 'function newParser() { return {}; }';
      await wrapper.vm.handleUpdateFrameParser(code);
      
      expect(mockProjectStore.updateFrameParser).toHaveBeenCalledWith(code);
    });
  });

  describe('添加操作', () => {
    test('应该添加组群', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleAddGroup();
      
      expect(mockMessageBox.prompt).toHaveBeenCalledWith(
        'Enter group title:',
        'Add Group',
        expect.any(Object)
      );
      expect(mockProjectStore.addGroup).toHaveBeenCalledWith('Test Title', '');
    });

    test('应该取消添加组群', async () => {
      mockMessageBox.prompt.mockResolvedValueOnce({ action: 'cancel' });
      wrapper = createWrapper();
      
      await wrapper.vm.handleAddGroup();
      
      expect(mockProjectStore.addGroup).not.toHaveBeenCalled();
    });

    test('应该添加数据集', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleAddDataset(0);
      
      expect(mockMessageBox.prompt).toHaveBeenCalledWith(
        'Enter dataset title:',
        'Add Dataset',
        expect.any(Object)
      );
      expect(mockProjectStore.addDataset).toHaveBeenCalledWith(0, { title: 'Test Title' });
    });

    test('应该添加动作', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleAddAction();
      
      expect(mockMessageBox.prompt).toHaveBeenCalledWith(
        'Enter action title:',
        'Add Action',
        expect.any(Object)
      );
      expect(mockProjectStore.addAction).toHaveBeenCalledWith({
        title: 'Test Title',
        icon: '',
        txData: '',
        eolSequence: '\\n',
        binaryData: false,
        autoExecuteOnConnect: false,
        timerMode: 'off',
        timerIntervalMs: 1000
      });
    });
  });

  describe('删除操作', () => {
    test('应该删除组群', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleDeleteGroup(0);
      
      expect(mockMessageBox.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this group?',
        'Delete Group',
        expect.any(Object)
      );
      expect(mockProjectStore.deleteGroup).toHaveBeenCalledWith(0);
    });

    test('应该取消删除组群', async () => {
      mockMessageBox.confirm.mockResolvedValueOnce('cancel');
      wrapper = createWrapper();
      
      await wrapper.vm.handleDeleteGroup(0);
      
      expect(mockProjectStore.deleteGroup).not.toHaveBeenCalled();
    });

    test('应该删除当前选中的组群并重置视图', async () => {
      wrapper = createWrapper();
      wrapper.vm.selectedGroupIndex = 0;
      wrapper.vm.currentView = 'group';
      
      await wrapper.vm.handleDeleteGroup(0);
      
      expect(wrapper.vm.currentView).toBe('project');
      expect(wrapper.vm.selectedGroupIndex).toBe(-1);
    });

    test('应该删除数据集', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleDeleteDataset(0, 1);
      
      expect(mockMessageBox.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this dataset?',
        'Delete Dataset',
        expect.any(Object)
      );
      expect(mockProjectStore.deleteDataset).toHaveBeenCalledWith(0, 1);
    });

    test('应该删除当前选中的数据集并重置视图', async () => {
      wrapper = createWrapper();
      wrapper.vm.selectedGroupIndex = 0;
      wrapper.vm.selectedDatasetIndex = 1;
      wrapper.vm.currentView = 'dataset';
      
      await wrapper.vm.handleDeleteDataset(0, 1);
      
      expect(wrapper.vm.currentView).toBe('group');
      expect(wrapper.vm.selectedGroupIndex).toBe(0);
      expect(wrapper.vm.selectedDatasetIndex).toBe(-1);
    });

    test('应该删除动作', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleDeleteAction(0);
      
      expect(mockMessageBox.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this action?',
        'Delete Action',
        expect.any(Object)
      );
      expect(mockProjectStore.deleteAction).toHaveBeenCalledWith(0);
    });

    test('应该删除当前选中的动作并重置视图', async () => {
      wrapper = createWrapper();
      wrapper.vm.selectedActionIndex = 0;
      wrapper.vm.currentView = 'action';
      
      await wrapper.vm.handleDeleteAction(0);
      
      expect(wrapper.vm.currentView).toBe('project');
      expect(wrapper.vm.selectedActionIndex).toBe(-1);
    });
  });

  describe('对话框', () => {
    test('应该显示帮助对话框', async () => {
      wrapper = createWrapper();
      
      wrapper.vm.showHelp = true;
      await nextTick();
      
      expect(wrapper.find('.el-dialog').exists()).toBe(true);
      expect(wrapper.find('.project-help').exists()).toBe(true);
    });

    test('应该显示验证结果对话框', async () => {
      wrapper = createWrapper();
      
      wrapper.vm.showValidation = true;
      wrapper.vm.validationResult = { valid: false, errors: ['Test error'] };
      await nextTick();
      
      expect(wrapper.find('.validation-results').exists()).toBe(true);
    });

    test('应该点击帮助按钮打开帮助对话框', async () => {
      wrapper = createWrapper();
      
      const helpButton = wrapper.findAll('.el-button').find(btn => btn.text() === 'Help');
      await helpButton?.trigger('click');
      
      expect(wrapper.vm.showHelp).toBe(true);
    });
  });

  describe('键盘快捷键', () => {
    test('应该处理 Ctrl+N 新建项目', () => {
      wrapper = createWrapper();
      
      const event = new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true
      });
      
      Object.defineProperty(event, 'preventDefault', {
        value: vi.fn()
      });
      
      wrapper.vm.handleKeyDown(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockProjectStore.createNewProject).toHaveBeenCalled();
    });

    test('应该处理 Ctrl+O 打开项目', () => {
      wrapper = createWrapper();
      
      const event = new KeyboardEvent('keydown', {
        key: 'o',
        ctrlKey: true
      });
      
      Object.defineProperty(event, 'preventDefault', {
        value: vi.fn()
      });
      
      wrapper.vm.handleKeyDown(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockProjectStore.openProject).toHaveBeenCalled();
    });

    test('应该处理 Ctrl+S 保存项目', () => {
      wrapper = createWrapper();
      
      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true
      });
      
      Object.defineProperty(event, 'preventDefault', {
        value: vi.fn()
      });
      
      wrapper.vm.handleKeyDown(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockProjectStore.saveProject).toHaveBeenCalledWith(false);
    });

    test('应该处理 Ctrl+Shift+S 另存为项目', () => {
      wrapper = createWrapper();
      
      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        shiftKey: true
      });
      
      Object.defineProperty(event, 'preventDefault', {
        value: vi.fn()
      });
      
      wrapper.vm.handleKeyDown(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockProjectStore.saveProject).toHaveBeenCalledWith(true);
    });

    test('应该处理 Meta+S (macOS)', () => {
      wrapper = createWrapper();
      
      const event = new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true
      });
      
      Object.defineProperty(event, 'preventDefault', {
        value: vi.fn()
      });
      
      wrapper.vm.handleKeyDown(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockProjectStore.saveProject).toHaveBeenCalledWith(false);
    });

    test('应该忽略其他快捷键', () => {
      wrapper = createWrapper();
      
      const event = new KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: true
      });
      
      Object.defineProperty(event, 'preventDefault', {
        value: vi.fn()
      });
      
      wrapper.vm.handleKeyDown(event);
      
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('生命周期', () => {
    test('应该初始化项目存储', () => {
      wrapper = createWrapper();
      
      expect(mockProjectStore.initialize).toHaveBeenCalled();
    });

    test('应该添加键盘事件监听器', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      wrapper = createWrapper();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    test('应该移除键盘事件监听器', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      wrapper = createWrapper();
      wrapper.unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('辅助方法', () => {
    test('应该重置选择状态', () => {
      wrapper = createWrapper();
      
      wrapper.vm.selectedGroupIndex = 1;
      wrapper.vm.selectedDatasetIndex = 2;
      wrapper.vm.selectedActionIndex = 3;
      
      wrapper.vm.resetSelection();
      
      expect(wrapper.vm.selectedGroupIndex).toBe(-1);
      expect(wrapper.vm.selectedDatasetIndex).toBe(-1);
      expect(wrapper.vm.selectedActionIndex).toBe(-1);
    });
  });

  describe('边界条件', () => {
    test('应该处理空的项目数据', () => {
      mockProjectStore.currentProject = null;
      wrapper = createWrapper();
      
      expect(wrapper.vm.selectedGroup).toBeNull();
      expect(wrapper.vm.selectedAction).toBeNull();
    });

    test('应该处理空的组群数组', () => {
      mockProjectStore.currentProject = {
        groups: [],
        actions: []
      };
      wrapper = createWrapper();
      
      expect(wrapper.vm.selectedGroup).toBeNull();
    });

    test('应该处理无效的索引', () => {
      wrapper = createWrapper();
      wrapper.vm.selectedGroupIndex = 999;
      
      expect(wrapper.vm.selectedGroup).toBeUndefined();
    });

    test('应该处理组群更新当索引无效时', async () => {
      wrapper = createWrapper();
      wrapper.vm.selectedGroupIndex = -1;
      
      await wrapper.vm.handleUpdateGroup({ title: 'Test' });
      
      expect(mockProjectStore.updateGroup).not.toHaveBeenCalled();
    });

    test('应该处理数据集更新当索引无效时', async () => {
      wrapper = createWrapper();
      wrapper.vm.selectedGroupIndex = -1;
      wrapper.vm.selectedDatasetIndex = -1;
      
      await wrapper.vm.handleUpdateDataset({ title: 'Test' });
      
      expect(mockProjectStore.updateDataset).not.toHaveBeenCalled();
    });

    test('应该处理动作更新当索引无效时', async () => {
      wrapper = createWrapper();
      wrapper.vm.selectedActionIndex = -1;
      
      await wrapper.vm.handleUpdateAction({ title: 'Test' });
      
      expect(mockProjectStore.updateAction).not.toHaveBeenCalled();
    });
  });
});