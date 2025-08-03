/**
 * 数据转换器
 * 基于Serial Studio数据处理逻辑
 */
import { DataTransformation } from './types';
/**
 * 数据转换器类
 * 提供各种数据转换功能
 */
export declare class DataTransformer {
    private transformations;
    /**
     * 构造函数
     * @param transformations 转换配置数组
     */
    constructor(transformations?: DataTransformation[]);
    /**
     * 转换数据记录
     * @param records 数据记录数组
     * @returns 转换后的数据记录
     */
    transform(records: any[][]): any[][];
    /**
     * 异步转换数据记录
     * @param records 异步数据记录迭代器
     * @returns 转换后的数据记录异步迭代器
     */
    transformAsync(records: AsyncIterable<any[]>): AsyncIterable<any[]>;
    /**
     * 应用转换到数据集
     * @param records 数据记录数组
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    private applyTransformation;
    /**
     * 应用转换到单条记录
     * @param record 数据记录
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    private applyTransformationToRecord;
    /**
     * 单位转换
     * @param records 数据记录数组
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    private convertUnits;
    /**
     * 单条记录单位转换
     * @param record 数据记录
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    private convertUnitInRecord;
    /**
     * 精度舍入
     * @param records 数据记录数组
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    private roundPrecision;
    /**
     * 单条记录精度舍入
     * @param record 数据记录
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    private roundPrecisionInRecord;
    /**
     * 日期格式化
     * @param records 数据记录数组
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    private formatDates;
    /**
     * 单条记录日期格式化
     * @param record 数据记录
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    private formatDateInRecord;
    /**
     * 应用自定义函数
     * @param records 数据记录数组
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    private applyCustomFunction;
    /**
     * 单条记录应用自定义函数
     * @param record 数据记录
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    private applyCustomFunctionToRecord;
    /**
     * 解析数字
     * @param value 值
     * @returns 数字
     */
    private parseNumber;
    /**
     * 检查是否为有效日期
     * @param value 值
     * @returns 是否为有效日期
     */
    private isValidDate;
    /**
     * 格式化日期
     * @param date 日期对象
     * @param format 格式字符串
     * @returns 格式化后的日期字符串
     */
    private formatDate;
    /**
     * 添加转换配置
     * @param transformation 转换配置
     */
    addTransformation(transformation: DataTransformation): void;
    /**
     * 移除转换配置
     * @param index 配置索引
     */
    removeTransformation(index: number): void;
    /**
     * 清空所有转换配置
     */
    clearTransformations(): void;
    /**
     * 获取转换配置数量
     * @returns 配置数量
     */
    getTransformationCount(): number;
    /**
     * 获取所有转换配置
     * @returns 转换配置数组的副本
     */
    getTransformations(): DataTransformation[];
    /**
     * 创建单位转换配置
     * @param columnIndex 列索引
     * @param fromUnit 源单位
     * @param toUnit 目标单位
     * @param conversionFactor 转换因子
     * @returns 转换配置
     */
    static createUnitConversion(columnIndex: number, fromUnit: string, toUnit: string, conversionFactor: number): DataTransformation;
    /**
     * 创建精度舍入配置
     * @param columnIndex 列索引
     * @param precision 精度（小数位数）
     * @returns 转换配置
     */
    static createPrecisionRound(columnIndex: number, precision: number): DataTransformation;
    /**
     * 创建日期格式化配置
     * @param columnIndex 列索引
     * @param format 格式字符串
     * @returns 转换配置
     */
    static createDateFormat(columnIndex: number, format: string): DataTransformation;
    /**
     * 创建自定义函数转换配置
     * @param columnIndex 列索引
     * @param customFunction 自定义函数
     * @returns 转换配置
     */
    static createCustomFunction(columnIndex: number, customFunction: (value: any, record: any[], index: number) => any): DataTransformation;
    /**
     * 常用单位转换因子
     */
    static readonly CONVERSION_FACTORS: {
        CELSIUS_TO_FAHRENHEIT: (celsius: number) => number;
        FAHRENHEIT_TO_CELSIUS: (fahrenheit: number) => number;
        CELSIUS_TO_KELVIN: (celsius: number) => number;
        KELVIN_TO_CELSIUS: (kelvin: number) => number;
        METER_TO_FEET: number;
        FEET_TO_METER: number;
        METER_TO_INCH: number;
        INCH_TO_METER: number;
        KG_TO_POUND: number;
        POUND_TO_KG: number;
        PA_TO_PSI: number;
        PSI_TO_PA: number;
        MS_TO_KMH: number;
        KMH_TO_MS: number;
        MS_TO_MPH: number;
        MPH_TO_MS: number;
    };
}
//# sourceMappingURL=DataTransformer.d.ts.map