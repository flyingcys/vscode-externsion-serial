<!--
  Serial Studio VSCode Extension
  项目编辑器主组件
  
  对应Serial-Studio的ProjectEditor.qml
  提供完整的项目配置编辑界面
-->

<template>
  <div class="project-editor">
    <!-- 顶部工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <el-button-group size="small">
          <el-button 
            @click="handleNewProject"
            :icon="DocumentAdd"
            type="primary"
          >
            New
          </el-button>
          <el-button 
            @click="handleOpenProject"
            :icon="FolderOpened"
          >
            Open
          </el-button>
          <el-button 
            @click="handleSaveProject"
            :icon="DocumentCheck"
            :disabled="!projectStore.modified"
          >
            Save
          </el-button>
          <el-button 
            @click="handleSaveAsProject"
            :icon="Download"
          >
            Save As
          </el-button>
        </el-button-group>
      </div>

      <div class="toolbar-center">
        <span class="project-title">
          {{ projectStore.title }}
          <span v-if="projectStore.modified" class="modified-indicator">*</span>
        </span>
        <span class="project-file">{{ projectStore.fileName }}</span>
      </div>

      <div class="toolbar-right">
        <el-button-group size="small">
          <el-button 
            @click="handleValidateProject"
            :icon="CheckCircle"
            type="success"
          >
            Validate
          </el-button>
          <el-button 
            @click="showHelp = true"
            :icon="QuestionFilled"
          >
            Help
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 主编辑区域 -->
    <div class="editor-main">
      <!-- 左侧项目结构树 -->
      <div class="project-structure">
        <ProjectStructureTree
          :project="projectStore.currentProject"
          :current-view="currentView"
          @select-project="handleSelectProject"
          @select-group="handleSelectGroup"
          @select-dataset="handleSelectDataset"
          @select-action="handleSelectAction"
          @select-frame-parser="handleSelectFrameParser"
          @add-group="handleAddGroup"
          @delete-group="handleDeleteGroup"
          @add-dataset="handleAddDataset"
          @delete-dataset="handleDeleteDataset"
          @add-action="handleAddAction"
          @delete-action="handleDeleteAction"
        />
      </div>

      <!-- 右侧编辑面板 -->
      <div class="editor-panel">
        <!-- 项目视图 -->
        <ProjectView 
          v-if="currentView === 'project'"
          :project="projectStore.currentProject"
          @update-project="handleUpdateProject"
        />

        <!-- 组群视图 -->
        <GroupView
          v-else-if="currentView === 'group'"
          :group="selectedGroup"
          :group-index="selectedGroupIndex"
          @update-group="handleUpdateGroup"
        />

        <!-- 数据集视图 -->
        <DatasetView
          v-else-if="currentView === 'dataset'"
          :dataset="selectedDataset"
          :group-index="selectedGroupIndex"
          :dataset-index="selectedDatasetIndex"
          @update-dataset="handleUpdateDataset"
        />

        <!-- 动作视图 -->
        <ActionView
          v-else-if="currentView === 'action'"
          :action="selectedAction"
          :action-index="selectedActionIndex"
          @update-action="handleUpdateAction"
        />

        <!-- 帧解析器视图 -->
        <FrameParserView
          v-else-if="currentView === 'frameParser'"
          :frame-parser="projectStore.currentProject?.frameParser || ''"
          @update-frame-parser="handleUpdateFrameParser"
        />

        <!-- 默认欢迎页面 -->
        <WelcomeView v-else />
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="editor-statusbar">
      <div class="status-left">
        <span class="status-item">
          Groups: {{ projectStore.groupCount }}
        </span>
        <span class="status-item">
          Datasets: {{ projectStore.datasetCount }}
        </span>
        <span class="status-item">
          Actions: {{ projectStore.currentProject?.actions.length || 0 }}
        </span>
      </div>

      <div class="status-right">
        <span v-if="validationResult" class="status-item" :class="validationStatusClass">
          {{ validationResult.valid ? 'Valid Project' : `${validationResult.errors.length} Errors` }}
        </span>
      </div>
    </div>

    <!-- 帮助对话框 -->
    <el-dialog
      v-model="showHelp"
      title="Project Editor Help"
      width="600px"
    >
      <ProjectHelp />
    </el-dialog>

    <!-- 验证结果对话框 -->
    <el-dialog
      v-model="showValidation"
      title="Project Validation"
      width="500px"
    >
      <ValidationResults :result="validationResult" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  DocumentAdd, 
  FolderOpened, 
  DocumentCheck, 
  Download,
  CheckCircle,
  QuestionFilled
} from '@element-plus/icons-vue';

