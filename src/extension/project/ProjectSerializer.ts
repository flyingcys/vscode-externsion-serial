/*
 * Serial Studio VSCode Extension
 * 项目序列化器 - 处理项目数据的序列化和反序列化
 * 
 * 对应Serial-Studio中的JSON读写功能
 * 确保与Serial-Studio项目文件格式完全兼容
 */

import { ProjectConfig, Group, Dataset, Action } from '../types/ProjectTypes';

/**
 * 项目序列化器类
 * 提供项目数据与JSON之间的转换功能
 */
export class ProjectSerializer {

  /**
   * 序列化项目配置为JSON对象
   * 对应Serial-Studio中各个类的serialize()方法
   */
  public serialize(project: ProjectConfig): any {
    return {
      title: project.title,
      decoder: project.decoder,
      frameDetection: project.frameDetection,
      frameStart: project.frameStart,
      frameEnd: project.frameEnd,
      frameParser: project.frameParser,
      groups: project.groups.map(group => this.serializeGroup(group)),
      actions: project.actions.map(action => this.serializeAction(action)),
      mapTilerApiKey: project.mapTilerApiKey || '',
      thunderforestApiKey: project.thunderforestApiKey || ''
    };
  }

  /**
   * 反序列化JSON对象为项目配置
   * 对应Serial-Studio中各个类的read()方法
   */
  public deserialize(json: any): ProjectConfig {
    return {
      title: json.title || '',
      decoder: json.decoder ?? 0,
      frameDetection: json.frameDetection ?? 1,
      frameStart: json.frameStart || '$',
      frameEnd: json.frameEnd || ';',
      frameParser: json.frameParser || this.getDefaultFrameParser(),
      groups: (json.groups || []).map((groupJson: any) => this.deserializeGroup(groupJson)),
      actions: (json.actions || []).map((actionJson: any) => this.deserializeAction(actionJson)),
      mapTilerApiKey: json.mapTilerApiKey || '',
      thunderforestApiKey: json.thunderforestApiKey || ''
    };
  }

  /**
   * 序列化组群数据
   * 对应Group::serialize()
   */
  private serializeGroup(group: Group): any {
    return {
      title: group.title,
      widget: group.widget,
      datasets: group.datasets.map(dataset => this.serializeDataset(dataset))
    };
  }

  /**
   * 反序列化组群数据
   * 对应Group::read()
   */
  private deserializeGroup(json: any): Group {
    return {
      title: json.title || '',
      widget: json.widget || '',
      datasets: (json.datasets || []).map((datasetJson: any) => this.deserializeDataset(datasetJson))
    };
  }

  /**
   * 序列化数据集
   * 对应Dataset::serialize()
   */
  private serializeDataset(dataset: Dataset): any {
    return {
      title: dataset.title,
      units: dataset.units,
      widget: dataset.widget,
      value: dataset.value,
      index: dataset.index,
      graph: dataset.graph,
      fft: dataset.fft,
      led: dataset.led,
      log: dataset.log,
      min: dataset.min,
      max: dataset.max,
      alarm: dataset.alarm,
      ledHigh: dataset.ledHigh,
      fftSamples: dataset.fftSamples,
      fftSamplingRate: dataset.fftSamplingRate
    };
  }

  /**
   * 反序列化数据集
   * 对应Dataset::read()
   */
  private deserializeDataset(json: any): Dataset {
    return {
      title: json.title || '',
      units: json.units || '',
      widget: json.widget || '',
      value: json.value || '--',
      index: this.parseNumber(json.index, 0),
      graph: this.parseBoolean(json.graph, false),
      fft: this.parseBoolean(json.fft, false),
      led: this.parseBoolean(json.led, false),
      log: this.parseBoolean(json.log, false),
      min: this.parseNumber(json.min, 0),
      max: this.parseNumber(json.max, 0),
      alarm: this.parseNumber(json.alarm, 0),
      ledHigh: this.parseNumber(json.ledHigh, 1),
      fftSamples: this.parseNumber(json.fftSamples, 1024),
      fftSamplingRate: this.parseNumber(json.fftSamplingRate, 100)
    };
  }

