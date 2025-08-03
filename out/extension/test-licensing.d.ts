/**
 * 模拟VSCode扩展上下文
 */
declare class MockExtensionContext {
    globalState: MockMemento;
    workspaceState: MockMemento;
    extensionPath: string;
    storagePath: string;
    globalStoragePath: string;
    logPath: string;
    subscriptions: Array<{
        dispose(): any;
    }>;
}
/**
 * 模拟VSCode Memento（状态存储）
 */
declare class MockMemento {
    private storage;
    get<T>(key: string, defaultValue?: T): T;
    update(key: string, value: any): Promise<void>;
    keys(): readonly string[];
}
/**
 * 运行许可证系统集成测试
 */
declare function runLicensingTests(): Promise<boolean>;
export { runLicensingTests, MockExtensionContext };
//# sourceMappingURL=test-licensing.d.ts.map