/**
 * Connection Store for Serial Studio VSCode Extension
 * 连接状态管理存储
 */
/// <reference types="@/types/vue" />
import { BusType } from '../../shared/types';
/**
 * 连接状态枚举
 */
export declare enum ConnectionState {
    Disconnected = "disconnected",
    Connecting = "connecting",
    Connected = "connected",
    Reconnecting = "reconnecting",
    Error = "error"
}
/**
 * 设备信息接口
 */
export interface DeviceInfo {
    name: string;
    type: BusType;
    path?: string;
    description?: string;
    isAvailable?: boolean;
    isConnected?: boolean;
    lastSeen?: number;
}
export declare const useConnectionStore: import("pinia").StoreDefinition<"connection", any, any, any>;
export default useConnectionStore;
//# sourceMappingURL=connection.d.ts.map