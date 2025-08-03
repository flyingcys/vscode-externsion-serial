/**
 * Layout Store for Serial Studio VSCode Extension
 * 布局管理存储
 */
/// <reference types="@/types/vue" />
/**
 * Widget位置信息
 */
export interface WidgetPosition {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex?: number;
}
/**
 * 布局项接口
 */
export interface LayoutItem {
    id: string;
    widgetId: string;
    position: WidgetPosition;
    isVisible: boolean;
    isResizable: boolean;
    isDraggable: boolean;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
}
/**
 * 布局配置接口
 */
export interface LayoutConfig {
    id: string;
    name: string;
    description?: string;
    items: LayoutItem[];
    gridSize: number;
    snapToGrid: boolean;
    showGrid: boolean;
    backgroundColor?: string;
    created: number;
    modified: number;
}
export declare const useLayoutStore: import("pinia").StoreDefinition<"layout", any, any, any>;
export default useLayoutStore;
//# sourceMappingURL=layout.d.ts.map