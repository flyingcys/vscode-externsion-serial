"use strict";
/**
 * PerformanceTestSuites - 性能测试用例集合
 * 包含所有核心功能的性能测试，对标Serial-Studio的性能指标
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceTestManager = exports.VirtualizationTests = exports.RenderingPerformanceTests = exports.MemoryManagementTests = exports.DataProcessingTests = void 0;
const PerformanceTestFramework_1 = __importDefault(require("./PerformanceTestFramework"));
const HighFrequencyRenderer_1 = __importDefault(require("../../shared/HighFrequencyRenderer"));
const VirtualizationManager_1 = require("../../shared/VirtualizationManager");
const ObjectPoolManager_1 = require("../../shared/ObjectPoolManager");
const MemoryMonitor_1 = require("../../shared/MemoryMonitor");
/**
 * 测试数据生成器
 */
class TestDataGenerator {
    /**
     * 生成模拟串口数据
     */
    static generateSerialData(size) {
        const frames = [];
        for (let i = 0; i < size; i++) {
            // 模拟JSON格式的传感器数据
            const data = {
                timestamp: Date.now(),
                temperature: 20 + Math.sin(i / 100) * 10 + Math.random() * 2,
                humidity: 50 + Math.cos(i / 80) * 20 + Math.random() * 5,
                pressure: 1013 + Math.sin(i / 200) * 50 + Math.random() * 10,
                voltage: 3.3 + Math.random() * 0.2
            };
            frames.push(Buffer.from(JSON.stringify(data) + '\n'));
        }
        return frames;
    }
    /**
     * 生成图表数据点
     */
    static generatePlotData(pointCount, seriesCount = 1) {
        const datasets = [];
        for (let s = 0; s < seriesCount; s++) {
            const points = [];
            for (let i = 0; i < pointCount; i++) {
                points.push({
                    x: i,
                    y: Math.sin(i / 50 + s) * 50 + Math.random() * 10,
                    timestamp: Date.now() + i * 100
                });
            }
            datasets.push({
                title: `Series ${s + 1}`,
                data: points,
                color: `hsl(${s * 60}, 70%, 50%)`
            });
        }
        return datasets;
    }
    /**
     * 生成大量表格数据
     */
    static generateTableData(rowCount) {
        const rows = [];
        for (let i = 0; i < rowCount; i++) {
            rows.push({
                id: i,
                timestamp: Date.now() + i * 1000,
                device: `Device_${i % 10}`,
                data: Math.random() * 1000,
                status: i % 3 === 0 ? 'error' : 'ok',
                message: `Log entry ${i} with some sample data`,
                value1: Math.random() * 100,
                value2: Math.random() * 200,
                value3: Math.random() * 300
            });
        }
        return rows;
    }
}
/**
 * 数据处理性能测试
 */
class DataProcessingTests {
    static getTests() {
        return [
            {
                name: 'serial-data-parsing',
                description: '串口数据解析性能测试',
                config: {
                    name: 'serial-data-parsing',
                    description: '测试串口数据解析的吞吐量和延迟',
                    iterations: 100,
                    warmupIterations: 10,
                    timeout: 5000,
                    dataSize: 1000,
                    targetFPS: 60
                },
                test: async () => {
                    const frames = TestDataGenerator.generateSerialData(1000);
                    const startTime = performance.now();
                    let processedCount = 0;
                    for (const frame of frames) {
                        // 模拟数据解析
                        const data = JSON.parse(frame.toString().trim());
                        // 模拟数据验证和处理
                        if (data.timestamp && data.temperature !== undefined) {
                            processedCount++;
                        }
                    }
                    const endTime = performance.now();
                    const processingTime = endTime - startTime;
                    return {
                        processedFrames: processedCount,
                        processingTime,
                        throughput: processedCount / (processingTime / 1000)
                    };
                },
                validate: (result) => {
                    return result.processedFrames === 1000 && result.throughput > 500;
                }
            },
            {
                name: 'high-frequency-data-stream',
                description: '高频数据流处理测试',
                config: {
                    name: 'high-frequency-data-stream',
                    description: '模拟高频率数据流的处理能力',
                    iterations: 50,
                    warmupIterations: 5,
                    timeout: 10000,
                    dataSize: 10000,
                    targetFPS: 30
                },
                test: async () => {
                    const dataStream = TestDataGenerator.generateSerialData(10000);
                    const startTime = performance.now();
                    let processedBytes = 0;
                    // 模拟实时数据流处理
                    for (let i = 0; i < dataStream.length; i++) {
                        const frame = dataStream[i];
                        processedBytes += frame.length;
                        // 模拟每100帧的批处理
                        if (i % 100 === 0) {
                            await new Promise(resolve => setImmediate(resolve));
                        }
                    }
                    const endTime = performance.now();
                    const processingTime = endTime - startTime;
                    return {
                        processedBytes,
                        processingTime,
                        dataRate: processedBytes / (processingTime / 1000),
                        frameRate: dataStream.length / (processingTime / 1000) // frames/second
                    };
                },
                validate: (result) => {
                    return result.dataRate > 100000 && result.frameRate > 500; // 100KB/s, 500fps
                }
            }
        ];
    }
}
exports.DataProcessingTests = DataProcessingTests;
/**
 * 内存管理性能测试
 */
