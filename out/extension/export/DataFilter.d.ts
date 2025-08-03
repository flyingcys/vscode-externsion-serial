/**
 * 数据过滤器
 * 基于Serial Studio数据处理逻辑
 */
import { FilterCondition } from './types';
/**
 * 数据过滤器类
 * 提供灵活的数据过滤功能
 */
export declare class DataFilter {
    private conditions;
    /**
     * 构造函数
     * @param conditions 过滤条件数组
     */
    constructor(conditions?: FilterCondition[]);
    /**
     * 过滤数据记录
     * @param records 数据记录数组
     * @returns 过滤后的数据记录
     */
    filter(records: any[][]): any[][];
    /**
     * 异步过滤数据记录
     * @param records 异步数据记录迭代器
     * @returns 过滤后的数据记录异步迭代器
     */
    filterAsync(records: AsyncIterable<any[]>): AsyncIterable<any[]>;
    /**
     * 评估单条记录是否符合过滤条件
     * @param record 数据记录
     * @returns 是否符合条件
     */
    private evaluateRecord;
    /**
     * 评估单个过滤条件
     * @param record 数据记录
     * @param condition 过滤条件
     * @returns 是否符合条件
     */
    private evaluateCondition;
    /**
     * 比较两个值是否相等
     * @param a 值A
     * @param b 值B
     * @returns 是否相等
     */
    private equals;
    /**
     * 将值解析为数字
     * @param value 值
     * @returns 数字
     */
    private parseNumber;
    /**
     * 将值转换为字符串
     * @param value 值
     * @returns 字符串
     */
    private toString;
    /**
     * 添加过滤条件
     * @param condition 过滤条件
     */
    addCondition(condition: FilterCondition): void;
    /**
     * 移除过滤条件
     * @param index 条件索引
     */
    removeCondition(index: number): void;
    /**
     * 清空所有过滤条件
     */
    clearConditions(): void;
    /**
     * 获取过滤条件数量
     * @returns 条件数量
     */
    getConditionCount(): number;
    /**
     * 获取所有过滤条件
     * @returns 过滤条件数组的副本
     */
    getConditions(): FilterCondition[];
    /**
     * 验证过滤条件是否有效
     * @param condition 过滤条件
     * @returns 是否有效
     */
    static validateCondition(condition: FilterCondition): boolean;
    /**
     * 创建数值范围过滤条件
     * @param columnIndex 列索引
     * @param min 最小值
     * @param max 最大值
     * @returns 过滤条件
     */
    static createRangeCondition(columnIndex: number, min: number, max: number): FilterCondition;
    /**
     * 创建文本包含过滤条件
     * @param columnIndex 列索引
     * @param text 包含的文本
     * @returns 过滤条件
     */
    static createContainsCondition(columnIndex: number, text: string): FilterCondition;
    /**
     * 创建正则表达式过滤条件
     * @param columnIndex 列索引
     * @param pattern 正则表达式模式
     * @returns 过滤条件
     */
    static createRegexCondition(columnIndex: number, pattern: string): FilterCondition;
    /**
     * 创建时间范围过滤条件
     * @param columnIndex 列索引
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @returns 过滤条件
     */
    static createTimeRangeCondition(columnIndex: number, startTime: Date, endTime: Date): FilterCondition;
}
//# sourceMappingURL=DataFilter.d.ts.map