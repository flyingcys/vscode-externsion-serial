// 简化的测试来验证DataFlow集成问题
// 直接模拟测试环境

const frameParser = {
  loadScript: () => true,
  updateConfig: () => {},
  createDatasets: async (frame) => {
    console.log('frameParser.createDatasets called with:', frame);
    return [
      { title: 'Temperature', value: 25.5, unit: '°C' },
      { title: 'Humidity', value: 60.2, unit: '%' },
      { title: 'Pressure', value: 1013.25, unit: 'hPa' }
    ];
  }
};

const receivedMessages = [];
const messageBridge = {
  sendToWebview: (message) => {
    console.log('messageBridge.sendToWebview called with:', message);
    receivedMessages.push(message);
  }
};

// 模拟 FrameReader
const frameReader = {
  on: (event, callback) => {
    console.log('frameReader.on called with event:', event);
    
    // 立即模拟事件触发
    if (event === 'frameExtracted') {
      setTimeout(async () => {
        console.log('Triggering frameExtracted event');
        const frame = {
          id: 1,
          data: '25.5, 60.2, 1013.25',
          timestamp: Date.now(),
          sequence: 1
        };
        
        try {
          await callback(frame);
          console.log('Event callback completed');
        } catch (error) {
          console.error('Event callback error:', error);
        }
      }, 10);
    }
  },
  processData: (data) => {
    console.log('frameReader.processData called with:', data.toString());
  }
};

async function runTest() {
  console.log('开始简化测试...');
  
  // 设置事件处理
  frameReader.on('frameExtracted', async (frame) => {
    console.log('收到frameExtracted事件:', frame);
    
    // 解析帧数据
    const datasets = await frameParser.createDatasets(frame);
    console.log('解析结果:', datasets);
    
    // 发送到webview
    messageBridge.sendToWebview({
      type: 'DataUpdate',
      payload: {
        frameId: frame.id,
        timestamp: frame.timestamp,
        datasets: datasets
      }
    });
  });
  
  // 处理数据
  const testData = Buffer.from('25.5, 60.2, 1013.25\n');
  frameReader.processData(testData);
  
  // 等待异步操作完成
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log('测试完成');
  console.log('收到的消息数量:', receivedMessages.length);
  console.log('消息内容:', receivedMessages);
}

runTest().catch(console.error);