class MemoryManagementTests {
    static getTests() {
        return [
            {
                name: 'object-pool-performance',
                description: '对象池性能测试',
                config: {
                    name: 'object-pool-performance',
                    description: '测试对象池的分配和回收性能',
                    iterations: 1000,
                    warmupIterations: 100,
                    timeout: 5000,
                    dataSize: 10000
                },
                setup: async () => {
                    ObjectPoolManager_1.objectPoolManager.initialize();
                },
                test: async () => {
                    const startTime = performance.now();
                    const objects = [];
                    // 大量对象分配
                    for (let i = 0; i < 10000; i++) {
                        const dataPoint = ObjectPoolManager_1.objectPoolManager.acquireDataPoint();
                        dataPoint.x = i;
                        dataPoint.y = Math.random() * 100;
                        dataPoint.timestamp = Date.now();
                        objects.push(dataPoint);
                    }
                    const allocationTime = performance.now() - startTime;
                    // 对象回收
                    const releaseStart = performance.now();
                    ObjectPoolManager_1.objectPoolManager.releaseDataPoints(objects);
                    const releaseTime = performance.now() - releaseStart;
                    return {
                        allocationTime,
                        releaseTime,
                        totalTime: allocationTime + releaseTime,
                        objectCount: objects.length,
                        allocationRate: objects.length / (allocationTime / 1000),
                        releaseRate: objects.length / (releaseTime / 1000)
                    };
                },
                validate: (result) => {
                    return result.allocationRate > 50000 && result.releaseRate > 100000;
                },
                teardown: async () => {
                    ObjectPoolManager_1.objectPoolManager.reset();
                }
            },
            {
                name: 'memory-leak-detection',
                description: '内存泄漏检测性能测试',
                config: {
                    name: 'memory-leak-detection',
                    description: '测试内存监控和泄漏检测的性能开销',
                    iterations: 10,
                    warmupIterations: 2,
                    timeout: 30000,
                    dataSize: 50000
                },
                setup: async () => {
                    MemoryMonitor_1.memoryMonitor.startMonitoring(1000, 5000);
                },
                test: async () => {
                    const startMemory = process.memoryUsage().heapUsed;
                    const startTime = performance.now();
                    // 模拟内存密集型操作
                    const arrays = [];
                    for (let i = 0; i < 1000; i++) {
                        arrays.push(new Array(1000).fill(Math.random()));
                        if (i % 100 === 0) {
                            await new Promise(resolve => setTimeout(resolve, 10));
                        }
                    }
                    // 等待内存监控收集数据
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    const endTime = performance.now();
                    const endMemory = process.memoryUsage().heapUsed;
                    return {
                        processingTime: endTime - startTime,
                        memoryIncrease: (endMemory - startMemory) / (1024 * 1024),
                        monitoringOverhead: (endTime - startTime) / 1000 // seconds
                    };
                },
                validate: (result) => {
                    return result.monitoringOverhead < 5 && result.memoryIncrease > 0;
                },
                teardown: async () => {
                    MemoryMonitor_1.memoryMonitor.stopMonitoring();
                }
            }
        ];
    }
}
exports.MemoryManagementTests = MemoryManagementTests;
/**
 * 渲染性能测试
 */
