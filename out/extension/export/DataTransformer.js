"use strict";
/**
 * 数据转换器
 * 基于Serial Studio数据处理逻辑
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTransformer = void 0;
/**
 * 数据转换器类
 * 提供各种数据转换功能
 */
class DataTransformer {
    transformations;
    /**
     * 构造函数
     * @param transformations 转换配置数组
     */
    constructor(transformations = []) {
        this.transformations = transformations;
    }
    /**
     * 转换数据记录
     * @param records 数据记录数组
     * @returns 转换后的数据记录
     */
    transform(records) {
        let transformedRecords = records;
        for (const transformation of this.transformations) {
            transformedRecords = this.applyTransformation(transformedRecords, transformation);
        }
        return transformedRecords;
    }
    /**
     * 异步转换数据记录
     * @param records 异步数据记录迭代器
     * @returns 转换后的数据记录异步迭代器
     */
    async *transformAsync(records) {
        for await (const record of records) {
            let transformedRecord = record;
            for (const transformation of this.transformations) {
                transformedRecord = this.applyTransformationToRecord(transformedRecord, transformation);
            }
            yield transformedRecord;
        }
    }
    /**
     * 应用转换到数据集
     * @param records 数据记录数组
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    applyTransformation(records, transformation) {
        switch (transformation.type) {
            case 'unit_conversion':
                return this.convertUnits(records, transformation);
            case 'precision_round':
                return this.roundPrecision(records, transformation);
            case 'date_format':
                return this.formatDates(records, transformation);
            case 'custom_function':
                return this.applyCustomFunction(records, transformation);
            default:
                console.warn(`Unknown transformation type: ${transformation.type}`);
                return records;
        }
    }
    /**
     * 应用转换到单条记录
     * @param record 数据记录
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    applyTransformationToRecord(record, transformation) {
        const newRecord = [...record];
        switch (transformation.type) {
            case 'unit_conversion':
                return this.convertUnitInRecord(newRecord, transformation);
            case 'precision_round':
                return this.roundPrecisionInRecord(newRecord, transformation);
            case 'date_format':
                return this.formatDateInRecord(newRecord, transformation);
            case 'custom_function':
                return this.applyCustomFunctionToRecord(newRecord, transformation);
            default:
                return newRecord;
        }
    }
    /**
     * 单位转换
     * @param records 数据记录数组
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    convertUnits(records, transformation) {
        const { columnIndex, conversionFactor } = transformation.config;
        return records.map(record => {
            const newRecord = [...record];
            const value = this.parseNumber(record[columnIndex]);
            if (!isNaN(value)) {
                newRecord[columnIndex] = value * conversionFactor;
            }
            return newRecord;
        });
    }
    /**
     * 单条记录单位转换
     * @param record 数据记录
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    convertUnitInRecord(record, transformation) {
        const { columnIndex, conversionFactor } = transformation.config;
        if (columnIndex < record.length) {
            const value = this.parseNumber(record[columnIndex]);
            if (!isNaN(value)) {
                record[columnIndex] = value * conversionFactor;
            }
        }
        return record;
    }
    /**
     * 精度舍入
     * @param records 数据记录数组
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    roundPrecision(records, transformation) {
        const { columnIndex, precision } = transformation.config;
        return records.map(record => {
            const newRecord = [...record];
            const value = this.parseNumber(record[columnIndex]);
            if (!isNaN(value)) {
                newRecord[columnIndex] = Number(value.toFixed(precision));
            }
            return newRecord;
        });
    }
    /**
     * 单条记录精度舍入
     * @param record 数据记录
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    roundPrecisionInRecord(record, transformation) {
        const { columnIndex, precision } = transformation.config;
        if (columnIndex < record.length) {
            const value = this.parseNumber(record[columnIndex]);
            if (!isNaN(value)) {
                record[columnIndex] = Number(value.toFixed(precision));
            }
        }
        return record;
    }
    /**
     * 日期格式化
     * @param records 数据记录数组
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    formatDates(records, transformation) {
        const { columnIndex, format } = transformation.config;
        return records.map(record => {
            const newRecord = [...record];
            const dateValue = record[columnIndex];
            if (this.isValidDate(dateValue)) {
                const date = new Date(dateValue);
                newRecord[columnIndex] = this.formatDate(date, format);
            }
            return newRecord;
        });
    }
    /**
     * 单条记录日期格式化
     * @param record 数据记录
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    formatDateInRecord(record, transformation) {
        const { columnIndex, format } = transformation.config;
        if (columnIndex < record.length) {
            const dateValue = record[columnIndex];
            if (this.isValidDate(dateValue)) {
                const date = new Date(dateValue);
                record[columnIndex] = this.formatDate(date, format);
            }
        }
        return record;
    }
    /**
     * 应用自定义函数
     * @param records 数据记录数组
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    applyCustomFunction(records, transformation) {
        const { columnIndex, customFunction } = transformation.config;
        if (typeof customFunction !== 'function') {
            console.warn('Custom function is not a valid function');
            return records;
        }
        return records.map(record => {
            const newRecord = [...record];
            try {
                newRecord[columnIndex] = customFunction(record[columnIndex], record, columnIndex);
            }
            catch (error) {
                console.error('Error applying custom function:', error);
            }
            return newRecord;
        });
    }
    /**
     * 单条记录应用自定义函数
     * @param record 数据记录
     * @param transformation 转换配置
     * @returns 转换后的数据记录
     */
    applyCustomFunctionToRecord(record, transformation) {
        const { columnIndex, customFunction } = transformation.config;
        if (typeof customFunction !== 'function' || columnIndex >= record.length) {
            return record;
        }
        try {
            record[columnIndex] = customFunction(record[columnIndex], record, columnIndex);
        }
        catch (error) {
            console.error('Error applying custom function:', error);
        }
        return record;
    }
    /**
     * 解析数字
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
        const str = String(value);
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    }
    /**
     * 检查是否为有效日期
     * @param value 值
     * @returns 是否为有效日期
     */
    isValidDate(value) {
        if (value instanceof Date) {
            return !isNaN(value.getTime());
        }
        if (typeof value === 'string') {
            const date = new Date(value);
            return !isNaN(date.getTime());
        }
        if (typeof value === 'number') {
            const date = new Date(value);
            return !isNaN(date.getTime());
        }
        return false;
    }
    /**
     * 格式化日期
     * @param date 日期对象
     * @param format 格式字符串
     * @returns 格式化后的日期字符串
     */
    formatDate(date, format) {
        if (!format) {
            return date.toISOString();
        }
        const formatMap = {
            'YYYY': date.getFullYear().toString(),
            'YY': date.getFullYear().toString().slice(-2),
            'MM': (date.getMonth() + 1).toString().padStart(2, '0'),
            'M': (date.getMonth() + 1).toString(),
            'DD': date.getDate().toString().padStart(2, '0'),
            'D': date.getDate().toString(),
            'HH': date.getHours().toString().padStart(2, '0'),
            'H': date.getHours().toString(),
            'mm': date.getMinutes().toString().padStart(2, '0'),
            'm': date.getMinutes().toString(),
            'ss': date.getSeconds().toString().padStart(2, '0'),
            's': date.getSeconds().toString(),
            'SSS': date.getMilliseconds().toString().padStart(3, '0')
        };
        let formattedDate = format;
        // 按长度排序，避免替换冲突（如YYYY被YY部分替换）
        const tokens = Object.keys(formatMap).sort((a, b) => b.length - a.length);
        for (const token of tokens) {
            formattedDate = formattedDate.replace(new RegExp(token, 'g'), formatMap[token]);
        }
        return formattedDate;
    }
    /**
     * 添加转换配置
     * @param transformation 转换配置
     */
    addTransformation(transformation) {
        this.transformations.push(transformation);
    }
    /**
     * 移除转换配置
     * @param index 配置索引
     */
    removeTransformation(index) {
        if (index >= 0 && index < this.transformations.length) {
            this.transformations.splice(index, 1);
        }
    }
    /**
     * 清空所有转换配置
     */
    clearTransformations() {
        this.transformations = [];
    }
    /**
     * 获取转换配置数量
     * @returns 配置数量
     */
    getTransformationCount() {
        return this.transformations.length;
    }
    /**
     * 获取所有转换配置
     * @returns 转换配置数组的副本
     */
    getTransformations() {
        return [...this.transformations];
    }
    /**
     * 创建单位转换配置
     * @param columnIndex 列索引
     * @param fromUnit 源单位
     * @param toUnit 目标单位
     * @param conversionFactor 转换因子
     * @returns 转换配置
     */
    static createUnitConversion(columnIndex, fromUnit, toUnit, conversionFactor) {
        return {
            type: 'unit_conversion',
            config: {
                columnIndex,
                fromUnit,
                toUnit,
                conversionFactor
            }
        };
    }
    /**
     * 创建精度舍入配置
     * @param columnIndex 列索引
     * @param precision 精度（小数位数）
     * @returns 转换配置
     */
    static createPrecisionRound(columnIndex, precision) {
        return {
            type: 'precision_round',
            config: {
                columnIndex,
                precision
            }
        };
    }
    /**
     * 创建日期格式化配置
     * @param columnIndex 列索引
     * @param format 格式字符串
     * @returns 转换配置
     */
    static createDateFormat(columnIndex, format) {
        return {
            type: 'date_format',
            config: {
                columnIndex,
                format
            }
        };
    }
    /**
     * 创建自定义函数转换配置
     * @param columnIndex 列索引
     * @param customFunction 自定义函数
     * @returns 转换配置
     */
    static createCustomFunction(columnIndex, customFunction) {
        return {
            type: 'custom_function',
            config: {
                columnIndex,
                customFunction
            }
        };
    }
    /**
     * 常用单位转换因子
     */
    static CONVERSION_FACTORS = {
        // 温度
        CELSIUS_TO_FAHRENHEIT: (celsius) => celsius * 9 / 5 + 32,
        FAHRENHEIT_TO_CELSIUS: (fahrenheit) => (fahrenheit - 32) * 5 / 9,
        CELSIUS_TO_KELVIN: (celsius) => celsius + 273.15,
        KELVIN_TO_CELSIUS: (kelvin) => kelvin - 273.15,
        // 长度
        METER_TO_FEET: 3.28084,
        FEET_TO_METER: 0.3048,
        METER_TO_INCH: 39.3701,
        INCH_TO_METER: 0.0254,
        // 重量
        KG_TO_POUND: 2.20462,
        POUND_TO_KG: 0.453592,
        // 压力
        PA_TO_PSI: 0.000145038,
        PSI_TO_PA: 6894.76,
        // 速度
        MS_TO_KMH: 3.6,
        KMH_TO_MS: 0.277778,
        MS_TO_MPH: 2.23694,
        MPH_TO_MS: 0.44704
    };
}
exports.DataTransformer = DataTransformer;
//# sourceMappingURL=DataTransformer.js.map