/**
 * DataDecoder implementation for Serial Studio VSCode Extension
 * Based on Serial Studio's data decoding architecture
 */
/// <reference types="node" />
/// <reference types="node" />
import { DecoderMethod } from '../../shared/types';
/**
 * 数据解码器类
 * 支持多种数据格式的解码：纯文本、十六进制、Base64、二进制
 */
export declare class DataDecoder {
    /**
     * 解码数据帧
     * @param data 原始数据
     * @param method 解码方法
     * @returns 解码后的字符串
     */
    static decode(data: Buffer, method: DecoderMethod): string;
    /**
     * 纯文本解码
     * @param data 原始数据
     * @returns UTF-8字符串
     */
    private static decodePlainText;
    /**
     * 十六进制解码
     * 将十六进制字符串转换为原始数据，然后解码为文本
     * @param data 十六进制数据
     * @returns 解码后的字符串
     */
    private static decodeHexadecimal;
    /**
     * Base64解码
     * @param data Base64编码的数据
     * @returns 解码后的字符串
     */
    private static decodeBase64;
    /**
     * 二进制解码
     * 将每个字节表示为其数值
     * @param data 二进制数据
     * @returns 以逗号分隔的字节值字符串
     */
    private static decodeBinary;
    /**
     * 编码数据（用于测试和验证）
     * @param text 要编码的文本
     * @param method 编码方法
     * @returns 编码后的Buffer
     */
    static encode(text: string, method: DecoderMethod): Buffer;
    /**
     * 检测数据格式
     * 尝试自动检测数据是什么格式
     * @param data 要检测的数据
     * @returns 检测到的格式
     */
    static detectFormat(data: Buffer): DecoderMethod;
    /**
     * 检查字符串是否为有效的Base64
     */
    private static isValidBase64;
    /**
     * 检查字符串是否为有效的十六进制
     */
    private static isValidHex;
    /**
     * 检查字符串是否为有效的二进制数值序列
     */
    private static isValidBinary;
    /**
     * 获取解码方法的显示名称
     */
    static getMethodName(method: DecoderMethod): string;
    /**
     * 验证解码结果是否有效
     * @param decoded 解码后的字符串
     * @returns 是否为有效的解码结果
     */
    static isValidDecoded(decoded: string): boolean;
}
//# sourceMappingURL=DataDecoder.d.ts.map