class RenderingPerformanceTests {
    static getTests() {
        return [
            {
                name: 'high-frequency-renderer',
                description: '高频渲染器性能测试',
                config: {
                    name: 'high-frequency-renderer',
                    description: '测试高频渲染器的帧率和延迟',
                    iterations: 100,
                    warmupIterations: 10,
                    timeout: 10000,
                    dataSize: 1000,
                    targetFPS: 30
                },
                setup: async () => {
                    // 创建模拟Canvas环境
                    global.OffscreenCanvas = class MockOffscreenCanvas {
                        constructor() {
                            this.width = 800;
                            this.height = 600;
                        }
                        getContext() {
                            return {
                                clearRect: () => { },
                                fillRect: () => { },
                                strokeRect: () => { },
                                beginPath: () => { },
                                moveTo: () => { },
                                lineTo: () => { },
                                stroke: () => { },
                                fill: () => { }
                            };
                        }
                    };
                },
                test: async () => {
                    const renderer = new HighFrequencyRenderer_1.default({
                        targetFPS: 30,
                        enableBatching: true
                    });
                    const startTime = performance.now();
                    let renderedFrames = 0;
                    // 模拟大量渲染任务
                    for (let i = 0; i < 1000; i++) {
                        renderer.scheduleRender({
                            type: 'update',
                            widgetId: `test-widget-${i % 10}`,
                            data: { value: Math.random() * 100 },
                            priority: 'medium'
                        });
                        if (i % 30 === 0) {
                            await new Promise(resolve => setTimeout(resolve, 33)); // ~30fps
                            renderedFrames++;
                        }
                    }
                    const endTime = performance.now();
                    const totalTime = endTime - startTime;
                    renderer.dispose();
                    return {
                        totalTime,
                        renderedFrames,
                        averageFPS: renderedFrames / (totalTime / 1000),
                        averageFrameTime: totalTime / renderedFrames
                    };
                },
                validate: (result) => {
                    return result.averageFPS >= 25 && result.averageFrameTime <= 40;
                }
            },
            {
                name: 'canvas-rendering-throughput',
                description: 'Canvas渲染吞吐量测试',
                config: {
                    name: 'canvas-rendering-throughput',
                    description: '测试Canvas渲染的数据点处理能力',
                    iterations: 50,
                    warmupIterations: 5,
                    timeout: 15000,
                    dataSize: 5000
                },
                test: async () => {
                    const datasets = TestDataGenerator.generatePlotData(5000, 3);
                    const startTime = performance.now();
                    let totalPointsRendered = 0;
                    // 模拟增量渲染
                    for (const dataset of datasets) {
                        for (let i = 0; i < dataset.data.length; i += 100) {
                            const batch = dataset.data.slice(i, i + 100);
                            // 模拟渲染处理时间
                            const renderStart = performance.now();
                            while (performance.now() - renderStart < 1) {
                                // 模拟渲染工作
                            }
                            totalPointsRendered += batch.length;
                        }
                    }
                    const endTime = performance.now();
                    const totalTime = endTime - startTime;
                    return {
                        totalTime,
                        totalPointsRendered,
                        renderThroughput: totalPointsRendered / (totalTime / 1000),
                        averageRenderTime: totalTime / totalPointsRendered
                    };
                },
                validate: (result) => {
                    return result.renderThroughput > 1000 && result.averageRenderTime < 1;
                }
            }
        ];
    }
}
exports.RenderingPerformanceTests = RenderingPerformanceTests;
/**
 * 虚拟化性能测试
 */
