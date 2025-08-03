"use strict";
/*
 * Serial Studio VSCode Extension
 * 项目状态管理Store
 *
 * 对应Serial-Studio的ProjectModel状态管理
 * 使用Pinia进行Vue3状态管理
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProjectStore = void 0;
const pinia_1 = require("pinia");
const vue_1 = require("vue");
/**
 * 项目状态管理Store
 * 对应Serial-Studio的ProjectModel类
 */
exports.useProjectStore = (0, pinia_1.defineStore)('project', () => {
    // ================== 核心状态 ==================
    // 对应ProjectModel的私有成员变量
    const currentProject = (0, vue_1.ref)(null);
    const filePath = (0, vue_1.ref)('');
    const modified = (0, vue_1.ref)(false);
    const title = (0, vue_1.ref)('New Project');
    // ================== 计算属性 ==================
    // 对应ProjectModel的getter方法
    const fileName = (0, vue_1.computed)(() => {
        if (filePath.value) {
            const parts = filePath.value.split(/[/\\]/);
            return parts[parts.length - 1];
        }
        return 'New Project';
    });
    const groupCount = (0, vue_1.computed)(() => {
        return currentProject.value?.groups.length || 0;
    });
    const datasetCount = (0, vue_1.computed)(() => {
        if (!currentProject.value) {
            return 0;
        }
        return currentProject.value.groups.reduce((total, group) => {
            return total + group.datasets.length;
        }, 0);
    });
    const actionCount = (0, vue_1.computed)(() => {
        return currentProject.value?.actions.length || 0;
    });
    const containsCommercialFeatures = (0, vue_1.computed)(() => {
        // 检查是否包含商业版特性
        if (!currentProject.value) {
            return false;
        }
        // 检查是否使用了商业版组件
        for (const group of currentProject.value.groups) {
            if (['plot3d', 'modbus', 'can'].includes(group.widget)) {
                return true;
            }
            for (const dataset of group.datasets) {
                if (dataset.fft && dataset.fftSamples > 4096) {
                    return true; // 大于4096的FFT采样需要商业版
                }
            }
        }
        return false;
    });
    // ================== 消息通信 ==================
    /**
     * 向VSCode扩展发送消息
     */
    const sendMessage = (message) => {
        if (typeof vscode !== 'undefined') {
            vscode.postMessage(message);
        }
    };
    /**
     * 设置修改状态
     */
    const setModified = (isModified) => {
        modified.value = isModified;
        sendMessage({
            type: 'projectModified',
            data: { modified: isModified }
        });
    };
    // ================== 项目文件操作 ==================
    // 对应ProjectModel的文件操作方法
    /**
     * 创建新项目 - 对应newJsonFile()
     */
    const createNewProject = async () => {
        sendMessage({ type: 'newProject' });
    };
    /**
     * 打开项目文件 - 对应openJsonFile()
     */
    const openProject = async (projectFilePath) => {
        sendMessage({
            type: 'openProject',
            filePath: projectFilePath
        });
    };
    /**
     * 保存项目文件 - 对应saveJsonFile()
     */
    const saveProject = async (askPath = false) => {
        sendMessage({
            type: 'saveProject',
            askPath
        });
    };
    /**
     * 验证项目 - 对应项目验证逻辑
     */
    const validateProject = async () => {
        return new Promise((resolve) => {
            const messageHandler = (event) => {
                if (event.data.type === 'validationResult') {
                    window.removeEventListener('message', messageHandler);
                    resolve(event.data.data);
                }
            };
            window.addEventListener('message', messageHandler);
            sendMessage({ type: 'validateProject' });
        });
    };
    // ================== 项目配置修改 ==================
    /**
     * 更新项目基本信息
     */
    const updateProject = (data) => {
        if (!currentProject.value) {
            return;
        }
        // 更新本地状态
        Object.assign(currentProject.value, data);
        // 特殊处理标题更新
        if (data.title !== undefined) {
            title.value = data.title;
            sendMessage({
                type: 'setTitle',
                title: data.title
            });
        }
        // 处理其他字段
        Object.keys(data).forEach(key => {
            if (key !== 'title') {
                sendMessage({
                    type: `set${key.charAt(0).toUpperCase()}${key.slice(1)}`,
                    value: data[key]
                });
            }
        });
        setModified(true);
    };
    /**
     * 更新帧解析器代码
     */
    const updateFrameParser = (code) => {
        if (!currentProject.value) {
            return;
        }
        currentProject.value.frameParser = code;
        sendMessage({
            type: 'setFrameParser',
            code
        });
        setModified(true);
    };
    // ================== 组群操作 ==================
    // 对应ProjectModel的组群管理方法
    /**
     * 添加组群 - 对应addGroup()
     */
    const addGroup = (groupTitle, widget) => {
        sendMessage({
            type: 'addGroup',
            title: groupTitle,
            widget
        });
    };
    /**
     * 删除组群 - 对应deleteCurrentGroup()
     */
    const deleteGroup = (groupIndex) => {
        sendMessage({
            type: 'deleteGroup',
            index: groupIndex
        });
    };
    /**
     * 更新组群信息
     */
    const updateGroup = (groupIndex, data) => {
        if (!currentProject.value ||
            groupIndex < 0 ||
            groupIndex >= currentProject.value.groups.length) {
            return;
        }
        // 更新本地状态
        Object.assign(currentProject.value.groups[groupIndex], data);
        // 发送到扩展
        sendMessage({
            type: 'updateGroup',
            index: groupIndex,
            data
        });
        setModified(true);
    };
    // ================== 数据集操作 ==================
    // 对应ProjectModel的数据集管理方法
    /**
     * 添加数据集 - 对应addDataset()
     */
    const addDataset = (groupIndex, dataset) => {
        sendMessage({
            type: 'addDataset',
            groupIndex,
            dataset
        });
    };
    /**
     * 删除数据集 - 对应deleteCurrentDataset()
     */
    const deleteDataset = (groupIndex, datasetIndex) => {
        sendMessage({
            type: 'deleteDataset',
            groupIndex,
            datasetIndex
        });
    };
    /**
     * 更新数据集信息
     */
    const updateDataset = (groupIndex, datasetIndex, data) => {
        if (!currentProject.value ||
            groupIndex < 0 ||
            groupIndex >= currentProject.value.groups.length) {
            return;
        }
        const group = currentProject.value.groups[groupIndex];
        if (datasetIndex < 0 || datasetIndex >= group.datasets.length) {
            return;
        }
        // 更新本地状态
        Object.assign(group.datasets[datasetIndex], data);
        // 发送到扩展
        sendMessage({
            type: 'updateDataset',
            groupIndex,
            datasetIndex,
            data
        });
        setModified(true);
    };
    // ================== 动作操作 ==================
    /**
     * 添加动作
     */
    const addAction = (action) => {
        sendMessage({
            type: 'addAction',
            action
        });
    };
    /**
     * 删除动作
     */
    const deleteAction = (actionIndex) => {
        sendMessage({
            type: 'deleteAction',
            index: actionIndex
        });
    };
    /**
     * 更新动作信息
     */
    const updateAction = (actionIndex, data) => {
        if (!currentProject.value ||
            actionIndex < 0 ||
            actionIndex >= currentProject.value.actions.length) {
            return;
        }
        // 更新本地状态
        Object.assign(currentProject.value.actions[actionIndex], data);
        // 发送到扩展
        sendMessage({
            type: 'updateAction',
            index: actionIndex,
            data
        });
        setModified(true);
    };
    // ================== 数据查询方法 ==================
    /**
     * 获取可用的X轴数据源 - 对应xDataSources()
     */
    const getXDataSources = () => {
        const sources = ['Samples'];
        if (currentProject.value) {
            for (const group of currentProject.value.groups) {
                for (const dataset of group.datasets) {
                    sources.push(`${dataset.title} (${group.title})`);
                }
            }
        }
        return sources;
    };
    /**
     * 获取已使用的数据集索引
     */
    const getUsedIndices = () => {
        const indices = [];
        if (currentProject.value) {
            for (const group of currentProject.value.groups) {
                for (const dataset of group.datasets) {
                    indices.push(dataset.index);
                }
            }
        }
        return indices.sort((a, b) => a - b);
    };
    /**
     * 获取重复的数据集索引
     */
    const getDuplicateIndices = () => {
        const indices = getUsedIndices();
        const duplicates = [];
        const seen = new Set();
        for (const index of indices) {
            if (seen.has(index)) {
                if (!duplicates.includes(index)) {
                    duplicates.push(index);
                }
            }
            else {
                seen.add(index);
            }
        }
        return duplicates;
    };
    /**
     * 获取下一个可用的数据集索引
     */
    const getNextAvailableIndex = () => {
        const usedIndices = getUsedIndices();
        let nextIndex = 1;
        while (usedIndices.includes(nextIndex)) {
            nextIndex++;
        }
        return nextIndex;
    };
    // ================== 消息处理 ==================
    /**
     * 处理来自VSCode扩展的消息
     */
    const handleMessage = (message) => {
        switch (message.type) {
            case 'projectData':
                // 更新完整项目数据
                currentProject.value = message.data.project;
                filePath.value = message.data.filePath || '';
                title.value = message.data.title || 'New Project';
                modified.value = message.data.modified || false;
                break;
            case 'projectLoaded':
                currentProject.value = message.data;
                modified.value = false;
                break;
            case 'projectModified':
                modified.value = message.data.modified;
                break;
            case 'titleChanged':
                title.value = message.data.title;
                break;
            case 'filePathChanged':
                filePath.value = message.data.filePath;
                break;
            case 'validationResult':
                // 验证结果会通过Promise处理
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    };
    /**
     * 初始化Store - 设置消息监听
     */
    const initialize = () => {
        // 监听来自VSCode扩展的消息
        window.addEventListener('message', (event) => {
            handleMessage(event.data);
        });
        // 请求初始项目数据
        sendMessage({ type: 'getProjectData' });
    };
    // ================== 工具方法 ==================
    /**
     * 重置所有状态
     */
    const reset = () => {
        currentProject.value = null;
        filePath.value = '';
        modified.value = false;
        title.value = 'New Project';
    };
    /**
     * 获取项目统计信息
     */
    const getProjectStatistics = () => {
        return {
            groupCount: groupCount.value,
            datasetCount: datasetCount.value,
            actionCount: actionCount.value,
            totalDataPoints: datasetCount.value,
            usedIndices: getUsedIndices(),
            duplicateIndices: getDuplicateIndices()
        };
    };
    // ================== 返回API ==================
    return {
        // 状态
        currentProject,
        filePath,
        modified,
        title,
        // 计算属性
        fileName,
        groupCount,
        datasetCount,
        actionCount,
        containsCommercialFeatures,
        // 项目操作
        createNewProject,
        openProject,
        saveProject,
        validateProject,
        // 配置修改
        updateProject,
        updateFrameParser,
        // 组群操作
        addGroup,
        deleteGroup,
        updateGroup,
        // 数据集操作
        addDataset,
        deleteDataset,
        updateDataset,
        // 动作操作
        addAction,
        deleteAction,
        updateAction,
        // 查询方法
        getXDataSources,
        getUsedIndices,
        getDuplicateIndices,
        getNextAvailableIndex,
        getProjectStatistics,
        // 工具方法
        initialize,
        reset,
        handleMessage
    };
});
//# sourceMappingURL=projectStore.js.map