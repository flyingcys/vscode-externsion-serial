"use strict";
/*
 * Serial Studio VSCode Extension
 * 项目验证器 - JSON Schema验证和数据完整性检查
 *
 * 基于Serial-Studio的验证逻辑，确保项目配置的正确性
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectValidator = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
/**
 * 项目验证器类
 * 提供JSON Schema验证和业务逻辑验证
 */
class ProjectValidator {
    ajv;
    projectSchema;
    constructor() {
        this.ajv = new ajv_1.default({ allErrors: true });
        (0, ajv_formats_1.default)(this.ajv);
        this.projectSchema = this.createProjectSchema();
        this.ajv.addSchema(this.projectSchema, 'project');
    }
    /**
     * 验证完整项目配置
     */
    validateProject(project) {
        const errors = [];
        let valid = true;
        // JSON Schema 结构验证
        const schemaValid = this.ajv.validate('project', project);
        if (!schemaValid && this.ajv.errors) {
            valid = false;
            errors.push(...this.ajv.errors.map(err => `${err.instancePath || 'root'}: ${err.message}`));
        }
        // 业务逻辑验证
        if (schemaValid) {
            const businessValidation = this.validateBusinessLogic(project);
            if (!businessValidation.valid) {
                valid = false;
                errors.push(...businessValidation.errors);
            }
        }
        return { valid, errors };
    }
    /**
     * 验证组群配置
     */
    validateGroup(group) {
        const errors = [];
        let valid = true;
        // 基本验证
        if (!group.title || group.title.trim().length === 0) {
            valid = false;
            errors.push('Group title cannot be empty');
        }
        // Widget类型验证
        const validWidgets = [
            '', 'accelerometer', 'bar', 'compass', 'gyro', 'map',
            'plot', 'gauge', 'led', 'terminal', 'fft', 'multiplot'
        ];
        if (group.widget && !validWidgets.includes(group.widget)) {
            valid = false;
            errors.push(`Invalid group widget: ${group.widget}`);
        }
        // 数据集验证
        for (let i = 0; i < group.datasets.length; i++) {
            const datasetValidation = this.validateDataset(group.datasets[i]);
            if (!datasetValidation.valid) {
                valid = false;
                errors.push(...datasetValidation.errors.map(err => `Dataset ${i + 1}: ${err}`));
            }
        }
        // 特殊组件的数据集数量验证
        if (group.widget === 'accelerometer' && group.datasets.length !== 3) {
            valid = false;
            errors.push('Accelerometer widget requires exactly 3 datasets (X, Y, Z)');
        }
        if (group.widget === 'gyro' && group.datasets.length !== 3) {
            valid = false;
            errors.push('Gyroscope widget requires exactly 3 datasets (X, Y, Z)');
        }
        if (group.widget === 'map' && group.datasets.length < 2) {
            valid = false;
            errors.push('Map widget requires at least 2 datasets (latitude, longitude)');
        }
        return { valid, errors };
    }
    /**
     * 验证数据集配置
     */
    validateDataset(dataset) {
        const errors = [];
        let valid = true;
        // 基本验证
        if (!dataset.title || dataset.title.trim().length === 0) {
            valid = false;
            errors.push('Dataset title cannot be empty');
        }
        // 索引验证
        if (dataset.index < 0) {
            valid = false;
            errors.push('Dataset index must be non-negative');
        }
        // 范围验证
        if (dataset.min !== undefined && dataset.max !== undefined && dataset.min >= dataset.max) {
            valid = false;
            errors.push('Dataset minimum value must be less than maximum value');
        }
        // 告警值验证
        if (dataset.alarm !== undefined && dataset.min !== undefined && dataset.max !== undefined) {
            if (dataset.alarm < dataset.min || dataset.alarm > dataset.max) {
                valid = false;
                errors.push('Dataset alarm value must be within min-max range');
            }
        }
        // FFT参数验证
        if (dataset.fft) {
            if (dataset.fftSamples <= 0 || (dataset.fftSamples & (dataset.fftSamples - 1)) !== 0) {
                valid = false;
                errors.push('FFT samples must be a positive power of 2');
            }
            if (dataset.fftSamplingRate <= 0) {
                valid = false;
                errors.push('FFT sampling rate must be positive');
            }
        }
        // Widget类型验证
        const validDatasetWidgets = [
            '', 'x', 'y', 'z', 'lat', 'lon', 'alt', 'bar', 'gauge', 'plot', 'led'
        ];
        if (dataset.widget && !validDatasetWidgets.includes(dataset.widget)) {
            valid = false;
            errors.push(`Invalid dataset widget: ${dataset.widget}`);
        }
        return { valid, errors };
    }
    /**
     * 验证动作配置
     */
    validateAction(action) {
        const errors = [];
        let valid = true;
        // 基本验证
        if (!action.title || action.title.trim().length === 0) {
            valid = false;
            errors.push('Action title cannot be empty');
        }
        if (!action.txData || action.txData.trim().length === 0) {
            valid = false;
            errors.push('Action transmission data cannot be empty');
        }
        // 定时器验证
        if (action.timerMode && action.timerMode !== 'off') {
            if (!action.timerIntervalMs || action.timerIntervalMs <= 0) {
                valid = false;
                errors.push('Timer interval must be positive when timer mode is enabled');
            }
        }
        // EOL序列验证
        if (action.eolSequence) {
            const validEolSequences = ['\\n', '\\r', '\\r\\n', ';', '\\0'];
            if (!validEolSequences.includes(action.eolSequence)) {
                // 允许自定义EOL序列，但给出警告
                // 这里不标记为错误，但可以在UI中显示警告
            }
        }
        return { valid, errors };
    }
    /**
     * 业务逻辑验证
     */
    validateBusinessLogic(project) {
        const errors = [];
        let valid = true;
        // 项目标题验证
        if (!project.title || project.title.trim().length === 0) {
            valid = false;
            errors.push('Project title cannot be empty');
        }
        // 帧解析器验证
        if (!project.frameParser || project.frameParser.trim().length === 0) {
            valid = false;
            errors.push('Frame parser function cannot be empty');
        }
        else {
            // 基本的JavaScript语法检查
            try {
                new Function(project.frameParser);
            }
            catch (syntaxError) {
                valid = false;
                errors.push(`Frame parser syntax error: ${syntaxError}`);
            }
        }
        // 数据集索引唯一性验证
        const usedIndices = new Set();
        const duplicateIndices = [];
        for (const group of project.groups) {
            for (const dataset of group.datasets) {
                if (usedIndices.has(dataset.index)) {
                    duplicateIndices.push(dataset.index);
                }
                else {
                    usedIndices.add(dataset.index);
                }
            }
        }
        if (duplicateIndices.length > 0) {
            valid = false;
            errors.push(`Duplicate dataset indices found: ${duplicateIndices.join(', ')}`);
        }
        // 组群和数据集验证
        for (let groupIndex = 0; groupIndex < project.groups.length; groupIndex++) {
            const group = project.groups[groupIndex];
            const groupValidation = this.validateGroup(group);
            if (!groupValidation.valid) {
                valid = false;
                errors.push(...groupValidation.errors.map(err => `Group ${groupIndex + 1} (${group.title}): ${err}`));
            }
        }
        // 动作验证
        for (let actionIndex = 0; actionIndex < project.actions.length; actionIndex++) {
            const action = project.actions[actionIndex];
            const actionValidation = this.validateAction(action);
            if (!actionValidation.valid) {
                valid = false;
                errors.push(...actionValidation.errors.map(err => `Action ${actionIndex + 1} (${action.title}): ${err}`));
            }
        }
        return { valid, errors };
    }
    /**
     * 创建项目JSON Schema
     */
    createProjectSchema() {
        return {
            type: 'object',
            properties: {
                title: { type: 'string', minLength: 1 },
                decoder: { type: 'number', enum: [0, 1, 2] },
                frameDetection: { type: 'number', enum: [0, 1, 2, 3] },
                frameStart: { type: 'string' },
                frameEnd: { type: 'string' },
                frameParser: { type: 'string', minLength: 1 },
                groups: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', minLength: 1 },
                            widget: { type: 'string' },
                            datasets: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        title: { type: 'string', minLength: 1 },
                                        units: { type: 'string' },
                                        widget: { type: 'string' },
                                        value: { type: 'string' },
                                        index: { type: 'number', minimum: 0 },
                                        graph: { type: 'boolean' },
                                        fft: { type: 'boolean' },
                                        led: { type: 'boolean' },
                                        log: { type: 'boolean' },
                                        min: { type: 'number' },
                                        max: { type: 'number' },
                                        alarm: { type: 'number' },
                                        ledHigh: { type: 'number' },
                                        fftSamples: { type: 'number', minimum: 1 },
                                        fftSamplingRate: { type: 'number', minimum: 1 }
                                    },
                                    required: ['title', 'units', 'widget', 'value', 'index', 'graph',
                                        'fft', 'led', 'log', 'min', 'max', 'alarm', 'ledHigh',
                                        'fftSamples', 'fftSamplingRate'],
                                    additionalProperties: false
                                }
                            }
                        },
                        required: ['title', 'widget', 'datasets'],
                        additionalProperties: false
                    }
                },
                actions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', minLength: 1 },
                            icon: { type: 'string' },
                            txData: { type: 'string', minLength: 1 },
                            eolSequence: { type: 'string' },
                            binaryData: { type: 'boolean' },
                            autoExecuteOnConnect: { type: 'boolean' },
                            timerMode: { type: 'string', enum: ['off', 'autoStart', 'startOnTrigger', 'toggleOnTrigger'] },
                            timerIntervalMs: { type: 'number', minimum: 1 }
                        },
                        required: ['title', 'icon', 'txData', 'eolSequence', 'binaryData',
                            'autoExecuteOnConnect', 'timerMode', 'timerIntervalMs'],
                        additionalProperties: false
                    }
                },
                mapTilerApiKey: { type: 'string' },
                thunderforestApiKey: { type: 'string' }
            },
            required: ['title', 'decoder', 'frameDetection', 'frameStart', 'frameEnd',
                'frameParser', 'groups', 'actions', 'mapTilerApiKey', 'thunderforestApiKey'],
            additionalProperties: false
        };
    }
}
exports.ProjectValidator = ProjectValidator;
//# sourceMappingURL=ProjectValidator.js.map