class VirtualizationTests {
    static getTests() {
        return [
            {
                name: 'virtual-list-scrolling',
                description: '虚拟列表滚动性能测试',
                config: {
                    name: 'virtual-list-scrolling',
                    description: '测试虚拟列表在大数据量下的滚动性能',
                    iterations: 100,
                    warmupIterations: 10,
                    timeout: 10000,
                    dataSize: 100000
                },
                setup: async () => {
                    // 初始化虚拟化管理器
                    VirtualizationManager_1.VirtualizationManager.getInstance();
                },
                test: async () => {
                    const vm = VirtualizationManager_1.VirtualizationManager.getInstance();
                    const testData = TestDataGenerator.generateTableData(100000);
                    // 注册虚拟列表实例
                    const instance = vm.registerInstance('test-virtual-list', 'list', {
                        itemCount: testData.length,
                        containerHeight: 400,
                        itemHeight: 32
                    });
                    const startTime = performance.now();
                    let scrollOperations = 0;
                    // 模拟滚动操作
                    for (let scrollTop = 0; scrollTop < 50000; scrollTop += 500) {
                        const visibleRange = vm.calculateVisibleRange('test-virtual-list', scrollTop, 400, testData.length);
                        vm.updateInstance('test-virtual-list', {
                            scrollTop,
                            visibleRange,
                            isScrolling: true
                        });
                        scrollOperations++;
                        // 模拟渲染延迟
                        if (scrollOperations % 10 === 0) {
                            await new Promise(resolve => setImmediate(resolve));
                        }
                    }
                    const endTime = performance.now();
                    const totalTime = endTime - startTime;
                    vm.unregisterInstance('test-virtual-list');
                    return {
                        scrollOperations,
                        totalTime,
                        scrollFPS: scrollOperations / (totalTime / 1000),
                        averageScrollTime: totalTime / scrollOperations
                    };
                },
                validate: (result) => {
                    return result.scrollFPS >= 30 && result.averageScrollTime <= 33;
                }
            },
            {
                name: 'virtual-table-data-handling',
                description: '虚拟表格数据处理性能测试',
                config: {
                    name: 'virtual-table-data-handling',
                    description: '测试虚拟表格处理大量数据的性能',
                    iterations: 50,
                    warmupIterations: 5,
                    timeout: 20000,
                    dataSize: 500000
                },
                test: async () => {
                    const vm = VirtualizationManager_1.VirtualizationManager.getInstance();
                    const largeDataset = TestDataGenerator.generateTableData(500000);
                    const instance = vm.registerInstance('test-virtual-table', 'table', {
                        itemCount: largeDataset.length,
                        containerHeight: 600,
                        itemHeight: 40
                    });
                    const startTime = performance.now();
                    // 模拟数据更新和渲染
                    let updatedRows = 0;
                    for (let i = 0; i < 1000; i++) {
                        // 模拟数据更新
                        const randomIndex = Math.floor(Math.random() * largeDataset.length);
                        largeDataset[randomIndex].data = Math.random() * 1000;
                        // 计算可视范围
                        const scrollTop = Math.random() * (largeDataset.length * 40 - 600);
                        const visibleRange = vm.calculateVisibleRange('test-virtual-table', scrollTop, 600, largeDataset.length);
                        // 模拟缓存操作
                        for (let j = visibleRange.start; j <= visibleRange.end; j++) {
                            vm.cacheItem('test-virtual-table', j, largeDataset[j], 40);
                        }
                        updatedRows++;
                        if (i % 50 === 0) {
                            await new Promise(resolve => setImmediate(resolve));
                        }
                    }
                    const endTime = performance.now();
                    const totalTime = endTime - startTime;
                    const stats = vm.getGlobalStats();
                    vm.unregisterInstance('test-virtual-table');
                    return {
                        updatedRows,
                        totalTime,
                        updateRate: updatedRows / (totalTime / 1000),
                        cacheHitRate: stats.averageCacheHitRate,
                        memoryUsage: stats.totalMemoryUsage
                    };
                },
                validate: (result) => {
                    return result.updateRate > 100 && result.memoryUsage < 100 * 1024 * 1024; // 100MB
                }
            }
        ];
    }
}
exports.VirtualizationTests = VirtualizationTests;
/**
 * 性能测试套件管理器
 */
