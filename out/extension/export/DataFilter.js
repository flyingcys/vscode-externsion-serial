"use strict";
/**
 * 数据过滤器
 * 基于Serial Studio数据处理逻辑
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataFilter = void 0;
/**
 * 数据过滤器类
 * 提供灵活的数据过滤功能
 */
class DataFilter {
    conditions;
    /**
     * 构造函数
     * @param conditions 过滤条件数组
     */
    constructor(conditions = []) {
        this.conditions = conditions;
    }
    /**
     * 过滤数据记录
     * @param records 数据记录数组
     * @returns 过滤后的数据记录
     */
    filter(records) {
        if (this.conditions.length === 0) {
            return records;
        }
        return records.filter(record => this.evaluateRecord(record));
    }
    /**
     * 异步过滤数据记录
     * @param records 异步数据记录迭代器
     * @returns 过滤后的数据记录异步迭代器
     */
    async *filterAsync(records) {
        if (this.conditions.length === 0) {
            for await (const record of records) {
                yield record;
            }
            return;
        }
        for await (const record of records) {
            if (this.evaluateRecord(record)) {
                yield record;
            }
        }
    }
    /**
     * 评估单条记录是否符合过滤条件
     * @param record 数据记录
     * @returns 是否符合条件
     */
    evaluateRecord(record) {
        if (this.conditions.length === 0) {
            return true;
        }
        // 处理逻辑运算符
        let result = this.evaluateCondition(record, this.conditions[0]);
        for (let i = 1; i < this.conditions.length; i++) {
            const condition = this.conditions[i];
            const conditionResult = this.evaluateCondition(record, condition);
            if (condition.logicalOperator === 'OR') {
                result = result || conditionResult;
            }
            else {
                // 默认为 AND
                result = result && conditionResult;
            }
        }
        return result;
    }
    /**
     * 评估单个过滤条件
     * @param record 数据记录
     * @param condition 过滤条件
     * @returns 是否符合条件
     */
    evaluateCondition(record, condition) {
        if (condition.columnIndex >= record.length) {
            return false;
        }
        const value = record[condition.columnIndex];
        switch (condition.operator) {
            case 'equals':
                return this.equals(value, condition.value);
            case 'not_equals':
                return !this.equals(value, condition.value);
            case 'greater_than':
                return this.parseNumber(value) > this.parseNumber(condition.value);
            case 'less_than':
                return this.parseNumber(value) < this.parseNumber(condition.value);
            case 'greater_equal':
                return this.parseNumber(value) >= this.parseNumber(condition.value);
            case 'less_equal':
                return this.parseNumber(value) <= this.parseNumber(condition.value);
            case 'contains':
                return this.toString(value).includes(this.toString(condition.value));
            case 'starts_with':
                return this.toString(value).startsWith(this.toString(condition.value));
            case 'ends_with':
                return this.toString(value).endsWith(this.toString(condition.value));
            case 'regex':
                try {
                    const regex = new RegExp(this.toString(condition.value));
                    return regex.test(this.toString(value));
                }
                catch {
                    return false;
                }
            case 'in_range':
                if (Array.isArray(condition.value) && condition.value.length === 2) {
                    const numValue = this.parseNumber(value);
                    const [min, max] = condition.value.map(v => this.parseNumber(v));
                    return numValue >= min && numValue <= max;
                }
                return false;
            default:
                return true;
        }
    }
    /**
     * 比较两个值是否相等
     * @param a 值A
     * @param b 值B
     * @returns 是否相等
     */
    equals(a, b) {
        // 处理null和undefined
        if (a == null && b == null) {
            return true;
        }
        if (a == null || b == null) {
            return false;
        }
        // 如果两个值都是数字类型，或者都可以成功解析为数字（不包括转换为0的情况），进行数值比较
        const isANumber = typeof a === 'number' || (a instanceof Date) || (typeof a === 'string' && /^-?\d*\.?\d+$/.test(a.toString().trim()));
        const isBNumber = typeof b === 'number' || (b instanceof Date) || (typeof b === 'string' && /^-?\d*\.?\d+$/.test(b.toString().trim()));
        if (isANumber && isBNumber) {
            const numA = this.parseNumber(a);
            const numB = this.parseNumber(b);
            return Math.abs(numA - numB) < Number.EPSILON;
        }
        // 字符串比较
        return this.toString(a) === this.toString(b);
    }
    /**
     * 将值解析为数字
     * @param value 值
     * @returns 数字
     */
    parseNumber(value) {
        if (typeof value === 'number') {
            return value;
        }
        if (value instanceof Date) {
            return value.getTime();
        }
        const str = this.toString(value);
        // 尝试解析ISO日期字符串
        if (str.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
            return new Date(str).getTime();
        }
        // 尝试解析数字
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    }
    /**
     * 将值转换为字符串
     * @param value 值
     * @returns 字符串
     */
    toString(value) {
        if (value == null) {
            return '';
        }
        if (typeof value === 'string') {
            return value;
        }
        if (value instanceof Date) {
            return value.toISOString();
        }
        return String(value);
    }
    /**
     * 添加过滤条件
     * @param condition 过滤条件
     */
    addCondition(condition) {
        this.conditions.push(condition);
    }
    /**
     * 移除过滤条件
     * @param index 条件索引
     */
    removeCondition(index) {
        if (index >= 0 && index < this.conditions.length) {
            this.conditions.splice(index, 1);
        }
    }
    /**
     * 清空所有过滤条件
     */
    clearConditions() {
        this.conditions = [];
    }
    /**
     * 获取过滤条件数量
     * @returns 条件数量
     */
    getConditionCount() {
        return this.conditions.length;
    }
    /**
     * 获取所有过滤条件
     * @returns 过滤条件数组的副本
     */
    getConditions() {
        return [...this.conditions];
    }
    /**
     * 验证过滤条件是否有效
     * @param condition 过滤条件
     * @returns 是否有效
     */
    static validateCondition(condition) {
        // 检查基本字段
        if (typeof condition.columnIndex !== 'number' || condition.columnIndex < 0) {
            return false;
        }
        if (!condition.operator) {
            return false;
        }
        // 检查操作符特定的值
        switch (condition.operator) {
            case 'in_range':
                return Array.isArray(condition.value) && condition.value.length === 2;
            case 'regex':
                try {
                    new RegExp(String(condition.value));
                    return true;
                }
                catch {
                    return false;
                }
            default:
                return condition.value !== undefined;
        }
    }
    /**
     * 创建数值范围过滤条件
     * @param columnIndex 列索引
     * @param min 最小值
     * @param max 最大值
     * @returns 过滤条件
     */
    static createRangeCondition(columnIndex, min, max) {
        return {
            columnIndex,
            operator: 'in_range',
            value: [min, max]
        };
    }
    /**
     * 创建文本包含过滤条件
     * @param columnIndex 列索引
     * @param text 包含的文本
     * @returns 过滤条件
     */
    static createContainsCondition(columnIndex, text) {
        return {
            columnIndex,
            operator: 'contains',
            value: text
        };
    }
    /**
     * 创建正则表达式过滤条件
     * @param columnIndex 列索引
     * @param pattern 正则表达式模式
     * @returns 过滤条件
     */
    static createRegexCondition(columnIndex, pattern) {
        return {
            columnIndex,
            operator: 'regex',
            value: pattern
        };
    }
    /**
     * 创建时间范围过滤条件
     * @param columnIndex 列索引
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @returns 过滤条件
     */
    static createTimeRangeCondition(columnIndex, startTime, endTime) {
        return {
            columnIndex,
            operator: 'in_range',
            value: [startTime.getTime(), endTime.getTime()]
        };
    }
}
exports.DataFilter = DataFilter;
//# sourceMappingURL=DataFilter.js.map