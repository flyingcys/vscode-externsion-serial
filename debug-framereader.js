// 简单的调试脚本来测试FrameReader
const { FrameReader } = require('./out/extension/parsing/FrameReader.js');
const { FrameDetection } = require('./out/shared/types.js');

// 创建FrameReader实例
const frameReader = new FrameReader({
  frameDetection: FrameDetection.EndDelimiterOnly,
  finishSequence: Buffer.from([0x0A]), // 换行符
  checksumAlgorithm: ''
});

// 设置事件监听器
frameReader.on('frameExtracted', (frame) => {
  console.log('帧提取成功:', frame);
});

frameReader.on('readyRead', () => {
  console.log('readyRead事件触发');
});

// 测试数据
const testData = Buffer.from('25.5, 60.2, 1013.25\n');
console.log('测试数据:', testData.toString());
console.log('测试数据字节:', Array.from(testData));

// 处理数据
console.log('开始处理数据...');
frameReader.processData(testData);

console.log('队列长度:', frameReader.getQueueLength());
console.log('缓冲区状态:', frameReader.getBufferStats());