class PerformanceTestManager {
    constructor() {
        this.framework = new PerformanceTestFramework_1.default();
        this.registerAllTests();
    }
    /**
     * 注册所有测试用例
     */
    registerAllTests() {
        // 数据处理测试
        this.framework.registerTests(DataProcessingTests.getTests());
        // 内存管理测试
        this.framework.registerTests(MemoryManagementTests.getTests());
        // 渲染性能测试
        this.framework.registerTests(RenderingPerformanceTests.getTests());
        // 虚拟化测试
        this.framework.registerTests(VirtualizationTests.getTests());
    }
    /**
     * 运行完整测试套件
     */
    async runFullSuite() {
        console.log('='.repeat(60));
        console.log('开始运行完整性能测试套件');
        console.log('='.repeat(60));
        try {
            const results = await this.framework.runAllTests();
            const report = this.framework.generateReport();
            console.log('\n' + '='.repeat(60));
            console.log('性能测试报告');
            console.log('='.repeat(60));
            console.log(`\n总体统计:`);
            console.log(`- 总测试数: ${report.summary.totalTests}`);
            console.log(`- 通过测试: ${report.summary.passedTests}`);
            console.log(`- 失败测试: ${report.summary.failedTests}`);
            console.log(`- 综合评分: ${report.summary.overallScore}/100`);
            console.log(`\n性能指标:`);
            console.log(`- 平均FPS: ${report.summary.avgFPS.toFixed(2)}`);
            console.log(`- 平均内存使用: ${report.summary.avgMemory.toFixed(2)} MB`);
            console.log(`- 平均吞吐量: ${report.summary.avgThroughput.toFixed(2)} items/s`);
            console.log(`- 平均延迟: ${report.summary.avgLatency.toFixed(2)} ms`);
            if (report.recommendations.length > 0) {
                console.log(`\n优化建议:`);
                report.recommendations.forEach((rec, index) => {
                    console.log(`${index + 1}. ${rec}`);
                });
            }
            // 详细结果
            console.log(`\n详细测试结果:`);
            for (const result of report.details) {
                console.log(`\n[${result.success ? '✓' : '✗'}] ${result.testName}`);
                console.log(`   - 执行时间: ${result.averageTime.toFixed(2)}ms`);
                console.log(`   - FPS: ${result.fps.toFixed(2)}`);
                console.log(`   - 内存使用: ${result.memoryUsage.toFixed(2)}MB`);
                console.log(`   - 吞吐量: ${result.throughput.toFixed(2)} items/s`);
                if (result.baselineComparison) {
                    const comp = result.baselineComparison;
                    console.log(`   - 基准对比:`);
                    console.log(`     FPS: ${(comp.fpsRatio * 100).toFixed(1)}%`);
                    console.log(`     内存: ${(comp.memoryRatio * 100).toFixed(1)}%`);
                    console.log(`     吞吐量: ${(comp.throughputRatio * 100).toFixed(1)}%`);
                    console.log(`     延迟: ${(comp.latencyRatio * 100).toFixed(1)}%`);
                }
            }
        }
        catch (error) {
            console.error('性能测试套件执行失败:', error);
        }
    }
    /**
     * 运行特定类别的测试
     */
    async runCategory(category) {
        const categoryTests = {
            data: DataProcessingTests.getTests().map(t => t.name),
            memory: MemoryManagementTests.getTests().map(t => t.name),
            rendering: RenderingPerformanceTests.getTests().map(t => t.name),
            virtualization: VirtualizationTests.getTests().map(t => t.name)
        };
        const testsToRun = categoryTests[category];
        for (const testName of testsToRun) {
            await this.framework.runTest(testName);
        }
        const report = this.framework.generateReport();
        console.log(`${category} 测试完成，评分: ${report.summary.overallScore}/100`);
    }
    /**
     * 获取测试框架实例
     */
    getFramework() {
        return this.framework;
    }
    /**
     * 清理资源
     */
    destroy() {
        this.framework.destroy();
    }
}
exports.PerformanceTestManager = PerformanceTestManager;
exports.default = PerformanceTestManager;
//# sourceMappingURL=PerformanceTestSuites.js.map