  /**
   * 序列化动作数据
   * 对应Action::serialize()
   */
  private serializeAction(action: Action): any {
    return {
      title: action.title,
      icon: action.icon,
      txData: action.txData,
      eolSequence: action.eolSequence,
      binaryData: action.binaryData,
      autoExecuteOnConnect: action.autoExecuteOnConnect,
      timerMode: this.serializeTimerMode(action.timerMode),
      timerIntervalMs: action.timerIntervalMs
    };
  }

  /**
   * 反序列化动作数据
   * 对应Action::read()
   */
  private deserializeAction(json: any): Action {
    return {
      title: json.title || '',
      icon: json.icon || '',
      txData: json.txData || '',
      eolSequence: json.eolSequence || '\\n',
      binaryData: json.binaryData ?? false,
      autoExecuteOnConnect: json.autoExecuteOnConnect ?? false,
      timerMode: this.deserializeTimerMode(json.timerMode) || 'off',
      timerIntervalMs: json.timerIntervalMs ?? 1000
    };
  }

  /**
   * 序列化定时器模式
   * 将枚举值转换为字符串
   */
  private serializeTimerMode(mode: string): string {
    const modeMap: { [key: string]: string } = {
      'off': 'off',
      'autoStart': 'autoStart',
      'startOnTrigger': 'startOnTrigger',
      'toggleOnTrigger': 'toggleOnTrigger'
    };
    
    return modeMap[mode] || 'off';
  }

  /**
   * 反序列化定时器模式
   * 将字符串转换为枚举值
   */
  private deserializeTimerMode(mode: any): string {
    const validModes = ['off', 'autoStart', 'startOnTrigger', 'toggleOnTrigger'];
    
    if (typeof mode === 'string' && validModes.includes(mode)) {
      return mode;
    }
    
    // 处理可能的数字格式（从旧版本）
    if (typeof mode === 'number') {
      const modeArray = ['off', 'autoStart', 'startOnTrigger', 'toggleOnTrigger'];
      return modeArray[mode] || 'off';
    }
    
    return 'off';
  }

  /**
   * 导出项目为Serial-Studio兼容格式
   * 确保生成的JSON完全兼容Serial-Studio
   */
  public exportForSerialStudio(project: ProjectConfig): string {
    const exportData = this.serialize(project);
    
    // 确保所有必需字段都存在
    if (!exportData.actions) {
      exportData.actions = [];
    }
    
    if (!exportData.mapTilerApiKey) {
      exportData.mapTilerApiKey = '';
    }
    
    if (!exportData.thunderforestApiKey) {
      exportData.thunderforestApiKey = '';
    }

    // 格式化输出，保持与Serial-Studio一致的缩进
    return JSON.stringify(exportData, null, 4);
  }

  /**
   * 从Serial-Studio项目文件导入
   * 处理可能的版本差异和格式兼容性
   */
  public importFromSerialStudio(jsonString: string): ProjectConfig {
    try {
      const json = JSON.parse(jsonString);
      
      // 验证JSON格式是否为对象
      if (!json || typeof json !== 'object' || Array.isArray(json)) {
        throw new Error('Invalid project format: expected object');
      }
      
      // 处理可能的版本兼容性问题
      const normalized = this.normalizeSerialStudioFormat(json);
      
      return this.deserialize(normalized);
    } catch (error) {
      throw new Error(`Failed to parse Serial-Studio project: ${error}`);
    }
  }

