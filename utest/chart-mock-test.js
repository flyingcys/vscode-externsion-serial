// 简单的Chart.js Mock测试
const { Chart } = require('./mocks/chart.js.ts');

console.log('测试Chart Mock...');
console.log('Chart类型:', typeof Chart);
console.log('Chart是否为函数:', typeof Chart === 'function');

try {
  const instance = new Chart(null, { data: { datasets: [] } });
  console.log('实例创建成功');  
  console.log('实例类型:', typeof instance);
  console.log('destroy方法类型:', typeof instance.destroy);
  console.log('update方法类型:', typeof instance.update);
  
  // 测试destroy方法
  instance.destroy();
  console.log('destroy方法调用成功');
  
} catch (error) {
  console.error('测试失败:', error);
}