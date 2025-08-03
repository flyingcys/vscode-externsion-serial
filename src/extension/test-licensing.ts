/*
 * Serial Studio VSCode Extension - 许可证系统测试运行器
 * 
 * 模拟VSCode环境运行许可证系统集成测试
 * 验证第25周开发成果
 */

import { LicensingIntegrationTest } from './licensing/LicensingIntegrationTest';

/**
 * 模拟VSCode扩展上下文
 */
class MockExtensionContext {
    public globalState: MockMemento = new MockMemento();
    public workspaceState: MockMemento = new MockMemento();
    public extensionPath: string = '/mock/extension/path';
    public storagePath: string = '/mock/storage/path';
    public globalStoragePath: string = '/mock/global/storage/path';
    public logPath: string = '/mock/log/path';

    public subscriptions: Array<{ dispose(): any }> = [];
}

/**
 * 模拟VSCode Memento（状态存储）
 */
class MockMemento {
    private storage: Map<string, any> = new Map();

    get<T>(key: string, defaultValue?: T): T {
        return this.storage.has(key) ? this.storage.get(key) : defaultValue as T;
    }

    async update(key: string, value: any): Promise<void> {
        this.storage.set(key, value);
    }

    keys(): readonly string[] {
        return Array.from(this.storage.keys());
    }
}

/**
 * 模拟VSCode API
 */
const mockVSCode = {
    window: {
        showInformationMessage: (message: string, ...items: string[]) => {
            console.log(`[INFO] ${message}`);
            return Promise.resolve(items[0]);
        },
        showWarningMessage: (message: string, ...items: string[]) => {
            console.log(`[WARN] ${message}`);
            return Promise.resolve(items[0]);
        },
        showErrorMessage: (message: string, ...items: string[]) => {
            console.log(`[ERROR] ${message}`);
            return Promise.resolve(items[0]);
        },
        showInputBox: (options: any) => {
            console.log(`[INPUT] ${options.prompt || 'Input requested'}`);
            return Promise.resolve('mock-input-value');
        },
        showQuickPick: (items: any[], options?: any) => {
            console.log(`[QUICK_PICK] ${options?.title || 'Quick pick'}: ${items.length} items`);
            return Promise.resolve(items[0]);
        }
    },
    workspace: {
        getConfiguration: () => ({
            get: (key: string, defaultValue?: any) => {
                console.log(`[CONFIG_GET] ${key}`);
                return defaultValue;
            },
            update: (key: string, value: any, target?: any) => {
                console.log(`[CONFIG_SET] ${key} = ${value}`);
                return Promise.resolve();
            }
        }),
        onDidChangeConfiguration: (listener: any) => {
            return { dispose: () => {} };
        }
    },
    commands: {
        executeCommand: (command: string, ...args: any[]) => {
            console.log(`[COMMAND] ${command}`, args);
            return Promise.resolve();
        },
        registerCommand: (command: string, callback: any) => {
            console.log(`[REGISTER_COMMAND] ${command}`);
            return { dispose: () => {} };
        }
    },
    env: {
        openExternal: (uri: any) => {
            console.log(`[OPEN_EXTERNAL] ${uri.toString()}`);
            return Promise.resolve(true);
        }
    },
    Uri: {
        parse: (uriString: string) => ({ toString: () => uriString })
    },
    ConfigurationTarget: {
        Global: 1,
        Workspace: 2,
        WorkspaceFolder: 3
    },
    Disposable: class {
        constructor(private callback: () => void) {}
        dispose() {
            this.callback();
        }
    },
    extensions: {
        getExtension: () => ({ isActive: true })
    }
};

/**
 * 设置模拟环境
 */
function setupMockEnvironment() {
    // 将模拟的VSCode API注入到全局
    (global as any).vscode = mockVSCode;
    
    // 模拟Node.js模块
    if (typeof require !== 'undefined') {
        const Module = require('module');
        const originalRequire = Module.prototype.require;
        
        Module.prototype.require = function(id: string) {
            if (id === 'vscode') {
                return mockVSCode;
            }
            return originalRequire.apply(this, arguments);
        };
    }
}

/**
 * 运行许可证系统集成测试
 */
async function runLicensingTests() {
    console.log('🔧 设置模拟测试环境...');
    setupMockEnvironment();

    console.log('📦 创建模拟扩展上下文...');
    const mockContext = new MockExtensionContext() as any;

    console.log('🧪 开始许可证系统集成测试...');
    const testRunner = new LicensingIntegrationTest(mockContext);

    try {
        const results = await testRunner.runAllTests();
        
        console.log('\n📈 测试结果摘要:');
        let totalTests = 0;
        let totalPassed = 0;
        let overallSuccess = true;

        for (const suite of results) {
            totalTests += suite.totalTests;
            totalPassed += suite.passedTests;
            
            if (suite.failedTests > 0) {
                overallSuccess = false;
            }
        }

        const successRate = (totalPassed / totalTests) * 100;
        
        console.log(`总测试: ${totalTests}`);
        console.log(`通过: ${totalPassed}`);
        console.log(`失败: ${totalTests - totalPassed}`);
        console.log(`成功率: ${successRate.toFixed(1)}%`);
        
        if (overallSuccess) {
            console.log('\n🎉 所有测试通过！第25周许可证管理和配置系统开发完成。');
            return true;
        } else {
            console.log('\n⚠️  部分测试失败，需要进一步调试。');
            return false;
        }
        
    } catch (error) {
        console.error('\n❌ 测试运行失败:', error);
        return false;
    }
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 Serial Studio VSCode Extension - 许可证系统集成测试');
    console.log('================================================');
    
    const success = await runLicensingTests();
    
    if (success) {
        console.log('\n✅ 第25周开发任务完成验证通过！');
        process.exit(0);
    } else {
        console.log('\n❌ 第25周开发任务验证失败！');
        process.exit(1);
    }
}

// 运行测试
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

export { runLicensingTests, MockExtensionContext };