import { useProjectStore } from '../stores/projectStore';
import { ProjectViewType, ValidationResult } from '../../extension/types/ProjectTypes';

// 导入子组件
import ProjectStructureTree from './ProjectStructureTree.vue';
import ProjectView from './views/ProjectView.vue';
import GroupView from './views/GroupView.vue';
import DatasetView from './views/DatasetView.vue';
import ActionView from './views/ActionView.vue';
import FrameParserView from './views/FrameParserView.vue';
import WelcomeView from './views/WelcomeView.vue';
import ProjectHelp from './dialogs/ProjectHelp.vue';
import ValidationResults from './dialogs/ValidationResults.vue';

// 使用项目状态管理
const projectStore = useProjectStore();

// 响应式状态
const currentView = ref<ProjectViewType>('project');
const selectedGroupIndex = ref(-1);
const selectedDatasetIndex = ref(-1);
const selectedActionIndex = ref(-1);
const showHelp = ref(false);
const showValidation = ref(false);
const validationResult = ref<ValidationResult | null>(null);

// 计算属性
const selectedGroup = computed(() => {
  if (selectedGroupIndex.value >= 0 && projectStore.currentProject) {
    return projectStore.currentProject.groups[selectedGroupIndex.value];
  }
  return null;
});

const selectedDataset = computed(() => {
  if (selectedGroup.value && selectedDatasetIndex.value >= 0) {
    return selectedGroup.value.datasets[selectedDatasetIndex.value];
  }
  return null;
});

const selectedAction = computed(() => {
  if (selectedActionIndex.value >= 0 && projectStore.currentProject) {
    return projectStore.currentProject.actions[selectedActionIndex.value];
  }
  return null;
});

const validationStatusClass = computed(() => {
  if (!validationResult.value) return '';
  return validationResult.value.valid ? 'status-success' : 'status-error';
});

// ================== 项目文件操作 ==================

const handleNewProject = async () => {
  await projectStore.createNewProject();
  resetSelection();
};

const handleOpenProject = async () => {
  await projectStore.openProject();
  resetSelection();
};

const handleSaveProject = async () => {
  await projectStore.saveProject(false);
};

const handleSaveAsProject = async () => {
  await projectStore.saveProject(true);
};

const handleValidateProject = async () => {
  validationResult.value = await projectStore.validateProject();
  showValidation.value = true;
};

// ================== 视图选择处理 ==================

const handleSelectProject = () => {
  currentView.value = 'project';
  resetSelection();
};

const handleSelectGroup = (groupIndex: number) => {
  currentView.value = 'group';
  selectedGroupIndex.value = groupIndex;
  selectedDatasetIndex.value = -1;
  selectedActionIndex.value = -1;
};

const handleSelectDataset = (groupIndex: number, datasetIndex: number) => {
  currentView.value = 'dataset';
  selectedGroupIndex.value = groupIndex;
  selectedDatasetIndex.value = datasetIndex;
  selectedActionIndex.value = -1;
};

const handleSelectAction = (actionIndex: number) => {
  currentView.value = 'action';
  selectedActionIndex.value = actionIndex;
  selectedGroupIndex.value = -1;
  selectedDatasetIndex.value = -1;
};

const handleSelectFrameParser = () => {
  currentView.value = 'frameParser';
  resetSelection();
};

// ================== 数据操作处理 ==================

const handleUpdateProject = (data: any) => {
  projectStore.updateProject(data);
};

const handleUpdateGroup = (data: any) => {
  if (selectedGroupIndex.value >= 0) {
    projectStore.updateGroup(selectedGroupIndex.value, data);
  }
};

const handleUpdateDataset = (data: any) => {
  if (selectedGroupIndex.value >= 0 && selectedDatasetIndex.value >= 0) {
    projectStore.updateDataset(selectedGroupIndex.value, selectedDatasetIndex.value, data);
  }
};

const handleUpdateAction = (data: any) => {
  if (selectedActionIndex.value >= 0) {
    projectStore.updateAction(selectedActionIndex.value, data);
  }
};

const handleUpdateFrameParser = (code: string) => {
  projectStore.updateFrameParser(code);
};

// ================== 添加/删除操作 ==================

const handleAddGroup = async () => {
  const result = await ElMessageBox.prompt('Enter group title:', 'Add Group', {
    confirmButtonText: 'Add',
    cancelButtonText: 'Cancel',
    inputPattern: /^.+$/,
    inputErrorMessage: 'Group title cannot be empty'
  });

  if (result.action === 'confirm') {
    projectStore.addGroup(result.value, '');
  }
};