  /**
   * 规范化Serial-Studio格式
   * 处理不同版本之间的格式差异
   */
  private normalizeSerialStudioFormat(json: any): any {
    const normalized = { ...json };

    // 验证groups字段类型
    if (normalized.groups && !Array.isArray(normalized.groups)) {
      throw new Error('Invalid project format: groups must be an array');
    }
    
    // 验证actions字段类型
    if (normalized.actions && !Array.isArray(normalized.actions)) {
      throw new Error('Invalid project format: actions must be an array');
    }

    // 确保基本字段存在并转换类型
    if (!normalized.title) {normalized.title = 'Imported Project';}
    
    // 确保数值字段为数字类型，处理字符串转换
    normalized.decoder = this.parseNumber(normalized.decoder, 0);
    normalized.frameDetection = this.parseNumber(normalized.frameDetection, 1);
    
    if (!normalized.frameStart) {normalized.frameStart = '$';}
    if (!normalized.frameEnd) {normalized.frameEnd = ';';}
    if (!normalized.groups) {normalized.groups = [];}
    if (!normalized.actions) {normalized.actions = [];}

    // 规范化组群数据
    normalized.groups = normalized.groups.map((group: any) => {
      const normalizedGroup = { ...group };
      if (!normalizedGroup.datasets) {normalizedGroup.datasets = [];}
      
      // 规范化数据集
      normalizedGroup.datasets = normalizedGroup.datasets.map((dataset: any) => {
        const normalizedDataset = { ...dataset };
        
        // 确保数值字段为数字类型
        ['index', 'min', 'max', 'alarm', 'ledHigh', 'fftSamples', 'fftSamplingRate'].forEach(field => {
          if (normalizedDataset[field] !== undefined) {
            normalizedDataset[field] = this.parseNumber(normalizedDataset[field], 0);
          }
        });
        
        // 确保布尔字段为布尔类型
        ['graph', 'fft', 'led', 'log'].forEach(field => {
          if (normalizedDataset[field] !== undefined) {
            normalizedDataset[field] = this.parseBoolean(normalizedDataset[field], false);
          }
        });
        
        return normalizedDataset;
      });
      
      return normalizedGroup;
    });

    // 规范化动作数据
    normalized.actions = normalized.actions.map((action: any) => {
      const normalizedAction = { ...action };
      
      // 确保数值字段为数字类型
      if (normalizedAction.timerIntervalMs !== undefined) {
        normalizedAction.timerIntervalMs = Number(normalizedAction.timerIntervalMs) || 1000;
      }
      
      // 确保布尔字段为布尔类型
      ['binaryData', 'autoExecuteOnConnect'].forEach(field => {
        if (normalizedAction[field] !== undefined) {
          normalizedAction[field] = Boolean(normalizedAction[field]);
        }
      });
      
      return normalizedAction;
    });

    return normalized;
  }

  /**
   * 获取默认帧解析器代码
   */
  private getDefaultFrameParser(): string {
    return `/**
 * Splits a data frame into an array of elements using a comma separator.
 *
 * Use this function to break a string (like "value1,value2,value3") into
 * individual pieces, which can then be displayed or processed in your project.
 *
 * @param[in]  frame   A string containing the data frame.
 *                     Example: "value1,value2,value3"
 * @return     An array of strings with the split elements.
 *             Example: ["value1", "value2", "value3"]
 *
 * @note You can declare global variables outside this function if needed
 *       for storing settings or keeping state between calls.
 */
function parse(frame) {
    return frame.split(',');
}
`;
  }

