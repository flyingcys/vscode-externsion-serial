import { ProjectConfig } from '../types/ProjectTypes';
/**
 * 项目序列化器类
 * 提供项目数据与JSON之间的转换功能
 */
export declare class ProjectSerializer {
    /**
     * 序列化项目配置为JSON对象
     * 对应Serial-Studio中各个类的serialize()方法
     */
    serialize(project: ProjectConfig): any;
    /**
     * 反序列化JSON对象为项目配置
     * 对应Serial-Studio中各个类的read()方法
     */
    deserialize(json: any): ProjectConfig;
    /**
     * 序列化组群数据
     * 对应Group::serialize()
     */
    private serializeGroup;
    /**
     * 反序列化组群数据
     * 对应Group::read()
     */
    private deserializeGroup;
    /**
     * 序列化数据集
     * 对应Dataset::serialize()
     */
    private serializeDataset;
    /**
     * 反序列化数据集
     * 对应Dataset::read()
     */
    private deserializeDataset;
    /**
     * 序列化动作数据
     * 对应Action::serialize()
     */
    private serializeAction;
    /**
     * 反序列化动作数据
     * 对应Action::read()
     */
    private deserializeAction;
    /**
     * 序列化定时器模式
     * 将枚举值转换为字符串
     */
    private serializeTimerMode;
    /**
     * 反序列化定时器模式
     * 将字符串转换为枚举值
     */
    private deserializeTimerMode;
    /**
     * 导出项目为Serial-Studio兼容格式
     * 确保生成的JSON完全兼容Serial-Studio
     */
    exportForSerialStudio(project: ProjectConfig): string;
    /**
     * 从Serial-Studio项目文件导入
     * 处理可能的版本差异和格式兼容性
     */
    importFromSerialStudio(jsonString: string): ProjectConfig;
    /**
     * 规范化Serial-Studio格式
     * 处理不同版本之间的格式差异
     */
    private normalizeSerialStudioFormat;
    /**
     * 获取默认帧解析器代码
     */
    private getDefaultFrameParser;
    /**
     * 创建项目模板
     * 提供常用的项目模板以便快速开始
     */
    createTemplate(templateType: 'basic' | 'sensor' | 'gps' | 'accelerometer'): ProjectConfig;
    /**
     * 解析布尔值，支持字符串格式
     * 处理旧版本项目文件中的字符串格式布尔值
     */
    private parseBoolean;
    /**
     * 解析数值，支持字符串格式
     * 处理旧版本项目文件中的字符串格式数值
     */
    private parseNumber;
}
//# sourceMappingURL=ProjectSerializer.d.ts.map