const handleDeleteGroup = async (groupIndex: number) => {
  const result = await ElMessageBox.confirm(
    'Are you sure you want to delete this group?',
    'Delete Group',
    {
      type: 'warning',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }
  );

  if (result === 'confirm') {
    projectStore.deleteGroup(groupIndex);
    if (selectedGroupIndex.value === groupIndex) {
      resetSelection();
      currentView.value = 'project';
    }
  }
};

const handleAddDataset = async (groupIndex: number) => {
  const result = await ElMessageBox.prompt('Enter dataset title:', 'Add Dataset', {
    confirmButtonText: 'Add',
    cancelButtonText: 'Cancel',
    inputPattern: /^.+$/,
    inputErrorMessage: 'Dataset title cannot be empty'
  });

  if (result.action === 'confirm') {
    projectStore.addDataset(groupIndex, { title: result.value });
  }
};

const handleDeleteDataset = async (groupIndex: number, datasetIndex: number) => {
  const result = await ElMessageBox.confirm(
    'Are you sure you want to delete this dataset?',
    'Delete Dataset',
    {
      type: 'warning',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }
  );

  if (result === 'confirm') {
    projectStore.deleteDataset(groupIndex, datasetIndex);
    if (selectedGroupIndex.value === groupIndex && selectedDatasetIndex.value === datasetIndex) {
      resetSelection();
      currentView.value = 'group';
      selectedGroupIndex.value = groupIndex;
    }
  }
};

const handleAddAction = async () => {
  const result = await ElMessageBox.prompt('Enter action title:', 'Add Action', {
    confirmButtonText: 'Add',
    cancelButtonText: 'Cancel',
    inputPattern: /^.+$/,
    inputErrorMessage: 'Action title cannot be empty'
  });

  if (result.action === 'confirm') {
    projectStore.addAction({
      title: result.value,
      icon: '',
      txData: '',
      eolSequence: '\\n',
      binaryData: false,
      autoExecuteOnConnect: false,
      timerMode: 'off',
      timerIntervalMs: 1000
    });
  }
};

const handleDeleteAction = async (actionIndex: number) => {
  const result = await ElMessageBox.confirm(
    'Are you sure you want to delete this action?',
    'Delete Action',
    {
      type: 'warning',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }
  );

  if (result === 'confirm') {
    projectStore.deleteAction(actionIndex);
    if (selectedActionIndex.value === actionIndex) {
      resetSelection();
      currentView.value = 'project';
    }
  }
};

// ================== 辅助方法 ==================

const resetSelection = () => {
  selectedGroupIndex.value = -1;
  selectedDatasetIndex.value = -1;
  selectedActionIndex.value = -1;
};

// ================== 生命周期 ==================

onMounted(() => {
  // 初始化项目数据
  projectStore.initialize();
});

// 键盘快捷键处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'n':
        event.preventDefault();
        handleNewProject();
        break;
      case 'o':
        event.preventDefault();
        handleOpenProject();
        break;
      case 's':
        event.preventDefault();
        if (event.shiftKey) {
          handleSaveAsProject();
        } else {
          handleSaveProject();
        }
        break;
    }
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.project-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--vscode-editor-background);
  color: var(--vscode-editor-foreground);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: var(--vscode-titleBar-activeBackground);
  border-bottom: 1px solid var(--vscode-panel-border);
  flex-shrink: 0;
}

.toolbar-left {
  flex: 0 0 auto;
}

.toolbar-center {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 16px;
}

.project-title {
  font-weight: 600;
  font-size: 14px;
}

.modified-indicator {
  color: var(--vscode-gitDecoration-modifiedResourceForeground);
  margin-left: 4px;
}

.project-file {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
  margin-top: 2px;
}

.toolbar-right {
  flex: 0 0 auto;
}

.editor-main {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
}

.project-structure {
  width: 250px;
  flex-shrink: 0;
  background: var(--vscode-sideBar-background);
  border-right: 1px solid var(--vscode-panel-border);
  overflow-y: auto;
}

.editor-panel {
  flex: 1 1 auto;
  padding: 16px;
  overflow-y: auto;
}

.editor-statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 16px;
  background: var(--vscode-statusBar-background);
  color: var(--vscode-statusBar-foreground);
  border-top: 1px solid var(--vscode-panel-border);
  font-size: 12px;
  flex-shrink: 0;
}

.status-left {
  display: flex;
  gap: 16px;
}

.status-item {
  padding: 2px 8px;
}

.status-success {
  color: var(--vscode-testing-iconPassed);
}

.status-error {
  color: var(--vscode-testing-iconFailed);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-structure {
    width: 200px;
  }
  
  .toolbar-center {
    display: none;
  }
}
</style>