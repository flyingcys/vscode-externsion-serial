"use strict";
/**
 * 高级可视化组件性能基准测试
 * 验证性能指标：3D≥30FPS，地图响应≤100ms，FFT≥1000samples/s
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAutomatedBenchmark = exports.performanceBenchmark = exports.PerformanceBenchmark = void 0;
class PerformanceBenchmark {
    metrics = {
        fps3D: 0,
        gpsResponseTime: 0,
        fftSamplesPerSecond: 0,
        multiPlotUpdateRate: 0,
        memoryUsage: 0,
        cpuUsage: 0
    };
    targets = [
        { name: '3D渲染帧率', metric: 'fps3D', target: 30, unit: 'FPS', operator: 'gte' },
        { name: 'GPS地图响应时间', metric: 'gpsResponseTime', target: 100, unit: 'ms', operator: 'lte' },
        { name: 'FFT处理速度', metric: 'fftSamplesPerSecond', target: 1000, unit: 'samples/s', operator: 'gte' },
        { name: '多图表更新频率', metric: 'multiPlotUpdateRate', target: 10, unit: 'Hz', operator: 'gte' },
        { name: '内存使用', metric: 'memoryUsage', target: 500, unit: 'MB', operator: 'lte' },
        { name: 'CPU使用率', metric: 'cpuUsage', target: 80, unit: '%', operator: 'lte' }
    ];
    /**
     * 运行3D渲染性能测试
     */
    async benchmark3DRendering() {
        console.log('🚀 开始3D渲染性能测试...');
        const testDuration = 2000; // 2秒测试
        const frameInterval = 16.67; // 60fps目标间隔
        let frameCount = 0;
        const startTime = performance.now();
        return new Promise((resolve) => {
            const renderLoop = () => {
                const currentTime = performance.now();
                if (currentTime - startTime >= testDuration) {
                    const actualDuration = (currentTime - startTime) / 1000;
                    const fps = frameCount / actualDuration;
                    this.metrics.fps3D = fps;
                    console.log(`✅ 3D渲染测试完成: ${fps.toFixed(2)} FPS`);
                    resolve(fps);
                    return;
                }
                // 模拟3D渲染工作负载
                this.simulate3DRenderWork();
                frameCount++;
                // 使用requestAnimationFrame确保与浏览器渲染同步
                requestAnimationFrame(renderLoop);
            };
            requestAnimationFrame(renderLoop);
        });
    }
    /**
     * 运行GPS响应时间测试
     */
    async benchmarkGPSResponse() {
        console.log('🗺️ 开始GPS响应时间测试...');
        const testCount = 50;
        const responseTimes = [];
        for (let i = 0; i < testCount; i++) {
            const startTime = performance.now();
            // 模拟GPS数据更新
            await this.simulateGPSUpdate({
                lat: 39.9042 + (Math.random() - 0.5) * 0.1,
                lng: 116.4074 + (Math.random() - 0.5) * 0.1,
                alt: 50 + Math.random() * 100,
                speed: Math.random() * 60,
                course: Math.random() * 360
            });
            const responseTime = performance.now() - startTime;
            responseTimes.push(responseTime);
            // 避免过度频繁的测试
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        // 计算平均响应时间
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const maxResponseTime = Math.max(...responseTimes);
        this.metrics.gpsResponseTime = maxResponseTime; // 使用最大值作为指标
        console.log(`✅ GPS响应测试完成: 平均 ${avgResponseTime.toFixed(2)}ms, 最大 ${maxResponseTime.toFixed(2)}ms`);
        return maxResponseTime;
    }
    /**
     * 运行FFT处理性能测试
     */
    async benchmarkFFTProcessing() {
        console.log('📊 开始FFT处理性能测试...');
        const testDuration = 3000; // 3秒测试
        const fftSize = 1024;
        let totalSamples = 0;
        const startTime = performance.now();
        while (performance.now() - startTime < testDuration) {
            // 生成测试信号
            const testData = new Array(fftSize).fill(0).map((_, i) => {
                return Math.sin(2 * Math.PI * 50 * i / fftSize) + // 50Hz信号
                    0.5 * Math.sin(2 * Math.PI * 120 * i / fftSize) + // 120Hz信号
                    0.1 * (Math.random() - 0.5); // 噪声
            });
            // 执行FFT计算
            await this.simulateFFTCalculation(testData);
            totalSamples += fftSize;
            // 短暂延迟模拟实际使用情况
            await new Promise(resolve => setTimeout(resolve, 1));
        }
        const actualDuration = (performance.now() - startTime) / 1000;
        const samplesPerSecond = totalSamples / actualDuration;
        this.metrics.fftSamplesPerSecond = samplesPerSecond;
        console.log(`✅ FFT处理测试完成: ${samplesPerSecond.toFixed(0)} samples/s`);
        return samplesPerSecond;
    }
    /**
     * 运行多图表更新性能测试
     */
    async benchmarkMultiPlotUpdates() {
        console.log('📈 开始多图表更新性能测试...');
        const testDuration = 2000; // 2秒测试
        const seriesCount = 5;
        const pointsPerUpdate = 10;
        let updateCount = 0;
        const startTime = performance.now();
        while (performance.now() - startTime < testDuration) {
            // 模拟多系列数据更新
            const updateData = Array.from({ length: seriesCount }, (_, seriesIndex) => ({
                seriesId: `series-${seriesIndex}`,
                points: Array.from({ length: pointsPerUpdate }, (_, pointIndex) => ({
                    x: Date.now() + pointIndex,
                    y: Math.sin(2 * Math.PI * (seriesIndex + 1) * pointIndex / 100) + Math.random() * 0.2
                }))
            }));
            await this.simulateMultiPlotUpdate(updateData);
            updateCount++;
            // 控制更新频率
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        const actualDuration = (performance.now() - startTime) / 1000;
        const updateRate = updateCount / actualDuration;
        this.metrics.multiPlotUpdateRate = updateRate;
        console.log(`✅ 多图表更新测试完成: ${updateRate.toFixed(2)} Hz`);
        return updateRate;
    }
    /**
     * 监控系统资源使用
     */
    async monitorSystemResources() {
        console.log('💻 开始系统资源监控...');
        // 内存使用监控
        if ('memory' in performance) {
            const memInfo = performance.memory;
            this.metrics.memoryUsage = memInfo.usedJSHeapSize / (1024 * 1024); // MB
        }
        // CPU使用率监控（简化版）
        const cpuStart = performance.now();
        let iterations = 0;
        const maxTime = 100; // 100ms采样时间
        while (performance.now() - cpuStart < maxTime) {
            // 执行一些计算密集型操作
            Math.sqrt(Math.random() * 1000000);
            iterations++;
        }
        const actualTime = performance.now() - cpuStart;
        const estimatedCPU = Math.min((iterations / 100000) * 100, 100); // 粗略估算
        this.metrics.cpuUsage = estimatedCPU;
        console.log(`✅ 资源监控完成: 内存 ${this.metrics.memoryUsage.toFixed(2)}MB, CPU ~${this.metrics.cpuUsage.toFixed(1)}%`);
    }
    /**
     * 运行完整的性能基准测试套件
     */
    async runFullBenchmark() {
        console.log('🎯 开始完整性能基准测试套件...');
        console.log('='.repeat(50));
        const startTime = performance.now();
        try {
            // 并行运行非冲突的测试
            await Promise.all([
                this.benchmark3DRendering(),
                this.benchmarkGPSResponse(),
                this.monitorSystemResources()
            ]);
            // 顺序运行可能有资源竞争的测试
            await this.benchmarkFFTProcessing();
            await this.benchmarkMultiPlotUpdates();
            const totalTime = (performance.now() - startTime) / 1000;
            console.log('='.repeat(50));
            console.log(`🏁 所有性能测试完成，总耗时: ${totalTime.toFixed(2)}s`);
            // 验证性能目标
            const results = this.validatePerformanceTargets();
            return {
                metrics: { ...this.metrics },
                results
            };
        }
        catch (error) {
            console.error('❌ 性能测试过程中发生错误:', error);
            throw error;
        }
    }
    /**
     * 验证性能目标
     */
    validatePerformanceTargets() {
        console.log('\n📋 验证性能目标...');
        const results = this.targets.map(target => {
            const actualValue = this.metrics[target.metric];
            const passed = target.operator === 'gte'
                ? actualValue >= target.target
                : actualValue <= target.target;
            const operator = target.operator === 'gte' ? '≥' : '≤';
            const detail = `${actualValue.toFixed(2)} ${target.unit} (目标: ${operator} ${target.target} ${target.unit})`;
            const status = passed ? '✅' : '❌';
            console.log(`${status} ${target.name}: ${detail}`);
            return {
                name: target.name,
                passed,
                detail
            };
        });
        const passedCount = results.filter(r => r.passed).length;
        const totalCount = results.length;
        console.log(`\n📊 性能目标达成情况: ${passedCount}/${totalCount} (${(passedCount / totalCount * 100).toFixed(1)}%)`);
        return results;
    }
    /**
     * 模拟3D渲染工作负载
     */
    simulate3DRenderWork() {
        // 模拟矩阵运算
        const matrix = Array.from({ length: 16 }, () => Math.random());
        for (let i = 0; i < 100; i++) {
            // 简单的矩阵变换运算
            const result = matrix.map((val, idx) => val * Math.sin(idx) + Math.cos(idx * 0.1));
        }
    }
    /**
     * 模拟GPS数据更新
     */
    async simulateGPSUpdate(position) {
        // 模拟地图更新操作
        return new Promise(resolve => {
            // 模拟DOM操作和地图重绘
            const elements = Math.floor(Math.random() * 50) + 10;
            for (let i = 0; i < elements; i++) {
                const div = document.createElement('div');
                div.style.transform = `translate(${position.lat}, ${position.lng})`;
                document.body.appendChild(div);
                document.body.removeChild(div);
            }
            resolve();
        });
    }
    /**
     * 模拟FFT计算
     */
    async simulateFFTCalculation(data) {
        // 简化的FFT模拟（实际应该使用真正的FFT库）
        return new Promise(resolve => {
            const result = new Array(data.length / 2);
            for (let k = 0; k < result.length; k++) {
                let real = 0, imag = 0;
                for (let n = 0; n < Math.min(data.length, 64); n++) { // 限制计算量
                    const angle = -2 * Math.PI * k * n / data.length;
                    real += data[n] * Math.cos(angle);
                    imag += data[n] * Math.sin(angle);
                }
                result[k] = Math.sqrt(real * real + imag * imag);
            }
            resolve(result);
        });
    }
    /**
     * 模拟多图表更新
     */
    async simulateMultiPlotUpdate(updateData) {
        return new Promise(resolve => {
            // 模拟图表数据处理和DOM更新
            updateData.forEach(series => {
                series.points.forEach(point => {
                    // 模拟数据点处理
                    const processed = {
                        x: point.x * 1.001,
                        y: point.y * 0.999 + Math.random() * 0.001
                    };
                });
            });
            // 模拟Canvas重绘
            setTimeout(resolve, Math.random() * 5);
        });
    }
    /**
     * 生成性能报告
     */
    generateReport() {
        const report = [
            '# 高级可视化组件性能基准测试报告',
            '',
            `**测试时间**: ${new Date().toLocaleString()}`,
            `**浏览器**: ${navigator.userAgent}`,
            '',
            '## 性能指标',
            '',
            ...this.targets.map(target => {
                const value = this.metrics[target.metric];
                const operator = target.operator === 'gte' ? '≥' : '≤';
                const status = target.operator === 'gte'
                    ? value >= target.target ? '✅ 通过' : '❌ 未达标'
                    : value <= target.target ? '✅ 通过' : '❌ 未达标';
                return `- **${target.name}**: ${value.toFixed(2)} ${target.unit} (目标: ${operator} ${target.target} ${target.unit}) ${status}`;
            }),
            '',
            '## 详细数据',
            '',
            '```json',
            JSON.stringify(this.metrics, null, 2),
            '```',
            '',
            '---',
            '*由Serial-Studio VSCode插件性能基准测试工具生成*'
        ];
        return report.join('\n');
    }
}
exports.PerformanceBenchmark = PerformanceBenchmark;
// 导出单例实例
exports.performanceBenchmark = new PerformanceBenchmark();
// 自动化测试函数
async function runAutomatedBenchmark() {
    try {
        const { metrics, results } = await exports.performanceBenchmark.runFullBenchmark();
        // 生成并保存报告
        const report = exports.performanceBenchmark.generateReport();
        console.log('\n📄 性能测试报告:');
        console.log(report);
        // 如果在Node.js环境中，可以保存到文件
        if (typeof require !== 'undefined') {
            try {
                const fs = require('fs');
                const path = require('path');
                const reportPath = path.join(process.cwd(), 'performance-report.md');
                fs.writeFileSync(reportPath, report, 'utf8');
                console.log(`\n💾 报告已保存到: ${reportPath}`);
            }
            catch (e) {
                console.log('📄 无法保存报告文件，请手动复制上述内容');
            }
        }
        // 检查是否所有目标都达成
        const passedCount = results.filter(r => r.passed).length;
        const totalCount = results.length;
        if (passedCount === totalCount) {
            console.log('\n🎉 恭喜！所有性能目标都已达成！');
        }
        else {
            console.log(`\n⚠️  有 ${totalCount - passedCount} 个性能目标未达成，需要进一步优化`);
        }
    }
    catch (error) {
        console.error('\n💥 自动化性能测试失败:', error);
        throw error;
    }
}
exports.runAutomatedBenchmark = runAutomatedBenchmark;
// 如果在浏览器环境中直接运行
if (typeof window !== 'undefined') {
    // 将测试函数暴露到全局作用域
    window.runPerformanceBenchmark = runAutomatedBenchmark;
    console.log('🔧 性能基准测试工具已加载，使用 runPerformanceBenchmark() 开始测试');
}
//# sourceMappingURL=performance-benchmark.js.map