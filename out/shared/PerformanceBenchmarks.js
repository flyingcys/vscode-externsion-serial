"use strict";
/**
 * PerformanceBenchmarks - 性能基准管理系统
 * 建立和管理CPU、内存、帧率等关键性能指标的基准线
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceBenchmarkManager = exports.PerformanceBenchmarkManager = void 0;
const events_1 = require("events");
const perf_hooks_1 = require("perf_hooks");
/**
 * 性能基准管理器
 */
class PerformanceBenchmarkManager extends events_1.EventEmitter {
    static instance = null;
    baselines = new Map();
    results = new Map();
    currentConfig;
    // 硬件级别定义
    hardwareClasses = new Map([
        ['low', {
                cpu: { cores: 2, baseFrequency: 2.0, maxFrequency: 2.8 },
                memory: { total: 4, speed: 2133 },
                storage: { type: 'HDD', speed: 120 }
            }],
        ['medium', {
                cpu: { cores: 4, baseFrequency: 2.5, maxFrequency: 3.5 },
                memory: { total: 8, speed: 2666 },
                storage: { type: 'SSD', speed: 500 }
            }],
        ['high', {
                cpu: { cores: 8, baseFrequency: 3.0, maxFrequency: 4.2 },
                memory: { total: 16, speed: 3200 },
                storage: { type: 'NVMe', speed: 2000 }
            }],
        ['enterprise', {
                cpu: { cores: 16, baseFrequency: 3.2, maxFrequency: 4.5 },
                memory: { total: 32, speed: 3600 },
                storage: { type: 'NVMe', speed: 5000 }
            }]
    ]);
    constructor() {
        super();
        // 默认配置
        this.currentConfig = {
            serialStudioVersion: '1.1.7',
            targetEnvironment: 'development',
            hardwareClass: 'medium',
            dataScenario: 'normal'
        };
        // 初始化基准数据
        this.initializeBaselines();
    }
    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!PerformanceBenchmarkManager.instance) {
            PerformanceBenchmarkManager.instance = new PerformanceBenchmarkManager();
        }
        return PerformanceBenchmarkManager.instance;
    }
    /**
     * 初始化性能基准数据
     */
    initializeBaselines() {
        // Serial-Studio 基准数据（基于实际测试）
        const serialStudioBaseline = {
            cpu: {
                idle: 2.0,
                normal: 15.0,
                peak: 35.0,
                threshold: {
                    warning: 70.0,
                    critical: 85.0
                }
            },
            memory: {
                baseline: 45.0,
                perDataPoint: 24,
                peak: 280.0,
                threshold: {
                    warning: 400.0,
                    critical: 600.0
                }
            },
            rendering: {
                targetFPS: 60,
                minAcceptableFPS: 30,
                maxFrameTime: 16.67,
                threshold: {
                    warning: 25,
                    critical: 15
                }
            },
            dataProcessing: {
                throughput: 1000,
                latency: 8.0,
                maxQueueSize: 10000,
                threshold: {
                    latencyWarning: 50.0,
                    latencyCritical: 100.0
                }
            },
            network: {
                maxBandwidth: 2000000,
                averageLatency: 5.0,
                packetLossRate: 0.01,
                threshold: {
                    bandwidthWarning: 1500000,
                    latencyWarning: 20.0
                }
            }
        };
        this.baselines.set('serial-studio-1.1.7', serialStudioBaseline);
        // 为不同硬件级别调整基准
        this.generateHardwareSpecificBaselines(serialStudioBaseline);
    }
    /**
     * 为不同硬件级别生成基准数据
     */
    generateHardwareSpecificBaselines(baseBaseline) {
        for (const [hardwareClass, specs] of this.hardwareClasses) {
            const adjustedBaseline = this.adjustBaselineForHardware(baseBaseline, specs);
            this.baselines.set(`serial-studio-1.1.7-${hardwareClass}`, adjustedBaseline);
        }
    }
    /**
     * 根据硬件规格调整基准数据
     */
    adjustBaselineForHardware(baseline, hardware) {
        // 根据硬件性能调整基准值
        const cpuMultiplier = Math.min(2.0, hardware.cpu.cores / 4 * hardware.cpu.maxFrequency / 3.0);
        const memoryMultiplier = Math.min(2.0, hardware.memory.total / 8);
        const storageMultiplier = hardware.storage.type === 'NVMe' ? 1.5 :
            hardware.storage.type === 'SSD' ? 1.2 : 1.0;
        return {
            cpu: {
                idle: baseline.cpu.idle / cpuMultiplier,
                normal: baseline.cpu.normal / cpuMultiplier,
                peak: baseline.cpu.peak / cpuMultiplier,
                threshold: {
                    warning: baseline.cpu.threshold.warning,
                    critical: baseline.cpu.threshold.critical
                }
            },
            memory: {
                baseline: baseline.memory.baseline,
                perDataPoint: baseline.memory.perDataPoint,
                peak: baseline.memory.peak * memoryMultiplier,
                threshold: {
                    warning: baseline.memory.threshold.warning * memoryMultiplier,
                    critical: baseline.memory.threshold.critical * memoryMultiplier
                }
            },
            rendering: {
                targetFPS: Math.min(120, baseline.rendering.targetFPS * cpuMultiplier),
                minAcceptableFPS: baseline.rendering.minAcceptableFPS,
                maxFrameTime: baseline.rendering.maxFrameTime / cpuMultiplier,
                threshold: {
                    warning: baseline.rendering.threshold.warning,
                    critical: baseline.rendering.threshold.critical
                }
            },
            dataProcessing: {
                throughput: baseline.dataProcessing.throughput * cpuMultiplier * storageMultiplier,
                latency: baseline.dataProcessing.latency / cpuMultiplier,
                maxQueueSize: baseline.dataProcessing.maxQueueSize * memoryMultiplier,
                threshold: {
                    latencyWarning: baseline.dataProcessing.threshold.latencyWarning,
                    latencyCritical: baseline.dataProcessing.threshold.latencyCritical
                }
            },
            network: {
                maxBandwidth: baseline.network.maxBandwidth,
                averageLatency: baseline.network.averageLatency,
                packetLossRate: baseline.network.packetLossRate,
                threshold: {
                    bandwidthWarning: baseline.network.threshold.bandwidthWarning,
                    latencyWarning: baseline.network.threshold.latencyWarning
                }
            }
        };
    }
    /**
     * 运行基准测试
     */
    async runBenchmark(testName) {
        console.log(`开始执行基准测试: ${testName}`);
        const startTime = perf_hooks_1.performance.now();
        // 获取当前基准
        const baselineKey = this.getBaselineKey();
        const baseline = this.baselines.get(baselineKey);
        if (!baseline) {
            throw new Error(`未找到基准数据: ${baselineKey}`);
        }
        // 执行测试
        const metrics = await this.executeTest(testName);
        const endTime = perf_hooks_1.performance.now();
        // 计算评分和等级
        const score = this.calculateScore(metrics, baseline);
        const grade = this.calculateGrade(score);
        const details = this.evaluateDetails(metrics, baseline);
        const result = {
            testName,
            timestamp: Date.now(),
            duration: endTime - startTime,
            metrics,
            score,
            grade,
            passed: score >= 60,
            details
        };
        // 保存结果
        if (!this.results.has(testName)) {
            this.results.set(testName, []);
        }
        this.results.get(testName).push(result);
        this.emit('benchmarkComplete', result);
        console.log(`基准测试完成: ${testName}, 评分: ${score}`);
        return result;
    }
    /**
     * 执行具体的性能测试
     */
    async executeTest(testName) {
        const metrics = {
            cpu: 0,
            memory: 0,
            fps: 0,
            throughput: 0,
            latency: 0
        };
        switch (testName) {
            case 'cpu-performance':
                metrics.cpu = await this.testCPUPerformance();
                break;
            case 'memory-performance':
                metrics.memory = await this.testMemoryPerformance();
                break;
            case 'rendering-performance':
                metrics.fps = await this.testRenderingPerformance();
                break;
            case 'data-processing-performance':
                const dpResult = await this.testDataProcessingPerformance();
                metrics.throughput = dpResult.throughput;
                metrics.latency = dpResult.latency;
                break;
            case 'comprehensive':
                // 综合测试
                metrics.cpu = await this.testCPUPerformance();
                metrics.memory = await this.testMemoryPerformance();
                metrics.fps = await this.testRenderingPerformance();
                const comprehensiveDP = await this.testDataProcessingPerformance();
                metrics.throughput = comprehensiveDP.throughput;
                metrics.latency = comprehensiveDP.latency;
                break;
            default:
                throw new Error(`未知的测试类型: ${testName}`);
        }
        return metrics;
    }
    /**
     * CPU性能测试
     */
    async testCPUPerformance() {
        const iterations = 1000000;
        let result = 0;
        const startTime = perf_hooks_1.performance.now();
        // CPU密集型计算
        for (let i = 0; i < iterations; i++) {
            result += Math.sqrt(i) * Math.sin(i) + Math.cos(i * 0.001);
            // 模拟串口数据处理
            if (i % 1000 === 0) {
                const data = JSON.stringify({
                    timestamp: Date.now(),
                    values: [Math.random(), Math.random(), Math.random()]
                });
                JSON.parse(data);
            }
        }
        const endTime = perf_hooks_1.performance.now();
        const duration = endTime - startTime;
        // 计算CPU性能分数（基于执行时间）
        const baselineDuration = 1000; // 基准执行时间 (ms)
        const cpuScore = Math.max(0, 100 - (duration - baselineDuration) / 10);
        return Math.min(100, cpuScore);
    }
    /**
     * 内存性能测试
     */
    async testMemoryPerformance() {
        const initialMemory = this.getCurrentMemoryUsage();
        const allocations = [];
        // 大量内存分配
        for (let i = 0; i < 10000; i++) {
            const data = new Array(100).fill(0).map(() => ({
                id: i,
                timestamp: Date.now(),
                data: Math.random(),
                processed: false
            }));
            allocations.push(data);
            // 模拟一些内存被释放
            if (i % 100 === 0 && allocations.length > 50) {
                allocations.splice(0, 25);
            }
        }
        const peakMemory = this.getCurrentMemoryUsage();
        const memoryIncrease = peakMemory - initialMemory;
        // 清理内存
        allocations.length = 0;
        // 等待GC
        await new Promise(resolve => setTimeout(resolve, 100));
        const finalMemory = this.getCurrentMemoryUsage();
        const memoryRecovered = peakMemory - finalMemory;
        // 计算内存效率分数
        const efficiency = (memoryRecovered / memoryIncrease) * 100;
        const memoryScore = Math.min(100, efficiency);
        return Math.max(0, memoryScore);
    }
    /**
     * 渲染性能测试
     */
    async testRenderingPerformance() {
        const frameCount = 300; // 测试300帧
        const frameTimes = [];
        for (let i = 0; i < frameCount; i++) {
            const frameStart = perf_hooks_1.performance.now();
            // 模拟渲染工作
            await this.simulateRenderWork();
            const frameEnd = perf_hooks_1.performance.now();
            frameTimes.push(frameEnd - frameStart);
            // 模拟帧间隔
            if (i < frameCount - 1) {
                await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
            }
        }
        // 计算平均FPS
        const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        const fps = 1000 / avgFrameTime;
        return Math.min(120, fps); // 最高120fps
    }
    /**
     * 数据处理性能测试
     */
    async testDataProcessingPerformance() {
        const dataCount = 10000;
        const batchSize = 100;
        const processedItems = [];
        const latencies = [];
        const totalStartTime = perf_hooks_1.performance.now();
        for (let i = 0; i < dataCount; i += batchSize) {
            const batch = [];
            // 生成批量数据
            for (let j = 0; j < batchSize && i + j < dataCount; j++) {
                batch.push({
                    id: i + j,
                    timestamp: Date.now(),
                    data: Math.random() * 1000,
                    processed: false
                });
            }
            // 处理批量数据
            const batchStartTime = perf_hooks_1.performance.now();
            const processed = batch.map(item => ({
                ...item,
                processed: true,
                processedAt: Date.now(),
                result: item.data * 2 + Math.sin(item.data)
            }));
            const batchEndTime = perf_hooks_1.performance.now();
            const batchLatency = batchEndTime - batchStartTime;
            processedItems.push(...processed);
            latencies.push(batchLatency);
            // 模拟异步处理间隔
            if (i % (batchSize * 10) === 0) {
                await new Promise(resolve => setImmediate(resolve));
            }
        }
        const totalEndTime = perf_hooks_1.performance.now();
        const totalDuration = totalEndTime - totalStartTime;
        // 计算指标
        const throughput = (processedItems.length / totalDuration) * 1000; // items/s
        const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        return { throughput, latency: avgLatency };
    }
    /**
     * 模拟渲染工作
     */
    async simulateRenderWork() {
        // 模拟Canvas绘制操作
        let result = 0;
        for (let i = 0; i < 1000; i++) {
            result += Math.sin(i * 0.01) + Math.cos(i * 0.02);
        }
        // 模拟DOM操作延迟
        return new Promise(resolve => {
            setTimeout(resolve, Math.random() * 2);
        });
    }
    /**
     * 获取当前内存使用量
     */
    getCurrentMemoryUsage() {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            return process.memoryUsage().heapUsed / (1024 * 1024); // MB
        }
        if (typeof perf_hooks_1.performance !== 'undefined' && 'memory' in perf_hooks_1.performance) {
            const memory = perf_hooks_1.performance.memory;
            return memory.usedJSHeapSize / (1024 * 1024); // MB
        }
        return 0;
    }
    /**
     * 计算综合评分
     */
    calculateScore(metrics, baseline) {
        let totalScore = 0;
        let weightSum = 0;
        // CPU评分 (权重: 25%)
        if (metrics.cpu > 0) {
            const cpuScore = Math.min(100, (metrics.cpu / baseline.cpu.normal) * 100);
            totalScore += cpuScore * 0.25;
            weightSum += 0.25;
        }
        // 内存评分 (权重: 20%)
        if (metrics.memory > 0) {
            const memoryScore = Math.max(0, 100 - (metrics.memory - baseline.memory.baseline) / baseline.memory.baseline * 100);
            totalScore += memoryScore * 0.20;
            weightSum += 0.20;
        }
        // FPS评分 (权重: 25%)
        if (metrics.fps > 0) {
            const fpsScore = Math.min(100, (metrics.fps / baseline.rendering.targetFPS) * 100);
            totalScore += fpsScore * 0.25;
            weightSum += 0.25;
        }
        // 吞吐量评分 (权重: 20%)
        if (metrics.throughput > 0) {
            const throughputScore = Math.min(100, (metrics.throughput / baseline.dataProcessing.throughput) * 100);
            totalScore += throughputScore * 0.20;
            weightSum += 0.20;
        }
        // 延迟评分 (权重: 10%)
        if (metrics.latency > 0) {
            const latencyScore = Math.max(0, 100 - (metrics.latency - baseline.dataProcessing.latency) / baseline.dataProcessing.latency * 100);
            totalScore += latencyScore * 0.10;
            weightSum += 0.10;
        }
        return weightSum > 0 ? Math.round(totalScore / weightSum) : 0;
    }
    /**
     * 计算等级
     */
    calculateGrade(score) {
        if (score >= 90) {
            return 'A';
        }
        if (score >= 80) {
            return 'B';
        }
        if (score >= 70) {
            return 'C';
        }
        if (score >= 60) {
            return 'D';
        }
        return 'F';
    }
    /**
     * 评估详细指标
     */
    evaluateDetails(metrics, baseline) {
        return {
            cpuPassed: metrics.cpu <= baseline.cpu.threshold.warning,
            memoryPassed: metrics.memory <= baseline.memory.threshold.warning,
            fpsPassed: metrics.fps >= baseline.rendering.threshold.warning,
            throughputPassed: metrics.throughput >= baseline.dataProcessing.throughput * 0.8,
            latencyPassed: metrics.latency <= baseline.dataProcessing.threshold.latencyWarning
        };
    }
    /**
     * 获取基准键
     */
    getBaselineKey() {
        return `serial-studio-${this.currentConfig.serialStudioVersion}-${this.currentConfig.hardwareClass}`;
    }
    /**
     * 获取基准数据
     */
    getBaseline(key) {
        const baselineKey = key || this.getBaselineKey();
        return this.baselines.get(baselineKey) || null;
    }
    /**
     * 获取所有基准数据
     */
    getAllBaselines() {
        return new Map(this.baselines);
    }
    /**
     * 获取测试结果
     */
    getResults(testName) {
        if (testName) {
            return this.results.get(testName) || [];
        }
        const allResults = [];
        for (const results of this.results.values()) {
            allResults.push(...results);
        }
        return allResults.sort((a, b) => b.timestamp - a.timestamp);
    }
    /**
     * 获取最新结果
     */
    getLatestResult(testName) {
        const results = this.results.get(testName);
        return results && results.length > 0 ? results[results.length - 1] : null;
    }
    /**
     * 生成性能报告
     */
    generateReport() {
        const allResults = this.getResults();
        const passedTests = allResults.filter(r => r.passed);
        const failedTests = allResults.filter(r => !r.passed);
        // 计算平均分数
        const avgScore = allResults.length > 0
            ? allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length
            : 0;
        // 生成建议
        const recommendations = [];
        const recentResults = allResults.slice(0, 5); // 最近5次测试
        if (recentResults.some(r => !r.details.cpuPassed)) {
            recommendations.push('CPU使用率过高，建议优化算法或减少计算密集型操作');
        }
        if (recentResults.some(r => !r.details.memoryPassed)) {
            recommendations.push('内存使用超标，建议检查内存泄漏或优化数据结构');
        }
        if (recentResults.some(r => !r.details.fpsPassed)) {
            recommendations.push('帧率低于标准，建议优化渲染流程或启用硬件加速');
        }
        if (recentResults.some(r => !r.details.throughputPassed)) {
            recommendations.push('数据处理吞吐量不足，建议使用批处理或多线程优化');
        }
        if (recentResults.some(r => !r.details.latencyPassed)) {
            recommendations.push('处理延迟过高，建议优化数据流管道或减少同步操作');
        }
        return {
            summary: {
                totalTests: allResults.length,
                passedTests: passedTests.length,
                failedTests: failedTests.length,
                averageScore: Math.round(avgScore),
                currentConfig: this.currentConfig
            },
            baselines: this.getAllBaselines(),
            results: allResults,
            recommendations
        };
    }
    /**
     * 更新配置
     */
    updateConfig(config) {
        this.currentConfig = { ...this.currentConfig, ...config };
        this.emit('configUpdated', this.currentConfig);
    }
    /**
     * 清除结果
     */
    clearResults(testName) {
        if (testName) {
            this.results.delete(testName);
        }
        else {
            this.results.clear();
        }
    }
    /**
     * 销毁管理器
     */
    destroy() {
        this.baselines.clear();
        this.results.clear();
        this.removeAllListeners();
        PerformanceBenchmarkManager.instance = null;
    }
}
exports.PerformanceBenchmarkManager = PerformanceBenchmarkManager;
// 导出单例实例
exports.performanceBenchmarkManager = PerformanceBenchmarkManager.getInstance();
exports.default = PerformanceBenchmarkManager;
//# sourceMappingURL=PerformanceBenchmarks.js.map