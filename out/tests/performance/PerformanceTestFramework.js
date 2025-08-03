"use strict";
/**
 * PerformanceTestFramework - 性能测试框架
 * 对标Serial-Studio性能指标，提供全面的性能测试和基准对比
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceTestFramework = void 0;
const events_1 = require("events");
const perf_hooks_1 = require("perf_hooks");
/**
 * 性能测试套件
 */
class PerformanceTestFramework extends events_1.EventEmitter {
    constructor() {
        super();
        this.testCases = new Map();
        this.results = new Map();
        this.baseline = null;
        this.isRunning = false;
        // 性能监控
        this.memoryMonitor = null;
        this.performanceObserver = null;
        this.setupPerformanceMonitoring();
        this.loadSerialStudioBaseline();
    }
    /**
     * 加载Serial-Studio基准性能数据
     */
    loadSerialStudioBaseline() {
        // 基于Serial-Studio实际性能数据的基准
        this.baseline = {
            // 数据处理性能（基于Serial-Studio的IO性能）
            dataProcessingRate: 1000,
            maxDataRate: 2000000,
            // 渲染性能（基于Qt的渲染能力）
            plotUpdateRate: 30,
            maxPlotPoints: 10000,
            renderFPS: 60,
            // 内存使用（基于Qt应用的内存占用）
            baseMemoryUsage: 50,
            memoryPerDataPoint: 24,
            maxMemoryUsage: 500,
            // 响应延迟（基于实时数据处理）
            averageLatency: 16,
            maxLatency: 100,
            // 并发性能（基于多线程架构）
            maxConcurrentConnections: 10,
            threadPoolSize: 4
        };
    }
    /**
     * 设置性能监控
     */
    setupPerformanceMonitoring() {
        if (typeof PerformanceObserver !== 'undefined') {
            try {
                this.performanceObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.emit('performanceEntry', entry);
                    }
                });
                this.performanceObserver.observe({
                    entryTypes: ['measure', 'mark', 'navigation']
                });
            }
            catch (error) {
                console.warn('性能观察器初始化失败:', error);
            }
        }
    }
    /**
     * 注册测试用例
     */
    registerTest(testCase) {
        this.testCases.set(testCase.name, testCase);
        console.log(`性能测试用例已注册: ${testCase.name}`);
    }
    /**
     * 批量注册测试用例
     */
    registerTests(testCases) {
        testCases.forEach(testCase => this.registerTest(testCase));
    }
    /**
     * 运行单个测试
     */
    async runTest(testName) {
        const testCase = this.testCases.get(testName);
        if (!testCase) {
            throw new Error(`测试用例不存在: ${testName}`);
        }
        console.log(`开始执行性能测试: ${testName}`);
        this.emit('testStart', { testName });
        const result = await this.executeTest(testCase);
        this.results.set(testName, result);
        this.emit('testComplete', { testName, result });
        console.log(`性能测试完成: ${testName}`);
        return result;
    }
    /**
     * 运行所有测试
     */
    async runAllTests() {
        if (this.isRunning) {
            throw new Error('测试套件正在运行中');
        }
        this.isRunning = true;
        this.results.clear();
        console.log(`开始运行性能测试套件，共 ${this.testCases.size} 个测试用例`);
        this.emit('suiteStart', { totalTests: this.testCases.size });
        try {
            for (const [testName] of this.testCases) {
                await this.runTest(testName);
            }
        }
        catch (error) {
            console.error('测试套件执行出错:', error);
            this.emit('suiteError', { error });
        }
        finally {
            this.isRunning = false;
        }
        this.emit('suiteComplete', { results: this.results });
        console.log('性能测试套件执行完成');
        return this.results;
    }
    /**
     * 执行测试用例
     */
    async executeTest(testCase) {
        const { config } = testCase;
        const executionTimes = [];
        const memoryUsages = [];
        const fpsValues = [];
        let setupTime = 0;
        let teardownTime = 0;
        try {
            // 设置阶段
            if (testCase.setup) {
                const setupStart = perf_hooks_1.performance.now();
                await testCase.setup();
                setupTime = perf_hooks_1.performance.now() - setupStart;
            }
            // 预热阶段
            console.log(`预热阶段: ${config.warmupIterations} 次迭代`);
            for (let i = 0; i < config.warmupIterations; i++) {
                await testCase.test();
            }
            // 正式测试阶段
            console.log(`正式测试: ${config.iterations} 次迭代`);
            for (let i = 0; i < config.iterations; i++) {
                // 性能标记
                const markStart = `test-${testCase.name}-${i}-start`;
                const markEnd = `test-${testCase.name}-${i}-end`;
                perf_hooks_1.performance.mark(markStart);
                // 开始内存监控
                const memoryBefore = this.getCurrentMemoryUsage();
                const fpsCounter = this.startFPSCounter();
                // 执行测试
                const result = await Promise.race([
                    testCase.test(),
                    this.createTimeoutPromise(config.timeout)
                ]);
                perf_hooks_1.performance.mark(markEnd);
                // 收集性能数据
                const memoryAfter = this.getCurrentMemoryUsage();
                const fps = this.stopFPSCounter(fpsCounter);
                // 验证结果
                if (testCase.validate && !testCase.validate(result)) {
                    throw new Error(`测试验证失败: ${testCase.name}, 迭代 ${i}`);
                }
                // 记录执行时间
                perf_hooks_1.performance.measure(`test-${testCase.name}-${i}`, markStart, markEnd);
                const entries = perf_hooks_1.performance.getEntriesByName(`test-${testCase.name}-${i}`);
                if (entries.length > 0) {
                    executionTimes.push(entries[0].duration);
                }
                memoryUsages.push(memoryAfter - memoryBefore);
                fpsValues.push(fps);
                // 进度通知
                this.emit('testProgress', {
                    testName: testCase.name,
                    iteration: i + 1,
                    total: config.iterations
                });
            }
            // 清理阶段
            if (testCase.teardown) {
                const teardownStart = perf_hooks_1.performance.now();
                await testCase.teardown();
                teardownTime = perf_hooks_1.performance.now() - teardownStart;
            }
        }
        catch (error) {
            console.error(`测试执行失败: ${testCase.name}`, error);
            throw error;
        }
        // 计算统计数据
        const stats = this.calculateStatistics(executionTimes);
        const avgMemory = memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length;
        const avgFPS = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
        // 计算吞吐量和延迟
        const throughput = config.dataSize / (stats.average / 1000); // items/second
        const latency = stats.average; // 使用执行时间作为延迟
        // 生成测试结果
        const result = {
            testName: testCase.name,
            success: true,
            executionTime: stats.total,
            averageTime: stats.average,
            minTime: stats.min,
            maxTime: stats.max,
            standardDeviation: stats.standardDeviation,
            fps: avgFPS,
            memoryUsage: avgMemory,
            cpuUsage: 0,
            throughput,
            latency,
            iterations: config.iterations,
            timestamp: Date.now(),
            environment: {
                platform: process.platform,
                nodeVersion: process.version,
                memoryLimit: this.getMemoryLimit()
            }
        };
        // 计算与基准的对比
        if (this.baseline) {
            result.baselineComparison = this.compareWithBaseline(result);
        }
        return result;
    }
    /**
     * 计算统计数据
     */
    calculateStatistics(values) {
        const total = values.reduce((sum, value) => sum + value, 0);
        const average = total / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const variance = values.reduce((sum, value) => {
            return sum + Math.pow(value - average, 2);
        }, 0) / values.length;
        const standardDeviation = Math.sqrt(variance);
        return { total, average, min, max, standardDeviation };
    }
    /**
     * 与基准数据对比
     */
    compareWithBaseline(result) {
        if (!this.baseline) {
            return { fpsRatio: 1, memoryRatio: 1, throughputRatio: 1, latencyRatio: 1 };
        }
        return {
            fpsRatio: result.fps / this.baseline.renderFPS,
            memoryRatio: result.memoryUsage / this.baseline.baseMemoryUsage,
            throughputRatio: result.throughput / this.baseline.dataProcessingRate,
            latencyRatio: result.latency / this.baseline.averageLatency
        };
    }
    /**
     * 获取当前内存使用量
     */
    getCurrentMemoryUsage() {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const usage = process.memoryUsage();
            return usage.heapUsed / (1024 * 1024); // MB
        }
        return 0;
    }
    /**
     * 开始FPS计数器
     */
    startFPSCounter() {
        return {
            startTime: perf_hooks_1.performance.now(),
            frameCount: 0
        };
    }
    /**
     * 停止FPS计数器
     */
    stopFPSCounter(counter) {
        const endTime = perf_hooks_1.performance.now();
        const duration = endTime - counter.startTime;
        return duration > 0 ? (counter.frameCount * 1000) / duration : 0;
    }
    /**
     * 获取内存限制
     */
    getMemoryLimit() {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const usage = process.memoryUsage();
            return usage.heapTotal / (1024 * 1024); // MB
        }
        return 0;
    }
    /**
     * 创建超时Promise
     */
    createTimeoutPromise(timeout) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`测试超时: ${timeout}ms`));
            }, timeout);
        });
    }
    /**
     * 生成性能报告
     */
    generateReport() {
        const results = Array.from(this.results.values());
        const passedTests = results.filter(r => r.success);
        const failedTests = results.filter(r => !r.success);
        // 计算总体统计
        const avgFPS = passedTests.reduce((sum, r) => sum + r.fps, 0) / passedTests.length;
        const avgMemory = passedTests.reduce((sum, r) => sum + r.memoryUsage, 0) / passedTests.length;
        const avgThroughput = passedTests.reduce((sum, r) => sum + r.throughput, 0) / passedTests.length;
        const avgLatency = passedTests.reduce((sum, r) => sum + r.latency, 0) / passedTests.length;
        // 生成建议
        const recommendations = [];
        if (this.baseline) {
            if (avgFPS < this.baseline.renderFPS * 0.8) {
                recommendations.push('FPS性能低于基准，建议优化渲染管道');
            }
            if (avgMemory > this.baseline.baseMemoryUsage * 1.5) {
                recommendations.push('内存使用过高，建议优化内存管理');
            }
            if (avgLatency > this.baseline.averageLatency * 2) {
                recommendations.push('响应延迟过高，建议优化数据处理流程');
            }
            if (avgThroughput < this.baseline.dataProcessingRate * 0.7) {
                recommendations.push('数据处理吞吐量偏低，建议优化算法或使用多线程');
            }
        }
        return {
            summary: {
                totalTests: results.length,
                passedTests: passedTests.length,
                failedTests: failedTests.length,
                avgFPS,
                avgMemory,
                avgThroughput,
                avgLatency,
                overallScore: this.calculateOverallScore(results)
            },
            details: results,
            baseline: this.baseline,
            recommendations
        };
    }
    /**
     * 计算综合评分
     */
    calculateOverallScore(results) {
        if (results.length === 0 || !this.baseline)
            return 0;
        let totalScore = 0;
        let weightSum = 0;
        for (const result of results) {
            if (!result.success || !result.baselineComparison)
                continue;
            const { baselineComparison } = result;
            // 各项指标权重
            const fpsWeight = 0.3;
            const memoryWeight = 0.25;
            const throughputWeight = 0.25;
            const latencyWeight = 0.2;
            // 计算各项得分（比值越接近1越好，超过1.2或低于0.8扣分）
            const fpsScore = Math.max(0, 100 - Math.abs(baselineComparison.fpsRatio - 1) * 100);
            const memoryScore = Math.max(0, 100 - Math.max(0, baselineComparison.memoryRatio - 1) * 200);
            const throughputScore = Math.max(0, 100 - Math.abs(baselineComparison.throughputRatio - 1) * 100);
            const latencyScore = Math.max(0, 100 - Math.max(0, baselineComparison.latencyRatio - 1) * 150);
            const weightedScore = fpsScore * fpsWeight +
                memoryScore * memoryWeight +
                throughputScore * throughputWeight +
                latencyScore * latencyWeight;
            totalScore += weightedScore;
            weightSum += 1;
        }
        return weightSum > 0 ? Math.round(totalScore / weightSum) : 0;
    }
    /**
     * 获取测试结果
     */
    getResults() {
        return this.results;
    }
    /**
     * 清理资源
     */
    destroy() {
        if (this.memoryMonitor) {
            clearInterval(this.memoryMonitor);
            this.memoryMonitor = null;
        }
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
            this.performanceObserver = null;
        }
        this.removeAllListeners();
        this.testCases.clear();
        this.results.clear();
    }
}
exports.PerformanceTestFramework = PerformanceTestFramework;
exports.default = PerformanceTestFramework;
//# sourceMappingURL=PerformanceTestFramework.js.map