  /**
   * 创建项目模板
   * 提供常用的项目模板以便快速开始
   */
  public createTemplate(templateType: 'basic' | 'sensor' | 'gps' | 'accelerometer'): ProjectConfig {
    const baseTemplate: ProjectConfig = {
      title: '',
      decoder: 0,
      frameDetection: 1,
      frameStart: '$',
      frameEnd: ';',
      frameParser: this.getDefaultFrameParser(),
      groups: [],
      actions: [],
      mapTilerApiKey: '',
      thunderforestApiKey: ''
    };

    switch (templateType) {
      case 'basic':
        return {
          ...baseTemplate,
          title: 'Basic Project',
          groups: [{
            title: 'Sensor Data',
            widget: '',
            datasets: [{
              title: 'Temperature',
              units: '°C',
              widget: 'gauge',
              value: '--',
              index: 1,
              graph: true,
              fft: false,
              led: false,
              log: false,
              min: 0,
              max: 100,
              alarm: 80,
              ledHigh: 1,
              fftSamples: 1024,
              fftSamplingRate: 100
            }]
          }]
        };

      case 'sensor':
        return {
          ...baseTemplate,
          title: 'Multi-Sensor Project',
          groups: [
            {
              title: 'Temperature',
              widget: '',
              datasets: [{
                title: 'Temperature',
                units: '°C',
                widget: 'gauge',
                value: '--',
                index: 1,
                graph: true,
                fft: false,
                led: false,
                log: false,
                min: -40,
                max: 85,
                alarm: 70,
                ledHigh: 1,
                fftSamples: 1024,
                fftSamplingRate: 100
              }]
            },
            {
              title: 'Humidity',
              widget: '',
              datasets: [{
                title: 'Humidity',
                units: '%',
                widget: 'bar',
                value: '--',
                index: 2,
                graph: true,
                fft: false,
                led: false,
                log: false,
                min: 0,
                max: 100,
                alarm: 90,
                ledHigh: 1,
                fftSamples: 1024,
                fftSamplingRate: 100
              }]
            }
          ]
        };

      case 'gps':
        return {
          ...baseTemplate,
          title: 'GPS Tracking Project',
          groups: [{
            title: 'GPS Location',
            widget: 'map',
            datasets: [
              {
                title: 'Latitude',
                units: '°',
                widget: 'lat',
                value: '--',
                index: 1,
                graph: false,
                fft: false,
                led: false,
                log: false,
                min: -90,
                max: 90,
                alarm: 0,
                ledHigh: 1,
                fftSamples: 1024,
                fftSamplingRate: 100
              },
              {
                title: 'Longitude',
                units: '°',
                widget: 'lon',
                value: '--',
                index: 2,
                graph: false,
                fft: false,
                led: false,
                log: false,
                min: -180,
                max: 180,
                alarm: 0,
                ledHigh: 1,
                fftSamples: 1024,
                fftSamplingRate: 100
              },
              {
                title: 'Altitude',
                units: 'm',
                widget: 'alt',
                value: '--',
                index: 3,
                graph: true,
                fft: false,
                led: false,
                log: false,
                min: 0,
                max: 10000,
                alarm: 0,
                ledHigh: 1,
                fftSamples: 1024,
                fftSamplingRate: 100
              }
            ]
          }]
        };

      case 'accelerometer':
        return {
          ...baseTemplate,
          title: 'Accelerometer Project',
          groups: [{
            title: 'Accelerometer',
            widget: 'accelerometer',
            datasets: [
              {
                title: 'Accelerometer X',
                units: 'm/s²',
                widget: 'x',
                value: '--',
                index: 1,
                graph: true,
                fft: false,
                led: false,
                log: false,
                min: -20,
                max: 20,
                alarm: 0,
                ledHigh: 1,
                fftSamples: 1024,
                fftSamplingRate: 100
              },
              {
                title: 'Accelerometer Y',
                units: 'm/s²',
                widget: 'y',
                value: '--',
                index: 2,
                graph: true,
                fft: false,
                led: false,
                log: false,
                min: -20,
                max: 20,
                alarm: 0,
                ledHigh: 1,
                fftSamples: 1024,
                fftSamplingRate: 100
              },
              {
                title: 'Accelerometer Z',
                units: 'm/s²',
                widget: 'z',
                value: '--',
                index: 3,
                graph: true,
                fft: false,
                led: false,
                log: false,
                min: -20,
                max: 20,
                alarm: 0,
                ledHigh: 1,
                fftSamples: 1024,
                fftSamplingRate: 100
              }
            ]
          }]
        };

      default:
        return baseTemplate;
    }
  }

  /**
   * 解析布尔值，支持字符串格式
   * 处理旧版本项目文件中的字符串格式布尔值
   */
  private parseBoolean(value: any, defaultValue: boolean): boolean {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    
    if (typeof value === 'boolean') {
      return value;
    }
    
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      if (lowerValue === 'true' || lowerValue === '1') {
        return true;
      }
      if (lowerValue === 'false' || lowerValue === '0') {
        return false;
      }
    }
    
    if (typeof value === 'number') {
      return value !== 0;
    }
    
    return defaultValue;
  }

  /**
   * 解析数值，支持字符串格式
   * 处理旧版本项目文件中的字符串格式数值
   */
  private parseNumber(value: any, defaultValue: number): number {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    
    return defaultValue;
  }
}