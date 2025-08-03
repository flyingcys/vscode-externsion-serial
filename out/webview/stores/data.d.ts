/**
 * Data Store for Serial Studio VSCode Extension
 * 基于Serial Studio的数据管理架构
 */
/// <reference types="@/types/vue" />
import type { Dataset, DataPoint } from '../../shared/types';
/**
 * Widget数据接口
 */
export interface WidgetData {
    id: string;
    type: string;
    title: string;
    datasets: Dataset[];
    dataPoints: DataPoint[];
    lastUpdate: number;
    isActive: boolean;
}
export declare const useDataStore: import("pinia").StoreDefinition<"data", any, any, any>;
export default useDataStore;
//# sourceMappingURL=data.d.ts.map